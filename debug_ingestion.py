import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_weather():
    api_key = os.getenv("OPENWEATHERMAP_API_KEY")
    lat, lon = 24.86, 67.00
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}"
    try:
        response = requests.get(url, timeout=10)
        print(f"Weather API status: {response.status_code}")
        if response.status_code != 200:
            print(f"Weather API error: {response.text}")
    except Exception as e:
        print(f"Weather API exception: {e}")

def test_mongodb():
    from pymongo import MongoClient
    uri = os.getenv("MONGODB_URI")
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("MongoDB status: Operational")
    except Exception as e:
        print(f"MongoDB exception: {e}")

if __name__ == "__main__":
    print("--- Diagnostic Start ---")
    test_weather()
    test_mongodb()
    print("--- Diagnostic End ---")
