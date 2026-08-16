// src/components/lalkitab/DoshaPanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { ShieldAlert, AlertTriangle, ShieldCheck, Heart } from "lucide-react";

interface DoshaPanelProps {
  result: LalKitabResult | null;
}

export default function DoshaPanel({ result }: DoshaPanelProps) {
  if (!result) return null;

  const activeDoshas = result.doshas.filter((d) => d.present);
  const cleanDoshas = result.doshas.filter((d) => !d.present);

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            Vedic Karmic Afflictions (Doshas)
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Planetary friction or energetic obstructions identified inside the client's natal chart.
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold bg-rose-950/40 text-rose-400 border border-rose-900/40 px-2 py-0.5 rounded uppercase">
          {activeDoshas.length} AFFLICTIONS PRESENT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Active Doshas Column */}
        <div className="space-y-3">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Active Afflictions Requiring Attention</span>

          <div className="space-y-2.5">
            {activeDoshas.map((dosha) => {
              const isCrit = dosha.severity === "Critical";
              return (
                <div 
                  key={dosha.name} 
                  className={`p-3.5 border rounded-lg space-y-2.5 ${
                    isCrit 
                      ? "bg-rose-950/20 border-rose-900/40 text-slate-200" 
                      : "bg-amber-950/10 border-amber-900/30 text-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-slate-950 pb-1.5">
                    <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                      <AlertTriangle className={`w-4 h-4 ${isCrit ? "text-rose-500" : "text-amber-500"}`} />
                      {dosha.name.toUpperCase()}
                    </span>
                    <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase border ${
                      isCrit 
                        ? "bg-rose-950 text-rose-400 border-rose-900/30" 
                        : "bg-amber-950 text-amber-400 border-amber-900/30"
                    }`}>
                      {dosha.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {dosha.description}
                  </p>
                  <div className="text-[10px] bg-slate-50/60 p-2 rounded border border-slate-200 text-emerald-400 leading-tight">
                    <strong className="text-slate-400 block uppercase text-[8px] font-bold mb-0.5">Classic Directive:</strong> 
                    {dosha.remedySummary}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clean Doshas Column */}
        <div className="space-y-3">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Uncompromised Areas (Dormant)</span>

          <div className="space-y-2.5 opacity-60">
            {cleanDoshas.map((dosha) => (
              <div 
                key={dosha.name} 
                className="p-3 bg-white/20 border border-slate-200 rounded-lg space-y-1"
              >
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-400 uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {dosha.name}
                  </span>
                  <span className="text-[8px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase">
                    RESOLVED
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  No critical friction of {dosha.name} discovered in birth coordinates.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
