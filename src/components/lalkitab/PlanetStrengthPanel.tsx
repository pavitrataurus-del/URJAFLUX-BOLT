// src/components/lalkitab/PlanetStrengthPanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Activity, Flame, ShieldAlert, Sparkles } from "lucide-react";

interface PlanetStrengthPanelProps {
  result: LalKitabResult | null;
}

export default function PlanetStrengthPanel({ result }: PlanetStrengthPanelProps) {
  if (!result) return null;

  // Sort planets by strength
  const sortedPlanets = [...result.planets].sort((a, b) => b.strength - a.strength);
  const strongest = sortedPlanets[0];
  const weakest = sortedPlanets[sortedPlanets.length - 1];

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-5 shadow-xl">
      <div className="border-b border-slate-200 pb-3">
        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
          Planetary Frequencies & Strength Ranking
        </h4>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Relative comparisons of vibrational strengths across all 9 primary planets in Lal Kitab.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start font-mono text-xs">
        {/* Ranked Strengths List (7 columns) */}
        <div className="md:col-span-7 space-y-3">
          {sortedPlanets.map((p, idx) => {
            return (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-slate-700">
                    #{idx + 1} {p.name.toUpperCase()}
                  </span>
                  <span className="text-slate-400 font-bold">{p.strength}%</span>
                </div>
                
                <div className="relative w-full h-3 bg-white rounded-full border border-slate-850 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      p.strength >= 80 
                        ? "bg-emerald-500" 
                        : p.strength >= 70 
                        ? "bg-emerald-500" 
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${p.strength}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight Insights (5 columns) */}
        <div className="md:col-span-5 space-y-4">
          {/* Strongest */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg space-y-1">
            <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Highest Frequency Node
            </span>
            <p className="text-slate-200 font-bold text-sm">
              {strongest.name.toUpperCase()} (Strength: {strongest.strength}%)
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed italic mt-1">
              Currently driving maximum positive manifestation. Acts as a core energetic anchor for client remedies.
            </p>
          </div>

          {/* Weakest */}
          <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg space-y-1">
            <span className="text-[9px] text-rose-400 font-bold flex items-center gap-1 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              Lowest Frequency Node
            </span>
            <p className="text-slate-200 font-bold text-sm">
              {weakest.name.toUpperCase()} (Strength: {weakest.strength}%)
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed italic mt-1">
              This node represents weak spiritual throughput. Highly susceptible to external transit damage. Requires active donation.
            </p>
          </div>

          <div className="p-3.5 bg-white/40 border border-slate-200 rounded-lg text-[10px] text-slate-400 leading-relaxed">
            <strong className="text-slate-400">Interpretation Guidelines:</strong> Lal Kitab planetary strength is determined by placement in kendras, exaltation, and friendly houses. Low strength indicates the need for behavioral changes rather than expensive stones.
          </div>
        </div>
      </div>
    </div>
  );
}
