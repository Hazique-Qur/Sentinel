import sys
import os

sys.path.append(os.getcwd())

print("Isolated import test for all services:")

try:
    print("Importing WeatherService...")
    from src.ingestion.weather_service import WeatherService
    print("WeatherService imported.")
    
    print("Importing SatelliteService...")
    from src.ingestion.satellite_service import SatelliteService
    print("SatelliteService imported.")
    
    print("Importing FeatureEngineer...")
    from src.processing.feature_engineer import FeatureEngineer
    print("FeatureEngineer imported.")
    
    print("Importing RiskAggregator...")
    from src.models.risk_aggregator import RiskAggregator
    print("RiskAggregator imported.")
    
    print("Importing ShelterService...")
    from src.utils.shelter_service import ShelterService
    print("ShelterService imported.")
    
    print("ALL SERVICES IMPORTED.")
except Exception as e:
    print(f"IMPORT FAILED: {e}")
    import traceback
    traceback.print_exc()
