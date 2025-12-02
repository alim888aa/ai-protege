"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { chunkText } from "../utils/chunking";
import { extractJargon } from "../utils/jargon";
import { api } from "../_generated/api";
import { extractText } from "unpdf";

/**
 * Processes a PDF file (as base64), extracts text using unpdf,
 * chunks it, generates embeddings, and stores in sourceMaterial.
 * 
 * unpdf uses WebAssembly and works in serverless/edge environments
 * without requiring browser APIs like DOMMatrix.
 * 
 * @param topic - The topic being taught
 * @param pdfBase64 - The PDF file content as base64 string
 * @returns sessionId for the created session
 */
export const processPdf = action({
  args: {
    topic: v.string(),
    pdfBase64: v.string(),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; sourceText?: string; error?: string }> => {
    const { topic, pdfBase64 } = args;

    try {
      // Defense-in-depth: validate base64 size server-side
      // Primary validation happens client-side in page.tsx before upload
      // 1MB binary = ~1.37MB in base64 encoding
      const maxBase64Size = 1.37 * 1024 * 1024;
      if (pdfBase64.length > maxBase64Size) {
        return {
          sessionId: "",
          error: "PDF file is too large. Maximum size is 1MB.",
        };
      }

      // Convert base64 to Uint8Array
      let pdfBuffer: Uint8Array;
      try {
        const binaryString = atob(pdfBase64);
        pdfBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          pdfBuffer[i] = binaryString.charCodeAt(i);
        }
      } catch (e) {
        return {
          sessionId: "",
          error: "Invalid PDF data. Please try uploading again.",
        };
      }

      // Extract text using unpdf
      let readableText: string;
      try {
        const { text } = await extractText(pdfBuffer);
        // text is an array of strings (one per page), join them
        const fullText = Array.isArray(text) ? text.join('\n') : text;
        readableText = fullText.replace(/\s+/g, " ").trim();

        if (readableText.length === 0) {
          return {
            sessionId: "",
            error: "Unable to extract text from PDF. The file may be image-based or empty.",
          };
        }

        // Cap content at 50,000 characters
        if (readableText.length > 50000) {
          readableText = readableText.substring(0, 50000);
        }
      } catch (parseError: unknown) {
        console.error("PDF parse error:", parseError);
        const errorMessage = parseError instanceof Error ? parseError.message : "Unknown error";
        return {
          sessionId: "",
          error: `Unable to parse PDF: ${errorMessage}`,
        };
      }

      // Split content into chunks
      const textChunks = chunkText(readableText, 1000, 200);

      if (textChunks.length === 0) {
        return {
          sessionId: "",
          error: "No content could be extracted from the PDF.",
        };
      }

      // Extract jargon words
      const jargonWords = extractJargon(readableText, 30);

      // Generate embeddings for each chunk
      const chunksWithEmbeddings: Array<{
        text: string;
        embedding: number[];
        index: number;
      }> = [];

      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];

        try {
          const { embedding } = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: chunk,
          });

          chunksWithEmbeddings.push({
            text: chunk,
            embedding: embedding,
            index: i,
          });
        } catch {
          // Retry once on failure
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const { embedding } = await embed({
              model: openai.embedding("text-embedding-3-small"),
              value: chunk,
            });

            chunksWithEmbeddings.push({
              text: chunk,
              embedding: embedding,
              index: i,
            });
          } catch {
            return {
              sessionId: "",
              error: "Failed to generate embeddings. Please try again later.",
            };
          }
        }
      }

      // Generate unique sessionId
      const sessionId = crypto.randomUUID();

      // Store in database
      try {
        await ctx.runMutation(api.mutations.createSourceMaterial, {
          sessionId,
          topic,
          sourceType: "pdf",
          chunks: chunksWithEmbeddings,
          jargonWords,
          createdAt: Date.now(),
        });
      } catch {
        return {
          sessionId: "",
          error: "Failed to store source material. Please try again.",
        };
      }

      return { sessionId, sourceText: readableText };
    } catch (error: unknown) {
      console.error("Unexpected error in processPdf:", error);
      return {
        sessionId: "",
        error: "An unexpected error occurred. Please try again.",
      };
    }
  },
});
