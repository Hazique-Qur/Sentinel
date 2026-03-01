import os
import sys
import logging

# Ensure PYTHONPATH is correct
sys.path.append(os.getcwd())

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Diagnostic")

try:
    print("DIAGNOSTIC: Importing app...")
    from src.api.main import app
    print("DIAGNOSTIC: App imported.")
    
    import uvicorn
    print("DIAGNOSTIC: Starting uvicorn check on port 8000...")
    # Run uvicorn but tell it to stop immediately or just check build
    # We'll try to start it and then kill it if it doesn't fail
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info", loop="auto")
except Exception as e:
    print(f"DIAGNOSTIC FAILURE: {e}")
    import traceback
    traceback.print_exc()
