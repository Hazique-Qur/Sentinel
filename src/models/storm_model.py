from src.models.base_model import BaseModel

class StormPredictor(BaseModel):
    def __init__(self):
        super().__init__("Storm Predictor")

    def predict(self, features):
        """
        Predict storm risk based on wind speed and humidity.
        """
        wind_speed = features.get("wind_speed", 0)
        humidity = features.get("humidity", 50)

        wind_factor = min(wind_speed / 80.0, 1.0)
        humidity_factor = max((humidity - 50) / 50.0, 0.0)

        base_risk = (wind_factor * 0.6) + (humidity_factor * 0.4)
        risk_score = int(base_risk * 100)
        
        confidence = 0.95 # Usually high confidence from real-time weather feeds
        
        actions = []
        if risk_score > 70:
            actions = ["Secure outdoor items", "Seek shelter in a sturdy building", "Avoid travel"]
        elif risk_score > 30:
            actions = ["Stay indoors", "Monitor weather updates"]
        else:
            actions = ["Normal conditions for storms"]

        return {
            "risk_score": risk_score,
            "confidence": confidence,
            "risk_level": self.get_classification(risk_score),
            "actions": actions
        }
