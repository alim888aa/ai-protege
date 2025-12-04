# Design Document - Convex Agent Streaming

## Overview

Migrate the AI student chat from Vercel API routes to Convex actions with delta streaming. This consolidates RAG retrieval and AI generation in one environment, reducing latency and ensuring questions are grounded in source material. The AI will consider both clarity and accuracy in a unified prompt.

## Architecture

### Current Flow (Vercel)
```
Client → useDialogueHandlers → fetch('/api/chat') → Vercel API → OpenAI → HTTP stream
                                                  ↓
                              (RAG chunks hardcoded as [])
```

### New Flow (Convex)
```
Client → useAction(streamChat) → Convex Action → RAG retrieval (internal)
                                              → OpenAI streamText
                                              → DeltaStreamer saves to DB
                                              ↓
Client ← useQuery(syncStreams) ← Convex reactive subscription
```

## Dependencies

```json
{
  "@convex-dev/agent": "^0.x.x"
}
```

## Schema Changes

No schema changes required. Existing `sessions.dialogues` structure is preserved. Stream deltas are managed by the Agent component's internal tables.

## New Convex Action

### `convex/actions/streamChat.ts`

```typescript
"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { DeltaStreamer } from "@convex-dev/agent";
import { api, components } from "../_generated/api";

export const streamChat = action({
  args: {
    sessionId: v.string(),
    conceptId: v.string(),
    userMessage: v.string(),
    canvasImage: v.optional(v.string()),
    dialogueHistory: v.array(v.object({
      role: v.string(),
      content: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // 1. Check if session has source material
    const sourceMaterial = await ctx.runQuery(
      api.mutations.getSourceMaterialBySession,
      { sessionId: args.sessionId }
    );
    
    const hasSource = sourceMaterial && sourceMaterial.chunks.length > 0;
    
    // 2. If source exists, retrieve relevant chunks
    let ragChunks: Array<{ text: string; similarity: number }> = [];
    if (hasSource) {
      ragChunks = await ctx.runAction(
        api.actions.retrieveRelevantChunks.retrieveRelevantChunks,
        { sessionId: args.sessionId, textExplanation: args.userMessage }
      );
    }
    
    // 3. Get concept info
    const session = await ctx.runQuery(api.mutations.getSession, {
      sessionId: args.sessionId,
    });
    const concept = session?.concepts.find(c => c.id === args.conceptId);
    
    // 4. Build unified system prompt
    const systemPrompt = buildSystemPrompt(concept, ragChunks, hasSource);
    
    // 5. Setup delta streamer
    const streamer = new DeltaStreamer(
      components.agent,
      ctx,
      { throttleMs: 100 },
      { threadId: `${args.sessionId}-${args.conceptId}`, format: "text", order: Date.now() }
    );
    
    // 6. Stream AI response
    const response = streamText({
      model: openai("gpt-4.1-mini"),
      system: systemPrompt,
      messages: [
        ...args.dialogueHistory.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: args.userMessage },
      ],
      temperature: 0.8,
    });
    
    void streamer.consumeStream(response.toTextStream());
    
    return { streamId: await streamer.getStreamId() };
  },
});

function buildSystemPrompt(
  concept: { title: string; description: string } | undefined,
  ragChunks: Array<{ text: string; similarity: number }>,
  hasSource: boolean
): string {
  const conceptInfo = concept 
    ? `You are learning about: ${concept.title}\n\nConcept: ${concept.description}`
    : "You are learning from the teacher.";
  
  const sourceSection = hasSource && ragChunks.length > 0
    ? `\nSOURCE MATERIAL (use this to verify accuracy):\n${ragChunks.map((c, i) => `[${i + 1}] ${c.text}`).join("\n\n")}`
    : "";
  
  return `You are a curious 12-year-old student. ${conceptInfo}
${sourceSection}

Your role:
- You have no prior knowledge of this topic
- Ask questions about BOTH clarity AND accuracy naturally
- If something is unclear, ask for simplification
- If something seems different from the source material, ask about it
- Keep questions focused on the current concept
- Ask ONE question at a time
- Be encouraging when explanations are good
- Use simple, natural language and maintain short responses

${hasSource ? "You can reference the source material when asking about accuracy." : "Focus on clarity since there's no source material to verify against."}`;
}
```

## New Convex Query

### `convex/queries/streams.ts`

```typescript
import { query } from "../_generated/server";
import { v } from "convex/values";
import { vStreamArgs, syncStreams } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const listStreams = query({
  args: {
    threadId: v.string(),
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    return await syncStreams(ctx, components.agent, {
      ...args,
      includeStatuses: ["streaming", "finished"],
    });
  },
});
```

## Client Changes

### `useDialogueHandlers.ts` Updates

```typescript
// Add imports
import { useAction } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";

// In the hook:
const streamChat = useAction(api.actions.streamChat.streamChat);

const handleSubmit = useCallback(async () => {
  // ... existing validation ...
  
  // Check if session has source material
  const hasSource = /* check from session data */;
  
  if (hasSource) {
    // Use Convex streaming
    const { streamId } = await streamChat({
      sessionId,
      conceptId: currentConcept.id,
      userMessage: userContent,
      canvasImage,
      dialogueHistory: dialogueMessages.map(m => ({ role: m.role, content: m.content })),
    });
    // Stream updates come via useQuery subscription
  } else {
    // Fallback to existing Vercel clarity function
    const response = await fetch('/api/chat', { /* existing logic */ });
  }
}, [/* deps */]);
```

### `MessagePanel.tsx` Updates

Add subscription to stream deltas:

```typescript
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";

// In component:
const streams = useQuery(api.queries.streams.listStreams, {
  threadId: `${sessionId}-${conceptId}`,
  streamArgs: { /* cursor state */ },
});

// Render streaming content from streams.streams
```

## Fallback Logic

When `sourceType === "none"` or `chunks.length === 0`:
1. Skip Convex streaming action
2. Use existing `/api/chat` route (which calls `generateClarityQuestions`)
3. No changes to existing Vercel code needed

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `@convex-dev/agent` |
| `convex/actions/streamChat.ts` | New - unified chat action |
| `convex/queries/streams.ts` | New - stream subscription query |
| `useDialogueHandlers.ts` | Add Convex action, conditional logic |
| `MessagePanel.tsx` | Subscribe to stream deltas |
| `useTeachingReducer.ts` | Simplify streaming state (optional) |

## Files to Delete (Later)

- `src/app/api/chat/route.ts` - Keep for fallback initially, remove after validation
- `src/app/actions/generateAccuracyQuestions.ts` - Merged into Convex action

## Error Handling

1. **Convex action failure**: Fall back to Vercel route
2. **Stream interruption**: Convex handles reconnection automatically
3. **No source material**: Graceful fallback to clarity-only mode

## Performance Expectations

| Metric | Current (Vercel) | New (Convex) |
|--------|------------------|--------------|
| Time to first token | ~600-900ms | ~400-600ms |
| RAG retrieval | N/A (not called) | ~100-150ms (internal) |
| Network round-trips | 2 (Vercel→Convex→Vercel) | 1 (Client→Convex) |
