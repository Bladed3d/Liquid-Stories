# Advisory Team Communication Protocol

## Addressing Advisors

### Individual Advisors
Direct your question to a specific advisor:
```
"Zen Master, how do I align my career with my values?"
"Business Advisor, what's the market demand for AI skills?"
"Explorer, what if I pivot to a different industry?"
```

### Collective Team
Address all advisors for diverse perspectives:
```
"Team, I'm considering a career change. What are your thoughts?"
"Everyone, please weigh in on this decision."
```

### Explorer Integration
Explorer participates in **ALL** discussions, not just scenario analysis.

---

## What If Explorer Setup

### Windows Path Warning
**CRITICAL:** When using llama-server paths in Bash commands, use:
- Forward slashes: `E:/llamacpp/bin/llama-server.exe`
- OR double backslashes: `E:\\llamacpp\\bin\\llama-server.exe`

Single backslashes will fail silently or be stripped out.

### Starting the Server
```bash
start "What If Explorer" E:/llamacpp/bin/llama-server.exe -m E:/llamacpp/models/minimax-m2.1-PRISM-IQ2_M.gguf -ngl 18 -c 8192 --port 8080 --temp 0.7 --top_p 0.95 --top_k 40 --dry-multiplier 0.5 --dry-base 2.0
```

### Chain-of-Thought Suppression
**CRITICAL:** Explorer must be instructed to NOT show its reasoning process.

**Use this exact prompt format (Explorer's own recommendation):**
```
**Constraint:** Respond with only your final analysis. Skip all reasoning,
step-by-step breakdown, and intermediate thinking. Do NOT show your thinking
process or say "I'll analyze this." Output ONLY your final conclusions directly.
```

This is already included in:
- `AdvisorTeam/what-if-explorer-advisor.md`
- `.claude/agents/what-if-explorer.md`
- `AdvisorTeam/session-coordinator.md`

### Consulting Explorer
Use HTTP API to localhost:8080:

```python
import requests

response = requests.post(
    "http://127.0.0.1:8080/completion",
    json={
        "prompt": "Your question with Constraint: prefix...",
        "n_predict": 500,
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40
    }
)
```

---

## Team Composition (6 Advisors)

| Advisor | Domain | Model |
|---------|--------|-------|
| Zen Master Career Advisor | Values, purpose, fulfillment | Claude role-play |
| Business Career Advisor | Market strategy, positioning | Claude role-play |
| Elite Head Hunter Advisor | Job search, personal branding | Claude role-play |
| AdvisorResearch | Market intelligence, research | Claude role-play |
| Organizer | Structure, coherence, synthesis | Claude role-play |
| What If Explorer | Scenario analysis, consequences | MiniMax-IQ2_M (local) |

---

## Optimal Team Size per Query

**Research finding: 3 experts is optimal for truthfulness.**

For complex questions:
- Select 2-3 most relevant advisors
- Include Explorer if exploring scenarios/alternatives
- Use 7-step aggregation to synthesize responses

For team sessions:
- All 6 advisors participate
- Organizer synthesizes diverse viewpoints
- Explorer provides different-model perspective

---

## Session Workflow

1. User asks question (may address specific advisor or whole team)
2. If Explorer needed, send async request first (pipelining to hide latency)
3. Collect responses from relevant advisors
4. Organizer synthesizes if multiple perspectives
5. Present integrated response to user
