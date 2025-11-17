/**
 * Calculates the cosine similarity between two vectors
 * @param vectorA - First embedding vector
 * @param vectorB - Second embedding vector
 * @returns Cosine similarity score between 0 and 1 (1 = identical, 0 = orthogonal)
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (!vectorA || !vectorB || vectorA.length === 0 || vectorB.length === 0) {
    return 0;
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Vector dimensions must match. Got ${vectorA.length} and ${vectorB.length}`
    );
  }

  // Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }

  // Calculate magnitudes
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // Handle zero vectors
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Calculate cosine similarity
  const similarity = dotProduct / (magnitudeA * magnitudeB);

  // Clamp to [0, 1] range to handle floating point errors
  return Math.max(0, Math.min(1, similarity));
}
