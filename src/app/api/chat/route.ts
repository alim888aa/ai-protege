import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const concept = body.concept || { title: 'Unknown', description: '' };
    const ragChunks = body.ragChunks || [];
    const canvasImage = body.canvasImage;

    // Debug: Log whether canvas image is present
    console.log('[Chat API] Canvas image present:', !!canvasImage);
    if (canvasImage) {
      console.log('[Chat API] Canvas image size:', Math.round(canvasImage.length / 1024), 'KB');
    }

    // Format RAG chunks for context (handle empty/undefined)
    const hasSourceMaterial = Array.isArray(ragChunks) && ragChunks.length > 0;
    const formattedChunks = hasSourceMaterial
      ? ragChunks
          .map((chunk: { text: string; similarity: number; index: number }, idx: number) => 
            `[Source ${idx + 1}]\n${chunk.text}`
          )
          .join('\n\n')
      : '';

    // Determine if this is the first message (initial explanation)
    const isFirstMessage = messages.length === 1;

    // System prompt to configure AI as curious 12-year-old student
    // Adjust behavior based on whether source material is available
    const sourceSection = hasSourceMaterial 
      ? `SOURCE MATERIAL (for fact-checking):
${formattedChunks}

- Check if explanations match what you read in the source material`
      : `NOTE: No source material is available for this session. Focus only on clarity and understanding, not accuracy checking.`;

    const accuracyGuidelines = hasSourceMaterial
      ? `- Only after clarity is addressed should you ask about ACCURACY (does it match the source material?)
- If something contradicts the source material, politely ask about it
- Progress naturally from clarity questions to accuracy questions`
      : `- Since there's no source material, focus entirely on CLARITY - is the explanation clear, simple, and easy to understand?
- Don't ask about factual accuracy - just help the teacher explain things clearly
- Focus on whether the explanation makes sense and is easy to follow`;

    const systemPrompt = `You are a curious 12-year-old student learning about: ${concept.title}

Concept description: ${concept.description}

${sourceSection}

Your role:
- You have no prior knowledge of this topic
- You're genuinely curious and want to understand
- Ask follow-up questions when something is unclear
- Request simplification when complex terms are used
- Ask for examples or analogies when concepts are abstract
- Be encouraging and enthusiastic when you understand something
- Use simple, natural language like a real 12-year-old

${isFirstMessage ? `IMPORTANT - First Question Strategy:
- You can see both the teacher's drawing AND their text explanation
- Start by asking about CLARITY first (is the explanation clear and simple?)
- If complex jargon is used, ask for simplification
- If the drawing doesn't match the explanation, ask about it
- If the explanation is abstract and the drawing doesn't help, ask for an analogy
${accuracyGuidelines}
- Ask ONE question at a time - don't overwhelm the teacher
- Your first question should focus on making the explanation clearer and simpler` : `Guidelines:
- Keep responses conversational and natural
- Ask ONE question at a time (don't overwhelm)
- Show genuine curiosity and confusion when appropriate
- Acknowledge good explanations with enthusiasm
- If the teacher provides an analogy, ask how it relates to the concept
${accuracyGuidelines}
- Be supportive and encouraging throughout`}

Remember: You're here to help the teacher identify gaps in their understanding by asking thoughtful questions ONE AT A TIME.`;

    // Convert messages to proper format (ai -> assistant)
    // For the first message, include the canvas image if provided
    const formattedMessages = messages.map((msg: { role: string; content: string }, index: number) => {
      const role = msg.role === 'ai' ? 'assistant' : msg.role;
      
      // If this is the first user message and we have a canvas image, use multimodal content
      if (index === 0 && role === 'user' && canvasImage) {
        return {
          role,
          content: [
            { type: 'text' as const, text: msg.content },
            { type: 'image' as const, image: canvasImage },
          ],
        };
      }
      
      return {
        role,
        content: msg.content,
      };
    });

    const result = await streamText({
      model: openai('gpt-4.1-mini-2025-04-14'), //DO NOT CHANGE THE MODEL NAME!
      system: systemPrompt,
      messages: formattedMessages,
      temperature: 0.8,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
