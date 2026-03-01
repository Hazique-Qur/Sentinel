import os
from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.utils.auth_utils import verify_google_token
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/verify")
async def verify_auth(payload: dict = Body(...)):
    print(f"DEBUG: Received verification request: {payload.keys()}")
    token = payload.get("credential")
    if not token:
        raise HTTPException(status_code=400, detail="Missing credential")
    
    user_info = verify_google_token(token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
    user_info["plan"] = "free"
    print(f"DEBUG: Verification success for {user_info.get('email')}")
    return {"status": "success", "user": user_info}

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
