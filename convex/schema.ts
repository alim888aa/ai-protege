import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sourceMaterial: defineTable({
    sessionId: v.string(),
    topic: v.string(),
    sourceUrl: v.string(),
    chunks: v.array(v.object({
      text: v.string(),
      embedding: v.array(v.float64()),
      index: v.number(),
    })),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});
