'use client';

import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';

interface DrawingCanvasProps {
  onEditorMount: (editor: Editor) => void;
}

export function DrawingCanvas({ onEditorMount }: DrawingCanvasProps) {
  return (
    <div className="h-full bg-white dark:bg-zinc-800">
      <Tldraw onMount={onEditorMount} inferDarkMode />
    </div>
  );
}
