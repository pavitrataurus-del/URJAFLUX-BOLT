// src/components/lalkitab/LifestylePanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Sparkles, Calendar, Heart, ShieldAlert } from "lucide-react";

interface LifestylePanelProps {
  result: LalKitabResult | null;
}

export default function LifestylePanel({ result }: LifestylePanelProps) {
  if (!result) return null;

  const { lifestyle } = result;

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      <div className="border-b border-slate-200 pb-3">
        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          Astro-Behavioral Lifestyle Directives
        </h4>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Planetary balancing through daily habits, weekly observances, and conscious behavioral self-regulation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Daily Practices */}
        <div className="p-4 bg-white/30 border border-slate-200 rounded-lg space-y-2">
          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Daily Practices (Nitya Niyam)
          </span>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-700 leading-relaxed text-[11px]">
            {lifestyle.dailyPractices.map((practice, idx) => (
              <li key={idx}>{practice}</li>
            ))}
          </ul>
        </div>

        {/* Weekly Practices */}
        <div className="p-4 bg-white/30 border border-slate-200 rounded-lg space-y-2">
          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Weekly Observances (Varat)
          </span>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-700 leading-relaxed text-[11px]">
            {lifestyle.weeklyPractices.map((practice, idx) => (
              <li key={idx}>{practice}</li>
            ))}
          </ul>
        </div>

        {/* Monthly Observances */}
        <div className="p-4 bg-white/30 border border-slate-200 rounded-lg space-y-2">
          <span className="text-[9px] text-yellow-500 font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
            Monthly Cycles & Observances
          </span>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-700 leading-relaxed text-[11px]">
            {lifestyle.monthlyObservances.map((practice, idx) => (
              <li key={idx}>{practice}</li>
            ))}
          </ul>
        </div>

        {/* Behavioral Guidance */}
        <div className="p-4 bg-white/30 border border-slate-200 rounded-lg space-y-2">
          <span className="text-[9px] text-rose-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            Behavioral Restrictions (Nishedh)
          </span>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-700 leading-relaxed text-[11px]">
            {lifestyle.behavioralGuidance.map((practice, idx) => (
              <li key={idx}>{practice}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
