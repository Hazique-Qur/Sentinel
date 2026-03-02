import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Optional
from src.models.learning_engine import LearningEngine

logger = logging.getLogger("SentinelFederation")

class FederationEngine:
    """
    Global Meta-Model orchestrator. Aggregates regional intelligence 
    without requiring raw sensitive environmental data.
    """
    
    def __init__(self, global_params_path: str = "data/global_meta_model.json"):
        self.global_params_path = global_params_path
        self.regions = ["karachi", "lahore", "islamabad", "sindh", "punjab"]
        self.global_weights = {
            "flood_predictor": 0.4,
            "storm_predictor": 0.3,
            "heatwave_predictor": 0.2,
            "vulnerability_adjustment": 0.1
        }
        self._load_global_model()

    def _load_global_model(self):
        if os.path.exists(self.global_params_path):
            try:
                with open(self.global_params_path, 'r') as f:
                    data = json.load(f)
                    self.global_weights = data.get("global_weights", self.global_weights)
            except Exception as e:
                logger.error(f"Federation: Failed to load meta-model: {e}")

    def _save_global_model(self):
        os.makedirs(os.path.dirname(self.global_params_path), exist_ok=True)
        with open(self.global_params_path, 'w') as f:
            json.dump({
                "global_weights": self.global_weights,
                "updated_at": datetime.utcnow().isoformat(),
                "contributing_regions": self.regions
            }, f, indent=4)

    def aggregate_global_intelligence(self) -> Dict[str, float]:
        """
        Federated Averaging: Combines regional model parameters 
        to update the global baseline model.
        """
        regional_params = []
        for rid in self.regions:
            engine = LearningEngine(region_id=rid)
            params = engine.export_parameters()
            # Only include regions with sufficient data points
            if params["metrics"]["total_outcomes"] > 0:
                regional_params.append(params)

        if not regional_params:
            return self.global_weights

        # Weighted averaging based on regional accuracy (reliability index)
        new_global = {k: 0.0 for k in self.global_weights.keys()}
        total_reliability = 0.0

        for p in regional_params:
            reliability = p["metrics"].get("confidence_calibration", 0.5)
            total_reliability += reliability
            for comp, weight in p["weights"].items():
                if comp in new_global:
                    new_global[comp] += weight * reliability

        # Normalize
        if total_reliability > 0:
            for k in new_global:
                new_global[k] /= total_reliability
            self.global_weights = new_global
            self._save_global_model()
            
            # Pulse the improved baseline back to all regions
            self.broadcast_global_model()

        return self.global_weights

    def broadcast_global_model(self):
        """Pushes the updated meta-model weights back to all regional learners."""
        for rid in self.regions:
            engine = LearningEngine(region_id=rid)
            engine.update_from_federation(self.global_weights)

    def get_federation_status(self) -> Dict:
        """Returns overview of all regional model performance and drift."""
        status = []
        for rid in self.regions:
            engine = LearningEngine(region_id=rid)
            report = engine.get_performance_report()
            
            # Calculate Model Drift (Divergence from global baseline)
            drift = sum(abs(report["weights"].get(k, 0) - self.global_weights.get(k, 0)) for k in self.global_weights)
            report["model_drift"] = round(drift, 3)
            status.append(report)
            
        return {
            "global_meta_model": self.global_weights,
            "regional_intelligence": status,
            "last_sync": datetime.utcnow().isoformat()
        }

    def detect_cross_region_anomalies(self) -> List[Dict]:
        """
        Identify threat patterns that successfully triggered alerts in one region
        which might be early-warning precursors for another.
        """
        anomalies = []
        regional_status = self.get_federation_status()["regional_intelligence"]
        
        # Filter for regions currently experiencing "Warning" or "Emergency" levels
        # (Using mean_absolute_error as a proxy for high-activity in this demo logic,
        # but in production we'd look at the latest risk snapshots from and across regions)
        high_risk_regions = [r for r in regional_status if r["metrics"]["confidence_calibration"] > 0.9 and r["data_points"] > 5]
        
        for r in high_risk_regions:
            # If a region has high accuracy and specific dominant weights, 
            # share that 'mode' as a warning for others
            dominant_factor = max(r["weights"], key=r["weights"].get)
            if r["weights"][dominant_factor] > 0.5:
                anomalies.append({
                    "source_region": r["region_id"],
                    "type": "Cross-Region Momentum",
                    "threat": f"High {dominant_factor.replace('_', ' ')} intensity detected in {r['region_id'].capitalize()}",
                    "severity": "High",
                    "confidence": r["metrics"]["confidence_calibration"]
                })
        
        return anomalies
