import sys
print("STEP 1: Starting isolated import test...")

try:
    import fastapi
    print("STEP 2: FastAPI imported.")
    import uvicorn
    print("STEP 3: Uvicorn imported.")
    import dotenv
    print("STEP 4: Dotenv imported.")
    from src.utils.auth_utils import verify_google_token
    print("STEP 5: Core utils imported.")
    print("Isolated test successful.")
except Exception as e:
    print(f"Isolated test failed: {e}")
    sys.exit(1)
