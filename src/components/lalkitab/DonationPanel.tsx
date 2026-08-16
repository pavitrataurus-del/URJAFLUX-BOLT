// src/components/lalkitab/DonationPanel.tsx
import React from "react";
import { LalKitabResult } from "./lalkitabEngine";
import { Flame, ShieldCheck, Heart, User } from "lucide-react";

interface DonationPanelProps {
  result: LalKitabResult | null;
}

export default function DonationPanel({ result }: DonationPanelProps) {
  if (!result) return null;

  const { donation } = result;

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xl">
      <div className="border-b border-slate-200 pb-3">
        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
          Karmic Cleansing Donations (Daan)
        </h4>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Traditional charity guidelines of Lal Kitab to pacify negative planetary currents by shifting material ownership.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 font-mono text-xs items-center">
        {/* Core details (7 columns) */}
        <div className="md:col-span-8 space-y-3">
          <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Suggested Directive</span>
            <p className="text-slate-200 font-bold text-sm">
              {donation.suggestedDonation}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Charitable Items</span>
              <p className="text-slate-200 font-semibold truncate text-[11px]">
                {donation.items}
              </p>
            </div>

            <div className="p-3 bg-white/40 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Beneficial Day</span>
              <p className="text-yellow-500 font-bold text-[11px]">
                Every {donation.day}
              </p>
            </div>
          </div>
        </div>

        {/* Purpose Card (4 columns) */}
        <div className="md:col-span-4 p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-lg space-y-1">
          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            Purification Purpose
          </span>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            {donation.purpose}
          </p>
        </div>
      </div>
    </div>
  );
}
