# IQ2 Model Direct Communication

## Quick Reference

**To talk to IQ2 directly (not as Explorer persona):**

```
Ask IQ2: [your question]
What does IQ2 think about...
Consult IQ2 on...
```

The AI will handle the API call to http://127.0.0.1:8080 and return IQ2's response.

---

## Server Setup

**Start IQ2 server:**
```bash
start "IQ2 Server" E:/llamacpp/bin/llama-server.exe -m E:/llamacpp/models/minimax-m2.1-PRISM-IQ2_M.gguf -ngl 18 -c 8192 --port 8080 --temp 0.7 --top_p 0.95 --top_k 40 --dry-multiplier 0.5 --dry-base 2.0
```

**Verify running:**
```bash
curl -s http://127.0.0.1:8080/health
```

---

## IQ2 vs Explorer

| | IQ2 (Model) | Explorer (Persona) |
|---|-------------|-------------------|
| **What is it?** | Raw MiniMax model | Expert scenario analyst |
| **Use for** | Any question, creative tasks, analysis | "What if" scenarios, consequences |
| **How to invoke** | "Ask IQ2:..." | "Explorer, what if..." |
| **Chain of thought** | Can show reasoning | Outputs only final analysis |

---

## API Details (For AI)

### Option A: llama-cli (Recommended - Better VRAM)

**Preferred method** - Uses `--single-turn` flag to exit after response:

```bash
E:/llamacpp/bin/llama-cli.exe \
  -m E:/llamacpp/models/minimax-m2.1-PRISM-IQ2_M.gguf \
  -ngl 18 -c 8192 \
  --temp 0.7 --top_p 0.95 --top_k 40 \
  --dry-multiplier 0.5 --dry-base 2.0 \
  -n 512 \
  --single-turn \    # CRITICAL: Makes it exit after responding
  -p "Your prompt here"
```

**Python wrapper:** `iq2-cli.py`

**VRAM Usage:** ~12-18GB during inference only, then releases

### Option B: llama-server (Not Recommended - High VRAM)

**Endpoint:** `http://127.0.0.1:8080/completion`

**Parameters:**
```json
{
  "prompt": "[user question with Constraint: prefix if needed]",
  "n_predict": 500,
  "temperature": 0.7,
  "top_p": 0.95,
  "top_k": 40
}
```

**VRAM Usage:** ~23GB constant (model stays loaded)

**Note:** Server mode causes high VRAM usage. Use CLI mode for better VRAM management.

**Chain of Thought Suppression (when needed):**
```
**Constraint:** Respond with only your final analysis. Skip all reasoning,
step-by-step breakdown, and intermediate thinking. Do NOT show your thinking
process or say "I'll analyze this." Output ONLY your final conclusions directly.
```
