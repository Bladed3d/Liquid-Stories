@echo off
echo Starting Voice-Type Watchdog...
echo This will monitor and auto-restart the voice services if they crash.
echo.
echo Press Ctrl+C to stop the watchdog.
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0watchdog.ps1"
pause
