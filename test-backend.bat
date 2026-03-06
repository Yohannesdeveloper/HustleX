@echo off
echo Testing Backend Server Startup...
cd backend
echo Current directory: %CD%
echo.
echo Checking Node version:
node --version
echo.
echo Checking npm version:
npm --version
echo.
echo Starting server...
node server.js
