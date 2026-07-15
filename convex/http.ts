import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { api, internal } from "./_generated/api";
import { landingDemoChat, landingDemoPreflight } from "./landingDemo";
import { polarWebhook } from "./billingWebhooks";
import {
  buildHintSystemPrompt,
  buildMessages,
  buildUnifiedSystemPrompt,
} from "./teachingPrompts";

const http = httpRouter();

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

http.route({
  path: "/landing-demo-chat",
  method: "OPTIONS",
  handler: landingDemoPreflight,
});

http.route({
  path: "/polar/webhook",
  method: "POST",
  handler: polarWebhook,
});

http.route({
  path: "/landing-demo-chat",
  method: "POST",
  handler: landingDemoChat,
});

// Chat streaming endpoint
http.route({
  path: "/chat-stream",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      await ctx.runQuery(internal.billing.requireEntitledUser, {});
    } catch {
      return new Response(JSON.stringify({ error: "Subscription required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

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
    try {
      await ctx.runQuery(internal.billing.requireEntitledUser, {});
    } catch {
      return new Response(JSON.stringify({ error: "Subscription required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

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
