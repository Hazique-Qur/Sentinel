import requests
from config.config import Config

class WeatherService:
    def __init__(self):
        self.api_key = Config.OPENWEATHERMAP_API_KEY
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"

    def get_current_weather(self, lat, lon):
        if not self.api_key or "your_" in self.api_key:
            print("Warning: OpenWeatherMap API key not set correctly.")
            return None

        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric"
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Simplified structure based on user request example
            weather = {
                "temp": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "rain": data.get("rain", {}).get("1h", 0),
                "wind_speed": data["wind"]["speed"],
                "timestamp": data.get("dt")
            }
            return weather
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return None

if __name__ == "__main__":
    service = WeatherService()
    weather = service.get_current_weather(Config.DEFAULT_LAT, Config.DEFAULT_LON)
    if weather:
        print(f"Current weather in Karachi: {weather}")
