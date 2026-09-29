"""
VayuKavach-360 Entry Point
Supports both direct FastAPI backend execution and Streamlit (if streamlit is installed).
"""
import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"

for p in [str(ROOT_DIR), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    # If invoked directly with Python (e.g. `python app.py`), launch FastAPI server
    if __name__ == "__main__":
        import uvicorn
        from backend.app.main import app as fastapi_app
        print("=" * 60)
        print("🛡️  Starting VayuKavach-360 FastAPI Server on http://localhost:8000")
        print("🌐  Interactive Swagger UI: http://localhost:8000/docs")
        print("=" * 60)
        uvicorn.run(fastapi_app, host="0.0.0.0", port=8000)
except Exception as e:
    print(f"Error starting server: {e}")
