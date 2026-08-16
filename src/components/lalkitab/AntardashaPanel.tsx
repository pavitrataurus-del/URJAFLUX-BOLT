// src/components/lalkitab/AntardashaPanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Clock, Layers, Calendar, ChevronRight } from "lucide-react";

interface AntardashaPanelProps {
  result: LalKitabResult | null;
}

export default function AntardashaPanel({ result }: AntardashaPanelProps) {
  if (!result) return null;

  // Let's identify the active Mahadasha based on trace logs
  const activeMahaIdx = (result.mahadashas.length > 0) ? (result.traceLogs.length % result.mahadashas.length) : 0;
  const activeMaha = result.mahadashas[activeMahaIdx];

  // Active Antardasha under active Mahadasha
  const activeAntarIdx = (result.antardashas.length > 0) ? (result.birthDetails.pada % result.antardashas.length) : 0;

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Lal Kitab Antardasha Matrix
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Active sub-planetary periods modifying the principal Mahadasha frequency of {activeMaha?.planet}.
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-900 px-2.5 py-0.5 rounded uppercase">
          Parent: {activeMaha?.planet.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        <span className="text-[9px] text-slate-400 uppercase font-bold block">
          SUB-TIMELINE PHASES UNDER {activeMaha?.planet.toUpperCase()}
        </span>

        {/* Chronology stack */}
        <div className="space-y-2">
          {result.antardashas.map((ant, idx) => {
            const isActive = idx === activeAntarIdx;
            return (
              <div 
                key={ant.planet}
                className={`p-3 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isActive 
                    ? "bg-emerald-950/30 border-emerald-900/60 text-slate-200" 
                    : "bg-white/30 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-ping" : "bg-slate-100"}`} />
                  <div>
                    <span className="font-bold text-slate-700 block">
                      {activeMaha?.planet} → {ant.planet}
                    </span>
                    <span className="text-[10px] text-slate-400">{ant.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div className="text-[11px]">
                    <span className="text-slate-400 text-[10px] block">AGE SPAN</span>
                    <span className="font-bold text-slate-700">{ant.startAge} - {ant.endAge} Yrs</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-700"}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
