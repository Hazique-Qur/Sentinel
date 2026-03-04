import random
from typing import List, Dict

class GlobalIntelligenceHub:
    """
    Phase 10 Planetary Surveillance: Hotspot Clustering Engine
    Aggregates global threat data for planetary visualization.
    """
    
    def get_global_hotspots(self) -> List[Dict]:
        """
        Returns a high-fidelity list of active global risk hotspots.
        In a real deployment, this would query a global spatial index.
        """
        # Hardcoded significant geopolitical/meteorological centers for Phase 10 launch
        hotspots = [
            {"id": "hs_1", "name": "Karachi", "lat": 24.8607, "lon": 67.0011, "base_risk": 45},
            {"id": "hs_2", "name": "Miami", "lat": 25.7617, "lon": -80.1918, "base_risk": 65},
            {"id": "hs_3", "name": "Tokyo", "lat": 35.6762, "lon": 139.6503, "base_risk": 30},
            {"id": "hs_4", "name": "Dhaka", "lat": 23.8103, "lon": 90.4125, "base_risk": 82},
            {"id": "hs_5", "name": "Rio de Janeiro", "lat": -22.9068, "lon": -43.1729, "base_risk": 55},
            {"id": "hs_6", "name": "Jakarta", "lat": -6.2088, "lon": 106.8456, "base_risk": 78},
            {"id": "hs_7", "name": "Sydney", "lat": -33.8688, "lon": 151.2093, "base_risk": 20},
            {"id": "hs_8", "name": "London", "lat": 51.5074, "lon": -0.1278, "base_risk": 15},
            {"id": "hs_9", "name": "New Delhi", "lat": 28.6139, "lon": 77.2090, "base_risk": 72},
            {"id": "hs_10", "name": "Lagos", "lat": 6.5244, "lon": 3.3792, "base_risk": 68}
        ]
        
        # Inject dynamic telemetry noise to simulate live updates
        for hs in hotspots:
            noise = random.uniform(-10, 15)
            hs["currentRisk"] = round(max(0, min(100, hs["base_risk"] + noise)), 1)
            hs["alertLevel"] = 4 if hs["currentRisk"] >= 80 else 3 if hs["currentRisk"] >= 60 else 2 if hs["currentRisk"] >= 30 else 1
            hs["status"] = "EMERGENCY" if hs["alertLevel"] == 4 else "ACTIVE" if hs["alertLevel"] == 3 else "MONITORING"
            hs["threat_vector"] = "Flood Inundation" if hs["lat"] < 30 else "Storm Surge" if "Tokyo" in hs["name"] else "Heat Anomaly"
            
        return hotspots

    def get_layer_metadata(self) -> Dict:
        """Metadata for multi-spectral tactical overlays."""
        return {
            "layers": [
                {"id": "ndvi", "label": "Vegetation (NDVI)", "description": "Terrain and landslide vulnerability monitoring."},
                {"id": "thermal", "label": "Thermal Intensity (LST)", "description": "Real-time heat anomaly detection."},
                {"id": "water", "label": "Water Index (NDWI)", "description": "Fluvial surge and accumulation mapping."}
            ]
        }
