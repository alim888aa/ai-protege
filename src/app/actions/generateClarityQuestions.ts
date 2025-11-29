'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define Zod schema for clarity questions output
const clarityQuestionSchema = z.object({
  questions: z.array(z.string()).describe('1 question about clarity and simplicity'),
  requestsAnalogy: z.boolean().describe('Whether the AI is requesting an analogy or comparison'),
});

export type ClarityQuestionResponse = z.infer<typeof clarityQuestionSchema>;

/**
 * Generates 1 question about clarity and simplicity as a curious 12-year-old
 * Uses multimodal input (canvas image + text explanation)
 * 
 * @param concept - The concept being taught (title and description)
 * @param textExplanation - The user's text explanation
 * @param canvasImageBase64 - Base64 encoded PNG image of the canvas drawing
 * @returns Clarity question and whether an analogy is requested
 */
export async function generateClarityQuestions(
  concept: { title: string; description: string },
  textExplanation: string,
  canvasImageBase64: string
): Promise<ClarityQuestionResponse> {
  // Construct the prompt for clarity questions
  const clarityPrompt = `You are a curious 12-year-old student learning about: ${concept.title}

The teacher is explaining: ${concept.description}

TEACHER'S EXPLANATION:
${textExplanation}

You have no prior knowledge of this topic. Ask 1 question about CLARITY and SIMPLICITY:
1. Request simplification if complex terms are used
2. Ask for clarification on unclear parts
3. Request drawings if concepts are abstract
4. If the explanation seems correct but abstract, request an analogy

Be genuinely curious and confused when things aren't clear. Use simple language.

Examples:
- "Wait, I don't get it - how does X connect to Y?"
- "Can you draw that part? I'm a visual learner!"
- "That word is too complicated, can you explain it simpler?"
- "Can you explain this using an analogy or comparison?"

Return your question in JSON format with a single question in the questions array.`;

  try {
    // Use generateObject to get structured clarity questions
    const result = await generateObject({
      model: openai('gpt-4.1-mini'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: clarityPrompt },
            { type: 'image', image: canvasImageBase64 },
          ],
        },
      ],
      schema: clarityQuestionSchema,
    });

    return result.object;
  } catch (error) {
    console.error('Error generating clarity questions:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to generate clarity questions'
    );
  }
}
