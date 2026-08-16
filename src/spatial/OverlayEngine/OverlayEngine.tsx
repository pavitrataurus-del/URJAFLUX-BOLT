import React from "react";

export interface OverlayEngineProps {
  children?: React.ReactNode;
  width: number;
  height: number;
  blueprintUrl?: string | null;
}

/**
 * OverlayEngine
 * Responsible for rendering all spatial overlays (Chakra, Zones, Annotations) 
 * strictly attached to the Blueprint coordinate system.
 */
export function OverlayEngine({ children, width, height, blueprintUrl }: OverlayEngineProps) {
  if (!blueprintUrl) return null;

  return (
    <div 
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Vastu Overlays, Zones, and Annotations go here, rendered in Blueprint local space */}
      {children}
    </div>
  );
}
