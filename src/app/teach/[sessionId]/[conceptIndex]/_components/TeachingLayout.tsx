'use client';

import { useMemo, useState, useEffect } from 'react';
import { useInactivityTimer } from '@/app/hooks/useInactivityTimer';
import { useSystemTheme } from '@/app/hooks/useSystemTheme';
import { ExcalidrawWrapper } from '@/app/components/ExcalidrawWrapper';
import { OverlayContainer } from './OverlayContainer';
import { InputPanel } from './InputPanel';
import { MessagePanel } from './MessagePanel';
import { NavigationBar } from './NavigationBar';
import { HintButton } from './HintButton';
import { HintModal } from './HintModal';
import { ErrorBanner } from './ErrorBanner';
import { OutOfBoundsWarning } from './OutOfBoundsWarning';
import { TeachingWelcomeScreen } from './TeachingWelcomeScreen';
import { calculateTopicPosition, createBoundaryElement, defaultTopicAreaConfig } from '@/app/utils/topicAreaManager';
import { useTeachingReducer, Message } from './useTeachingReducer';
import { useCanvasHandlers, useDialogueHandlers, useNavigationHandlers } from './hooks';

interface Concept {
  id: string;
  title: string;
  description: string;
}

interface Dialogue {
  conceptId: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: number;
    type?: string;
  }>;
}

interface Explanation {
  conceptId: string;
  textExplanation: string;
  canvasData?: string;
}

interface TeachingLayoutProps {
  sessionId: string;
  conceptIndex: number;
  currentConcept: Concept;
  totalConcepts: number;
  currentDialogue?: Dialogue;
  currentExplanation?: Explanation;
}

export function TeachingLayout({
  sessionId,
  conceptIndex,
  currentConcept,
  totalConcepts,
  currentDialogue,
  currentExplanation,
}: TeachingLayoutProps) {
  const theme = useSystemTheme();
  const { state, actions } = useTeachingReducer();
  const { resetTimer } = useInactivityTimer(30000);

  // Show welcome screen only on first topic of each session
  const welcomeKey = `teaching-welcome-${sessionId}`;
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Only show on first topic and if not dismissed for this session
    if (conceptIndex === 0) {
      const dismissed = sessionStorage.getItem(welcomeKey);
      if (!dismissed) {
        setShowWelcome(true);
      }
    }
  }, [conceptIndex, welcomeKey]);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem(welcomeKey, 'true');
  };

  // Canvas handlers
  const {
    excalidrawApiRef,
    canvasElementsRef,
    isOutOfBounds,
    handleElementsChange,
    handleApiReady,
    handleScrollChange,
    scrollToTopic,
  } = useCanvasHandlers(conceptIndex, resetTimer);

  // Messages from Convex + pending user message for optimistic UI
  const dialogueMessages: Message[] = useMemo(() => {
    const dbMessages = (currentDialogue?.messages ?? []).map((msg, idx) => ({
      id: `db-${msg.timestamp}-${idx}`,
      role: msg.role as 'user' | 'ai',
      content: msg.content,
      timestamp: msg.timestamp,
      type: msg.type as 'hint' | 'message' | undefined,
    }));

    if (state.pendingUserMessage) {
      return [
        ...dbMessages,
        {
          id: 'pending-user',
          role: 'user' as const,
          content: state.pendingUserMessage,
          timestamp: Date.now(),
        },
      ];
    }
    return dbMessages;
  }, [currentDialogue?.messages, state.pendingUserMessage]);

  // Dialogue handlers
  const { handleSubmit, handleGenerateHint, handleHintClick } = useDialogueHandlers({
    sessionId,
    currentConcept,
    canvasElementsRef,
    dialogueMessages,
    state,
    actions,
  });

  // Navigation handlers
  const { handleNextTopic, handleBackToDashboard, handleCompleteSession } = useNavigationHandlers({
    sessionId,
    conceptIndex,
    totalConcepts,
    currentConceptId: currentConcept.id,
    dialogueInput: state.dialogueInput,
    canvasElementsRef,
    excalidrawApiRef,
  });

  // Initial canvas state - filter out old boundaries and add fresh one with current dimensions
  const initialElements = useMemo(() => {
    const boundary = createBoundaryElement(conceptIndex, currentConcept.id);
    if (currentExplanation?.canvasData) {
      try {
        const saved = JSON.parse(currentExplanation.canvasData) as Array<{ customData?: { isBoundary?: boolean } }>;
        // Filter out old boundary elements to avoid duplicates with different sizes
        const withoutBoundaries = saved.filter((el) => !el.customData?.isBoundary);
        return [boundary, ...withoutBoundaries];
      } catch {
        return [boundary];
      }
    }
    return [boundary];
  }, [conceptIndex, currentConcept.id, currentExplanation?.canvasData]);

  const initialAppState = useMemo(() => {
    const pos = calculateTopicPosition(conceptIndex);
    const { width, height } = defaultTopicAreaConfig;
    // Center the topic area in the viewport
    const centerX = pos.x + width / 2;
    const centerY = pos.y + height / 2;
    // Use reasonable defaults for SSR, will be correct on client
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    return {
      scrollX: -(centerX - viewportWidth / 2),
      scrollY: -(centerY - viewportHeight / 2),
      zoom: { value: 1 },
    };
  }, [conceptIndex]);

  const showMoveToNext = dialogueMessages.length >= 2;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-50 dark:bg-zinc-900">
      {/* Canvas */}
      <div className="absolute inset-0 z-0">
        <ExcalidrawWrapper
          initialElements={initialElements}
          initialAppState={initialAppState}
          onElementsChange={handleElementsChange}
          onApiReady={handleApiReady}
          onScrollChange={handleScrollChange}
          theme={theme}
        />
      </div>

      {/* Overlay UI */}
      <OverlayContainer>
        <MessagePanel
          messages={dialogueMessages}
          isCollapsed={state.isMessagePanelCollapsed}
          onToggleCollapse={actions.toggleMessagePanel}
          isStreaming={state.isStreaming}
          streamingContent={state.streamingContent}
        />
        <HintButton onClick={handleHintClick} hintCount={state.hintCount} isGenerating={state.isGeneratingHint} />
        <InputPanel
          value={state.dialogueInput}
          onChange={actions.setInput}
          onSubmit={handleSubmit}
          isSubmitting={state.isSubmitting}
          jargonWords={[]}
        />
        <NavigationBar
          topicName={currentConcept.title}
          currentIndex={conceptIndex}
          totalTopics={totalConcepts}
          canProceed={showMoveToNext}
          isLastTopic={conceptIndex === totalConcepts - 1}
          onNextTopic={handleNextTopic}
          onCompleteSession={handleCompleteSession}
          onBackToDashboard={handleBackToDashboard}
        />
      </OverlayContainer>

      {/* Modals & Banners */}
      <HintModal
        isOpen={state.isHintModalOpen}
        onClose={actions.closeHintModal}
        hints={state.hints}
        currentPage={state.currentHintPage}
        onPageChange={actions.setHintPage}
        onGenerateHint={handleGenerateHint}
        isGenerating={state.isGeneratingHint}
        streamingHint={state.streamingHint}
      />
      <ErrorBanner error={state.error} onDismiss={() => actions.setError(null)} />
      <OutOfBoundsWarning isVisible={isOutOfBounds} onScrollBack={scrollToTopic} />

      {/* Welcome Screen */}
      {showWelcome && (
        <TeachingWelcomeScreen
          topicName={currentConcept.title}
          onDismiss={handleDismissWelcome}
        />
      )}
    </div>
  );
}
