@echo off
echo ================================================
echo Starting TTS Server (Qwen3-TTS VoiceDesign)
echo ================================================
echo.
echo Activating Python environment...
call D:\Projects\Ai\Liquid-Stories\qwen3-tts-env\Scripts\activate.bat
echo.
echo Changing to Voice-Type directory...
cd /d D:\Projects\Ai\Liquid-Stories\Voice-Type
echo.
echo Starting uvicorn server on port 8001...
echo Server will be available at: http://localhost:8001
echo API docs available at: http://localhost:8001/docs
echo.
uvicorn tts_server:app --host 0.0.0.0 --port 8001
