// src/components/lalkitab/GemstonePanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Star, ShieldAlert, Sparkles, Award } from "lucide-react";

interface GemstonePanelProps {
  result: LalKitabResult | null;
}

export default function GemstonePanel({ result }: GemstonePanelProps) {
  if (!result) return null;

  const { gemstone } = result;

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      <div className="border-b border-slate-200 pb-3">
        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-400" />
          Aura-Therapy Gemstone Directives
        </h4>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Planetary amplification recommendations using high-frequency precious minerals and natural metals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 font-mono text-xs items-center">
        {/* Core details (7 columns) */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Recommended Gem</span>
            <p className="text-slate-200 font-bold flex items-center gap-1.5 truncate text-sm">
              <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
              {gemstone.name}
            </p>
          </div>

          <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Min Carat Weight</span>
            <p className="text-slate-200 font-bold text-sm">
              {gemstone.weight}
            </p>
          </div>

          <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Base Metal Setting</span>
            <p className="text-slate-200 font-bold text-sm">
              {gemstone.metal}
            </p>
          </div>

          <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Finger Placement</span>
            <p className="text-slate-200 font-bold text-sm">
              {gemstone.finger}
            </p>
          </div>

          <div className="p-3 bg-white/40 border border-slate-200 rounded-lg col-span-2 space-y-1">
            <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Activation Timing</span>
            <p className="text-slate-200 font-bold">
              Purify and wear on <span className="text-yellow-500">{gemstone.day}</span>.
            </p>
          </div>
        </div>

        {/* Warning card (5 columns) */}
        <div className="md:col-span-5 p-4 bg-rose-950/20 border border-rose-900/40 rounded-lg space-y-2">
          <span className="text-[9px] text-rose-400 font-bold flex items-center gap-1 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Vedic incompatibility Warning
          </span>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            {gemstone.warning}
          </p>
          <p className="text-[10px] text-slate-400 italic leading-tight">
            Contraindicated mineral matrices can disrupt energy fields, triggering psychological spikes and career losses.
          </p>
        </div>
      </div>
    </div>
  );
}
