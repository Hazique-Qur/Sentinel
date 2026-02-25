from src.models.base_model import BaseModel

class FloodPredictor(BaseModel):
    def __init__(self):
        super().__init__("Flood Predictor")

    def predict(self, features):
        """
        Predict flood risk based on rain and NDVI.
        Returns structured risk data.
        """
        rain = features.get("rain", 0)
        ndvi = features.get("ndvi", 0.5)
        
        # Heuristic Logic
        rain_factor = min(rain / 50.0, 1.0)
        ndvi_factor = 1.0 - max(ndvi, 0.0)
        
        base_risk = (rain_factor * 0.7) + (ndvi_factor * 0.3)
        risk_score = int(base_risk * 100)
        
        # Confidence logic: lower if NDVI is missing (defaulted to 0.5)
        confidence = 0.9 if features.get("ndvi") is not None else 0.6
        
        actions = []
        if risk_score > 70:
            actions = ["Evacuate low-lying areas", "Move valuables to higher ground", "Stay tuned to emergency alerts"]
        elif risk_score > 30:
            actions = ["Monitor local water levels", "Prepare an emergency kit"]
        else:
            actions = ["No immediate flood action required"]

        return {
            "risk_score": risk_score,
            "confidence": confidence,
            "risk_level": self.get_classification(risk_score),
            "actions": actions
        }
