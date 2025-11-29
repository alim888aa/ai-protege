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
    jargonWords: v.array(v.string()),
    concepts: v.optional(v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.string(),
      })
    )),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sourceMaterial", {
      sessionId: args.sessionId,
      topic: args.topic,
      sourceUrl: args.sourceUrl,
      chunks: args.chunks,
      jargonWords: args.jargonWords,
      concepts: args.concepts,
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

/**
 * Updates concepts for a session
 */
export const updateConceptsInSourceMaterial = mutation({
  args: {
    sessionId: v.string(),
    concepts: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const sourceMaterial = await ctx.db
      .query("sourceMaterial")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!sourceMaterial) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(sourceMaterial._id, {
      concepts: args.concepts,
    });
  },
});

// ============================================
// Session Management Mutations & Queries
// ============================================

/**
 * Creates a new session with concepts
 */
export const createSession = mutation({
  args: {
    sessionId: v.string(),
    topic: v.string(),
    concepts: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.insert("sessions", {
      sessionId: args.sessionId,
      topic: args.topic,
      concepts: args.concepts,
      currentConceptIndex: 0,
      dialogues: [],
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
    
    return { sessionId: args.sessionId };
  },
});

/**
 * Updates concepts for a session
 */
export const updateConcepts = mutation({
  args: {
    sessionId: v.string(),
    concepts: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, {
      concepts: args.concepts,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Retrieves session data by sessionId
 */
export const getSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    return session;
  },
});

/**
 * Saves dialogue for a specific concept
 */
export const saveDialogue = mutation({
  args: {
    sessionId: v.string(),
    conceptId: v.string(),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
        timestamp: v.number(),
        type: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    // Find existing dialogue for this concept
    const existingDialogueIndex = session.dialogues.findIndex(
      (d) => d.conceptId === args.conceptId
    );

    let updatedDialogues;
    if (existingDialogueIndex >= 0) {
      // Update existing dialogue
      updatedDialogues = [...session.dialogues];
      updatedDialogues[existingDialogueIndex] = {
        conceptId: args.conceptId,
        messages: args.messages,
      };
    } else {
      // Add new dialogue
      updatedDialogues = [
        ...session.dialogues,
        {
          conceptId: args.conceptId,
          messages: args.messages,
        },
      ];
    }

    await ctx.db.patch(session._id, {
      dialogues: updatedDialogues,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Updates the current concept index (progress tracking)
 */
export const updateProgress = mutation({
  args: {
    sessionId: v.string(),
    conceptIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, {
      currentConceptIndex: args.conceptIndex,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Marks a session as completed
 */
export const markComplete = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, {
      completed: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Saves the user's explanation (text and canvas) for a specific concept
 */
export const saveExplanation = mutation({
  args: {
    sessionId: v.string(),
    conceptId: v.string(),
    textExplanation: v.string(),
    canvasData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    // Find existing explanation for this concept
    const explanations = session.explanations || [];
    const existingIndex = explanations.findIndex(
      (e) => e.conceptId === args.conceptId
    );

    let updatedExplanations;
    if (existingIndex >= 0) {
      // Update existing explanation
      updatedExplanations = [...explanations];
      updatedExplanations[existingIndex] = {
        conceptId: args.conceptId,
        textExplanation: args.textExplanation,
        canvasData: args.canvasData,
      };
    } else {
      // Add new explanation
      updatedExplanations = [
        ...explanations,
        {
          conceptId: args.conceptId,
          textExplanation: args.textExplanation,
          canvasData: args.canvasData,
        },
      ];
    }

    await ctx.db.patch(session._id, {
      explanations: updatedExplanations,
      updatedAt: Date.now(),
    });
  },
});


/**
 * Saves the AI-generated summary for a session
 */
export const saveSummary = mutation({
  args: {
    sessionId: v.string(),
    summary: v.object({
      text: v.string(),
      keyConceptsCovered: v.array(v.string()),
      analogiesUsed: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, {
      summary: args.summary,
      updatedAt: Date.now(),
    });
  },
});
