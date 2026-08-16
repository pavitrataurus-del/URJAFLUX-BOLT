import React from "react";
import { Maximize, Navigation, BoxSelect } from "lucide-react";

export default function TwinStatusBar({ twin, viewState, selectedObject }: any) {
  return (
    <div className="h-8 bg-[#0a101d] border-t border-slate-800 flex items-center justify-between px-4 text-[10px] font-mono text-slate-500 shrink-0">
      <div className="flex items-center gap-4">
        <span>MODE: {viewState.mode.toUpperCase()}</span>
        <span>X: {Math.round(viewState.x)} Y: {Math.round(viewState.y)}</span>
        <span>ZOOM: {Math.round(viewState.zoom)}%</span>
      </div>
      <div className="flex items-center gap-4">
        {selectedObject && (
          <span className="text-emerald-400 truncate max-w-[200px]">
            SEL: {selectedObject.id}
          </span>
        )}
        <span>UNITS: MM</span>
        <span>OBJS: {twin?.objects?.length || 0}</span>
      </div>
    </div>
  );
}
