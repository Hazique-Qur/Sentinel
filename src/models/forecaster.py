import math
from datetime import datetime
from typing import List, Dict, Tuple

class RiskForecaster:
    """
    Predictive engine for disaster risk horizon modeling.
    Uses historical snapshots to project risk trajectories into the future.
    """
    
    def __init__(self):
        self.horizons = [3, 6, 12, 24] # Hours into future
        
    def forecast_risk(self, history: List[Dict], current_risk: float) -> Dict:
        """
        Calculates risk projections based on trend velocity and environmental momentum.
        """
        if not history or len(history) < 2:
            return self._generate_fallback_forecast(current_risk)
            
        # Extract risk scores and timestamps
        scores = [s["riskScore"] for s in history]
        if scores[-1] != current_risk:
            scores.append(current_risk)
            
        # Calculate velocity (delta per snapshot)
        # Assuming snapshots are roughly 15-30 mins apart
        last_n = scores[-6:] if len(scores) >= 6 else scores
        velocity = (last_n[-1] - last_n[0]) / (len(last_n) - 1) if len(last_n) > 1 else 0
        
        # Calculate acceleration (change in velocity)
        if len(last_n) > 3:
            v1 = (last_n[2] - last_n[0]) / 2
            v2 = (last_n[-1] - last_n[-3]) / 2
            acceleration = (v2 - v1) / (len(last_n) - 2)
        else:
            acceleration = 0

        forecast = []
        max_predicted = current_risk
        
        for h in self.horizons:
            # Simple kinematic-style projection: r = r0 + v*t + 0.5*a*t^2
            # We scale 't' relative to snapshot intervals (approx 2 snapshots per hour)
            t = h * 2 
            
            # Predict with dampening (risk can't grow linearly forever)
            projection = current_risk + (velocity * t) + (0.5 * acceleration * (t**2))
            
            # Clamp to [0, 100] and add saturation dampening as it nears limits
            if projection > 100:
                projection = 100 - (100 / (1 + (projection - 100)/10))
            elif projection < 0:
                projection = abs(projection) / (1 + abs(projection)/10)
                
            prediction = round(max(0, min(100, projection)), 1)
            forecast.append({"hour": h, "risk": prediction})
            max_predicted = max(max_predicted, prediction)
            
        # Calculate escalation probability
        # Weighted by trend direction and current proximity to threshold
        prob_emergency = self._calculate_escalation_probability(current_risk, velocity, acceleration, max_predicted)
        
        # Determine trend prediction label
        trend_pred = "Stable"
        if velocity > 1.5 or (velocity > 0.5 and acceleration > 0):
            trend_pred = "Escalating"
        elif velocity < -1.5 or (velocity < -0.5 and acceleration < 0):
            trend_pred = "Declining"
            
        return {
            "forecast": forecast,
            "trendPrediction": trend_pred,
            "probabilityEmergencyWithin24h": prob_emergency,
            "maxForecastedRisk": max_predicted
        }
        
    def _calculate_escalation_probability(self, current: float, v: float, a: float, max_p: float) -> float:
        """Returns 0.0-1.0 probability of hitting Level 4 (76+) within 24h."""
        if current >= 76: return 1.0
        
        # Base probability on how close it's predicted to get to 76
        distance_to_target = 76 - max_p
        if distance_to_target <= 0:
            prob = 0.85 + (min(v, 5) / 20) # High confidence if prediction hits it
        else:
            prob = max(0, (1 - (distance_to_target / 40))) * 0.7
            
        # Boost if velocity is high
        if v > 2: prob += 0.1
        if a > 0.5: prob += 0.05
        
        return round(min(0.95, prob), 2)
        
    def _generate_fallback_forecast(self, current: float) -> Dict:
        """Used when history is insufficient."""
        return {
            "forecast": [
                {"hour": 3, "risk": current},
                {"hour": 6, "risk": current},
                {"hour": 12, "risk": current},
                {"hour": 24, "risk": current}
            ],
            "trendPrediction": "Stable",
            "probabilityEmergencyWithin24h": 0.15 if current < 50 else 0.4,
            "maxForecastedRisk": current
        }

    def detect_anomalies(self, features: Dict, history_avg: Dict) -> Dict:
        """
        Identifies sharp deviations from historical or expected environmental norms.
        """
        anomalies = []
        
        # 1. Rainfall Anomaly (Sudden spike vs recent avg)
        curr_rain = features.get("rain", 0)
        if curr_rain > 30: # Hard threshold for intense rain
            anomalies.append({"type": "Intense Precipitation", "intensity": curr_rain / 50.0})
            
        # 2. Wind Anomaly
        curr_wind = features.get("wind_speed", 0)
        if curr_wind > 60:
            anomalies.append({"type": "Gale Force Winds", "intensity": curr_wind / 80.0})
            
        return {
            "isAnomaly": len(anomalies) > 0,
            "anomalies": anomalies,
            "primaryAnomaly": anomalies[0]["type"] if anomalies else None
        }
