// src/components/lalkitab/RemediesPanel.tsx
import React, { useState } from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { ShieldCheck, Filter, ArrowUpRight, Flame, Heart } from "lucide-react";

interface RemediesPanelProps {
  result: LalKitabResult | null;
}

export default function RemediesPanel({ result }: RemediesPanelProps) {
  const [filterType, setFilterType] = useState<"all" | "Planet" | "House" | "Dosha">("all");

  if (!result) return null;

  const filteredRemedies = filterType === "all" 
    ? result.remedies 
    : result.remedies.filter((r) => r.type === filterType);

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Lal Kitab Remedial Directives
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Low-cost behavior modifications and actions designed to trigger positive planetary alignment.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-1 bg-white p-1 border border-slate-850 rounded-lg text-[10px] font-mono">
          {[
            { id: "all", label: "ALL REMEDIES" },
            { id: "Planet", label: "PLANETS" },
            { id: "House", label: "HOUSES" },
            { id: "Dosha", label: "DOSHAS" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-2 py-1 rounded font-bold transition-all ${
                filterType === tab.id
                  ? "bg-slate-50 text-emerald-400 border border-slate-200"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Remedies List */}
      <div className="space-y-3 font-mono text-xs">
        {filteredRemedies.map((remedy) => {
          const isHigh = remedy.priority === "High";
          return (
            <div 
              key={remedy.id} 
              className={`p-4 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isHigh 
                  ? "bg-rose-950/10 border-rose-900/30 text-slate-200" 
                  : "bg-white/30 border-slate-200 text-slate-400"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    remedy.type === "Planet" 
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" 
                      : remedy.type === "House" 
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" 
                      : "bg-amber-950/40 text-amber-400 border border-amber-900/40"
                  }`}>
                    {remedy.type}: {remedy.target}
                  </span>
                  
                  <span className={`text-[9px] font-bold ${isHigh ? "text-rose-500 animate-pulse" : "text-slate-400"}`}>
                    [{remedy.priority} PRIORITY]
                  </span>
                </div>

                <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                  {remedy.description}
                </p>

                <div className="flex items-start gap-1 text-[10px] text-slate-400">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-400">Expected Benefit:</strong> {remedy.expectedBenefit}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded bg-slate-50 border border-slate-200 ${
                  remedy.severity === "High" ? "text-rose-400" : "text-slate-400"
                }`}>
                  Severity: {remedy.severity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
