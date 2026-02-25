import time
import datetime
from config.config import Config
from src.ingestion.weather_service import WeatherService
from src.ingestion.satellite_service import SatelliteService
from src.processing.data_processor import DataProcessor
from src.processing.feature_engineer import FeatureEngineer
from src.utils.db_client import DBClient
from src.models.risk_aggregator import RiskAggregator

def run_pipeline():
    print(f"[{datetime.datetime.now()}] Starting advanced data collection & risk assessment...")
    
    weather_svc = WeatherService()
    satellite_svc = SatelliteService()
    processor = DataProcessor()
    feature_eng = FeatureEngineer()
    db = DBClient()

    # Initialize Multi-Agent Aggregator
    aggregator = RiskAggregator()

    lat, lon = Config.DEFAULT_LAT, Config.DEFAULT_LON

    # 1. Fetch Weather
    weather = weather_svc.get_current_weather(lat, lon)
    if not weather:
        print("Failed to fetch weather data. Skipping...")
        return

    # 2. Fetch Satellite Data
    ndvi = satellite_svc.get_ndvi(lat, lon)
    satellite_data = {
        "ndvi": ndvi if ndvi is not None else 0.5,
        "water_coverage": 0.0 # Placeholder
    }

    # 3. Multi-Agent Risk Assessment (Phase 2 Advanced)
    features = feature_eng.extract_features(weather, satellite_data)
    aggregated_results = aggregator.aggregate_risks(features, lat, lon)
    
    print(f"Risk Assessment: {aggregated_results['overall_risk_level']} (Adjusted Score: {aggregated_results['adjusted_risk_score']})")
    print(f"Priority: {aggregated_results['priority']}")
    print(f"Primary Threat: {aggregated_results['primary_threat']}")
    print(f"Actions: {aggregated_results['recommended_actions']}")

    # 4. Process & Merge
    record = processor.prepare_store_format(
        weather, 
        satellite_data, 
        lat, 
        lon, 
        datetime.datetime.now(datetime.timezone.utc).isoformat()
    )
    record["risks"] = aggregated_results

    # 5. Store
    inserted_id = db.insert_disaster_data(record)
    if inserted_id:
        print(f"Successfully stored record with structured risks. ID: {inserted_id}")
    else:
        print("Failed to store record in database (possibly no MongoDB connection).")

if __name__ == "__main__":
    # For Step 5 Automation: simple loop as a placeholder for cron
    while True:
        run_pipeline()
        print("Waiting for next cycle (1 hour)...")
        time.sleep(3600) # Wait 1 hour
