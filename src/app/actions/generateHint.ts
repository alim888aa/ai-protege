'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define Zod schema for hint response
const hintSchema = z.object({
  hint: z.string().describe('A helpful hint that guides without giving away the full answer'),
});

export type HintResponse = z.infer<typeof hintSchema>;

/**
 * Generates a hint for the user based on the current concept and dialogue context
 * @param concept - The current concept being taught
 * @param currentDialogue - Array of dialogue messages (user and AI)
 * @param hintCount - Number of hints already requested (1st, 2nd, or 3rd)
 * @param ragChunks - Relevant source material chunks for context
 * @param userExplanation - The user's current text explanation
 * @returns Hint text to help guide the user
 */
export async function generateHint(
  concept: { title: string; description: string },
  currentDialogue: Array<{ role: string; content: string }>,
  hintCount: number,
  ragChunks: Array<{ text: string; similarity: number; index: number }>,
  userExplanation: string
): Promise<HintResponse> {
  // Format RAG chunks for context
  const formattedChunks = ragChunks
    .map((chunk, idx) => `[Source ${idx + 1}]\n${chunk.text}`)
    .join('\n\n');

  // Format dialogue history
  const dialogueHistory = currentDialogue.length > 0
    ? currentDialogue
        .map((msg) => `${msg.role === 'user' ? 'Teacher' : 'AI Student'}: ${msg.content}`)
        .join('\n')
    : 'No dialogue yet - the teacher is just starting to explain.';

  // Construct hint prompt based on hint count
  let hintPrompt: string;

  if (hintCount === 1) {
    // First hint: gentle nudge
    hintPrompt = `You are a helpful teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

RELEVANT SOURCE MATERIAL:
${formattedChunks}

USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueHistory}

The teacher seems stuck and needs a gentle hint. Provide a leading clue that:
1. Doesn't give away the full answer
2. Guides them toward the right direction
3. Uses simple, encouraging language
4. Helps them think about what to explain next

Example hints:
- "Think about how you would explain this to someone who has never heard of it before..."
- "What's the main purpose or goal of this concept?"
- "Can you think of a simple example from everyday life?"

Start your hint with "Hint 1 of 3: " and then provide the hint.

Return your hint in JSON format.`;
  } else if (hintCount === 2) {
    // Second hint: more specific
    hintPrompt = `You are a helpful teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

RELEVANT SOURCE MATERIAL:
${formattedChunks}

USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueHistory}

The teacher has requested a second hint. Provide a more specific clue that:
1. Points to a specific aspect they should cover
2. References something from the source material (without quoting directly)
3. Helps them understand what's missing from their explanation
4. Still encourages them to think it through

Example hints:
- "The source material mentions something important about [specific aspect]. Can you explain that part?"
- "Think about the relationship between [concept A] and [concept B]..."
- "What happens when [specific condition]? That's a key part to explain."

Start your hint with "Hint 2 of 3: " and then provide the hint.

Return your hint in JSON format.`;
  } else {
    // Third hint: synthesize source material into helpful summary
    hintPrompt = `You are a helpful teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

RELEVANT SOURCE MATERIAL (from their learning source):
${formattedChunks}

USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueHistory}

The teacher has requested a third hint. At this point, provide them with a synthesized summary of what they're missing.

Your task:
1. Analyze what the user has explained so far
2. Compare it to the source material
3. Identify the key information they're missing or haven't covered
4. Synthesize the relevant parts of the source material into a clear, helpful explanation
5. Present it as: "Hint 3 of 3: Based on the source material, here's what you might be missing: [your synthesized explanation]"

Guidelines:
- Don't just quote the source chunks - synthesize and format them into coherent information
- Focus on what's missing from their explanation
- Use simple, clear language (remember, they're teaching a 12-year-old)
- You can reference concepts from the source without showing raw text
- Be specific and actionable
- Keep it encouraging and supportive

Return your hint in JSON format.`;
  }

  // Generate hint using GPT
  const result = await generateObject({
    model: openai('gpt-4.1-mini'),
    messages: [{ role: 'user', content: hintPrompt }],
    schema: hintSchema,
  });

  return result.object;
}
