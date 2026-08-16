import React, { useEffect, useState } from "react";
import { engineAdapter } from "../../../core/adapters/EngineAdapter";

export interface CompassHUDProps {
  rotation?: number;
  isLocked?: boolean;
  isActive?: boolean;
  visible?: boolean;
}

export function CompassHUD({ rotation: propRotation, isActive, visible }: CompassHUDProps) {
  const [, setRevision] = useState(0);

  useEffect(() => {
    const handleDirChange = () => setRevision(r => r + 1);
    const sub = engineAdapter.subscribe("DIRECTION_CHANGED", handleDirChange);
    return () => engineAdapter.unsubscribe(sub);
  }, []);

  if (!visible) return null;

  // Primary direction request from DirectionEngine
  let displayRotation = propRotation ?? 0;
  try {
    const dirEngine = engineAdapter.getDirectionEngine();
    if (dirEngine) {
      displayRotation = dirEngine.getUserNorth();
    }
  } catch {
    displayRotation = propRotation ?? 0;
  }

  return (
    <div className="absolute top-4 right-4 pointer-events-none select-none z-50 flex flex-col items-center justify-center">
      {/* Rotating Inner Rose - No large backgrounds or cards */}
      <div 
        className="relative w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-75 ease-linear"
        style={{ transform: `rotate(${displayRotation}deg)` }}
      >
        {/* Cardinal Letters */}
        <span className="absolute top-0 text-[9px] font-black text-rose-500 tracking-wider">N</span>
        <span className="absolute right-0 text-[8px] font-black text-slate-300">E</span>
        <span className="absolute bottom-0 text-[8px] font-black text-slate-300">S</span>
        <span className="absolute left-0 text-[8px] font-black text-slate-300">W</span>
        
        {/* Dial Crosshairs */}
        <div className="absolute w-[1px] h-full bg-slate-500/40" />
        <div className="absolute h-[1px] w-full bg-slate-500/40" />
        
        {/* Compass Needle */}
        <svg className="w-10 h-10 pointer-events-none drop-shadow" viewBox="0 0 100 100">
          <polygon points="50,15 60,50 50,85 40,50" fill="#0f172a" />
          <polygon points="50,15 60,50 50,50" fill="#ef4444" />
          <polygon points="50,15 40,50 50,50" fill="#f87171" />
          <polygon points="50,85 60,50 50,50" fill="#94a3b8" />
          <polygon points="50,85 40,50 50,50" fill="#cbd5e1" />
          <circle cx="50" cy="50" r="4" fill="#fbbf24" />
          <circle cx="50" cy="50" r="2" fill="#0f172a" />
        </svg>
      </div>

      {/* Angle */}
      <div className="mt-1">
        <span className="text-[10px] font-mono font-bold text-emerald-400 drop-shadow-md">{Math.round(displayRotation)}°</span>
      </div>
    </div>
  );
}
