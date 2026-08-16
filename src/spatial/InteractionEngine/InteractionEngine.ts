import React, { useRef, useState, useCallback } from "react";
import { CoordinateEngine } from "../CoordinateEngine/CoordinateEngine";

export interface InteractionConfig {
  onPan?: (dx: number, dy: number) => void;
  onZoom?: (deltaY: number, clientX: number, clientY: number) => void;
  onSelect?: (id: string | null) => void;
  onObjectDrag?: (dx: number, dy: number) => void;
  onObjectDragEnd?: () => void;
}

export function useInteractionEngine(config: InteractionConfig, pan: {x: number, y: number}, zoom: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Basic drag start
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    
    // Default action is Pan if middle mouse or spacebar (to be extended)
    if (config.onPan) {
      config.onPan(dx, dy);
    }
    
    setLastPos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastPos, config]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey && config.onZoom) {
      e.preventDefault();
      config.onZoom(e.deltaY, e.clientX, e.clientY);
    }
  }, [config]);

  return {
    containerRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onWheel: handleWheel,
    }
  };
}
