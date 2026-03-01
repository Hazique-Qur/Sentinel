import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Optional

logger = logging.getLogger("SentinelLearning")

class LearningEngine:
    """
    Manages model parameters, adaptive weights, and prediction performance feedback
    with regional isolation support.
    """
    
    def __init__(self, region_id: str = "global", persistence_path: Optional[str] = None):
        self.region_id = region_id
        if persistence_path:
            self.persistence_path = persistence_path
        else:
            self.persistence_path = f"data/model_params_{region_id}.json"
            
        self.learning_rate = 0.05
        
        # Default weights for risk factor ensemble
        self.weights = {
            "flood_predictor": 0.4,
            "storm_predictor": 0.3,
            "heatwave_predictor": 0.2,
            "vulnerability_adjustment": 0.1
        }
        
        # Performance metrics
        self.metrics = {
            "total_predictions": 0,
            "total_outcomes": 0,
            "mean_absolute_error": 0.0,
            "false_positive_rate": 0.0,
            "false_negative_rate": 0.0,
            "confidence_calibration": 0.85
        }
        
        self.prediction_logs = []
        self._load_params()

    def _load_params(self):
        """Loads weights and metrics from disk if available."""
        if os.path.exists(self.persistence_path):
            try:
                with open(self.persistence_path, 'r') as f:
                    data = json.load(f)
                    self.weights = data.get("weights", self.weights)
                    self.metrics = data.get("metrics", self.metrics)
            except Exception as e:
                logger.error(f"Failed to load model params: {e}")

    def _save_params(self):
        """Persists weights and metrics to disk."""
        os.makedirs(os.path.dirname(self.persistence_path), exist_ok=True)
        try:
            with open(self.persistence_path, 'w') as f:
                json.dump({
                    "weights": self.weights,
                    "metrics": self.metrics,
                    "updated_at": datetime.utcnow().isoformat()
                }, f, indent=4)
        except Exception as e:
            logger.error(f"Failed to save model params: {e}")

    def get_weights(self) -> Dict[str, float]:
        return self.weights

    def log_prediction(self, prediction_id: str, predicted_score: float, components: Dict[str, float]):
        """Caches a prediction for future comparison with ground truth."""
        self.prediction_logs.append({
            "id": prediction_id,
            "score": predicted_score,
            "components": components,
            "timestamp": datetime.utcnow().isoformat()
        })
        # Keep recent 1000 logs
        if len(self.prediction_logs) > 1000:
            self.prediction_logs.pop(0)

    def process_feedback(self, prediction_id: str, actual_outcome_score: float):
        """
        Updates model weights based on prediction error.
        Actual outcome score is 0-100 (ground truth).
        """
        # Find the logged prediction
        log = next((l for l in self.prediction_logs if l["id"] == prediction_id), None)
        if not log:
            logger.warning(f"Feedback received for unknown prediction ID: {prediction_id}")
            return

        predicted_score = log["score"]
        error = actual_outcome_score - predicted_score
        abs_error = abs(error)

        # 1. Update Global Metrics
        self.metrics["total_outcomes"] += 1
        n = self.metrics["total_outcomes"]
        self.metrics["mean_absolute_error"] = ((self.metrics["mean_absolute_error"] * (n-1)) + abs_error) / n

        # 2. Adaptive Weight Adjustment (Simple Gradient Descent-like)
        # We adjust weights of components that contributed to the error
        total_adj = 0
        for comp, contribution in log["components"].items():
            if comp not in self.weights: continue
            
            # If component score was high and error is positive (under-predicted), increase weight
            # If component score was high and error is negative (over-predicted), decrease weight
            impact = contribution / 100.0
            adjustment = self.learning_rate * (error / 100.0) * impact
            
            self.weights[comp] = max(0.05, min(0.8, self.weights[comp] + adjustment))
            total_adj += self.weights[comp]

        # Re-normalize weights to sum to 1.0 (excluding vulnerability adjustment if wanted, or including)
        norm_factor = 1.0 / sum(self.weights.values())
        for comp in self.weights:
            self.weights[comp] *= norm_factor

        # 3. Confidence Calibration
        # If we were wrong with high confidence, penalize calibration
        if abs_error > 20:
             self.metrics["confidence_calibration"] = max(0.5, self.metrics["confidence_calibration"] - 0.01)
        elif abs_error < 5:
             self.metrics["confidence_calibration"] = min(0.98, self.metrics["confidence_calibration"] + 0.005)

        self._save_params()
        logger.info(f"MODEL ADAPTED | Error: {error:.1f} | New Weights: {self.weights}")

    def get_performance_report(self) -> Dict:
        return {
            "region_id": self.region_id,
            "metrics": self.metrics,
            "weights": self.weights,
            "learning_rate": self.learning_rate,
            "data_points": self.metrics["total_outcomes"]
        }

    def export_parameters(self) -> Dict:
        """Exports weights and metrics for federated aggregation."""
        return {
            "region_id": self.region_id,
            "weights": self.weights,
            "metrics": self.metrics,
            "timestamp": datetime.utcnow().isoformat()
        }

    def update_from_federation(self, global_weights: Dict[str, float]):
        """Updates regional weights using global consensus (meta-model)."""
        # We blend local weights with global weights to maintain local nuance
        blend_factor = 0.3 # 30% pull towards global average
        for comp, g_weight in global_weights.items():
            if comp in self.weights:
                self.weights[comp] = (self.weights[comp] * (1.0 - blend_factor)) + (g_weight * blend_factor)
        
        self._save_params()
        logger.info(f"REGION {self.region_id} SYNCED WITH GLOBAL META-MODEL")
