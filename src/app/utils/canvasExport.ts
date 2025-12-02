/**
 * Canvas Export Utilities
 * Handles exporting Excalidraw canvas elements to base64 PNG format
 */

import { exportTopicCanvasForAI, exportFullCanvasForAI, ExportOptions } from './excalidrawExport';

// Re-export types and functions from excalidrawExport for backwards compatibility
export type { ExportOptions };
export { exportTopicCanvasForAI, exportFullCanvasForAI };

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
 * Export canvas elements to base64 PNG using Excalidraw's export functionality.
 * This is the main export function for AI analysis.
 * 
 * @param elements - Excalidraw elements to export
 * @param options - Export options (backgroundColor, padding, scale)
 * @returns Base64 PNG data URL
 */
export async function exportCanvasToBase64(
  elements: readonly unknown[],
  options: ExportOptions = {}
): Promise<string> {
  const { backgroundColor = '#ffffff', padding = 16 } = options;

  // Filter out deleted elements and boundary markers
  const validElements = (elements as Array<{ isDeleted?: boolean; customData?: { isBoundary?: boolean } }>)
    .filter((el) => !el.isDeleted && !el.customData?.isBoundary);

  // If no elements, return blank canvas
  if (validElements.length === 0) {
    return createBlankCanvas();
  }

  try {
    // Dynamically import Excalidraw export utilities
    const { exportToBlob } = await import('@excalidraw/excalidraw');

    // Create app state for export
    const appState = {
      exportBackground: true,
      exportWithDarkMode: false,
      viewBackgroundColor: backgroundColor,
    };

    // Export to blob
    const blob = await exportToBlob({
      elements: validElements,
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
    // Fallback: return blank canvas on error
    return createBlankCanvas();
  }
}
