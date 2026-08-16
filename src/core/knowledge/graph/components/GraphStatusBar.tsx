import React from "react";

export default function GraphStatusBar({ graph, viewState, selectedNode }: any) {
  return (
    <div className="h-8 bg-[#0a101d] border-t border-slate-800 flex items-center justify-between px-4 text-[10px] font-mono text-slate-500 shrink-0">
      <div className="flex items-center gap-4">
        <span>X: {Math.round(viewState.x)} Y: {Math.round(viewState.y)}</span>
        <span>ZOOM: {Math.round(viewState.zoom)}%</span>
      </div>
      <div className="flex items-center gap-4">
        {selectedNode && (
          <span className="text-indigo-400 truncate max-w-[200px]">
            SEL: {selectedNode.id}
          </span>
        )}
        <span>NODES: {graph?.nodes?.length || 0}</span>
        <span>EDGES: {graph?.edges?.length || 0}</span>
      </div>
    </div>
  );
}
