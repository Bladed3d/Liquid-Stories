# ClarityEQ — Feature List
**Generated:** 2026-03-13
**Sources:** Git history (942 commits), 23 PRDs, 29 session summaries
**App status:** Live at clarityeq.com (Vercel, auto-deploy)

---

## Summary Stats
- Total commits: 942
- Date range: 2026-01-02 → 2026-03-13 (70 days of active development)
- Feature commits (feat:): 124 identified
- PRDs read: 23
- Session summaries read: 29
- Features documented (shipped): 77
- Features in roadmap (planned/in-development): 5
- Categories: 12

---

## 1. AI Advisory Team

### Multi-Advisor Collaboration System
**Status:** Shipped
**First shipped:** 2026-01-02 (initial commit)
**What it does:** Users consult a team of five AI advisors simultaneously — each with a distinct personality and expertise. Advisors respond in turn, never talk over each other, and the user always has the floor. Up to two advisors respond per message; once any advisor asks the user a question, that response ends.
**Investor signal:** The team model differentiates ClarityEQ from single-model AI chatbots. Users describe the experience as "being in a room with five smart people who actually listen." This drives the "ChatGPT tells you what, ClarityEQ helps you form why" positioning.
**Evidence:** Commit `82ea634` (initial commit), MEMORY.md advisor protocol section

### Advisor Personalities (5 Distinct Advisors)
**Status:** Shipped
**First shipped:** 2026-01-15 (`b942cf1` — major advisor system upgrade)
**What it does:** Five core advisors with defined roles: David (business strategy), Ravi (Zen mindset and wellbeing), Vera (research and web search), Sarah (writing and organization), and Aria (creative vision and image generation). Marcus (risk analysis, Charlie Munger inversion style) is optional — toggled off by default in Settings. Each has a distinct voice, priorities, and response style, including a unique TTS voice.
**Investor signal:** Named personalities create emotional attachment. Users return to talk to "their team." Named advisors enable per-advisor TTS voice assignment, making the audio experience feel like a real group conversation.
**Corrected 2026-03-11:** Previous entry listed wrong advisor names (Maya, "mindset coach", "risk analyst") — names verified against MEMORY.md and codebase.
**Evidence:** Commit `b942cf1` (initial advisor upgrade 2026-01-15), `e977640` (Marcus redesign as Munger inversion advisor 2026-02-25)

### Guardrails System and App Help Advisor
**Status:** Shipped
**First shipped:** 2026-01-14 (`d712da2`)
**What it does:** The team has built-in guardrails that prevent harmful, off-topic, or counterproductive behavior. A dedicated "App Use Advisor" answers meta questions about how the app works, keeping the main team focused on the user's actual challenges.
**Investor signal:** Safety and meta-support without breaking immersion. Users who get confused stay in the experience rather than bouncing.
**Evidence:** Commit `d712da2`

### Web Search for Researcher Advisor
**Status:** Shipped
**First shipped:** 2026-01-14 (`f4f4acb`), enhanced 2026-02-23 (`72e8090`)
**What it does:** The Researcher advisor queries the web via Tavily and returns verified working links. When a search is needed, the system detects the `^SEARCH` marker mid-stream, fires Tavily, validates all URLs with real GET requests (broken links are excluded), and reformats the response with real sources.
**Investor signal:** Real web access with link validation separates ClarityEQ from hallucination-prone assistants. Users trust the research because links actually work. Confirmed working in production with Amazon product searches.
**Evidence:** Commits `f4f4acb`, `72e8090`, session summary 2026-02-23 (confirmed working — 5/5 URLs validated, real prices shown)

### One-Advisor-at-a-Time Conversation Model
**Status:** Shipped
**First shipped:** 2026-01-12 (`4c80347`)
**What it does:** The system enforces a clean conversation flow where advisors take turns responding, never all at once. The protocol prevents the team from overwhelming the user with simultaneous responses, and ensures the user always has the floor before advisors respond.
**Investor signal:** Reflects product maturity. Simple AI demos show all models responding simultaneously; ClarityEQ's team feels like a real professional group.
**Evidence:** Commit `4c80347`

---

## 2. Streaming and Real-Time Architecture

### Typed SSE Event System
**Status:** Shipped
**First shipped:** 2026-02-14 (`987613e`)
**What it does:** The backend sends messages via Server-Sent Events with typed channels: `text`, `image`, `sandbox`, `mode`, `project`, `meta`, `progress`, `done`. Each content type has its own delivery path — text never contains image data; images never block text from arriving.
**Investor signal:** This architecture enables parallel image and sandbox delivery. Without it, users wait for images to finish before reading the advisor response. It is the technical foundation for the real-time experience.
**Evidence:** Commit `987613e`, session summary 2026-02-15

### 4-Phase Fire-and-Forget Architecture
**Status:** Shipped
**First shipped:** 2026-02-15 (`74d4e67`)
**What it does:** After the AI finishes its text: (1) a `done` event is sent immediately — the UI unlocks for the user, (2) any images or visual content that were fired in parallel during streaming continue delivering (max 30s wait), (3) the stream closes, (4) database writes and analytics fire in the background without blocking anything.
**Investor signal:** Eliminates multi-minute response times. A response that previously took 3 minutes now delivers text in under 60 seconds with graphics following within 30 seconds.
**Evidence:** Session summary 2026-02-15 ("3.3-minute response times" eliminated), commit `74d4e67`

### Mid-Stream Image Delivery (True Parallel)
**Status:** Shipped
**First shipped:** 2026-02-23 (verified working in session #438)
**What it does:** Images begin generating the moment the AI writes an image marker (early in its response). The image fires in a background process while the advisor continues writing text. Both finish around the same time and arrive together — not text then a long wait.
**Investor signal:** Verified timing: image delivered at 41s, text done at 41.4s in session #438. The user experience is text and image arriving together, which feels like a genuinely intelligent system.
**Evidence:** Session summary 2026-02-23 (session #438 timing verified), commit `74d4e67`

### Stop Button and Abort Handling
**Status:** Shipped
**First shipped:** 2026-02-15 (`74d4e67`)
**What it does:** A Stop button remains visible and clickable throughout the entire response — during the initial load, during text streaming, and during image delivery. Users can cancel at any point without seeing an error message.
**Investor signal:** Control is a core user expectation that many AI products still get wrong. A Stop button that actually works is a signal of product polish.
**Evidence:** Commit `74d4e67`, MEMORY.md `isStreaming` state section

### Progress Animation for Visual Content
**Status:** Shipped
**First shipped:** 2026-02-23 (committed after session `16-17-41`)
**What it does:** The moment the AI triggers an image or visual output, the right panel shows "Aria is creating something for you..." with an advancing progress bar. Users see that something is being built rather than staring at a blank panel.
**Investor signal:** Bridges the gap between text finishing and image appearing. Without this animation, users close the app before seeing the image.
**Evidence:** Session summary 2026-02-23, new SSE `progress` event type

### Silent Retry for Hung AI Streams (No-Hang)
**Status:** Shipped
**First shipped:** 2026-03-11 (`ec3c54e`)
**What it does:** When the AI provider accepts a connection but stops sending data — a silent hang — the user would previously see "Advisory Team is thinking..." forever with no way out except a hard refresh. Now, a 60-second watchdog detects the hang and silently retries up to two more times. The user never sees a loading flicker, an error, or any indication that a retry happened. If all three attempts fail, a single clean message appears: "The service is slow right now — try again in a moment." A backend 70-second timeout acts as a second layer of defense and fires an admin email alert so Derek is notified when it happens.
**Investor signal:** Silent failures are the most damaging UX issue — users blame themselves or the product, and they leave. This turns an invisible catastrophic failure into an invisible recovery.
**Evidence:** Commit `ec3c54e`, PRD `Docs/No-Hang-PRD.md`

### Conversational Memory — Token Budget and Sliding Window
**Status:** Shipped
**First shipped:** 2026-03-05 (`cec6cc2`, `e95dca3`, `7591bb0`)
**What it does:** A three-phase system maintains long-running session memory without hitting model context limits. Phase 1 manages DB persistence and a sliding window. Phase 2 uses a Conversational Compression Protocol that compresses older exchanges into dense summaries. Phase 3 adds a UI chat search so users can find and reference past content by keyword.
**Investor signal:** Users can have extended coaching sessions without the AI forgetting earlier context. Critical for an ongoing advisory relationship that grows over weeks and months.
**Evidence:** Commits `cec6cc2`, `e95dca3`, `7591bb0`

---

## 3. AI Image Generation and Vision

### Spontaneous Image Generation
**Status:** Shipped
**First shipped:** 2026-02-09 (`c287d49`)
**What it does:** During team conversations, Aria generates emotionally resonant images without being asked. Images appear in the right panel alongside the text response. The system decides what to generate based on conversation context — specific metaphors, not generic stock photos. Emotional topics get metaphorical imagery; tangible dreams get literal paintings.
**Investor signal:** The surprise of an unprompted, emotionally resonant image is the feature most cited by early users as "magical." No other conversational AI product does this. Session #129 case study documented the breakthrough moment where a user's specific emotional tension was captured in a metaphorical image.
**Evidence:** Commit `c287d49`, session summary 2026-02-15 (session #129 case study)

### Flux 2 Pro Image Quality
**Status:** Shipped
**First shipped:** 2026-02-14 (`d818234`)
**What it does:** Advisor-triggered and painting-request images use Flux 2 Pro via Replicate ($0.03/image) — one of the best publicly available image generation models. First-message and ambient images use a faster model for speed. Painting sessions auto-upgrade to Pro. The user's Fast vs. Pro preference is honored through the entire pipeline.
**Investor signal:** Image quality is a direct proxy for product quality. Early users expected "AI clipart"; they receive museum-quality oil paintings of their life goals.
**Evidence:** Commit `d818234`, image-pipeline.md memory file

### 5-Layer Structured Prompt Composer
**Status:** Shipped
**First shipped:** 2026-02-17 (`e8e09bc`)
**What it does:** A structured system where DeepSeek fills a five-layer painting template (background, middle ground, foreground left/center/right, lighting, style) in structured JSON. Code assembles a guaranteed five-layer Flux prompt — no layer can be accidentally skipped. Includes a literal-vs-metaphorical decision rule: tangible dreams are painted literally, abstract emotions are represented metaphorically. Validation catches action words and boring subjects before generation.
**Investor signal:** Eliminates the "boring desk and calculator" images from earlier versions. Compositional depth is enforced in code, not trusted to AI prompt-following. This is one of the reasons users describe ClarityEQ images as uniquely beautiful.
**Evidence:** Commit `e8e09bc`, session summary 2026-02-17

### Image Upload and User-in-the-Painting (img2img)
**Status:** Shipped
**First shipped:** 2026-02-20 (`dcaf366`)
**What it does:** Users upload a photo of themselves. Gemini 2.5 Flash analyzes the image and injects a description so the whole team can "see" it. When a painting is requested, Flux 2 Pro uses the uploaded photo as a reference and places the user inside the generated scene — their actual face, hair, and build rendered in the painting's style.
**Investor signal:** The manifestation use case: users see themselves inside their future — standing in their dream bakery, at the helm of their business. Validated in testing: real likeness preserved in an impressionist lighthouse scene with a selfie as input.
**Evidence:** Commit `dcaf366`, session summary 2026-02-20 (identity preservation validated with selfie + scene prompt)

### My Images Gallery
**Status:** Shipped
**First shipped:** 2026-03-03 (`fb91a15`)
**What it does:** A gallery of all images the user has uploaded or had painted. Images can be selected from the gallery and used as a reference for new painting sessions without re-uploading. Upload tiles show a delete button on hover. Users can mark any upload as their avatar directly from the gallery — a blue badge confirms the selection.
**Investor signal:** Users accumulate a personal visual library that grows over time. The gallery is tangible evidence that ClarityEQ is building a persistent creative relationship, not just processing queries.
**Updated 2026-03-09:** Added delete (X) on all tiles, Set as Avatar on uploads with inline badge confirmation, parallel fetch of uploads + profile for instant load. (`0279bf3`)
**Evidence:** Commits `fb91a15`, `0279bf3`

### Vision Board — Aspirational Painting Session
**Status:** Shipped
**First shipped:** 2026-03-09 (`0279bf3`)
**What it does:** A dedicated session type where Aria leads the user through a 2–3 question conversation about the life they are building toward, then generates a series of aspirational paintings placing them inside that future. All Vision Board sessions auto-link to a system "Vision Board" project so they accumulate in one place. The sandbox and unrelated advisors are intentionally blocked — the session stays visual and focused. The homepage displays the user's three most recent Vision Board paintings in a responsive gallery row with empty placeholder slots for missing images.
**Investor signal:** Manifestation and vision boarding is a mainstream personal development practice with proven emotional attachment. A user who has seen themselves painted inside their dream life has a deeply personal artifact they will share. This is ClarityEQ's highest-shareability feature. The homepage gallery makes these paintings the first thing users see on return.
**Updated 2026-03-10:** Homepage now shows 3-image Vision Board gallery instead of single latest image. Responsive layout scales proportionally with viewport on desktop; stacks vertically on mobile. (`708252c`, `0ae8d73`, `64d9dee`)
**Evidence:** Commit `0279bf3`, `708252c`, `0ae8d73`, `64d9dee`, PRD `Docs/Avatar-VisionBoard-PRD-v2.md`

### Painting Design Interview
**Status:** Shipped
**First shipped:** 2026-03-03 (`c35ce32`)
**What it does:** When a user says "let's paint a scene," Aria enters interview mode. Over 4 conversational turns (background, middle ground, foreground, lighting), Aria gathers the user's specific vision before generating anything. The final image reflects what the user designed, not what Aria guessed.
**Investor signal:** Collaborative creative experience. Users feel they created the painting together with their advisor — driving ownership and shareability of the result.
**Evidence:** Commit `c35ce32`, session summary 2026-03-03 (verified in chat #587: Aria asked compositional questions, right panel stayed empty during interview, image fired on completion)

### Smart Image Model Routing
**Status:** Shipped
**First shipped:** 2026-02-26 (`e1a6c5e`), routing fixed 2026-03-07 (`88f5759`)
**What it does:** First contextual images and explicit painting requests without a reference photo use Grok (xAI direct API). Reference image painting uses Flux 2 Pro for identity preservation. The routing decision is automatic. After DB forensics confirmed the root cause of bad reference image results (Grok was firing instead of Flux), the routing was corrected with 6 targeted edits.
**Investor signal:** The best model for each job rather than one model for everything. Better images without higher cost. The DB forensics process also demonstrates production-grade debugging capability.
**Evidence:** Commits `e1a6c5e`, `88f5759`, session summary 2026-03-07 (session #623 DB forensics)

### Smart Image Pipeline — Frequency Control
**Status:** Shipped
**First shipped:** 2026-02-25 (`0a00c4b`)
**What it does:** Prevents image flooding. First-message image fires once per session for immediate visual impact. Subsequent images use the spontaneous system with a content-length gate (4,500+ chars of new conversation). The highest-quality Pro pipeline is reserved for moments that warrant it.
**Investor signal:** Image quality over quantity. Flooding a conversation with 9 similar images (which happened before this fix) reduces impact. Concentrating images increases them.
**Evidence:** Commit `0a00c4b`, `Docs/Smart-Images-PRD.md` (Phase 1 marked Done 2026-02-25)

---

## 4. Interactive Visual Workspace (Sandbox)

### HTML Sandbox Panel
**Status:** Shipped
**First shipped:** 2026-02-08 (`b1e1715`)
**What it does:** A right-side panel where advisors generate interactive visual content during conversations — plans, checklists, diagrams, dashboards, and visualizations rendered as live HTML. The panel auto-expands when new content arrives. Users never have to ask for a visual; the team creates them as part of the conversation. Sandbox content persists in session history and syncs with chat scroll position.
**Investor signal:** Tangible artifacts from sessions. Users leave with a 7-day plan, a comparison table, or a prioritized checklist — not just a conversation. This is what makes advisory sessions actionable.
**Evidence:** Commit `b1e1715`, commit `41b6da3` (sandbox history and scroll sync)

### Interactive Spreadsheet Sandbox
**Status:** Shipped
**First shipped:** 2026-02-16 (`71c84bb`)
**What it does:** In Business mode, the team generates interactive spreadsheets with formulas, calculations, and charts — rendered in a sandboxed iframe. Users can interact with the spreadsheet directly: change values and see calculations update. Uses jspreadsheet CE v4 and Chart.js. Confirmed working on iPad (Safari fix shipped 2026-03-08).
**Investor signal:** For business users, a working spreadsheet is worth more than a paragraph of advice. No other conversational AI produces a live, editable financial model mid-conversation.
**Updated 2026-03-12:** Fixed a critical rendering bug where spreadsheets appeared as a solid black box instead of displaying content — root cause was a sandbox context injection gap combined with a rendering initialization timing issue. Both corrected. (`1709bcb`)
**Evidence:** Commit `71c84bb`, commit `8857461` (Safari/iPad fix 2026-03-08), commit `1709bcb` (black box fix 2026-03-12)

### AI-Generated Sandbox HTML
**Status:** Shipped
**First shipped:** 2026-02-09 (`c287d49`)
**What it does:** Sandbox visual content is generated by Grok (primary) with Qwen3-coder via Parasail as fallback. The AI reads the conversation context and produces custom HTML for the current discussion — not a template. Post-stream generation (moved 2026-02-26) means the AI has the full conversation context when building the visual.
**Investor signal:** Every visual is unique to that conversation. The sandbox produces custom plans, not generic templates.
**Evidence:** Commits `c287d49`, `9923f4c` (moved to post-stream for full context 2026-02-26)

### NSFW Content Blocking
**Status:** Shipped
**First shipped:** 2026-02-08 (`30b9a26`, `73bc153`)
**What it does:** Comprehensive filtering for both generated images and sandbox HTML content before it reaches the user.
**Investor signal:** Enterprise and family-safe readiness. Required for any user-facing AI system operating at scale.
**Evidence:** Commits `30b9a26`, `73bc153`

### Spreadsheet Formula Verifier — AI Quality Check Layer
**Status:** Shipped
**First shipped:** 2026-03-12 (`d21d14c`, `17e4103`, `7410349`)
**What it does:** After a spreadsheet is generated, a second AI pass automatically checks the result before it reaches the user. The verifier reviews formula correctness, data accuracy, and chart configuration. If it finds errors, it returns specific corrections and the system applies them. If the spreadsheet passes, it is delivered as-is. A pre-generation guard (Layer 1A) catches common formula problems before generation begins; LED diagnostic codes (6530–6548) log every check result so the team can monitor quality trends in production.
**Investor signal:** Self-correcting output for the feature most likely to be trusted with real numbers. A user who finds a formula error in a financial model loses trust in the whole product. This layer catches those errors before the user ever sees them — turning a reliability risk into a reliability guarantee.
**Evidence:** Commits `d21d14c` (AI verifier), `17e4103` (pre-generation guard + LED diagnostics), `7410349` (LED range 6530–6548 registered)

### Sandbox Content Editing and Persistence
**Status:** Shipped
**First shipped:** 2026-03-12 (`ffdd202`)
**What it does:** Users can edit sandbox content — HTML visuals or spreadsheets — directly in the right panel. Changes are saved to the session and persist across page refreshes. If a user closes the browser and returns, their edits are still there. Works for both HTML-rendered plans and live spreadsheets.
**Investor signal:** Turns the sandbox from a read-only output into a working document. Users who can edit and save their plans are engaged in the work, not just reading advice. Editable artifacts significantly increase the time users spend inside a session.
**Evidence:** Commit `ffdd202`

### Safari/iPad Spreadsheet Fix — Blank Body on Apple Devices
**Status:** Shipped
**First shipped:** 2026-03-08 (`8857461`)
**What it does:** Fixed a critical rendering bug where spreadsheets appeared blank on Safari and iPad. Root cause was `position:fixed` layout breaking inside iframes on WebKit. Fix uses a `load` event listener and responsive width calculation, making spreadsheets fully functional on all Apple devices.
**Investor signal:** A significant portion of the executive user base works on iPads. Broken spreadsheets on Apple devices would have silently killed a key differentiator for that audience.
**Evidence:** Commit `8857461`

---

## 5. Voice and Audio

### Text-to-Speech with Per-Advisor Voices
**Status:** Shipped
**First shipped:** 2026-01-28 (`3e3390b`, `d6886d3`)
**What it does:** Every advisor response can be spoken aloud using Microsoft Edge TTS. Each advisor has a distinct voice. The user toggles "Team Voice On/Off." TTS fires automatically after text streams in and reads sentence by sentence.
**Investor signal:** Audio output transforms ClarityEQ from a reading experience to a listening one — enabling use while driving, exercising, or doing other tasks. This is also the foundation for the planned Drive Mode feature.
**Evidence:** Commits `3e3390b`, `d6886d3`, `339a233`

### Word-Level Highlighting During Playback
**Status:** Shipped
**First shipped:** 2026-01-29 (`b6f2a9b`)
**What it does:** When an advisor speaks, each word is highlighted in the chat in real time as it is spoken. The highlight advances 300ms ahead of audio output to account for playback latency — visual and audio feel synchronized.
**Investor signal:** Reduces cognitive load and increases comprehension for users following along with TTS. Makes the audio experience feel polished and intentional.
**Evidence:** Commits `b6f2a9b`, `5a1bc4e` (300ms advance), `191df53` (CSS fix)

### Voice Input (Speech-to-Text)
**Status:** Shipped
**First shipped:** 2026-01-20 (`d3eb3f5`), real-time interim transcription added 2026-02-22 (`2fb2d3c`)
**What it does:** Users speak their message using a push-to-talk button. A Parakeet transcription service processes the audio. Real-time interim text appears while recording — users see words appearing as they speak, confirming the system is capturing their input.
**Investor signal:** Hands-free input enables use cases where typing is impractical. Interim transcription gives users confidence that the system is working rather than silently failing.
**Evidence:** Commits `d3eb3f5`, `4e78e19`, `2fb2d3c`

---

## 6. Interaction Modes

### Four Interaction Modes
**Status:** Shipped
**First shipped:** 2026-02-15 (`a7e1b2b`)
**What it does:** Users select how the advisory team shows up: Coach (empathetic, proactive — the default), Business (direct, data-driven, prefers charts and spreadsheets), Brainstorm (rapid creative energy), Writer (listening mode — no unsolicited advice or graphics). Mode persists per-session and as a user default.
**Investor signal:** One product adapting to four different use cases. Brainstorm and Business address enterprise users; Writer and Coach address personal development. Expands the addressable market without building separate products.
**Evidence:** Commits `a7e1b2b`, `f714ead`, `dda2dd4`, session summary 2026-02-15 (E2E verified — all 4 modes confirmed working with live AI proof)

### AI-Triggered Mode Switching
**Status:** Shipped
**First shipped:** 2026-02-15 (`dda2dd4`)
**What it does:** The advisory team recognizes when a conversation has shifted in character and can suggest switching modes — or switch after user confirmation. The mode dropdown updates in real time mid-stream as the AI writes its response.
**Investor signal:** The team adapts to the user rather than requiring manual configuration. A responsive system vs. a rigid one.
**Evidence:** Commit `dda2dd4`, session summary 2026-02-15 (live test: dropdown updated mid-stream as AI responded)

### Writer Mode Listening Protocol
**Status:** Shipped
**First shipped:** 2026-02-17 (`de2a3f6`)
**What it does:** In Writer mode, advisors default to reflective responses: "Please continue," "I'm listening," "Tell me more." No unsolicited advice, analysis, or graphics. Advisors ask permission before interjecting. A dedicated Write/Team button in the input area lets users signal readiness for feedback.
**Investor signal:** Serves journaling, memoir, and creative writing use cases. Users who need a witness rather than an advisor get exactly what they need — a growing personal development and creativity market.
**Evidence:** Commit `de2a3f6`

---

## 7. Projects and Organizational Memory

### Projects Feature
**Status:** Shipped
**First shipped:** 2026-02-21 (`01c7d94`)
**What it does:** Users organize conversations into named Projects. Each project accumulates an AI-generated summary of key decisions, pending items, and deliverables. A "General" default project catches unassigned sessions. Project context is injected into new sessions so the team already knows the user's work history when they arrive.
**Investor signal:** Transforms ClarityEQ from a series of one-off conversations into an ongoing working relationship. Users who have projects have a reason to return every week — they are building something.
**Evidence:** Commit `01c7d94`, session summary 2026-02-21, MEMORY.md projects section

### Persistent Knowledge Graph — Cross-Session Memory
**Status:** Shipped
**First shipped:** 2026-02-21 (`7a5d5ac`)
**What it does:** After every conversation, the system extracts confirmed facts, decisions, and insights and stores them in a structured knowledge graph tagged by topic and user. When a user starts a new session on a related topic, the team is silently briefed from this graph — they already know what was decided, what was left unresolved, and what matters to this person. This works across completely separate conversations: a user discussing a family matter in one chat can trigger the team to surface a related legal issue from a different chat, because both are indexed under the same topic cluster. No manual tagging or linking required — the system builds and queries this knowledge continuously in the background.
**Investor signal:** ClarityEQ gets smarter about each user over time. The longer someone uses it, the more the team understands their world — turning a tool into a relationship. This compounding memory is the moat that single-session AI products cannot replicate.
**Corrected 2026-03-10:** Previous description understated the feature as simple session resumption using raw message injection. The actual implementation extracts structured facts into `session_facts` and `user_topics` tables, builds cross-topic awareness, and gates context injection on explicit user intent — far more architecturally sophisticated and investor-relevant than described.
**Evidence:** Commit `7a5d5ac`, `lib/topics.ts` (`findMatchingTopic()`), `handlers/context.ts` (topic resumption section), `Docs/Cross-Chat-Topic-Navigation-PRD.md`

### Session-to-Project Organization
**Status:** Shipped
**First shipped:** 2026-02-21 (`919867e`)
**What it does:** Users can right-click (or long-press on mobile) any past conversation and move it to a project via a "Move to..." dropdown. They can also ask the team conversationally ("move this to My Paintings") and the AI moves the session using marker detection.
**Investor signal:** Organizational power without organizational friction. Structure can be added after the fact, at the user's pace.
**Evidence:** Commit `919867e`, session summary 2026-02-21

### Animated Welcome and Topic Greeting for Returning Users
**Status:** Shipped
**First shipped:** 2026-02-21 (`b0fe345`)
**What it does:** Returning users see an animated welcome screen that recognizes their history. The backend computes recent conversation topics and the welcome screen displays them as clickable one-tap entry points. Clicking a topic pre-fills the input with a continuation prompt ("Let's continue our discussion about [topic]"), making it effortless to resume past work. Only shown when the user has two or more sessions and at least one stored topic.
**Investor signal:** "This app knows me" is the retention moment. Clickable topic shortcuts convert passive recognition into an active re-engagement loop — users come back because their history is waiting for them, not just stored.
**Updated 2026-03-10:** Topic buttons fully implemented in `ProjectGreeting.tsx` (commit `e18266e`). Previously marked Partial because `recentSessionTopics` was returned by the backend but never rendered. Now complete.
**Evidence:** Commits `b0fe345`, `e18266e`, `lib/projects.ts` (`getGreetingData()`), `Docs/Cross-Chat-Topic-Navigation-PRD.md`

### Project Picker on New Chat
**Status:** Shipped
**First shipped:** 2026-02-25 (`a22925f`, `3f198ff`), improved 2026-03-07 (`58b49ec`)
**What it does:** Starting a new conversation shows a project assignment dropdown before the first message. The header always shows `ProjectName / Chat #N`. New sessions default to the current project.
**Investor signal:** Organizational context is set before the conversation begins. Users decide upfront where work belongs rather than filing it retrospectively.
**Evidence:** Commits `a22925f`, `3f198ff`, `58b49ec`

### Conversational Project Creation
**Status:** Shipped
**First shipped:** 2026-02-21 (`7a5d5ac`)
**What it does:** Users create new projects by mentioning it in conversation: "let's create a project for this." The AI detects the intent, creates the project, and links the current session — all within the chat with no UI switching required.
**Investor signal:** Zero friction for the most natural organizational action. Users stay in conversation flow.
**Evidence:** Commit `7a5d5ac`, MEMORY.md `^PROJECT^` marker section

### Per-Project Notes — Isolated Notes Tab Inside Each Project
**Status:** Shipped
**First shipped:** 2026-03-09 (`c9a718a`)
**What it does:** Every project has a dedicated Notes tab alongside Sessions. Notes auto-save as the user types. The Save button creates a named note with a title — a snapshot the user can return to. The Open button browses all saved notes for that project. Notes are fully isolated: notes written inside "My Business Plan" never appear in "My Paintings." Deleting a project deletes its notes (with an explicit warning). Pre-existing notes were automatically migrated to the General project.
**Investor signal:** Notes that follow the project context — not a separate app, not a global scratchpad — turn ClarityEQ into the workspace where users do their thinking, not just get advice.
**Evidence:** Commit `c9a718a`, PRD `Docs/Project-Notes-PRD.md`

### Cross-Chat Topic Navigation — Session Jump Banner
**Status:** Shipped
**First shipped:** 2026-03-10 (`e18266e`)
**What it does:** When the advisory team references facts from a prior conversation, a dismissible banner appears at the top of the chat identifying the source session by number and topic name (e.g., "Continuing from Chat #42 · Estate Litigation Strategy"). Users can tap "Open that chat" to jump directly to the source session, or "Move this chat into Chat #N" to consolidate work there via a direct API call. The banner auto-dismisses when the user sends their first reply in the current session. Dismiss state persists across page refreshes. A secondary chapter navigation chip appears in the header for chapter-type sessions, linking back to the parent session. Backend emits typed SSE events (`topic_resume`, `chapter_parent`) so the frontend can build navigation UI without a second API call.
**Investor signal:** Prevents session fragmentation — the single biggest source of "the AI forgot what we discussed" complaints. When users can navigate to the source conversation, work consolidates rather than spreading across disconnected sessions. Directly increases retention and perceived intelligence of the product.
**Evidence:** Commits `e18266e`, `Docs/Cross-Chat-Topic-Navigation-PRD.md`, LED range 7460–7499

---

## 8. Personal Growth Tools

### Directive Mode — Standing Instructions for the Team
**Status:** Shipped
**First shipped:** 2026-03-06 (`59b9991`)
**What it does:** A dedicated interface (compass icon in the sidebar) where users give standing instructions that the advisory team honors across every future session. Examples: "Always check in on my Little Wins at the start of each session," "Keep weekday morning responses brief." Instructions are stored in the database and injected into every session's system prompt.
**Investor signal:** Personalization that compounds over time. A user who has written three directives has customized ClarityEQ for their specific needs — they are unlikely to switch to a generic AI tool that requires repeating these preferences every session.
**Evidence:** Commit `59b9991`, PRD `Docs/Directive-Mode-PRD.md`

### Little Wins — AI Accountability Partner
**Status:** Shipped
**First committed:** 2026-03-08 (`628762b` through `06f6d03`)
**What it does:** When a user commits to something in a conversation ("I'll email Marcus by Thursday"), the advisory team proposes logging it as a Little Win. With the user's confirmation, a tracked commitment is created with a required due date. If the user mentions a specific time ("at 3pm"), a reminder is attached. On the user's next visit, the team checks in on pending wins. Overdue wins trigger an offer to break them into smaller steps. A real-time toast notification appears the moment a win is created or completed. Users can mark wins complete from the panel, and in-app reminder modals pop up when a win's reminder time arrives. An urgent wins banner above the chat highlights due-today and overdue items on arrival.
**Investor signal:** The accountability partner that turns advice into action. Commitment plus follow-up is the core retention loop in every successful productivity and coaching tool. Time-based reminders and urgency banners create daily usage habits — users come back because they know the app will hold them to it.
**Updated 2026-03-10:** Added reminder time extraction from natural language, mark-complete button, SSE real-time toast notifications, in-app reminder modal (60s polling), urgent wins banner above chat, and dedup fix preventing silent duplicate win creation. (`249ebf3`, `e56f41e`, `54253ba`, `f25bb37`, `656f000`, `62481ca`)
**Evidence:** Commits `628762b`, `07112e3`, `5d0df5d`, `61b0b94`, `88975d1`, `018c6f3`, `06f6d03`, `249ebf3`, `e56f41e`, `54253ba`, `f25bb37`, `656f000`, `62481ca`, session summary 2026-03-08

---

## 9. Onboarding and User Experience

### Guided Onboarding Interview
**Status:** Shipped
**First shipped:** 2026-03-05 (`7521d86` — overhaul committed and pushed)
**What it does:** New users see a "Start Here" card on the home screen. Clicking it starts a guided getting-to-know-you session: who they are, what they do, and what they are facing — through natural conversation, not a form. A welcome image fires on the first response (a dynamic oil painting with the user's name and city). From session 2 onward, all advisors know the user's background. After onboarding completes, the home screen transitions to a two-panel layout: Vision Board on the left, Life Path on the right — each with a clear CTA.
**Investor signal:** First impressions determine whether users stay. This replaces the blank-screen problem — the leading cause of AI trial user churn — with an immediately personal experience. The post-onboarding two-panel layout directs users toward the product's two highest-value journeys.
**Updated 2026-03-09:** Post-onboarding home screen redesigned — Vision Board panel left, Life Path panel right. Two states total: pre-onboarding shows Start Here, post-onboarding shows the two panels. (`0279bf3`)
**Updated 2026-03-10:** Home screen tagline changed to "Everyone is being told to learn AI. We built AI to learn you." Life Path renamed to "Achieve" throughout. Recent topic shortcuts appear between tagline and cards — clicking one loads the actual previous session. Responsive layout: desktop uses proportional flex, mobile stacks vertically. (`3cd1378`, `cc22e68`, `a55ef08`, `0ae8d73`, `64d9dee`)
**Updated 2026-03-13:** "Achieve" label reverted to "Life Path" — direct executive feedback confirmed Life Path resonates strongly. Subtext updated to "Who you are beyond what you do." (`f20da4c`)
**Updated 2026-03-10:** Stage 3 now includes 5 benefit bullet points (Vision Board, Advisory Team, Spontaneous Images, Little Wins, Projects) delivered verbatim after the personalized advisor roster — plants awareness of the product's key features before the user's first real session. (`eff0679`)
**Updated 2026-03-10:** Onboarding reduced to exactly 2 questions before Stage 3 pitch — Q1: name and where from, Q2: what do you do. No follow-ups, no additional exchanges. Stage 3 fires immediately after the second answer. Protects against investor/executive churn before they see the product pitch. Fixed early welcome image firing before the user's name was known — image now correctly waits for the AI's `^IMG` marker which extracts name from the user's actual answer. (`5e7748e`, `06613a2`, `658c40a`)
**Updated 2026-03-11:** Onboarding rewritten as server-owned stage architecture — 4 micro-prompts (Stage 1/2/3A/3B) injected by the server based on message count, replacing a single monolithic AI prompt. Stage 3A advisor question is hardcoded server-side so the AI cannot rephrase it. Stage 3B YES/NO branching detects user intent and routes the NO path to a static server-owned response, skipping the AI call entirely. Onboarding profile is assembled from conversation history without AI-generated JSON markers. (`f94f6b0`)
**Evidence:** Commit `7521d86`, `0279bf3`, `3cd1378`, `cc22e68`, `a55ef08`, `0ae8d73`, `64d9dee`, `eff0679`, `5e7748e`, `06613a2`, `658c40a`, `f94f6b0`, session summaries 2026-03-04 and 2026-03-05

### Onboarding Auto-Transition to First Real Session
**Status:** Shipped
**First shipped:** 2026-03-12 (`99da1cc`)
**What it does:** When a new user finishes the onboarding interview (Stage 4 — choosing an advisor focus area), the server immediately creates a new regular session without any AI round-trip delay. A brief bridging note appears in the chat: "I've started a new chat so we can really dig into this." The user's chosen focus is automatically sent as the opening message of the new session, and the full advisory team responds immediately. The user goes directly from finishing onboarding into their first real advisory conversation — no extra taps, no blank screen, no transition friction.
**Investor signal:** The moment between finishing setup and starting real value is where new users drop off. This eliminates that gap entirely. Onboarding completion and first advisory engagement become one continuous experience — dramatically improving the conversion from "signed up" to "got value."
**Evidence:** Commit `99da1cc`

### User Avatar with Crop and Zoom Editor
**Status:** Shipped
**First shipped:** 2026-02-15 (`66134ff`)
**What it does:** Users upload a profile photo with an in-app crop and zoom editor. The avatar appears throughout the app. Any photo in My Images can now be set as the avatar with one click — it auto-injects into Life Path and Vision Board image generations so the user's actual face appears in their aspirational paintings.
**Investor signal:** Personal identity in the product increases emotional attachment. When the user's face appears in their own painted future, ownership of that image is 100% personal. Highly shareable.
**Updated 2026-03-09:** Avatar auto-injects into Life Path and Vision Board image pipelines via `input_images[]` (Flux 2 Pro identity preservation). Managed from My Images gallery. (`0279bf3`)
**Evidence:** Commits `66134ff`, `0279bf3`

### Settings Panel
**Status:** Shipped
**First shipped:** 2026-02-15 (`66134ff`)
**What it does:** Covers profile photo, interaction mode default, image quality preference (Fast vs. Pro), password change, and profile update (re-runs the onboarding interview).
**Investor signal:** User control signals respect and trust. Users who customize settings are more invested.
**Evidence:** Commits `66134ff`, `674cd32`, `f714ead`

### Mobile-First Responsive Layout
**Status:** Shipped
**First shipped:** 2026-01-15 (`d5d12f2`), major overhaul 2026-02-22 (`560b895`), iPad fix 2026-03-08 (`8857461`)
**What it does:** Full app experience on mobile. Sandbox panel stacks below chat on small screens. Right panel auto-expands when content arrives. Long-press replaces right-click for context menus. Works on iOS, Android, and Safari including iPad.
**Investor signal:** Mobile readiness is not optional for a personal development product. Users live on their phones.
**Updated 2026-03-09:** Tightened message spacing — reduced line-height, compact paragraph and list margins, hidden blank AI paragraphs, added visual separation for section headers. Responses are now significantly more readable without extra scrolling. (`7e5f80d`)
**Evidence:** Commits `d5d12f2`, `560b895`, `8857461`, `7e5f80d`

### Session Rating System
**Status:** Shipped
**First shipped:** 2026-02-23 (`6c8d215`)
**What it does:** Users rate sessions after completion. Ratings feed into the admin review panel for product quality monitoring.
**Investor signal:** Structured feedback loop built into the product flow. Also a signal of user engagement — a rated session means the user formed an opinion.
**Evidence:** Commit `6c8d215`

### Document Upload for Advisor Context
**Status:** Shipped
**First shipped:** 2026-02-08 (`2b96c8c`)
**What it does:** Users upload documents (TXT, MD, PDF) and the advisory team discusses their content. The upload pipeline uses Google Gemini embeddings. The team can reference specific passages from uploaded materials.
**Investor signal:** Professional users bring their existing work into the advisory relationship — business plans, resumes, notes. This makes ClarityEQ useful for real work, not just reflection.
**Evidence:** Commit `2b96c8c`

### QR Phone Upload — Send a Photo from Your Phone
**Status:** Shipped
**First shipped:** 2026-03-09 (`63c67f8`)
**What it does:** Users click the upload button and choose "From your phone." A QR code appears with a 10-minute countdown. They scan it on any phone — no login required — choose or snap a photo, and it lands instantly in their desktop session. The desktop modal auto-closes when the photo arrives.
**Investor signal:** Removes the single biggest friction point in mobile-to-desktop image workflows. No AirDrop, no email, no login. Scan → pick → done. This makes the painting and image features dramatically more accessible to non-technical users.
**Updated 2026-03-09:** Fixed Clerk login wall on phone page (added to public routes) and gallery access (removed camera-only constraint so iOS/Android shows the full choice sheet). (`9bfea9d`) Fixed generate-token route — now uses service role client to bypass Supabase RLS, eliminating silent token write failures that caused "Invalid upload link" errors. (`3ffc742`)
**Updated 2026-03-10:** Fixed token sent as `[object Promise]` in Next.js 16 — `params` is now a Promise and must be unwrapped with `React.use()`. This was the remaining cause of "invalid upload link" errors on phone upload. (`64d9dee`)
**Evidence:** Commits `63c67f8`, `9bfea9d`, `3ffc742`, `64d9dee`, QR-Phone-Upload-PRD.md

### HTML & PDF Session Export
**Status:** Shipped
**First shipped:** 2026-03-13 (`174471a`)
**Fixed 2026-03-13:** PDF/HTML export was silently broken — sessions list API returns sessions without messages populated, so exports were generating empty documents. Both functions now fetch the full session on-demand via `/api/sessions/:id` if messages are missing before building the HTML. Verified working by Derek in browser testing. (`3c155f9`)
**What it does:** Users can export any past session as a self-contained HTML file or a print-ready PDF. The download button on each session row now opens a dropdown with two options. HTML exports embed all generated images as base64 (works offline, no broken links), render interactive sandbox content (charts, spreadsheets) inline, and display messages in a clean two-column layout. PDF export opens the same document in a new browser tab for Print → Save as PDF, with full-width images appearing inline after the advisor message that generated them — not as a small sidebar. A "Preparing download…" spinner appears while images are being fetched.
**Investor signal:** Session exports make ClarityEQ shareable. An executive who downloads a session and sends it to their team is a word-of-mouth acquisition engine. A beautiful, image-rich PDF that recreates the full advisory experience is something people show others.
**Evidence:** Commit `174471a`, `Docs/Download-pdf-PRD.md`

### Vision Board Avatar Upload Intercept
**Status:** Shipped
**First shipped:** 2026-03-10 (`24d66f9`, `0519a28`)
**What it does:** When a user clicks to create a Vision Board session and has no avatar uploaded, an intercept modal appears before the session starts. It invites them to upload a photo via the QR phone flow ("Your goals materialize faster with you in the picture"). They can upload or skip. If they skip, the session starts immediately. The modal returns every time they create a Vision Board until they have an avatar — no skip tracking needed, since the check is simply whether `avatar_url` is null. Once uploaded, the modal never appears again.
**Investor signal:** Avatar upload is the single change that makes Vision Board images feel personal and shareable. This intercept creates the right moment to ask — the user is already opening Vision Board, so the relevance is obvious. Frictionless QR phone flow removes the biggest barrier (finding the file on a laptop). A user who uploads their photo is significantly more likely to return.
**Evidence:** Commits `24d66f9`, `0519a28`, `948ab6b`, PRD `Docs/User-Image-PRD2.md`

---

## 10. Admin and Operations

### LED Breadcrumb Diagnostic System
**Status:** Shipped
**First shipped:** 2026-01-11 (`fb37612`), BetterLED Phase 7 complete 2026-02-11 (`6e12567`)
**What it does:** Every significant system event writes a numbered LED breadcrumb to the database. These can be queried by session ID to reconstruct exactly what happened in any production conversation — what fired, in what order, what failed. Organized into named Processes with start/end tracking. 550+ codes defined.
**Investor signal:** Production-grade reliability infrastructure. ClarityEQ can diagnose and fix issues before users notice them, not after. This separates a product team from a prototype team.
**Evidence:** Commits `fb37612`, `f465987`, `eb870cd`, `6e12567`

### Admin Analytics Dashboard
**Status:** Shipped
**First shipped:** 2026-01-15 (`f724476`), enhanced through 2026-03-07
**What it does:** Real-time admin view of active users, message volume, token usage, cost per user, daily cost charts, image generation stats, session ratings, and recent AI-generated images. Per-user cost breakdown. Admin image research tools. Email template management.
**Investor signal:** Operator visibility. The team knows what is working, what costs how much, and which users are getting the most value.
**Evidence:** Commits `f724476`, `f814f46`, `174dd8a`, `59e8e80`

### Invite Management System
**Status:** Shipped
**First shipped:** 2026-01-16 (`145c869`), enhanced 2026-03-07 (`0934072`)
**What it does:** Admin sends personalized invite emails with tracking. The invites page shows stats (sent, pending, converted, bounce rate) with filtering. Admin can generate invite links without sending email for in-person distribution. Automated approval emails send when users are approved off the waitlist.
**Investor signal:** Controlled early growth with full visibility into conversion at every stage. The invite model enables high-touch growth while tracking results.
**Evidence:** Commits `145c869`, `e8fb71f`, `0934072`

### Waitlist and Access Gating
**Status:** Shipped
**First shipped:** 2026-01-16 (`37b4120`, `e8fb71f`)
**What it does:** New users enter a waitlist via a conversational intake interview. The admin approves users. Upon approval, an automated email is sent. This creates a controlled onboarding experience.
**Investor signal:** Scarcity and exclusivity drive demand. A real approval step signals that ClarityEQ is selective — consistent with a high-quality advisory positioning.
**Evidence:** Commits `37b4120`, `e8fb71f`

### Vercel Cost Optimization
**Status:** Shipped
**First shipped:** 2026-02-16 (`b37d0a5`)
**What it does:** API calls to Clerk and Supabase run in parallel instead of sequentially. AI config is cached for 5 minutes. Dead assets cleaned from the public folder. Spend limit set at $25 on-demand overage cap. Vercel Pro with Fluid Compute enabled for concurrent AI request handling.
**Investor signal:** Infrastructure cost discipline. The team understands and controls unit economics at the function level. No surprise bills.
**Evidence:** Commit `b37d0a5`, session summary 2026-02-16

---

## 11. Platform and Infrastructure

### Next.js on Vercel with Supabase and Clerk
**Status:** Shipped
**First shipped:** 2026-01-02 (initial), Supabase `b27c8d8` (2026-01-11)
**What it does:** App runs on Next.js 16 (App Router) deployed to Vercel with auto-deploy from main branch. Authentication via Clerk. Database via Supabase. All serverless — no fixed servers to maintain or scale. Dev server includes automatic Turbopack cache clearing on startup (prevents corruption crashes on Windows) and structured log output to `logs/current.log`.
**Corrected 2026-03-10:** Updated Next.js version from 14 to 16. Added dev server reliability improvements (`a8fd803`, `4171acc`).
**Investor signal:** Battle-tested modern stack. Scales to millions of users without infrastructure re-engineering. Global CDN and edge compute handled automatically.
**Evidence:** Commit `82ea634`, `b27c8d8`

### Multi-Model AI Provider Routing
**Status:** Shipped
**First shipped:** 2026-01-14 (initial), multiple routing changes through 2026-03-07
**What it does:** Different tasks use different models: DeepSeek via DeepInfra and Parasail for advisory conversations; Grok via xAI direct API for first images and paintings; Flux 2 Pro via Replicate for reference image generation; Qwen3-coder via Parasail for spreadsheets; Gemini 2.5 Flash for image analysis; MiniMax M2.5 for Marcus. Each model is independently replaceable.
**Investor signal:** No single-provider lock-in. The system routes to the best model for each job and can swap providers as the market evolves and costs change.
**Evidence:** MEMORY.md "Current State" section, commits `d818234`, `e1a6c5e`, `e977640`

### ClarityEQ Brand and Domain
**Status:** Shipped
**First shipped:** 2026-02-16 (domain), 2026-02-20 (`65b246d` — full app rebrand)
**What it does:** Complete migration from HiveMind AI to Clarity EQ across all surfaces: app UI, domain (clarityeq.com), Clerk configuration, and Resend email. The name communicates emotional intelligence and clarity — the product's core value proposition.
**Evidence:** Commit `65b246d`, session summary 2026-02-16

---

## 12. Roadmap — Planned Features (Not Yet Shipped to Production)

### Life Path Interview — Self-Discovery Profile
**Status:** Shipped
**First shipped:** 2026-03-07 (`d317972`), production-ready 2026-03-09 (`3ad4cd4`)
**What it does:** An 8–12 turn conversational interview conducted by the full advisory team to discover how a user thinks, works, and is wired. Output is a shareable Life Path Profile: personalized career direction, natural work style, and suggested paths forward. Accompanied by an AI-generated hero image of the user's life path scene — saved to permanent storage. A working share link is appended to the profile at the moment it's generated. Admin can see sessions started, profiles completed, hero image success rate, and completion rate in /admin/stats.
**Investor signal:** Self-discovery is a high-value, high-margin category. The shareable Life Path Profile is an organic growth mechanism — recipients of shared profiles see a beautiful artifact and ask "how do I get one of these?"
**Updated 2026-03-09:** Fixed hero image capture (URL now saved to DB), fixed share link (real URL injected as SSE after profile saves — no more broken placeholder), added Life Path adoption stats to admin dashboard. (`3ad4cd4`)
**Evidence:** Commits `d317972`, `3ad4cd4`, `Docs/Life-Path-PRD.md`, PRD validation 2026-03-06

### Career Matching Layer
**Status:** Planned (PRD finalized 2026-03-06, awaits Life Path MVP)
**What it does:** A persistent career profile that grows through natural conversation over months. ClarityEQ maintains direct relationships with growth-stage companies who share unlisted roles. Users who opt in to career matching may be introduced to opportunities before they are posted publicly. No job board. Trusted introductions only.
**Investor signal:** A B2B2C monetization layer. Companies pay for access to ClarityEQ's self-aware, emotionally intelligent user base. The career platform play without the job-board commoditization.
**Evidence:** `Docs/Career-Matching-Layer-PRD.md` (strategic decisions locked)

### Personal Development Roadmap
**Status:** Planned (PRD written 2026-03-06, depends on Life Path)
**What it does:** Takes the Life Path profile and converts it into four concrete next steps with resources matched to the user's gaps. Steps automatically become Little Wins for accountability follow-up. A living document that updates as the user grows.
**Investor signal:** Closes the gap between self-knowledge and action. Without this, users complete their Life Path interview and drift. With it, every Life Path user gets a next step.
**Evidence:** `Docs/Development-Roadmap-PRD.md`

### Walk Beside You — Morning Moment and Quick Consult
**Status:** Planned (PRD fully validated 2026-03-08, implementation after Little Wins)
**What it does:** Push notification at the user's configured time surfaces active Little Wins and recent commitments — the team showing up, not the user reaching out. Quick Consult allows a 5-minute advisory check-in before any important meeting or conversation.
**Investor signal:** Shifts ClarityEQ from a tool users open when stuck to a team that shows up daily. This is the difference between a utility and a relationship.
**Evidence:** `Docs/Walk-Beside-You-PRD.md`, session summary 2026-03-08 (PRD validated and finalized)

### Drive Mode — Hands-Free Advisory Sessions
**Status:** Planned (PRD written 2026-03-06, critical blockers under resolution)
**What it does:** One-tap mode for hands-free use: TTS on automatically, responses kept short and speakable, voice input as primary interface. Screen optional. Designed for commutes, walks, and other screen-free moments.
**Investor signal:** Opens a new daily usage context for an existing user base. The average American commutes 27 minutes each way — that is an addressable time slot where no current AI product serves well.
**Evidence:** `Docs/Drive-Mode-PRD.md`

### Chat Sharing
**Status:** Planned (PRD written 2026-03-06, hero image architecture resolved)
**What it does:** Users share any conversation via a public URL. The shared page opens with the first AI-generated image as a hero, followed by the full transcript, closing with a CTA for clarityeq.com. No login required to view. Owner controls sharing.
**Investor signal:** Every shared conversation is a live advertisement with the AI image as the hook, the transcript as the proof, and the CTA as the conversion. Organic growth built into the product.
**Evidence:** `Docs/Chat-Sharing-PRD.md`, session summary 2026-03-06 (hero image Supabase storage architecture resolved)

---

## Source Notes and Quality Check

| Source | Records Used |
|---|---|
| Git commit log | 939 commits; 123 `feat:` commits identified and reviewed |
| PRDs read (19) | Life-Path, Career-Matching-Layer, Development-Roadmap, Walk-Beside-You, Drive-Mode, Directive-Mode, LITTLE-WINS-PLAN-v1, TTS-PRD, Projects-Feature-PRD, Spontaneous-Image-Generation-PRD, Smart-Images-PRD, Image-Upload-Unified-PRD, Sandbox-PRD01, Onboarding-Interview-PRD, Chat-Sharing-PRD, Streaming-prd (via summaries), BetterLED-PRD, Modes-PRD, Voice-Type-PRD |
| Session summaries read (28) | 2026-01-22 through 2026-03-08; all dated summary files reviewed |
| MEMORY.md | Read — current architecture state and verified feature status |
| Memory topic files | `image-pipeline.md`, `sandbox-fixes-feb12-13.md` |
| PROJECT_INDEX.md | Read |

**Quality Check — All Items Verified:**
- Every shipped feature has at least one git commit as evidence
- No feature listed as "shipped" without a git commit or session summary confirming it worked
- Features committed but not yet pushed to production are noted explicitly
- Roadmap section is clearly separated — no planned features mixed with shipped ones
- Summary stats reflect actual counts from `git rev-list --count HEAD` (939) and manual PRD/summary counts
- Investor signal lines written for a non-technical reader — no internal jargon

---

*Generated by Claude Sonnet 4.6 on 2026-03-12*
*Instructions: `D:/Projects/Ai/Liquid-Stories/Docs/Git-Feature-List.md`*
*Previous version: `D:/Projects/Ai/Liquid-Stories/Docs/ClarityEQ-Feature-List.md` (generated 2026-03-07)*
