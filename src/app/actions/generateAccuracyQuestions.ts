'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define Zod schema for accuracy questions output
const accuracyQuestionSchema = z.object({
  questions: z.array(z.string()).describe('1 question about factual accuracy'),
});

export type AccuracyQuestionResponse = z.infer<typeof accuracyQuestionSchema>;

/**
 * Generates 1 question about factual accuracy using RAG chunks
 * Acts as a curious 12-year-old checking facts against source material
 * 
 * @param concept - The concept being taught (title and description)
 * @param textExplanation - The user's text explanation
 * @param ragChunks - Top 5 relevant chunks from source material with similarity scores
 * @returns Accuracy question about factual correctness
 */
export async function generateAccuracyQuestions(
  concept: { title: string; description: string },
  textExplanation: string,
  ragChunks: Array<{ text: string; similarity: number; index: number }>
): Promise<AccuracyQuestionResponse> {
  // Format RAG chunks for the prompt
  const formattedChunks = ragChunks
    .map((chunk, idx) => `[Source ${idx + 1}]\n${chunk.text}`)
    .join('\n\n');

  // Construct the prompt for accuracy questions
  const accuracyPrompt = `You are a curious 12-year-old student learning about: ${concept.title}

The teacher is explaining: ${concept.description}

SOURCE MATERIAL (for fact-checking):
${formattedChunks}

TEACHER'S EXPLANATION:
${textExplanation}

You have no prior knowledge of this topic. Ask 1 question about ACCURACY:
1. Check if the explanation matches the source material
2. Ask about missing important details from the source
3. Question anything that seems different from what the source says

Be genuinely curious. Use simple language.

Examples:
- "The source says X, but you said Y. Which one is right?"
- "I read that Z is important. Why didn't you mention it?"
- "Is that really how it works?"

Return your question in JSON format with a single question in the questions array.`;

  try {
    // Use generateObject to get structured accuracy questions
    const result = await generateObject({
      model: openai('gpt-4.1-mini'),
      messages: [
        {
          role: 'user',
          content: accuracyPrompt,
        },
      ],
      schema: accuracyQuestionSchema,
    });

    return result.object;
  } catch (error) {
    console.error('Error generating accuracy questions:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to generate accuracy questions'
    );
  }
}
