from pymongo import MongoClient
from config.config import Config

class DBClient:
    def __init__(self):
        self.client = MongoClient(Config.MONGODB_URI)
        self.db = self.client[Config.DATABASE_NAME]

    def insert_disaster_data(self, data):
        collection = self.db['disaster_records']
        try:
            result = collection.insert_one(data)
            return result.inserted_id
        except Exception as e:
            print(f"Error inserting to MongoDB: {e}")
            return None

    def get_latest_records(self, limit=10):
        collection = self.db['disaster_records']
        return list(collection.find().sort("timestamp", -1).limit(limit))

if __name__ == "__main__":
    db = DBClient()
    test_data = {"test": "connection", "status": "ok"}
    # result = db.insert_disaster_data(test_data)
    # print(f"Inserted: {result}")
