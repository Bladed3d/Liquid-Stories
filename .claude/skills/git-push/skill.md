---
name: git-push
description: Push pending commits to origin with build verification and ClarityEQ-Feature-List update. Run this whenever Derek is ready to push. Handles build check, documents what shipped, then pushes.
user_invocable: true
---

# git-push: Build → Document → Push

**Usage:** `/git-push`

No arguments needed. Works on whatever commits are pending in `advisor-team-mvp/`.

---

## Step 0 — MANDATORY: Confirm browser testing happened this session

**This step cannot be skipped. No exceptions.**

Before checking commits, ask Derek:

```
Before I push — has this code been tested in the browser this session?

Required evidence (at least one):
- A Chrome MCP screenshot showing the feature working on localhost:3000
- A Quality agent APPROVED verdict from this session

If neither exists, I will not push. Type "tested: [what you tested]" to confirm,
or "skip test gate" to override (you own that decision).
```

**Wait for Derek's response.**

- If Derek confirms testing → continue to Step 1
- If Derek says "skip test gate" → note it as Derek's explicit override, continue to Step 1
- If Derek says nothing was tested → **STOP. Do not push.** Tell Derek: "Run the feature on localhost:3000 first. Take a screenshot. Then run /git-push again."

---

## Step 1 — Check what's pending

```bash
cd D:/Projects/Ai/Liquid-Stories/advisor-team-mvp && git log origin/main..HEAD --pretty=format:"%h|%ad|%s" --date=short
```

Also get the count:
```bash
cd D:/Projects/Ai/Liquid-Stories/advisor-team-mvp && git rev-list origin/main..HEAD --count
```

**If count is 0**: Tell Derek "Nothing pending — you're already up to date with origin." Stop here.

**If commits exist**: Show them to Derek in a clean list:
```
Pending commits ([N] total):
  abc1234 | 2026-03-08 | feat: painting interview system
  def5678 | 2026-03-08 | fix: sandbox guard for writer mode
```

Then continue — do NOT wait for confirmation. The push is already decided.

---

## Step 2 — Run build verification

Per CLAUDE.md rules, this is mandatory before every push.

```bash
cd D:/Projects/Ai/Liquid-Stories/advisor-team-mvp && rm -rf .next node_modules/.cache && npx tsc --noEmit && npm run build
```

**If build fails**: Stop immediately. Report the error to Derek. Do NOT push. Tell him which step failed (tsc vs build) and the first error message. The push does not happen until the build passes.

**If build passes**: Continue to Step 3.

---

## Step 3 — Get file details for each commit

For each pending commit, get the files changed:
```bash
cd D:/Projects/Ai/Liquid-Stories/advisor-team-mvp && git show --stat [hash] | head -30
```

Use this to determine:
1. What category the commit belongs to (see Category Mapping below)
2. Whether it's a NEW feature or an UPDATE to an existing feature in `ClarityEQ-Feature-List.md`
3. Whether it's user-facing (needs App Use Advisor check)

### Category Mapping

Match commit files/subject to the correct section in `ClarityEQ-Feature-List.md`:

| Files / Keywords | Category Section |
|---|---|
| `advisors.ts`, `guardrails`, `app-help-prompt` | **1. AI Advisory Team** |
| `streaming.ts`, `useStreaming`, `SSE`, `route.ts` | **2. Streaming and Real-Time Architecture** |
| `spontaneous-image/`, `prompt-composer`, `image-pipeline`, `replicate`, `flux`, `img2img` | **3. AI Image Generation and Vision** |
| `sandbox-advisor/`, `sandbox`, `RightPanel`, `spreadsheet` | **4. Interactive Visual Workspace (Sandbox)** |
| `voice`, `tts`, `TTS`, `edge-tts`, `Voice-Type` | **5. Voice and Audio** |
| `interaction-modes`, `writer-mode`, `modes` | **6. Interaction Modes** |
| `projects`, `topics`, `session-to-project`, `project-awareness` | **7. Projects and Organizational Memory** |
| `little-wins`, `directive`, `life-path`, `career`, `walk-beside` | **8. Personal Growth Tools** |
| `onboarding`, `avatar`, `settings`, `waitlist` intake | **9. Onboarding and User Experience** |
| `admin`, `waitlist`, `ambassador`, `led-`, `breadcrumb` | **10. Admin and Operations** |
| `next.config`, `prisma`, `supabase`, `clerk`, infrastructure | **11. Platform and Infrastructure** |

If a commit touches multiple categories, assign it to the most prominent one.

---

## Step 4 — Staleness audit (run BEFORE writing anything)

Read the current file:
```
D:/Projects/Ai/Liquid-Stories/Docs/ClarityEQ-Feature-List.md
```

Then, for every file changed across all pending commits, ask: **does any existing entry in the feature list describe or reference this file's functionality?**

Use the Category Mapping from Step 3 to narrow the search. For each match found:

1. Read the entry's `**What it does:**` description carefully.
2. Compare it to what the code actually does now (you've already read the changed files in Step 3).
3. If the description is **stale, incomplete, or inaccurate** — flag it for Case C below.

**Examples of staleness to catch:**
- A feature was refactored but the description still describes the old approach
- A feature was listed as "Shipped" but you can see from the code it isn't fully wired up
- The description omits a significant capability that was added in a later commit
- The "Investor signal" no longer reflects what the feature actually delivers

This step runs even if the commit is just a fix — a bug fix sometimes means a feature that was claimed as working actually wasn't.

---

## Step 5 — Update ClarityEQ-Feature-List.md

For each pending commit, do ONE of the following:

### Case A — New feature (not yet in the document)

Add a new entry in the correct category section, using this format:

```markdown
### [Feature Name — plain English, no code names]
**Status:** Shipped
**First shipped:** [date] (`[hash]`)
**What it does:** [1-3 sentences. What does the user experience? What problem does it solve? No jargon.]
**Investor signal:** [1 sentence connecting to retention, differentiation, monetization, or growth.]
**Evidence:** Commit `[hash]`, [PRD name if applicable]
```

Insert the new entry at the **bottom** of the correct category section, before the `---` separator.

### Case B — Update to existing feature (behavior unchanged, commit refines it)

Find the existing entry and:
- Update `**Status:**` if it changed (e.g., In Development → Shipped)
- Add the new commit hash to `**Evidence:**`
- Add a note if behavior significantly changed: `**Updated [date]:** [what changed]`

### Case C — Stale description (flagged by Step 4 staleness audit)

Rewrite the `**What it does:**` description to accurately reflect current behavior. Rules:
- Do not preserve inaccurate phrasing just because it was there before
- If a feature claimed as "Shipped" is actually broken or unrendered, change **Status** to `Partial — [what works vs. what doesn't]`
- Add `**Corrected [date]:** [one line summary of what was wrong and what's accurate now]`
- Update `**Investor signal:**` if the correction changes the story

### Updating Summary Stats at top

After all entries are written (Cases A, B, and C), update these two lines at the top of the document:
```
**Generated:** [today's date]
**Sources:** Git history ([new total] commits), [N] PRDs, [N] session summaries
```

Get new commit total:
```bash
cd D:/Projects/Ai/Liquid-Stories/advisor-team-mvp && git rev-list --count HEAD
```

Also update the Summary Stats block:
- Increment `Total commits`
- Increment `Features documented (shipped)` if new features were added
- Update `Date range` end date if needed

---

## Step 6 — Flag App Use Advisor if needed

After updating the feature list, check: does any new or updated feature change what users can do in the app?

If yes, add this to your final report:
```
⚠️  App Use Advisor may need updating — [feature name] is now available.
    File: advisor-team-mvp/lib/app-help-prompt.ts
```

**User-facing features that always need App Use Advisor review:**
- New interaction modes or mode behaviors
- New user-accessible commands or gestures
- New panels or UI sections
- New onboarding steps
- New settings or user controls

**Infrastructure/internal features that do NOT need App Use Advisor review:**
- Streaming architecture changes
- Admin-only features
- Performance fixes
- Bug fixes with no UX change

---

## Step 7 — Push the app

```bash
cd D:/Projects/Ai/Liquid-Stories/advisor-team-mvp && git push origin main
```

---

## Step 7b — Back up ClarityEQ-Feature-List.md to parent repo

The feature list lives in the parent repo (`Liquid-Stories/`), not in `advisor-team-mvp/`. Back it up immediately after the app push so every version is recoverable via git.

```bash
cd D:/Projects/Ai/Liquid-Stories && git add Docs/ClarityEQ-Feature-List.md && git commit -m "docs: update feature list after push" && git push origin main
```

**If the commit fails** (nothing changed): that means the feature list wasn't modified this push — continue without error.

**If the push fails**: Report to Derek but do not treat it as a blocker for the app push (which already succeeded). The app is live; the backup will happen on the next push.

---

## Step 8 — Report to Derek

```
✅ Pushed [N] commits to origin/main.
Vercel deploy started — live in ~4 minutes at clarityeq.com.

ClarityEQ-Feature-List updated:
  • [Feature name] — added to [Category]
  • [Feature name] — status updated to Shipped
  • [Feature name] — description corrected (was: [old claim], now: [accurate description])

[If applicable:]
⚠️  App Use Advisor may need updating — [feature name].
    File: lib/app-help-prompt.ts
```

---

## Notes

- **All git ops inside `advisor-team-mvp/`** — never from Liquid-Stories root (CLAUDE.md rule)
- **Build verification is non-negotiable** — if Derek asks to skip it, decline and explain why
- **ClarityEQ-Feature-List.md lives in `Docs/`** — root project folder, not inside advisor-team-mvp
- **Plain language always** — entries must be readable by a non-technical investor
- **Evidence is required** — never add a feature entry without at least one commit hash
- **Roadmap section**: If a commit completes a feature that was in the Roadmap, move it to the correct shipped category and remove it from Roadmap
