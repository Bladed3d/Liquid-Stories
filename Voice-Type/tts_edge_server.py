"""
Edge TTS FastAPI Server
Text-to-speech service using Microsoft Edge TTS for advisor responses
Runs on port 8001, exposed via Cloudflare tunnel at tts.hivemindai.org
"""

import asyncio
import base64
import io
import json
import logging
import time
from pathlib import Path
from typing import Optional, Tuple, List, Dict, Any

import edge_tts
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

# LED Breadcrumb System (4300-4399: TTS operations)
class BreadcrumbTrail:
    """Simple LED breadcrumb system for debugging"""

    def __init__(self, component: str):
        self.component = component
        self.log_file = Path(__file__).parent.parent / "breadcrumb-debug.log"

    def light(self, led_id: int, event: str, context: dict = None):
        """Light up an LED breadcrumb"""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        msg = f"[{timestamp}] LED-{led_id} ✓ {self.component}.{event}"
        if context:
            msg += f" | {json.dumps(context)}"
        logging.info(msg)
        self._write_log(msg)

    def fail(self, led_id: int, error: Exception):
        """Mark a failed breadcrumb"""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        msg = f"[{timestamp}] LED-{led_id} ❌ {self.component} | ERROR: {str(error)}"
        logging.error(msg)
        self._write_log(msg)

    def _write_log(self, msg: str):
        """Append to breadcrumb log file"""
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(msg + "\n")
        except Exception as e:
            logging.error(f"Failed to write breadcrumb log: {e}")


# LED Range: 4300-4399 (TTS operations)
LED_REQUEST_START = 4300
LED_TEXT_TRUNCATED = 4301
LED_API_CALL_START = 4302
LED_AUDIO_GENERATED = 4303
LED_WORD_BOUNDARIES_CAPTURED = 4304
LED_WITH_BOUNDARIES_START = 4305
LED_WITH_BOUNDARIES_SUCCESS = 4306
LED_REQUEST_ERROR = 4390
LED_API_ERROR = 4391

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Edge TTS Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Breadcrumb trail
trail = BreadcrumbTrail("EdgeTTSService")

# Voice mapping for advisors
# Supports both short IDs (zen, business) and full IDs (zen-master, business-advisor)
ADVISOR_VOICES = {
    # Short IDs
    "zen": "en-US-GuyNeural",              # Ravi - Calm male voice
    "business": "en-US-ChristopherNeural", # David - Professional male voice
    "researcher": "en-US-JennyNeural",     # Vera - Clear female voice
    "organizer": "en-US-AriaNeural",       # Sarah - Warm female voice
    "team": "en-US-GuyNeural",             # Team mode uses calm male voice
    # Full IDs (from app AdvisorType)
    "zen-master": "en-US-GuyNeural",       # Ravi
    "business-advisor": "en-US-ChristopherNeural",  # David
    "risk-analyst": "en-US-DavisNeural",   # Marcus - Analytical male voice
    "image-advisor": "en-US-JennyNeural",  # Image advisor
    "app-help": "en-US-AriaNeural",        # App help
}

# Default voice
DEFAULT_VOICE = "en-US-GuyNeural"

# Text limit (5000 chars max)
MAX_TEXT_LENGTH = 5000


# Request models
class SynthesizeRequest(BaseModel):
    text: str
    voice: Optional[str] = None


async def generate_speech(text: str, voice: str) -> bytes:
    """
    Generate speech audio using Edge TTS

    Args:
        text: Text to synthesize
        voice: Voice ID (e.g., "en-US-GuyNeural")

    Returns:
        MP3 audio bytes

    Raises:
        Exception: If TTS generation fails
    """
    trail.light(LED_API_CALL_START, "tts_generation_started", {
        "voice": voice,
        "text_length": len(text),
        "text_preview": text[:100]
    })

    try:
        # Create TTS communicator
        communicate = edge_tts.Communicate(text, voice)

        # Accumulate audio chunks
        audio_data = io.BytesIO()

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])

        audio_bytes = audio_data.getvalue()

        if len(audio_bytes) == 0:
            raise ValueError("Edge TTS returned empty audio")

        trail.light(LED_AUDIO_GENERATED, "audio_generated_success", {
            "audio_bytes": len(audio_bytes),
            "voice": voice
        })

        return audio_bytes

    except Exception as e:
        trail.fail(LED_API_ERROR, e)
        raise


async def generate_speech_with_boundaries(text: str, voice: str) -> Tuple[bytes, List[Dict[str, Any]]]:
    """
    Generate speech audio with word boundary metadata

    Args:
        text: Text to synthesize
        voice: Voice ID (e.g., "en-US-GuyNeural")

    Returns:
        Tuple of (MP3 audio bytes, word boundaries list)
        Word boundaries format: [{"text": str, "offsetMs": int, "durationMs": int}, ...]

    Raises:
        Exception: If TTS generation fails
    """
    trail.light(LED_WITH_BOUNDARIES_START, "tts_with_boundaries_started", {
        "voice": voice,
        "text_length": len(text),
        "text_preview": text[:100]
    })

    try:
        # Create TTS communicator with word boundary events enabled
        communicate = edge_tts.Communicate(text, voice, boundary='WordBoundary')

        # Accumulate audio chunks and word boundaries
        audio_data = io.BytesIO()
        word_boundaries: List[Dict[str, Any]] = []

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                # Convert 100ns ticks to milliseconds (divide by 10,000)
                word_boundaries.append({
                    "text": chunk["text"],
                    "offsetMs": chunk["offset"] // 10000,
                    "durationMs": chunk["duration"] // 10000
                })

        audio_bytes = audio_data.getvalue()

        if len(audio_bytes) == 0:
            raise ValueError("Edge TTS returned empty audio")

        trail.light(LED_WORD_BOUNDARIES_CAPTURED, "word_boundaries_captured", {
            "audio_bytes": len(audio_bytes),
            "word_count": len(word_boundaries),
            "voice": voice
        })

        return audio_bytes, word_boundaries

    except Exception as e:
        trail.fail(LED_API_ERROR, e)
        raise


@app.on_event("startup")
async def startup_event():
    """Log startup"""
    logger.info("Edge TTS Server starting on port 8001")
    logger.info(f"Available advisor voices: {list(ADVISOR_VOICES.keys())}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ready",
        "service": "Edge TTS",
        "advisors": list(ADVISOR_VOICES.keys()),
        "max_text_length": MAX_TEXT_LENGTH
    }


@app.get("/voices")
async def list_voices():
    """List available voices"""
    try:
        # Fetch all voices from Edge TTS
        voices = await edge_tts.list_voices()

        # Filter to English voices only
        english_voices = [
            {
                "id": v["ShortName"],
                "name": v["FriendlyName"],
                "gender": v["Gender"],
                "locale": v["Locale"]
            }
            for v in voices
            if v["Locale"].startswith("en-")
        ]

        return {
            "advisor_voices": ADVISOR_VOICES,
            "available_voices": english_voices[:20]  # Return first 20 to keep response reasonable
        }
    except Exception as e:
        logger.error(f"Failed to list voices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch voice list")


@app.post("/synthesize")
async def synthesize(request: SynthesizeRequest):
    """
    Synthesize text to speech

    Args:
        request: { text: string, voice?: string }

    Returns:
        MP3 audio stream
    """
    trail.light(LED_REQUEST_START, "synthesize_request_received", {
        "text_length": len(request.text),
        "voice": request.voice or DEFAULT_VOICE
    })

    try:
        # Truncate text if too long
        text = request.text
        if len(text) > MAX_TEXT_LENGTH:
            trail.light(LED_TEXT_TRUNCATED, "text_truncated", {
                "original_length": len(text),
                "truncated_to": MAX_TEXT_LENGTH
            })
            text = text[:MAX_TEXT_LENGTH]

        # Use provided voice or default
        voice = request.voice or DEFAULT_VOICE

        # Generate audio
        audio_bytes = await generate_speech(text, voice)

        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Length": str(len(audio_bytes)),
                "Content-Disposition": "inline; filename=\"speech.mp3\""
            }
        )

    except ValueError as e:
        trail.fail(LED_REQUEST_ERROR, e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        trail.fail(LED_REQUEST_ERROR, e)
        raise HTTPException(status_code=500, detail="TTS generation failed")


@app.post("/synthesize/advisor/{advisor_id}")
async def synthesize_advisor(advisor_id: str, request: SynthesizeRequest):
    """
    Synthesize text using advisor-specific voice

    Args:
        advisor_id: Advisor identifier (zen, business, researcher, organizer)
        request: { text: string }

    Returns:
        MP3 audio stream
    """
    trail.light(LED_REQUEST_START, "advisor_synthesize_request", {
        "advisor_id": advisor_id,
        "text_length": len(request.text)
    })

    # Validate advisor ID
    if advisor_id not in ADVISOR_VOICES:
        trail.fail(LED_REQUEST_ERROR, ValueError(f"Unknown advisor: {advisor_id}"))
        raise HTTPException(
            status_code=400,
            detail=f"Unknown advisor '{advisor_id}'. Available: {list(ADVISOR_VOICES.keys())}"
        )

    try:
        # Truncate text if too long
        text = request.text
        if len(text) > MAX_TEXT_LENGTH:
            trail.light(LED_TEXT_TRUNCATED, "text_truncated", {
                "original_length": len(text),
                "truncated_to": MAX_TEXT_LENGTH,
                "advisor_id": advisor_id
            })
            text = text[:MAX_TEXT_LENGTH]

        # Get advisor voice
        voice = ADVISOR_VOICES[advisor_id]

        # Generate audio
        audio_bytes = await generate_speech(text, voice)

        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Length": str(len(audio_bytes)),
                "Content-Disposition": f"inline; filename=\"{advisor_id}_speech.mp3\""
            }
        )

    except ValueError as e:
        trail.fail(LED_REQUEST_ERROR, e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        trail.fail(LED_REQUEST_ERROR, e)
        raise HTTPException(status_code=500, detail="TTS generation failed")


@app.post("/synthesize/with-boundaries")
async def synthesize_with_boundaries(request: SynthesizeRequest):
    """
    Synthesize text to speech with word boundary metadata

    Args:
        request: { text: string, voice?: string }

    Returns:
        JSON response with base64 audio and word boundaries
        {
          "audio": "<base64-encoded-mp3>",
          "wordBoundaries": [{"text": str, "offsetMs": int, "durationMs": int}, ...],
          "totalDurationMs": int
        }
    """
    trail.light(LED_REQUEST_START, "synthesize_with_boundaries_request", {
        "text_length": len(request.text),
        "voice": request.voice or DEFAULT_VOICE
    })

    try:
        # Truncate text if too long
        text = request.text
        if len(text) > MAX_TEXT_LENGTH:
            trail.light(LED_TEXT_TRUNCATED, "text_truncated", {
                "original_length": len(text),
                "truncated_to": MAX_TEXT_LENGTH
            })
            text = text[:MAX_TEXT_LENGTH]

        # Use provided voice or default
        voice = request.voice or DEFAULT_VOICE

        # Generate audio with word boundaries
        audio_bytes, word_boundaries = await generate_speech_with_boundaries(text, voice)

        # Base64 encode audio for JSON response
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

        # Calculate total duration from last word boundary
        total_duration_ms = 0
        if word_boundaries:
            last_word = word_boundaries[-1]
            total_duration_ms = last_word["offsetMs"] + last_word["durationMs"]

        trail.light(LED_WITH_BOUNDARIES_SUCCESS, "boundaries_response_sent", {
            "word_count": len(word_boundaries),
            "audio_size": len(audio_bytes),
            "total_duration_ms": total_duration_ms
        })

        return JSONResponse(content={
            "audio": audio_base64,
            "wordBoundaries": word_boundaries,
            "totalDurationMs": total_duration_ms
        })

    except ValueError as e:
        trail.fail(LED_REQUEST_ERROR, e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        trail.fail(LED_REQUEST_ERROR, e)
        raise HTTPException(status_code=500, detail="TTS generation with boundaries failed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
