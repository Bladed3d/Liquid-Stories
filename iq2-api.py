#!/usr/bin/env python3
"""
Simple wrapper for llama-server API.

The model stays loaded in memory for fast repeated calls.
Start the server with: start-explorer.bat
"""

import requests
import sys
import json

# Server configuration
SERVER_URL = "http://127.0.0.1:8080/completion"
TIMEOUT = 120  # seconds

# Generation parameters (matching your working setup)
# CRITICAL: repeat_penalty and repeat_last_n prevent repetition loops
PARAMS = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "repeat_penalty": 1.1,  # Prevents token repetition
    "repeat_last_n": 64,    # Looks back 64 tokens for repetition
    "dry_multiplier": 0.5,
    "dry_base": 2.0,
    "n_predict": 512,
}


def call_iq2(prompt: str, max_tokens: int = 512) -> str:
    """
    Call IQ2 model via llama-server API.

    The model stays loaded in memory, so repeated calls are fast.

    Args:
        prompt: The prompt to send to IQ2
        max_tokens: Maximum tokens to generate

    Returns:
        The generated response text

    Raises:
        RuntimeError: If the API call fails
    """
    # Prepare request
    payload = {
        "prompt": prompt,
        "n_predict": max_tokens,
        "temperature": PARAMS["temperature"],
        "top_p": PARAMS["top_p"],
        "top_k": PARAMS["top_k"],
        "repeat_penalty": PARAMS["repeat_penalty"],
        "repeat_last_n": PARAMS["repeat_last_n"],
        "dry_multiplier": PARAMS["dry_multiplier"],
        "dry_base": PARAMS["dry_base"],
    }

    try:
        # Send request
        response = requests.post(SERVER_URL, json=payload, timeout=TIMEOUT)
        response.raise_for_status()

        # Parse response
        data = response.json()
        return data.get("content", "")

    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            "Cannot connect to llama-server at http://127.0.0.1:8080\n"
            "Start the server with: start-explorer.bat"
        )
    except requests.exceptions.Timeout:
        raise RuntimeError(f"Request timed out after {TIMEOUT} seconds")
    except requests.exceptions.HTTPError as e:
        raise RuntimeError(f"HTTP error: {e}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error: {e}")


def main():
    """CLI entry point"""
    if len(sys.argv) < 2:
        print("Usage: python iq2-api.py 'your prompt here'", file=sys.stderr)
        print("\nMake sure llama-server is running:", file=sys.stderr)
        print("  start-explorer.bat", file=sys.stderr)
        sys.exit(1)

    prompt = sys.argv[1]

    try:
        response = call_iq2(prompt)
        # Write to stdout with UTF-8 encoding
        sys.stdout.buffer.write(response.encode('utf-8'))
        sys.stdout.buffer.flush()
    except RuntimeError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
