"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { cosineSimilarity } from "../utils/similarity";
import { api } from "../_generated/api";

/**
 * Retrieves the top 5 most relevant chunks from source material
 * based on semantic similarity to the user's text explanation.
 * 
 * @param sessionId - The session ID to retrieve chunks for
 * @param textExplanation - The user's text explanation to compare against
 * @returns Array of top 5 most relevant chunks with similarity scores
 */
export const retrieveRelevantChunks = action({
  args: {
    sessionId: v.string(),
    textExplanation: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    Array<{ text: string; similarity: number; index: number }>
  > => {
    const { sessionId, textExplanation } = args;

    try {
      // Generate embedding for user's text explanation
      let explanationEmbedding: number[];
      try {
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: textExplanation,
        });
        explanationEmbedding = embedding;
      } catch (embeddingError: any) {
        // Retry once on failure
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const { embedding } = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: textExplanation,
          });
          explanationEmbedding = embedding;
        } catch (retryError) {
          throw new Error("Failed to generate embedding for text explanation");
        }
      }

      // Retrieve all chunks for the given sessionId
      const sourceMaterial = await ctx.runQuery(
        api.mutations.getSourceMaterialBySession,
        { sessionId }
      );

      if (!sourceMaterial) {
        throw new Error(`No source material found for session: ${sessionId}`);
      }

      // Calculate cosine similarity for each chunk
      const chunksWithSimilarity: Array<{
        text: string;
        similarity: number;
        index: number;
      }> = sourceMaterial.chunks.map((chunk: {
        text: string;
        embedding: number[];
        index: number;
      }) => ({
        text: chunk.text,
        similarity: cosineSimilarity(explanationEmbedding, chunk.embedding),
        index: chunk.index,
      }));

      // Sort by similarity in descending order and return top 5
      const topChunks = chunksWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      return topChunks;
    } catch (error: any) {
      console.error("Error in retrieveRelevantChunks:", error);
      throw new Error(
        error.message || "Failed to retrieve relevant chunks"
      );
    }
  },
});
