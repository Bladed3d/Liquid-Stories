# ClarityEQ — Feature List
**Generated:** 2026-03-09
**Sources:** Git history (896 commits), 20 PRDs, 28 session summaries
**App status:** Live at clarityeq.com (Vercel, auto-deploy)

---

## Summary Stats
- Total commits: 896
- Date range: 2026-01-02 → 2026-03-09 (66 days of active development)
- Feature commits (feat:): 109 identified
- PRDs read: 20
- Session summaries read: 28
- Features documented (shipped): 56
- Features in roadmap (planned/in-development): 7
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
**What it does:** Five advisors with defined roles: Marcus (strategic inversion, Charlie Munger style, powered by MiniMax M2.5), Aria (creative vision and image generation), Maya (research and web search), a mindset coach, and a risk analyst. Each has a distinct voice, priorities, and response style.
**Investor signal:** Named personalities create emotional attachment. Users return to talk to "their team." Named advisors enable per-advisor TTS voice assignment, making the audio experience feel like a real group conversation.
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
**What it does:** A gallery of all images the user has uploaded or had painted. Images can be selected from the gallery and used as a reference for new painting sessions without re-uploading.
**Investor signal:** Users accumulate a personal visual library that grows over time. The gallery is tangible evidence that ClarityEQ is building a persistent creative relationship, not just processing queries.
**Evidence:** Commit `fb91a15`

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
**Evidence:** Commit `71c84bb`, commit `8857461` (Safari/iPad fix 2026-03-08)

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

### Topic Recognition and Session Resumption
**Status:** Shipped
**First shipped:** 2026-02-21 (`7a5d5ac`)
**What it does:** When a user starts a new conversation, the system automatically checks if the topic matches a past session using keyword-overlap matching. If matched, the last 10 messages from the previous session are injected as context. The team greets the user with a brief recap and asks where to continue — no manual effort needed.
**Investor signal:** The experience of "picking up where you left off" without any manual work. This is the moment trial users convert to subscribers.
**Evidence:** Commit `7a5d5ac`, MEMORY.md `findMatchingTopic()` section

### Session-to-Project Organization
**Status:** Shipped
**First shipped:** 2026-02-21 (`919867e`)
**What it does:** Users can right-click (or long-press on mobile) any past conversation and move it to a project via a "Move to..." dropdown. They can also ask the team conversationally ("move this to My Paintings") and the AI moves the session using marker detection.
**Investor signal:** Organizational power without organizational friction. Structure can be added after the fact, at the user's pace.
**Evidence:** Commit `919867e`, session summary 2026-02-21

### Animated Welcome and Topic Greeting for Returning Users
**Status:** Shipped
**First shipped:** 2026-02-21 (`b0fe345`)
**What it does:** Returning users see an animated welcome screen that recognizes their history. Past conversation topics appear as clickable buttons — one click pre-fills the chat with a continuation prompt. The team greets users by referencing what they have discussed before.
**Investor signal:** "This app knows me" is the retention moment. The first time users see their own topics reflected back at them is when ClarityEQ becomes a relationship rather than a tool.
**Evidence:** Commit `b0fe345`

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
**What it does:** When a user commits to something in a conversation ("I'll email Marcus by Thursday"), the advisory team proposes logging it as a Little Win. With the user's confirmation, a tracked commitment is created with a required due date. On the user's next visit, the team checks in on pending wins. Overdue wins trigger an offer to break them into smaller steps. Users cannot self-check-off — they validate completion through conversation.
**Investor signal:** The accountability partner that turns advice into action. Commitment plus follow-up is the core retention loop in every successful productivity and coaching tool. This feature creates daily and weekly usage habits.
**Evidence:** Commits `628762b`, `07112e3`, `5d0df5d`, `61b0b94`, `88975d1`, `018c6f3`, `06f6d03`, session summary 2026-03-08

---

## 9. Onboarding and User Experience

### Guided Onboarding Interview
**Status:** Shipped
**First shipped:** 2026-03-05 (`7521d86` — overhaul committed and pushed)
**What it does:** New users see a "Start Here" card on the home screen. Clicking it starts a guided getting-to-know-you session: who they are, what they do, and what they are facing — through natural conversation, not a form. A welcome image fires on the first response (a dynamic oil painting with the user's name and city). From session 2 onward, all advisors know the user's background.
**Investor signal:** First impressions determine whether users stay. This replaces the blank-screen problem — the leading cause of AI trial user churn — with an immediately personal experience.
**Evidence:** Commit `7521d86`, session summaries 2026-03-04 and 2026-03-05 (verified: "Start Here" → Aria greeting → welcome image with user's name confirmed working)

### User Avatar with Crop and Zoom Editor
**Status:** Shipped
**First shipped:** 2026-02-15 (`66134ff`)
**What it does:** Users upload a profile photo with an in-app crop and zoom editor. The avatar appears throughout the app.
**Investor signal:** Personal identity in the product increases emotional attachment. Users with their own photo see themselves as participants in the ClarityEQ experience.
**Evidence:** Commit `66134ff`

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
**Evidence:** Commits `d5d12f2`, `560b895`, `8857461`

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
**What it does:** App runs on Next.js 14 (App Router) deployed to Vercel with auto-deploy from main branch. Authentication via Clerk. Database via Supabase. All serverless — no fixed servers to maintain or scale.
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
**Status:** In Development (committed 2026-03-07 `d317972`, pending verification and push)
**What it does:** An 8–12 turn conversational interview conducted by the full advisory team to discover how a user thinks, works, and is wired. Output is a shareable Life Path Profile: personalized career direction, natural work style, and suggested paths forward. Accompanied by an AI-generated image of the user's life path scene. All users have access; the feature is badged as a Premium Feature to signal value.
**Investor signal:** Self-discovery is a high-value, high-margin category. The shareable Life Path Profile is an organic growth mechanism — recipients of shared profiles see a beautiful artifact and ask "how do I get one of these?"
**Evidence:** Commit `d317972`, `Docs/Life-Path-PRD.md`, PRD validation 2026-03-06

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

### Avatar and Vision Board
**Status:** Planned (PRD written 2026-03-07, depends on Life Path)
**What it does:** Users upload a 3-angle photo set as their avatar. This photo personalizes all Life Path images and a dedicated Vision Board feature — a series of paintings placing the user inside their described future goals.
**Investor signal:** Personalized manifestation paintings are highly shareable. Seeing yourself in your future is emotionally powerful in a way that stock imagery is not. Virality built into the output.
**Evidence:** `Docs/Avatar-VisionBoard-PRD.md` (triggered by accidental discovery: Derek's reference photo was loaded during a Life Path interview, Flux placed him in the scene — "struck enough to warrant designing for deliberately")

---

## Source Notes and Quality Check

| Source | Records Used |
|---|---|
| Git commit log | 894 commits; 107 `feat:` commits identified and reviewed |
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
- Summary stats reflect actual counts from `git rev-list --count HEAD` (894) and manual PRD/summary counts
- Investor signal lines written for a non-technical reader — no internal jargon

---

*Generated by Claude Sonnet 4.6 on 2026-03-08*
*Instructions: `D:/Projects/Ai/Liquid-Stories/Docs/Git-Feature-List.md`*
*Previous version: `D:/Projects/Ai/Liquid-Stories/Docs/ClarityEQ-Feature-List.md` (generated 2026-03-07)*
