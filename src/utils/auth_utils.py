import os
from google.oauth2 import id_token
from google.auth.transport import requests

def verify_google_token(token: str):
    """
    Verifies a Google OAuth2 token.
    """
    try:
        # Get the client ID from environment
        client_id = os.getenv("VITE_GOOGLE_CLIENT_ID")
        if not client_id:
            # Fallback for local testing if not set in shared env
            # In production this MUST be set
             return {
                "name": "Demo User",
                "email": "demo@example.com",
                "picture": "https://lh3.googleusercontent.com/a/default-user=s96-c",
                "sub": "123456789"
            }

        idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)

        # ID token is valid. Get the user's Google Account ID from the decoded token.
        return {
            "name": idinfo.get("name"),
            "email": idinfo.get("email"),
            "picture": idinfo.get("picture"),
            "sub": idinfo.get("sub")
        }
    except ValueError:
        # Invalid token
        return None
