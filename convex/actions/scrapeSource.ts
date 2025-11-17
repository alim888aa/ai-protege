"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { chunkText } from "../utils/chunking";
import { api } from "../_generated/api";

/**
 * Scrapes a URL, extracts readable content, chunks it, generates embeddings,
 * and stores everything in the sourceMaterial table.
 * 
 * @param topic - The topic being taught
 * @param sourceUrl - The URL to scrape
 * @returns sessionId for the created session
 */
export const scrapeSource = action({
  args: {
    topic: v.string(),
    sourceUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; error?: string }> => {
    const { topic, sourceUrl } = args;

    try {
      // Validate URL format
      let url: URL;
      try {
        url = new URL(sourceUrl);
      } catch (e) {
        return {
          sessionId: "",
          error: "Invalid URL format. Please provide a valid HTTP or HTTPS URL.",
        };
      }

      // Only allow HTTP/HTTPS protocols
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return {
          sessionId: "",
          error: "Only HTTP and HTTPS URLs are supported.",
        };
      }

      // Block localhost and private IPs
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172.")
      ) {
        return {
          sessionId: "",
          error: "Cannot scrape localhost or private IP addresses.",
        };
      }

      // Fetch URL content with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      let response: Response;
      try {
        response = await fetch(sourceUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; AI-Protege/1.0)",
          },
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          return {
            sessionId: "",
            error: "Request timed out. The URL took too long to respond. Please try again." + fetchError.message,
          };
        }
        return {
          sessionId: "",
          error: "Unable to reach URL. Please check the link and try again." + fetchError.message,
        };
      }

      if (!response.ok) {
        return {
          sessionId: "",
          error: `Failed to fetch URL (Status: ${response.status}). Please check the link and try again.`
        };
      }

      // Get HTML content
      const html = await response.text();

      // Parse HTML and extract readable content
      let readableText: string;
      try {
        // Use linkedom for lightweight HTML parsing
        const { parseHTML } = await import("linkedom");

        // Parse HTML with linkedom
        const { document } = parseHTML(html);

        // Remove script and style elements
        const scripts = document.querySelectorAll("script, style, noscript");
        scripts.forEach((el: any) => el.remove());

        // Try to find main content areas first
        let contentElement =
          document.querySelector("main") ||
          document.querySelector("article") ||
          document.querySelector('[role="main"]') ||
          document.querySelector(".content") ||
          document.querySelector("#content") ||
          document.body;

        // Extract text content
        readableText = contentElement?.textContent || "";

        // Clean up whitespace
        readableText = readableText.replace(/\s+/g, " ").trim();
        console.log(readableText)

        if (readableText.length === 0) {
          return {
            sessionId: "",
            error: "Unable to extract readable content. Try a different URL.",
          };
        }

        // Cap content at 50,000 characters (50 chunks max)
        if (readableText.length > 50000) {
          readableText = readableText.substring(0, 50000);
        }
      } catch (parseError: any) {
        console.error("Parse error details:", parseError);
        return {
          sessionId: "",
          error: `Unable to extract readable content: ${parseError.message || "Unknown error"}`,
        };
      }

      // Split content into chunks
      const textChunks = chunkText(readableText, 1000, 200);

      if (textChunks.length === 0) {
        return {
          sessionId: "",
          error: "No content could be extracted from the URL.",
        };
      }

      // Generate embeddings for each chunk
      const chunksWithEmbeddings: Array<{
        text: string;
        embedding: number[];
        index: number;
      }> = [];

      for (let i = 0; i < textChunks.length; i++) {
        const chunkText = textChunks[i];

        try {
          const { embedding } = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: chunkText,
          });

          chunksWithEmbeddings.push({
            text: chunkText,
            embedding: embedding,
            index: i,
          });
        } catch (embeddingError: any) {
          // Retry once on failure
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const { embedding } = await embed({
              model: openai.embedding("text-embedding-3-small"),
              value: chunkText,
            });

            chunksWithEmbeddings.push({
              text: chunkText,
              embedding: embedding,
              index: i,
            });
          } catch (retryError) {
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
          sourceUrl,
          chunks: chunksWithEmbeddings,
          createdAt: Date.now(),
        });
      } catch (dbError) {
        return {
          sessionId: "",
          error: "Failed to store source material. Please try again.",
        };
      }

      return { sessionId };
    } catch (error: any) {
      console.error("Unexpected error in scrapeSource:", error);
      return {
        sessionId: "",
        error: "An unexpected error occurred. Please try again.",
      };
    }
  },
});
