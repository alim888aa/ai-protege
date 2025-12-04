import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { api, components } from "./_generated/api";
import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming";

const streaming = new PersistentTextStreaming(components.persistentTextStreaming);

const http = httpRouter();

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// CORS preflight handler
const corsPreflightHandler = httpAction(async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
});

// Chat streaming CORS preflight
http.route({
  path: "/chat-stream",
  method: "OPTIONS",
  handler: corsPreflightHandler,
});

// Hint streaming CORS preflight
http.route({
  path: "/hint-stream",
  method: "OPTIONS",
  handler: corsPreflightHandler,
});

// Chat streaming endpoint
http.route({
  path: "/chat-stream",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { sessionId, conceptId, streamId, userMessage, canvasImage, dialogueHistory } = body as {
      sessionId: string;
      conceptId: string;
      streamId: string;
      userMessage: string;
      canvasImage?: string;
      dialogueHistory: Array<{ role: string; content: string }>;
    };

    // 1. Check if session has source material
    const sourceMaterial = await ctx.runQuery(
      api.mutations.getSourceMaterialBySession,
      { sessionId }
    );

    const hasSource = !!(sourceMaterial && sourceMaterial.chunks && sourceMaterial.chunks.length > 0);

    // 2. If source exists AND user has written something, retrieve relevant chunks via RAG
    let ragChunks: Array<{ text: string; similarity: number; index: number }> = [];
    if (hasSource && userMessage.trim()) {
      try {
        ragChunks = await ctx.runAction(
          api.actions.retrieveRelevantChunks.retrieveRelevantChunks,
          { sessionId, textExplanation: userMessage }
        );
        console.log(`[streamChat] Retrieved ${ragChunks.length} RAG chunks for session ${sessionId}`);
      } catch (error) {
        console.error("[streamChat] Error retrieving RAG chunks:", error);
      }
    }

    // 3. Get session and concept info
    const session = await ctx.runQuery(api.mutations.getSession, { sessionId });
    const concept = session?.concepts.find((c) => c.id === conceptId);

    if (!concept) {
      return new Response(JSON.stringify({ error: `Concept ${conceptId} not found` }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 4. Build unified system prompt (clarity + accuracy)
    const systemPrompt = buildUnifiedSystemPrompt(concept, ragChunks, hasSource, dialogueHistory.length === 0);

    // 5. Build messages array with multimodal support
    const messages = buildMessages(dialogueHistory, userMessage, canvasImage);

    // 6. Stream to client and save deltas to database
    const streamResponse = await streaming.stream(ctx, request, streamId as import("@convex-dev/persistent-text-streaming").StreamId, async (_ctx, _req, _id, append) => {
      // Stream the response using AI SDK
      const response = streamText({
        model: openai("gpt-4.1-nano"),
        system: systemPrompt,
        messages,
        temperature: 0.8,
      });

      // Iterate over the text stream and append each chunk
      for await (const chunk of response.textStream) {
        await append(chunk);
      }
    });

    // Add CORS headers to the streaming response
    const newHeaders = new Headers(streamResponse.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(streamResponse.body, {
      status: streamResponse.status,
      statusText: streamResponse.statusText,
      headers: newHeaders,
    });
  }),
});


// Hint streaming endpoint
http.route({
  path: "/hint-stream",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { sessionId, conceptId, streamId, hintCount, userExplanation, dialogueHistory } = body as {
      sessionId: string;
      conceptId: string;
      streamId: string;
      hintCount: number;
      userExplanation: string;
      dialogueHistory: Array<{ role: string; content: string }>;
    };

    // 1. Check if session has source material
    const sourceMaterial = await ctx.runQuery(
      api.mutations.getSourceMaterialBySession,
      { sessionId }
    );

    const hasSource = !!(sourceMaterial && sourceMaterial.chunks && sourceMaterial.chunks.length > 0);

    // 2. If source exists AND user has written something, retrieve relevant chunks via RAG
    let ragChunks: Array<{ text: string; similarity: number; index: number }> = [];
    if (hasSource && userExplanation.trim()) {
      try {
        ragChunks = await ctx.runAction(
          api.actions.retrieveRelevantChunks.retrieveRelevantChunks,
          { sessionId, textExplanation: userExplanation }
        );
        console.log(`[streamHint] Retrieved ${ragChunks.length} RAG chunks for session ${sessionId}`);
      } catch (error) {
        console.error("[streamHint] Error retrieving RAG chunks:", error);
      }
    }

    // 3. Get session and concept info
    const session = await ctx.runQuery(api.mutations.getSession, { sessionId });
    const concept = session?.concepts.find((c) => c.id === conceptId);

    if (!concept) {
      return new Response(JSON.stringify({ error: `Concept ${conceptId} not found` }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 4. Build hint system prompt
    const systemPrompt = buildHintSystemPrompt(concept, ragChunks, hasSource, hintCount, userExplanation, dialogueHistory);

    // 5. Stream to client and save deltas to database
    const streamResponse = await streaming.stream(ctx, request, streamId as import("@convex-dev/persistent-text-streaming").StreamId, async (_ctx, _req, _id, append) => {
      // Stream the response using AI SDK
      const response = streamText({
        model: openai("gpt-4.1-mini"),
        system: systemPrompt,
        messages: [{ role: "user", content: "Please provide a hint to help me." }],
        temperature: 0.7,
      });

      // Iterate over the text stream and append each chunk
      for await (const chunk of response.textStream) {
        await append(chunk);
      }
    });

    // Add CORS headers to the streaming response
    const newHeaders = new Headers(streamResponse.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(streamResponse.body, {
      status: streamResponse.status,
      statusText: streamResponse.statusText,
      headers: newHeaders,
    });
  }),
});

export default http;


// ============================================
// Helper Functions
// ============================================

/**
 * Builds a unified system prompt that considers both clarity and accuracy.
 */
function buildUnifiedSystemPrompt(
  concept: { title: string; description: string },
  ragChunks: Array<{ text: string; similarity: number; index: number }>,
  hasSource: boolean,
  isFirstMessage: boolean
): string {
  const conceptInfo = `You are learning about: ${concept.title}\n\nConcept description: ${concept.description}`;

  const sourceSection =
    hasSource && ragChunks.length > 0
      ? `\nSOURCE MATERIAL (use this to verify accuracy):\n${ragChunks
          .map((chunk, idx) => `[Source ${idx + 1}]\n${chunk.text}`)
          .join("\n\n")}`
      : "";

  const accuracyGuidelines = hasSource
    ? `- If something seems different from the source material, politely ask about it
- You can reference the source material when asking about accuracy
- Naturally blend clarity and accuracy concerns - don't ask them separately`
    : `- Since there's no source material, focus entirely on CLARITY
- Don't ask about factual accuracy - just help the teacher explain things clearly
- Focus on whether the explanation makes sense and is easy to follow`;

  const firstMessageGuidelines = isFirstMessage
    ? `\nFIRST QUESTION STRATEGY:
- Start by asking about CLARITY first (is the explanation clear and simple?)
- If complex jargon is used, ask for simplification
- If the explanation is abstract, ask for an analogy`
    : "";

  return `You are a curious 12-year-old student. ${conceptInfo}
${sourceSection}

Your role:
- You have no prior knowledge of this topic
- You're genuinely curious and want to understand
- Ask questions about BOTH clarity AND accuracy naturally
- If something is unclear, ask for simplification
- Request examples or analogies when concepts are abstract
- Be encouraging when explanations are good
- Use simple, natural language like a real 12-year-old
- Ask ONE question at a time - don't overwhelm the teacher
- Keep responses conversational and SHORT
${firstMessageGuidelines}

${accuracyGuidelines}

Remember: You're here to help the teacher identify gaps in their understanding by asking thoughtful questions ONE AT A TIME.`;
}

/**
 * Builds the messages array for the AI, including multimodal support for canvas images.
 */
type UserMessage = {
  role: "user";
  content: string | Array<{ type: "text"; text: string } | { type: "image"; image: string }>;
};

type AssistantMessage = {
  role: "assistant";
  content: string;
};

type Message = UserMessage | AssistantMessage;

function buildMessages(
  dialogueHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  canvasImage?: string
): Message[] {
  const messages: Message[] = [];

  for (const msg of dialogueHistory) {
    if (msg.role === "ai" || msg.role === "assistant") {
      messages.push({ role: "assistant", content: msg.content });
    } else {
      messages.push({ role: "user", content: msg.content });
    }
  }

  if (canvasImage && dialogueHistory.length === 0) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userMessage },
        { type: "image", image: canvasImage },
      ],
    });
  } else {
    messages.push({ role: "user", content: userMessage });
  }

  return messages;
}

/**
 * Builds the system prompt for hint generation.
 */
function buildHintSystemPrompt(
  concept: { title: string; description: string },
  ragChunks: Array<{ text: string; similarity: number; index: number }>,
  hasSource: boolean,
  hintCount: number,
  userExplanation: string,
  dialogueHistory: Array<{ role: string; content: string }>
): string {
  const formattedChunks = hasSource && ragChunks.length > 0
    ? ragChunks.map((chunk, idx) => `[Source ${idx + 1}]\n${chunk.text}`).join('\n\n')
    : '';

  const dialogueText = dialogueHistory.length > 0
    ? dialogueHistory
        .map((msg) => `${msg.role === 'user' ? 'Teacher' : 'AI Student'}: ${msg.content}`)
        .join('\n')
    : 'No dialogue yet - the teacher is just starting to explain.';

  const lastAIResponse = dialogueHistory.length > 0
    ? [...dialogueHistory].reverse().find((msg) => msg.role === 'assistant' || msg.role === 'ai')
    : null;
  
  const lastAIContext = lastAIResponse
    ? `\nLAST AI STUDENT RESPONSE:\n"${lastAIResponse.content}"\n\nIMPORTANT: The hint should help the teacher address what the AI student just said or asked above.`
    : '';

  const hintPrefix = `Hint ${hintCount} of 3: `;
  
  const baseContext = `You are a helpful teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

${hasSource && formattedChunks ? `RELEVANT SOURCE MATERIAL:\n${formattedChunks}\n\n` : ''}USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueText}
${lastAIContext}`;

  if (!hasSource) {
    if (hintCount === 1) {
      return `${baseContext}

The teacher seems stuck and needs a gentle hint. Using your general knowledge about "${concept.title}", provide a leading clue that:
1. Doesn't give away the full answer
2. Guides them toward the right direction
3. Uses simple, encouraging language

Start your response with "${hintPrefix}" and then provide the hint. Keep it concise (2-3 sentences).`;
    } else if (hintCount === 2) {
      return `${baseContext}

The teacher has requested a second hint. Provide a more specific clue that points to a specific aspect they should cover.

Start your response with "${hintPrefix}" and then provide the hint. Keep it concise (2-3 sentences).`;
    } else {
      return `${baseContext}

The teacher has requested a third hint. Provide helpful guidance with key aspects they might want to cover.

Start your response with "${hintPrefix}Here are some key aspects you might want to cover: " and then provide specific suggestions.`;
    }
  } else {
    if (hintCount === 1) {
      return `${baseContext}

The teacher seems stuck and needs a gentle hint. Provide a leading clue that guides them toward the right direction.

Start your response with "${hintPrefix}" and then provide the hint. Keep it concise (2-3 sentences).`;
    } else if (hintCount === 2) {
      return `${baseContext}

The teacher has requested a second hint. Provide a more specific clue that references something from the source material.

Start your response with "${hintPrefix}" and then provide the hint. Keep it concise (2-3 sentences).`;
    } else {
      return `${baseContext}

The teacher has requested a third hint. Provide a synthesized summary of what they're missing based on the source material.

Start your response with "${hintPrefix}Based on the source material, here's what you might be missing: " and then provide your explanation.`;
    }
  }
}
