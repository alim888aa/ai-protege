# Design Document: Excalidraw Redesign

## Overview

This design document describes the architecture and implementation approach for migrating the AI Protégé teaching interface from tldraw to Excalidraw, with a complete UI redesign featuring a full-screen canvas with overlay controls. The redesign prioritizes simplicity, giving users maximum drawing space while keeping essential controls accessible through floating overlays.

The key architectural change is moving from a split-panel layout (60% canvas / 40% chat) to a single full-screen Excalidraw canvas with UI elements overlaid using CSS positioning and pointer-events management.

## Architecture

```mermaid
graph TB
    subgraph "Teaching Interface"
        EC[ExcalidrawCanvas]
        subgraph "Overlay Layer (z-index: 10+)"
            MP[MessagePanel]
            HB[HintButton]
            HM[HintModal]
            IP[InputPanel]
            NB[NavigationBar]
        end
    end
    
    subgraph "State Management"
        CS[CanvasState]
        DS[DialogueState]
        HS[HintState]
        TS[TopicState]
    end
    
    subgraph "External Services"
        AI[AI Service]
        DB[Convex Database]
    end
    
    EC --> CS
    MP --> DS
    HM --> HS
    NB --> TS
    IP --> DS
    IP --> CS
    
    DS --> AI
    CS --> DB
    DS --> DB


## Components and Interfaces

### 1. ExcalidrawCanvas Component

The core canvas component wrapping Excalidraw with custom configuration.

```typescript
interface ExcalidrawCanvasProps {
  sessionId: string;
  currentTopicIndex: number;
  initialElements?: ExcalidrawElement[];
  onElementsChange: (elements: ExcalidrawElement[]) => void;
  theme: 'light' | 'dark';
}

// Excalidraw configuration
const excalidrawConfig = {
  zenModeEnabled: true,
  theme: props.theme,
  handleKeyboardGlobally: false,
  UIOptions: {
    canvasActions: {
      loadScene: false,
      saveToActiveFile: false,
      export: false,
      clearCanvas: false,
    },
  },
};
```

### 2. OverlayContainer Component

Container managing all overlay UI elements with proper z-indexing and pointer-events.

```typescript
interface OverlayContainerProps {
  children: React.ReactNode;
}

// CSS structure
// .overlay-container {
//   position: absolute;
//   inset: 0;
//   z-index: 10;
//   pointer-events: none;
// }
// .overlay-container > * {
//   pointer-events: auto;
// }
```

### 3. MessagePanel Component

Collapsible panel for displaying AI dialogue.

```typescript
interface MessagePanelProps {
  messages: Message[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isStreaming: boolean;
  streamingContent: string;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}
```

### 4. HintModal Component

Modal with paginated hints and on-demand generation.

```typescript
interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic: Concept;
  hints: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onGenerateHint: (hintNumber: number) => void;
  isGenerating: boolean;
  streamingHint: string;
}
```

### 5. InputPanel Component

Bottom-left input with jargon highlighting.

```typescript
interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  jargonWords: string[];
  onFocus: () => void;
  onBlur: () => void;
}
```

### 6. NavigationBar Component

Bottom-right navigation showing progress and next topic button.

```typescript
interface NavigationBarProps {
  topicName: string;
  currentIndex: number;
  totalTopics: number;
  canProceed: boolean;
  isLastTopic: boolean;
  onNextTopic: () => void;
  onCompleteSession: () => void;
}
```

### 7. TopicAreaManager Utility

Manages topic positioning and viewport constraints.

```typescript
interface TopicAreaConfig {
  width: number;      // 1500px
  height: number;     // 1000px
  gap: number;        // 200px
  columns: number;    // 2
}

interface TopicPosition {
  x: number;
  y: number;
  boundaryElement: ExcalidrawElement; // Dashed rectangle
}

function calculateTopicPosition(index: number, config: TopicAreaConfig): TopicPosition;
function createBoundaryElement(position: TopicPosition, topicId: string): ExcalidrawElement;
function filterElementsByTopic(elements: ExcalidrawElement[], topicId: string): ExcalidrawElement[];
function constrainViewport(scrollX: number, scrollY: number, topicPosition: TopicPosition): { scrollX: number; scrollY: number };
```


## Data Models

### Canvas State (Stored in Convex)

```typescript
interface CanvasState {
  sessionId: string;
  elements: ExcalidrawElement[];  // All elements across all topics
  appState: {
    scrollX: number;
    scrollY: number;
    zoom: number;
  };
  files: BinaryFiles;  // For any images added to canvas
}

// ExcalidrawElement with custom data for topic tracking
interface TaggedElement extends ExcalidrawElement {
  customData?: {
    topicId: string;
    createdAt: number;
  };
}
```

### Topic Area Layout

```typescript
interface TopicLayout {
  topicId: string;
  index: number;
  position: {
    x: number;  // Calculated: (index % 2) * (1500 + 200)
    y: number;  // Calculated: Math.floor(index / 2) * (1000 + 200)
  };
  boundaryElementId: string;
}
```

### Hint State

```typescript
interface HintState {
  hints: [string | null, string | null, string | null];  // 3 hint slots
  generatedCount: number;  // 0-3
  currentPage: number;     // 0-2
  isGenerating: boolean;
  streamingContent: string;
}
```

### Theme Configuration

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark';
  excalidrawTheme: 'light' | 'dark';
  accentColors: {
    primary: string;    // Light: blue, Dark: orange (#ff6b35)
    secondary: string;  // Light: gray, Dark: purple (#9b59b6)
    hint: string;       // Light: yellow, Dark: orange
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties can be verified through property-based testing:

### Property 1: Jargon highlighting consistency
*For any* input text containing jargon words from the source material, the highlight layer SHALL mark exactly those words and no others.
**Validates: Requirements 2.3**

### Property 2: Topic element filtering accuracy
*For any* set of canvas elements with mixed topic IDs in customData, filtering by a specific topic ID SHALL return exactly the elements tagged with that ID.
**Validates: Requirements 2.7**

### Property 3: Grid position calculation correctness
*For any* topic index n, the calculated position SHALL equal `x = (n % 2) * 1700, y = Math.floor(n / 2) * 1200` (where 1700 = 1500 + 200 gap, 1200 = 1000 + 200 gap).
**Validates: Requirements 5.1**

### Property 4: Element topic tagging
*For any* element created while a topic is active, that element SHALL have customData.topicId set to the current topic's ID.
**Validates: Requirements 5.5**

### Property 5: Viewport constraint enforcement
*For any* scroll position (scrollX, scrollY) and current topic boundary, the constrained position SHALL be within the topic area bounds (topicX to topicX+1500, topicY to topicY+1000).
**Validates: Requirements 5.7**

### Property 6: Navigation preserves all elements
*For any* navigation between topics, the total element count before and after navigation SHALL be equal, and all element IDs SHALL be preserved.
**Validates: Requirements 5.4**

### Property 7: Export includes all topics
*For any* session with n topics, the exported canvas SHALL contain elements from all n topic areas.
**Validates: Requirements 7.4**

### Property 8: Canvas state round-trip
*For any* valid canvas state (elements + appState), saving to database and loading back SHALL produce an equivalent state.
**Validates: Requirements 9.2, 9.3**


## Error Handling

### Canvas Initialization Errors
- If Excalidraw fails to load, display a fallback error message with retry option
- If initial canvas state fails to load from database, start with empty canvas and log error

### AI Communication Errors
- If hint generation fails, display error in modal with retry button
- If message submission fails, show error toast and preserve input content
- Implement exponential backoff for retries

### Export Errors
- If PNG export fails, fall back to SVG export
- If all exports fail, show error with option to copy raw element data

### Viewport Constraint Edge Cases
- If user somehow scrolls outside bounds (e.g., via keyboard), snap back to valid position
- If topic boundary element is deleted, recreate it on next render

### Theme Detection Errors
- If system theme detection fails, default to light mode
- Listen for theme change events to update dynamically

## Testing Strategy

### Unit Testing
- Test `calculateTopicPosition` function with various indices
- Test `filterElementsByTopic` with mixed element sets
- Test `constrainViewport` with boundary edge cases
- Test jargon highlighting regex matching

### Property-Based Testing
Using fast-check library for TypeScript:

```typescript
import fc from 'fast-check';

// Property 3: Grid position calculation
fc.assert(
  fc.property(fc.nat(100), (topicIndex) => {
    const position = calculateTopicPosition(topicIndex, defaultConfig);
    const expectedX = (topicIndex % 2) * 1700;
    const expectedY = Math.floor(topicIndex / 2) * 1200;
    return position.x === expectedX && position.y === expectedY;
  })
);

// Property 5: Viewport constraint
fc.assert(
  fc.property(
    fc.integer(),
    fc.integer(),
    fc.nat(100),
    (scrollX, scrollY, topicIndex) => {
      const topicPos = calculateTopicPosition(topicIndex, defaultConfig);
      const constrained = constrainViewport(scrollX, scrollY, topicPos);
      return (
        constrained.scrollX >= topicPos.x &&
        constrained.scrollX <= topicPos.x + 1500 &&
        constrained.scrollY >= topicPos.y &&
        constrained.scrollY <= topicPos.y + 1000
      );
    }
  )
);

// Property 8: Canvas state round-trip
fc.assert(
  fc.property(arbitraryCanvasState, async (state) => {
    await saveCanvasState(state);
    const loaded = await loadCanvasState(state.sessionId);
    return deepEqual(state.elements, loaded.elements);
  })
);
```

### Integration Testing
- Test full flow: create element → verify tagging → navigate → verify persistence
- Test message panel collapse/expand with streaming messages
- Test hint modal pagination and generation flow
- Test export functionality with multi-topic sessions

### Visual Regression Testing
- Capture screenshots of overlay positioning at various viewport sizes
- Verify Halloween theme colors in dark mode
- Test message panel collapsed/expanded states


## Implementation Notes

### Excalidraw Integration (Next.js App Router)

```typescript
// components/ExcalidrawWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

export function ExcalidrawWrapper({ ... }) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(null);
  
  return (
    <Excalidraw
      excalidrawAPI={(api) => setExcalidrawAPI(api)}
      zenModeEnabled={true}
      theme={theme}
      handleKeyboardGlobally={false}
      onChange={handleChange}
      initialData={{ elements, appState }}
    />
  );
}
```

### Pointer Events Strategy

```css
/* Overlay container - clicks pass through by default */
.overlay-container {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

/* Interactive overlay elements capture clicks */
.message-panel,
.input-panel,
.navigation-bar,
.hint-button,
.hint-modal {
  pointer-events: auto;
}
```

### Keyboard Event Isolation

```typescript
// In InputPanel component
const handleKeyDown = (e: React.KeyboardEvent) => {
  // Stop propagation to prevent Excalidraw shortcuts
  e.stopPropagation();
  
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    onSubmit();
  }
};
```

### Topic Boundary Creation

```typescript
function createBoundaryElement(topicIndex: number, topicId: string): ExcalidrawElement {
  const pos = calculateTopicPosition(topicIndex, defaultConfig);
  
  return {
    type: 'rectangle',
    x: pos.x,
    y: pos.y,
    width: 1500,
    height: 1000,
    strokeColor: '#cccccc',
    strokeStyle: 'dashed',
    strokeWidth: 2,
    fillStyle: 'solid',
    backgroundColor: 'transparent',
    locked: true,  // Prevent user from moving/deleting
    customData: {
      topicId,
      isBoundary: true,
    },
  };
}
```

### Canvas State Persistence Strategy

Excalidraw's `onChange` fires on every pixel change during drawing. To avoid flooding the database, we only save on explicit user actions:

```typescript
// 1. Keep canvas state in local React state only
const [localElements, setLocalElements] = useState<ExcalidrawElement[]>([]);

// 2. onChange updates local state only (no DB writes)
const handleChange = (elements: ExcalidrawElement[]) => {
  setLocalElements(elements);
};

// 3. Save only on explicit actions
const handleNextTopic = async () => {
  await saveCanvasState({ sessionId, elements: localElements });
  navigateToNextTopic();
};

const handleCompleteSession = async () => {
  await saveCanvasState({ sessionId, elements: localElements });
  navigateToCompletion();
};
```

Save triggers (explicit actions only):
- "Next Topic" button click
- "Complete Session" button click

This keeps the implementation simple and avoids unnecessary database writes.

### Canvas Export for AI

```typescript
async function exportTopicCanvasForAI(
  api: ExcalidrawAPI,
  topicId: string
): Promise<string> {
  const allElements = api.getSceneElements();
  const topicElements = allElements.filter(
    (el) => el.customData?.topicId === topicId && !el.customData?.isBoundary
  );
  
  if (topicElements.length === 0) {
    return createBlankCanvas();
  }
  
  const blob = await exportToBlob({
    elements: topicElements,
    appState: api.getAppState(),
    files: api.getFiles(),
    mimeType: 'image/png',
  });
  
  return blobToBase64(blob);
}
```

### Halloween Theme Colors

```typescript
const halloweenTheme = {
  primary: '#ff6b35',      // Pumpkin orange
  secondary: '#9b59b6',    // Witch purple
  accent: '#2ecc71',       // Slime green
  background: '#1a1a2e',   // Dark purple-black
  surface: '#16213e',      // Slightly lighter
  text: '#eaeaea',
  hint: '#f39c12',         // Golden orange
};
```
