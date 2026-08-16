// src/components/lalkitab/MahadashaPanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Clock, Calendar, Compass, ArrowRight } from "lucide-react";

interface MahadashaPanelProps {
  result: LalKitabResult | null;
}

export default function MahadashaPanel({ result }: MahadashaPanelProps) {
  if (!result) return null;

  // Let's identify the currently active Mahadasha based on seed
  // The engine assigns an active Mahadasha index based on seed
  const activeIndex = (result.mahadashas.length > 0) ? (result.traceLogs.length % result.mahadashas.length) : 0;

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            Lal Kitab Mahadasha Cycles
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Vimshottari/Lal Kitab planetary cycles representing major developmental milestones and karmic releases.
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded uppercase">
          ACTIVE CYCLE: {result.mahadashas[activeIndex]?.planet.toUpperCase()}
        </span>
      </div>

      {/* Timeline visual bar */}
      <div className="space-y-3 font-mono text-xs">
        <span className="text-[9px] text-slate-400 uppercase font-bold block">Chronological Timeline Alignment</span>
        
        <div className="w-full flex bg-white h-6 rounded-lg border border-slate-850 overflow-hidden text-[9px] font-bold">
          {result.mahadashas.map((d, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div 
                key={d.planet}
                className={`h-full flex items-center justify-center transition-all ${
                  isActive 
                    ? "bg-emerald-600 text-slate-900 shadow-inner" 
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100/40"
                }`}
                style={{ width: `${100 / result.mahadashas.length}%` }}
                title={`${d.planet} Mahadasha (${d.startAge} - ${d.endAge} years)`}
              >
                {d.planet.slice(0, 3).toUpperCase()}
              </div>
            );
          })}
        </div>

        {/* Detailed cards list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {result.mahadashas.map((d, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div 
                key={d.planet}
                className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                  isActive 
                    ? "bg-emerald-950/40 border-emerald-900/80 text-slate-200 shadow-md" 
                    : "bg-white/30 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex justify-between items-center border-b border-slate-950 pb-1.5 mb-1.5">
                  <span className={`font-bold uppercase ${isActive ? "text-emerald-400" : "text-slate-700"}`}>
                    {d.planet} Cycle
                  </span>
                  {isActive && (
                    <span className="text-[8px] bg-emerald-900 text-emerald-300 font-bold px-1.5 py-0.5 rounded uppercase border border-emerald-800">
                      Current
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px]">Span Age:</span>
                    <span>{d.startAge} - {d.endAge} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px]">Dates:</span>
                    <span>{d.startDate.split(" ")[2]} - {d.endDate.split(" ")[2]}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic mt-2 leading-relaxed border-t border-slate-950/50 pt-1.5">
                  {d.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
