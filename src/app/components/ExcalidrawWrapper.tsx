'use client';

import dynamic from 'next/dynamic';
import { useRef, useEffect, type ComponentProps } from 'react';
import '@excalidraw/excalidraw/index.css';

// Hide extra tools dropdown and scroll-to-content button
// The scroll-to-content centers on ALL elements which is wrong for multi-topic canvas
const hideExtraToolsCSS = `
  .excalidraw .App-toolbar__extra-tools-trigger {
    display: none !important;
  }
  .excalidraw .scroll-back-to-content {
    display: none !important;
  }
`;

// Dynamic import with SSR disabled - Excalidraw requires browser APIs
const ExcalidrawWithMenu = dynamic(
  async () => {
    const mod = await import('@excalidraw/excalidraw');
    const ExcalidrawComponent = mod.Excalidraw;
    const MainMenuComponent = mod.MainMenu;

    function WrappedExcalidraw(props: ComponentProps<typeof ExcalidrawComponent>) {
      const { children, ...rest } = props;
      return (
        <ExcalidrawComponent {...rest}>
          <MainMenuComponent>
            <MainMenuComponent.DefaultItems.Help />
            <MainMenuComponent.DefaultItems.ChangeCanvasBackground />
            <MainMenuComponent.DefaultItems.ToggleTheme />
          </MainMenuComponent>
          {children}
        </ExcalidrawComponent>
      );
    }
    return WrappedExcalidraw;
  },
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center">Loading canvas...</div> }
);

/**
 * Simplified types for our use case
 */
export interface ExcalidrawWrapperProps {
  sessionId?: string;
  currentTopicIndex?: number;
  initialElements?: readonly unknown[];
  initialAppState?: Record<string, unknown>;
  onElementsChange?: (elements: readonly unknown[]) => void;
  onApiReady?: (api: ExcalidrawAPI) => void;
  onScrollChange?: (scrollX: number, scrollY: number) => void;
  theme?: 'light' | 'dark';
}

/**
 * Simplified API interface for our use case
 */
export interface ExcalidrawAPI {
  getSceneElements: () => readonly unknown[];
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, unknown>;
  scrollToContent: (
    target?: unknown,
    opts?: {
      fitToContent?: boolean;
      animate?: boolean;
      duration?: number;
    }
  ) => void;
  updateScene: (scene: {
    elements?: readonly unknown[];
    appState?: Record<string, unknown>;
  }) => void;
  resetScene: () => void;
  refresh: () => void;
  id: string;
}

export function ExcalidrawWrapper({
  initialElements,
  initialAppState,
  onElementsChange,
  onApiReady,
  onScrollChange,
  theme = 'light',
}: ExcalidrawWrapperProps) {
  // Use refs to avoid re-render loops
  const apiRef = useRef<ExcalidrawAPI | null>(null);
  const onElementsChangeRef = useRef(onElementsChange);
  const onApiReadyRef = useRef(onApiReady);
  const onScrollChangeRef = useRef(onScrollChange);

  // Keep refs updated
  useEffect(() => {
    onElementsChangeRef.current = onElementsChange;
  }, [onElementsChange]);

  useEffect(() => {
    onApiReadyRef.current = onApiReady;
  }, [onApiReady]);

  useEffect(() => {
    onScrollChangeRef.current = onScrollChange;
  }, [onScrollChange]);

  const handleApiReady = (api: unknown) => {
    apiRef.current = api as ExcalidrawAPI;
    onApiReadyRef.current?.(api as ExcalidrawAPI);
  };

  const handleChange = (elements: readonly unknown[] | undefined, appState: Record<string, unknown> | undefined) => {
    // Defensive check - elements might be undefined during initialization
    if (elements && onElementsChangeRef.current) {
      onElementsChangeRef.current(elements);
    }
    
    // Handle scroll change for viewport constraint
    if (onScrollChangeRef.current && appState) {
      const scrollX = appState.scrollX as number;
      const scrollY = appState.scrollY as number;
      if (typeof scrollX === 'number' && typeof scrollY === 'number') {
        onScrollChangeRef.current(scrollX, scrollY);
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <style>{hideExtraToolsCSS}</style>
      <ExcalidrawWithMenu
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        excalidrawAPI={handleApiReady as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData={{ elements: initialElements, appState: initialAppState } as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={handleChange as any}
        zenModeEnabled={true}
        theme={theme}
        handleKeyboardGlobally={false}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            export: false,
            clearCanvas: false,
            saveAsImage: false,
            toggleTheme: true,
            changeViewBackgroundColor: true,
          },
          tools: {
            image: false,
          },
        }}
      />
    </div>
  );
}
