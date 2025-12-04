import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { api } from "./_generated/api";

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
    const { sessionId, conceptId, userMessage, canvasImage, dialogueHistory } = body as {
      sessionId: string;
      conceptId: string;
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

    // 6. Stream the response using AI SDK and return as streaming response
    const response = streamText({
      model: openai("gpt-4.1-nano"),
      system: systemPrompt,
      messages,
      temperature: 0.8,
    });

    // Return the text stream directly as HTTP response
    return response.toTextStreamResponse({
      headers: corsHeaders,
    });
  }),
});


// Hint streaming endpoint
http.route({
  path: "/hint-stream",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { sessionId, conceptId, hintCount, userExplanation, dialogueHistory } = body as {
      sessionId: string;
      conceptId: string;
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

    // 5. Stream the response using AI SDK and return as streaming response
    const response = streamText({
      model: openai("gpt-4.1-mini"),
      system: systemPrompt,
      messages: [{ role: "user", content: "Please provide a hint to help me." }],
      temperature: 0.7,
    });

    // Return the text stream directly as HTTP response
    return response.toTextStreamResponse({
      headers: corsHeaders,
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

  const topicEnforcement = `TOPIC ENFORCEMENT (CRITICAL):
- You are ONLY here to learn about: "${concept.title}"
- If the teacher explains something NOT in the source material or unrelated to "${concept.title}", redirect them:
  - "That's interesting, but I thought you were going to teach me about ${concept.title}. Can we get back to that?"
  - "Hmm, I don't remember reading about that in my notes. Is that really part of ${concept.title}?"
  - "Wait, weren't we talking about ${concept.title}? I still have questions about that!"
- Be friendly but firm about staying on topic
- Do NOT engage with off-topic content - always redirect back`;

  const simplificationRequests = `SIMPLIFICATION REQUESTS (CRITICAL - you are 12 years old!):
- If the teacher uses technical jargon, big words, or complex terms, ALWAYS ask them to explain simpler:
  - "Whoa, what does [complex term] mean? Can you explain it like I'm 12?"
  - "I don't know what [jargon] means. Can you use simpler words?"
  - "That sounds really complicated. Can you break it down for me?"
- If the explanation is too abstract, ask for a real-world example
- Don't pretend to understand - if confused, say so!`;

  const accuracyGuidelines = hasSource
    ? `SOURCE MATERIAL CHECKING (IMPORTANT):
- If the teacher mentions something NOT in the source material, ask about it:
  - "Hmm, I don't remember reading about [concept] in my notes. Are you sure that's part of ${concept.title}?"
  - "Wait, where did you learn about [term]? I didn't see that in what I was supposed to study."
- If something contradicts the source material, politely point it out
- Naturally blend clarity and accuracy concerns`
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
- Be encouraging when explanations are good
- Use simple, natural language like a real 12-year-old
- Ask ONE question at a time - don't overwhelm the teacher
- Keep responses conversational and SHORT

${topicEnforcement}

${simplificationRequests}
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
  
  const hintPhilosophy = `HINT PHILOSOPHY (CRITICAL):
- NEVER answer the AI student's question directly
- Guide the teacher to discover the answer themselves
- Be introspective: help them reflect on what they already know
- Suggest visualization ideas when appropriate
- Keep hints to MAXIMUM 4 sentences - be concise`;

  const baseContext = `You are a Socratic teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

${hasSource && formattedChunks ? `RELEVANT SOURCE MATERIAL:\n${formattedChunks}\n\n` : ''}USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueText}
${lastAIContext}

${hintPhilosophy}`;

  if (!hasSource) {
    if (hintCount === 1) {
      return `${baseContext}

Provide a gentle, guiding hint that:
1. Points them in the right direction WITHOUT answering
2. Asks them to reflect: "What do you already know about...?"
3. Suggests a visualization: "You could draw a diagram showing..."

Start with "${hintPrefix}" - maximum 4 sentences, be Socratic.`;
    } else if (hintCount === 2) {
      return `${baseContext}

Provide a more specific guiding hint that:
1. Points to a specific aspect they should think about
2. Suggests how they might visualize or diagram it
3. Helps them connect what they know to what's being asked

Start with "${hintPrefix}" - maximum 4 sentences, be Socratic.`;
    } else {
      return `${baseContext}

This is the final hint. Provide stronger guidance that:
1. Identifies the key gap in their explanation
2. Suggests specific aspects to cover (but don't explain them)
3. Offers a concrete visualization suggestion

Start with "${hintPrefix}" - maximum 4 sentences, still don't give the answer.`;
    }
  } else {
    if (hintCount === 1) {
      return `${baseContext}

Provide a gentle, guiding hint that:
1. Points them toward a relevant section of the source material (e.g., "The source mentions something about...")
2. Suggests a way to visualize the concept
3. Does NOT give the answer - just points the direction

Start with "${hintPrefix}" - maximum 4 sentences, be Socratic.`;
    } else if (hintCount === 2) {
      return `${baseContext}

Provide a more specific guiding hint that:
1. References a specific part of the source material they should review
2. Suggests how they might draw or diagram the concept
3. Helps them connect source material to the AI's question

Start with "${hintPrefix}" - maximum 4 sentences, be Socratic.`;
    } else {
      return `${baseContext}

This is the final hint. Provide stronger guidance that:
1. Identifies the specific gap between their explanation and the source
2. Points to the exact topic in the source they need to address
3. Suggests a concrete way to visualize or explain it

Start with "${hintPrefix}" - maximum 4 sentences, still don't give the full answer.`;
    }
  }
}
