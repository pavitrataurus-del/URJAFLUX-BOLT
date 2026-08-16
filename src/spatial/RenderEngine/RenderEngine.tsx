import React from "react";

export interface RenderLayer {
  id: string;
  zIndex: number;
  visible: boolean;
  opacity?: number;
  content: React.ReactNode;
}

export interface RenderEngineProps {
  layers: RenderLayer[];
}

/**
 * RenderEngine
 * Strictly responsible for Z-Index ordering, opacity, and layer visibility.
 * Takes a list of configured layers and renders them in order.
 */
export function RenderEngine({ layers }: RenderEngineProps) {
  // Sort layers by zIndex to ensure deterministic rendering order
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sortedLayers.map(layer => {
        if (!layer.visible) return null;
        
        return (
          <div 
            key={layer.id}
            style={{ 
              zIndex: layer.zIndex,
              opacity: layer.opacity !== undefined ? layer.opacity : 1,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none' // Let individual children handle pointer events
            }}
          >
            {layer.content}
          </div>
        );
      })}
    </>
  );
}
