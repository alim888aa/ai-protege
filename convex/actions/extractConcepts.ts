"use node";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";
import { z } from "zod";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

const conceptSchema = z.object({
  concepts: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .min(3)
    .max(5),
});

type Concept = {
  id: string;
  title: string;
  description: string;
};

export const extractConcepts = action({
  args: {
    topic: v.string(),
    sourceText: v.string(),
  },
  handler: async (ctx, args): Promise<Concept[]> => {
    await ctx.runQuery(internal.billing.requireEntitledUser, {});

    const prompt = `You are helping a student learn about: ${args.topic}

Here is the source material:
${args.sourceText}

Extract 3-5 key concepts that a student should understand about this topic.
For each concept, provide a clear 2-5 word title and a brief 1-2 sentence description.
The concepts should be teachable independently and cover the main ideas.`;

    const result = await generateObject({
      model: openai("gpt-4.1-mini"),
      messages: [{ role: "user", content: prompt }],
      schema: conceptSchema,
    });

    const idBase = Date.now();
    return result.object.concepts.map((concept, index) => ({
      id: `concept-${idBase}-${index}`,
      title: concept.title,
      description: concept.description,
    }));
  },
});
