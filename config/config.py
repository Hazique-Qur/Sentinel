import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
    GEE_PROJECT_ID = os.getenv("GEE_PROJECT_ID")
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "disaster_warning_db")

    # Default coordinates (e.g., Karachi)
    DEFAULT_LAT = float(os.getenv("DEFAULT_LAT", 24.8607))
    DEFAULT_LON = float(os.getenv("DEFAULT_LON", 67.0011))
