'use server';

import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';

// Configure OpenRouter provider for Vercel AI SDK
const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_KEY,
});

// Define Zod schema for vision analysis output
const visionAnalysisSchema = z.object({
  conceptsDrawn: z.array(z.string()).describe('List of concepts illustrated in the drawing'),
  relationships: z.array(z.string()).describe('Relationships or connections shown between concepts'),
  clarity: z.number().min(0).max(10).describe('Rating of visual explanation clarity from 0-10'),
  completeness: z.number().min(0).max(10).describe('Rating of visual coverage completeness from 0-10'),
  observations: z.string().describe('General observations about the teaching approach'),
});

export type VisionAnalysis = z.infer<typeof visionAnalysisSchema>;

/**
 * Analyzes a teaching diagram using the Qwen 2VL vision model
 * @param canvasImageBase64 - Base64 encoded PNG image of the canvas drawing
 * @param topic - The topic being taught
 * @returns Vision analysis object with concepts, relationships, and ratings
 */
export async function analyzeDrawing(
  canvasImageBase64: string,
  topic: string
): Promise<VisionAnalysis> {
  // Construct the prompt for vision model analysis
  const visionPrompt = `You are analyzing a teaching diagram drawn by a student learning about: ${topic}

Analyze this drawing and provide:
1. What concepts are being illustrated
2. What relationships or connections are shown
3. Rate the clarity of the visual explanation (0-10)
4. Rate the completeness of visual coverage (0-10)
5. Any observations about the teaching approach

Return your analysis in JSON format.`;

  // Use generateObject to get structured vision analysis
  const visionAnalysis = await generateObject({
    model: openrouter.chat('qwen/qwen2.5-vl-32b-instruct:free'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: visionPrompt },
          { type: 'image', image: canvasImageBase64 },
        ],
      },
    ],
    schema: visionAnalysisSchema,
  });

  // Return the vision analysis object
  return visionAnalysis.object;
}
