// src/components/lalkitab/CalculationTracePanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Cpu, CheckCircle } from "lucide-react";

interface CalculationTracePanelProps {
  result: LalKitabResult | null;
}

export default function CalculationTracePanel({ result }: CalculationTracePanelProps) {
  if (!result) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center py-8 text-slate-400 font-mono text-xs">
        No active trace available. Compute birth data first.
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-lg text-xs font-mono">
      <div className="border-b border-slate-200 pb-2">
        <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          CALCULATION LOGGER & EXECUTIONS
        </h5>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Diagnostics, seed states, and raw mathematical derivations calculated by the Lal Kitab Engine.
        </p>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {result.traceLogs.map((log, index) => {
          return (
            <div 
              key={index} 
              className="p-2 bg-white/40 border border-slate-200/60 rounded text-[10px] text-slate-700 leading-normal flex items-start gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{log}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
