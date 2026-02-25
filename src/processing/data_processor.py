import pandas as pd
from sklearn.preprocessing import MinMaxScaler

class DataProcessor:
    def __init__(self):
        self.scaler = MinMaxScaler()

    def clean_weather_data(self, weather_data):
        # Remove outliers or handle missing values if any
        # In this simple case, just return as is or handle None
        if not weather_data:
            return {}
        return weather_data

    def normalize_features(self, df, columns):
        """
        Normalizes specified columns to 0-1 range.
        """
        if df.empty:
            return df
        
        df[columns] = self.scaler.fit_transform(df[columns])
        return df

    def prepare_store_format(self, weather, satellite, lat, lon, timestamp):
        return {
            "location": {"lat": lat, "lon": lon},
            "timestamp": timestamp,
            "weather": weather,
            "satellite": satellite
        }
