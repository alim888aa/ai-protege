'use client';

import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

interface Session {
  sessionId: string;
  topic: string;
}

export function useSessionDeletion(sessions: Session[] | undefined) {
  const deleteSessionMutation = useMutation(api.mutations.deleteSession);

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get the topic name for the session being deleted
  const topicName = sessionToDelete
    ? sessions?.find((s) => s.sessionId === sessionToDelete)?.topic ?? ''
    : '';

  const handleDeleteClick = useCallback((sessionId: string) => {
    setSessionToDelete(sessionId);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSessionMutation({ sessionId: sessionToDelete });
      // Close dialog on success - UI updates automatically via Convex reactivity
      setSessionToDelete(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
      // Keep dialog open on error so user can retry or cancel
    } finally {
      setIsDeleting(false);
    }
  }, [sessionToDelete, deleteSessionMutation]);

  const handleCancelDelete = useCallback(() => {
    if (!isDeleting) {
      setSessionToDelete(null);
    }
  }, [isDeleting]);

  return {
    sessionToDelete,
    isDeleting,
    topicName,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
