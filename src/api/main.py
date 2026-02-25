import os
import logging
from fastapi import FastAPI, Query, HTTPException, APIRouter, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config.config import Config
from src.ingestion.weather_service import WeatherService
from src.ingestion.satellite_service import SatelliteService
from src.processing.feature_engineer import FeatureEngineer
from src.models.risk_aggregator import RiskAggregator
from src.utils.shelter_service import ShelterService
from src.utils.auth_utils import verify_google_token
from dotenv import load_dotenv

load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SentinelAPI")

app = FastAPI(title="Sentinel Early Warning API")

# Router setup
api_router = APIRouter(prefix="/api")

# Step 2: Add CORS (Production Requirement)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific domain in live prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api_router.post("/auth/verify")
async def verify_auth(payload: dict = Body(...)):
    """
    Verifies Google OAuth token and returns user info.
    """
    token = payload.get("credential")
    if not token:
        raise HTTPException(status_code=400, detail="Missing credential")
    
    user_info = verify_google_token(token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
    # In a real app, you might sync with DB here
    # For now, we return user info with default plan
    user_info["plan"] = "free"
    return {"status": "success", "user": user_info}

@api_router.get("/risk-response")
async def get_risk_response(
    lat: float = Query(Config.DEFAULT_LAT), 
    lon: float = Query(Config.DEFAULT_LON)
):
    """
    Unified endpoint for the Sentinel frontend.
    Returns structured risk, actions, and shelters.
    """
    logger.info(f"Incoming Risk Analysis Request: Lat={lat}, Lon={lon}")
    
    try:
        weather_svc = WeatherService()
        satellite_svc = SatelliteService()
        feature_eng = FeatureEngineer()
        aggregator = RiskAggregator()
        shelter_svc = ShelterService()

        # 1. Trigger Ingestion
        weather = weather_svc.get_current_weather(lat, lon)
        if not weather:
             logger.warning(f"Incomplete Ingestion: Weather API failed for {lat}, {lon}. Deploying fallback telemetry.")
             weather = {
                 "temp": 28.5,
                 "humidity": 62,
                 "rain": 0.0,
                 "wind_speed": 4.2,
                 "timestamp": 0 # Fallback indicator
             }

        # Use a default 0.5 NDVI if GEE is not authenticated yet for demo purposes
        ndvi = satellite_svc.get_ndvi(lat, lon)
        satellite_data = {"ndvi": ndvi if ndvi is not None else 0.5, "water_coverage": 0.0}

        # 2. Risk Assessment & Multi-Agent Reasoning
        features = feature_eng.extract_features(weather, satellite_data)
        results = aggregator.aggregate_risks(features, lat, lon)

        # 3. Geospatial Shelter Logic
        shelters = shelter_svc.get_nearest_shelters(lat, lon)

        # 4. Final Response Schema
        return {
            "status": "success",
            "risk": {
                "score": results["overall_risk_score"],
                "adjusted_score": results["adjusted_risk_score"],
                "level": results["overall_risk_level"],
                "confidence": results["confidence"]
            },
            "priority": results["priority"],
            "primary_threat": results["primary_threat"],
            "actions": results["recommended_actions"],
            "shelters": shelters,
            "metadata": {
                "location": {"lat": lat, "lon": lon},
                "timestamp": weather.get("timestamp")
            }
        }
    except Exception as e:
        logger.error(f"Critical Backend Failure: {str(e)}")
        return JSONResponse(status_code=500, content={"status": "error", "message": "Internal Intelligence Engine Failure"})

# Register router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=port, reload=True)
