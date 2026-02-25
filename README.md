# Sentinel 🛡️ | AI-Powered Disaster Early Warning System

Sentinel is a production-grade Decision Support System (DSS) designed to provide real-time, multi-agent risk intelligence for natural disasters. Using a combination of weather telemetry, satellite imagery (NDVI), and geospatial analysis, Sentinel predicts local risks and coordinates emergency responses autonomously.

## 🚀 Key Features

- **Autonomous Intel**: Integrated GPS detection and 5-minute automated polling for real-time monitoring.
- **Multi-Agent Reasoning**: Specialized AI agents evaluate Flood, Storm, and Heatwave risks using weighted heuristic modeling.
- **Geospatial Shelter Logic**: Haversine-driven navigation to the nearest "Safe Harbors."
- **Emergency Lockdown**: A UX safety feature that prioritizes critical information and evacuation routes when risk scores exceed 85%.
- **Disaster Simulator**: Integrated "Demo Mod" for portfolio walkthroughs and disaster scenario injection.

## 🛠️ Architecture

Sentinel uses a decoupled, data-driven architecture:

- **Frontend**: React (Vite) + Framer Motion + Leaflet + Tailwind CSS.
- **Backend**: FastAPI (Python) + Multi-Agent Aggregator.
- **Data Layers**: OpenWeatherMap API + Google Earth Engine (Satellite Telemetry).
- **Communication**: RESTful JSON API with CORS-enabled production hardening.

## 📦 Getting Started

### Backend Setup
1. Clone the repository.
2. Install dependencies: `pip install -r requirements.txt`
3. Set your `.env` variables (Weather API Key, Database URI).
4. Run locally: `python src/api/main.py`

### Frontend Setup
1. CD into `frontend/`.
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## 📊 Deployment Strategy
Sentinel is designed for cloud-native deployment:
- **API**: Ready for Railway/Heroku with Gunicorn.
- **Frontend**: Ready for Vercel/Netlify.
- **Database**: Compatible with MongoDB Atlas or Supabase.

---
*Built with precision for emergency infrastructure.*
