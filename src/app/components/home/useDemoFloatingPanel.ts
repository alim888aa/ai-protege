'use client';

import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useRef, useState } from 'react';

type ResizeEdge = 'bottom-left' | 'top-right';

interface FloatingPanelOptions {
  height: number;
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
  resizeEdge: ResizeEdge;
  width: number;
}

interface DragSession {
  containerBottom: number;
  containerLeft: number;
  containerRight: number;
  containerTop: number;
  panelHeight: number;
  panelLeft: number;
  panelTop: number;
  panelWidth: number;
  pointerId: number;
  startOffsetX: number;
  startOffsetY: number;
  startX: number;
  startY: number;
}

interface ResizeSession {
  maxHeight: number;
  maxWidth: number;
  pointerId: number;
  startHeight: number;
  startWidth: number;
  startX: number;
  startY: number;
}

interface PanelStyle extends CSSProperties {
  '--demo-panel-height': string;
}

export function useDemoFloatingPanel<T extends HTMLElement>(options: FloatingPanelOptions) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: options.width, height: options.height });
  const panelRef = useRef<T | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const resizeSessionRef = useRef<ResizeSession | null>(null);

  function startDrag(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0 || !panelRef.current) return;

    const panelRect = panelRef.current.getBoundingClientRect();
    const containerRect = panelRef.current.offsetParent?.getBoundingClientRect();
    if (!containerRect) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragSessionRef.current = {
      containerBottom: containerRect.bottom,
      containerLeft: containerRect.left,
      containerRight: containerRect.right,
      containerTop: containerRect.top,
      panelHeight: panelRect.height,
      panelLeft: panelRect.left,
      panelTop: panelRect.top,
      panelWidth: panelRect.width,
      pointerId: event.pointerId,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function moveDrag(event: ReactPointerEvent<HTMLElement>) {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const desiredX = session.startOffsetX + event.clientX - session.startX;
    const desiredY = session.startOffsetY + event.clientY - session.startY;
    const minX = session.startOffsetX + session.containerLeft + 4 - session.panelLeft;
    const maxX = session.startOffsetX + session.containerRight - 4 - session.panelLeft - session.panelWidth;
    const minY = session.startOffsetY + session.containerTop + 4 - session.panelTop;
    const maxY = session.startOffsetY + session.containerBottom - 4 - session.panelTop - session.panelHeight;

    setOffset({
      x: Math.max(minX, Math.min(maxX, desiredX)),
      y: Math.max(minY, Math.min(maxY, desiredY)),
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLElement>) {
    if (dragSessionRef.current?.pointerId !== event.pointerId) return;
    dragSessionRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function startResize(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0 || !panelRef.current) return;

    const panelRect = panelRef.current.getBoundingClientRect();
    const containerRect = panelRef.current.offsetParent?.getBoundingClientRect();
    if (!containerRect) return;

    const availableWidth =
      options.resizeEdge === 'bottom-left'
        ? panelRect.right - containerRect.left - 4
        : containerRect.right - panelRect.left - 4;
    const availableHeight =
      options.resizeEdge === 'bottom-left'
        ? containerRect.bottom - panelRect.top - 4
        : panelRect.bottom - containerRect.top - 4;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeSessionRef.current = {
      maxHeight: Math.min(options.maxHeight, availableHeight),
      maxWidth: Math.min(options.maxWidth, availableWidth),
      pointerId: event.pointerId,
      startHeight: size.height,
      startWidth: size.width,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function moveResize(event: ReactPointerEvent<HTMLElement>) {
    const session = resizeSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const widthDelta = options.resizeEdge === 'bottom-left' ? session.startX - event.clientX : event.clientX - session.startX;
    const heightDelta = options.resizeEdge === 'bottom-left' ? event.clientY - session.startY : session.startY - event.clientY;

    setSize({
      width: Math.max(options.minWidth, Math.min(session.maxWidth, session.startWidth + widthDelta)),
      height: Math.max(options.minHeight, Math.min(session.maxHeight, session.startHeight + heightDelta)),
    });
  }

  function endResize(event: ReactPointerEvent<HTMLElement>) {
    if (resizeSessionRef.current?.pointerId !== event.pointerId) return;
    resizeSessionRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const style: PanelStyle = {
    '--demo-panel-height': `${size.height}px`,
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    width: `min(${size.width}px, calc(100% - 24px))`,
  };

  return {
    dragHandleProps: {
      onPointerCancel: endDrag,
      onPointerDown: startDrag,
      onPointerMove: moveDrag,
      onPointerUp: endDrag,
    },
    panelRef,
    resizeHandleProps: {
      onPointerCancel: endResize,
      onPointerDown: startResize,
      onPointerMove: moveResize,
      onPointerUp: endResize,
    },
    style,
  };
}
