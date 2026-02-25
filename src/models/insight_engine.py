class InsightEngine:
    def __init__(self):
        # Structured action templates
        self.action_templates = {
            "flood": {
                "Low": ["Monitor local weather updates", "Keep rain gear ready"],
                "Medium": ["Move electronics to higher shelves", "Check emergency supplies", "Identify nearest drainage points"],
                "High": ["Evacuate low-lying areas immediately", "Turn off utilities", "Follow official evacuation routes"]
            },
            "storm": {
                "Low": ["Secure loose outdoor items", "Stay updated on weather"],
                "Medium": ["Stay indoors", "Secure windows and doors", "Charge communication devices"],
                "High": ["Seek shelter in a reinforced room", "Avoid all non-essential travel", "Stay away from windows"]
            },
            "heatwave": {
                "Low": ["Stay hydrated", "Avoid direct sun"],
                "Medium": ["Increase water intake", "Use cooling systems", "Check on elderly neighbors"],
                "High": ["Remain indoors with AC", "Avoid all physical activity outdoors", "Seek emergency cooling centers if AC fails"]
            }
        }

    def generate_recommendations(self, risks):
        """
        Maps risk levels to structured actions.
        risks: dict of {type: {risk_level, ...}}
        """
        all_actions = []
        for disaster_type, data in risks.items():
            level = data.get("risk_level", "Low")
            actions = self.action_templates.get(disaster_type, {}).get(level, [])
            all_actions.extend(actions)
            
        return list(set(all_actions)) # Unique actions
