/**
 * Extracts jargon (complex technical terms) from text
 * @param text - The text to analyze
 * @param maxJargonWords - Maximum number of jargon words to return (default: 30)
 * @returns Array of jargon words sorted by frequency
 */
export function extractJargon(
  text: string,
  maxJargonWords: number = 30
): string[] {
  if (!text || text.length === 0) {
    return [];
  }

  // Common words to filter out (expanded list of stop words)
  const commonWords = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their",
    "what", "so", "up", "out", "if", "about", "who", "get", "which", "go",
    "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
    "take", "people", "into", "year", "your", "good", "some", "could", "them",
    "see", "other", "than", "then", "now", "look", "only", "come", "its", "over",
    "think", "also", "back", "after", "use", "two", "how", "our", "work", "first",
    "well", "way", "even", "new", "want", "because", "any", "these", "give", "day",
    "most", "us", "is", "was", "are", "been", "has", "had", "were", "said", "did",
    "having", "may", "should", "could", "would", "might", "must", "shall", "being",
    "does", "done", "very", "more", "such", "through", "between", "during", "before",
    "after", "above", "below", "under", "again", "further", "once", "here", "where",
    "why", "how", "both", "each", "few", "more", "other", "some", "such", "only",
    "own", "same", "than", "too", "can", "will", "just", "should", "now",
    // Additional common words
    "however", "therefore", "thus", "hence", "moreover", "furthermore", "nevertheless",
    "although", "though", "while", "whereas", "since", "unless", "until", "whether",
    "example", "including", "such", "many", "much", "several", "various", "different",
    "similar", "related", "associated", "particular", "specific", "general", "common",
    "important", "significant", "major", "main", "primary", "secondary", "basic",
    "essential", "fundamental", "critical", "key", "central", "crucial", "vital",
  ]);

  // Extract words (alphanumeric sequences)
  const wordPattern = /\b[a-zA-Z][a-zA-Z0-9]*\b/g;
  const words = text.match(wordPattern) || [];

  // Count word frequencies
  const wordFrequency = new Map<string, number>();

  for (const word of words) {
    const lowerWord = word.toLowerCase();

    // Filter criteria for jargon:
    // 1. Length > 10 characters (complex terms)
    // 2. Not a common word
    // 3. Contains at least one lowercase letter (not all caps acronyms)
    if (
      lowerWord.length > 10 &&
      !commonWords.has(lowerWord) &&
      /[a-z]/.test(word)
    ) {
      wordFrequency.set(lowerWord, (wordFrequency.get(lowerWord) || 0) + 1);
    }
  }

  // Additional pattern matching for technical terms (even if shorter)
  // Look for camelCase, PascalCase, or hyphenated technical terms
  const technicalPattern = /\b[a-z]+[A-Z][a-zA-Z]*\b|\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b|\b[a-z]+-[a-z]+\b/g;
  const technicalTerms = text.match(technicalPattern) || [];

  for (const term of technicalTerms) {
    const lowerTerm = term.toLowerCase();
    if (lowerTerm.length >= 6 && !commonWords.has(lowerTerm)) {
      wordFrequency.set(lowerTerm, (wordFrequency.get(lowerTerm) || 0) + 2); // Weight technical patterns higher
    }
  }

  // Sort by frequency (descending) and take top N
  const sortedJargon = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxJargonWords)
    .map(([word]) => word);

  return sortedJargon;
}
