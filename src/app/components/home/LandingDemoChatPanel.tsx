'use client';

import { useState } from 'react';
import { ChevronDown, CircleUserRound, MessageCircle, MoveDiagonal2 } from 'lucide-react';
import { useDemoFloatingPanel } from './useDemoFloatingPanel';

type DemoStatus = 'idle' | 'submitting' | 'complete';

interface LandingDemoChatPanelProps {
  aiResponse: string;
  collapsed: boolean;
  notice: string;
  onToggle: () => void;
  status: DemoStatus;
  submittedExplanation: string;
}

const openingQuestion =
  'Show me how a stack of books works. Which book can I remove first, and where does a new book go?';

export function LandingDemoChatPanel({
  aiResponse,
  collapsed,
  notice,
  onToggle,
  status,
  submittedExplanation,
}: LandingDemoChatPanelProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [mobileDismissed, setMobileDismissed] = useState(false);
  const mobileOpen = mobileExpanded || (status !== 'idle' && !mobileDismissed);

  return (
    <>
      {collapsed ? (
        <ChatToggle onClick={onToggle} className="hidden md:flex" />
      ) : (
        <ChatSurface
          aiResponse={aiResponse}
          className="hidden md:flex"
          notice={notice}
          onClose={onToggle}
          status={status}
          submittedExplanation={submittedExplanation}
        />
      )}

      {mobileOpen ? (
        <ChatSurface
          aiResponse={aiResponse}
          className="flex md:hidden"
          notice={notice}
          onClose={() => {
            setMobileExpanded(false);
            setMobileDismissed(true);
          }}
          status={status}
          submittedExplanation={submittedExplanation}
        />
      ) : (
        <ChatToggle
          onClick={() => {
            setMobileExpanded(true);
            setMobileDismissed(false);
          }}
          className="flex md:hidden"
        />
      )}
    </>
  );
}

function ChatToggle({ onClick, className }: { onClick: () => void; className: string }) {
  return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Open AI Student chat"
        className={`pointer-events-auto absolute right-3 top-3 z-20 size-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-200 shadow-lg transition hover:bg-zinc-700 md:right-4 md:top-4 ${className}`}
      >
        <MessageCircle className="size-6" />
      </button>
  );
}

function ChatSurface({
  aiResponse,
  className,
  notice,
  onClose,
  status,
  submittedExplanation,
}: {
  aiResponse: string;
  className: string;
  notice: string;
  onClose: () => void;
  status: DemoStatus;
  submittedExplanation: string;
}) {
  const { dragHandleProps, panelRef, resizeHandleProps, style } = useDemoFloatingPanel<HTMLElement>({
    height: 400,
    maxHeight: 600,
    maxWidth: 600,
    minHeight: 240,
    minWidth: 280,
    resizeEdge: 'bottom-left',
    width: 350,
  });

  return (
    <section
      ref={panelRef}
      style={style}
      className={`pointer-events-auto absolute right-3 top-3 z-20 h-[290px] flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 text-white shadow-xl md:right-4 md:top-4 md:h-[var(--demo-panel-height)] ${className}`}
    >
      <header
        {...dragHandleProps}
        className="flex h-11 shrink-0 touch-none select-none items-center justify-between border-b border-zinc-700 bg-zinc-900/60 px-4 md:cursor-grab md:active:cursor-grabbing"
      >
        <h2 className="text-sm font-semibold">AI Student</h2>
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-violet-600 text-white" aria-hidden="true">
            <CircleUserRound className="size-5" />
          </span>
          <button
            type="button"
            onClick={onClose}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="Collapse AI Student chat"
            className="rounded p-1 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </header>

      <div className="scrollbar-hidden flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        <div className={status === 'idle' ? '' : 'hidden md:block'}>
          <MessageBubble role="ai" content={openingQuestion} />
        </div>

        {submittedExplanation && <MessageBubble role="user" content={submittedExplanation} />}

        {status === 'submitting' && !aiResponse && <ThinkingBubble />}

        {aiResponse && <MessageBubble role="ai" content={aiResponse} streaming={status === 'submitting'} />}

        {notice && <p className="px-1 pt-1 text-[11px] leading-4 text-zinc-400">{notice}</p>}
      </div>
      <button
        type="button"
        aria-label="Resize AI Student chat"
        {...resizeHandleProps}
        className="absolute bottom-0 left-0 hidden size-5 touch-none items-center justify-center text-zinc-500 md:flex md:cursor-sw-resize"
      >
        <MoveDiagonal2 className="size-3.5" />
      </button>
    </section>
  );
}

function MessageBubble({
  content,
  role,
  streaming = false,
}: {
  content: string;
  role: 'user' | 'ai';
  streaming?: boolean;
}) {
  const isUser = role === 'user';

  return (
    <div className={`rounded-lg p-2 ${isUser ? 'ml-4 bg-blue-900/20' : 'mr-4 bg-zinc-700'}`}>
      <span className={`text-xs font-medium ${isUser ? 'text-blue-400' : 'text-green-400'}`}>
        {isUser ? 'You' : 'AI'}
      </span>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-white">
        {content}
        {streaming && <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-blue-500" />}
      </p>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="mr-4 rounded-lg bg-zinc-700 p-2">
      <span className="text-xs font-medium text-green-400">AI</span>
      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-300">
        <span className="italic">Thinking</span>
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-1.5 animate-bounce rounded-full bg-zinc-400" />
          <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
}
