import React, { useState } from "react";
import { Maximize2, Layers, Compass, Eye, EyeOff } from "lucide-react";
import { IDigitalTwin } from "../../digital_twin/models/TwinModels";

export default function VastuDigitalTwinOverlay({ twin, selectedRoomId }: any) {
  const [showZones, setShowZones] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDirections, setShowDirections] = useState(true);

  return (
    <div className="flex-1 relative bg-[#05080f] flex items-center justify-center overflow-hidden">
      
      {/* TEMPORARY PLACEHOLDER FOR THE CANVAS */}
      <div className="relative w-[500px] h-[500px] border border-slate-800 rounded-full flex items-center justify-center">
        {showGrid && (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-20" />
        )}
        
        {showDirections && (
          <div className="absolute inset-0 border-2 border-slate-700 rounded-full opacity-50" />
        )}

        {showZones && (
          <>
            <div className="absolute top-4 text-xs font-bold text-slate-500 uppercase">North</div>
            <div className="absolute bottom-4 text-xs font-bold text-slate-500 uppercase">South</div>
            <div className="absolute left-4 text-xs font-bold text-slate-500 uppercase">West</div>
            <div className="absolute right-4 text-xs font-bold text-slate-500 uppercase">East</div>
            <div className="absolute top-12 right-12 text-xs font-bold text-slate-500 uppercase">NE</div>
            <div className="absolute bottom-12 right-12 text-xs font-bold text-slate-500 uppercase">SE</div>
            <div className="absolute top-12 left-12 text-xs font-bold text-slate-500 uppercase">NW</div>
            <div className="absolute bottom-12 left-12 text-xs font-bold text-slate-500 uppercase">SW</div>
          </>
        )}

        <Compass className={`w-32 h-32 text-purple-500/20 ${showDirections ? 'animate-[spin_60s_linear_infinite]' : ''}`} />
        
        {/* Render simple blocks for rooms if available */}
        {twin?.objects?.filter((o:any) => o.type === "room").map((room:any, idx:number) => (
          <div 
            key={room.id}
            className={`absolute px-2 py-1 border rounded text-[8px] font-bold transition-all ${
              selectedRoomId === room.id ? "bg-purple-500/30 border-purple-500 text-purple-200 z-10 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "bg-slate-800/50 border-slate-700 text-slate-400"
            }`}
            style={{
              top: `${20 + (idx * 15)}%`,
              left: `${20 + (idx * 10)}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {room.name}
          </div>
        ))}

      </div>

      {/* FLOATING CONTROLS */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0a101d] border border-slate-700 shadow-xl rounded-lg p-1.5 flex gap-1 z-20">
        <button 
          onClick={() => setShowZones(!showZones)}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${showZones ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-slate-800 text-slate-400'}`}
          title="Toggle Zones"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setShowDirections(!showDirections)}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${showDirections ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-slate-800 text-slate-400'}`}
          title="Toggle Directions"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setShowGrid(!showGrid)}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${showGrid ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-slate-800 text-slate-400'}`}
          title="Toggle Grid"
        >
          {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <div className="w-px h-6 bg-slate-700 my-auto mx-1" />
        <button className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
