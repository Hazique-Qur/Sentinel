import math

class ShelterService:
    def __init__(self):
        # Mock data: List of shelters in Karachi area
        self.shelters = [
            {"name": "Community School A", "lat": 24.8650, "lon": 67.0050, "capacity": 500, "type": "School"},
            {"name": "City Hall Shelter", "lat": 24.8580, "lon": 67.0120, "capacity": 1000, "type": "Government Building"},
            {"name": "Safe Zone Park", "lat": 24.8700, "lon": 66.9950, "capacity": 2000, "type": "Open Area"},
            {"name": "Emergency Hospital B", "lat": 24.8500, "lon": 67.0200, "capacity": 300, "type": "Medical Facility"}
        ]

    def haversine(self, lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = math.sin(dLat/2)**2 + math.cos(math.radians(lat1)) * \
            math.cos(math.radians(lat2)) * math.sin(dLon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    def get_nearest_shelters(self, lat, lon, limit=3):
        """
        Returns the top closest shelters from the given location.
        """
        shelters_with_dist = []
        for shelter in self.shelters:
            dist = self.haversine(lat, lon, shelter["lat"], shelter["lon"])
            shelter_entry = shelter.copy()
            shelter_entry["distance_km"] = round(dist, 2)
            shelters_with_dist.append(shelter_entry)
        
        # Sort by distance
        sorted_shelters = sorted(shelters_with_dist, key=lambda x: x["distance_km"])
        return sorted_shelters[:limit]

if __name__ == "__main__":
    service = ShelterService()
    # Karachi default point from Config
    nearest = service.get_nearest_shelters(24.8607, 67.0011)
    print(f"Nearest Shelters: {nearest}")
