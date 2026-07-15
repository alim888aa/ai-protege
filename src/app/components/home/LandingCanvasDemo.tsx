'use client';

import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { ExcalidrawAPI, ExcalidrawWrapper } from '@/app/components/ExcalidrawWrapper';
import { exportFullCanvasForAI } from '@/app/utils/excalidrawExport';
import { LandingDemoChatPanel } from './LandingDemoChatPanel';
import { LandingDemoInputPanel } from './LandingDemoInputPanel';
import { getLandingDemoAppState, landingDemoScene } from './landingDemoScene';

type DemoStatus = 'idle' | 'submitting' | 'complete';

interface LandingCanvasDemoProps {
  ctaHref: string;
}

const starterExplanation =
  'A stack works last in, first out. A new book goes on top, and the book on top is the first one you can remove.';
const fallbackQuestion =
  'If Book 4 is on top now, where would Book 5 go, and which book would you remove first after adding it?';
const automaticStarterResponse =
  'Exactly—the last book placed on top is the first one removed. If Book 5 is pushed onto this stack, which book would pop off first?';
const localThinkingDelayMs = 500;
const localStreamDelayMs = 24;
const visitorStorageKey = 'ai_protege_demo_visitor';
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(/\.cloud$/, '.site') ?? '';

interface LockedViewport {
  scrollX: number;
  scrollY: number;
  zoom: { value: number };
}

function readViewport(appState: Record<string, unknown>): LockedViewport | null {
  const { scrollX, scrollY, zoom } = appState;
  const zoomValue =
    typeof zoom === 'object' && zoom !== null && 'value' in zoom
      ? (zoom as { value: unknown }).value
      : null;

  if (
    typeof scrollX !== 'number' ||
    typeof scrollY !== 'number' ||
    typeof zoomValue !== 'number'
  ) {
    return null;
  }

  return { scrollX, scrollY, zoom: { value: zoomValue } };
}

function isStarterExplanation(value: string) {
  const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
  return normalize(value) === normalize(starterExplanation);
}

function getDemoVisitorId() {
  try {
    const existingId = localStorage.getItem(visitorStorageKey);
    if (existingId) return existingId;
    const visitorId = crypto.randomUUID();
    localStorage.setItem(visitorStorageKey, visitorId);
    return visitorId;
  } catch {
    return crypto.randomUUID();
  }
}

function wait(duration: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, duration));
}

export function LandingCanvasDemo({ ctaHref }: LandingCanvasDemoProps) {
  const [explanation, setExplanation] = useState(starterExplanation);
  const [submittedExplanation, setSubmittedExplanation] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [status, setStatus] = useState<DemoStatus>('idle');
  const [notice, setNotice] = useState('');
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasVersion, setCanvasVersion] = useState(0);
  const elementsRef = useRef<readonly unknown[]>([]);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasApiRef = useRef<ExcalidrawAPI | null>(null);
  const lockedViewportRef = useRef<LockedViewport | null>(null);
  const submissionRunRef = useRef(0);

  function handleElementsChange(elements: readonly unknown[]) {
    elementsRef.current = elements;
    if (elements.length > 0) setCanvasReady(true);
  }

  function handleCanvasReady(api: ExcalidrawAPI) {
    const elements = api.getSceneElements();
    const canvasWidth = canvasContainerRef.current?.clientWidth ?? window.innerWidth;
    const viewport = readViewport(getLandingDemoAppState(canvasWidth));
    canvasApiRef.current = api;
    lockedViewportRef.current = null;
    elementsRef.current = elements;

    requestAnimationFrame(() => {
      if (!viewport || canvasApiRef.current?.id !== api.id) return;
      lockedViewportRef.current = viewport;
      api.updateScene({ appState: { ...viewport } });
    });

    if (elements.length > 0) setCanvasReady(true);
  }

  function handleScrollChange(scrollX: number, scrollY: number, zoom: number) {
    const api = canvasApiRef.current;
    const viewport = lockedViewportRef.current;
    if (!api || !viewport) return;

    if (
      scrollX === viewport.scrollX &&
      scrollY === viewport.scrollY &&
      zoom === viewport.zoom.value
    ) {
      return;
    }

    api.updateScene({
      appState: {
        scrollX: viewport.scrollX,
        scrollY: viewport.scrollY,
        zoom: viewport.zoom,
      },
    });
  }

  function resetDemo() {
    submissionRunRef.current += 1;
    elementsRef.current = [];
    canvasApiRef.current = null;
    lockedViewportRef.current = null;
    setCanvasReady(false);
    setCanvasVersion((version) => version + 1);
    setExplanation(starterExplanation);
    setSubmittedExplanation('');
    setAiResponse('');
    setStatus('idle');
    setNotice('Demo reset.');
  }

  async function streamLocalResponse(text: string, submissionRun: number, thinkingDelay: number) {
    await wait(thinkingDelay);
    if (submissionRunRef.current !== submissionRun) return;

    const chunks = text.match(/\S+\s*/g) ?? [text];
    let content = '';

    for (const chunk of chunks) {
      if (submissionRunRef.current !== submissionRun) return;
      content += chunk;
      setAiResponse(content);
      await wait(localStreamDelayMs);
    }

    if (submissionRunRef.current === submissionRun) setStatus('complete');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status !== 'idle' || !canvasReady || explanation.trim().length < 12) return;

    const userExplanation = explanation.trim();
    const submissionRun = submissionRunRef.current + 1;
    submissionRunRef.current = submissionRun;
    setSubmittedExplanation(userExplanation);
    setAiResponse('');
    setNotice('');
    setChatCollapsed(false);
    setStatus('submitting');

    if (isStarterExplanation(userExplanation)) {
      await streamLocalResponse(automaticStarterResponse, submissionRun, localThinkingDelayMs);
      return;
    }

    try {
      const canvasImage = await exportFullCanvasForAI(elementsRef.current, {
        backgroundColor: '#ffffff',
        padding: 28,
      });

      if (!convexSiteUrl) throw new Error('Convex is unavailable');

      const response = await fetch(`${convexSiteUrl}/landing-demo-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-Visitor': getDemoVisitorId(),
        },
        body: JSON.stringify({ explanation: userExplanation, canvasImage }),
      });

      if (response.status === 429) {
        setNotice('The live demo limit was reached. Showing the sample response.');
        await streamLocalResponse(fallbackQuestion, submissionRun, 0);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error('The live demo is unavailable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (submissionRunRef.current !== submissionRun) return;
        content += decoder.decode(value, { stream: true });
        setAiResponse(content);
      }

      if (!content.trim()) throw new Error('The live demo returned an empty response');
      if (submissionRunRef.current === submissionRun) setStatus('complete');
    } catch {
      if (submissionRunRef.current !== submissionRun) return;
      setNotice('The live response could not load, so this is a sample.');
      await streamLocalResponse(fallbackQuestion, submissionRun, 0);
    }
  }

  return (
    <article
      id="try-the-canvas"
      aria-label="Interactive stack data structure lesson"
      className="landing-demo-window relative mx-auto h-[720px] w-full max-w-[1380px] overflow-hidden rounded-[22px] border border-zinc-800 bg-[#121212] shadow-[0_28px_90px_-44px_rgba(15,23,42,0.75)] md:h-[760px]"
    >
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 z-0"
        data-tour="canvas"
        onWheelCapture={(event) => event.stopPropagation()}
      >
        <ExcalidrawWrapper
          key={canvasVersion}
          initialElementSkeletons={landingDemoScene}
          initialAppState={getLandingDemoAppState(
            typeof window === 'undefined' ? undefined : window.innerWidth
          )}
          onElementsChange={handleElementsChange}
          onApiReady={handleCanvasReady}
          onScrollChange={handleScrollChange}
          theme="dark"
          mode="demo"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <LandingDemoChatPanel
          key={canvasVersion}
          aiResponse={aiResponse}
          collapsed={chatCollapsed}
          notice={notice}
          onToggle={() => setChatCollapsed((collapsed) => !collapsed)}
          status={status}
          submittedExplanation={submittedExplanation}
        />

        <LandingDemoInputPanel
          canvasReady={canvasReady}
          onChange={setExplanation}
          onSubmit={handleSubmit}
          status={status}
          value={explanation}
        />

        <div className="pointer-events-auto absolute bottom-4 right-4 hidden items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-white shadow-xl md:flex">
          <button
            type="button"
            onClick={resetDemo}
            className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
            aria-label="Reset demo"
            title="Reset demo"
          >
            <RotateCcw className="size-5" />
          </button>
          <div className="h-8 w-px bg-zinc-600" />
          <div className="min-w-36">
            <p className="truncate text-sm font-medium">Stack Data Structure</p>
          </div>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            Start learning
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
