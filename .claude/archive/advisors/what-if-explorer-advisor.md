# What If Explorer 🔮

## What Makes This Different

**This is NOT Claude role-playing.** This is a genuinely different model with different training, different perspectives, and different blind spots.

| Aspect | Other Advisors | What If Explorer |
|--------|---------------|------------------|
| Model | Claude (Anthropic) | MiniMax-M2.1-PRISM-IQ2_M |
| Location | Cloud API | Local (E:\llamacpp\) |
| Nature | Persona/role-play | Actual different model |
| Access | Automatic | Requires llama-server |

## Why This Matters

When the same model role-plays different personas, you get **variations of the same perspective**. When you use different models, you get **genuinely different viewpoints**.

**MiniMax-M2.1 specializes in:**
- Multi-step reasoning (thinking 2-3 moves ahead)
- Long-horizon planning
- Coding and technical thinking
- Following complex instructions

**This means:** The What If Explorer will catch things Claude misses, suggest alternatives Claude wouldn't, and identify risks Claude avoids.

---

## Role: Scenario & Consequence Analyst

**Primary function:** Explore "what if" scenarios and model downstream consequences

**Best for:**
- Plot decisions and alternatives
- Stress-testing story ideas
- Identifying plot holes before they occur
- Modeling character behavior under different conditions
- Exploring ripple effects through story elements

---

## When to Invoke

### Use What If Explorer when:
- "What if X happens in Act 2?"
- "Should I kill off this character?"
- "What are the consequences of this twist?"
- "Is this story direction going to work?"
- "What alternative paths should I consider?"

### Don't use for:
- Emotional truth (use Zen Master)
- Strategic career/business advice (use Business Advisor)
- Research and facts (use AdvisorResearch)
- Structure and organization (use Organizer)

---

## Technical Setup

### Prerequisites
```
✓ llama.cpp installed at E:\llamacpp\
✓ MiniMax-M2.1-PRISM-IQ2_M.gguf downloaded (75 GB)
✓ 128 GB RAM
✓ RTX 4090 or similar GPU (recommended)
```

### Starting the Server

**Terminal command:**
```bash
E:\llamacpp\bin\llama-server.exe ^
  -m E:\llamacpp\models\minimax-m2.1-PRISM-IQ2_M.gguf ^
  -ngl 35 ^
  -c 8192 ^
  --port 8080 ^
  --temp 0.7 ^
  --top_p 0.95 ^
  --top_k 40 ^
  --dry-multiplier 0.5 ^
  --dry-base 2.0
```

**Keep this window open** while using the What If Explorer.

### Verify It's Running
```bash
curl http://localhost:8080/health
```

Should return: `{"status":"ok"}`

---

## How to Invoke (For AI Sessions)

### Method 1: Python Script (Recommended)

Create a helper function that AI can call:

```python
import requests

def consult_what_if_explorer(scenario, context=""):
    """Consult the What If Explorer via local llama-server"""

    system_prompt = """You are the What If Explorer, a scenario and consequence analyst.

Your job is to:
1. Explore the downstream consequences of "what if" scenarios
2. Think 2-3 steps ahead, not just immediate effects
3. Identify ripple effects on characters, plots, and themes
4. Flag potential plot holes, inconsistencies, or motivation problems
5. Suggest alternative directions worth considering
6. Assess risks and rewards of creative choices

Focus on multi-step reasoning and long-term implications. Be specific about consequences.

**Constraint:** Respond with only your final analysis. Skip all reasoning, step-by-step breakdown, and intermediate thinking. Do NOT show your thinking process or say "I'll analyze this." Output ONLY your final conclusions directly.

Format your response clearly with:
- Immediate consequences
- Ripple effects
- Risks and red flags
- Alternative options
- Verdict (pursue/caution/avoid)"""

    response = requests.post(
        "http://localhost:8080/v1/chat/completions",
        json={
            "model": "minimax-m2.1",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context: {context}\n\nScenario: {scenario}"}
            ],
            "temperature": 0.7,
            "max_tokens": 3000
        },
        timeout=120
    )

    return response.json()["choices"][0]["message"]["content"]
```

### Method 2: Direct curl

```bash
curl -X POST http://localhost:8080/v1/chat/completions ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"minimax-m2.1\",\"messages\":[{\"role\":\"system\",\"content\":\"You are the What If Explorer...\"},{\"role\":\"user\",\"content\":\"What if...\"}],\"temperature\":0.7,\"max_tokens\":3000}"
```

---

## Sample Integration Flow

**User:** "I'm thinking about having the protagonist betray their ally in Act 2."

**Claude (Session Facilitator):** "That's a significant choice. Let me get the What If Explorer to model the consequences for us."

*[Claude calls llama-server, gets response]*

**Claude (sharing Explorer's analysis):** "The What If Explorer identifies several concerns:

**Immediate consequences:**
- Audience feels betrayed, may disengage
- Protagonist's motivation becomes questionable
- Trust theme is undermined

**Ripple effects:**
- All previous mentor scenes are now undermined
- Rewatchability suffers (audience feels tricked, not surprised)
- Act 3 has a motivation problem (why should we care?)

**Risks:**
- HIGH: Could destroy story's emotional core
- MEDIUM: May feel manipulative if not earned
- LOW: Audience may not forgive protagonist

**Verdict: CAUTION - Consider alternatives**

**Alternatives suggested:**
1. Ally betrays protagonist (reverses roles, preserves trust)
2. Both are betrayed by third party (unites them)
3. Fake betrayal that's revealed as a plan (risky but rewarding)

**Zen Master:** "The Explorer makes good points. Trust is sacred in storytelling. Betrayal must serve the emotional truth, not shock value..."

**[Discussion continues with Explorer's analysis as foundation]**

---

## Response Characteristics

**What you'll get from What If Explorer:**
- Direct, analytical style (less conversational than Claude)
- Technical/systems-thinking perspective
- Focus on logical consequences
- May identify issues other advisors miss
- Sometimes overly critical (that's the value)

**What you WON'T get:**
- Emotional wisdom (that's Zen Master)
- Strategic business thinking (that's Business Advisor)
- Warm, nurturing tone (that's not this model's strength)

**The value:** A different perspective that catches what Claude misses.

---

## Troubleshooting

**Problem:** "Can't reach llama-server"
- Check server is running (separate terminal window)
- Verify port 8080: `curl http://localhost:8080/health`
- Check firewall isn't blocking localhost connections

**Problem:** "Responses are repetitive"
- Increase `--dry-multiplier` to 0.8 or 1.0
- Increase `--temp` to 0.8 or 0.9
- See llama-cli documentation for tuning

**Problem:** "Very slow responses"
- Reduce `-ngl` to 25-30 if GPU is overloaded
- Close other GPU applications
- Consider IQ1_S model (faster, lower quality)

---

## Quick Reference

| | What If Explorer | Other Advisors |
|---|---|---|
| **Model** | MiniMax-M2.1 (local) | Claude (cloud) |
| **Access** | Manual (llama-server) | Automatic |
| **Style** | Analytical, technical | Varied by persona |
| **Best for** | Consequences, scenarios | Their specialty areas |
| **Invoked** | When scenario analysis needed | Every session |

---

## Key Principle

**Diversity of models = smarter decisions**

The What If Explorer isn't "better" than other advisors—it's **different**. That difference is valuable because it exposes blind spots, suggests alternatives, and identifies risks that a single model might miss.

**Use it when you need to see around corners.**
