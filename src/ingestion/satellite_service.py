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

    def get_water_index(self, lat, lon):
        """Extracts NDWI (Modified Normalized Difference Water Index) to identify flood signatures."""
        if not self.initialized and not self.initialize():
            return None

        region = ee.Geometry.Point([lon, lat])
        # Using Landsat 8 Surface Reflectance for high-fidelity water detection
        dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2').filterBounds(region).sort('CLOUD_COVER').first()
        
        try:
            # Formula: (Green - SWIR) / (Green + SWIR)
            ndwi = dataset.normalizedDifference(['SR_B3', 'SR_B6']).rename('NDWI')
            stats = ndwi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=30
            ).get('NDWI')
            
            info = stats.getInfo()
            return round(info, 3) if info is not None else 0.0
        except Exception as e:
            print(f"Error extracting NDWI: {e}")
            return 0.0

    def get_thermal_data(self, lat, lon):
        """Extracts LST (Land Surface Temperature) to identify heatwave hotspots."""
        if not self.initialized and not self.initialize():
            return None

        region = ee.Geometry.Point([lon, lat])
        dataset = ee.ImageCollection('MODIS/061/MOD11A1').filterBounds(region).sort('system:time_start', False).first()
        
        try:
            # LST_Day_1km is in Kelvin scaled by 0.02
            lst_kelvin = dataset.select('LST_Day_1km').reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=1000
            ).get('LST_Day_1km')
            
            val = lst_kelvin.getInfo()
            if val is not None:
                celsius = (val * 0.02) - 273.15
                return round(celsius, 1)
            return None
        except Exception as e:
            print(f"Error extracting Thermal Data: {e}")
            return None

if __name__ == "__main__":
    service = SatelliteService()
    ndvi = service.get_ndvi(Config.DEFAULT_LAT, Config.DEFAULT_LON)
    if ndvi is not None:
        print(f"NDVI for Karachi: {ndvi}")
