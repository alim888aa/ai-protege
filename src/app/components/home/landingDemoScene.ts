import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform';

const bookStyle = {
  backgroundColor: 'transparent',
  strokeColor: '#111827',
  fillStyle: 'solid' as const,
  roughness: 1,
  roundness: { type: 3 as const },
};

function book(id: string, label: string, y: number): ExcalidrawElementSkeleton {
  return {
    type: 'rectangle',
    id,
    x: 400,
    y,
    width: 340,
    height: 58,
    ...bookStyle,
    label: {
      text: label,
      fontSize: 22,
      fontFamily: 5,
      strokeColor: '#111827',
    },
  };
}

export const landingDemoScene: readonly ExcalidrawElementSkeleton[] = [
  {
    type: 'rectangle',
    id: 'stack-outline',
    x: 390,
    y: 280,
    width: 360,
    height: 300,
    ...bookStyle,
  },
  {
    type: 'text',
    id: 'stack-title',
    x: 485,
    y: 145,
    text: 'STACK (LIFO)',
    fontSize: 20,
    fontFamily: 5,
    strokeColor: '#111827',
  },
  book('book-4', 'Book 4', 300),
  book('book-3', 'Book 3', 368),
  book('book-2', 'Book 2', 436),
  book('book-1', 'Book 1', 504),
  {
    type: 'rectangle',
    id: 'new-book',
    x: 400,
    y: 195,
    width: 340,
    height: 58,
    ...bookStyle,
    strokeStyle: 'dashed',
    label: {
      text: 'Book 5 (next)',
      fontSize: 22,
      fontFamily: 5,
      strokeColor: '#111827',
    },
  },
  {
    type: 'arrow',
    id: 'push-arrow',
    x: 300,
    y: 224,
    width: 100,
    height: 0,
    points: [
      [0, 0],
      [100, 0],
    ],
    strokeColor: '#111827',
    strokeWidth: 2,
    endArrowhead: 'arrow',
    roughness: 1,
  },
  {
    type: 'text',
    id: 'push-label',
    x: 320,
    y: 180,
    text: 'PUSH',
    fontSize: 18,
    fontFamily: 5,
    strokeColor: '#111827',
    width: 68,
    height: 24,
    autoResize: false,
    originalText: 'PUSH',
  },
  {
    type: 'arrow',
    id: 'pop-arrow',
    x: 740,
    y: 329,
    width: 90,
    height: 0,
    points: [
      [0, 0],
      [90, 0],
    ],
    strokeColor: '#111827',
    strokeWidth: 2,
    endArrowhead: 'arrow',
    roughness: 1,
  },
  {
    type: 'text',
    id: 'pop-label',
    x: 766,
    y: 270,
    text: 'POP',
    fontSize: 18,
    fontFamily: 5,
    strokeColor: '#111827',
    width: 54,
    height: 24,
    autoResize: false,
    originalText: 'POP',
  },
];

export const landingDemoAppState: Record<string, unknown> = {
  scrollX: 95,
  scrollY: 48,
  zoom: { value: 0.82 },
  viewBackgroundColor: '#ffffff',
  currentItemStrokeColor: '#111827',
  currentItemBackgroundColor: 'transparent',
  currentItemFillStyle: 'solid',
  currentItemStrokeWidth: 2,
  currentItemRoughness: 1,
};

export function getLandingDemoAppState(viewportWidth?: number): Record<string, unknown> {
  if (viewportWidth === undefined || viewportWidth >= 768) return landingDemoAppState;

  const zoom = 0.7;
  const sceneCenterX = (300 + 830) / 2;

  return {
    ...landingDemoAppState,
    scrollX: viewportWidth / (2 * zoom) - sceneCenterX,
    scrollY: -10,
    zoom: { value: zoom },
  };
}
