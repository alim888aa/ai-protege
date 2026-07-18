'use client';

import type { FormEvent, KeyboardEvent } from 'react';
import { GripHorizontal, MoveDiagonal2 } from 'lucide-react';
import { useDemoFloatingPanel } from './useDemoFloatingPanel';

interface LandingDemoInputPanelProps {
  canvasReady: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status: 'idle' | 'submitting' | 'complete';
  value: string;
}

export function LandingDemoInputPanel({
  canvasReady,
  onChange,
  onSubmit,
  status,
  value,
}: LandingDemoInputPanelProps) {
  const canSubmit = status === 'idle' && canvasReady && value.trim().length >= 12;
  const { dragHandleProps, panelRef, resizeHandleProps, style } = useDemoFloatingPanel<HTMLFormElement>({
    height: 180,
    maxHeight: 500,
    maxWidth: 800,
    minHeight: 150,
    minWidth: 300,
    resizeEdge: 'top-right',
    width: 400,
  });

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    event.stopPropagation();

    if (event.key === 'Enter' && !event.shiftKey && canSubmit) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form
      ref={panelRef}
      style={style}
      onSubmit={onSubmit}
      className="pointer-events-auto absolute bottom-3 left-3 z-20 flex h-[165px] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-xl md:bottom-4 md:left-4 md:h-[var(--demo-panel-height)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
      data-tour="input-panel"
    >
      <div
        {...dragHandleProps}
        className="flex h-7 shrink-0 touch-none select-none items-center border-b border-zinc-200 bg-zinc-100 px-2 text-zinc-500 md:cursor-grab md:active:cursor-grabbing dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
      >
        <GripHorizontal className="mx-auto size-5" />
        <button
          type="button"
          aria-label="Resize explanation input"
          {...resizeHandleProps}
          className="absolute right-1 top-1 hidden size-5 touch-none items-center justify-center text-zinc-400 md:flex md:cursor-ne-resize"
        >
          <MoveDiagonal2 className="size-3.5" />
        </button>
      </div>

      <label htmlFor="landing-demo-explanation" className="sr-only">
        Explain how a stack data structure works
      </label>
      <textarea
        id="landing-demo-explanation"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your explanation... (Shift+Enter for new line)"
        disabled={status !== 'idle'}
        maxLength={600}
        className="scrollbar-hidden flex-1 resize-none bg-transparent p-3 text-sm leading-5 text-zinc-950 outline-none placeholder:text-zinc-500 disabled:opacity-60 dark:text-white"
      />

      <div className="flex shrink-0 justify-end border-t border-zinc-200 p-2 dark:border-zinc-700">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-400"
        >
          {status === 'submitting' ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
