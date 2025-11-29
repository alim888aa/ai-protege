import { Editor } from 'tldraw';

export async function exportCanvasToBase64(editor: Editor): Promise<string> {
  // Export canvas as image using Editor's getSvgString method
  const shapeIds = Array.from(editor.getCurrentPageShapeIds());
  
  // If no shapes, return empty data URL
  if (shapeIds.length === 0) {
    // Create a blank 800x600 canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 800, 600);
    }
    return canvas.toDataURL('image/png');
  }
  
  // Get SVG string
  const svg = await editor.getSvgString(shapeIds, {
    background: true,
    padding: 16,
    darkMode: false,
  });

  if (!svg) {
    throw new Error('Failed to export canvas as SVG');
  }

  // Convert SVG string to base64 data URL
  const svgBase64 = btoa(unescape(encodeURIComponent(svg.svg)));
  const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;
  
  // Create an image from SVG data URL and convert to PNG
  const img = new Image();
  img.crossOrigin = 'anonymous'; // Prevent tainted canvas
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = svgDataUrl;
  });

  // Create canvas to convert SVG to PNG
  const canvas = document.createElement('canvas');
  canvas.width = img.width || 800;
  canvas.height = img.height || 600;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(img, 0, 0);

  // Convert canvas directly to base64 data URL
  return canvas.toDataURL('image/png');
}
