import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Creates a new source material entry in the database
 */
export const createSourceMaterial = mutation({
  args: {
    sessionId: v.string(),
    topic: v.string(),
    sourceUrl: v.string(),
    chunks: v.array(
      v.object({
        text: v.string(),
        embedding: v.array(v.float64()),
        index: v.number(),
      })
    ),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sourceMaterial", {
      sessionId: args.sessionId,
      topic: args.topic,
      sourceUrl: args.sourceUrl,
      chunks: args.chunks,
      createdAt: args.createdAt,
    });
  },
});

/**
 * Retrieves source material by sessionId
 */
export const getSourceMaterialBySession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const sourceMaterial = await ctx.db
      .query("sourceMaterial")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    return sourceMaterial;
  },
});
