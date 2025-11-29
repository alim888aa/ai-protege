'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Define Zod schema for summary response
const summarySchema = z.object({
  summary: z.string().describe('A comprehensive summary of what the AI student learned from the teaching session'),
  keyConceptsCovered: z.array(z.string()).describe('List of key concepts that were covered'),
  analogiesUsed: z.array(z.string()).describe('List of analogies the teacher used'),
});

export type SummaryResponse = z.infer<typeof summarySchema>;

/**
 * Generates a summary of what the AI student learned from all concept dialogues
 * @param sessionId - The session ID to retrieve dialogues from
 * @returns Summary text with key concepts and analogies
 */
export async function generateSummary(sessionId: string): Promise<SummaryResponse> {
  // Retrieve session data from Convex
  const session = await convex.query(api.mutations.getSession, { sessionId });

  if (!session) {
    throw new Error('Session not found');
  }

  const { topic, concepts, dialogues, explanations } = session;

  // Format all dialogues for the prompt
  const formattedDialogues = concepts.map((concept, index) => {
    const conceptDialogue = dialogues.find((d) => d.conceptId === concept.id);
    const conceptExplanation = explanations?.find((e) => e.conceptId === concept.id);

    let dialogueText = '';

    // Include the user's written explanation if available
    if (conceptExplanation?.textExplanation) {
      dialogueText += `Teacher's written explanation:\n${conceptExplanation.textExplanation}\n\n`;
    }

    // Include the dialogue messages
    if (conceptDialogue && conceptDialogue.messages.length > 0) {
      dialogueText += conceptDialogue.messages
        .map((msg) => `${msg.role === 'user' ? 'Teacher' : 'AI Student'}: ${msg.content}`)
        .join('\n');
    } else {
      dialogueText = 'No dialogue recorded for this concept.';
    }

    return `## Concept ${index + 1}: ${concept.title}
Description: ${concept.description}

${dialogueText}`;
  }).join('\n\n---\n\n');

  // Construct the prompt
  const prompt = `You are a 12-year-old student who just learned about: ${topic}

Here's what your teacher taught you across ${concepts.length} concepts:

${formattedDialogues}

Now, summarize what you learned in your own words. Your summary should:
1. Start with: "I think I understand ${topic} now! Let me explain it back to you:"
2. Cover the main ideas from each concept
3. Show how the concepts connect to each other
4. Reference any analogies or examples the teacher used (these are very helpful!)
5. Use simple language like a 12-year-old would

Be enthusiastic and show genuine understanding. If the teacher used any analogies or comparisons, mention them because they really helped you understand!

Important: Your summary should demonstrate that you actually learned something, not just repeat back what was said. Show understanding by connecting ideas and explaining things in your own words.

Return your response in JSON format with:
- summary: Your full summary starting with "I think I understand ${topic} now! Let me explain it back to you:"
- keyConceptsCovered: Array of the main concepts you learned
- analogiesUsed: Array of any analogies or comparisons the teacher used (empty array if none)`;

  // Generate summary using GPT
  const result = await generateObject({
    model: openai('gpt-4.1-mini'),
    messages: [{ role: 'user', content: prompt }],
    schema: summarySchema,
  });

  return result.object;
}
