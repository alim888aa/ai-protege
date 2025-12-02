/**
 * Session Export Utilities
 * Handles exporting the complete canvas session to various formats
 * 
 * Requirements:
 * - 7.2: Export canvas as .excalidraw file
 * - 7.3: Export canvas as PNG or SVG
 * - 7.4: Include all Topic_Areas and their drawings in the export
 */

import { TopicTaggedElement } from './topicAreaManager';

/**
 * Excalidraw file format structure
 * This matches the format expected by excalidraw.com
 */
export interface ExcalidrawFile {
  type: 'excalidraw';
  version: number;
  source: string;
  elements: TopicTaggedElement[];
  appState: {
    gridSize: number | null;
    viewBackgroundColor: string;
  };
  files: Record<string, unknown>;
}

/**
 * Export options for image exports
 */
export interface ImageExportOptions {
  backgroundColor?: string;
  padding?: number;
  scale?: number;
  darkMode?: boolean;
}

/**
 * Filter out boundary elements from the export
 * We want to include all topic content but not the boundary rectangles
 */
function filterContentElements(elements: TopicTaggedElement[]): TopicTaggedElement[] {
  return elements.filter((el) => !el.customData?.isBoundary && !el.isDeleted);
}

/**
 * Export canvas elements to Excalidraw file format (.excalidraw)
 * This creates a JSON file that can be opened in excalidraw.com
 * 
 * @param elements - All canvas elements across all topics
 * @param sessionName - Optional name for the session (used in filename)
 * @returns void - triggers file download
 * 
 * Validates: Requirements 7.2, 7.4
 */
export function exportToExcalidrawFile(
  elements: TopicTaggedElement[],
  sessionName: string = 'ai-protege-session'
): void {
  const contentElements = filterContentElements(elements);
  
  const excalidrawFile: ExcalidrawFile = {
    type: 'excalidraw',
    version: 2,
    source: 'https://ai-protege.app',
    elements: contentElements,
    appState: {
      gridSize: null,
      viewBackgroundColor: '#ffffff',
    },
    files: {},
  };

  const jsonString = JSON.stringify(excalidrawFile, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  downloadBlob(blob, `${sanitizeFilename(sessionName)}.excalidraw`);
}


/**
 * Export canvas elements to PNG format
 * Uses Excalidraw's exportToBlob for high-quality rendering
 * 
 * @param elements - All canvas elements across all topics
 * @param sessionName - Optional name for the session (used in filename)
 * @param options - Export options (background color, padding, scale)
 * @returns Promise<void> - triggers file download
 * 
 * Validates: Requirements 7.3, 7.4
 */
export async function exportToPNG(
  elements: TopicTaggedElement[],
  sessionName: string = 'ai-protege-session',
  options: ImageExportOptions = {}
): Promise<void> {
  const {
    backgroundColor = '#ffffff',
    padding = 32,
    scale = 2,
    darkMode = false,
  } = options;

  const contentElements = filterContentElements(elements);
  
  if (contentElements.length === 0) {
    throw new Error('No elements to export');
  }

  try {
    const { exportToBlob } = await import('@excalidraw/excalidraw');

    const appState = {
      exportBackground: true,
      exportWithDarkMode: darkMode,
      viewBackgroundColor: backgroundColor,
      exportScale: scale,
    };

    const blob = await exportToBlob({
      elements: contentElements,
      appState,
      files: null,
      mimeType: 'image/png',
      exportPadding: padding,
      quality: 1,
    });

    downloadBlob(blob, `${sanitizeFilename(sessionName)}.png`);
  } catch (error) {
    console.error('Failed to export PNG:', error);
    // Fallback to canvas-based export
    await exportToPNGFallback(contentElements, sessionName, options);
  }
}




/**
 * Fallback PNG export using canvas rendering
 * Used when Excalidraw's exportToBlob is not available
 */
async function exportToPNGFallback(
  elements: TopicTaggedElement[],
  sessionName: string,
  options: ImageExportOptions
): Promise<void> {
  const { backgroundColor = '#ffffff', padding = 32, scale = 2 } = options;
  
  const bounds = calculateElementsBounds(elements);
  const width = Math.max(400, (bounds.width + padding * 2) * scale);
  const height = Math.max(300, (bounds.height + padding * 2) * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw simple representation of elements
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2 * scale;

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
      ctx.strokeRect(x, y, w, h);
    }
  }

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `${sanitizeFilename(sessionName)}.png`);
    }
  }, 'image/png');
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
 * Trigger a file download in the browser
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize a string for use as a filename
 * Removes or replaces characters that are invalid in filenames
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100) || 'export';
}
