# Word-Level TTS Highlighting PRD

## Problem Statement

Text highlighting doesn't sync with TTS during streaming. The current implementation uses 80-character chunks, which:
- Cut words mid-word (e.g., "unders|tand")
- Don't align with visual line wrapping
- Highlight large blocks instead of individual words

**Failed Approaches:**
1. Sentence regex - streaming chunks don't align with sentence boundaries
2. Newline splitting - newlines are scattered unpredictably in streaming
3. 80-char grid - cuts words, doesn't match visual wrapping

## Solution

Use **Edge TTS word boundary metadata** for precise word-level highlighting.

Edge TTS already provides timing data per word during synthesis:
```json
{"text": "Hello", "offset": 0, "duration": 5000000}
```
(Offset/duration in 100-nanosecond ticks; 10,000 ticks = 1ms)

During playback, compare `audio.currentTime` against word boundaries to highlight the exact word being spoken.

---

## Current Architecture

### TTS Server (`Voice-Type/tts_edge_server.py`)
- FastAPI server using `edge_tts` library
- Returns MP3 audio bytes only
- **Ignores** `WordBoundary` chunks (only processes `audio` chunks)
- Endpoint: `POST /synthesize` or `POST /synthesize/advisor/{advisor_id}`

**Current code (lines 141-144):**
```python
async for chunk in communicate.stream():
    if chunk["type"] == "audio":
        audio_data.write(chunk["data"])
    # WordBoundary chunks are IGNORED
```

### Frontend API (`advisor-team-mvp/app/api/tts/route.ts`)
- Proxies requests to TTS server
- Simple: text in → audio bytes out
- No metadata handling

### useTTS Hook (`advisor-team-mvp/hooks/useTTS.ts`)
- `LineTracker` class: splits streaming text into 80-char chunks (problematic)
- `AudioQueue` class: gapless playback using Web Audio API
- Tracks `speakingIndex` (which chunk is playing, not which word)
- Callbacks: `onSentenceStart(index)`, `onSentenceEnd(index)`

### SpeakableMessage (`advisor-team-mvp/components/SpeakableMessage.tsx`)
- Receives `sentences[]` (actually 80-char chunks)
- Highlights **entire chunk** when speaking
- CSS class toggle: `.sentence-speaking` (yellow background)

---

## Required Changes

### Phase 1: TTS Server - Return Word Boundaries

**File:** `Voice-Type/tts_edge_server.py`

**Changes:**
1. Capture `WordBoundary` chunks during synthesis
2. Create new endpoint that returns JSON with audio + metadata
3. Convert 100ns ticks to milliseconds

**New Response Format:**
```json
{
  "audio": "<base64-encoded-mp3>",
  "wordBoundaries": [
    {"text": "Hello", "offsetMs": 0, "durationMs": 500},
    {"text": "world", "offsetMs": 520, "durationMs": 480}
  ]
}
```

**Implementation:**
```python
async def generate_speech_with_boundaries(text: str, voice: str) -> tuple[bytes, list]:
    communicate = edge_tts.Communicate(text, voice)
    audio_data = io.BytesIO()
    word_boundaries = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.write(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            # Convert 100ns ticks to ms
            word_boundaries.append({
                "text": chunk["text"],
                "offsetMs": chunk["offset"] // 10000,
                "durationMs": chunk["duration"] // 10000
            })

    return audio_data.getvalue(), word_boundaries
```

**New endpoint:** `POST /synthesize/with-boundaries`

### Phase 2: Frontend API - Pass Metadata Through

**File:** `advisor-team-mvp/app/api/tts/route.ts`

**Changes:**
1. Call new TTS endpoint that returns JSON
2. Parse response and pass through to client
3. Base64 encode audio for JSON response

**New Response Format:**
```typescript
interface TTSResponse {
  audio: string  // base64
  wordBoundaries: Array<{
    text: string
    offsetMs: number
    durationMs: number
  }>
}
```

### Phase 3: useTTS Hook - Track Word Position

**File:** `advisor-team-mvp/hooks/useTTS.ts`

**Major Changes:**

1. **Replace LineTracker with sentence/paragraph extraction**
   - Extract complete sentences using improved regex (handle abbreviations)
   - OR use streaming markdown parser (`@lixpi/markdown-stream-parser`)
   - Extract logical units only when complete (avoid mid-word splits)

2. **Store word boundaries per audio chunk**
   ```typescript
   interface QueuedAudio {
     audioBuffer: AudioBuffer
     wordBoundaries: WordBoundary[]
     unitIndex: number  // which sentence/paragraph
   }
   ```

3. **Track current word during playback**
   - Use `requestAnimationFrame` loop while playing
   - Calculate elapsed time relative to current chunk start
   - Find word where `offsetMs <= elapsed < offsetMs + durationMs`

4. **New exports:**
   ```typescript
   interface UseTTSReturn {
     // ... existing
     currentWord: { unitIndex: number; wordIndex: number } | null
     wordBoundaries: Map<number, WordBoundary[]>  // unitIndex -> boundaries
   }
   ```

**Word tracking logic:**
```typescript
// Inside AudioQueue or useTTS
private trackCurrentWord(): void {
  if (!this.isPlaying || !this.currentBoundaries) return

  const elapsed = (this.audioContext.currentTime - this.chunkStartTime) * 1000

  for (let i = 0; i < this.currentBoundaries.length; i++) {
    const wb = this.currentBoundaries[i]
    if (elapsed >= wb.offsetMs && elapsed < wb.offsetMs + wb.durationMs) {
      this.onWordChange?.(this.currentUnitIndex, i)
      break
    }
  }

  this.rafId = requestAnimationFrame(() => this.trackCurrentWord())
}
```

### Phase 4: SpeakableMessage - Word-Level Highlighting

**File:** `advisor-team-mvp/components/SpeakableMessage.tsx`

**Major Changes:**

1. **Render units (sentences/paragraphs) with word spans**
   ```tsx
   {units.map((unit, unitIndex) => (
     <span key={unitIndex} className="unit" data-unit-index={unitIndex}>
       {unit.words.map((word, wordIndex) => (
         <span
           key={wordIndex}
           className={getWordClass(unitIndex, wordIndex)}
           data-word-index={wordIndex}
         >
           {word}{' '}
         </span>
       ))}
     </span>
   ))}
   ```

2. **Highlight current word**
   ```typescript
   const getWordClass = (unitIndex: number, wordIndex: number) => {
     if (currentWord?.unitIndex === unitIndex && currentWord?.wordIndex === wordIndex) {
       return 'word-speaking'
     }
     return 'word'
   }
   ```

3. **CSS:**
   ```css
   .word-speaking {
     background-color: #fef08a; /* yellow-200 */
     border-radius: 2px;
   }
   ```

**Alternative: CSS Custom Highlight API** (Chrome/Edge only)
```typescript
// More performant for frequent updates
const highlight = new Highlight()
CSS.highlights.set('spoken-word', highlight)

// Update highlight range
const range = document.createRange()
range.selectNodeContents(wordElement)
highlight.clear()
highlight.add(range)
```

---

## Implementation Order

### MVP (Word-Level Sync)
1. **Phase 1**: TTS server returns word boundaries
2. **Phase 2**: Frontend API passes metadata
3. **Phase 3**: useTTS tracks current word position
4. **Phase 4**: SpeakableMessage highlights current word

### Enhancement (Streaming Markdown)
5. Add `@lixpi/markdown-stream-parser` dependency
6. Replace LineTracker with proper markdown-aware unit extraction
7. Handle code blocks, lists, headers as single TTS units

---

## Files to Modify

| File | Changes |
|------|---------|
| `Voice-Type/tts_edge_server.py` | Add word boundary capture, new endpoint |
| `advisor-team-mvp/app/api/tts/route.ts` | Handle JSON response with audio + metadata |
| `advisor-team-mvp/hooks/useTTS.ts` | Replace LineTracker, add word tracking, new exports |
| `advisor-team-mvp/components/SpeakableMessage.tsx` | Word-level rendering and highlighting |
| `advisor-team-mvp/package.json` | Add `@lixpi/markdown-stream-parser` (optional) |

---

## API Contract

### TTS Server (New Endpoint)

**Request:** `POST /synthesize/with-boundaries`
```json
{
  "text": "Hello world, this is a test.",
  "voice": "en-US-GuyNeural"
}
```

**Response:**
```json
{
  "audio": "SUQzBAAAAAAAI1RTU0UAAAAP...",
  "wordBoundaries": [
    {"text": "Hello", "offsetMs": 0, "durationMs": 487},
    {"text": "world", "offsetMs": 525, "durationMs": 412},
    {"text": "this", "offsetMs": 1050, "durationMs": 200},
    {"text": "is", "offsetMs": 1275, "durationMs": 150},
    {"text": "a", "offsetMs": 1450, "durationMs": 100},
    {"text": "test", "offsetMs": 1575, "durationMs": 425}
  ],
  "totalDurationMs": 2000
}
```

### Frontend API (Updated)

**Request:** `POST /api/tts`
```json
{
  "text": "Hello world",
  "advisorId": "zen",
  "withBoundaries": true
}
```

**Response (when withBoundaries=true):**
```json
{
  "audio": "SUQzBAAAAAAAI1RTU0UAAAAP...",
  "wordBoundaries": [...],
  "totalDurationMs": 2000
}
```

**Response (when withBoundaries=false or omitted):**
Binary MP3 (backwards compatible)

---

## Edge Cases

1. **Punctuation**: Edge TTS may not emit boundaries for punctuation marks - handle gracefully
2. **Numbers**: "123" may be spoken as "one hundred twenty three" - boundaries will reflect spoken words
3. **Abbreviations**: "Dr." spoken as "Doctor" - boundary text reflects speech
4. **Code blocks**: Strip from TTS but render visually - don't try to highlight
5. **Markdown formatting**: `**bold**` → TTS gets "bold", highlighting needs to map back
6. **Streaming race condition**: Word boundaries arrive before text renders - queue highlighting

---

## Success Criteria

- [ ] Individual words highlight as they're spoken (not chunks)
- [ ] No mid-word highlighting artifacts
- [ ] Smooth visual transitions between words
- [ ] Works with streaming AI responses
- [ ] Handles markdown formatting gracefully
- [ ] Performance: <16ms per frame for highlight updates
- [ ] Backwards compatible: existing non-highlighting usage still works

---

## Dependencies

**Required:**
- None (uses existing edge_tts capability)

**Optional (for streaming markdown):**
- `@lixpi/markdown-stream-parser` - handles incomplete markdown during streaming

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Edge TTS boundary timing inaccurate | Test extensively; add small offset buffer if needed |
| Performance with many words | Use CSS Custom Highlight API instead of DOM manipulation |
| Markdown-to-plain-text mapping fails | Fall back to unit-level highlighting |
| Browser compatibility (Highlight API) | Provide span-based fallback for Firefox/Safari |

---

## References

- Grok analysis: `Docs/Grok-Highlights-Reply.txt`
- Handoff doc: `Context/2026-01-28/tts-highlighting-handoff.md`
- edge-tts docs: https://github.com/rany2/edge-tts
- CSS Custom Highlight API: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API
