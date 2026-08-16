// src/components/numerology/MasterNumbersPanel.tsx
import React from "react";
import { NumerologyResult } from "./numerologyEngine";
import { Grid, Sparkles, Check, HelpCircle, ShieldAlert } from "lucide-react";

interface MasterNumbersPanelProps {
  result: NumerologyResult | null;
}

export default function MasterNumbersPanel({ result }: MasterNumbersPanelProps) {
  if (!result) return null;

  // Let's look for master numbers in active core results
  const activeMasters: { name: string; val: number; desc: string }[] = [];
  if (result.lifePath.isMaster) {
    activeMasters.push({ name: "Life Path", val: result.lifePath.value, desc: "Indicates a highly charged spiritual path requiring intense maturity, devotion, and alignment with planetary change." });
  }
  if (result.destiny.isMaster) {
    activeMasters.push({ name: "Destiny / Expression", val: result.destiny.value, desc: "Your life's ultimate calling is amplified with double-digit mastery, pushing you to manifest or channel massive projects." });
  }
  if (result.soulUrge.isMaster) {
    activeMasters.push({ name: "Soul Urge / Heart's Desire", val: result.soulUrge.value, desc: "Your innermost psychic calling operates on a highly intuitive frequency. You feel a deep cosmic yearning." });
  }

  // Lo Shu layout order (standard 3x3 Vedic/Chinese astrology matrix):
  // 4 9 2
  // 3 5 7
  // 8 1 6
  const loShuLayout = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6]
  ];

  const getElementInfo = (num: number) => {
    switch(num) {
      case 4: return { name: "Wood / Xun", meaning: "Wealth / Wisdom" };
      case 9: return { name: "Fire / Li", meaning: "Fame / Success" };
      case 2: return { name: "Earth / Kun", meaning: "Partnership / Love" };
      case 3: return { name: "Wood / Zhen", meaning: "Family / Growth" };
      case 5: return { name: "Earth / Taiji", meaning: "Stability / Core" };
      case 7: return { name: "Metal / Dui", meaning: "Children / Art" };
      case 8: return { name: "Earth / Gen", meaning: "Knowledge / Peace" };
      case 1: return { name: "Water / Kan", meaning: "Career / Journey" };
      case 6: return { name: "Metal / Qian", meaning: "Benefactors / Travel" };
      default: return { name: "Universal", meaning: "Balance" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Master Numbers Panel */}
      <div className="lg:col-span-5 bg-white/40 border border-slate-200 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Master Number Frequency Registry
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Detecting double-digit master frequencies (11, 22, 33) requiring special cosmic integration.
          </p>
        </div>

        {activeMasters.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 font-mono text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>No Master Number friction detected. Standard single-digit vibrations are active and balanced.</span>
          </div>
        ) : (
          <div className="space-y-3 font-mono">
            {activeMasters.map((m, idx) => (
              <div key={idx} className="p-4 bg-emerald-950/15 border border-emerald-900/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{m.name} Master Number</span>
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-slate-900 font-bold text-xs rounded animate-pulse">{m.val}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{m.desc}</p>
                <div className="p-2 bg-slate-50 text-[10px] text-amber-300 rounded border border-amber-900/20 flex gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>Requires substantial spiritual grounding. Avoid over-stimulation or nervous anxiety.</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Karmic Debt Registry */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest border-t border-slate-950 pt-3">
            Karmic Debts & lessons
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50/60 rounded border border-slate-200">
              <span className="text-[9px] text-rose-400 block font-bold uppercase">Karmic Debts</span>
              <p className="text-slate-200 mt-1 font-bold">
                {result.karmicDebt.length === 0 ? "None Detected" : result.karmicDebt.join(", ")}
              </p>
              {result.karmicDebt.length > 0 && (
                <p className="text-[8.5px] text-slate-400 mt-0.5">Indicates specific lessons of self-control or duty.</p>
              )}
            </div>

            <div className="p-3 bg-slate-50/60 rounded border border-slate-200">
              <span className="text-[9px] text-amber-400 block font-bold uppercase">Karmic Lessons</span>
              <p className="text-slate-200 mt-1 font-bold truncate">
                {result.karmicLessons.length === 0 ? "None Detected" : result.karmicLessons.join(", ")}
              </p>
              <p className="text-[8.5px] text-slate-400 mt-0.5">Missing numbers to actively integrate.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Lo Shu Grid Panel */}
      <div className="lg:col-span-7 bg-white/40 border border-slate-200 rounded-xl p-5 space-y-5">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-emerald-400" />
            Lo Shu Astral Coordinate Grid
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Traditional 3x3 Vedic grid revealing energetic elemental distributions from your DOB.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Visual 3x3 Grid */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto w-full">
            {loShuLayout.map((row, rIdx) =>
              row.map((num, cIdx) => {
                const frequency = result.loShuGrid[num] || 0;
                const active = frequency > 0;
                const element = getElementInfo(num);
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`aspect-square rounded-xl p-2.5 border flex flex-col justify-between items-center transition-all ${
                      active
                        ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/20"
                        : "bg-slate-50/80 border-slate-850 text-slate-600"
                    }`}
                  >
                    <div className="flex justify-between w-full">
                      <span className="text-xs font-mono text-slate-400">{num}</span>
                      {active && (
                        <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded leading-none text-emerald-400 font-bold uppercase">
                          x{frequency}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-mono font-bold ${active ? "text-emerald-300" : "text-slate-700"}`}>
                      {active ? String(num).repeat(frequency) : "•"}
                    </span>
                    <span className="text-[7.5px] font-mono tracking-wider text-slate-400 uppercase font-medium leading-none">
                      {element.name.split(" ")[0]}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Arrows Analysis */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Arrows of Strength / Weakness
            </h4>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {result.arrows.map((arr, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex flex-col gap-1 transition-all ${
                    arr.present
                      ? "bg-emerald-950/10 border-emerald-900/30 text-slate-200"
                      : "bg-slate-50/40 border-slate-950 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase tracking-wider">{arr.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      arr.present ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" : "bg-white text-slate-600"
                    }`}>
                      {arr.present ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-[9.5px] leading-relaxed text-slate-400">{arr.description}</p>
                  <p className="text-[8.5px] text-slate-400">Required values: [{arr.numbers.join(", ")}]</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
