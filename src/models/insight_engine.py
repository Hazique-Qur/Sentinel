class InsightEngine:
    def __init__(self):
        # Dynamic Action Engine — keyed by alert level (1=Advisory, 2=Watch, 3=Warning, 4=Emergency)
        self.level_actions = {
            1: [
                "Stay informed via local weather services",
                "Review your household emergency plan",
                "Check updates every 6 hours",
                "Ensure communication devices are charged",
            ],
            2: [
                "Prepare your emergency kit (water, food, documents)",
                "Identify nearest emergency shelters in your area",
                "Secure loose outdoor items",
                "Monitor official government alerts closely",
                "Check on vulnerable neighbors and family members",
            ],
            3: [
                "Avoid all low-lying and flood-prone areas immediately",
                "Keep your evacuation plan ready and accessible",
                "Move to upper floors or elevated ground if flooding begins",
                "Follow all official emergency directives without delay",
                "Limit non-essential travel — roads may become dangerous",
                "Keep emergency radio on for continuous updates",
            ],
            4: [
                "MOVE TO SHELTER IMMEDIATELY — Do not delay",
                "Follow official emergency guidance and evacuation orders",
                "Do NOT attempt to drive through flooded roads",
                "Shut off gas and electricity before evacuating",
                "Take only essential items — prioritize speed of evacuation",
                "Contact emergency services if you require assistance: 1122",
            ]
        }

        # Disaster-type specific actions (supplemental, by alert level)
        self.disaster_actions = {
            "flood": {
                1: ["Monitor river and drainage levels nearby"],
                2: ["Move electronics and valuables to higher shelves"],
                3: ["Evacuate low-lying areas — do not wait for water to rise"],
                4: ["Seek immediate high-ground shelter — life-threatening flood imminent"],
            },
            "storm": {
                1: ["Secure outdoor furniture and lightweight items"],
                2: ["Stay indoors; charge all communication devices"],
                3: ["Seek shelter in a reinforced interior room; avoid windows"],
                4: ["Do NOT leave shelter — storm conditions are life-threatening"],
            },
            "heatwave": {
                1: ["Stay hydrated; avoid prolonged direct sun exposure"],
                2: ["Increase water intake; use fans or air conditioning"],
                3: ["Remain indoors with AC; check on elderly and children"],
                4: ["Seek emergency cooling centers immediately — heat is lethal"],
            }
        }

    def generate_recommendations(self, risks, alert_level: int = 1):
        """
        Maps alert level to structured actions.
        risks: dict of {type: {risk_score, risk_level, ...}}
        alert_level: int 1–4 from the alert tier system
        """
        level = max(1, min(4, alert_level))  # Clamp to 1–4

        # Core level-based actions
        actions = list(self.level_actions.get(level, self.level_actions[1]))

        # Supplement with disaster-specific actions for the top threats
        for disaster_type, data in risks.items():
            # Strip the "_predictor" suffix if present
            clean_type = disaster_type.replace("_predictor", "")
            if clean_type in self.disaster_actions:
                type_actions = self.disaster_actions[clean_type].get(level, [])
                actions.extend(type_actions)

        # Deduplicate while preserving order
        seen = set()
        unique_actions = []
        for a in actions:
            if a not in seen:
                seen.add(a)
                unique_actions.append(a)

        return unique_actions
