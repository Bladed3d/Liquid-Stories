# Mistakes Log - Liquid-Stories Project

**Purpose:** Document every failure with root cause and prevention rule. Future Claude sessions MUST check this log before attempting similar operations.

---

## 2026-01-10: Created Redundant CLAUDE.md in Subfolder

### What Happened
Created a separate `CLAUDE.md` in `advisor-team-mvp/` subfolder when one already exists at `Liquid-Stories/` root.

### Root Cause
1. Over-engineering - thought app-specific details needed separate file
2. Did not consider that new Claude sessions lack context to understand multiple CLAUDE.md files
3. Added complexity instead of simplicity

### What Was Lost/Broken
- Confusion about which CLAUDE.md is authoritative
- Risk of conflicting instructions
- User had to point out the problem

### Prevention Rule
**ONE CLAUDE.md per project, at the root level where `.claude/` folder exists.**
- Subfolders should NOT have their own CLAUDE.md
- App-specific details go in README.md or docs/ folder, not CLAUDE.md
- Simpler is better - new Claude sessions have no context

### System Fix Applied
- Deleted `advisor-team-mvp/CLAUDE.md`
- Added this rule to MISTAKES-LOG

---

## 2026-01-10: Files Created in Wrong Location

### What Happened
Created `CRITICAL-RULES.md`, `MISTAKES-LOG.md`, and `SUCCESS-PATTERNS.md` in `advisor-team-mvp/` subfolder instead of the `Liquid-Stories/` root where `.claude/` folder exists.

### Root Cause
1. Made assumption about where files should go without asking
2. Did not check for existing `.claude/` folder to understand project structure
3. User had to point out the error

### What Was Lost/Broken
- Time wasted creating files in wrong location
- Had to move files afterward
- User frustration

### Prevention Rule
**NEVER assume file/folder locations. ALWAYS:**
1. Check for existing `.claude/` folder - that indicates project root
2. If unsure, ASK before creating files
3. Look at existing structure before adding to it

### System Fix Applied
- Added rule #1 to `CRITICAL-RULES.md`: Never assume file/folder locations

---

## 2026-01-10: File Loss During Folder Reorganization

### What Happened
Moving files from root to `docs/` subfolders resulted in loss of `ACTION-PLAN-2026-01-10.md` and initially `DEV-TEAM-COMPARISON.md`.

### Root Cause
1. Used `mv` command with Windows backslash paths (`D:\path\file`)
2. Backslashes caused path escaping issues, creating malformed filenames
3. Did NOT verify files existed in destination before considering move complete
4. Did NOT use copy→verify→delete pattern

### What Was Lost
- `ACTION-PLAN-2026-01-10.md` - Complete roadmap with phases (from previous session)
- `DEV-TEAM-COMPARISON.md` - Recreated, but wasted time

### Prevention Rule
**NEVER use `mv` directly. ALWAYS use copy→verify→delete pattern:**
```bash
# Step 1: Copy (use forward slashes!)
cp "D:/source/file.md" "D:/dest/file.md"

# Step 2: Verify (check CONTENT, not just existence)
ls -la "D:/dest/file.md"
head -5 "D:/dest/file.md"

# Step 3: Only then delete original
rm "D:/source/file.md"
```

### System Fix Applied
- Added `Bash(mv *:*)` to "ask" permissions in `.claude/settings.json`
- Created `CRITICAL-RULES.md` with safe file move pattern
- Created pre-command hook to warn about dangerous patterns

---

## Template for Future Entries

```markdown
## YYYY-MM-DD: Brief Description

### What Happened
[Exact sequence of events]

### Root Cause
[Why it failed - be specific]

### What Was Lost/Broken
[Impact of the failure]

### Prevention Rule
[Specific rule to prevent recurrence]

### System Fix Applied
[Any hooks, settings, or automation added]
```

---

## 2026-01-28: Chat Search - 4 Sessions, 6+ Hours, One Missing Character

### What Happened
1. User wanted to search chat history via App Use Advisor (e.g., "Find chats with Samoyed")
2. Search was implemented with PostgreSQL trigram fuzzy search (`pg_trgm`)
3. 4 separate Claude sessions attempted to fix it over 2 days
4. Issues chased: wrong user_id, UUID vs TEXT types, TIMESTAMP vs TIMESTAMPTZ, threshold tuning, RLS policies
5. User ran 30-40 SQL scripts across sessions
6. **Actual problem:** Detection regex updated to handle plurals (`chats?`) but extraction regex was NOT updated
7. User typed "Find **chats** with Samoyed" → detection worked, but extraction passed entire string instead of just "Samoyed"
8. Search was matching `word_similarity('Find chats with Samoyed', content)` instead of `word_similarity('Samoyed', content)`

### Root Cause
1. **Incomplete fix** - When adding plural support to CHAT_HISTORY_PATTERNS, forgot to update extractChatSearchTerms()
2. **Wrong diagnosis repeated** - Multiple sessions assumed user_id mismatch, type mismatches, threshold issues
3. **No logging of actual search terms** - LED breadcrumbs logged userId but not the actual searchTerms being passed to RPC
4. **Each new Claude started fresh** - Without reading full context, each session re-investigated the same dead ends

### What Was Lost/Broken
- 6+ hours of user time across 4 sessions
- 30-40 SQL scripts run manually
- User exhaustion and frustration
- Trust in Claude's debugging ability

### Prevention Rules

**1. When updating pattern matching, update ALL related patterns:**
```javascript
// If you change this:
const CHAT_HISTORY_PATTERNS = [/find chats?/i, ...]

// You MUST also change this:
function extractChatSearchTerms(message) {
  .replace(/find chats?/gi, '')  // <-- SAME PATTERN
}
```

**2. Log the ACTUAL values being passed to database functions:**
```javascript
// BAD - logs metadata but not actual search terms
trail.light(LED.SEARCH_START, { userId, userIdLength })

// GOOD - logs what's actually being searched
trail.light(LED.SEARCH_START, { userId, searchTerms, actualQuery: searchTerms })
```

**3. For search debugging, test the exact RPC call first:**
```sql
-- Don't chase types/permissions until you verify the function works
SELECT * FROM search_chat_messages('user_id', 'EXACT_SEARCH_TERMS', 50);
```

**4. When inheriting a debug session, read the FULL previous chat:**
- Not just the summary
- Search for what was already tried
- Look for patterns in what kept failing

**5. Two schemas exist in Supabase - always use explicit `public.` prefix:**
- `auth.sessions` (UUID types) - Supabase internal
- `public.sessions` (TEXT types) - Your app
- Functions without schema prefix may hit wrong table

### Verified Database Types (for advisor-team-mvp)
| Table | Column | Type |
|-------|--------|------|
| public.sessions | id | TEXT |
| public.sessions | user_id | TEXT |
| public.messages | session_id | TEXT |
| public.messages | created_at | TIMESTAMP (not TIMESTAMPTZ) |

### Working RPC Function
```sql
CREATE OR REPLACE FUNCTION search_chat_messages(
  p_user_id TEXT,
  p_search_terms TEXT,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  session_id TEXT,
  content TEXT,
  created_at TIMESTAMP,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.session_id, m.content, m.created_at,
    word_similarity(p_search_terms, m.content) AS similarity
  FROM public.messages m
  JOIN public.sessions s ON s.id = m.session_id
  WHERE s.user_id = p_user_id
    AND word_similarity(p_search_terms, m.content) > 0.5
  ORDER BY similarity DESC, m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

### System Fix Applied
- Fixed extraction regex in `app/api/chat/stream/route.ts` to handle plurals
- Added console.log debug for searchTerms (can be removed later)
- Documented verified types above for future reference

### Open Issues (for future sessions)
1. **LED breadcrumbs not logging for chat search** - Despite LOG_AGGREGATION_ENABLED=true, chat search LEDs (2030-2091) don't appear in API. Other LEDs work fine.
2. **Current session appears in results as "null"** - Search finds its own query message

---

## 2026-01-28 (Part 2): Chat Search - "research" vs "search" - Two Letters

### What Happened
1. User tested chat search with: "Can you research my chat history to find a discussion we had about creating a two-column worksheet"
2. Search never triggered - no LED logs, no results
3. SQL function worked perfectly when tested directly
4. AI preview generation was bypassed (suspected culprit)
5. Still nothing
6. **Actual problem:** Detection pattern has `/search .../i` but user typed "**research**"
7. Two letters ("re") caused complete search failure

### Root Cause
**REGEX PATTERN MATCHING IS FUNDAMENTALLY BROKEN FOR NATURAL LANGUAGE**

This is the SECOND time in 24 hours that a trivial pattern mismatch caused hours of debugging:
- Yesterday: "chat" vs "chats" (1 character)
- Today: "search" vs "research" (2 characters)
- Tomorrow: ???

The problem is NOT "keep patterns in sync" or "add more patterns." The problem is that humans don't speak in patterns. They say:
- "research my chat history"
- "look through our conversations"
- "where did we discuss..."
- "that thing we talked about"
- "remember when we..."

No amount of regex will cover natural language. Each new phrasing requires code changes, deployment, and user frustration.

### What Was Lost/Broken
- Another 2+ hours debugging
- User exhaustion ("what's going to happen tomorrow? A missing period?")
- Continued accumulation of technical debt in pattern matching

### Prevention Rule
**STOP ADDING REGEX PATTERNS. IMPLEMENT LLM-BASED INTENT DETECTION.**

The solution that should have been implemented after yesterday's failure:

```javascript
// WRONG - Fragile regex that will keep breaking
const CHAT_HISTORY_PATTERNS = [
  /find chats?/i,
  /search.*history/i,
  /research.*history/i,  // Added after failure
  // ... infinite patterns needed
]

// RIGHT - Let the AI decide
// Give the model a function/tool it can call:
tools: [{
  name: "search_chat_history",
  description: "Search user's past conversations for relevant content",
  parameters: { query: "string" }
}]

// AI naturally understands ALL of these without regex:
// - "research my chat history for X"
// - "find where we talked about X"
// - "remember that conversation about X?"
// - "what did we decide about X?"
// - "look through my old chats for X"
```

### Patterns Added Today (Temporary Fix)
Until LLM-based detection is implemented:
- Added "research" to detection: `/(?:search|research) .../i`
- Added "find in chat history": `/find (?:in )?(?:our |my |the )?(?:chat ?history|conversation ?history)/i`
- Added extraction for "Can you", "a discussion we had about"

**These are bandaids. The next user phrasing will break it again.**

### System Fix Required
1. **Implement function calling for chat search** - This is not optional, it's required
2. **Remove regex patterns entirely** - Once function calling works
3. **Let AI extract search terms** - No more extraction regex either

### The Real Lesson
Every hour spent adding regex patterns is an hour NOT spent on the correct solution. The regex approach has now cost 8+ hours across two days. Function calling implementation would take ~2 hours and solve the problem permanently.

---

## 2026-01-29: TTS Word Highlighting - CSS Styles Applied but Invisible

### What Happened
1. User reported word-level highlighting not working for TTS playback over 20+ tests
2. Voice played correctly, LED breadcrumbs showed full TTS pipeline working (4310→4320→4321→4323)
3. DOM inspection via Playwright showed `.word-speaking` class WAS being applied to word spans
4. However, computed styles showed `backgroundColor: rgba(0, 0, 0, 0)` - TRANSPARENT
5. The yellow highlight color defined in styled-jsx was being ignored

### Root Cause
**styled-jsx only auto-scopes CSS to DIRECT JSX elements, NOT dynamically generated elements.**

In `SpeakableMessage.tsx`:
```tsx
// These spans are generated dynamically in renderWords()
boundaries.forEach((wb, wordIndex) => {
  words.push(
    <span key={wordIndex} className={getWordClass(unitIndex, wordIndex)}>
      {wb.text}
    </span>
  )
})

// This styled-jsx block ONLY scoped to direct JSX elements
<style jsx>{`
  .word-speaking { background-color: #fef08a; }  // ← Never applied to dynamic spans!
`}</style>
```

The scoped CSS was transformed to something like `.word-speaking.jsx-abc123` but the dynamically generated spans only had `.word-speaking` without the hash suffix.

### What Was Lost/Broken
- TTS word highlighting completely invisible for 20+ user tests
- User frustration from repeated testing
- Debug time chasing wrong suspects (word boundaries, tracking logic, timing)

### Prevention Rule
**When using styled-jsx with dynamically generated elements (map, forEach, etc.), use one of these approaches:**

```tsx
// OPTION 1: Global scope for dynamic elements (RECOMMENDED)
<style jsx global>{`
  .speakable-message .word-speaking {
    background-color: #fef08a;
  }
`}</style>

// OPTION 2: Inline styles on dynamic elements
words.push(
  <span
    key={i}
    style={{ backgroundColor: isSpeaking ? '#fef08a' : 'transparent' }}
  >
    {text}
  </span>
)

// OPTION 3: CSS Modules (different file structure)
import styles from './SpeakableMessage.module.css'
<span className={styles.wordSpeaking}>
```

**Quick test:** If styles aren't applying, check `getComputedStyle(element)` in browser console. If values are defaults (transparent, 0px), the scoped CSS isn't reaching the element.

### Secondary Issue: Timing Lag (300ms behind voice)

After fixing CSS, highlights were ~300ms behind the voice due to audio output latency.

**Fix:** Added timing offset in `useTTS.ts`:
```typescript
const HIGHLIGHT_ADVANCE_MS = 300
const elapsed = (this.audioContext.currentTime - this.chunkStartTime) * 1000 + HIGHLIGHT_ADVANCE_MS
```

### System Fix Applied
1. Split styles in `SpeakableMessage.tsx`:
   - Kept sentence styles as scoped `<style jsx>`
   - Changed word styles to `<style jsx global>` with parent selector `.speakable-message .word-speaking`
2. Added `HIGHLIGHT_ADVANCE_MS = 300` constant in `useTTS.ts` to compensate for audio latency
3. Both fixes committed and deployed

### Debugging Lesson
**LED breadcrumbs can confirm pipeline is working, but CSS scoping issues are invisible to application logging.** When UI elements have correct classes but wrong appearance, always check computed styles via browser devtools or Playwright evaluate.

---

## 2026-01-30: Agent Workflow Heap Crash - Nested Spawning (CORRECTED)

### What Happened
1. User ran Project Manager agent on a simple POC (QR Upload - 8 tasks)
2. Claude Code crashed with "JavaScript heap out of memory" (24GB exhausted)
3. Multiple Claude sessions attempted fixes over several hours
4. Initial diagnosis was WRONG: thought background spawning would fix it
5. PM v2 was created with background spawning - STILL CRASHED
6. User demanded actual research instead of guessing
7. Research of official Claude Code docs and Ralph plugin revealed the real problem

### Root Cause (ACTUAL)
**SUBAGENTS CANNOT SPAWN OTHER SUBAGENTS - Claude Code architectural limitation.**

From official Claude Code documentation:
> "Cannot spawn other subagents (no nesting)"

The PM design was fundamentally impossible:
```
Main Claude → spawns PM (now PM is a subagent)
                PM tries to spawn Task Breakdown → ARCHITECTURAL VIOLATION
                                                    → crash
```

It doesn't matter if spawning is foreground or background. **Subagents cannot spawn subagents at all.**

### Why Earlier Fixes Failed
1. **PM v1 (foreground spawning)** - Crashed because nested spawning isn't allowed
2. **PM v2 (background spawning)** - Still crashed because nested spawning isn't allowed
3. **6 background agent experiment** - Worked because Main Claude spawned them, not a subagent

The experiment succeeded because Main Claude was the spawner. PM crashed because PM (a subagent) tried to spawn.

### What Was Lost/Broken
- 12+ Claude sessions over multiple days
- User frustration from repeated crashes and wrong diagnoses
- Hours of debugging the wrong problem
- User had to insist on actual research instead of guessing

### Prevention Rules

**1. SUBAGENTS CANNOT SPAWN SUBAGENTS**
- This is non-negotiable Claude Code architecture
- No amount of background/foreground tweaking changes this
- If an agent needs to spawn agents, it CANNOT be an agent itself

**2. Orchestrators must be WORKFLOWS, not AGENTS**
- PM cannot be spawned via Task tool
- PM must be a workflow document that Main Claude reads and follows
- Main Claude spawns all worker agents directly

**3. Research BEFORE guessing**
- User explicitly said: "Instead of guessing, what do you need to find out the truth?"
- Check official docs, check working examples (Ralph), understand the architecture
- Don't guess for 12 sessions when research would answer in 30 minutes

### System Fix Applied (2026-01-30 - FINAL)

**1. PM moved from agent to workflow:**
- OLD: `.claude/agents/project-manager.md` (unusable - subagent can't spawn)
- NEW: `.claude/workflows/pm-workflow.md` (instructions for Main Claude)

**2. Architecture corrected:**
```
WRONG (crashes):
Main Claude → PM agent → Task Breakdown agent → CRASH

CORRECT (works):
Main Claude reads pm-workflow.md
Main Claude → Task Breakdown agent → returns result
Main Claude → Test Agent → returns result
Main Claude → Developer agent → returns result
Main Claude → Quality agent → returns result
```

**3. Documentation updated:**
- `CRITICAL-RULES.md` - Rule 10 now states "subagents cannot spawn subagents"
- `CLAUDE.md` - References workflow, not PM agent
- This MISTAKES-LOG entry corrected from wrong diagnosis

### How Ralph Plugin Does It (Reference)
Ralph uses a **stop hook** (bash script) that intercepts session exit and re-feeds the same prompt. There is NO agent spawning - just one Claude session iterating via file persistence. Ralph doesn't have this problem because it never tries nested spawning.

### Lesson
**When something crashes repeatedly across many sessions, stop guessing and research the actual architecture.** The official docs clearly state "cannot spawn other subagents" - this was the answer all along.

---

*This log is append-only. Never delete entries.*

## 2026-01-22: Broke Voice Input by Pushing Untested "Fix"

### What Happened
1. User reported voice typing not working in Opera
2. Claude ASSUMED the voice server/tunnel was down without investigating
3. Claude pushed a "health check" to VoiceInput.tsx that opens a WebSocket on page load and immediately closes it
4. Vercel auto-deployed the change
5. The ghost WebSocket connection interfered with the real recording connection in Opera
6. Voice transcription broke - Opera could connect but received no transcription back
7. Chrome continued working (handles the race condition differently)
8. User had to point out that voice WAS working for days, meaning Claude's change caused the regression

### Root Cause
1. **Pushed code without user approval** - User had said "don't push until we agree" but Claude pushed anyway
2. **Wrong diagnosis** - Assumed tunnel was down, then assumed ScriptProcessorNode deprecation was the issue
3. **Didn't investigate before changing code** - Should have checked if tunnel was running, tested connectivity, asked what changed
4. **Didn't test the change** - Pushed health check without verifying it didn't break existing functionality
5. **Made assumptions instead of investigating** - User explicitly called this out: "Why don't you investigate the different possibilities?"

### What Was Lost/Broken
- Voice transcription in Opera broken for the duration until revert
- User frustration from multiple wrong diagnoses
- Time wasted on wrong solutions

### Prevention Rules
1. **NEVER push code when user says "don't push until we agree"** - This is explicit instruction, not a suggestion
2. **When a feature "stopped working", ask WHAT CHANGED** - Don't redesign the system, find what broke it
3. **Investigate before coding** - Check processes, test connectivity, examine logs BEFORE writing fixes
4. **A working feature that breaks = regression, not redesign opportunity** - The fix is usually small (revert, restart, config) not architectural
5. **WebSocket health checks can interfere with real connections** - Opening and immediately closing connections can cause race conditions on the server
6. **Test in ALL browsers before pushing** - If a feature works in Chrome, verify the fix doesn't break other browsers

### System Fix Applied
- Reverted commit `0e7bcc0` (the health check)
- Voice restored in Opera
- Updated Docs/fixVoice.md with correct diagnosis

## 2026-01-12: LED Breadcrumbs - Wasted Hours Testing Localhost with Playwright

### What Happened
1. Breadcrumbs agent added LED instrumentation to client-side code
2. Used `new VerificationResult()` but it's an interface, not a class - build failed
3. Created duplicate error logging (both in API functions AND React Query hooks)
4. Tested with Playwright on localhost - kept getting "Missing Supabase env vars" errors
5. Spent 2+ hours debugging when the issue was Playwright sandbox has no access to .env files
6. Made user test manually repeatedly ("test dummy" problem)

### Root Cause
1. Did not understand Playwright sandbox limitations with env vars
2. Previous session documented this but handoff was incomplete
3. Kept testing localhost instead of deployed Vercel URL
4. Breadcrumbs agent generated incorrect code (interface vs class)

### What Was Lost/Broken
- 2+ hours of user time
- User frustration
- No actual LED breadcrumbs deployed

### Prevention Rule
1. **VerificationResult is an INTERFACE** - use object literals `{ expect, actual, validator }` not `new VerificationResult()`
2. **Don't duplicate error logging** - log in API function OR React Query hook, not both
3. **For apps with env vars: Push to Git → Vercel deploys → Test Vercel URL with Playwright**
4. **NEVER test localhost with Playwright when app needs env vars**

### System Fix Applied
- Updated CRITICAL-RULES.md rule #15 with Vercel testing workflow
- Added advisor-team-mvp Vercel URL: https://advisor-team.vercel.app/dashboard

---

## 2026-01-25: Model Switch Disabled 20% of App Capabilities (Search)

### What Happened
1. User wanted to move from GLM-4.7 (via Z.ai) to avoid 2-concurrent transaction limit
2. Claude and Grok designed a matrix test comparing 8 models across 5 advisors
3. Test measured: persona match, helpfulness, conciseness, response time
4. DeepSeek v3.2 won decisively (scored 9.44-9.67 across all advisors)
5. Model was switched to DeepSeek
6. **Maya's search functionality completely broke** - DeepSeek has NO web search capability
7. User discovered this the next day when trying to use the app
8. GLM-4.7 has native search built-in; DeepSeek does not
9. Neither Claude nor Grok flagged this during test design

### Root Cause
1. **Tested PERFORMANCE but not CAPABILITY PARITY** - The test only measured how well models converse, not what features they support
2. **No "feature inventory" before switching** - Nobody asked "What does GLM do that the replacement must also do?"
3. **Search was invisible in the test** - Test prompts didn't require live search, so the gap wasn't exposed
4. **Assumed all models have similar capabilities** - Dangerous assumption; models vary wildly in tool support
5. **Rushed to recommend without full analysis** - Both AIs focused on the scoring matrix, not holistic impact

### What Was Lost/Broken
- **Maya's entire research capability** - 20% of advisor team functionality
- User discovered the regression in production
- Trust in AI-recommended architecture changes
- Time spent debugging and designing fix (Maya Split)

### Prevention Rule
**CAPABILITY PARITY CHECK - Before switching ANY major component (model, API, service):**

1. **Inventory current capabilities:**
   - What features does the CURRENT system provide?
   - List ALL of them, not just the ones being tested
   - For AI models: reasoning, search, tool use, code execution, image analysis, etc.

2. **Verify replacement supports ALL capabilities:**
   - Check documentation for the replacement
   - Test each capability explicitly
   - If a capability is missing, FLAG IT IMMEDIATELY

3. **Create a comparison table:**
   ```
   | Capability      | Current (GLM) | Replacement (DeepSeek) |
   |-----------------|---------------|------------------------|
   | Conversation    | ✓             | ✓                      |
   | Reasoning       | ✓             | ✓                      |
   | Web Search      | ✓ (native)    | ✗ (MISSING!)           |
   | Tool Use        | ✓             | ?                      |
   ```

4. **If ANY capability is missing or degraded:**
   - STOP and inform user before proceeding
   - Discuss workarounds or alternatives
   - Do NOT proceed with switch until user approves the tradeoff

5. **For model comparisons specifically:**
   - Include "Does this model support web search?" as a TEST CRITERION
   - Include "Does this model support tool/function calling?" as a TEST CRITERION
   - Test with prompts that REQUIRE these capabilities, not just conversation

### The Question That Should Have Been Asked
> "GLM-4.7 has native web search. Does DeepSeek v3.2 have equivalent search capability?"

This question was never asked. It should have been the FIRST question.

### System Fix Applied
- Created `Docs/Maya-Split-PRD.md` with plan to route Maya to DeepSeek:online (adds Exa search)
- Added this entry to MISTAKES-LOG
- Future model comparisons MUST include capability parity check

### Lesson for All Architecture Changes
**When changing a significant component, ask:**
1. What does the current system DO? (not just how well, but WHAT)
2. Does the replacement do ALL of those things?
3. What's the user impact if ANY capability is lost?

A 20% reduction in capabilities is not an acceptable trade for better conversation scores.

---

## 2026-01-22: Data Source Mismatch - Progress Bar vs Detail View

### What Happened
1. Progress bar showed "1/5" (20%) - correctly counting from `commissions` table
2. New expandable detail view showed "0 joined, 3 pending" - incorrectly reading from `invite_codes.used_by_email`
3. User (Deborah) had joined and triggered a commission, but her invite code's `used_by_email` was never updated
4. Two different tables tracking the same concept = guaranteed mismatch

### Root Cause
1. `referralCount` is sourced from `commissions` table (`countReferrals()` in `lib/ambassador.ts`)
2. The new feature built "joined" list from `invite_codes.used_by_email` without checking what `referralCount` actually queries
3. Did not trace the data source of the number being displayed before building the detail view

### What Was Lost/Broken
- User sees contradictory information (1 referral counted but 0 shown as joined)
- Trust in the dashboard accuracy

### Prevention Rule
**When building a detail/breakdown view for an existing summary number, ALWAYS trace where that number comes from and use the SAME data source.**

Specifically for advisor-team-mvp:
- **Referral count** = `commissions` table, `referrer_member_number` field
- **Invite tracking** = `invite_codes` table, `used_by_email` field
- These are NOT the same. A commission can exist without `used_by_email` being set.
- When showing "who joined", query `commissions` (not `invite_codes.used_by_email`)
- When showing "who's pending", query `invite_codes` where `invited_email` is set but no matching commission exists

**General rule:** Before building any UI that expands/details a number, run: "What SQL/query produces this number?" Then use that exact query for the detail view.

### System Fix Applied
- Ambassador status API now returns `referrals` array from commissions table
- Progress bar detail view uses `ambassadorStatus.referrals` for "joined" group
- Pending still comes from `invite_codes` (correct source for unsent/unredeemed)

---

## 2026-01-30: Committed Fix to Feature Branch Instead of Main

### What Happened
1. User reported sandbox updates not working in production
2. Claude investigated and found the fix (sandbox content not being passed to AI)
3. Claude committed and pushed to `feature/mobile-vertical-layout` instead of `main`
4. Vercel deployed the feature branch preview, not production
5. User had to point out the mistake
6. Had to cherry-pick commit to main and push again

### Root Cause
1. Claude was on the feature branch when starting work
2. Did not check which branch was active before committing
3. Did not ask user "main or feature branch?" for a production bug fix
4. Assumed current branch was correct without verifying

### What Was Lost/Broken
- Time wasted on incorrect deployment
- User had to catch the mistake
- Extra git operations to fix

### Prevention Rule
**BEFORE committing any fix, check the branch and ask if unclear:**

```bash
# ALWAYS run this before committing
git branch --show-current
```

**For bug fixes that need to go to production:**
1. Check current branch: `git branch --show-current`
2. If not on `main`, ask user: "This is a production fix. Should I commit to main or stay on [current-branch]?"
3. Switch to main if needed: `git checkout main && git pull`
4. THEN make changes and commit

**Default assumptions:**
- Bug fixes → `main` (unless user says otherwise)
- New features → feature branch
- When in doubt → ASK

### System Fix Applied
- Added this rule to MISTAKES-LOG.md so future Claude sessions read it

---

## 2026-01-31: Git Branch Confusion - Cosmetic Changes Mixed with Mobile Layout

### What Happened
1. User wanted to make cosmetic changes (grain texture, markdown rendering, gold accents)
2. Previous session had left the working directory on `mobile` branch
3. User made changes on localhost, tested, approved them
4. When time to commit to `main`, Claude stashed changes and applied to main
5. Build failed - `mobile` branch's page.tsx imported MobileTopBar/MobileBottomPanel
6. These components don't exist on `main`
7. User was confused and frustrated - they thought they could edit files and choose destination later
8. Required surgical cleanup to separate cosmetic changes from mobile layout changes

### Root Cause
**User's mental model:** "I edit files, then choose which git branch to upload to"
**Git's reality:** "Branches physically change the files in your folder. You're always editing a specific branch's version."

When you check out `mobile` branch, your folder contains mobile code. Edits layer on top of that. You can't later "route" those edits to a different branch cleanly - you're editing the mobile version.

Claude should have:
1. Checked the branch at session start
2. Asked: "You're on mobile branch. Should I switch to main?"
3. Switched BEFORE any editing began

### What Was Lost/Broken
- 30+ minutes of frustration and confusion
- User trust in git as a "safety net"
- Clean separation of cosmetic vs mobile work

### Prevention Rule
**AT EVERY SESSION START involving advisor-team-mvp code:**
```bash
cd advisor-team-mvp && git branch --show-current
```

Then tell user: "You're on [branch]. Should I switch to main before we start?"

If user wants work to end up on `main`, switch BEFORE making any changes. Not after.

### User's Key Insight
> "I thought Git was a fallback and a help. It turns out it's a predominant influence and criteria I have to watch out for at the start of being creative."

Git branch management should be Claude's job, not the user's mental overhead.

### System Fix Applied
- Added rule #10 to CRITICAL-RULES.md: Check and announce git branch at session start
- Added this entry to MISTAKES-LOG.md

---

## 2026-02-02: Scroll-to-Image Not Working - Data Stripped Before Database Save

### What Happened
1. User reported sandbox panel should show the image associated with whichever chat message is currently visible
2. Scrolling to view previous images in chat history wasn't updating the sandbox panel
3. Multiple debugging sessions tried various fixes over multiple sessions
4. First attempt: Added `requestAnimationFrame` to fix race condition - didn't help
5. Second attempt: Changed IntersectionObserver to check all images, not just entries - partial improvement
6. Third attempt: Added more IntersectionObserver thresholds (0, 0.1, 0.25, 0.5, 0.75, 1) - helped but wasn't root cause
7. **Actual problem discovered via Grok consultation:** Messages were saved to database WITHOUT the `:::sandbox-image-result:::` markers
8. The `processSandboxContent()` function stripped markers for UI display, and that CLEANED content was being saved to DB
9. When loading historical messages, `extractImageFromMessage()` found nothing because markers were gone

### Root Cause
**DATA TRANSFORMATION APPLIED BEFORE PERSISTENCE**

The flow was:
```
AI returns message with :::sandbox-image-result::: markers
  → processSandboxContent() strips markers for display
    → stripped content saved to database  ← BUG: Should save ORIGINAL
      → On reload, no markers exist
        → extractImageFromMessage() returns null
          → IntersectionObserver has nothing to track
```

The function `processSandboxContent()` was correctly designed to clean messages for UI display. The mistake was calling it BEFORE saving to the database instead of AFTER loading from the database.

### What Was Lost/Broken
- Multiple debugging sessions chasing wrong suspects (race conditions, observer thresholds, tracking logic)
- User frustration from repeated failed fixes
- Historical images in chat could never be scrolled to because their markers were already gone from DB

### Prevention Rule
**PRESERVE ORIGINAL DATA IN DATABASE, TRANSFORM ONLY FOR DISPLAY**

```javascript
// WRONG - transforms before save
const cleanedContent = processSandboxContent(message.content)
await saveToDatabase({ ...message, content: cleanedContent })  // Markers gone forever!

// RIGHT - save original, transform on read
await saveToDatabase({ ...message, content: message.content })  // Markers preserved
// Later, when displaying:
const displayContent = processSandboxContent(loadedMessage.content)
```

**General principle:** Database should store the canonical, complete version of data. UI transformations (stripping markers, formatting, sanitizing) happen at display time, not persistence time.

**For special content markers:**
1. Define the marker format clearly (e.g., `:::sandbox-image-result:::`)
2. Store messages WITH markers in database
3. Strip markers only in the UI rendering layer
4. Use data attributes to preserve extracted info for JS access:
   ```tsx
   <div data-has-image="true" data-image-content={extractedImageJson}>
     {displayContentWithMarkersStripped}
   </div>
   ```

### Secondary Issue: Images Showing Both Inline AND in Sandbox

The same image was appearing twice - once inline in the chat message and once in the sandbox panel. This was confusing and wasted space.

**Fix:** Changed inline display to show only a small icon (the framed picture emoji) in chat, with actual image rendering only in the sandbox panel.

### How Grok Helped

After multiple failed internal debugging attempts, Grok consultation broke the loop. Grok suggested checking "whether messages are being saved to the database with or without the markers" - which led directly to finding the root cause.

**Lesson:** When internal analysis keeps missing the root cause, external perspective (Grok, research) can identify blind spots.

### System Fix Applied
1. Modified message saving to preserve original content WITH markers
2. Call `processSandboxContent()` only at display time, not save time
3. Added `data-has-image` and `data-image-content` attributes to message elements for IntersectionObserver tracking
4. Changed inline image display to show only icon, full image only in sandbox
5. IntersectionObserver uses thresholds `[0, 0.1, 0.25, 0.5, 0.75, 1]` to catch all visibility states

---

## 2026-02-02: Told User to Test When Code Wasn't Pushed

### What Happened
1. PM workflow completed 15/17 tasks for Image Data Collection feature
2. Developer agents completed code changes and claimed "pushed" for some tasks
3. Main Claude presented summary saying "ready to test" with migration scripts
4. User ran database migrations and tested the feature
5. Feature didn't work - no session numbers, no data capture
6. Investigation revealed: Most code changes were never committed/pushed
7. Only 1 of many commits was actually pushed; rest were local uncommitted changes
8. User wasted time testing against old deployed code

### Root Cause
1. **Trusted agent claims without verification** - Developer agent for Task 4 pushed, but subsequent tasks did NOT push
2. **No git status check before declaring ready** - Main Claude never ran `git status` to verify
3. **Assumed "build passes" means "deployed"** - Build verification is local, not deployment verification
4. **Multiple agents, no aggregate verification** - Each agent worked in isolation; no final check that ALL changes were committed

### What Was Lost/Broken
- User's time running test that couldn't possibly work
- User trust in workflow reliability
- User frustration

### Prevention Rule
**BEFORE telling user "ready to test", ALWAYS run:**
```bash
git status --short
```

**If ANY modified files appear:**
- Code is NOT deployed
- Commit and push first
- Wait for deployment
- THEN tell user to test

**Do NOT trust agent claims of "pushed" without verification.**

### System Fix Applied
- Added "Mandatory Git Verification Before User Testing" section to `.claude/workflows/pm-workflow.md`
- Added this entry to MISTAKES-LOG.md

---

## 2026-02-02: Pushed Code Without Running Build - Syntax Error in Production

### What Happened
1. After discovering uncommitted code, Main Claude committed and pushed immediately
2. Did not run `npm run build` locally before pushing
3. Vercel deployment failed with syntax error: triple backticks inside template literal
4. User saw the build error on Vercel dashboard
5. Had to fix and push again

### Root Cause
1. **Rushed to fix previous mistake** - After being called out for not pushing, pushed without verification
2. **Trusted developer agent's build claim** - Agent said "build passes" but the actual pushed code had a syntax error
3. **No local build verification by Main Claude** - Main Claude should run build directly, not trust agent output

### What Was Lost/Broken
- Broken Vercel deployment
- User's time waiting for failed build
- Continued erosion of trust

### Prevention Rule
**Main Claude must run build DIRECTLY before any push:**
```bash
cd advisor-team-mvp && npm run build && echo "BUILD SUCCESS" || echo "BUILD FAILED"
```

**Do NOT:**
- Trust agent claims of "build passes"
- Push without seeing "BUILD SUCCESS" from a command Main Claude ran
- Rush to fix one mistake by creating another

### System Fix Applied
- Updated "Mandatory Build Verification" section in pm-workflow.md
- Main Claude must run build command directly, not rely on agent output

---

## 2026-02-03: Local Build Passes, Vercel Build Fails (Recurring)

### What Happened
1. Developer agent and Main Claude both ran `npm run build` - passed
2. Code was committed and pushed to git
3. Vercel build failed with TypeScript error: `'context' does not exist in type 'FailContext'`
4. User had to catch the error from Vercel dashboard
5. This pattern has happened multiple times across sessions

### Root Cause
**Local builds differ from Vercel builds:**
1. Local `.next` cache masks errors - Vercel builds from scratch
2. Local may have different TypeScript settings
3. Running just `npm run build` doesn't match Vercel's `npx prisma generate && npm run build`
4. Build cache can hide type errors that only appear on clean builds

### What Was Lost/Broken
- User had to manually check Vercel dashboard
- Multiple round-trips to fix errors that should have been caught locally
- User trust in the development workflow
- User explicitly said: "I'm tired of being a test dummy"

### Prevention Rule
**Match Vercel's exact build process locally:**

```bash
# WRONG - uses cache, may miss errors
npm run build

# RIGHT - matches Vercel (clean build)
rm -rf .next && npm run build
```

**Better: Use pre-push git hook to enforce this automatically.**

### System Fix Applied
1. Created `advisor-team-mvp/scripts/pre-push` - git hook that runs Vercel's exact build
2. Configured git: `git config core.hooksPath scripts`
3. Hook clears `.next` cache, runs prisma generate if needed, runs build
4. Hook BLOCKS push if build fails
5. Updated pm-workflow.md Phase 1 to configure hooks path
6. Updated Mandatory Build Verification section with correct build command

### How Pre-Push Hook Works
```
Developer runs: git push
    ↓
Hook runs: rm -rf .next && npm run build
    ↓
If build FAILS → Push blocked, error shown
If build PASSES → Push proceeds to remote
```

**User never has to remember to run the build - git enforces it.**

---
