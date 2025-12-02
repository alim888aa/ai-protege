'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useState, useEffect } from 'react';
import { ConceptCard } from './ConceptCard';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ReviewLoadingSkeleton } from './ReviewLoadingSkeleton';

interface Concept {
  id: string;
  title: string;
  description: string;
}

interface ConceptReviewClientProps {
  sessionId: string;
}

export function ConceptReviewClient({ sessionId }: ConceptReviewClientProps) {
  const router = useRouter();

  const sourceMaterial = useQuery(api.mutations.getSourceMaterialBySession, {
    sessionId,
  });
  const session = useQuery(api.mutations.getSession, { sessionId });
  const updateConceptsMutation = useMutation(api.mutations.updateConcepts);
  const createSessionMutation = useMutation(api.mutations.createSession);

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Initialize concepts from sourceMaterial or session
  useEffect(() => {
    if (sourceMaterial) {
      const initialConcepts = sourceMaterial.concepts || [];
      if (initialConcepts.length > 0) {
        setConcepts(initialConcepts);
      } else if (sourceMaterial.sourceType === 'none' || (!sourceMaterial.sourceType && !sourceMaterial.concepts?.length)) {
        // For manual mode, start with one empty concept
        setConcepts([{
          id: `concept-${Date.now()}`,
          title: '',
          description: '',
        }]);
      }
      setIsLoading(false);
    }
  }, [sourceMaterial]);

  const handleTitleChange = (id: string, newTitle: string) => {
    setConcepts(concepts.map(c => 
      c.id === id ? { ...c, title: newTitle } : c
    ));
  };

  const handleDescriptionChange = (id: string, newDescription: string) => {
    setConcepts(concepts.map(c => 
      c.id === id ? { ...c, description: newDescription } : c
    ));
  };

  const handleDeleteConcept = (id: string) => {
    if (concepts.length <= 1) {
      setError('You must have at least 1 concept to proceed.');
      return;
    }
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setConcepts(concepts.filter(c => c.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setError(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleAddConcept = () => {
    if (concepts.length >= 10) {
      setError('Maximum of 10 concepts allowed.');
      return;
    }

    const newConcept: Concept = {
      id: `concept-${Date.now()}`,
      title: 'New Concept',
      description: 'Describe this concept in 1-2 sentences.',
    };

    setConcepts([...concepts, newConcept]);
    setError(null);
  };

  const handleStartTeaching = async () => {
    // Validate concepts
    if (concepts.length === 0) {
      setError('You must have at least 1 concept to proceed.');
      return;
    }

    if (concepts.length > 10) {
      setError('Maximum of 10 concepts allowed.');
      return;
    }

    // Check for empty titles or descriptions
    const hasEmptyFields = concepts.some(c => !c.title.trim() || !c.description.trim());
    if (hasEmptyFields) {
      setError('All concepts must have a title and description.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Create session if it doesn't exist
      if (!session && sourceMaterial) {
        await createSessionMutation({
          sessionId,
          topic: sourceMaterial.topic,
          sourceType: sourceMaterial.sourceType,
          sourceUrl: sourceMaterial.sourceUrl,
          concepts,
        });
      } else {
        // Update concepts in existing session
        await updateConceptsMutation({
          sessionId,
          concepts,
        });
      }

      // Navigate to first concept teaching screen
      router.push(`/teach/${sessionId}/0`);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to save concepts: ${err.message}`
          : 'Failed to save concepts. Please try again.'
      );
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ReviewLoadingSkeleton />;
  }

  if (!sourceMaterial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Session not found.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const isManualMode = sourceMaterial.sourceType === 'none' || !sourceMaterial.sourceType;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="w-full max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isManualMode ? 'Define Your Concepts' : 'Review & Edit Concepts'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Topic: <span className="font-semibold">{sourceMaterial.topic}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {isManualMode
                ? 'Add the concepts you want to learn about. You can add up to 10 concepts.'
                : 'Review the extracted concepts below. You can edit, add, or remove concepts before starting your teaching session.'}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          {/* Concepts List */}
          <div className="space-y-4 mb-6">
            {concepts.map((concept, index) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                index={index}
                canDelete={concepts.length > 1}
                onTitleChange={handleTitleChange}
                onDescriptionChange={handleDescriptionChange}
                onDelete={handleDeleteConcept}
              />
            ))}
          </div>

          {/* Add Concept Button */}
          <div className="mb-8">
            <button
              onClick={handleAddConcept}
              disabled={concepts.length >= 10}
              className="w-full px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {concepts.length >= 10 ? 'Maximum concepts reached (10)' : '+ Add Concept'}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
              {concepts.length} of 10 concepts
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all duration-200 btn-press focus-ring-smooth"
            >
              Back to Setup
            </button>
            <button
              onClick={handleStartTeaching}
              disabled={isSaving || concepts.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl btn-press focus-ring-smooth"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Start Teaching
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <DeleteConfirmModal onCancel={cancelDelete} onConfirm={confirmDelete} />
      )}
    </div>
  );
}
