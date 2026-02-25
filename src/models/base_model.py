class BaseModel:
    def __init__(self, name):
        self.name = name

    def get_classification(self, score):
        if score < 30:
            return "Low"
        elif score < 70:
            return "Medium"
        else:
            return "High"

    def predict(self, features):
        """
        Returns a dictionary:
        {
            "risk_score": 0-100,
            "confidence": 0-1,
            "risk_level": "Low/Medium/High",
            "actions": ["Action 1", ...]
        }
        """
        raise NotImplementedError("Subclasses must implement the predict method.")
