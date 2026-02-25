from src.models.base_model import BaseModel

class HeatwavePredictor(BaseModel):
    def __init__(self):
        super().__init__("Heatwave Predictor")

    def predict(self, features):
        """
        Predict heatwave risk based on temperature.
        """
        temp = features.get("temp", 25)

        if temp < 30:
            risk_score = 0
        else:
            base_risk = (temp - 30) / 15.0 # Max risk at 45C
            risk_score = int(min(max(base_risk, 0.0), 1.0) * 100)
        
        confidence = 0.98
        
        actions = []
        if risk_score > 70:
            actions = ["Stay hydrated", "Avoid direct sunlight between 11 AM - 4 PM", "Seek conditioned environments"]
        elif risk_score > 30:
            actions = ["Drink plenty of water", "Use fans or cooling systems"]
        else:
            actions = ["Comfortable temperature range"]

        return {
            "risk_score": risk_score,
            "confidence": confidence,
            "risk_level": self.get_classification(risk_score),
            "actions": actions
        }
