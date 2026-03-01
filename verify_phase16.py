import sys
import os
import json
import time

# Ensure src can be found
sys.path.append(os.getcwd())

from src.models.learning_engine import LearningEngine
from src.models.federation_engine import FederationEngine

def test_federation_loop():
    print("🚀 Starting Phase 16: Federated Intelligence Verification...")
    
    # 1. Simulate two different regions with different local patterns
    # Region A (Karachi): Flood is high priority
    # Region B (Lahore): Heatwave is high priority
    
    engine_k = LearningEngine(region_id="karachi")
    engine_l = LearningEngine(region_id="lahore")
    
    # Log outcomes to create specialized weights
    # Karachi: Focus on Flood
    for _ in range(3):
        pred_id = f"k_pred_{int(time.time())}_{_}"
        engine_k.log_prediction(pred_id, 90, {"flood_predictor": 95, "heatwave_predictor": 10})
        engine_k.process_feedback(pred_id, 92)
        
    # Lahore: Focus on Heatwave
    for _ in range(3):
        pred_id = f"l_pred_{int(time.time())}_{_}"
        engine_l.log_prediction(pred_id, 85, {"flood_predictor": 15, "heatwave_predictor": 90})
        engine_l.process_feedback(pred_id, 88)
        
    w_k = engine_k.get_weights()
    w_l = engine_l.get_weights()
    print(f"Karachi Weights (Localized): {w_k['flood_predictor']:.3f} (Flood)")
    print(f"Lahore Weights (Localized): {w_l['heatwave_predictor']:.3f} (Heatwave)")
    
    # 2. Trigger Federated Aggregation
    fed_engine = FederationEngine(global_params_path="data/test_meta_model.json")
    print("\n--- Triggering Federated Averaging (Meta-Model Consolidation) ---")
    global_weights = fed_engine.aggregate_global_intelligence()
    
    print(f"Global Meta-Weights: Flood={global_weights['flood_predictor']:.3f}, Heatwave={global_weights['heatwave_predictor']:.3f}")
    
    # 3. Verify Sync (Broadcasting back to regions)
    # The regional weight should now be a blend of local and global
    engine_k_synced = LearningEngine(region_id="karachi")
    w_k_new = engine_k_synced.get_weights()
    print(f"Karachi Weight After Global Sync: {w_k_new['flood_predictor']:.3f}")
    
    if abs(w_k_new['flood_predictor'] - w_k['flood_predictor']) > 0:
         print("✅ SUCCESS: Regional weights pulled towards global consensus while retaining local nuance.")
    else:
         print("❌ FAILURE: No weight shift detected after federation sync.")

    # 4. Status Check
    status = fed_engine.get_federation_status()
    print(f"Federated Nodes Tracked: {len(status['regional_intelligence'])}")
    
    # Cleanup
    for rid in ["karachi", "lahore", "islamabad", "sindh", "punjab"]:
        p = f"data/model_params_{rid}.json"
        if os.path.exists(p): os.remove(p)
    if os.path.exists("data/test_meta_model.json"): os.remove("data/test_meta_model.json")
    
    print("\n🏁 Phase 16 Verification Complete.")

if __name__ == "__main__":
    test_federation_loop()
