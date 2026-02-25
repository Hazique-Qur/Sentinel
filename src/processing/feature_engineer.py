class FeatureEngineer:
    def __init__(self):
        pass

    def extract_features(self, weather_data, satellite_data):
        """
        Extracts a flat feature dictionary for models from raw ingestion data.
        """
        features = {
            "temp": weather_data.get("temp", 25),
            "humidity": weather_data.get("humidity", 50),
            "rain": weather_data.get("rain", 0),
            "wind_speed": weather_data.get("wind_speed", 0),
            "ndvi": satellite_data.get("ndvi", 0.5),
            "water_coverage": satellite_data.get("water_coverage", 0.0)
        }
        return features
