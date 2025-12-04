import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Maps session-concept pairs to Agent component thread IDs
  // This allows us to use proper Agent threads for streaming
  threadMappings: defineTable({
    sessionId: v.string(),
    conceptId: v.string(),
    threadId: v.string(), // Agent component thread ID
    threadType: v.union(v.literal("chat"), v.literal("hint")),
    createdAt: v.number(),
  })
    .index("by_session_concept_type", ["sessionId", "conceptId", "threadType"])
    .index("by_thread", ["threadId"]),

  sourceMaterial: defineTable({
    userId: v.optional(v.string()), // Clerk user ID - optional for backwards compatibility
    sessionId: v.string(),
    topic: v.string(),
    // Optional for backwards compatibility with existing data
    sourceType: v.optional(v.union(v.literal("url"), v.literal("pdf"), v.literal("none"))),
    sourceUrl: v.optional(v.string()),
    chunks: v.array(v.object({
      text: v.string(),
      embedding: v.array(v.float64()),
      index: v.number(),
    })),
    jargonWords: v.array(v.string()),
    concepts: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
    }))),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  sessions: defineTable({
    userId: v.optional(v.string()), // Clerk user ID - optional for backwards compatibility
    sessionId: v.string(),
    topic: v.string(),
    // Denormalized from sourceMaterial for efficient dashboard queries
    sourceType: v.optional(v.union(v.literal("url"), v.literal("pdf"), v.literal("none"))),
    sourceUrl: v.optional(v.string()),
    concepts: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
    })),
    currentConceptIndex: v.number(),
    dialogues: v.array(v.object({
      conceptId: v.string(),
      messages: v.array(v.object({
        role: v.string(),
        content: v.string(),
        timestamp: v.number(),
        type: v.optional(v.string()),
      })),
    })),
    explanations: v.optional(v.array(v.object({
      conceptId: v.string(),
      textExplanation: v.string(),
      canvasData: v.optional(v.string()), // Store canvas snapshot as base64 or JSON
    }))),
    summary: v.optional(v.object({
      text: v.string(),
      keyConceptsCovered: v.array(v.string()),
      analogiesUsed: v.array(v.string()),
    })),
    completed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user", ["userId"]),
});
