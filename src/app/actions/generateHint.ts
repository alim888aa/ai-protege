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
 * @param ragChunks - Relevant source material chunks for context (empty for no-source mode)
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
  // Check if we have source material
  const hasSourceMaterial = ragChunks && ragChunks.length > 0;
  
  // Format RAG chunks for context (only if available)
  const formattedChunks = hasSourceMaterial
    ? ragChunks.map((chunk, idx) => `[Source ${idx + 1}]\n${chunk.text}`).join('\n\n')
    : '';

  // Format dialogue history
  const dialogueHistory = currentDialogue.length > 0
    ? currentDialogue
        .map((msg) => `${msg.role === 'user' ? 'Teacher' : 'AI Student'}: ${msg.content}`)
        .join('\n')
    : 'No dialogue yet - the teacher is just starting to explain.';

  // Get the last AI response if available
  const lastAIResponse = currentDialogue.length > 0
    ? [...currentDialogue].reverse().find((msg) => msg.role === 'assistant')
    : null;
  
  const lastAIContext = lastAIResponse
    ? `\nLAST AI STUDENT RESPONSE:\n"${lastAIResponse.content}"\n\nIMPORTANT: The hint should help the teacher address what the AI student just said or asked above.`
    : '';

  // Construct hint prompt based on hint count and whether source material exists
  let hintPrompt: string;

  // Socratic hint philosophy - never give direct answers
  const hintPhilosophy = `HINT PHILOSOPHY (CRITICAL):
- NEVER answer the AI student's question directly
- Guide the teacher to discover the answer themselves
- Be introspective: help them reflect on what they already know
- Suggest visualization ideas when appropriate
- Keep hints to MAXIMUM 4 sentences - be concise`;

  if (!hasSourceMaterial) {
    // No source material - use general knowledge hints
    if (hintCount === 1) {
      hintPrompt = `You are a Socratic teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueHistory}
${lastAIContext}

${hintPhilosophy}

Provide a gentle, guiding hint that:
1. Points them in the right direction WITHOUT answering
2. Asks them to reflect: "What do you already know about...?"
3. Suggests a visualization: "You could draw a diagram showing..."
4. Maximum 4 sentences total

Start with "Hint 1 of 3: " - be brief and Socratic.

Return your hint in JSON format.`;
    } else if (hintCount === 2) {
      hintPrompt = `You are a Socratic teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueHistory}
${lastAIContext}

${hintPhilosophy}

Provide a more specific guiding hint that:
1. Points to a specific aspect they should think about
2. Suggests how they might visualize or diagram it
3. Helps them connect what they know to what's being asked
4. Maximum 4 sentences total

Start with "Hint 2 of 3: " - be brief and Socratic.

Return your hint in JSON format.`;
    } else {
      hintPrompt = `You are a Socratic teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueHistory}
${lastAIContext}

${hintPhilosophy}

This is the final hint. Provide stronger guidance that:
1. Identifies the key gap in their explanation
2. Suggests specific aspects to cover (but don't explain them)
3. Offers a concrete visualization suggestion
4. Maximum 4 sentences total

Start with "Hint 3 of 3: " - be direct but still don't give the answer.

Return your hint in JSON format.`;
    }
  } else if (hintCount === 1) {
    // First hint: gentle nudge with source reference (with source material)
    hintPrompt = `You are a Socratic teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

RELEVANT SOURCE MATERIAL:
${formattedChunks}

USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueHistory}
${lastAIContext}

${hintPhilosophy}

Provide a gentle, guiding hint that:
1. Points them toward a relevant section of the source material (e.g., "The source mentions something about...")
2. Suggests a way to visualize the concept
3. Does NOT give the answer - just points the direction
4. Maximum 4 sentences total

Start with "Hint 1 of 3: " - be brief and Socratic.

Return your hint in JSON format.`;
  } else if (hintCount === 2) {
    // Second hint: more specific source reference (with source material)
    hintPrompt = `You are a Socratic teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

RELEVANT SOURCE MATERIAL:
${formattedChunks}

USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueHistory}
${lastAIContext}

${hintPhilosophy}

Provide a more specific guiding hint that:
1. References a specific part of the source material they should review
2. Suggests how they might draw or diagram the concept
3. Helps them connect source material to the AI's question
4. Maximum 4 sentences total

Start with "Hint 2 of 3: " - be brief and Socratic.

Return your hint in JSON format.`;
  } else {
    // Third hint: strongest guidance with source citation (with source material)
    hintPrompt = `You are a Socratic teaching assistant. A student is trying to teach a 12-year-old AI about: ${concept.title}

Concept description: ${concept.description}

RELEVANT SOURCE MATERIAL:
${formattedChunks}

USER'S CURRENT EXPLANATION:
${userExplanation || 'No explanation written yet.'}

CURRENT DIALOGUE:
${dialogueHistory}
${lastAIContext}

${hintPhilosophy}

This is the final hint. Provide stronger guidance that:
1. Identifies the specific gap between their explanation and the source
2. Points to the exact topic in the source they need to address
3. Suggests a concrete way to visualize or explain it
4. Maximum 4 sentences total - still don't give the full answer

Start with "Hint 3 of 3: " - be direct but Socratic.

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
