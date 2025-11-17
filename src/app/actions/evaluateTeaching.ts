'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { VisionAnalysis } from './analyzeDrawing';

// Define Zod schema for evaluation result
const evaluationSchema = z.object({
  clarityScore: z.number().min(0).max(100).describe('Score measuring how well concepts were explained (0-100)'),
  accuracyScore: z.number().min(0).max(100).describe('Score measuring factual correctness (0-100)'),
  completenessScore: z.number().min(0).max(100).describe('Score measuring coverage of key concepts (0-100)'),
  feedback: z.object({
    unclearSections: z.array(z.string()).describe('Specific sections that need improvement for clarity'),
    inaccuracies: z.array(z.string()).describe('Factual inaccuracies compared to source material'),
    missingConcepts: z.array(z.string()).describe('Key concepts from source that were not covered'),
    clarifyingQuestions: z.array(z.string()).describe('Questions to help reconcile vision and text perspectives'),
  }),
  reasoning: z.string().describe('Explanation of the scoring rationale for debugging'),
});

export type EvaluationResult = z.infer<typeof evaluationSchema> & {
  overallScore: number;
};

/**
 * Evaluates teaching effectiveness by synthesizing vision analysis and RAG results
 * @param topic - The topic being taught
 * @param visionAnalysis - Analysis from the vision model of the drawing
 * @param ragChunks - Top 5 relevant chunks from source material with similarity scores
 * @param textExplanation - The user's text explanation
 * @returns Evaluation result with scores and detailed feedback
 */
export async function evaluateTeaching(
  topic: string,
  visionAnalysis: VisionAnalysis,
  ragChunks: Array<{ text: string; similarity: number; index: number }>,
  textExplanation: string
): Promise<EvaluationResult> {
  // Format RAG chunks for the prompt
  const formattedChunks = ragChunks
    .map((chunk, idx) => `[Chunk ${idx + 1}] (Similarity: ${chunk.similarity.toFixed(3)})\n${chunk.text}`)
    .join('\n\n');

  // Construct the evaluation prompt
  const evaluationPrompt = `You are evaluating a student's teaching about: ${topic}

SOURCE MATERIAL (Top 5 relevant sections):
${formattedChunks}

VISUAL ANALYSIS:
The student drew a diagram showing: ${visionAnalysis.conceptsDrawn.join(', ')}
Relationships illustrated: ${visionAnalysis.relationships.join(', ')}
Visual clarity: ${visionAnalysis.clarity}/10
Visual completeness: ${visionAnalysis.completeness}/10
Observations: ${visionAnalysis.observations}

STUDENT'S TEXT EXPLANATION:
${textExplanation}

Evaluate the teaching effectiveness:
1. Clarity Score (0-100): How well did they explain concepts? Consider both visual and textual clarity.
2. Accuracy Score (0-100): How factually correct is their teaching compared to the source material?
3. Completeness Score (0-100): Did they cover key concepts from the source material?

Provide specific feedback:
- Unclear sections that need improvement (be specific about what's unclear)
- Factual inaccuracies compared to source material (cite specific discrepancies)
- Missing key concepts from the source (identify what important topics were omitted)

IMPORTANT - Generate Clarifying Questions:
When the vision analysis and text explanation don't align or when one modality is clearer than the other, generate specific questions that would help the student clarify their teaching. For example:
- "Your drawing shows a connection between X and Y, but you didn't explain this relationship in your text. What is the nature of this connection?"
- "You mentioned Z in your explanation, but I don't see this process illustrated in your diagram. Can you point out where this is shown?"
- "The visual shows A, but your text describes B. Are these the same concept, or did you mean to illustrate something different?"

These questions help reconcile the two different AI perspectives (vision vs text) and make gaps visible to the student.

Return structured JSON output with your evaluation.`;

  // Use generateObject to get structured evaluation
  const evaluation = await generateObject({
    model: openai('gpt-5-mini-2025-08-07'),
    messages: [{ role: 'user', content: evaluationPrompt }],
    schema: evaluationSchema,
  });

  // Calculate overall score as weighted average (Clarity 30%, Accuracy 40%, Completeness 30%)
  const overallScore = Math.round(
    evaluation.object.clarityScore * 0.3 +
    evaluation.object.accuracyScore * 0.4 +
    evaluation.object.completenessScore * 0.3
  );

  // Return evaluation object with overall score
  return {
    ...evaluation.object,
    overallScore,
  };
}
