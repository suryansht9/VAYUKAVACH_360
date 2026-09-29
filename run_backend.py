"""
VayuKavach-360 Backend Runner
Starts FastAPI application server on http://localhost:8000
"""
import sys
import os
from pathlib import Path

# Add backend and root to sys.path
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"

for p in [str(ROOT_DIR), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

import uvicorn
from backend.app.main import app

if __name__ == "__main__":
    print("=" * 60)
    print("🛡️  Starting VayuKavach-360 Command Platform Backend API")
    print("🌐  API Docs URL: http://localhost:8000/docs")
    print("⚡  FastAPI Root: http://localhost:8000/")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
