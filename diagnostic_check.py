import os
import sys
import logging

try:
    print("DEBUG: Current PYTHONPATH:", os.environ.get("PYTHONPATH"))
    print("DEBUG: Current Working Directory:", os.getcwd())
    
    import uvicorn
    import fastapi
    import dotenv
    print("DEBUG: Core dependencies imported successfully.")
    
    # Try importing internal modules
    from src.utils.auth_utils import verify_google_token
    print("DEBUG: verify_google_token imported.")
    
    from src.api.main import app
    print("DEBUG: main app imported successfully.")
    
    print("DIAGNOSTIC SUCCESS: Backend system ready for execution.")
except Exception as e:
    print(f"DIAGNOSTIC ERROR: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
