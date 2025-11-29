'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useState, useEffect } from 'react';

interface Concept {
  id: string;
  title: string;
  description: string;
}

export default function ConceptReviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

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
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="w-full max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 animate-fadeIn">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 w-64 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
              <div className="h-5 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
            
            {/* Concept Cards Skeleton */}
            <div className="space-y-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                      <div className="h-10 w-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Button Skeleton */}
            <div className="h-12 w-full bg-gray-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="w-full max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Review & Edit Concepts
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Topic: <span className="font-semibold">{sourceMaterial.topic}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Review the extracted concepts below. You can edit, add, or remove concepts before starting your teaching session.
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
              <div
                key={concept.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 card-hover animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Concept {index + 1} - Title
                    </label>
                    <input
                      type="text"
                      value={concept.title}
                      onChange={(e) => handleTitleChange(concept.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter concept title"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteConcept(concept.id)}
                    disabled={concepts.length <= 1}
                    className="ml-4 mt-7 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    title={concepts.length <= 1 ? "Cannot delete the last concept" : "Delete concept"}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={concept.description}
                    onChange={(e) => handleDescriptionChange(concept.id, e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Describe this concept in 1-2 sentences"
                  />
                </div>
              </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Delete Concept?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this concept? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
