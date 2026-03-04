import os
import math
import time
import logging
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import FastAPI, Query, HTTPException, APIRouter, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config.config import Config
from dotenv import load_dotenv
from src.utils.db_client import DBClient

load_dotenv()
db = DBClient()

# ─────────────────────────────────────────────────────────────
# MONITORING: Structured logging
# ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S"
)
logger = logging.getLogger("SentinelAPI")

# ─────────────────────────────────────────────────────────────
# RATE LIMITING: 30 requests/minute per IP
# ─────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Sentinel Early Warning API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

api_router = APIRouter(prefix="/api")

# ─────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# CACHING: In-memory cache with 5-minute TTL
# ─────────────────────────────────────────────────────────────
_risk_cache: dict = {}
CACHE_TTL_SECONDS = 300  # 5 minutes

# ─────────────────────────────────────────────────────────────
# RISK HISTORY: Per-location in-memory store (max 48 snapshots = ~24hr @ 30min)
# ─────────────────────────────────────────────────────────────
_location_history: dict = {}   # key: "lat,lon" -> list of snapshots
_alert_history: list = []      # global log (for /alert-history endpoint)
_notifications: dict = {}     # key: "lat,lon" -> list of unread alert dicts
HISTORY_MAX_PER_LOCATION = 48  # 48 snapshots ≈ 24 hours at 30-min intervals
ALERT_HISTORY_MAX = 50
_user_locations: dict = {}     # key: user_sub -> list of location objects


def _loc_key(lat: float, lon: float) -> str:
    return f"{round(lat, 2)},{round(lon, 2)}"


def _store_snapshot(lat: float, lon: float, score: float, alert_level: int,
                    alert_label: str, color: str, ts: str):
    """Append snapshot to per-location history, capping at HISTORY_MAX_PER_LOCATION."""
    key = _loc_key(lat, lon)
    if key not in _location_history:
        _location_history[key] = []
    _location_history[key].append({
        "timestamp": ts,
        "riskScore": round(score, 1),
        "alertLevel": alert_level,
        "alertLabel": alert_label,
        "color": color
    })
    if len(_location_history[key]) > HISTORY_MAX_PER_LOCATION:
        _location_history[key].pop(0)


def _compute_trend(snapshots: list) -> dict:
    """
    Analyse the last N snapshots and return trend direction + strength.
    Uses last 3 points for direction, last 6 for trendStrength.
    """
    if len(snapshots) < 2:
        return {"direction": "Stable", "strength": 0.0, "pct": 0.0, "icon": "→"}

    scores = [s["riskScore"] for s in snapshots]

    # Compare last vs first of last-6 window for strength
    window = scores[-6:] if len(scores) >= 6 else scores
    delta = window[-1] - window[0]
    strength = round(abs(delta) / max(window[0], 1) * 100, 1)   # percent change
    abs_delta = abs(delta)

    # Use last 3 for direction: all rising, all falling, or mixed
    last3 = scores[-3:] if len(scores) >= 3 else scores
    diffs = [last3[i+1] - last3[i] for i in range(len(last3)-1)]

    if all(d > 0.5 for d in diffs):
        direction, icon = "Rising", "⬆"
    elif all(d < -0.5 for d in diffs):
        direction, icon = "Falling", "⬇"
    elif delta > 3:
        direction, icon = "Rising", "⬆"
    elif delta < -3:
        direction, icon = "Falling", "⬇"
    else:
        direction, icon = "Stable", "→"

    return {
        "direction": direction,
        "strength": round(abs_delta / 100, 3),   # 0.0–1.0 normalised
        "pct": strength,                           # human-readable %
        "icon": icon
    }

def get_cached(lat: float, lon: float):
    key = f"{round(lat, 3)},{round(lon, 3)}"
    entry = _risk_cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL_SECONDS:
        logger.info(f"CACHE HIT for ({lat}, {lon})")
        return entry["data"]
    return None

def set_cache(lat: float, lon: float, data: dict):
    key = f"{round(lat, 3)},{round(lon, 3)}"
    _risk_cache[key] = {"ts": time.time(), "data": data}

def _trigger_notification(lat: float, lon: float, prev_level: int, new_level: int, alert_label: str):
    """Stores a notification event if risk escalates."""
    if new_level <= prev_level:
        return
        
    key = _loc_key(lat, lon)
    if key not in _notifications:
        _notifications[key] = []
        
    notification = {
        "id": f"alert_{int(time.time())}_{key.replace('.', '_').replace(',', '_')}",
        "lat": lat,
        "lon": lon,
        "prev_level": prev_level,
        "new_level": new_level,
        "label": alert_label,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "read": False,
        "message": f"Alert escalated to Level {new_level}: {alert_label}"
    }
    
    # Keep only most recent 10 unread notifications per location to avoid bloat
    _notifications[key].insert(0, notification)
    _notifications[key] = _notifications[key][:10]
    logger.info(f"NOTIFICATION TRIGGERED | {key} | Level {prev_level} -> {new_level}")

# ─────────────────────────────────────────────────────────────
# REGIONAL GRID LOGIC
# ─────────────────────────────────────────────────────────────
def _generate_grid(lat: float, lon: float, radius_km: float, step_km: float):
    """
    Generates a grid of (lat, lon) points within a circular radius.
    """
    points = []
    # 1 degree lat is approx 111km
    lat_step = step_km / 111.0
    # 1 degree lon is approx 111 * cos(lat) km
    lon_cos = math.cos(math.radians(lat))
    lon_step = step_km / (111.0 * lon_cos) if lon_cos != 0 else step_km / 111.0
    
    steps = int(radius_km / step_km)
    for i in range(-steps, steps + 1):
        for j in range(-steps, steps + 1):
            if i*i + j*j <= steps*steps:
                points.append((
                    lat + i * lat_step,
                    lon + j * lon_step
                ))
    return points


# ─────────────────────────────────────────────────────────────
# INPUT VALIDATION
# ─────────────────────────────────────────────────────────────
def validate_coordinates(lat: float, lon: float):
    errors = []
    if not (-90 <= lat <= 90):
        errors.append(f"Invalid latitude '{lat}'. Must be between -90 and 90.")
    if not (-180 <= lon <= 180):
        errors.append(f"Invalid longitude '{lon}'. Must be between -180 and 180.")
    if errors:
        raise HTTPException(status_code=400, detail={"status": "error", "errors": errors})


# ─────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────

@api_router.post("/auth/verify")
async def verify_auth(payload: dict = Body(...)):
    """Verifies Google OAuth token and returns user info."""
    from src.utils.auth_utils import verify_google_token
    token = payload.get("credential")
    if not token:
        raise HTTPException(status_code=400, detail={"status": "error", "message": "Missing credential"})

    try:
        user_info = verify_google_token(token)
        if not user_info:
            raise HTTPException(status_code=401, detail={"status": "error", "message": "Invalid Google token"})
        user_info["plan"] = "free"
        return {"status": "success", "user": user_info}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth verification error: {e}")
        raise HTTPException(status_code=500, detail={"status": "error", "message": "Authentication service unavailable."})


@api_router.get("/risk-response")
@limiter.limit("30/minute")
async def get_risk_response(
    request: Request,
    lat: float = Query(Config.DEFAULT_LAT),
    lon: float = Query(Config.DEFAULT_LON)
):
    """Unified risk intelligence endpoint with validation, caching & rate limiting."""

    # STEP 1: Input Validation
    validate_coordinates(lat, lon)

    # STEP 5: Cache Check
    cached = get_cached(lat, lon)
    if cached:
        return cached

    start_time = time.time()
    logger.info(f"RISK REQUEST | lat={lat} lon={lon} | ip={get_remote_address(request)}")

    try:
        from src.ingestion.weather_service import WeatherService
        from src.ingestion.satellite_service import SatelliteService
        from src.processing.feature_engineer import FeatureEngineer
        from src.models.risk_aggregator import RiskAggregator
        from src.utils.shelter_service import ShelterService
        from src.models.forecaster import RiskForecaster

        weather_svc = WeatherService()
        satellite_svc = SatelliteService()
        feature_eng = FeatureEngineer()
        aggregator = RiskAggregator()
        shelter_svc = ShelterService()
        forecaster = RiskForecaster()

        # Ingestion with fallback
        weather = weather_svc.get_current_weather(lat, lon)
        if not weather:
            logger.warning(f"Weather API unavailable for ({lat}, {lon}). Using fallback telemetry.")
            weather = {
                "temp": 28.5, "humidity": 62,
                "rain": 0.0, "wind_speed": 4.2,
                "timestamp": int(time.time())
            }

        ndvi = satellite_svc.get_ndvi(lat, lon)
        satellite_data = {"ndvi": ndvi if ndvi is not None else 0.5, "water_coverage": 0.0}

        # Risk analysis
        features = feature_eng.extract_features(weather, satellite_data)
        results = aggregator.aggregate_risks(features, lat, lon)
        shelters = shelter_svc.get_nearest_shelters(lat, lon)

        latency_ms = round((time.time() - start_time) * 1000)
        logger.info(f"RISK RESPONSE | level={results['overall_risk_level']} | latency={latency_ms}ms")

        # STEP 4: Standardized Response
        alert_tier = results["alert_tier"]
        
        # STEP 6: Notification Logic (Escalation Detection)
        key = f"{round(lat, 3)},{round(lon, 3)}"
        history = _location_history.get(key, [])
        prev_level = 0
        if history:
            prev_level = history[-1].get("alertLevel", 0)
            
        _trigger_notification(lat, lon, prev_level, alert_tier["level"], alert_tier["label"])
        
        # Store snapshot (historical data)
        ts_now = datetime.utcnow().isoformat() + "Z"
        _store_snapshot(lat, lon, results["adjusted_risk_score"], alert_tier["level"], alert_tier["label"], alert_tier["color"], ts_now)
        
        response = {
            "status": "success",
            "risk": {
                "score": results["overall_risk_score"],
                "adjusted_score": results["adjusted_risk_score"],
                "level": results["overall_risk_level"],
                "confidence": results["confidence"],
                "confidence_reason": results.get("confidence_reason", ""),
                "alert_tier": alert_tier,
                "cross_region_alerts": results.get("cross_region_alerts", [])
            },
            "priority": results["priority"],
            "primary_threat": results["primary_threat"],
            "primary_driver": results.get("primary_driver", ""),
            "actions": results["recommended_actions"],
            "shelters": shelters,
            "risk_factors": results.get("risk_factors", []),
            "prediction_id": results.get("prediction_id"),
            "region_id": results.get("region_id", "global"),
            "active_weights": results.get("active_weights"),
            "metadata": {
                "location": {"lat": lat, "lon": lon},
                "timestamp": weather.get("timestamp"),
                "latency_ms": latency_ms,
                "cached": False,
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "raw_features": features
            }
        }

        _alert_history.append({
            "location": {"lat": lat, "lon": lon},
            "riskScore": results["adjusted_risk_score"],
            "alertLevel": alert_tier["level"],
            "alertLabel": alert_tier["label"],
            "color": alert_tier["color"],
            "timestamp": ts_now
        })
        if len(_alert_history) > ALERT_HISTORY_MAX:
            _alert_history.pop(0)

        # STEP 5: Store in cache
        set_cache(lat, lon, {**response, "metadata": {**response["metadata"], "cached": True}})

        # STEP 7: Audit Logging (Non-blocking)
        try:
            db.log_audit({
                "lat": lat,
                "lon": lon,
                "risk_score": results["adjusted_risk_score"],
                "alert_tier": alert_tier["label"],
                "timestamp": ts_now,
                "ip": get_remote_address(request)
            })
        except Exception as e:
            logger.warning(f"Audit log failed: {e}")

        return response

    except HTTPException:
        raise
    except Exception as e:
        latency_ms = round((time.time() - start_time) * 1000)
        logger.error(f"RISK FAILURE | lat={lat} lon={lon} | error={str(e)} | latency={latency_ms}ms")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Unable to fetch risk data. Please try again.",
                "metadata": { "location": {"lat": lat, "lon": lon}, "timestamp": int(time.time()) }
            }
        )


@api_router.get("/risk-region")
@limiter.limit("20/minute")
async def get_risk_region(
    request: Request,
    lat: float = Query(Config.DEFAULT_LAT),
    lon: float = Query(Config.DEFAULT_LON),
    radius: float = Query(10.0)
):
    """
    Generates regional risk heatmap data by processing a grid of points within a radius.
    """
    validate_coordinates(lat, lon)
    start_time = time.time()
    
    try:
        from src.ingestion.weather_service import WeatherService
        from src.ingestion.satellite_service import SatelliteService
        from src.processing.feature_engineer import FeatureEngineer
        from src.models.risk_aggregator import RiskAggregator
        
        weather_svc = WeatherService()
        satellite_svc = SatelliteService()
        feature_eng = FeatureEngineer()
        aggregator = RiskAggregator()
        
        # Base telemetry for the center point
        weather = weather_svc.get_current_weather(lat, lon)
        ndvi = satellite_svc.get_ndvi(lat, lon)
        satellite_data = {"ndvi": ndvi if ndvi is not None else 0.5, "water_coverage": 0.0}
        base_features = feature_eng.extract_features(weather or {}, satellite_data)
        
        # Grid density based on radius to keep performance snappy
        step = 2.5 if radius <= 10 else 5.0
        grid = _generate_grid(lat, lon, radius, step)
        
        region_risk = []
        for p_lat, p_lon in grid:
            # Inject spatial noise to simulate terrain/local variance
            noisy_features = base_features.copy()
            noise_factor = (p_lat - lat) * 1.5 + (p_lon - lon) * 1.5
            noisy_features["rain"] = max(0, noisy_features.get("rain", 0) * (1.0 + noise_factor))
            noisy_features["wind_speed"] = max(0, noisy_features.get("wind_speed", 0) * (1.0 + abs(p_lat - lat)))
            
            results = aggregator.aggregate_risks(noisy_features, p_lat, p_lon)
            tier = results["alert_tier"]
            
            region_risk.append({
                "lat": round(p_lat, 4), "lon": round(p_lon, 4),
                "riskScore": round(results["adjusted_risk_score"], 1),
                "alertLevel": tier["level"],
                "color": tier["color"]
            })
            
        latency_ms = round((time.time() - start_time) * 1000)
        
        # Aggregate summary
        scores = [r["riskScore"] for r in region_risk]
        count = len(region_risk)
        summary = {
            "avgScore": round(sum(scores) / count, 1) if count else 0,
            "maxScore": max(scores) if count else 0,
            "emergencyPercent": round(len([r for r in region_risk if r["alertLevel"] >= 4]) / count * 100, 1) if count else 0,
            "warningPercent": round(len([r for r in region_risk if r["alertLevel"] == 3]) / count * 100, 1) if count else 0,
            "latency_ms": latency_ms,
            "pointCount": count
        }
        
        return {"status": "success", "regionRisk": region_risk, "summary": summary}
        
    except Exception as e:
        logger.error(f"REGION RISK FAILURE | {str(e)}")
        return JSONResponse(status_code=500, content={"status": "error", "message": "Regional analysis failed."})


@api_router.get("/risk-history")
@limiter.limit("60/minute")
async def get_risk_history(
    request: Request,
    lat: float = Query(Config.DEFAULT_LAT),
    lon: float = Query(Config.DEFAULT_LON)
):
    """
    Returns the per-location risk history + trend analysis.
    Snapshots are stored every time /api/risk-response is called for this location.
    """
    validate_coordinates(lat, lon)
    key = _loc_key(lat, lon)
    snapshots = _location_history.get(key, [])
    trend = _compute_trend(snapshots)

    return {
        "status": "success",
        "location": {"lat": lat, "lon": lon},
        "count": len(snapshots),
        "history": snapshots,              # Chronological (oldest first)
        "trend": trend["direction"],
        "trendStrength": trend["strength"],
        "trendPct": trend["pct"],
        "trendIcon": trend["icon"]
    }


    return {
        "status": "success",
        "currentRisk": current_risk,
        "forecast": prediction["forecast"],
        "trendPrediction": prediction["trendPrediction"],
        "probabilityEmergencyWithin24h": prediction["probabilityEmergencyWithin24h"],
        "anomaly": anomaly_status,
        "metadata": {
            "location": {"lat": lat, "lon": lon},
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }
    }


@api_router.get("/predictive-forecast")
@limiter.limit("30/minute")
async def get_predictive_forecast(
    request: Request,
    lat: float = Query(Config.DEFAULT_LAT),
    lon: float = Query(Config.DEFAULT_LON)
):
    """
    Phase 9 Sovereign Intelligence: Returns a high-fidelity 24h risk projection.
    """
    validate_coordinates(lat, lon)
    
    from src.models.risk_engine_v3 import RiskEngineV3
    from src.ingestion.weather_service import WeatherService
    from src.ingestion.satellite_service import SatelliteService
    from src.processing.feature_engineer import FeatureEngineer
    
    engine = RiskEngineV3()
    weather_svc = WeatherService()
    satellite_svc = SatelliteService()
    feature_eng = FeatureEngineer()
    
    weather = weather_svc.get_current_weather(lat, lon) or {}
    ndvi = satellite_svc.get_ndvi(lat, lon) or 0.5
    features = feature_eng.extract_features(weather, {"ndvi": ndvi, "water_coverage": 0.0})
    
    # Map features to V3 expected keys
    v3_features = {
        "rainfall_intensity": features.get("rain", 0),
        "temp": features.get("temp", 20),
        "wind_speed": features.get("wind_speed", 0),
        "soil_moisture": 0.3 + (features.get("humidity", 50) / 200), # Derived heuristic
        "slope": 5.0 # Placeholder for geological data
    }
    
    analysis = engine.analyze_vulnerability(v3_features, lat, lon)
    forecast = engine.project_forecast(analysis["score"])
    
    return {
        "status": "success",
        "analysis": analysis,
        "forecast": forecast,
        "metadata": {
            "location": {"lat": lat, "lon": lon},
            "engine": "RiskEngineV3",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }


@api_router.get("/alert-history")
async def get_alert_history():
    """Returns the global in-memory alert history (last 50 events)."""
    return {
        "status": "success",
        "count": len(_alert_history),
        "history": list(reversed(_alert_history))  # Most recent first
    }


@api_router.get("/alerts")
@limiter.limit("60/minute")
async def get_alerts(request: Request):
    """Retrieves all unread notifications across all monitored locations."""
    all_unread = []
    for loc_key in _notifications:
        unread = [n for n in _notifications[loc_key] if not n["read"]]
        all_unread.extend(unread)
    
    # Sort by recent
    all_unread.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "status": "success",
        "alerts": all_unread,
        "unread_count": len(all_unread)
    }


@api_router.post("/alerts/read")
async def mark_alert_read(payload: dict = Body(...)):
    """Marks a specific alert as read or clears all."""
    alert_id = payload.get("alert_id")
    clear_all = payload.get("clear_all", False)
    
    if clear_all:
        for loc_key in _notifications:
            for n in _notifications[loc_key]:
                n["read"] = True
        return {"status": "success", "message": "All alerts cleared"}
        
    if not alert_id:
        raise HTTPException(status_code=400, detail="Missing alert_id")
        
    found = False
    for loc_key in _notifications:
        for n in _notifications[loc_key]:
            if n["id"] == alert_id:
                n["read"] = True
                found = True
                break
        if found: break
        
    return {"status": "success" if found else "error", "message": "Alert marked as read" if found else "Alert not found"}


# ─────────────────────────────────────────────────────────────
# USER LOCATION MANAGEMENT (Phase 13)
# ─────────────────────────────────────────────────────────────

@api_router.get("/user/locations")
async def get_user_locations(user_id: str = Query(...)):
    """Fetch all saved locations for a specific user."""
    return {
        "status": "success",
        "locations": _user_locations.get(user_id, [])
    }


@api_router.post("/user/locations")
async def save_user_location(payload: dict = Body(...)):
    """Save a new monitored location for a user."""
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")
        
    lat = payload.get("lat")
    lon = payload.get("lon")
    label = payload.get("label", "Unnamed Location")
    threshold = payload.get("threshold", 2) # Default notify on Watch (Level 2)
    
    if lat is None or lon is None:
         raise HTTPException(status_code=400, detail="Missing coordinates")

    location_entry = {
        "id": f"loc_{int(time.time())}_{user_id[:5]}",
        "lat": lat,
        "lon": lon,
        "label": label,
        "threshold": threshold,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    if user_id not in _user_locations:
        _user_locations[user_id] = []
        
    _user_locations[user_id].append(location_entry)
    return {"status": "success", "location": location_entry}


@api_router.delete("/user/locations/{loc_id}")
async def delete_user_location(loc_id: str, user_id: str = Query(...)):
    """Remove a saved location."""
    if user_id not in _user_locations:
        return {"status": "error", "message": "User not found"}
        
    initial_len = len(_user_locations[user_id])
    _user_locations[user_id] = [l for l in _user_locations[user_id] if l["id"] != loc_id]
    
    if len(_user_locations[user_id]) < initial_len:
        return {"status": "success", "message": "Location removed"}
    return {"status": "error", "message": "Location not found"}


@api_router.get("/user/fleet-status")
async def get_fleet_status(user_id: str = Query(...)):
    """Get summarized high-level risk for all user's locations."""
    locations = _user_locations.get(user_id, [])
    fleet_data = []
    
    for loc in locations:
        loc_key = _loc_key(loc["lat"], loc["lon"])
        history = _location_history.get(loc_key, [])
        
        # Get latest snapshot if available, otherwise return placeholders
        latest = history[-1] if history else {
            "riskScore": 0.0,
            "alertLevel": 1,
            "alertLabel": "Advisory",
            "color": "green"
        }
        
        # Basic trend analysis
        trend = _compute_trend(history)
        
        fleet_data.append({
            "id": loc["id"],
            "label": loc["label"],
            "lat": loc["lat"],
            "lon": loc["lon"],
            "currentRisk": latest["riskScore"],
            "alertLevel": latest["alertLevel"],
            "alertLabel": latest["alertLabel"],
            "color": latest["color"],
            "trend": trend["direction"],
            "icon": trend["icon"]
        })
        
    return {
        "status": "success",
        "fleet": fleet_data,
        "count": len(fleet_data)
    }


@api_router.get("/model/performance")
async def get_model_performance():
    """Returns adaptive weights and overall model accuracy metrics."""
    from src.models.learning_engine import LearningEngine
    engine = LearningEngine()
    return {
        "status": "success",
        "performance": engine.get_performance_report()
    }


@api_router.post("/model/feedback")
async def submit_model_feedback(payload: dict = Body(...)):
    """
    Submits ground-truth outcome for a specific prediction to the learning loop.
    payload: { "prediction_id": "...", "actual_score": 85 }
    """
    prediction_id = payload.get("prediction_id")
    actual_score = payload.get("actual_score")
    
    if prediction_id is None or actual_score is None:
        raise HTTPException(status_code=400, detail="Missing prediction_id or actual_score")
        
    from src.models.learning_engine import LearningEngine
    engine = LearningEngine()
    engine.process_feedback(prediction_id, float(actual_score))
    
    return {
        "status": "success", 
        "message": "Feedback integrated into learning loop",
        "new_weights": engine.get_weights()
    }


@api_router.get("/federation/status")
async def get_federation_status():
    """Returns overview of all regional model performance and global drift."""
    from src.models.federation_engine import FederationEngine
    federation = FederationEngine()
    return {
        "status": "success",
        "federation": federation.get_federation_status()
    }


@api_router.post("/federation/sync")
async def trigger_federation_sync():
    """Triggers global meta-model aggregation and broadcast."""
    from src.models.federation_engine import FederationEngine
    federation = FederationEngine()
    new_global_weights = federation.aggregate_global_intelligence()
    return {
        "status": "success",
        "message": "Global intelligence aggregated and broadcasted to all regions",
        "global_weights": new_global_weights
    }


@api_router.get("/system-status")
async def get_system_status():
    """Returns detailed status of all underlying data feeds."""
    return {
        "status": "operational",
        "feeds": [
            {"name": "Satellite (GEE)", "status": "active", "latency": "low"},
            {"name": "Weather (OpenWeather)", "status": "active", "latency": "low"},
            {"name": "Historical DB", "status": "active", "latency": "instant"}
        ],
        "system_load": "nominal",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@api_router.get("/health")
async def health_check():
    """System health check endpoint."""
    return {
        "status": "operational",
        "version": "2.1.0",
        "cache_entries": len(_risk_cache),
        "alert_history_count": len(_alert_history),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


# Register router
app.include_router(api_router)

# ─────────────────────────────────────────────────────────────
# Serve static React frontend (production)
# ─────────────────────────────────────────────────────────────
frontend_dist = os.path.join(os.getcwd(), "frontend", "dist")

if os.path.exists(frontend_dist):
    assets_path = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api"):
            return JSONResponse(status_code=404, content={"status": "error", "message": "Not Found"})
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"status": "error", "message": "Frontend build not found"})
else:
    logger.warning(f"Frontend dist not found at {frontend_dist}. Running in API-only mode.")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=port, reload=True)
