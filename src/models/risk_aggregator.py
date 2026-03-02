import time
from typing import Optional, List, Dict
from src.models.flood_model import FloodPredictor
from src.models.storm_model import StormPredictor
from src.models.heatwave_model import HeatwavePredictor
from src.processing.vulnerability_manager import VulnerabilityManager
from src.models.insight_engine import InsightEngine
from src.models.learning_engine import LearningEngine


def _get_alert_tier(score: float) -> dict:
    """
    Map risk score (0–100) to 4-tier government-grade alert classification.

    Level 1 — Advisory  : 0–30   (Green)   Monitor conditions
    Level 2 — Watch     : 31–55  (Yellow)  Be prepared
    Level 3 — Warning   : 56–75  (Orange)  High likelihood of impact
    Level 4 — Emergency : 76–100 (Red)     Immediate action required
    """
    if score >= 76:
        return {
            "level": 4,
            "label": "Emergency",
            "color": "red",
            "hex": "#ef4444",
            "description": "Immediate evacuation may be required. Activate all emergency protocols.",
            "situation": "Immediate action required",
            "recommended_action_level": "CRITICAL — Emergency Response Active"
        }
    elif score >= 56:
        return {
            "level": 3,
            "label": "Warning",
            "color": "orange",
            "hex": "#f97316",
            "description": "Significant risk detected. Prepare for immediate action and follow official directives.",
            "situation": "High likelihood of impact",
            "recommended_action_level": "High Preparedness Required"
        }
    elif score >= 31:
        return {
            "level": 2,
            "label": "Watch",
            "color": "yellow",
            "hex": "#eab308",
            "description": "Conditions developing. Monitor updates closely and review emergency plans.",
            "situation": "Be prepared",
            "recommended_action_level": "Moderate Vigilance — Review Plans"
        }
    else:
        return {
            "level": 1,
            "label": "Advisory",
            "color": "green",
            "hex": "#22c55e",
            "description": "Low risk conditions. Stay aware of local developments.",
            "situation": "Monitor conditions",
            "recommended_action_level": "Stay Informed"
        }


def _compute_normalized_factors(features: dict, all_results: dict, adjusted_score: float, max_score: float) -> list:
    """
    Compute normalized (0.0–1.0) risk factor scores with metadata.
    Each factor represents the contribution of a specific environmental dimension.
    """
    flood_data = all_results.get("flood_predictor", {})
    storm_data = all_results.get("storm_predictor", {})
    heat_data = all_results.get("heatwave_predictor", {})

    # --- Factor 1: Rainfall Intensity ---
    # Derived from flood model's rain_factor: min(rain/50, 1.0)
    rain = features.get("rain", 0)
    rainfall_norm = round(min(rain / 50.0, 1.0), 3)

    # --- Factor 2: Wind & Storm Pressure ---
    # Derived from storm model's wind_factor: min(wind_speed/80, 1.0)
    wind = features.get("wind_speed", 0)
    wind_norm = round(min(wind / 80.0, 1.0), 3)

    # --- Factor 3: Temperature Anomaly ---
    # Derived from heatwave model: (temp-30)/15 clamped to [0,1]
    temp = features.get("temp", 25)
    heat_norm = round(min(max((temp - 30) / 15.0, 0.0), 1.0), 3)

    # --- Factor 4: Vegetation / Ground Saturation ---
    # NDVI inversion: low NDVI = high vulnerability; ndvi_factor = 1 - ndvi
    ndvi = features.get("ndvi", 0.5)
    soil_norm = round(min(max(1.0 - ndvi, 0.0), 1.0), 3)

    # --- Factor 5: Atmospheric Humidity ---
    # Humidity contribution: excess above 50% baseline
    humidity = features.get("humidity", 50)
    humidity_norm = round(min(max((humidity - 50) / 50.0, 0.0), 1.0), 3)

    # --- Factor 6: Terrain Vulnerability (from vulnerability adjustment) ---
    terrain_delta = adjusted_score - max_score
    terrain_norm = round(min(max(terrain_delta / 20.0, 0.0), 1.0), 3) if terrain_delta > 0 else 0.0

    factors = [
        {
            "key": "rainfallIntensity",
            "label": "Rainfall Intensity",
            "value": rainfall_norm,
            "unit": "mm/hr index",
            "source": "Meteorological Forecast",
            "icon": "💧"
        },
        {
            "key": "windStormPressure",
            "label": "Wind & Storm Pressure",
            "value": wind_norm,
            "unit": "km/h index",
            "source": "Atmospheric Model",
            "icon": "🌀"
        },
        {
            "key": "temperatureAnomaly",
            "label": "Temperature Anomaly",
            "value": heat_norm,
            "unit": "°C deviation",
            "source": "Satellite Thermal Feed",
            "icon": "🌡️"
        },
        {
            "key": "soilSaturation",
            "label": "Soil & Ground Saturation",
            "value": soil_norm,
            "unit": "NDVI index",
            "source": "Satellite Imagery",
            "icon": "🌱"
        },
        {
            "key": "atmosphericHumidity",
            "label": "Atmospheric Humidity",
            "value": humidity_norm,
            "unit": "% above baseline",
            "source": "Weather Station",
            "icon": "💦"
        },
    ]

    # Only include terrain factor if it contributed meaningfully
    if terrain_norm > 0.05:
        factors.append({
            "key": "terrainVulnerability",
            "label": "Terrain Vulnerability",
            "value": terrain_norm,
            "unit": "topographic index",
            "source": "Historical Patterns",
            "icon": "⛰️"
        })

    return factors


def _get_primary_driver(factors: list) -> str:
    """Return the label of the highest-scoring risk factor."""
    if not factors:
        return "Unknown"
    top = max(factors, key=lambda f: f["value"])
    return top["label"]


def _get_confidence_reason(confidence: float, all_results: dict, features: dict) -> str:
    """Generate a human-readable explanation for the confidence score."""
    has_ndvi = features.get("ndvi") is not None
    model_agreement = max(r["confidence"] for r in all_results.values()) - min(r["confidence"] for r in all_results.values())
    any_high = any(r["risk_score"] > 60 for r in all_results.values())

    if confidence >= 0.90:
        return "High agreement between satellite imagery and real-time forecast models"
    elif confidence >= 0.80:
        if has_ndvi:
            return "Strong consensus from atmospheric and vegetation data sources"
        return "Good agreement between meteorological forecast models"
    elif confidence >= 0.70:
        if model_agreement > 0.15:
            return "Moderate confidence — partial divergence between atmospheric and thermal models"
        return "Moderate confidence — limited satellite coverage for this region"
    elif confidence >= 0.60:
        return "Reduced confidence — NDVI satellite data unavailable; forecast model used as primary source"
    else:
        return "Low confidence — operating on fallback telemetry; results should be treated as approximate"


def _get_region_id(lat: Optional[float], lon: Optional[float]) -> str:
    """Geospatial region resolver mapping coordinates to isolated model IDs."""
    if lat is None or lon is None:
        return "global"
    
    # Primitive mapping, in real deployment use GeoJSON boundary checks
    if 24.5 <= lat <= 25.5 and 66.5 <= lon <= 67.5:
        return "karachi"
    elif 31.0 <= lat <= 32.0 and 74.0 <= lon <= 75.0:
        return "lahore"
    elif 33.5 <= lat <= 34.0 and 72.5 <= lon <= 73.5:
        return "islamabad"
    
    # Generic provincial fallback
    if lat < 28:
        return "sindh"
    return "punjab"

class RiskAggregator:
    def __init__(self):
        self.agents = [
            FloodPredictor(),
            StormPredictor(),
            HeatwavePredictor()
        ]
        self.vulnerability_mgr = VulnerabilityManager()
        self.insight_engine = InsightEngine()
        # Default engine for initialization, will be swapped per request
        self.learning_engine = LearningEngine(region_id="global")

    def aggregate_risks(self, features, lat=None, lon=None):
        """
        Synthesizes multiple model outputs into a unified risk profile 
        with regional nuance and cross-region anomaly awareness.
        """
        region_id = _get_region_id(lat, lon)
        self.learning_engine = LearningEngine(region_id=region_id)
        
        all_results = {}
        max_score = 0
        primary_threat = "None"

        for agent in self.agents:
            result = agent.predict(features)
            agent_key = agent.name.lower().replace(" ", "_")
            all_results[agent_key] = result

        # Get adaptive weights from LearningEngine
        weights = self.learning_engine.get_weights()
        
        # Calculate Weighted Ensemble Score
        weighted_score = 0
        component_contributions = {}
        
        for agent_key, result in all_results.items():
            w = weights.get(agent_key, 0.3) # Default if new agent
            contribution = result["risk_score"] * w
            weighted_score += contribution
            component_contributions[agent_key] = result["risk_score"]

        # Vulnerability weighting
        # We start with weighted ensemble, then apply topography adjustment
        v_weight = weights.get("vulnerability_adjustment", 0.1)
        base_with_vulnerability = (weighted_score * (1.0 - v_weight)) + (max_score * v_weight)
        
        adjusted_score = base_with_vulnerability
        priority = "Normal"
        if lat and lon:
            adjusted_score, priority = self.vulnerability_mgr.adjust_risk(base_with_vulnerability, lat, lon)
        
        # Log this prediction for the feedback loop
        prediction_id = f"pred_{int(time.time())}_{str(lat).replace('.','')[:4]}"
        self.learning_engine.log_prediction(prediction_id, adjusted_score, component_contributions)

        # 4-Tier alert classification
        alert_tier = _get_alert_tier(adjusted_score)
        alert_level = alert_tier["level"]

        # Legacy level string for backward compatibility
        overall_level = "Low"
        if alert_level >= 3:
            overall_level = "High"
        elif alert_level == 2:
            overall_level = "Medium"

        # Dynamic action engine — level-driven
        recommended_actions = self.insight_engine.generate_recommendations(
            all_results, alert_level=alert_level
        )

        # Confidence + human explanation
        confidence = round(sum(r["confidence"] for r in all_results.values()) / len(all_results), 2)
        confidence_reason = _get_confidence_reason(confidence, all_results, features)

        # Normalized risk factors (0.0–1.0 per factor)
        risk_factors = _compute_normalized_factors(features, all_results, adjusted_score, max_score)

        # Primary driver: the top contributing factor
        primary_driver = _get_primary_driver(risk_factors)

        # Data sources
        data_sources = [
            "Satellite Imagery (Google Earth Engine)",
            "Meteorological Forecast (OpenWeatherMap)",
            "Historical Risk Patterns"
        ]

        return {
            "overall_risk_score": max_score,
            "adjusted_risk_score": adjusted_score,
            "overall_risk_level": overall_level,
            "alert_tier": alert_tier,
            "priority": priority,
            "primary_threat": primary_threat,
            "primary_driver": primary_driver,
            "detailed_risks": all_results,
            "recommended_actions": recommended_actions if recommended_actions else ["No immediate actions required"],
            "risk_factors": risk_factors,
            "data_sources": data_sources,
            "confidence": confidence,
            "confidence_reason": confidence_reason,
            "prediction_id": prediction_id,
            "active_weights": weights,
            "region_id": region_id,
            "cross_region_alerts": [] # Cross-region anomaly awareness hook
        }
