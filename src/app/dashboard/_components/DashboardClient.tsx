'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { NewLessonCard, SessionCardSkeleton, type Step, type SourceType } from '../../components/dashboard';
import { SessionCard } from './SessionCard';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { useSessionCreation } from '../_hooks/useSessionCreation';
import { useSessionDeletion } from '../_hooks/useSessionDeletion';

export function DashboardClient() {
  // Fetch sessions
  const sessions = useQuery(api.mutations.getUserSessions);

  // Session creation logic
  const {
    step,
    topic,
    setTopic,
    sourceType,
    setSourceType,
    sourceUrl,
    setSourceUrl,
    pdfFile,
    setPdfFile,
    isProcessing,
    error,
    setError,
    processingMessage,
    handleNext,
    handleBack,
    handleStart,
  } = useSessionCreation();

  // Session deletion logic
  const {
    sessionToDelete,
    isDeleting,
    topicName: sessionToDeleteTopic,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  } = useSessionDeletion(sessions);

  return (
    <>
      {/* Loading Modal */}
      <ProcessingModal isOpen={isProcessing} message={processingMessage} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={sessionToDelete !== null}
        topicName={sessionToDeleteTopic}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* New Session Creation Card */}
          <NewLessonCard
            step={step as Step}
            topic={topic}
            setTopic={setTopic}
            sourceType={sourceType as SourceType}
            setSourceType={setSourceType}
            sourceUrl={sourceUrl}
            setSourceUrl={setSourceUrl}
            pdfFile={pdfFile}
            setPdfFile={setPdfFile}
            isProcessing={isProcessing}
            error={error}
            setError={setError}
            onNext={handleNext}
            onBack={handleBack}
            onStart={handleStart}
          />

          {/* Previous Lessons Section */}
          <SessionList sessions={sessions} onDelete={handleDeleteClick} />
        </div>
      </main>
    </>
  );
}

// Processing Modal Component
function ProcessingModal({ isOpen, message }: { isOpen: boolean; message: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
        <div className="flex justify-center mb-4">
          <svg
            className="animate-spin h-12 w-12 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Processing your source material...
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
          This may take 5-15 seconds
        </p>
      </div>
    </div>
  );
}

// Session type for the list
interface Session {
  sessionId: string;
  topic: string;
  sourceUrl?: string;
  sourceType?: 'url' | 'pdf' | 'none';
  concepts: Array<{ id: string; title: string; description: string }>;
  currentConceptIndex: number;
  completed: boolean;
  updatedAt: number;
}

// Session List Component
function SessionList({
  sessions,
  onDelete,
}: {
  sessions: Session[] | undefined;
  onDelete: (sessionId: string) => void;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Previous Lessons
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions === undefined ? (
          // Loading skeleton cards
          <>
            <SessionCardSkeleton />
            <SessionCardSkeleton />
            <SessionCardSkeleton />
          </>
        ) : sessions.length === 0 ? (
          // Empty state
          <EmptyState />
        ) : (
          // Render session cards
          sessions.map((session) => (
            <SessionCard
              key={session.sessionId}
              session={session}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="col-span-full text-center py-12">
      <div className="text-gray-400 dark:text-gray-500 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <p className="text-gray-500 dark:text-gray-400">
        No lessons yet. Start your first lesson above!
      </p>
    </div>
  );
}
