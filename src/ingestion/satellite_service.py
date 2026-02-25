import ee
from config.config import Config

class SatelliteService:
    def __init__(self):
        self.project_id = Config.GEE_PROJECT_ID
        self.initialized = False

    def initialize(self):
        try:
            if not self.project_id or "your_" in self.project_id:
                print("Warning: GEE Project ID not set correctly.")
                return False
            
            ee.Initialize(project=self.project_id)
            self.initialized = True
            return True
        except Exception as e:
            print(f"Error initializing Google Earth Engine: {e}")
            return False

    def get_ndvi(self, lat, lon):
        if not self.initialized and not self.initialize():
            return None

        region = ee.Geometry.Point([lon, lat])
        # MODIS Vegetation Index dataset
        dataset = ee.ImageCollection('MODIS/006/MOD13A2').filterDate('2024-01-01', '2024-02-25').select('NDVI')
        
        try:
            ndvi_mean = dataset.mean().reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=500
            ).get('NDVI')
            
            info = ndvi_mean.getInfo()
            # NDVI is typically scaled by 0.0001 in MOD13A2
            return info * 0.0001 if info is not None else None
        except Exception as e:
            print(f"Error extracting NDVI: {e}")
            return None

    def get_water_coverage(self, lat, lon):
        # Implementation for water coverage using JRC Global Surface Water or similar
        if not self.initialized and not self.initialize():
            return None
        
        # Placeholder for water coverage logic
        return 0.0

if __name__ == "__main__":
    service = SatelliteService()
    ndvi = service.get_ndvi(Config.DEFAULT_LAT, Config.DEFAULT_LON)
    if ndvi is not None:
        print(f"NDVI for Karachi: {ndvi}")
