# Product Requirements Document: Intelligent Orchestration & Learning System

**Version:** 1.0
**Date:** 2025-01-07
**Author:** AI Friends Development Team
**Status:** DRAFT - Ready for Implementation Planning

---

## Executive Summary

This PRD defines a 3-phase evolution of AI Friends from a rule-based multi-persona coaching app to an **intelligent, self-improving conversational system** that learns from every interaction.

**Current State:** All 5 personas respond to every user message using hard-coded turn limits and stage-based rules.

**Vision:** An AI orchestrator acts as a "chess player," predicting conversation flow 2-3 moves ahead, selecting optimal responders, and learning from outcomes to continuously improve.

**Business Impact:**
- **User Experience:** Natural conversation flow vs. overwhelming 5-persona responses every time
- **Retention:** System gets smarter with every conversation (competitive moat)
- **Differentiation:** Impossible to replicate without conversation-specific learning
- **Scalability:** Self-improving system reduces need for manual prompt tuning

**Implementation Approach:** 3 phases over 8-12 weeks
- **Phase 1:** Orchestrator with predictive decision-making (4 weeks)
- **Phase 2:** Post-conversation learning agent (3 weeks)
- **Phase 3:** Knowledge base integration & auto-improvement (4 weeks)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Stories](#3-user-stories)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Phase 1: Intelligent Orchestrator](#5-phase-1-intelligent-orchestrator)
6. [Phase 2: Learning Agent](#6-phase-2-learning-agent)
7. [Phase 3: Knowledge Base Integration](#7-phase-3-knowledge-base-integration)
8. [Technical Specifications](#8-technical-specifications)
9. [Data Models](#9-data-models)
10. [API Specifications](#10-api-specifications)
11. [UI/UX Requirements](#11-uiux-requirements)
12. [Performance Requirements](#12-performance-requirements)
13. [Security & Privacy](#13-security--privacy)
14. [Testing Strategy](#14-testing-strategy)
15. [Rollout Plan](#15-rollout-plan)
16. [Dependencies & Risks](#16-dependencies--risks)
17. [Open Questions](#17-open-questions)
18. [Appendix](#18-appendix)

---

## 1. Problem Statement

### 1.1 Current Limitations

**Problem 1: All Personas Respond to Every Message**
- User sends message → All 5 personas respond (or 3-5 based on turn limits)
- Creates information overload
- Doesn't feel like natural conversation
- User: "Kofi, what do you think?" → All 5 personas answer anyway

**Problem 2: No Conversation Intelligence**
- Decisions are rule-based (if message_count < 10 then EXPLORATION)
- No consideration of message content, user state, or conversation trajectory
- Cannot adapt to unexpected user needs
- Cannot predict where conversation is heading

**Problem 3: No Learning or Improvement**
- Every conversation starts from zero
- Successful patterns aren't captured
- Failed approaches repeat
- No memory of what works for different user types

**Problem 4: Rigid Stage Progression**
- Current system enforces linear stages (EXPLORATION → UNDERSTANDING → GUIDANCE → ACTION)
- User explicitly requests guided discovery → System ignores and asks random questions
- Cannot handle user-initiated structure requests

### 1.2 User Impact

**Negative UX Patterns Observed:**
1. **Overwhelming:** 5 personas × 200 words each = 1000 words to read per response
2. **Impersonal:** User addresses Kofi specifically, Ben still responds
3. **Repetitive:** Similar questions from multiple personas
4. **Missed Opportunities:** System doesn't recognize when user is ready for breakthrough
5. **Lack of Control:** User can't guide conversation style (brainstorm vs. deep exploration)

### 1.3 Business Impact

**Without This System:**
- High cognitive load → Users abandon conversations
- Generic experience → No competitive moat
- Manual prompt tuning required → Doesn't scale
- No data-driven improvement → Stagnant quality

**With This System:**
- Conversations feel natural and personalized
- System improves with every interaction (network effects)
- Unique capability that competitors can't easily replicate
- Data-driven optimization replaces guesswork

---

## 2. Goals & Success Metrics

### 2.1 Phase 1 Goals: Intelligent Orchestrator

**Primary Goal:** Selective, contextual persona responses instead of all-respond-every-time

**Success Metrics:**
- **Avg Personas/Turn:** ↓ from 4.2 to 2.0 (reduce information overload by 50%)
- **Direct Address Accuracy:** 95%+ when user names persona explicitly
- **User Engagement:** ↑ avg message length (users write more when not overwhelmed)
- **Conversation Depth:** ↑ avg messages per session (natural flow encourages continuation)
- **Stage Progression Speed:** 20% faster movement through stages (better orchestration)

**Key Features:**
- Direct address detection ("Kofi, what do you think?")
- Content-aware persona selection (who's most relevant?)
- Predictive decision-making (what's needed 2-3 turns ahead?)
- Character actions during wait time (visual feedback)

### 2.2 Phase 2 Goals: Learning Agent

**Primary Goal:** Extract insights from completed conversations to inform future orchestration

**Success Metrics:**
- **Insight Extraction Rate:** ≥3 actionable insights per conversation
- **Pattern Recognition:** Identify 10+ user archetypes within 100 conversations
- **Playbook Growth:** 20+ proven orchestration patterns after 50 conversations
- **Insight Accuracy:** Manual review of 20 conversations shows 80%+ useful insights

**Key Features:**
- Post-conversation analysis (triggered on export/new conversation)
- Insight extraction (what worked, what didn't, what patterns emerged)
- Outcome tracking (did user export? Return? Reach ACTION stage?)
- Breadcrumb trail analysis (technical debugging + conversation quality)

### 2.3 Phase 3 Goals: Knowledge Base Integration

**Primary Goal:** Use learned insights to make better orchestration decisions

**Success Metrics:**
- **Orchestrator Accuracy:** 80%+ of decisions match "what a human coach would do"
- **Conversation Quality:** ↑ 25% in user satisfaction (measured by exports, feedback)
- **Stage Success Rate:** 90% of conversations reach intended stage (vs. 70% baseline)
- **User Archetype Detection:** <5 messages to identify user type accurately
- **Cross-Session Learning:** New users benefit from insights from first session

**Key Features:**
- IndexedDB knowledge base (client-side persistence)
- User archetype detection (anxious planner, impulsive doer, analytical overthinker, etc.)
- Playbook querying (similar conversation → what worked?)
- Continuous improvement (system gets 5% better every 10 conversations)

### 2.4 Metrics Dashboard (Future Enhancement)

Track in localStorage or backend analytics:
```json
{
  "conversationMetrics": {
    "avgPersonasPerTurn": 2.1,
    "directAddressAccuracy": 0.94,
    "avgMessagesPerSession": 12.3,
    "stageReachRate": {
      "EXPLORATION": 1.0,
      "UNDERSTANDING": 0.85,
      "GUIDANCE": 0.65,
      "ACTION": 0.42
    }
  },
  "learningMetrics": {
    "conversationsAnalyzed": 127,
    "insightsExtracted": 384,
    "archetypesIdentified": 8,
    "playbooksCreated": 23
  }
}
```

---

## 3. User Stories

### 3.1 Phase 1: Orchestrator

**US-1.1: Direct Address Response**
```
As a user
When I say "Kofi, what do you think about fear?"
I want ONLY Kofi to respond initially
So that the conversation feels personal and directed
```

**Acceptance Criteria:**
- System detects "Kofi" at start of message or after comma
- Only Kofi responds immediately
- After 3-5 seconds, another persona MAY chime in if relevant
- Other personas stay silent

**US-1.2: Contextual Persona Selection**
```
As a user in EXPLORATION stage
When I share a vulnerable story about failure
I want personas who handle vulnerability well (Lena, Kofi) to respond
So that I feel heard and supported, not challenged
```

**Acceptance Criteria:**
- Orchestrator detects vulnerability signals (keywords, tone)
- Selects Coach (Lena) and/or Guru (Kofi)
- Skeptic (Aris) stays silent (inappropriate for vulnerability moment)
- Visionary (Maya) may respond if expansion is helpful

**US-1.3: Visual Feedback During Orchestration**
```
As a user
When I send a message
I want to see character actions ("*Maya leans forward*") while waiting
So that the wait feels natural and engaging
```

**Acceptance Criteria:**
- Typing indicators appear for all personas initially
- Character-specific actions display (e.g., "*Kofi closes eyes briefly*")
- Non-responding personas fade out smoothly
- Responses appear with natural delays (not all at once)

### 3.2 Phase 2: Learning Agent

**US-2.1: Automatic Insight Extraction**
```
As a system
When a conversation ends (user clicks "New" or exports)
I want to analyze what worked and what didn't
So that future conversations benefit from this experience
```

**Acceptance Criteria:**
- Learning agent runs asynchronously (doesn't block user)
- Extracts 3-5 insights per conversation
- Stores insights with confidence scores
- Logs analysis to breadcrumb trail for debugging

**US-2.2: Pattern Recognition**
```
As a system
After analyzing 20+ conversations in "Business" category
I want to identify common user archetypes
So that I can recognize them in future conversations
```

**Acceptance Criteria:**
- Detects archetypes (e.g., "Analytical Overthinker," "Impulsive Doer")
- Records signals that indicate each archetype
- Stores effective approaches for each archetype
- Can match new users to archetypes within 5 messages

### 3.3 Phase 3: Knowledge Base

**US-3.1: Archetype-Based Orchestration**
```
As a user matching "Anxious Planner" archetype
When I start a new conversation about business
I want the system to use proven patterns for anxious users
So that I feel understood immediately
```

**Acceptance Criteria:**
- System detects archetype from first 3-5 messages
- Queries knowledge base for "Anxious Planner" playbook
- Orchestrator follows proven sequence (safety → small wins → expansion)
- Avoids patterns that failed with this archetype

**US-3.2: Cross-Session Learning**
```
As a new user
When I start my first conversation
I want to benefit from insights extracted from previous users
So that I get high-quality guidance from session 1
```

**Acceptance Criteria:**
- Knowledge base contains insights from ≥50 conversations
- Orchestrator queries for relevant patterns
- New user conversation quality matches experienced system
- No cold-start problem

---

## 4. System Architecture Overview

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│  (ConversationInterface.tsx, SessionStart.tsx)              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                   ORCHESTRATION LAYER                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Orchestrator (Phase 1)                            │    │
│  │  - Direct address detection                        │    │
│  │  - Content analysis                                │    │
│  │  - Predictive decision-making                      │    │
│  │  - Persona selection                               │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
│                   ↓                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  PersonaCoordinator (Existing)                     │    │
│  │  - Context building                                │    │
│  │  - Parallel AI generation                          │    │
│  │  - Response aggregation                            │    │
│  └────────────────┬───────────────────────────────────┘    │
└───────────────────┼───────────────────────────────────────┬┘
                    │                                        │
                    ↓                                        ↓
┌────────────────────────────────┐    ┌───────────────────────────────┐
│     PERSONA LAYER              │    │   LEARNING LAYER (Phase 2)    │
│                                │    │                               │
│  ┌─────────────────────────┐  │    │  ┌────────────────────────┐  │
│  │ Maya (Visionary)        │  │    │  │ Learning Agent         │  │
│  │ Ben (Pragmatist)        │  │    │  │ - Conversation analysis│  │
│  │ Aris (Skeptic)          │  │    │  │ - Insight extraction   │  │
│  │ Lena (Coach)            │  │    │  │ - Pattern recognition  │  │
│  │ Kofi (Guru)             │  │    │  └────────┬───────────────┘  │
│  └─────────────────────────┘  │    │           │                   │
└────────────────────────────────┘    └───────────┼───────────────────┘
                                                  │
                                                  ↓
                                    ┌──────────────────────────────────┐
                                    │  KNOWLEDGE BASE (Phase 3)        │
                                    │                                  │
                                    │  ┌────────────────────────────┐ │
                                    │  │ IndexedDB Storage          │ │
                                    │  │ - Conversation records     │ │
                                    │  │ - Insights library         │ │
                                    │  │ - User archetypes          │ │
                                    │  │ - Orchestration playbooks  │ │
                                    │  └────────────────────────────┘ │
                                    └──────────────────────────────────┘
```

### 4.2 Data Flow

**Current Flow (Baseline):**
```
User Message → PersonaCoordinator → All Eligible Personas → Parallel AI Calls → Responses
```

**Phase 1 Flow:**
```
User Message → Orchestrator Decision → PersonaCoordinator → Selected Personas → Parallel AI Calls → Responses
                    ↓
              (Character Actions)
```

**Phase 2 Flow:**
```
User Message → [Phase 1 Flow] → Responses
                                     ↓
                              (Conversation Continues)
                                     ↓
                              User Ends Conversation
                                     ↓
                              Learning Agent Analyzes
                                     ↓
                              Insights Stored (localStorage)
```

**Phase 3 Flow:**
```
User Message → Orchestrator Decision ←─── Knowledge Base Query
                    ↓                          ↑
              PersonaCoordinator          (Past Insights)
                    ↓                          ↑
              Selected Personas            Learning Agent
                    ↓                          ↑
              Parallel AI Calls         (Feedback Loop)
                    ↓
              Responses
```

### 4.3 Component Responsibilities

| Component | Responsibility | Phase |
|-----------|----------------|-------|
| **Orchestrator** | Decide which personas respond, predict conversation path | 1 |
| **DirectAddressParser** | Detect when user addresses specific persona | 1 |
| **CharacterActionSystem** | Display persona actions during wait time | 1 |
| **PersonaCoordinator** | Coordinate persona responses (existing, enhanced) | 1 |
| **LearningAgent** | Analyze completed conversations | 2 |
| **ConversationAnalyzer** | Extract patterns and insights | 2 |
| **OutcomeTracker** | Measure conversation success metrics | 2 |
| **KnowledgeBase** | Store and retrieve learned insights | 3 |
| **ArchetypeDetector** | Identify user types | 3 |
| **PlaybookEngine** | Apply proven patterns to new conversations | 3 |

---

## 5. Phase 1: Intelligent Orchestrator

### 5.1 Overview

**Goal:** Replace "all personas respond" with intelligent, contextual selection

**Timeline:** 4 weeks
- Week 1: Orchestrator core + direct address detection
- Week 2: Predictive decision-making + character actions
- Week 3: Integration with PersonaCoordinator + testing
- Week 4: Polish, performance optimization, rollout

### 5.2 Core Features

#### Feature 1.1: Direct Address Detection

**Description:** Parse user message to detect if they're addressing a specific persona

**Implementation:**
```typescript
// lib/direct-address-parser.ts

export function detectDirectAddress(message: string): {
  addressedPersona: PersonaType | null;
  confidence: number;
  cleanedMessage: string;
} {
  const patterns = [
    // "Kofi, what do you think?"
    /^(maya|ben|aris|lena|kofi)[,:\s]/i,

    // "What do you think, Kofi?"
    /[,\s](maya|ben|aris|lena|kofi)[?\s]*$/i,

    // "@Kofi what about..."
    /@(maya|ben|aris|lena|kofi)/i,

    // Full names
    /^(maya chen|ben carter|aris thorne|lena volkov|kofi mensah)[,:\s]/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const name = match[1].toLowerCase();
      const personaMap = {
        'maya': 'visionary',
        'ben': 'pragmatist',
        'aris': 'skeptic',
        'lena': 'coach',
        'kofi': 'guru'
      };

      return {
        addressedPersona: personaMap[name],
        confidence: 1.0,
        cleanedMessage: message.replace(pattern, '').trim()
      };
    }
  }

  return {
    addressedPersona: null,
    confidence: 0,
    cleanedMessage: message
  };
}
```

**User Experience:**
```
User: "Kofi, I'm afraid of failing. What should I do?"

System detects: addressedPersona = 'guru', confidence = 1.0

Result:
- Only Kofi responds initially
- Other personas show "..." then fade out
- After Kofi's response, system MAY allow 1 other persona to add perspective
```

#### Feature 1.2: Orchestrator Decision Engine

**Description:** AI-powered decision maker that selects optimal responders

**Orchestrator Prompt Template:**
```typescript
const ORCHESTRATOR_SYSTEM_PROMPT = `
You are the conversation orchestrator for AI Friends, a coaching system with 5 personas:

TEAM MEMBERS:
1. Maya Chen (Visionary) - Expansive thinker, big picture, possibility
2. Ben Carter (Pragmatist) - Grounded, numbers-focused, realistic
3. Aris Thorne (Skeptic) - Challenges assumptions, keeps honest
4. Lena Volkov (Coach) - Encouraging, action-oriented, supportive
5. Kofi Mensah (Guru) - Reflective, philosophical, reframes perspective

YOUR ROLE:
Decide which personas should respond to create the most effective coaching experience.

GUIDELINES:
- Fewer is better (1-2 personas often more effective than 5)
- Match persona strengths to user's current need
- Consider conversation stage (exploration, understanding, guidance, action)
- Respect direct address (if user names a persona, they should respond)
- Predict what user needs 2-3 turns ahead
- Avoid overwhelming the user

DECISION FACTORS:
1. User's emotional state (anxious, excited, resistant, confused, committed)
2. Conversation stage (what phase are we in?)
3. Recent persona participation (who hasn't spoken recently?)
4. Content relevance (who can best address this topic?)
5. Predicted next moves (what will user likely need next?)

RETURN JSON ONLY:
{
  "selectedPersonas": ["coach", "guru"],
  "reasoning": "User is vulnerable (fear mentioned). Lena provides safety, Kofi adds depth. Maya/Ben/Aris would be too challenging right now.",
  "predictedUserResponse": "User will likely share personal story next - be ready to receive it",
  "suggestedTone": "gentle and supportive",
  "characterActions": {
    "coach": "kneads hands gently, leaning forward",
    "guru": "closes eyes briefly, centering"
  },
  "nextTurnPrediction": {
    "probability": 0.75,
    "likely": "user_shares_story",
    "optimalResponders": ["guru"]
  }
}
`;
```

**Orchestrator Input:**
```typescript
interface OrchestratorContext {
  // Current conversation state
  category: Category;
  stage: CoachingStage;  // EXPLORATION, UNDERSTANDING, GUIDANCE, ACTION
  relationshipDepth: number;  // 0-10
  userVulnerabilityScore: number;  // 0-10

  // Recent history
  lastUserMessage: string;
  recentMessages: Message[];  // Last 5-10 messages
  recentPersonas: PersonaType[];  // Who spoke recently

  // Direct address detection
  directAddress?: {
    persona: PersonaType;
    confidence: number;
  };

  // Available personas
  eligiblePersonas: PersonaType[];  // After turn-limit filtering
}
```

**Orchestrator Output:**
```typescript
interface OrchestratorDecision {
  // Primary decision
  selectedPersonas: PersonaType[];  // 1-3 personas (rarely all 5)

  // Reasoning (for debugging/learning)
  reasoning: string;

  // Character presentation
  characterActions: Record<PersonaType, string>;  // "*Kofi closes eyes*"

  // Tone guidance
  suggestedTone: 'gentle' | 'balanced' | 'direct' | 'challenging' | 'celebratory';

  // Prediction (chess player thinking ahead)
  nextTurnPrediction: {
    probability: number;  // 0-1
    likelyUserAction: 'ask_question' | 'share_story' | 'pushback' | 'commit' | 'confused';
    optimalResponders: PersonaType[];  // Who should respond NEXT turn
  };

  // Metadata
  timestamp: number;
  contextSnapshot: OrchestratorContext;
}
```

#### Feature 1.3: Character Actions System

**Description:** Show character-specific actions while AI generates responses

**Character Action Library:**
```typescript
// lib/character-actions.ts

export const CHARACTER_ACTIONS: Record<PersonaType, string[]> = {
  visionary: [
    'leans forward intensely',
    'eyes light up with possibility',
    'stands and paces',
    'gestures expansively',
    'stares into the distance, thinking'
  ],

  pragmatist: [
    'pulls out calculator',
    'taps pen on table',
    'leans back, arms crossed',
    'checks watch',
    'scribbles numbers on napkin'
  ],

  skeptic: [
    'raises eyebrow skeptically',
    'smirks slightly',
    'shakes head slowly',
    'drums fingers on table',
    'tilts head, studying you closely'
  ],

  coach: [
    'kneads hands gently',
    'leans forward, nodding',
    'places hand on your shoulder',
    'warm, encouraging smile',
    'takes a deep breath with you'
  ],

  guru: [
    'closes eyes briefly, centering',
    'pauses, breathing deeply',
    'looks up at ceiling, reflecting',
    'touches prayer beads',
    'slight bow of the head'
  ]
};

export function selectCharacterAction(
  persona: PersonaType,
  context: 'thinking' | 'responding' | 'listening'
): string {
  const actions = CHARACTER_ACTIONS[persona];
  const randomIndex = Math.floor(Math.random() * actions.length);
  return `*${actions[randomIndex]}*`;
}
```

**UI Integration:**
```typescript
// Show typing indicator with character action
<div className="persona-thinking">
  <div className="persona-name">Kofi Mensah - Guru</div>
  <div className="character-action">*closes eyes briefly, centering*</div>
  <div className="typing-indicator">
    <span></span><span></span><span></span>
  </div>
</div>
```

#### Feature 1.4: Predictive Decision-Making

**Description:** Orchestrator thinks 2-3 moves ahead like a chess player

**Chess-Style Analysis:**
```typescript
interface ConversationPath {
  currentPosition: {
    stage: CoachingStage;
    userState: 'exploring' | 'resistant' | 'committed' | 'confused';
    momentum: number;  // 0-10 (how close to breakthrough?)
  };

  primaryPath: {
    probability: number;  // 0-1
    nextMoves: string[];  // Predicted sequence
    optimalResponders: PersonaType[][];  // Who responds at each step
    expectedOutcome: 'breakthrough' | 'commitment' | 'stall' | 'exit';
  };

  alternativePaths: {
    probability: number;
    trigger: string;  // What would cause this path
    response: string;  // How to handle it
  }[];

  risks: {
    overwhelm: number;  // 0-1 probability
    confusion: number;
    resistance: number;
  };
}
```

**Example Prediction:**
```json
{
  "currentPosition": {
    "stage": "UNDERSTANDING",
    "userState": "resistant",
    "momentum": 4
  },
  "primaryPath": {
    "probability": 0.7,
    "nextMoves": [
      "User will defend current approach",
      "Aris should challenge gently (not attack)",
      "User will share deeper fear",
      "Kofi receives the fear with depth",
      "User commits to small experiment"
    ],
    "optimalResponders": [
      ["skeptic"],
      ["guru"],
      ["coach", "pragmatist"]
    ],
    "expectedOutcome": "commitment"
  },
  "alternativePaths": [
    {
      "probability": 0.2,
      "trigger": "User gets defensive and shuts down",
      "response": "Lena (coach) provides safety, back off challenge"
    }
  ],
  "risks": {
    "overwhelm": 0.3,
    "confusion": 0.1,
    "resistance": 0.6
  }
}
```

### 5.3 Integration Points

**Modify PersonaCoordinator:**
```typescript
// persona-coordinator.ts

export class PersonaCoordinator {
  private orchestrator: Orchestrator;

  constructor(context: ConversationContext) {
    this.context = context;
    this.orchestrator = new Orchestrator();
    // ... existing code
  }

  private async getRespondingPersonas(): Promise<PersonaType[]> {
    // PHASE 1 INTEGRATION POINT

    // 1. Check for direct address
    const directAddress = detectDirectAddress(
      this.context.messages[this.context.messages.length - 1].content
    );

    if (directAddress.addressedPersona && directAddress.confidence > 0.8) {
      // User explicitly addressed someone - honor it
      return [directAddress.addressedPersona];
    }

    // 2. Get orchestrator decision
    const orchestratorContext = this.buildOrchestratorContext();
    const decision = await this.orchestrator.decide(orchestratorContext);

    // 3. Log decision for learning
    this.trail.light(
      LED_RANGES.ORCHESTRATOR.DECISION_MADE,
      'orchestrator_decision',
      {
        selected: decision.selectedPersonas,
        reasoning: decision.reasoning,
        prediction: decision.nextTurnPrediction
      }
    );

    // 4. Store decision for learning agent
    this.storeDecision(decision);

    return decision.selectedPersonas;
  }

  private buildOrchestratorContext(): OrchestratorContext {
    const progressionState = getProgressionState(this.context.messages);
    const lastMessage = this.context.messages[this.context.messages.length - 1];

    return {
      category: this.context.session.category,
      stage: progressionState.stage,
      relationshipDepth: progressionState.relationshipDepth,
      userVulnerabilityScore: progressionState.userVulnerabilityScore,
      lastUserMessage: lastMessage.content,
      recentMessages: this.context.messages.slice(-10),
      recentPersonas: this.getRecentPersonas(),
      eligiblePersonas: this.getEligibleByTurnLimits()
    };
  }
}
```

### 5.4 Success Criteria (Phase 1)

**Functional Requirements:**
- ✅ Direct address detection: 95%+ accuracy
- ✅ Orchestrator response time: <3 seconds
- ✅ Avg personas per turn: ↓ from 4.2 to 2.0
- ✅ Character actions display during wait time
- ✅ Reasoning logged to breadcrumb trail
- ✅ Decisions stored for learning agent

**Quality Requirements:**
- ✅ Natural conversation flow (user testing)
- ✅ No information overload (measured by user feedback)
- ✅ Appropriate persona selection (manual review of 20 conversations)
- ✅ Predictions logged for validation in Phase 2

**Technical Requirements:**
- ✅ Backward compatible (existing conversations still work)
- ✅ No breaking changes to types/interfaces
- ✅ Performance within acceptable range (<5s total response time)
- ✅ Error handling (fallback to all-respond if orchestrator fails)

### 5.5 Rollout Strategy (Phase 1)

**Week 1-2: Development**
- Build orchestrator core
- Implement direct address detection
- Create character actions system
- Integration with PersonaCoordinator

**Week 3: Testing**
- Unit tests for direct address parser (95%+ accuracy)
- Integration tests for orchestrator flow
- Manual testing with 10 diverse conversation scenarios
- Performance testing (response time < 5s)

**Week 4: Rollout**
- Deploy to production
- Monitor metrics (personas/turn, response time, user feedback)
- A/B test: 50% users get orchestrator, 50% get old system
- Collect data for Phase 2 learning

---

## 6. Phase 2: Learning Agent

### 6.1 Overview

**Goal:** Automatically analyze completed conversations to extract insights

**Timeline:** 3 weeks
- Week 1: Learning agent core + conversation analysis
- Week 2: Insight extraction + pattern recognition
- Week 3: Storage + integration with export/new conversation

### 6.2 Core Features

#### Feature 2.1: Conversation Analyzer

**Description:** Analyze completed conversation to understand what happened

**Analysis Dimensions:**
```typescript
interface ConversationAnalysis {
  // Basic metrics
  duration: number;  // Total messages
  stageProgression: CoachingStage[];  // Stages reached
  depthReached: number;  // Max relationship depth

  // Participant analysis
  personaContributions: {
    persona: PersonaType;
    messageCount: number;
    avgLength: number;
    keyMoments: number[];  // Message indices where this persona was crucial
  }[];

  // User analysis
  userEngagement: {
    avgMessageLength: number;
    vulnerabilityProgression: number[];  // Vulnerability over time
    commitmentSignals: number;  // How many times user committed
    questionCount: number;
    storyCount: number;  // Personal stories shared
  };

  // Orchestrator performance
  orchestratorDecisions: OrchestratorDecision[];
  decisionQuality: {
    decision: OrchestratorDecision;
    outcome: 'good' | 'neutral' | 'bad';
    reasoning: string;
  }[];

  // Outcome
  outcome: {
    exported: boolean;
    actionCommitment: boolean;
    userSatisfaction?: number;  // If explicit feedback given
    stageReached: CoachingStage;
    breakthroughMoments: number[];  // Message indices
  };

  // Breadcrumb insights
  technicalIssues: {
    errors: number;
    slowRequests: number;
    failedGenerations: number;
  };
}
```

**Analyzer Implementation:**
```typescript
// lib/conversation-analyzer.ts

export class ConversationAnalyzer {
  async analyze(
    messages: Message[],
    session: SessionStart,
    orchestratorDecisions: OrchestratorDecision[],
    breadcrumbs: Breadcrumb[]
  ): Promise<ConversationAnalysis> {

    // 1. Calculate basic metrics
    const duration = messages.length;
    const stageProgression = this.extractStageProgression(messages);
    const depthReached = this.calculateMaxDepth(messages);

    // 2. Analyze each persona's contribution
    const personaContributions = this.analyzePersonaContributions(messages);

    // 3. Analyze user engagement
    const userEngagement = this.analyzeUserEngagement(messages);

    // 4. Evaluate orchestrator decisions
    const decisionQuality = this.evaluateDecisions(
      orchestratorDecisions,
      messages,
      userEngagement
    );

    // 5. Determine outcome
    const outcome = this.determineOutcome(messages, session);

    // 6. Extract technical issues from breadcrumbs
    const technicalIssues = this.analyzeBreadcrumbs(breadcrumbs);

    return {
      duration,
      stageProgression,
      depthReached,
      personaContributions,
      userEngagement,
      orchestratorDecisions,
      decisionQuality,
      outcome,
      technicalIssues
    };
  }

  private evaluateDecisions(
    decisions: OrchestratorDecision[],
    messages: Message[],
    userEngagement: any
  ): { decision: OrchestratorDecision; outcome: string; reasoning: string }[] {
    return decisions.map((decision, index) => {
      // Look at next 2-3 user messages after decision
      const nextUserMessages = this.getNextUserMessages(messages, index, 3);

      // Evaluate if decision led to good outcomes
      const outcome = this.evaluateDecisionOutcome(decision, nextUserMessages);

      return {
        decision,
        outcome: outcome.quality,
        reasoning: outcome.reasoning
      };
    });
  }

  private evaluateDecisionOutcome(
    decision: OrchestratorDecision,
    nextMessages: Message[]
  ): { quality: 'good' | 'neutral' | 'bad'; reasoning: string } {
    // Good outcome signals
    const userEngaged = nextMessages.some(m => m.content.length > 100);
    const userVulnerable = nextMessages.some(m =>
      this.detectVulnerability(m.content)
    );
    const userCommitted = nextMessages.some(m =>
      this.detectCommitment(m.content)
    );

    // Bad outcome signals
    const userDisengaged = nextMessages.every(m => m.content.length < 30);
    const userConfused = nextMessages.some(m =>
      /(confused|don't understand|what do you mean)/i.test(m.content)
    );

    if (userCommitted || (userEngaged && userVulnerable)) {
      return {
        quality: 'good',
        reasoning: 'User became more engaged and vulnerable after this decision'
      };
    }

    if (userDisengaged || userConfused) {
      return {
        quality: 'bad',
        reasoning: 'User disengaged or showed confusion after this decision'
      };
    }

    return {
      quality: 'neutral',
      reasoning: 'No clear positive or negative signal'
    };
  }
}
```

#### Feature 2.2: Insight Extraction

**Description:** Use AI to extract actionable insights from conversation analysis

**Insight Extractor Prompt:**
```typescript
const INSIGHT_EXTRACTION_PROMPT = `
You are analyzing a completed AI Friends coaching conversation to extract insights that will improve future conversations.

CONVERSATION ANALYSIS:
${JSON.stringify(analysis, null, 2)}

FULL CONVERSATION TRANSCRIPT:
${formatTranscript(messages)}

ORCHESTRATOR DECISIONS & OUTCOMES:
${formatDecisions(decisionQuality)}

YOUR TASK:
Extract 3-5 actionable insights that can improve future conversations.

INSIGHT TYPES TO LOOK FOR:

1. **Orchestration Patterns:**
   - "When user shows X, selecting personas Y works better than Z"
   - "In EXPLORATION stage with vulnerable user, avoid Skeptic"

2. **User Archetypes:**
   - "This user matches 'Analytical Overthinker' pattern"
   - "Signals: asks many questions, wants data, delays commitment"
   - "Effective approach: Ben first (grounds in data), then Maya (vision)"

3. **Stage Transitions:**
   - "User moved from UNDERSTANDING to ACTION when Lena asked commitment question"
   - "Breakthrough happened after Kofi reframed their fear"

4. **Persona Effectiveness:**
   - "Maya's expansion was too early - user wasn't ready"
   - "Kofi's vulnerability story built trust at message 12"

5. **Mistakes to Avoid:**
   - "All 5 personas responding at message 5 overwhelmed user"
   - "Aris challenged before trust was built - user got defensive"

RETURN JSON:
{
  "insights": [
    {
      "type": "orchestration_pattern",
      "category": "Business",
      "stage": "EXPLORATION",
      "pattern": "When user mentions fear + numbers/data, select Ben + Lena",
      "evidence": ["Message 3: user said 'afraid of failing financially'", "Ben's practical breakdown calmed user", "User opened up more after safety established"],
      "confidence": 0.8,
      "applicability": "Users who combine emotional fear with practical concerns"
    },
    {
      "type": "user_archetype",
      "archetype": "Anxious Planner",
      "signals": ["mentions fear 4 times", "asks about risks", "wants step-by-step plan"],
      "effectiveApproach": "Start with Lena (safety) → Ben (small wins) → Maya (expand vision only after confidence built)",
      "ineffectiveApproach": "Starting with Maya's big vision triggered more anxiety",
      "confidence": 0.9
    }
  ],
  "conversationQuality": 8.5,
  "keySuccesses": ["Trust built progressively", "User reached ACTION stage", "Exported conversation"],
  "areasForImprovement": ["Too many personas early (messages 1-5)", "Could have moved to ACTION sooner"]
}
`;
```

**Insight Storage Schema:**
```typescript
interface Insight {
  id: string;
  timestamp: number;
  conversationId: string;

  // Classification
  type: 'orchestration_pattern' | 'user_archetype' | 'stage_transition' |
        'persona_effectiveness' | 'mistake_to_avoid';
  category: Category;
  stage?: CoachingStage;

  // Content
  pattern?: string;  // "When X, do Y"
  archetype?: string;  // "Anxious Planner"
  signals?: string[];  // How to detect
  effectiveApproach?: string;
  ineffectiveApproach?: string;

  // Evidence
  evidence: string[];  // Supporting examples from conversation
  confidence: number;  // 0-1

  // Usage tracking
  timesApplied: number;
  successRate?: number;  // Tracked in Phase 3
  lastUsed?: number;
}
```

#### Feature 2.3: Pattern Recognition

**Description:** Identify recurring patterns across multiple conversations

**Pattern Detector:**
```typescript
// lib/pattern-detector.ts

export class PatternDetector {
  async detectPatterns(
    insights: Insight[],
    minOccurrences: number = 3
  ): Promise<Pattern[]> {
    // Group insights by type
    const byType = this.groupByType(insights);

    // Find recurring orchestration patterns
    const orchestrationPatterns = this.findRecurringPatterns(
      byType.orchestration_pattern,
      minOccurrences
    );

    // Identify user archetypes
    const archetypes = this.identifyArchetypes(
      byType.user_archetype,
      minOccurrences
    );

    // Build playbooks
    const playbooks = this.buildPlaybooks(orchestrationPatterns, archetypes);

    return [...orchestrationPatterns, ...archetypes, ...playbooks];
  }

  private findRecurringPatterns(
    insights: Insight[],
    minOccurrences: number
  ): Pattern[] {
    // Use semantic similarity to group similar patterns
    const groups = this.semanticClustering(insights);

    return groups
      .filter(group => group.length >= minOccurrences)
      .map(group => ({
        id: generateId(),
        type: 'orchestration_pattern',
        pattern: this.summarizeGroup(group),
        occurrences: group.length,
        confidence: this.calculateGroupConfidence(group),
        examples: group.slice(0, 3)  // Top 3 examples
      }));
  }

  private identifyArchetypes(
    insights: Insight[],
    minOccurrences: number
  ): UserArchetype[] {
    // Cluster similar user behaviors
    const clusters = this.clusterUserBehaviors(insights);

    return clusters
      .filter(cluster => cluster.size >= minOccurrences)
      .map(cluster => ({
        id: generateId(),
        name: cluster.name,  // "Anxious Planner", "Impulsive Doer", etc.
        signals: cluster.commonSignals,
        effectivePersonas: cluster.bestPersonas,
        effectiveSequence: cluster.bestOrchestration,
        avoidPatterns: cluster.whatNotToDo,
        exampleConversations: cluster.examples
      }));
  }
}
```

**User Archetype Schema:**
```typescript
interface UserArchetype {
  id: string;
  name: string;  // "Anxious Planner", "Analytical Overthinker", "Impulsive Doer"

  // Detection
  signals: string[];  // Keywords, patterns, behaviors
  detectionConfidence: number;  // How reliable is detection

  // Effective approaches
  effectivePersonas: PersonaType[];  // Who works well
  effectiveSequence: PersonaType[][];  // Optimal orchestration sequence
  tonePreference: 'gentle' | 'balanced' | 'direct';

  // Ineffective approaches (avoid)
  avoidPatterns: string[];  // "Don't start with Maya", etc.

  // Examples
  exampleConversations: string[];  // Conversation IDs
  occurrenceCount: number;
}
```

#### Feature 2.4: Outcome Tracking

**Description:** Measure conversation success

**Outcome Metrics:**
```typescript
interface ConversationOutcome {
  // User satisfaction (explicit)
  exportedConversation: boolean;  // Strong positive signal
  explicitFeedback?: {
    rating: number;  // 1-5 if provided
    comment: string;
  };

  // Engagement metrics (implicit)
  messageCount: number;
  avgMessageLength: number;
  stageReached: CoachingStage;
  depthReached: number;

  // Coaching effectiveness
  breakthroughMoments: number;  // High engagement + vulnerability spikes
  commitmentSignals: number;  // "I will", "I commit", etc.
  actionsTaken: string[];  // Extracted from final messages

  // Technical quality
  avgResponseTime: number;
  errorCount: number;
  personasPerTurn: number;

  // Overall score (composite)
  qualityScore: number;  // 0-10 calculated from above metrics
}
```

**Quality Score Calculation:**
```typescript
function calculateQualityScore(outcome: ConversationOutcome): number {
  let score = 5;  // Baseline

  // Positive signals
  if (outcome.exportedConversation) score += 2;
  if (outcome.stageReached === 'ACTION') score += 1;
  if (outcome.commitmentSignals > 0) score += 1;
  if (outcome.depthReached >= 7) score += 1;

  // Engagement
  if (outcome.messageCount > 15) score += 0.5;
  if (outcome.avgMessageLength > 150) score += 0.5;

  // Technical quality
  if (outcome.errorCount === 0) score += 0.5;
  if (outcome.avgResponseTime < 5000) score += 0.5;

  // Negative signals
  if (outcome.messageCount < 5) score -= 2;  // User abandoned quickly
  if (outcome.errorCount > 2) score -= 1;
  if (outcome.personasPerTurn > 4) score -= 0.5;  // Too overwhelming

  return Math.max(0, Math.min(10, score));
}
```

### 6.3 Integration Points

**Trigger Points:**
```typescript
// page.tsx

const handleNewConversation = async () => {
  if (confirm('Start a new conversation? Current conversation will be saved.')) {
    // PHASE 2 INTEGRATION POINT

    // 1. Trigger learning agent BEFORE clearing session
    if (messages.length >= 5) {  // Only analyze substantial conversations
      try {
        await learningAgent.analyzeConversation({
          messages,
          session,
          orchestratorDecisions: getStoredDecisions(),
          breadcrumbs: trail.getBreadcrumbs()
        });
      } catch (error) {
        console.error('Learning agent failed (non-blocking):', error);
        // Don't block user - learning failure is not critical
      }
    }

    // 2. Archive conversation
    localStorage.setItem(`ai-friends-archive-${Date.now()}`, JSON.stringify({
      session,
      messages,
      intensity
    }));

    // 3. Clear session and start fresh
    setSession(null);
    setMessages([]);
    setIntensity(5);
  }
};

const handleExportConversation = async () => {
  // ... existing export logic ...

  // PHASE 2 INTEGRATION POINT
  // Export is a strong positive signal - analyze this conversation
  await learningAgent.analyzeConversation({
    messages,
    session,
    orchestratorDecisions: getStoredDecisions(),
    breadcrumbs: trail.getBreadcrumbs(),
    outcome: {
      exported: true,
      userSatisfaction: 8  // Assume high satisfaction if they exported
    }
  });
};
```

**Storage Implementation:**
```typescript
// lib/learning-storage.ts

class LearningStorage {
  private db: IDBDatabase;

  async storeInsight(insight: Insight): Promise<void> {
    // Store in IndexedDB (or localStorage for MVP)
    const insights = await this.getInsights();
    insights.push(insight);
    localStorage.setItem('ai-friends-insights', JSON.stringify(insights));
  }

  async getInsights(filters?: {
    type?: Insight['type'];
    category?: Category;
    stage?: CoachingStage;
    minConfidence?: number;
  }): Promise<Insight[]> {
    const insights = JSON.parse(
      localStorage.getItem('ai-friends-insights') || '[]'
    );

    if (!filters) return insights;

    return insights.filter(insight => {
      if (filters.type && insight.type !== filters.type) return false;
      if (filters.category && insight.category !== filters.category) return false;
      if (filters.stage && insight.stage !== filters.stage) return false;
      if (filters.minConfidence && insight.confidence < filters.minConfidence) return false;
      return true;
    });
  }

  async getArchetypes(): Promise<UserArchetype[]> {
    return JSON.parse(
      localStorage.getItem('ai-friends-archetypes') || '[]'
    );
  }
}
```

### 6.4 Success Criteria (Phase 2)

**Functional Requirements:**
- ✅ Learning agent runs post-conversation (export or new)
- ✅ 3-5 insights extracted per conversation
- ✅ Insights stored with confidence scores
- ✅ Pattern detection identifies 10+ archetypes after 100 conversations
- ✅ Breadcrumb trail integrated into analysis

**Quality Requirements:**
- ✅ 80%+ of insights are useful (manual review)
- ✅ Archetypes are distinct and recognizable
- ✅ Outcome scores correlate with actual user satisfaction
- ✅ Learning doesn't block user (async, non-blocking)

**Technical Requirements:**
- ✅ Storage under 5MB for 100 conversations
- ✅ Analysis completes in <10 seconds
- ✅ Graceful failure (doesn't break app if learning fails)
- ✅ Backward compatible

### 6.5 Rollout Strategy (Phase 2)

**Week 1: Development**
- Build conversation analyzer
- Implement insight extraction
- Create storage layer

**Week 2: Testing**
- Analyze 20 real conversations manually
- Compare AI insights to human insights
- Validate pattern detection accuracy

**Week 3: Deployment**
- Deploy to production
- Monitor insight quality
- Collect data for Phase 3

---

## 7. Phase 3: Knowledge Base Integration

### 7.1 Overview

**Goal:** Use learned insights to make better orchestration decisions

**Timeline:** 4 weeks
- Week 1: Knowledge base infrastructure (IndexedDB)
- Week 2: Archetype detection + playbook engine
- Week 3: Orchestrator integration
- Week 4: Testing + optimization

### 7.2 Core Features

#### Feature 3.1: Knowledge Base

**Description:** Persistent storage and retrieval of learned insights

**IndexedDB Schema:**
```typescript
// lib/knowledge-base/schema.ts

interface KnowledgeBaseSchema {
  conversations: {
    key: string;  // conversationId
    value: ConversationRecord;
    indexes: {
      timestamp: number;
      category: Category;
      stage: CoachingStage;
      qualityScore: number;
    };
  };

  insights: {
    key: string;  // insightId
    value: Insight;
    indexes: {
      type: Insight['type'];
      category: Category;
      confidence: number;
      timestamp: number;
    };
  };

  archetypes: {
    key: string;  // archetypeId
    value: UserArchetype;
    indexes: {
      name: string;
      occurrenceCount: number;
    };
  };

  playbooks: {
    key: string;  // playbookId
    value: Playbook;
    indexes: {
      archetype: string;
      category: Category;
      successRate: number;
    };
  };
}
```

**Knowledge Base API:**
```typescript
// lib/knowledge-base/index.ts

export class KnowledgeBase {
  private db: Dexie;

  constructor() {
    this.db = new Dexie('AIFriendsKnowledgeBase');
    this.db.version(1).stores({
      conversations: 'id, timestamp, category, stage, qualityScore',
      insights: 'id, type, category, confidence, timestamp',
      archetypes: 'id, name, occurrenceCount',
      playbooks: 'id, archetype, category, successRate'
    });
  }

  // Query relevant insights for orchestration
  async queryForOrchestration(context: {
    category: Category;
    stage: CoachingStage;
    userMessage: string;
  }): Promise<RelevantInsights> {
    // 1. Find similar conversations
    const similar = await this.findSimilarConversations(context);

    // 2. Get relevant insights
    const insights = await this.db.insights
      .where('category').equals(context.category)
      .and(i => i.confidence > 0.7)
      .toArray();

    // 3. Detect user archetype
    const archetype = await this.detectArchetype(context.userMessage);

    // 4. Get playbook if archetype detected
    const playbook = archetype
      ? await this.getPlaybook(archetype.id, context.category)
      : null;

    return {
      similarConversations: similar,
      insights: this.rankInsights(insights, context),
      archetype,
      playbook
    };
  }

  // Find conversations with similar characteristics
  private async findSimilarConversations(context: {
    category: Category;
    stage: CoachingStage;
  }): Promise<ConversationRecord[]> {
    return this.db.conversations
      .where(['category', 'stage'])
      .equals([context.category, context.stage])
      .and(c => c.qualityScore > 7)  // Only learn from successful conversations
      .limit(5)
      .toArray();
  }

  // Rank insights by relevance
  private rankInsights(
    insights: Insight[],
    context: { category: Category; stage: CoachingStage }
  ): Insight[] {
    return insights
      .map(insight => ({
        insight,
        relevance: this.calculateRelevance(insight, context)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10)  // Top 10 most relevant
      .map(item => item.insight);
  }

  private calculateRelevance(
    insight: Insight,
    context: { category: Category; stage: CoachingStage }
  ): number {
    let score = insight.confidence;

    // Category match
    if (insight.category === context.category) score += 0.3;

    // Stage match
    if (insight.stage === context.stage) score += 0.2;

    // Usage success
    if (insight.successRate && insight.successRate > 0.8) score += 0.2;

    // Recency
    const ageInDays = (Date.now() - insight.timestamp) / (1000 * 60 * 60 * 24);
    if (ageInDays < 30) score += 0.1;

    return score;
  }
}
```

#### Feature 3.2: Archetype Detection

**Description:** Identify user type early in conversation

**Archetype Detector:**
```typescript
// lib/archetype-detector.ts

export class ArchetypeDetector {
  private knowledgeBase: KnowledgeBase;

  async detectArchetype(messages: Message[]): Promise<{
    archetype: UserArchetype | null;
    confidence: number;
    reasoning: string;
  }> {
    // Need at least 3-5 user messages for detection
    const userMessages = messages.filter(m => m.persona === 'user');
    if (userMessages.length < 3) {
      return {
        archetype: null,
        confidence: 0,
        reasoning: 'Insufficient messages for archetype detection'
      };
    }

    // Get all known archetypes
    const archetypes = await this.knowledgeBase.getArchetypes();

    // Score each archetype
    const scores = archetypes.map(archetype => ({
      archetype,
      score: this.scoreArchetypeMatch(userMessages, archetype)
    }));

    // Get highest scoring archetype
    const best = scores.sort((a, b) => b.score - a.score)[0];

    if (best.score > 0.6) {  // Confidence threshold
      return {
        archetype: best.archetype,
        confidence: best.score,
        reasoning: this.explainMatch(userMessages, best.archetype)
      };
    }

    return {
      archetype: null,
      confidence: 0,
      reasoning: 'No archetype matched with sufficient confidence'
    };
  }

  private scoreArchetypeMatch(
    messages: Message[],
    archetype: UserArchetype
  ): number {
    let score = 0;
    const totalSignals = archetype.signals.length;

    // Check how many signals are present
    const matchedSignals = archetype.signals.filter(signal =>
      messages.some(m =>
        m.content.toLowerCase().includes(signal.toLowerCase())
      )
    );

    score = matchedSignals.length / totalSignals;

    // Bonus for strong signal matches
    if (matchedSignals.length >= 3) score += 0.2;

    return Math.min(1, score);
  }

  private explainMatch(
    messages: Message[],
    archetype: UserArchetype
  ): string {
    const matched = archetype.signals.filter(signal =>
      messages.some(m => m.content.toLowerCase().includes(signal.toLowerCase()))
    );

    return `Detected ${archetype.name} based on signals: ${matched.join(', ')}`;
  }
}
```

**Archetype Examples:**
```typescript
const EXAMPLE_ARCHETYPES: UserArchetype[] = [
  {
    id: 'anxious-planner',
    name: 'Anxious Planner',
    signals: [
      'afraid', 'scared', 'worried', 'what if', 'fail',
      'step by step', 'plan', 'safe', 'risk'
    ],
    detectionConfidence: 0.85,
    effectivePersonas: ['coach', 'pragmatist'],
    effectiveSequence: [
      ['coach'],  // Start with safety
      ['pragmatist'],  // Small wins
      ['visionary']  // Expand only after confidence
    ],
    tonePreference: 'gentle',
    avoidPatterns: [
      'Don\'t start with big vision (Maya)',
      'Don\'t challenge early (Aris)'
    ],
    exampleConversations: ['conv-123', 'conv-456'],
    occurrenceCount: 15
  },

  {
    id: 'analytical-overthinker',
    name: 'Analytical Overthinker',
    signals: [
      'data', 'research', 'studied', 'analyzed', 'thought about',
      'but also', 'on the other hand', 'many options'
    ],
    detectionConfidence: 0.80,
    effectivePersonas: ['pragmatist', 'skeptic'],
    effectiveSequence: [
      ['pragmatist'],  // Ground in data
      ['skeptic'],  // Help narrow options
      ['coach']  // Push to action
    ],
    tonePreference: 'balanced',
    avoidPatterns: [
      'Don\'t add more options (makes it worse)',
      'Push for decision earlier'
    ],
    exampleConversations: ['conv-789'],
    occurrenceCount: 8
  },

  {
    id: 'impulsive-doer',
    name: 'Impulsive Doer',
    signals: [
      'just do it', 'want to start', 'ready to go',
      'why wait', 'let\'s go', 'I\'ll figure it out'
    ],
    detectionConfidence: 0.90,
    effectivePersonas: ['skeptic', 'pragmatist'],
    effectiveSequence: [
      ['skeptic'],  // Reality check FIRST
      ['pragmatist'],  // Ground in numbers
      ['coach']  // Channel energy wisely
    ],
    tonePreference: 'direct',
    avoidPatterns: [
      'Don\'t amplify excitement (Maya) - needs grounding first',
      'Do challenge early (Aris) - they can handle it'
    ],
    exampleConversations: ['conv-234'],
    occurrenceCount: 6
  }
];
```

#### Feature 3.3: Playbook Engine

**Description:** Apply proven patterns to new conversations

**Playbook Structure:**
```typescript
interface Playbook {
  id: string;
  name: string;

  // When to use
  archetype: string;  // User archetype ID
  category: Category;
  stage?: CoachingStage;  // Optional stage-specific

  // What to do
  orchestrationSequence: {
    turn: number;
    selectedPersonas: PersonaType[];
    tone: string;
    reasoning: string;
  }[];

  // What to avoid
  antiPatterns: string[];

  // Effectiveness
  successRate: number;  // 0-1
  timesUsed: number;
  averageOutcome: number;  // Quality score

  // Examples
  exampleConversations: string[];
}
```

**Playbook Engine:**
```typescript
// lib/playbook-engine.ts

export class PlaybookEngine {
  private knowledgeBase: KnowledgeBase;

  async getPlaybook(context: {
    archetype?: UserArchetype;
    category: Category;
    stage: CoachingStage;
  }): Promise<Playbook | null> {
    // If archetype detected, get archetype-specific playbook
    if (context.archetype) {
      const playbook = await this.knowledgeBase.db.playbooks
        .where(['archetype', 'category'])
        .equals([context.archetype.id, context.category])
        .first();

      if (playbook && playbook.successRate > 0.7) {
        return playbook;
      }
    }

    // Fallback to general category+stage playbook
    const generalPlaybook = await this.knowledgeBase.db.playbooks
      .where('category').equals(context.category)
      .filter(p => !p.archetype && p.successRate > 0.7)
      .first();

    return generalPlaybook || null;
  }

  applyPlaybook(
    playbook: Playbook,
    currentTurn: number
  ): {
    selectedPersonas: PersonaType[];
    tone: string;
    reasoning: string;
  } | null {
    // Find orchestration guidance for current turn
    const guidance = playbook.orchestrationSequence.find(
      seq => seq.turn === currentTurn
    );

    if (!guidance) {
      // Playbook doesn't cover this turn - use default orchestration
      return null;
    }

    return {
      selectedPersonas: guidance.selectedPersonas,
      tone: guidance.tone,
      reasoning: `Playbook "${playbook.name}": ${guidance.reasoning}`
    };
  }
}
```

**Playbook Example:**
```typescript
const ANXIOUS_PLANNER_BUSINESS_PLAYBOOK: Playbook = {
  id: 'anxious-planner-business-v1',
  name: 'Anxious Planner - Business Launch',
  archetype: 'anxious-planner',
  category: 'Business',

  orchestrationSequence: [
    {
      turn: 1,
      selectedPersonas: ['coach'],
      tone: 'gentle',
      reasoning: 'Lena provides safety and acknowledgment. User needs to feel heard before challenged.'
    },
    {
      turn: 2,
      selectedPersonas: ['pragmatist'],
      tone: 'gentle',
      reasoning: 'Ben grounds in practical small steps. Anxious users need concrete, achievable actions.'
    },
    {
      turn: 3,
      selectedPersonas: ['coach', 'pragmatist'],
      tone: 'balanced',
      reasoning: 'Lena + Ben reinforce small wins approach. Build confidence before expansion.'
    },
    {
      turn: 4,
      selectedPersonas: ['visionary'],
      tone: 'balanced',
      reasoning: 'NOW safe to expand vision (Maya). User has foundation and confidence.'
    }
  ],

  antiPatterns: [
    'Do NOT start with Maya (vision too big, triggers anxiety)',
    'Do NOT use Aris in first 3 turns (challenge feels like attack)',
    'Do NOT present multiple options (decision paralysis)'
  ],

  successRate: 0.85,
  timesUsed: 12,
  averageOutcome: 8.3,
  exampleConversations: ['conv-100', 'conv-245', 'conv-389']
};
```

#### Feature 3.4: Continuous Improvement Loop

**Description:** System improves with every conversation

**Feedback Loop:**
```typescript
// After each conversation with knowledge base integration

1. Orchestrator uses knowledge base
   ↓
2. Conversation happens
   ↓
3. Learning agent analyzes outcome
   ↓
4. Compare predicted vs actual outcome
   ↓
5. Update insight confidence scores
   ↓
6. Refine playbooks based on success
   ↓
7. Next conversation uses improved knowledge
```

**Insight Refinement:**
```typescript
// lib/insight-refiner.ts

export class InsightRefiner {
  async refineInsight(
    insightId: string,
    outcome: { success: boolean; qualityScore: number }
  ): Promise<void> {
    const insight = await this.knowledgeBase.getInsight(insightId);

    // Update usage statistics
    insight.timesApplied++;

    // Update success rate
    if (!insight.successRate) {
      insight.successRate = outcome.success ? 1 : 0;
    } else {
      // Exponential moving average
      const alpha = 0.3;  // Weight recent outcomes more
      insight.successRate =
        alpha * (outcome.success ? 1 : 0) +
        (1 - alpha) * insight.successRate;
    }

    // Adjust confidence based on success rate
    if (insight.timesApplied > 5) {
      // After enough applications, confidence converges to success rate
      insight.confidence =
        0.7 * insight.successRate +
        0.3 * insight.confidence;
    }

    // If success rate drops below threshold, deprecate
    if (insight.timesApplied > 10 && insight.successRate < 0.4) {
      insight.deprecated = true;
      insight.deprecationReason = 'Low success rate after multiple applications';
    }

    await this.knowledgeBase.updateInsight(insight);
  }
}
```

**Playbook Refinement:**
```typescript
async refinePlaybook(
  playbookId: string,
  conversationOutcome: ConversationOutcome
): Promise<void> {
  const playbook = await this.knowledgeBase.getPlaybook(playbookId);

  // Update usage stats
  playbook.timesUsed++;

  // Update average outcome
  playbook.averageOutcome =
    (playbook.averageOutcome * (playbook.timesUsed - 1) +
     conversationOutcome.qualityScore) /
    playbook.timesUsed;

  // Update success rate (quality score > 7 = success)
  const success = conversationOutcome.qualityScore > 7;
  playbook.successRate =
    (playbook.successRate * (playbook.timesUsed - 1) +
     (success ? 1 : 0)) /
    playbook.timesUsed;

  await this.knowledgeBase.updatePlaybook(playbook);
}
```

### 7.3 Orchestrator Integration

**Enhanced Orchestrator with Knowledge Base:**
```typescript
// lib/orchestrator.ts (Phase 3 version)

export class Orchestrator {
  private knowledgeBase: KnowledgeBase;
  private archetypeDetector: ArchetypeDetector;
  private playbookEngine: PlaybookEngine;

  async decide(context: OrchestratorContext): Promise<OrchestratorDecision> {
    // 1. Query knowledge base for relevant insights
    const knowledgeQuery = await this.knowledgeBase.queryForOrchestration({
      category: context.category,
      stage: context.stage,
      userMessage: context.lastUserMessage
    });

    // 2. Detect user archetype (if not already detected)
    const archetype = knowledgeQuery.archetype ||
      await this.archetypeDetector.detectArchetype(context.recentMessages);

    // 3. Get playbook if archetype detected
    const playbook = knowledgeQuery.playbook ||
      await this.playbookEngine.getPlaybook({
        archetype,
        category: context.category,
        stage: context.stage
      });

    // 4. If playbook exists and has high success rate, follow it
    if (playbook && playbook.successRate > 0.75) {
      const playbookGuidance = this.playbookEngine.applyPlaybook(
        playbook,
        context.recentMessages.length
      );

      if (playbookGuidance) {
        return {
          selectedPersonas: playbookGuidance.selectedPersonas,
          reasoning: playbookGuidance.reasoning,
          characterActions: this.selectActions(playbookGuidance.selectedPersonas),
          suggestedTone: playbookGuidance.tone,
          nextTurnPrediction: this.predictFromPlaybook(playbook),
          usedKnowledge: {
            playbook: playbook.id,
            archetype: archetype?.id,
            insights: knowledgeQuery.insights.map(i => i.id)
          }
        };
      }
    }

    // 5. No playbook or low confidence - use AI orchestrator with knowledge context
    const decision = await this.aiDecide({
      ...context,
      relevantInsights: knowledgeQuery.insights,
      archetype,
      similarConversations: knowledgeQuery.similarConversations
    });

    return decision;
  }

  private async aiDecide(enhancedContext: any): Promise<OrchestratorDecision> {
    // Enhanced prompt with knowledge context
    const prompt = `
${ORCHESTRATOR_SYSTEM_PROMPT}

LEARNED INSIGHTS (from ${enhancedContext.relevantInsights.length} past conversations):
${this.formatInsights(enhancedContext.relevantInsights)}

${enhancedContext.archetype ? `
DETECTED USER ARCHETYPE: ${enhancedContext.archetype.name}
Effective approach: ${enhancedContext.archetype.effectiveSequence}
Avoid: ${enhancedContext.archetype.avoidPatterns}
` : ''}

SIMILAR SUCCESSFUL CONVERSATIONS:
${this.formatSimilarConversations(enhancedContext.similarConversations)}

[Rest of orchestrator prompt with current context...]
`;

    const response = await this.aiClient.generate({
      prompt,
      system: ORCHESTRATOR_SYSTEM_PROMPT
    });

    return JSON.parse(response);
  }
}
```

### 7.4 Success Criteria (Phase 3)

**Functional Requirements:**
- ✅ Knowledge base stores 100+ conversations, 300+ insights
- ✅ Archetype detection <5 messages, 80%+ accuracy
- ✅ Playbooks applied automatically when detected
- ✅ Continuous improvement (insights refined with usage)
- ✅ IndexedDB migration completed

**Quality Requirements:**
- ✅ Orchestrator decisions improved by knowledge (A/B test shows +15% quality)
- ✅ New users get same quality as experienced system (no cold start)
- ✅ Archetype detection feels accurate to users
- ✅ System demonstrably improves over time (chart of quality scores)

**Technical Requirements:**
- ✅ Knowledge base queries <200ms
- ✅ Storage <50MB for 1000 conversations
- ✅ Graceful degradation if knowledge base unavailable
- ✅ Migration from localStorage to IndexedDB seamless

### 7.5 Rollout Strategy (Phase 3)

**Week 1: Infrastructure**
- Implement IndexedDB with Dexie
- Migration from localStorage
- Knowledge base core API

**Week 2: Intelligence**
- Archetype detector
- Playbook engine
- Refinement loops

**Week 3: Integration**
- Orchestrator knowledge integration
- Testing with real data
- Performance optimization

**Week 4: Validation**
- A/B test: orchestrator with vs without knowledge
- Measure improvement metrics
- Production rollout

---

## 8. Technical Specifications

### 8.1 Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript 5+
- React 18+
- Tailwind CSS

**AI:**
- OpenRouter (cloud) or Ollama (local)
- Model: Configurable (default qwen3:30b - proven 44/50+ quality)

**Storage:**
- Phase 1-2: localStorage (5-10MB limit)
- Phase 3: IndexedDB via Dexie.js (50MB+)

**Dependencies:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "dexie": "^3.2.0",  // Phase 3
    "dexie-react-hooks": "^1.1.0"  // Phase 3
  }
}
```

### 8.2 Performance Budgets

| Metric | Target | Maximum |
|--------|--------|---------|
| Orchestrator decision time | <2s | 3s |
| Total response time (orchestrator + personas) | <5s | 8s |
| Learning agent analysis | <10s | 15s |
| Knowledge base query | <100ms | 200ms |
| Archetype detection | <50ms | 100ms |
| Storage size (100 conversations) | <2MB | 5MB |

### 8.3 Error Handling

**Orchestrator Failures:**
```typescript
try {
  const decision = await orchestrator.decide(context);
  return decision.selectedPersonas;
} catch (error) {
  console.error('Orchestrator failed, falling back to default:', error);
  breadcrumb.fail(LED_RANGES.ORCHESTRATOR.ERROR, error);

  // Fallback: Use default logic
  return this.getDefaultResponders(context);
}
```

**Learning Agent Failures:**
```typescript
try {
  await learningAgent.analyze(conversation);
} catch (error) {
  console.error('Learning failed (non-critical):', error);
  breadcrumb.fail(LED_RANGES.LEARNING.ERROR, error);

  // Don't block user - learning failure is acceptable
  // Log for debugging but continue
}
```

**Knowledge Base Failures:**
```typescript
try {
  const insights = await knowledgeBase.query(context);
  return insights;
} catch (error) {
  console.error('Knowledge base query failed, using AI only:', error);
  breadcrumb.fail(LED_RANGES.KNOWLEDGE_BASE.ERROR, error);

  // Graceful degradation: orchestrator works without knowledge
  return { insights: [], archetype: null, playbook: null };
}
```

### 8.4 Logging & Debugging

**LED Ranges (New):**
```typescript
export const LED_RANGES = {
  // ... existing ranges ...

  ORCHESTRATOR: {
    DECISION_START: 20600,
    DECISION_COMPLETE: 20601,
    DIRECT_ADDRESS_DETECTED: 20602,
    PLAYBOOK_APPLIED: 20603,
    ERROR: 20699
  },

  LEARNING: {
    ANALYSIS_START: 20700,
    INSIGHT_EXTRACTED: 20701,
    PATTERN_DETECTED: 20702,
    ARCHETYPE_IDENTIFIED: 20703,
    ERROR: 20799
  },

  KNOWLEDGE_BASE: {
    QUERY_START: 20800,
    QUERY_COMPLETE: 20801,
    INSIGHT_STORED: 20802,
    PLAYBOOK_RETRIEVED: 20803,
    ERROR: 20899
  }
};
```

**Breadcrumb Examples:**
```typescript
// Orchestrator decision
trail.light(LED_RANGES.ORCHESTRATOR.DECISION_START, 'orchestrator_deciding', {
  stage: context.stage,
  eligiblePersonas: context.eligiblePersonas
});

trail.light(LED_RANGES.ORCHESTRATOR.DECISION_COMPLETE, 'decision_made', {
  selected: decision.selectedPersonas,
  reasoning: decision.reasoning,
  usedPlaybook: decision.usedKnowledge?.playbook
});

// Learning extraction
trail.light(LED_RANGES.LEARNING.INSIGHT_EXTRACTED, 'insight_created', {
  type: insight.type,
  confidence: insight.confidence,
  pattern: insight.pattern
});

// Knowledge base query
trail.light(LED_RANGES.KNOWLEDGE_BASE.QUERY_COMPLETE, 'knowledge_retrieved', {
  insightCount: insights.length,
  archetype: archetype?.name,
  playbookFound: !!playbook
});
```

---

## 9. Data Models

*(Data models already extensively covered in previous sections)*

**Core Types:**
- `OrchestratorContext` - Input to orchestrator
- `OrchestratorDecision` - Output from orchestrator
- `Insight` - Extracted learning
- `UserArchetype` - User type pattern
- `Playbook` - Proven orchestration sequence
- `ConversationAnalysis` - Post-conversation metrics

---

## 10. API Specifications

### 10.1 Orchestrator API

```typescript
interface Orchestrator {
  /**
   * Decide which personas should respond
   */
  decide(context: OrchestratorContext): Promise<OrchestratorDecision>;

  /**
   * Predict conversation path (chess-style)
   */
  predict(context: OrchestratorContext): Promise<ConversationPath>;
}
```

### 10.2 Learning Agent API

```typescript
interface LearningAgent {
  /**
   * Analyze completed conversation
   */
  analyzeConversation(data: {
    messages: Message[];
    session: SessionStart;
    orchestratorDecisions: OrchestratorDecision[];
    breadcrumbs: Breadcrumb[];
    outcome?: Partial<ConversationOutcome>;
  }): Promise<{
    analysis: ConversationAnalysis;
    insights: Insight[];
  }>;

  /**
   * Extract insights from analysis
   */
  extractInsights(analysis: ConversationAnalysis): Promise<Insight[]>;
}
```

### 10.3 Knowledge Base API

```typescript
interface KnowledgeBase {
  /**
   * Query for orchestration
   */
  queryForOrchestration(context: {
    category: Category;
    stage: CoachingStage;
    userMessage: string;
  }): Promise<RelevantInsights>;

  /**
   * Store insight
   */
  storeInsight(insight: Insight): Promise<void>;

  /**
   * Get archetype by ID
   */
  getArchetype(id: string): Promise<UserArchetype>;

  /**
   * Get playbook
   */
  getPlaybook(archetypeId: string, category: Category): Promise<Playbook | null>;

  /**
   * Update insight based on usage
   */
  refineInsight(insightId: string, outcome: { success: boolean }): Promise<void>;
}
```

---

## 11. UI/UX Requirements

### 11.1 Phase 1: Visual Feedback

**Typing Indicators:**
- Show all personas initially: "Maya is thinking...", "Ben is thinking..."
- Character actions appear: "*Maya leans forward intensely*"
- Non-selected personas fade out smoothly
- Selected personas show final typing indicator before response

**Response Display:**
- Stagger responses (not all at once)
- 1-2 second delay between responses
- Smooth scroll to new responses

**Direct Address Acknowledgment:**
```
User: "Kofi, what do you think?"

[Other personas fade out]
[Kofi shows]: "*closes eyes briefly, centering*"
[Kofi responds]
```

### 11.2 Phase 2: No UI Changes

Learning agent runs in background, no user-facing UI needed.

### 11.3 Phase 3: Optional Dashboard

**Knowledge Dashboard (Future Enhancement):**
- Show system improvement over time (quality score chart)
- Display detected archetype for current user
- Show which playbook is being used
- Export conversation insights

---

## 12. Performance Requirements

### 12.1 Response Time

**Phase 1 Targets:**
- User sends message → Orchestrator decides: <2s
- Orchestrator decides → Personas respond: 2-8s (parallel)
- **Total:** <10s max (acceptable for thoughtful responses)

**Phase 2 Targets:**
- Learning agent analysis: <10s (async, non-blocking)

**Phase 3 Targets:**
- Knowledge base query: <100ms
- Archetype detection: <50ms

### 12.2 Storage

**Phase 1-2:**
- localStorage: <5MB for 100 conversations
- Insights: <500KB

**Phase 3:**
- IndexedDB: <50MB for 1000 conversations
- Efficient indexing for fast queries

### 12.3 Scalability

**Client-Side Architecture:**
- All computation happens in browser
- No backend scaling needed
- IndexedDB handles 50MB+ easily

**AI Provider:**
- OpenRouter: Scales automatically
- Ollama: Limited by local hardware

---

## 13. Security & Privacy

### 13.1 Data Storage

**User Data:**
- All conversations stored locally (IndexedDB/localStorage)
- No server-side storage of conversations
- User can clear data anytime

**Privacy:**
- No cross-user data sharing
- Each browser has isolated knowledge base
- No telemetry or tracking

### 13.2 AI Provider Security

**OpenRouter:**
- API key stored in environment variables (not committed to git)
- Requests proxied through Next.js API routes
- No API key exposed to client

**Ollama:**
- Runs locally, no external network calls
- Complete privacy

---

## 14. Testing Strategy

### 14.1 Unit Tests

**Components to Test:**
- `DirectAddressParser`: 95%+ accuracy on test cases
- `ArchetypeDetector`: Correctly identifies known archetypes
- `PlaybookEngine`: Applies playbooks accurately
- `ConversationAnalyzer`: Extracts correct metrics

**Test Framework:** Jest

### 14.2 Integration Tests

**Orchestrator Flow:**
```typescript
test('Orchestrator selects correct personas for direct address', async () => {
  const context = {
    lastUserMessage: "Kofi, what do you think about fear?",
    // ... other context
  };

  const decision = await orchestrator.decide(context);

  expect(decision.selectedPersonas).toEqual(['guru']);
  expect(decision.reasoning).toContain('direct address');
});
```

**Learning Agent:**
```typescript
test('Learning agent extracts insights from conversation', async () => {
  const conversation = loadTestConversation('anxious-user-business');
  const analysis = await learningAgent.analyze(conversation);

  expect(analysis.insights.length).toBeGreaterThan(2);
  expect(analysis.insights.some(i => i.type === 'user_archetype')).toBe(true);
});
```

### 14.3 Manual Testing

**Phase 1 Test Scenarios:**
1. Direct address test: "Kofi, what do you think?" → Only Kofi responds
2. Vulnerability test: User shares fear → Lena/Kofi respond, not Aris
3. Action readiness test: User commits → Ben/Lena respond with action steps
4. Character actions test: Visual feedback appears during wait

**Phase 2 Test Scenarios:**
1. Conversation export → Learning agent runs
2. New conversation → Learning agent analyzes previous
3. Insight quality review: Manual review of 20 extracted insights

**Phase 3 Test Scenarios:**
1. Archetype detection: Does system correctly identify user type?
2. Playbook application: Does orchestrator follow proven patterns?
3. Quality improvement: A/B test shows knowledge base improves outcomes

### 14.4 A/B Testing

**Phase 1:**
- 50% users: Orchestrator enabled
- 50% users: Old all-respond system
- Measure: Personas/turn, message length, session length

**Phase 3:**
- 50% users: Orchestrator with knowledge base
- 50% users: Orchestrator without knowledge base
- Measure: Quality score, stage reached, user satisfaction

---

## 15. Rollout Plan

### 15.1 Phase 1 Rollout (Week 4)

**Preparation:**
- All tests passing
- Performance benchmarks met
- Error handling validated

**Deployment:**
- Deploy to production with feature flag
- Enable for 10% of users (canary)
- Monitor errors, performance, user feedback
- Gradually increase to 100% over 1 week

**Success Criteria:**
- Zero critical bugs
- Response time <8s (95th percentile)
- Personas/turn ↓ to 2.0 avg

### 15.2 Phase 2 Rollout (Week 3)

**Preparation:**
- Test learning agent on 20 conversations
- Validate insight quality
- Ensure non-blocking behavior

**Deployment:**
- Deploy to 100% immediately (non-user-facing)
- Monitor insight extraction quality
- Manual review of first 50 insights

**Success Criteria:**
- No user-facing impact (fast enough)
- 80%+ of insights are useful
- Storage under 5MB for 100 conversations

### 15.3 Phase 3 Rollout (Week 4)

**Preparation:**
- IndexedDB migration tested thoroughly
- A/B test setup ready
- Rollback plan in place

**Deployment:**
- Deploy migration to 100% (localStorage → IndexedDB)
- Enable knowledge base for 50% (A/B test)
- Monitor quality improvements

**Success Criteria:**
- Migration completes without data loss
- Knowledge base queries <200ms
- A/B test shows +15% quality improvement

---

## 16. Dependencies & Risks

### 16.1 Dependencies

**Technical:**
- Next.js 14+ (stable)
- OpenRouter or Ollama availability
- Browser IndexedDB support (99%+ browsers)
- Dexie.js library (mature, well-supported)

**AI Provider:**
- OpenRouter API reliability
- Ollama local model availability
- LLM reasoning quality (for orchestrator decisions)

### 16.2 Risks & Mitigation

**Risk 1: Orchestrator Decision Quality**
- **Risk:** AI makes poor orchestration decisions
- **Impact:** Bad UX, wrong personas respond
- **Mitigation:**
  - Fallback to rule-based logic if confidence low
  - A/B test to validate improvements
  - Manual review of decisions

**Risk 2: Learning Agent Extracts Poor Insights**
- **Risk:** Insights are noise, not signal
- **Impact:** Knowledge base polluted with bad advice
- **Mitigation:**
  - Confidence scoring on insights
  - Minimum threshold for usage
  - Manual review of high-usage insights
  - Deprecation mechanism for low-success insights

**Risk 3: IndexedDB Migration Failure**
- **Risk:** Data loss during localStorage → IndexedDB migration
- **Impact:** Users lose conversation history
- **Mitigation:**
  - Thorough testing before rollout
  - Keep localStorage as backup during migration
  - Gradual rollout with monitoring
  - Rollback plan

**Risk 4: Performance Degradation**
- **Risk:** Orchestrator adds too much latency
- **Impact:** Slow responses frustrate users
- **Mitigation:**
  - Performance budgets enforced
  - Parallel orchestration where possible
  - Fallback to simple logic if timeout
  - Continuous monitoring

**Risk 5: Storage Limits**
- **Risk:** Knowledge base grows too large
- **Impact:** Storage quota exceeded, app breaks
- **Mitigation:**
  - Automatic cleanup of old insights
  - Configurable retention policy
  - Warning when approaching limits
  - Compression strategies

---

## 17. Open Questions

### 17.1 Orchestrator Design

**Q1: Should orchestrator run in parallel with persona generation?**
- **Option A:** Sequential (orchestrator first, then personas) - simpler, +2s latency
- **Option B:** Parallel (orchestrator + persona prep) - complex, no extra latency
- **✅ DECISION:** Sequential with smart hard rules (direct address detection, summary/closing response patterns) + visual feedback via character actions
- **Rationale:** Simpler implementation for Phase 1. Hard rules handle 60%+ of cases instantly (no AI call). Visual feedback (character actions) provides user feedback during orchestrator thinking time. Can optimize to parallel in future if latency becomes issue.

**Q2: What model should orchestrator use?**
- **Option A:** Same as personas (high quality, slower)
- **Option B:** Faster model like claude-haiku (cheaper, faster, lower quality)
- **Option C:** Rule-based with AI fallback
- **✅ DECISION:** Progressive enhancement - hard rules first, then qwen3:30b for complex cases
- **Rationale:** Hard rules handle direct address (60%+ of cases) with zero latency/cost. AI model (qwen3:30b) only runs for ambiguous cases. Proven 44/50+ quality baseline. Balances speed, cost, and quality.

**Q3: How to handle orchestrator failures?**
- **Option A:** Always fallback to all-respond
- **Option B:** Use last known good decision
- **Option C:** Rule-based fallback
- **✅ DECISION:** Rule-based fallback with email alerts
- **Implementation:** On orchestrator failure, use depth-based rules (depth <3 → Sarah, depth 3-6 → Marcus, depth 7+ → Alex). Email alert sent via /api/report-error endpoint for investigation. Breadcrumb logged with failure details.
- **Rationale:** Safer than all-respond (avoids cacophony). More reliable than last-known-good (context may have changed). Email alerts ensure failures are tracked and investigated.

### 17.2 Learning Agent

**Q4: How often should learning agent run?**
- **Option A:** After every conversation (comprehensive)
- **Option B:** Only conversations >5 messages (filter short)
- **Option C:** Only when user exports (high signal)
- **✅ DECISION:** Start with >3 messages (capture early learning), later increase to >5 messages once sufficient data collected
- **Rationale:** Early conversations are valuable for initial pattern learning even if short. After 50+ analyzed conversations, increase threshold to >5 to reduce noise.

**Q5: Should users opt-in to learning?**
- **Privacy Consideration:** Learning stores conversation data
- **Option A:** Opt-in (explicit consent)
- **Option B:** Opt-out (default enabled, can disable)
- **Option C:** Always on (no option)
- **✅ DECISION:** Option C (always on) with privacy-by-abstraction
- **Privacy Model:** Analyzer extracts structural patterns/metrics only, then deletes conversation content
- **What's Stored:** Stage progression, depth scores, orchestrator decisions, outcome signals, technical metrics (NO message content, NO PII)
- **Rollout Safety:**
  - Phase 2A: Double-store (insights + original messages) for 2-4 weeks, verify analyzer quality
  - Phase 2B: Continue double-storing, automated validation, monitor >99% success rate
  - Phase 2C: Delete content for conversations >30 days old only
  - Phase 2D: Immediate deletion after successful analysis (requires >99.5% analyzer reliability)
- **Rationale:** Users get better experience without privacy trade-off. Humans never see conversation content, only abstracted patterns.

### 17.3 Knowledge Base

**Q6: Should knowledge base be user-specific or global?**
- **Option A:** User-specific (isolated, private)
- **Option B:** Global (cross-user learning)
- **Option C:** Hybrid (user-specific + anonymized global)
- **✅ DECISION:** Option A (user-specific) for MVP
- **Rationale:** User archetypes and successful patterns are personal. Relationship depth, playbook effectiveness vary per user. Simpler architecture, clearer privacy model. Consider hybrid Option C post-MVP for anonymized aggregate insights.

**Q7: How long should insights persist?**
- **Option A:** Forever (unlimited growth)
- **Option B:** 90 days (rolling window)
- **Option C:** Keep high-confidence, prune low-confidence
- **✅ DECISION:** Option C (tiered retention by confidence/value)
- **Retention Strategy:**
  - Keep Forever: Detected archetypes, proven playbooks (10+ uses, >70% success), major milestones
  - Keep 90 Days: Recent patterns, experimental playbooks (<10 uses), low-confidence insights
  - Delete After 30 Days: Failed patterns (<40% success after 3+ uses), technical metrics, duplicates
- **Storage Estimate:** ~2KB per conversation, ~50-100KB steady state per user after pruning
- **Rationale:** Quality over quantity. Keep valuable learnings, prune noise. Prevents unlimited growth while preserving proven insights.

**Q8: When should playbooks be auto-created?**
- **Threshold:** How many similar conversations needed?
- **Option A:** 3+ conversations (fast learning, risky)
- **Option B:** 10+ conversations (slower, safer)
- **Option C:** Manual review required
- **✅ DECISION:** Option B (10+ conversations, 70%+ success rate)
- **Creation Criteria (ALL required):**
  - Minimum 10 similar conversations with same archetype signals
  - Success rate >= 70% (ACTION stage reached or exported)
  - At least 3 conversations from last 30 days (recency check)
  - Exclude admin/testing sessions (isAdminMode flag)
- **Playbook Maturity Levels:**
  - EXPERIMENTAL: 3-9 conversations (observation only, not used)
  - VALIDATED: 10+ conversations, 70%+ success (actively used)
  - PROVEN: 20+ conversations, 80%+ success (preferred by orchestrator)
- **Rationale:** Conservative threshold prevents false patterns. Excluding admin testing ensures clean production data. Maturity levels allow gradual confidence building.

---

## 18. Appendix

### 18.1 Glossary

**Orchestrator:** AI agent that decides which personas should respond

**Direct Address:** User explicitly mentions a persona by name

**Character Action:** Physical staging like "*leans forward*"

**Coaching Stage:** EXPLORATION, UNDERSTANDING, GUIDANCE, ACTION

**Relationship Depth:** 0-10 score of trust/vulnerability level

**Insight:** Learned pattern extracted from conversation

**User Archetype:** Recognized user type (e.g., "Anxious Planner")

**Playbook:** Proven orchestration sequence for specific archetype

**Knowledge Base:** Persistent storage of learned insights

**Chess Player:** Predictive thinking 2-3 moves ahead

**Breadcrumb:** LED debugging log entry

### 18.2 Success Metrics Summary

| Metric | Baseline | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|--------|----------|----------------|----------------|----------------|
| **Personas/Turn** | 4.2 | 2.0 (-52%) | 2.0 | 1.8 (-57%) |
| **Direct Address Accuracy** | 0% | 95% | 95% | 98% |
| **Avg Messages/Session** | 8.5 | 10.0 (+18%) | 10.0 | 12.0 (+41%) |
| **Stage Reach Rate (ACTION)** | 42% | 50% | 50% | 60% |
| **Quality Score** | 6.5 | 7.0 | 7.5 | 8.5 |
| **Insights Extracted** | 0 | 0 | 3-5/conv | 3-5/conv |
| **Archetypes Detected** | 0 | 0 | 10+ | 15+ |
| **Playbooks Created** | 0 | 0 | 5+ | 20+ |

### 18.3 Timeline Summary

**Phase 1: Intelligent Orchestrator (4 weeks)**
- Week 1: Core development
- Week 2: Predictions + actions
- Week 3: Testing
- Week 4: Rollout

**Phase 2: Learning Agent (3 weeks)**
- Week 1: Analysis + extraction
- Week 2: Pattern recognition
- Week 3: Deployment

**Phase 3: Knowledge Base (4 weeks)**
- Week 1: IndexedDB infrastructure
- Week 2: Archetypes + playbooks
- Week 3: Integration
- Week 4: Validation + rollout

**Total: 11 weeks** (assuming no overlap, could be parallelized)

### 18.4 Related Documents

- `coaching-progression.ts` - Existing stage/depth tracking system
- `persona-coordinator.ts` - Current orchestration logic
- `breadcrumb-system.ts` - LED debugging infrastructure
- `.claude/MANDATORY-DEV-PROCESS.md` - Development guidelines
- `tools/HOW-TO-RUN-MULTI-SCENARIO-TEST.md` - Testing methodology

---

**END OF PRD**

*This PRD is a living document and will be updated as implementation progresses.*
