@echo off
title VayuKavach-360 Hackathon Launcher
echo ========================================================
echo  Launching VayuKavach-360 Full Stack Application
echo  1. Starting Backend API on http://localhost:8000
echo  2. Starting Next.js Frontend on http://localhost:3000
echo ========================================================
start "VayuKavach-360 Backend" cmd /k "python run_backend.py"
start "VayuKavach-360 Frontend" cmd /k "cd frontend && npm.cmd run dev"
echo Both servers launched in background windows!
echo Open http://localhost:3000 in your browser.
pause
