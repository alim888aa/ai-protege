/**
 * Excalidraw Export Utilities
 * Handles exporting canvas elements to various formats for AI analysis
 */

import { filterElementsByTopic, TopicTaggedElement } from './topicAreaManager';

/**
 * Export options for canvas export
 */
export interface ExportOptions {
  backgroundColor?: string;
  padding?: number;
  scale?: number;
}

/**
 * Creates a blank canvas as base64 PNG
 */
function createBlankCanvas(width = 800, height = 600): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL('image/png');
}

/**
 * Convert a Blob to base64 data URL
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Export topic-specific canvas elements as base64 PNG for AI analysis.
 * Filters elements by the current topic's customData tag OR by position within topic bounds.
 * 
 * @param elements - All canvas elements
 * @param topicId - The topic ID to filter by
 * @param options - Export options
 * @returns Base64 PNG data URL of the filtered elements
 */
export async function exportTopicCanvasForAI(
  elements: readonly unknown[],
  topicId: string,
  options: ExportOptions = {}
): Promise<string> {
  const { backgroundColor = '#ffffff', padding = 16, scale = 1 } = options;

  const typedElements = elements as TopicTaggedElement[];
  
  // First try to filter by topicId tag
  let topicElements = filterElementsByTopic(typedElements, topicId).filter(
    (el) => !el.customData?.isBoundary
  );

  // If no tagged elements found, include ALL non-boundary elements
  // This handles the case where elements haven't been tagged yet
  if (topicElements.length === 0) {
    topicElements = typedElements.filter(
      (el) => !el.customData?.isBoundary && !el.isDeleted
    );
  }

  // If still no elements, return blank canvas
  if (topicElements.length === 0) {
    return createBlankCanvas();
  }

  try {
    // Dynamically import Excalidraw export utilities
    const { exportToBlob } = await import('@excalidraw/excalidraw');

    // Calculate bounds of the topic elements
    const bounds = calculateElementsBounds(topicElements);
    
    // Create app state for export
    const appState = {
      exportBackground: true,
      exportWithDarkMode: false,
      viewBackgroundColor: backgroundColor,
    };

    // Export to blob
    const blob = await exportToBlob({
      elements: topicElements,
      appState,
      files: null,
      mimeType: 'image/png',
      exportPadding: padding,
      quality: 1,
    });

    // Convert blob to base64
    return await blobToBase64(blob);
  } catch (error) {
    console.error('Failed to export canvas:', error);
    // Fallback: try to render elements manually
    return await renderElementsToCanvas(topicElements, { backgroundColor, padding, scale });
  }
}

/**
 * Calculate the bounding box of a set of elements
 */
function calculateElementsBounds(elements: TopicTaggedElement[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    const x = el.x ?? 0;
    const y = el.y ?? 0;
    const width = el.width ?? 0;
    const height = el.height ?? 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Fallback renderer: creates a simple canvas representation of elements
 * Used when Excalidraw's exportToBlob is not available
 */
async function renderElementsToCanvas(
  elements: TopicTaggedElement[],
  options: { backgroundColor: string; padding: number; scale: number }
): Promise<string> {
  const { backgroundColor, padding, scale } = options;
  const bounds = calculateElementsBounds(elements);
  
  const width = Math.max(400, (bounds.width + padding * 2) * scale);
  const height = Math.max(300, (bounds.height + padding * 2) * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return createBlankCanvas();
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw a simple representation of elements
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;

  for (const el of elements) {
    const x = ((el.x ?? 0) - bounds.minX + padding) * scale;
    const y = ((el.y ?? 0) - bounds.minY + padding) * scale;
    const w = (el.width ?? 50) * scale;
    const h = (el.height ?? 50) * scale;

    if (el.type === 'rectangle') {
      ctx.strokeRect(x, y, w, h);
    } else if (el.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.type === 'line' || el.type === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
    } else {
      // Default: draw a rectangle outline
      ctx.strokeRect(x, y, w, h);
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Export all canvas elements (across all topics) as base64 PNG
 * Used for final session export
 */
export async function exportFullCanvasForAI(
  elements: readonly unknown[],
  options: ExportOptions = {}
): Promise<string> {
  const { backgroundColor = '#ffffff', padding = 32 } = options;

  // Filter out boundary elements
  const typedElements = elements as TopicTaggedElement[];
  const contentElements = typedElements.filter((el) => !el.customData?.isBoundary);

  if (contentElements.length === 0) {
    return createBlankCanvas();
  }

  try {
    const { exportToBlob } = await import('@excalidraw/excalidraw');

    const appState = {
      exportBackground: true,
      exportWithDarkMode: false,
      viewBackgroundColor: backgroundColor,
    };

    const blob = await exportToBlob({
      elements: contentElements,
      appState,
      files: null,
      mimeType: 'image/png',
      exportPadding: padding,
      quality: 1,
    });

    return await blobToBase64(blob);
  } catch (error) {
    console.error('Failed to export full canvas:', error);
    return await renderElementsToCanvas(contentElements, { backgroundColor, padding, scale: 1 });
  }
}
