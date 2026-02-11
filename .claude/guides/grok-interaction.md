# Grok Interaction Guide

This guide documents how Claude and agents should interact with Grok via Playwright browser automation.

---

## Training Mode

```
GROK_TRAINING_MODE: true
```

**While training mode is true:**
- Show the user the exact prompt BEFORE sending to Grok
- Wait for user approval before sending
- Confirm each step with the user
- Report what you see after each action

**When to disable:** User will manually set to false after confirming the process works reliably.

---

## When to Consult Grok

- Research Agent at loop 4 (mandatory alternative perspective)
- Complex architectural decisions needing second opinion
- Breaking failure loops when web search is insufficient
- User explicitly requests Grok consultation

---

## Critical Safety Rules

### Stop and Ask Rule

If ANYTHING unexpected happens during Grok interaction:
- Empty snapshot when expecting content
- Timeout error
- Element not found
- Any error or uncertainty

**STOP IMMEDIATELY.** Describe what you are seeing to the user. Do NOT try alternative approaches. Do NOT send additional messages. Wait for user guidance.

### Single Message Rule

Maximum ONE message attempt per Grok consultation. If it fails or behaves unexpectedly, STOP and ask user. Never retry or send multiple messages autonomously.

### Plain Text Only

Type text exactly as a human would. No markdown formatting characters:
- No asterisks for bold
- No backticks for code
- No hash symbols for headers
- No dashes for bullet points

Just plain sentences and paragraphs.

---

## Browser Navigation Steps

### Step 1: Navigate to Grok

```
mcp__playwright__browser_navigate
url: https://grok.com
```

### Step 2: Take Snapshot and Verify Logged In

```
mcp__playwright__browser_snapshot
```

Look for:
- Button with "pfp" (profile picture) indicates logged in
- If not logged in, STOP and ask user

### Step 3: Close Promotional Banners

Grok may show banners like:
- "Connect your X account"
- "Grok Imagine Upgrades"

Click the "Close" button on each banner to dismiss.

### Step 4: Click the Input Area

```
mcp__playwright__browser_click
element: Chat input paragraph
ref: [the paragraph element with "How can I help you today?"]
```

**CRITICAL: The snapshot after clicking may come back empty or minimal. This is NORMAL. The input is focused and ready. Do NOT interpret this as failure. Do NOT try alternative approaches. Proceed to typing.**

### Step 5: Type the Prompt (Plain Text)

```
mcp__playwright__browser_type
ref: [same paragraph ref]
text: [your plain text prompt - NO MARKDOWN]
submit: true
```

If you get a timeout error, take a snapshot anyway. The text may have been entered successfully despite the error.

### Step 6: Wait for Response

```
mcp__playwright__browser_wait_for
time: 15
```

Use 15-30 seconds depending on prompt complexity.

### Step 7: Capture Response

```
mcp__playwright__browser_snapshot
```

The response will appear in the snapshot as paragraphs, lists, and headings.

---

## Continuing Conversations

### Keep Browser Open

After receiving a response, do NOT close the browser if follow-up questions are likely. Leave it open and inactive.

### Reopening Previous Conversations

Previous conversations appear in Grok's History sidebar on the left. To continue a previous conversation:

1. Navigate to grok.com
2. Look in History section for the conversation title
3. Click the conversation link to reopen
4. Context is preserved - Grok remembers the previous exchange

---

## Troubleshooting

| Symptom | Cause | Action |
|---------|-------|--------|
| Empty snapshot after clicking input | Normal behavior | Proceed to type |
| Timeout on type command | May still have worked | Take snapshot to check |
| Text appears with markdown rendered | You included markdown chars | Clear and retype as plain text |
| Grok not responding | May be rate limited | STOP and ask user |
| Login prompt appears | Session expired | STOP and ask user to log in |

---

## Example: Successful Consultation

```
1. Navigate to grok.com
2. Snapshot - see pfp button (logged in)
3. Close any promo banners
4. Click input area (ref=e187)
5. Snapshot shows minimal/empty - THIS IS OK
6. Type plain text prompt with submit: true
7. Timeout error appears - take snapshot anyway
8. Snapshot shows text IS in input field
9. If not auto-submitted, click Submit button
10. Wait 15 seconds
11. Snapshot captures Grok's response
12. Report response to user
13. Keep browser open for follow-ups
```

---

## References

- Research Agent: `.claude/agents/research.md` (references this guide for Grok consultation)
- CLAUDE.md: Project instructions (references this guide)

---

Last updated: 2026-01-30
Training mode: true (user will disable when ready)
