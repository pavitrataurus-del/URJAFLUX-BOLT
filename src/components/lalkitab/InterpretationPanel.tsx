// src/components/lalkitab/InterpretationPanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Brain, Sparkles, BookOpen } from "lucide-react";

interface InterpretationPanelProps {
  result: LalKitabResult | null;
}

export default function InterpretationPanel({ result }: InterpretationPanelProps) {
  if (!result) return null;

  // Derive active dasha planet
  const activeMahaIdx = (result.mahadashas.length > 0) ? (result.traceLogs.length % result.mahadashas.length) : 0;
  const activePlanetName = result.mahadashas[activeMahaIdx]?.planet || "Jupiter";

  // Derive active doshas list
  const activeDoshasNames = result.doshas.filter((d) => d.present).map((d) => d.name);

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-lg text-xs font-mono">
      <div className="border-b border-slate-200 pb-2">
        <h5 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-yellow-500 animate-pulse" />
          INTERPRETIVE WISDOM (TEWA SUMMARY)
        </h5>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Synthesized insights compiled from planetary houses, friendly nodes, and ongoing Gochar.
        </p>
      </div>

      <div className="space-y-3.5">
        {/* Core personality insight */}
        <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
          <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
            Core Soul Archetype
          </span>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            Ascendant in <strong className="text-slate-200">{result.birthDetails.ascendant}</strong> coupled with Nakshatra <strong className="text-slate-200">{result.birthDetails.nakshatra}</strong> suggests a deeply analytical and goal-oriented focus. The natural leadership impulses are active, but must be regulated to prevent interpersonal friction.
          </p>
        </div>

        {/* Dasha insight */}
        <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 uppercase">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            Dasha Cycle Influence
          </span>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            The active <strong className="text-emerald-400">{activePlanetName} Mahadasha</strong> is highlighting professional and spiritual transformations. This is a favorable phase for building infrastructure, conducting charity, and acquiring real estate. Ensure that remedies for any afflicted planets are conducted.
          </p>
        </div>

        {/* Vulnerability warning */}
        {activeDoshasNames.length > 0 && (
          <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg space-y-1">
            <span className="text-[9px] text-rose-400 font-bold uppercase">Critical Karmic Warnings</span>
            <p className="text-slate-400 text-[11px] leading-normal">
              The presence of <strong className="text-rose-300">{activeDoshasNames.join(", ")}</strong> requires proactive mitigation. Avoid risky partnerships and speculatory financial activities. Priority should be given to daily and weekly practices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
