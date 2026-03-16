@echo off
title FORGE Fitness
color 0A
echo.
echo  ==========================================
echo   FORGE FITNESS  -  Starting Up
echo  ==========================================
echo.

:: Kill old processes on ports 3000 and 5001
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 "') do taskkill /PID %%a /F >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5001 "') do taskkill /PID %%a /F >nul 2>nul

:: Clear Next.js lock
if exist "E:\forge-fitness\frontend\.next\dev\lock" del /f /q "E:\forge-fitness\frontend\.next\dev\lock" >nul 2>nul

:: Start Backend
echo  [1/2] Starting Backend API on :5001 ...
start "FORGE Backend" cmd /k "E: && cd E:\forge-fitness\backend && node src/server.js"
timeout /t 4 /nobreak >nul

:: Start Frontend
echo  [2/2] Starting Frontend on :3000 ...
start "FORGE Frontend" cmd /k "E: && cd E:\forge-fitness\frontend && npm run dev"
timeout /t 12 /nobreak >nul

:: Open browser
start http://localhost:3000

echo.
echo  ==========================================
echo   FORGE FITNESS IS LIVE!
echo  ==========================================
echo.
echo   Site:    http://localhost:3000
echo   API:     http://localhost:5001/health
echo.
echo   Admin:   admin@forgefitness.com   /  ForgeAdmin@2026!
echo   Member:  demo@forgefitness.com    /  Member@123
echo   Trainer: marcus@forgefitness.com  /  Trainer@123
echo.
pause
