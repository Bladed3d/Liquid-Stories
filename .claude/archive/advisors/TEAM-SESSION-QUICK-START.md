# Quick Start: Team Session with All Four Advisors

## ⭐ RECOMMENDED: Session Management with Profile & Project System

For the best experience with continuity, personalization, and project organization:

```
I want to start an advisor team session. Use your session coordinator instructions in "D:\Projects\Ai\Liquid-Stories\.claude\advisors\session-coordinator.md" to manage my profile and sessions.
```

**What happens:**
- AI asks for your profile name
- AI displays a menu of session options:
  1. **Personal Guidance** - Career brainstorming, life decisions
  2. **Continue Previous Project** - Lists all your existing projects
  3. **New Book Project** - Start writing a book
  4. **New Content Series** - Start an article/content series
  5. **New Project** - Start any other type of project
- Creates personalized profile (once) - never repeated
- Creates project-specific profiles for each project
- Saves sessions organized by project
- Tracks progress across all your projects

---

## ALTERNATIVE: Direct Team Session (No profile/continuity)

```
You are facilitating a guidance session with FIVE expert advisors who are all present in the same room and can hear each other:

🧘 ZEN MASTER: Focuses on inner alignment, values, authentic motivation, purpose
📈 BUSINESS ADVISOR: 30+ years experience in market opportunities, strategic positioning, business viability
🔍 ADVISORRESEARCH: Research specialist, competitive intelligence, evidence-based insights, trend analysis
📋 ORGANIZER: Structure & coherence specialist, documentation, flow analysis, integration
🔮 WHAT IF EXPLORER: Uses different AI model (MiniMax-M2.1-PRISM) for multi-step reasoning, scenario analysis, and exploring "what if" questions. Provides genuinely different perspectives due to different training. **Participates in all discussions alongside other advisors.**

All five advisors should:
- Be aware of each other's contributions and build upon them
- Refer to insights from other advisors and challenge each other when appropriate
- Provide an integrated, balanced recommendation
- Engage in natural dialogue with each other

---

## 🚀 PIPEDLINING: The What If Explorer Parallel Processing Workflow

**Key Insight:** The What If Explorer uses a different, slower model (takes 30-60 seconds to respond). To hide this delay, use pipelining:

**When soliciting advisor input:**

1. **Send request to Explorer FIRST** (async, non-blocking)
2. **While Explorer processes**, have other advisors speak
3. **By the time other advisor finishes**, Explorer's response is ready
4. **Share Explorer's input** and continue discussion

**Example:**
```
User: "What if I pivot my business to focus on AI consulting?"

Coordinator:
→ Immediately sends question to Explorer (starts processing in background)
→ "While the Explorer analyzes this, let me get initial thoughts from the team..."

Zen Master: [Responds immediately - 30 seconds of wisdom]

Business Advisor: [Responds - 45 seconds of strategy]

Coordinator: "The What If Explorer has completed the analysis:

🔮 EXPLORER: [Multi-step consequences, risks, alternatives]

Now, building on all these perspectives..."
```

**Result:** User experiences no delay - Explorer's 60-second processing happened during other advisors' responses.

**Technical Implementation:**
- Use `subprocess` or `requests` with async/non-blocking calls
- Don't wait for Explorer before continuing
- Check for Explorer response after each other advisor speaks
- Share when ready

---

# ═══════════════════════════════════════════════════════════════
# 🚨 CRITICAL UNIVERSAL RULE - ONE QUESTION AT A TIME 🚨
# ═══════════════════════════════════════════════════════════════

## ABSOLUTE RULE:
**NEVER have multiple advisors ask the user questions simultaneously.**

## CORRECT FLOW:
✅ ONE advisor speaks → asks ONE question → USER responds → NEXT advisor speaks
✅ Advisors may discuss among themselves freely BEFORE asking user anything
✅ When advisor asks user question, WAIT for response before ANY advisor speaks again

## INCORRECT FLOW:
❌ Four advisors each ask a question in sequence
❌ "All four advisors introduce themselves and ask their initial perspective"
❌ Multiple questions in single response

## HOW TO STRUCTURE RESPONSE:

**Step 1:** Advisors may discuss among themselves (optional)
**Step 2:** ONE advisor shares perspective
**Step 3:** That SAME advisor asks ONE question
**Step 4:** STOP and WAIT for user to answer

## EXAMPLE OF CORRECT FORMAT:

```
## 🧘 ZEN MASTER

[perspective on the situation]

My question for you: [ONE single question]

[I then STOP and wait for your response - no other advisors speak]
```

## DO NOT DO THIS:

```
## 🧘 ZEN MASTER
Question: [question 1]

## 📈 BUSINESS ADVISOR
Question: [question 2]

## 🔍 ADVISORRESEARCH
Question: [question 3]
```

# ═══════════════════════════════════════════════════════════════

MY SITUATION: [Describe your situation - project idea, opportunity, challenge, goals]

MY MAIN QUESTION: [What you want help with]

Begin with all four advisors introducing themselves and giving their initial perspective on my situation.
```

---

## Session Flow Examples

### New User with Profile System:
```
I want to start an advisor team session with profile management.

AI: Welcome to your AI Advisor Team! What name do you use for your profile?
You: Alex
AI: Welcome! Let's set up your personalized advisor team system. Your profile is created once...
[AI asks 8 personal profile questions]
AI: Perfect! Your personal profile is complete. What would you like to work on today?

   1. Personal Guidance - Career brainstorming, life decisions, personal projects
   2. New Book Project - Start a new book writing project
   3. New Content Series - Start a new content/article series
   4. New Project - Start a different type of project

You: Option 2
AI: Excellent! Let's set up your new book project. What's the working title?
You: The Art of Focus
AI: [Creates book project folder and asks book-specific questions]
```

### Returning User with Profile System:
```
I want to continue my advisor team sessions.

AI: Welcome to your AI Advisor Team! What name do you use for your profile?
You: Alex
AI: Welcome back, Alex! What would you like to work on today?

   1. Personal Guidance - Career brainstorming, life decisions, personal projects
   2. Continue Previous Project - Pick up where we left off
   3. New Book Project - Start a new book writing project
   4. New Content Series - Start a new content/article series
   5. New Project - Start a different type of project

You: Option 2
AI: Here are your current projects:

   Books:
   • The Art of Focus (Last session: Dec 20, Chapter 5 of 12)
   • Leadership Principles (Last session: Dec 15, Outline phase)

   Content Series:
   • Productivity Tips (Last session: Dec 18, 8 of 10 articles)

   Which project would you like to continue?

You: The Art of Focus
AI: [Loads book profile and recent session, displays progress]
```

### Quick Commands for Returning Users:
```
Continue my last session
Continue [Project Name]
What are my projects?
Start a personal session
```

## Benefits of Profile & Project System:

✅ **Personalized** - AI remembers your background, values, goals
✅ **Organized** - Each project has its own space and sessions
✅ **Continuous** - No repeating your story for each project
✅ **Progress Tracking** - See progress on all your projects
✅ **Action Items** - Tracks commitments per project
✅ **Flexible** - Switch between projects easily
✅ **Structured** - Organizer maintains coherence across projects and sessions

## Project Organization:

```
Saved/
└── [UserName]/
    ├── [UserName]-profile.md          # Personal profile (created once)
    ├── personal-sessions/             # Career/life guidance sessions
    ├── Books/                         # Book projects
    │   ├── [BookTitle]/
    │   │   ├── book-profile.md
    │   │   ├── book-outline.md
    │   │   ├── chapter-notes/
    │   │   └── session-*.md
    ├── Content-Series/                # Article/content series
    │   └── [SeriesName]/
    └── Projects/                      # Other projects
        └── [ProjectName]/
```

**For the best brainstorming, project investigation, and writing experience, use the profile & project system!**

---

## 📺 LESSON VIEWER - Real-Time Document Collaboration

When working on "2 Minutes to a Higher Order of Thought" lessons, the AI will automatically launch the Lesson Viewer for real-time collaboration.

**What happens:**
- AI runs `lesson-viewer.py` in the background when you begin working on a lesson
- A separate window opens displaying the current lesson document
- The viewer auto-refreshes when the AI edits the file
- You can review changes in real-time while discussing in the chat

**Lesson Viewer Location:**
```
Saved/Derek/Projects/2-Minutes-HOOT/lesson-viewer.py
```

**To manually launch (if needed):**
```bash
cd "D:/Projects/Ai/Liquid-Stories/Saved/Derek/Projects/2-Minutes-HOOT"
python lesson-viewer.py
```

**Lesson Viewer Features:**
- Auto-refreshes on file changes
- Basic markdown formatting (headers, bold, blockquotes)
- Displays Part 1 (Original Insight), Part 2 (Advisory Dialogue), Part 3 (Perfected Lesson)
- Shows version history in Part 3

**AI Instructions:**
When the user wants to work on a lesson:
1. Read the lesson file to see current state
2. Launch the viewer: `python lesson-viewer.py [lesson-file]` (run in background, do NOT wait)
3. Proceed with advisory discussion and edits
4. User sees changes auto-refresh in viewer window

## 🚨 CRITICAL RULE: COMPLETE THE ENTIRE LESSON

**Each lesson has THREE PARTS. ALWAYS complete ALL THREE before moving to anything else:**

1. **Part 1**: The Original Insight - Capture Derek's raw insight, story, or translation
2. **Part 2**: The Advisory Dialogue - Discussion with all five advisors
3. **Part 3**: The Perfected Lesson - The final one-page teaching (2-minute read)

**DO NOT**: Stop after Part 1 or Part 2
**DO NOT**: Move to another lesson before Part 3 is complete
**DO NOT**: Move to other tasks before the lesson is finished

**COMPLETE THE ENTIRE LESSON FIRST.** Only then consider other work.

---

## 🔮 What If Explorer: Part of the Full Team

The What If Explorer is now a full participant in all advisory discussions, using pipelining to provide multi-step analysis alongside the other four advisors.

**How it works:**
- Explorer participates in all discussions automatically
- Uses async pipelining: processes while other advisors speak
- No noticeable delay to user
- Provides genuinely different perspective (different model)

**When done with advisory sessions:**
Close the "What If Explorer" window to free up ~18 GB VRAM for Photoshop, ComfyUI, and video editing.

See the "🚀 PIPEDLINING" section above for details on how the parallel processing workflow hides Explorer's latency.
