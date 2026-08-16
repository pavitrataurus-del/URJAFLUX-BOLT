import React from "react";
import { Activity } from "lucide-react";

export default function ReasoningStatusBar({ loading, results }: any) {
  return (
    <div className="h-8 bg-[#0a101d] border-t border-slate-800 flex items-center justify-between px-4 text-[10px] font-mono text-slate-500 shrink-0">
      <div className="flex items-center gap-4">
        {loading ? (
          <span className="flex items-center gap-1.5 text-purple-400">
            <Activity className="w-3 h-3 animate-spin" /> RUNNING REASONING ENGINE...
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM IDLE
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span>EXPERTS: {results?.length || 0}</span>
        <span>PIPELINE: {loading ? 'PROCESSING' : 'READY'}</span>
      </div>
    </div>
  );
}
