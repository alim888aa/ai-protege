"use node";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";
import { z } from "zod";
import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";

const summarySchema = z.object({
  summary: z.string(),
  keyConceptsCovered: z.array(z.string()),
  analogiesUsed: z.array(z.string()),
});

type SummaryResponse = z.infer<typeof summarySchema>;

export const generateSummary = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<SummaryResponse> => {
    await ctx.runQuery(internal.billing.requireEntitledUser, {});
    const session = await ctx.runQuery(api.mutations.getSession, {
      sessionId: args.sessionId,
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.summary) {
      return {
        summary: session.summary.text,
        keyConceptsCovered: session.summary.keyConceptsCovered,
        analogiesUsed: session.summary.analogiesUsed,
      };
    }

    const formattedDialogues = session.concepts
      .map((concept, index) => {
        const dialogue = session.dialogues.find(
          (candidate) => candidate.conceptId === concept.id
        );
        const explanation = session.explanations?.find(
          (candidate) => candidate.conceptId === concept.id
        );
        const explanationText = explanation?.textExplanation
          ? `Teacher's written explanation:\n${explanation.textExplanation}\n\n`
          : "";
        const dialogueText = dialogue?.messages.length
          ? dialogue.messages
              .map(
                (message) =>
                  `${message.role === "user" ? "Teacher" : "AI Student"}: ${message.content}`
              )
              .join("\n")
          : "No dialogue recorded for this concept.";

        return `## Concept ${index + 1}: ${concept.title}
Description: ${concept.description}

${explanationText}${dialogueText}`;
      })
      .join("\n\n---\n\n");

    const prompt = `You are a 12-year-old student who just learned about: ${session.topic}

Here's what your teacher taught you across ${session.concepts.length} concepts:

${formattedDialogues}

Summarize what you learned in your own words. Start with: "I think I understand ${session.topic} now! Let me explain it back to you:" Cover the main ideas, connect the concepts, and mention useful analogies or examples. Use simple, enthusiastic language and demonstrate understanding.`;

    const result = await generateObject({
      model: openai("gpt-4.1-mini"),
      messages: [{ role: "user", content: prompt }],
      schema: summarySchema,
    });

    await ctx.runMutation(api.mutations.saveSummary, {
      sessionId: args.sessionId,
      summary: {
        text: result.object.summary,
        keyConceptsCovered: result.object.keyConceptsCovered,
        analogiesUsed: result.object.analogiesUsed,
      },
    });

    return result.object;
  },
});
