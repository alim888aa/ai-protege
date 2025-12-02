/**
 * Topic Area Manager
 * Manages topic positioning and viewport constraints for the infinite canvas
 */

/**
 * Configuration for topic area layout on the infinite canvas
 */
export interface TopicAreaConfig {
  width: number;      // Width of each topic area (default: 1500px)
  height: number;     // Height of each topic area (default: 1000px)
  gap: number;        // Gap between topic areas (default: 200px)
  columns: number;    // Number of columns in the grid (default: 2)
}

/**
 * Position of a topic area on the canvas
 */
export interface TopicPosition {
  x: number;
  y: number;
}

/**
 * Element with custom data for topic tracking
 */
export interface TopicTaggedElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  customData?: {
    topicId?: string;
    isBoundary?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Default configuration for topic areas
 */
export const defaultTopicAreaConfig: TopicAreaConfig = {
  width: 2000,
  height: 1400,
  gap: 200,
  columns: 2,
};

/**
 * Calculate the position of a topic area based on its index in the grid.
 * Topics are arranged in a 2-column grid layout.
 * 
 * @param index - The zero-based index of the topic
 * @param config - Optional configuration override
 * @returns The x,y position of the topic area's top-left corner
 * 
 * @example
 * calculateTopicPosition(0) // { x: 0, y: 0 }
 * calculateTopicPosition(1) // { x: 1700, y: 0 }
 * calculateTopicPosition(2) // { x: 0, y: 1200 }
 * calculateTopicPosition(3) // { x: 1700, y: 1200 }
 */
export function calculateTopicPosition(
  index: number,
  config: TopicAreaConfig = defaultTopicAreaConfig
): TopicPosition {
  const { width, height, gap, columns } = config;
  
  const column = index % columns;
  const row = Math.floor(index / columns);
  
  return {
    x: column * (width + gap),
    y: row * (height + gap),
  };
}

/**
 * Create a boundary element (dashed rectangle) for a topic area.
 * This provides a visual indicator of the recommended drawing area.
 * 
 * @param index - The zero-based index of the topic
 * @param topicId - The unique identifier for the topic
 * @param config - Optional configuration override
 * @returns An Excalidraw rectangle element configured as a boundary
 */
export function createBoundaryElement(
  index: number,
  topicId: string,
  config: TopicAreaConfig = defaultTopicAreaConfig
): TopicTaggedElement {
  const position = calculateTopicPosition(index, config);
  
  return {
    type: 'rectangle',
    id: `boundary-${topicId}`,
    x: position.x,
    y: position.y,
    width: config.width,
    height: config.height,
    angle: 0,
    strokeColor: '#cccccc',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    index: 'a0',
    roundness: null,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: true, // Prevent user from moving/deleting the boundary
    customData: {
      topicId,
      isBoundary: true,
    },
  };
}

/**
 * Filter canvas elements to get only those belonging to a specific topic.
 * Elements are tagged with topicId in their customData attribute.
 * 
 * @param elements - All canvas elements
 * @param topicId - The topic ID to filter by
 * @returns Elements that belong to the specified topic
 */
export function filterElementsByTopic<T extends TopicTaggedElement>(
  elements: readonly T[],
  topicId: string
): T[] {
  return elements.filter((element) => {
    return element.customData?.topicId === topicId;
  });
}

/**
 * Constrain a viewport scroll position to stay within a topic area's boundaries.
 * This prevents users from scrolling outside the current topic area.
 * 
 * In Excalidraw, scroll values are negative offsets from the canvas origin.
 * - scrollX = -100 means the viewport is showing content starting at x=100
 * - To show topic at position (1700, 0), scrollX should be around -1700
 * 
 * We add padding to allow some margin around the topic area.
 * 
 * @param scrollX - Current scroll X position (negative in Excalidraw)
 * @param scrollY - Current scroll Y position (negative in Excalidraw)
 * @param topicIndex - The index of the current topic
 * @param config - Optional configuration override
 * @param viewportPadding - Padding around the topic area (default: 200px)
 * @returns Constrained scroll position
 */
export function constrainViewport(
  scrollX: number,
  scrollY: number,
  topicIndex: number,
  config: TopicAreaConfig = defaultTopicAreaConfig,
  viewportPadding: number = 200
): { scrollX: number; scrollY: number } {
  const topicPos = calculateTopicPosition(topicIndex, config);
  
  // Calculate the allowed scroll range
  // The viewport shows content at position (-scrollX, -scrollY)
  // We want to constrain so the viewport stays within the topic area + padding
  
  // Minimum scroll (most negative) = showing the right/bottom edge of topic area
  const minScrollX = -(topicPos.x + config.width + viewportPadding);
  const minScrollY = -(topicPos.y + config.height + viewportPadding);
  
  // Maximum scroll (least negative/most positive) = showing the left/top edge of topic area
  const maxScrollX = -(topicPos.x - viewportPadding);
  const maxScrollY = -(topicPos.y - viewportPadding);
  
  // Constrain scroll to allowed range
  const constrainedX = Math.max(minScrollX, Math.min(scrollX, maxScrollX));
  const constrainedY = Math.max(minScrollY, Math.min(scrollY, maxScrollY));
  
  return {
    scrollX: constrainedX,
    scrollY: constrainedY,
  };
}

/**
 * Get the bounds of a topic area for viewport calculations.
 * 
 * @param topicIndex - The index of the topic
 * @param config - Optional configuration override
 * @returns The bounds of the topic area
 */
export function getTopicBounds(
  topicIndex: number,
  config: TopicAreaConfig = defaultTopicAreaConfig
): { minX: number; minY: number; maxX: number; maxY: number } {
  const position = calculateTopicPosition(topicIndex, config);
  
  return {
    minX: position.x,
    minY: position.y,
    maxX: position.x + config.width,
    maxY: position.y + config.height,
  };
}
