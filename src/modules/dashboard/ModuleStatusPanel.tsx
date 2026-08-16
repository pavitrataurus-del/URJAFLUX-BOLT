import React from "react";
import { Compass, Sparkles, Star, ChevronRight, Activity, Globe } from "lucide-react";

interface ModuleStatusPanelProps {
  hasVastu: boolean;
  hasNumerology: boolean;
  hasLalKitab: boolean;
  vastuCount: number;
  numerologySystem: string;
  lalKitabAscendant: string;
  onNavigateToModule?: (moduleName: string) => void;
}

export const ModuleStatusPanel: React.FC<ModuleStatusPanelProps> = ({
  hasVastu,
  hasNumerology,
  hasLalKitab,
  vastuCount,
  numerologySystem,
  lalKitabAscendant,
  onNavigateToModule
}) => {
  return (
    <div className="bg-white/25 border border-slate-200 rounded-xl p-5 space-y-4" id="module-status-panel">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-950 pb-2.5">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            Integrations & Module Status
          </h4>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Workspace calculation status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Vastu Integration status */}
        <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-col justify-between h-32">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className={`w-4 h-4 ${hasVastu ? "text-emerald-400" : "text-slate-600"}`} />
              <span className="text-xs font-bold text-slate-200 font-sans">Vastu Shastra</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              {hasVastu ? `${vastuCount} Property profile(s) mapped` : "No Property assigned"}
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200/40">
            <span className={`text-[9px] font-mono font-bold ${hasVastu ? "text-emerald-400" : "text-slate-400"}`}>
              {hasVastu ? "● ALIGNED" : "○ PENDING"}
            </span>
            <button
              type="button"
              onClick={() => onNavigateToModule && onNavigateToModule("vastu")}
              className="text-[9px] font-mono font-bold text-emerald-400 hover:text-slate-900 flex items-center cursor-pointer"
            >
              RUN
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Numerology status */}
        <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-col justify-between h-32">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${hasNumerology ? "text-amber-400" : "text-slate-600"}`} />
              <span className="text-xs font-bold text-slate-200 font-sans">Numerology</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              {hasNumerology ? `${numerologySystem} vibrations mapped` : "No core grids generated"}
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200/40">
            <span className={`text-[9px] font-mono font-bold ${hasNumerology ? "text-amber-400" : "text-slate-400"}`}>
              {hasNumerology ? "● COMPUTED" : "○ PENDING"}
            </span>
            <button
              type="button"
              onClick={() => onNavigateToModule && onNavigateToModule("numerology")}
              className="text-[9px] font-mono font-bold text-emerald-400 hover:text-slate-900 flex items-center cursor-pointer"
            >
              RUN
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Lal Kitab status */}
        <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-col justify-between h-32">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${hasLalKitab ? "text-rose-400" : "text-slate-600"}`} />
              <span className="text-xs font-bold text-slate-200 font-sans">Lal Kitab</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              {hasLalKitab ? `${lalKitabAscendant} Kundli mapped` : "Astro chart not calibrated"}
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200/40">
            <span className={`text-[9px] font-mono font-bold ${hasLalKitab ? "text-rose-400" : "text-slate-400"}`}>
              {hasLalKitab ? "● PLOTTED" : "○ PENDING"}
            </span>
            <button
              type="button"
              onClick={() => onNavigateToModule && onNavigateToModule("lalkitab")}
              className="text-[9px] font-mono font-bold text-emerald-400 hover:text-slate-900 flex items-center cursor-pointer"
            >
              RUN
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleStatusPanel;
