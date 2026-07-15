export interface EvaluationResult {
  clarityScore: number;
  accuracyScore: number;
  completenessScore: number;
  feedback: {
    unclearSections: string[];
    inaccuracies: string[];
    missingConcepts: string[];
    clarifyingQuestions: string[];
  };
  reasoning: string;
  overallScore: number;
}
