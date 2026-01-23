"""
FastAPI server for Qwen3-TTS VoiceDesign model.
Provides text-to-speech synthesis with custom voice descriptions.
"""

import torch
import soundfile as sf
import io
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from qwen_tts import Qwen3TTSModel

app = FastAPI(
    title="Qwen3-TTS VoiceDesign Server",
    description="Text-to-speech synthesis with custom voice descriptions",
    version="1.0.0",
)

# Global model instance
model = None


@app.on_event("startup")
async def load_model():
    """Load the VoiceDesign model at startup."""
    global model
    print("Loading Qwen3-TTS VoiceDesign model...")
    print("Model: Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign")
    print("Device: cuda:0")
    print("Dtype: bfloat16")

    try:
        model = Qwen3TTSModel.from_pretrained(
            "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",
            device_map="cuda:0",
            dtype=torch.bfloat16,
            # NOTE: flash_attention_2 not available, skip attn_implementation
        )
        print("[OK] Model loaded successfully")
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
        raise


class TTSRequest(BaseModel):
    """Request model for TTS synthesis."""
    text: str
    language: str = "English"
    instruct: Optional[str] = None  # Voice description


# Advisor voice descriptions - each creates a unique, consistent voice
ADVISOR_VOICES = {
    "business": (
        "A confident, mature male voice with a deep, authoritative timbre. "
        "Professional and measured pace, like a seasoned executive mentor "
        "who speaks with clarity and conviction."
    ),
    "zen": (
        "A warm, gentle female voice with a calm, meditative quality. "
        "Slightly lower register, unhurried pace, radiating compassion "
        "and wisdom like a meditation teacher creating a safe space."
    ),
    "researcher": (
        "A bright, articulate male voice with an intellectual curiosity. "
        "Clear enunciation, moderate pace, the voice of someone who finds "
        "genuine excitement in discovery and explaining complex ideas simply."
    ),
    "organizer": (
        "A clear, precise female voice with a warm professionalism. "
        "Natural pace, organized delivery, like a trusted colleague who "
        "helps you see structure and clarity in chaos."
    ),
    "image": (
        "An enthusiastic, creative male voice with expressive energy. "
        "Slightly faster pace, descriptive and engaging, like an art "
        "director who sees vivid pictures in everything."
    ),
}


@app.post("/synthesize")
async def synthesize(request: TTSRequest):
    """
    Generate speech from text using a described voice.

    Args:
        request: TTSRequest with text, language, and optional voice description

    Returns:
        WAV audio file (audio/wav)

    Raises:
        HTTPException: If text is missing or generation fails
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Text required")

    # Truncate to prevent long generation times
    text = request.text[:5000]

    # Default voice description if none provided
    instruct = request.instruct or "A clear, natural English speaking voice."

    try:
        print(f"Synthesizing: {len(text)} chars, language={request.language}")
        print(f"Voice: {instruct[:80]}...")

        wavs, sr = model.generate_voice_design(
            text=text,
            language=request.language,
            instruct=instruct,
        )

        print(f"[OK] Generated audio: {len(wavs)} waveforms, sr={sr}")

        # Convert numpy array to WAV bytes
        buffer = io.BytesIO()
        sf.write(buffer, wavs[0], sr, format="WAV")
        buffer.seek(0)

        return Response(
            content=buffer.read(),
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=speech.wav"}
        )

    except Exception as e:
        print(f"[ERROR] TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


@app.post("/synthesize/advisor/{advisor_id}")
async def synthesize_advisor(advisor_id: str, request: TTSRequest):
    """
    Generate speech using advisor-specific voice description.

    Args:
        advisor_id: One of: business, zen, researcher, organizer, image
        request: TTSRequest with text and language

    Returns:
        WAV audio file (audio/wav)

    Raises:
        HTTPException: If advisor_id is unknown or generation fails
    """
    voice_description = ADVISOR_VOICES.get(advisor_id)
    if not voice_description:
        available = ", ".join(ADVISOR_VOICES.keys())
        raise HTTPException(
            status_code=404,
            detail=f"Unknown advisor: {advisor_id}. Available: {available}"
        )

    # Override instruct with advisor's voice description
    request.instruct = voice_description
    return await synthesize(request)


@app.get("/voices")
async def list_voices():
    """
    List available advisor voice profiles.

    Returns:
        JSON with model info and advisor voice descriptions
    """
    return {
        "model": "Qwen3-TTS-12Hz-1.7B-VoiceDesign",
        "description": "VoiceDesign (unlimited voices from text descriptions)",
        "advisor_profiles": {k: v for k, v in ADVISOR_VOICES.items()},
        "note": "Any voice can be created by passing a description in the 'instruct' field",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "model": "Qwen3-TTS-12Hz-1.7B-VoiceDesign",
        "model_loaded": model is not None,
    }
