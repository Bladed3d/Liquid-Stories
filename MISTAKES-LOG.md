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
