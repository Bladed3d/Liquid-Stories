@echo off
echo ================================================
echo Starting TTS Server (Edge TTS)
echo ================================================
echo.
echo Checking if port 8001 is in use...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8001.*LISTENING"') do (
    echo Port 8001 is in use by PID %%a. Killing it...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)
echo Port 8001 is free.
echo.
echo Changing to Voice-Type directory...
cd /d D:\Projects\Ai\Liquid-Stories\Voice-Type
echo.
echo Starting Edge TTS server on port 8001...
echo Server will be available at: http://localhost:8001
echo API docs available at: http://localhost:8001/docs
echo Health check: http://localhost:8001/health
echo.
uvicorn tts_edge_server:app --host 0.0.0.0 --port 8001
echo.
echo Server stopped or failed to start.
pause
