# Chat Search: Function Calling Implementation Guide

**Created:** 2026-01-28
**Purpose:** Replace fragile regex patterns with LLM-based intent detection
**Priority:** IMMEDIATE - regex has caused 8+ hours of debugging in 2 days

---

## The Problem

Current implementation uses regex patterns to detect chat search intent:
```javascript
const CHAT_HISTORY_PATTERNS = [
  /find (?:the |a |my )?chats? (?:about|where|when|with|regarding|on)/i,
  /(?:search|research) (?:our |my |the )?(?:chats?|conversations?|discussions?|history)/i,
  // ... more patterns that keep breaking
]
```

This breaks every time a user phrases their request differently:
- "chat" vs "chats" (broke it)
- "search" vs "research" (broke it)
- Any new phrasing will break it again

---

## The Solution: Function Calling

Give the AI a tool it can invoke when it detects the user wants to search chat history. The AI understands natural language - let it decide.

### Step 1: Define the Tool

In `app/api/chat/stream/route.ts`, add tool definition:

```javascript
const CHAT_SEARCH_TOOL = {
  type: "function",
  function: {
    name: "search_chat_history",
    description: "Search the user's past chat conversations for relevant content. Use this when the user asks about previous discussions, wants to find something they talked about before, or references past conversations.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search terms to look for in past conversations. Extract the key topic/subject from the user's request."
        }
      },
      required: ["query"]
    }
  }
}
```

### Step 2: Include Tool in API Request

When calling OpenRouter/DeepSeek, include the tool:

```javascript
const requestBody = {
  model: aiConfig.model,
  messages: openAIMessages,
  tools: [CHAT_SEARCH_TOOL],
  tool_choice: "auto",  // Let AI decide when to use it
  // ... rest of config
}
```

### Step 3: Handle Tool Calls in Response

The AI response will include a `tool_calls` array when it wants to search:

```javascript
const data = await response.json()
const message = data.choices[0].message

if (message.tool_calls && message.tool_calls.length > 0) {
  for (const toolCall of message.tool_calls) {
    if (toolCall.function.name === "search_chat_history") {
      const args = JSON.parse(toolCall.function.arguments)
      const searchQuery = args.query

      // Execute the search (existing RPC function)
      const { data: results } = await supabase.rpc('search_chat_messages', {
        p_user_id: userId,
        p_search_terms: searchQuery,
        p_limit: 50
      })

      // Format results and send back to AI
      const searchResults = formatSearchResults(results)

      // Continue conversation with search results injected
      // ... (see Step 4)
    }
  }
}
```

### Step 4: Continue Conversation with Results

After executing the tool, send the results back to the AI to formulate a response:

```javascript
// Add tool result to messages
const messagesWithToolResult = [
  ...openAIMessages,
  message,  // AI's message with tool_call
  {
    role: "tool",
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      found: results.length,
      matches: results.slice(0, 5).map(r => ({
        chat_number: r.chat_number,
        title: r.title,
        preview: r.content.substring(0, 200),
        similarity: r.similarity
      }))
    })
  }
]

// Make second API call for AI to respond with results
const followUpResponse = await fetch(providerConfig.endpoint, {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    model: aiConfig.model,
    messages: messagesWithToolResult,
    stream: true  // Can stream the final response
  })
})
```

### Step 5: Remove Regex Patterns

Once function calling works, DELETE:
- `CHAT_HISTORY_PATTERNS` constant
- `isChatHistoryRequest()` function
- `extractChatSearchTerms()` function
- All the auto-routing logic at lines 570-580

The AI handles ALL of this naturally.

---

## Files to Modify

1. **`app/api/chat/stream/route.ts`**
   - Add `CHAT_SEARCH_TOOL` definition
   - Modify API call to include `tools` parameter
   - Add tool call handling logic
   - Remove regex patterns and detection functions

2. **`lib/ai-providers.ts`** (maybe)
   - May need to update `convertToOpenAIFormat` to handle tools
   - Check if OpenRouter tool format matches OpenAI format

---

## Testing

After implementation, these should ALL work without any regex:
- "research my chat history for X"
- "find where we talked about X"
- "remember that conversation about X?"
- "what did we decide about X?"
- "look through my old chats for X"
- "that thing we discussed last week about X"
- "where's the chat about X"
- Any natural phrasing the user invents

---

## OpenRouter Tool Calling Reference

OpenRouter supports OpenAI-compatible tool calling. Docs:
https://openrouter.ai/docs#tool-calling

Most models support it, including DeepSeek. Check model capabilities if issues arise.

---

## Rollback Plan

If function calling doesn't work with current model:
1. Keep regex patterns as fallback
2. Try different model that supports tools
3. Consider using Anthropic Claude API directly (excellent tool support)

---

## Why This Is Better

| Aspect | Regex Approach | Function Calling |
|--------|---------------|------------------|
| New phrasings | Breaks, needs code change | Just works |
| Maintenance | Infinite patterns needed | Zero maintenance |
| User experience | "Magic words" required | Natural language |
| Debug time | 8+ hours in 2 days | One-time setup |
| Extraction | Separate regex needed | AI extracts naturally |

---

## Implementation Time Estimate

- Define tool: 10 minutes
- Add to API call: 15 minutes
- Handle tool response: 30 minutes
- Test & debug: 30 minutes
- Remove old regex code: 15 minutes

**Total: ~2 hours** vs infinite hours adding patterns

---

*This document created after 2 days of regex failures. Do not add more patterns. Implement this instead.*
