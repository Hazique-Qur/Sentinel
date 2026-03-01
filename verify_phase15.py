import sys
import os
import json
import time

# Ensure src can be found
sys.path.append(os.getcwd())

from src.models.learning_engine import LearningEngine

def test_learning_loop():
    print("🚀 Starting Phase 15: Adaptive Learning Verification...")
    
    # 1. Initialize Engine
    engine = LearningEngine(persistence_path="data/test_params.json")
    initial_weights = engine.get_weights().copy()
    print(f"Initial Weights: {initial_weights}")
    
    # 2. Log a prediction (e.g., Risk was 70, primarily flood)
    pred_id = "test_prediction_001"
    components = {
        "flood_predictor": 85,
        "storm_predictor": 20,
        "heatwave_predictor": 10,
        "vulnerability_adjustment": 50
    }
    engine.log_prediction(pred_id, 70, components)
    print(f"Logged prediction {pred_id} with score 70")
    
    # 3. Submit Ground Truth (Actual Outcome was MUCH higher, e.g., 90)
    # This means the model under-predicted (especially the dominant factor)
    print("\n--- Simulating Feedback: Under-prediction Error ---")
    engine.process_feedback(pred_id, 90)
    
    new_weights = engine.get_weights()
    print(f"New Weights: {new_weights}")
    
    # Verify that flood weight increased (since it was the dominant contributor to an under-prediction)
    if new_weights["flood_predictor"] > initial_weights["flood_predictor"]:
        print("✅ SUCCESS: Flood weight increased after under-prediction.")
    else:
        print("❌ FAILURE: Flood weight did not increase as expected.")
        
    # 4. Global Metrics Check
    perf = engine.get_performance_report()
    print(f"\nPerformance Metrics: {perf['metrics']}")
    
    if perf['metrics']['total_outcomes'] == 1:
        print("✅ SUCCESS: Total outcomes tracked correctly.")
    
    # Cleanup
    if os.path.exists("data/test_params.json"):
        os.remove("data/test_params.json")
    
    print("\n🏁 Phase 15 Verification Complete.")

if __name__ == "__main__":
    test_learning_loop()
