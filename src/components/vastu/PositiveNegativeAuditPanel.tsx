import React, { useState } from "react";
import { PositiveNegativeAudit } from "../../engines/decision/types";
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, ThumbsUp, ThumbsDown } from "lucide-react";

interface PositiveNegativeAuditPanelProps {
  audit: PositiveNegativeAudit | null;
}

export default function PositiveNegativeAuditPanel({ audit }: PositiveNegativeAuditPanelProps) {
  const [activeTab, setActiveTab] = useState<"strengths" | "defects">("strengths");

  if (!audit) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-slate-500">
        <Scale className="w-8 h-8 mx-auto text-slate-400 mb-2 animate-pulse" />
        <p className="text-xs font-semibold">Positive + Negative Audit Engine Awaiting Input</p>
        <p className="text-[11px] text-slate-400 mt-1">Run spatial analysis to extract layout strengths and energy defects</p>
      </div>
    );
  }

  const { positiveStrengths, negativeDefects, summary } = audit;

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      {/* PANEL HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Positive + Negative Audit Engine</h3>
            <p className="text-[11px] text-slate-500">Balanced Spatial Property Strengths & Defects</p>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="font-bold text-emerald-600">{summary.harmonyRatioPercent}% Strengths</span>
          <span className="text-slate-400 text-[10px] block">Net Spatial Ratio</span>
        </div>
      </div>

      {/* SUMMARY BAR */}
      <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-400">
            <ThumbsUp className="w-4 h-4" />
            <span className="font-bold">{summary.totalStrengths} Strengths</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-rose-400">
            <ThumbsDown className="w-4 h-4" />
            <span className="font-bold">{summary.totalDefects} Defects</span>
          </div>
        </div>
        <span className="text-slate-300 text-[11px] font-sans italic">{summary.verdict}</span>
      </div>

      {/* TAB SELECTOR */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1">
        <button
          onClick={() => setActiveTab("strengths")}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "strengths"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Spatial Strengths ({positiveStrengths.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("defects")}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "defects"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Spatial Defects ({negativeDefects.length})</span>
        </button>
      </div>

      {/* STRENGTHS LIST */}
      {activeTab === "strengths" && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {positiveStrengths.map((str) => (
            <div key={str.id} className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{str.title}</span>
                </span>
                <span className="font-mono text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  +{str.harmonyContributionScore}% Score
                </span>
              </div>
              <p className="text-emerald-800 text-[11px]">{str.description}</p>
              <div className="text-[10px] font-mono text-emerald-600 pt-0.5">
                Canon: {str.canonReference} | Zone: {str.zone}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DEFECTS LIST */}
      {activeTab === "defects" && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {negativeDefects.map((def) => (
            <div key={def.id} className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{def.title}</span>
                </span>
                <span className="font-mono text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-bold">
                  -{def.scoreDeduction}% Score
                </span>
              </div>
              <p className="text-rose-800 text-[11px]">{def.description}</p>
              <div className="p-2 bg-white rounded border border-rose-200 text-[11px] text-slate-800 font-semibold mt-1">
                <span className="text-[10px] text-rose-700 block font-mono">Non-Demolition Remedy:</span>
                <span>{def.remedyAction}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
