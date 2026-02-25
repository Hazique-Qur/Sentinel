from src.models.flood_model import FloodPredictor
from src.models.storm_model import StormPredictor
from src.models.heatwave_model import HeatwavePredictor
from src.processing.vulnerability_manager import VulnerabilityManager
from src.models.insight_engine import InsightEngine

class RiskAggregator:
    def __init__(self):
        self.agents = [
            FloodPredictor(),
            StormPredictor(),
            HeatwavePredictor()
        ]
        self.vulnerability_mgr = VulnerabilityManager()
        self.insight_engine = InsightEngine()

    def aggregate_risks(self, features, lat=None, lon=None):
        """
        Coordinates specialized agents and aggregates their outputs.
        metadata can include population density, etc. (future expansion)
        """
        all_results = {}
        max_score = 0
        primary_threat = "None"
        summary_actions = set()

        for agent in self.agents:
            result = agent.predict(features)
            agent_key = agent.name.lower().replace(" ", "_")
            all_results[agent_key] = result
            
            if result["risk_score"] > max_score:
                max_score = result["risk_score"]
                primary_threat = agent.name
            
            if result["risk_level"] in ["Medium", "High"]:
                summary_actions.update(result["actions"])

        # Create overall classification
        overall_level = "Low"
        if max_score > 70:
            overall_level = "High"
        elif max_score > 30:
            overall_level = "Medium"

        # Apply Vulnerability Weighting (Phase 3)
        adjusted_score = max_score
        priority = "Normal"
        if lat and lon:
            adjusted_score, priority = self.vulnerability_mgr.adjust_risk(max_score, lat, lon)

        # Generate Insights (Phase 3)
        recommended_actions = self.insight_engine.generate_recommendations(all_results)

        return {
            "overall_risk_score": max_score,
            "adjusted_risk_score": adjusted_score,
            "overall_risk_level": overall_level,
            "priority": priority,
            "primary_threat": primary_threat,
            "detailed_risks": all_results,
            "recommended_actions": recommended_actions if recommended_actions else ["No immediate actions required"],
            "confidence": round(sum(r["confidence"] for r in all_results.values()) / len(all_results), 2)
        }
