import React from "react";
import { PropertyHealthIndex } from "../../engines/decision/types";
import { Activity, ShieldCheck, HeartPulse, Sparkles, BarChart3, CheckCircle2 } from "lucide-react";

interface PropertyHealthIndexPanelProps {
  propertyHealthIndex: PropertyHealthIndex | null;
}

export default function PropertyHealthIndexPanel({ propertyHealthIndex }: PropertyHealthIndexPanelProps) {
  if (!propertyHealthIndex) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-slate-500">
        <Activity className="w-8 h-8 mx-auto text-slate-400 mb-2 animate-pulse" />
        <p className="text-xs font-semibold">Property Health Index Awaiting Analysis</p>
        <p className="text-[11px] text-slate-400 mt-1">Execute spatial analysis to calculate multi-dimensional health sub-indices</p>
      </div>
    );
  }

  const { overallScore, ratingTier, subIndices, elementHealthScores } = propertyHealthIndex;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "SUPREME_HARMONY":
        return { text: "SUPREME HARMONY", color: "bg-emerald-500 text-white border-emerald-400" };
      case "BALANCED":
        return { text: "BALANCED HARMONY", color: "bg-teal-600 text-white border-teal-500" };
      case "MODERATE_REMEDY_REQ":
        return { text: "MODERATE REMEDY REQ", color: "bg-amber-500 text-slate-950 border-amber-400" };
      case "HIGH_IMBALANCE":
        return { text: "HIGH IMBALANCE", color: "bg-orange-600 text-white border-orange-500" };
      default:
        return { text: "CRITICAL DEFECTS", color: "bg-rose-600 text-white border-rose-500" };
    }
  };

  const badge = getTierBadge(ratingTier);

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      {/* PANEL HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Overall Property Health Index</h3>
            <p className="text-[11px] text-slate-500">8 Multi-Dimensional Spatial Sub-Indices</p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold tracking-wider border ${badge.color}`}>
          {badge.text}
        </span>
      </div>

      {/* OVERALL HEALTH SCORE BANNER */}
      <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Property Health Score
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black font-mono text-emerald-400">{overallScore}%</span>
            <span className="text-xs text-slate-400 font-mono">/ 100% Supreme Ideal</span>
          </div>
        </div>

        <div className="w-24 h-24 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r="38" stroke="#1e293b" strokeWidth="8" fill="transparent" />
            <circle
              cx="48"
              cy="48"
              r="38"
              stroke="#10b981"
              strokeWidth="8"
              strokeDasharray={238}
              strokeDashoffset={238 - (238 * overallScore) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <Sparkles className="w-5 h-5 text-emerald-400 absolute" />
        </div>
      </div>

      {/* 8 SUB-INDICES GRID */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
          8 Spatial Sub-Index Breakdown
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {subIndices.map((sub) => (
            <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{sub.name}</span>
                <span className={`font-mono font-bold ${
                  sub.score >= 80 ? "text-emerald-600" : sub.score >= 60 ? "text-amber-600" : "text-rose-600"
                }`}>
                  {sub.score}%
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    sub.score >= 80 ? "bg-emerald-500" : sub.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${sub.score}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-500 leading-snug">{sub.keyObservation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ELEMENT-LEVEL HEALTH INDEX BREAKDOWN */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
          Individual Element Health Scores
        </span>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-xs">
          {elementHealthScores.map((elem) => (
            <div key={elem.elementId} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-[11px] truncate">{elem.name}</span>
                <span className="text-[9px] text-slate-400 block">{elem.zone}</span>
              </div>
              <span className={`font-bold text-[11px] px-1.5 py-0.5 rounded ${
                elem.healthIndex >= 80 ? "bg-emerald-100 text-emerald-800" :
                elem.healthIndex >= 60 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
              }`}>
                {elem.healthIndex}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
