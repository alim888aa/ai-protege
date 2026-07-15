'use client';

import dynamic from 'next/dynamic';
import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform';
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from '@excalidraw/excalidraw/types';
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

type CanvasMode = 'teaching' | 'demo';

type EmbeddedExcalidrawProps = Omit<ExcalidrawProps, 'initialData'> & {
  initialData?: ExcalidrawInitialDataState;
  initialElementSkeletons?: readonly ExcalidrawElementSkeleton[];
  mode: CanvasMode;
};

// Dynamic import with SSR disabled - Excalidraw requires browser APIs
const ExcalidrawWithMenu = dynamic<EmbeddedExcalidrawProps>(
  async () => {
    const mod = await import('@excalidraw/excalidraw');
    const ExcalidrawComponent = mod.Excalidraw;
    const MainMenuComponent = mod.MainMenu;

    function WrappedExcalidraw({
      children,
      initialData,
      initialElementSkeletons,
      mode,
      ...rest
    }: EmbeddedExcalidrawProps) {
      void mode;

      const resolvedInitialData = initialElementSkeletons
        ? {
            ...initialData,
            elements: mod.convertToExcalidrawElements(Array.from(initialElementSkeletons), {
              regenerateIds: false,
            }),
          }
        : initialData;

      return (
        <ExcalidrawComponent {...rest} initialData={resolvedInitialData}>
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
  initialElements?: readonly unknown[];
  initialElementSkeletons?: readonly ExcalidrawElementSkeleton[];
  initialAppState?: Record<string, unknown>;
  onElementsChange?: (elements: readonly unknown[]) => void;
  onApiReady?: (api: ExcalidrawAPI) => void;
  onScrollChange?: (scrollX: number, scrollY: number, zoom: number) => void;
  theme?: 'light' | 'dark';
  mode?: CanvasMode;
  viewModeEnabled?: boolean;
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
    options?: {
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

const teachingUiOptions: ExcalidrawProps['UIOptions'] = {
  canvasActions: {
    loadScene: false,
    saveToActiveFile: false,
    export: false,
    clearCanvas: false,
    saveAsImage: false,
    toggleTheme: true,
    changeViewBackgroundColor: true,
  },
  tools: { image: false },
};

export function ExcalidrawWrapper({
  initialElements,
  initialElementSkeletons,
  initialAppState,
  onElementsChange,
  onApiReady,
  onScrollChange,
  theme = 'light',
  mode = 'teaching',
  viewModeEnabled = false,
}: ExcalidrawWrapperProps) {
  function handleApiReady(api: ExcalidrawImperativeAPI) {
    onApiReady?.(api as unknown as ExcalidrawAPI);
  }

  const handleChange: ExcalidrawProps['onChange'] = (elements) => {
    onElementsChange?.(elements);
  };

  const handleScrollChange: ExcalidrawProps['onScrollChange'] = (scrollX, scrollY, zoom) => {
    onScrollChange?.(scrollX, scrollY, zoom.value);
  };

  function getUiOptions() {
    return teachingUiOptions;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <style>{hideExtraToolsCSS}</style>
      <ExcalidrawWithMenu
        excalidrawAPI={handleApiReady}
        initialData={{
          elements: initialElements as ExcalidrawInitialDataState['elements'],
          appState: initialAppState as ExcalidrawInitialDataState['appState'],
        }}
        initialElementSkeletons={initialElementSkeletons}
        onChange={handleChange}
        onScrollChange={handleScrollChange}
        zenModeEnabled={true}
        theme={theme}
        mode={mode}
        viewModeEnabled={viewModeEnabled}
        handleKeyboardGlobally={false}
        autoFocus={false}
        UIOptions={getUiOptions()}
      />
    </div>
  );
}
