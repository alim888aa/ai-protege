'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define Zod schema for concept extraction
const conceptSchema = z.object({
  concepts: z.array(
    z.object({
      title: z.string().describe('Clear concept title (2-5 words)'),
      description: z.string().describe('Brief description (1-2 sentences)'),
    })
  ).min(3).max(5).describe('Array of 3-5 key concepts from the source material'),
});

export type Concept = {
  id: string;
  title: string;
  description: string;
};

/**
 * Extracts 3-5 key concepts from source material using GPT
 * @param topic - The topic being learned
 * @param sourceText - The scraped and processed source material
 * @returns Array of concepts with id, title, and description
 */
export async function extractConcepts(
  topic: string,
  sourceText: string
): Promise<Concept[]> {
  // Construct the prompt for concept extraction
  const prompt = `You are helping a student learn about: ${topic}

Here is the source material:
${sourceText}

Extract 3-5 key concepts that a student should understand about this topic.
For each concept, provide:
1. A clear title (2-5 words)
2. A brief description (1-2 sentences)

These concepts should be teachable independently and cover the main ideas of the topic.

Return your response in JSON format.`;

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use generateObject to get structured concept extraction
      const result = await generateObject({
        model: openai('gpt-4.1-mini'),
        messages: [{ role: 'user', content: prompt }],
        schema: conceptSchema,
      });

      // Add unique IDs to each concept
      const conceptsWithIds: Concept[] = result.object.concepts.map((concept, index) => ({
        id: `concept-${Date.now()}-${index}`,
        title: concept.title,
        description: concept.description,
      }));

      return conceptsWithIds;
    } catch (error) {
      lastError = error as Error;
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // If all retries failed, throw the last error
  throw new Error(
    `Failed to extract concepts after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  );
}
