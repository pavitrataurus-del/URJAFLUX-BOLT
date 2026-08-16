import React from "react";
import { Layers } from "lucide-react";

export default function VastuPanchTatvaViewer({ twin }: any) {
  const tatvas = [
    { name: "Water", direction: "North", percentage: 20, status: "balanced", color: "bg-blue-500" },
    { name: "Air", direction: "East", percentage: 18, status: "balanced", color: "bg-emerald-500" },
    { name: "Fire", direction: "South", percentage: 25, status: "excess", color: "bg-rose-500" },
    { name: "Earth", direction: "South-West", percentage: 15, status: "deficient", color: "bg-amber-600" },
    { name: "Space", direction: "Center", percentage: 22, status: "balanced", color: "bg-slate-300" }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Layers className="w-4 h-4 text-purple-400" /> Panch Tatva Distribution
      </div>
      <div className="space-y-3">
        {tatvas.map(t => (
          <div key={t.name} className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs text-slate-200 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${t.color}`} /> {t.name}
              </span>
              <span className="text-[10px] text-slate-500">{t.percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div className={`h-full ${t.color}`} style={{ width: `${t.percentage}%` }} />
            </div>
            <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider">
              <span className="text-slate-500">{t.direction}</span>
              <span className={
                t.status === 'balanced' ? 'text-emerald-500' :
                t.status === 'excess' ? 'text-rose-500' : 'text-amber-500'
              }>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded text-[10px] text-purple-400 text-center">
        Temporary Placeholder. Waiting for PanchTatvaEngine API.
      </div>
    </div>
  );
}
