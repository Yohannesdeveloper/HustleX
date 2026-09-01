@echo off
title HustleX Scale Stack
echo.
echo  HustleX Production Scale Stack
echo  ==============================
echo.

cd /d "%~dp0"

echo [1/4] Starting Redis...
start "HustleX Redis" cmd /k "cd backend && npm run scale:redis"
timeout /t 5 /nobreak > nul

echo [2/4] Starting API server...
start "HustleX API" cmd /k "cd backend && npm run dev:stable"
timeout /t 4 /nobreak > nul

echo [3/4] Starting background worker...
start "HustleX Worker" cmd /k "cd backend && npm run worker"
timeout /t 2 /nobreak > nul

echo [4/4] Starting frontend...
start "HustleX Frontend" cmd /k "npm run dev"

echo.
echo  All services starting in separate windows.
echo  Frontend: http://localhost:5173
echo  API:      auto-detected via port.json (usually :5000)
echo  Health:   http://localhost:5000/api/health/detailed
echo.
echo  Press any key to close this launcher (services keep running)...
pause > nul
