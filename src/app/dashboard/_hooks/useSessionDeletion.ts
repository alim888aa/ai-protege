'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { clearSessionCache } from '@/app/utils/sessionCache';

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

  function handleDeleteClick(sessionId: string) {
    setSessionToDelete(sessionId);
  }

  async function handleConfirmDelete() {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSessionMutation({ sessionId: sessionToDelete });
      clearSessionCache(sessionToDelete);
      // Close dialog on success - UI updates automatically via Convex reactivity
      setSessionToDelete(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
      // Keep dialog open on error so user can retry or cancel
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancelDelete() {
    if (!isDeleting) {
      setSessionToDelete(null);
    }
  }

  return {
    sessionToDelete,
    isDeleting,
    topicName,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
