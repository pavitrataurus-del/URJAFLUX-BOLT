// src/components/numerology/PinnaclesPanel.tsx
import React from "react";
import { NumerologyResult } from "./numerologyEngine";
import { Compass, Calendar, ArrowRight, Star } from "lucide-react";

interface PinnaclesPanelProps {
  result: NumerologyResult | null;
}

export default function PinnaclesPanel({ result }: PinnaclesPanelProps) {
  if (!result) return null;

  const { p1, p2, p3, p4 } = result.pinnacles;

  const pinnacleInterpretations: Record<number, string> = {
    1: "A phase of extreme self-reliance, leadership, and starting new foundations. You are called to overcome insecurity and stand alone as a pioneer.",
    2: "A phase demanding high cooperation, diplomacy, partnership, and patience. Focus on building relational harmony, details, and intuitive understanding.",
    3: "A highly creative, social, and expressive phase. Excellent for artistic growth, public speaking, writing, and cultivating joyful abundance.",
    4: "A structured, pragmatic, and serious phase. Demands hard work, organization, systematic planning, and building secure foundations for others.",
    5: "A rapid, dynamic phase of change, adventure, travel, and personal freedom. High versatility is required to harness sudden shifts and adaptation.",
    6: "A protective, home-centered phase of duty, service, domestic healing, and counseling. Beautiful for family, artistic design, and community nurturing.",
    7: "A quiet, reflective phase of intense self-study, research, spiritual purification, and specialization. Thrives in introspection and avoiding material traps.",
    8: "An intense phase of material leadership, career execution, financial organization, and karmic justice. Focus on sovereign discipline and masterly wealth.",
    9: "A phase of global completion, philanthropic service, artistic excellence, and universal compassion. Requires letting go of old cycles and embracing all humanity.",
    11: "A Master Pinnacle of high spiritual illumination, prophetic communication, and teaching. Intuition is highly amplified, serving as an inspiration to others.",
    22: "A Master Pinnacle of massive physical construction and global enterprise. Empowered to manifest extraordinary spiritual concepts into enduring reality."
  };

  const pinnaclesList = [
    { id: 1, label: "FIRST PINNACLE (YOUTH)", val: p1.value, startAge: p1.startAge, endAge: p1.endAge, color: "border-emerald-900/40 text-emerald-400 bg-emerald-950/10" },
    { id: 2, label: "SECOND PINNACLE (DEVELOPMENT)", val: p2.value, startAge: p2.startAge, endAge: p2.endAge, color: "border-emerald-900/40 text-emerald-400 bg-emerald-950/10" },
    { id: 3, label: "THIRD PINNACLE (WISDOM)", val: p3.value, startAge: p3.startAge, endAge: p3.endAge, color: "border-purple-900/40 text-purple-400 bg-purple-950/10" },
    { id: 4, label: "FOURTH PINNACLE (LEGACY)", val: p4.value, startAge: p4.startAge, endAge: p4.endAge === 99 ? "End of Life" : p4.endAge, color: "border-rose-900/40 text-rose-400 bg-rose-950/10" }
  ];

  return (
    <div className="bg-white/40 border border-slate-200 rounded-xl p-5 space-y-5">
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-400" />
          The Four Pinnacle Pillars
        </h3>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Temporal phases of dynamic focus, spiritual opportunity, and active manifestation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        {pinnaclesList.map((p) => (
          <div key={p.id} className="p-4 bg-slate-50/60 border border-slate-200 hover:border-slate-850 rounded-xl transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold tracking-wider">{p.label}</span>
                <span className="text-[9.5px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.2 rounded">
                  P{p.id}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{p.val}</span>
                <span className="text-[10px] text-slate-400 font-medium">Vibration</span>
              </div>

              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                AGE: {p.startAge} <ArrowRight className="w-3 h-3 text-slate-700" /> {p.endAge}
              </p>

              <p className="text-slate-400 text-[10.5px] leading-relaxed border-t border-slate-200 pt-3">
                {pinnacleInterpretations[p.val] || "Represents an active developmental era focusing on high-frequency integration and growth."}
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8px] tracking-widest text-slate-400 uppercase font-bold bg-white px-2 py-0.5 rounded w-max border border-slate-850">
              <Star className="w-2.5 h-2.5 text-emerald-400" />
              <span>Pinnacle Cycle {p.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
