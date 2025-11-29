/**
 * Client-side helper to stream dialogue responses from the AI student
 * Acts as a curious 12-year-old engaging in natural conversation
 * 
 * @param concept - The concept being taught (title and description)
 * @param messages - Array of previous messages in the conversation
 * @param ragChunks - Relevant source material chunks for fact-checking
 * @param onChunk - Callback function called with each text chunk
 * @param canvasImage - Optional base64 encoded canvas image (for first message)
 * @returns Promise that resolves with the complete response
 */
export async function generateDialogueResponse(
  concept: { title: string; description: string },
  messages: Array<{ role: string; content: string }>,
  ragChunks: Array<{ text: string; similarity: number; index: number }>,
  onChunk?: (text: string) => void,
  canvasImage?: string
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      concept,
      messages,
      ragChunks,
      canvasImage,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate dialogue response');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  if (!reader) {
    throw new Error('No response body');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      
      if (onChunk) {
        onChunk(fullText);
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}
