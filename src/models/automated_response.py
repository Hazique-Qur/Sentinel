from typing import List, Dict

class AutomatedResponseManager:
    """
    Phase 9 Sovereign Intelligence: Tactical Decision Unit
    Generates deterministic, actionable protocols based on unified threat indices.
    """
    
    def generate_protocols(self, tier: int, threat_vectors: List[str]) -> List[Dict]:
        """Maps risk tiers and vectors to tactical response steps."""
        protocols = []
        
        # Base protocols by tier
        if tier >= 4: # Emergency
            protocols.extend([
                {
                    "action": "Immediate Sector Evacuation",
                    "priority": "ALPHA",
                    "authority": "Sentinel-Sovereign",
                    "status": "Mandatory",
                    "description": "Triggering immediate displacement protocols for lowest elevation sectors based on surge projections."
                },
                {
                    "action": "Logistics Route Optimization",
                    "priority": "BETA",
                    "authority": "Local Logistics Engine",
                    "status": "In-Progress",
                    "description": "Optimizing heavy-vehicle throughput for 3 tactical egress points."
                }
            ])
        elif tier == 3: # Warning
            protocols.extend([
                {
                    "action": "Resource Standby",
                    "priority": "GAMMA",
                    "authority": "Regional Command",
                    "status": "Ready",
                    "description": "Staging emergency medical and dietary assets at Primary Shelter and Sub-Station 4."
                },
                {
                    "action": "Utility Hardening",
                    "priority": "GAMMA",
                    "authority": "Infrastructure Unit",
                    "status": "Initiated",
                    "description": "Monitoring sub-station thermal loads. Ready for automated grid isolation if surge detected."
                }
            ])
        elif tier == 2: # Watch
            protocols.extend([
                {
                    "action": "Continuous Surveillance",
                    "priority": "DELTA",
                    "authority": "Sentinel-Node",
                    "status": "Active",
                    "description": "Increasing satellite telemetry frequency to 15-minute intervals."
                }
            ])
        else: # Advisory
            protocols.append({
                "action": "Passive Data Ingestion",
                "priority": "EPSILON",
                "authority": "System Kernel",
                "status": "Nominal",
                "description": "Standard atmospheric monitoring and cloud-sync active."
            })
            
        # Threat-specific overlays
        if "Fluvial Surge Probable" in threat_vectors:
            protocols.append({
                "action": "Hydraulic Barrier Monitoring",
                "priority": "BETA",
                "authority": "Water Management Unit",
                "status": "Alert",
                "description": "Real-time monitoring of levee integrity and water table pressure."
            })
            
        if "Atmospheric Instability" in threat_vectors:
            protocols.append({
                "action": "Wind Velocity Advisory",
                "priority": "GAMMA",
                "authority": "Aviation/Logistics Hub",
                "status": "Notice",
                "description": "High wind vectors detected. Suggesting grounding of light aerial assets."
            })
            
        return protocols
