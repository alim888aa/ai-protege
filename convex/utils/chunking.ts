/**
 * Splits text into overlapping chunks for embedding generation
 * @param text - The text to chunk
 * @param maxChunkSize - Maximum size of each chunk in characters (default: 1000)
 * @param overlap - Number of characters to overlap between chunks (default: 200)
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  maxChunkSize: number = 1000,
  overlap: number = 200
): string[] {
  if (!text || text.length === 0) {
    return [];
  }

  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    // Calculate end index for this chunk
    let endIndex = startIndex + maxChunkSize;

    // If this is not the last chunk, try to break at a paragraph or sentence boundary
    if (endIndex < text.length) {
      // Look for paragraph breaks within the last 200 characters of the chunk
      const searchStart = Math.max(startIndex, endIndex - 200);
      const searchText = text.substring(searchStart, endIndex);
      
      // First, try to find paragraph breaks (double newlines)
      const paragraphBreak = searchText.lastIndexOf('\n\n');
      if (paragraphBreak !== -1) {
        endIndex = searchStart + paragraphBreak + 2;
      } else {
        // If no paragraph break, look for sentence endings
        const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
        
        let lastSentenceEnd = -1;
        for (const ending of sentenceEndings) {
          const pos = searchText.lastIndexOf(ending);
          if (pos > lastSentenceEnd) {
            lastSentenceEnd = pos;
          }
        }

        // If we found a sentence boundary, use it
        if (lastSentenceEnd !== -1) {
          endIndex = searchStart + lastSentenceEnd + 1;
        }
      }
    } else {
      // This is the last chunk, take everything remaining
      endIndex = text.length;
    }

    // Extract the chunk
    const chunk = text.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start index forward, accounting for overlap
    // For the last chunk, we're done
    if (endIndex >= text.length) {
      break;
    }

    startIndex = endIndex - overlap;
    
    // Ensure we're making progress
    const lastChunkIndex = chunks.length > 0 ? text.indexOf(chunks[chunks.length - 1]) : 0;
    if (startIndex <= lastChunkIndex) {
      startIndex = endIndex;
    }
  }

  return chunks;
}
