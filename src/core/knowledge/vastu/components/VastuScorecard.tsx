import React from "react";
import { BarChart, TrendingUp, AlertTriangle } from "lucide-react";

export default function VastuScorecard({ twin }: any) {
  const scores = [
    { label: "Overall Score", value: 84, color: "text-emerald-400" },
    { label: "Directional Score", value: 92, color: "text-emerald-400" },
    { label: "Room Alignment", value: 78, color: "text-amber-400" },
    { label: "Panch Tatva", value: 65, color: "text-rose-400" },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="text-center p-6 bg-slate-900 border border-slate-800 rounded-lg">
        <BarChart className="w-8 h-8 mx-auto mb-2 text-purple-400" />
        <div className="text-3xl font-light text-slate-100">84<span className="text-lg text-slate-500">/100</span></div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Enterprise Vastu Score</div>
      </div>

      <div className="space-y-3">
        {scores.map((s, idx) => (
          <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/50">
            <span className="text-xs text-slate-400">{s.label}</span>
            <span className={`text-sm font-bold ${s.color}`}>{s.value}%</span>
          </div>
        ))}
      </div>

      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2 mb-1">
          <AlertTriangle className="w-3 h-3" /> Critical Reductions
        </h4>
        <p className="text-[10px] text-amber-400/80 leading-relaxed">
          The low Panch Tatva score (-25%) is heavily influenced by the Fire element excess in the South-East zone.
        </p>
      </div>

      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded text-[10px] text-purple-400 text-center">
        Temporary Placeholder. Waiting for VastuComplianceEngine API.
      </div>
    </div>
  );
}
