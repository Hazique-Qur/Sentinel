import os
import sys

# Ensure the project root is in sys.path
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.append(path)

from src.api.main import app
