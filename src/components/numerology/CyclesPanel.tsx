// src/components/numerology/CyclesPanel.tsx
import React, { useState } from "react";
import { NumerologyResult } from "./numerologyEngine";
import { Activity, Clock, Compass, HelpCircle } from "lucide-react";

interface CyclesPanelProps {
  result: NumerologyResult | null;
  fullName?: string;
}

export default function CyclesPanel({ result, fullName = "" }: CyclesPanelProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  if (!result) return null;

  const { cycle1, cycle2, cycle3 } = result.cycles;

  // Let's generate dummy/mock-trace transit letters of the name for visual simulation
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "Client";
  const middleName = nameParts.length > 2 ? nameParts[1] : "";
  const lastName = nameParts[nameParts.length - 1] || "";

  // Dynamic simulation of Transits for selectedYear
  const getLetterAtYear = (nameStr: string, offset: number) => {
    if (!nameStr) return { letter: "N/A", val: 1 };
    const clean = nameStr.toUpperCase().replace(/[^A-Z]/g, "");
    if (!clean) return { letter: "N/A", val: 1 };
    const idx = offset % clean.length;
    const letter = clean[idx];
    const val = (letter.charCodeAt(0) - 64) % 9 || 9;
    return { letter, val };
  };

  const currentYearOffset = selectedYear - 2000;
  const physicalTransit = getLetterAtYear(firstName, currentYearOffset);
  const mentalTransit = getLetterAtYear(middleName || firstName, currentYearOffset + 3);
  const spiritualTransit = getLetterAtYear(lastName || firstName, currentYearOffset + 5);

  const yearsRange = [
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1,
    new Date().getFullYear() + 2,
    new Date().getFullYear() + 3
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Three Life Cycles (DOB Based) */}
      <div className="lg:col-span-5 bg-white/40 border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            The Three Major Life Cycles
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Macro-vibrations defining youth, mid-life, and advanced wisdom.
          </p>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[9.5px] text-slate-400 font-bold block uppercase">YOUTH CYCLE (Birth to Age 27)</span>
              <p className="text-slate-700 mt-1">{cycle1.name}</p>
            </div>
            <div className="w-9 h-9 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
              {cycle1.value}
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[9.5px] text-emerald-400 font-bold block uppercase">MATURITY CYCLE (Age 28 to 56)</span>
              <p className="text-slate-700 mt-1">{cycle2.name}</p>
            </div>
            <div className="w-9 h-9 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
              {cycle2.value}
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[9.5px] text-amber-400 font-bold block uppercase">WISDOM CYCLE (Age 57+)</span>
              <p className="text-slate-700 mt-1">{cycle3.name}</p>
            </div>
            <div className="w-9 h-9 rounded bg-amber-950/20 border border-amber-900/30 text-amber-400 flex items-center justify-center font-bold text-lg">
              {cycle3.value}
            </div>
          </div>
        </div>

        <p className="text-[9.5px] text-slate-400 font-mono italic leading-relaxed border-t border-slate-950 pt-2.5">
          Based on the reduced month, day, and year of birth coordinates. These establish the background theme of life.
        </p>
      </div>

      {/* Essence & Transit Cycles (Name Based) */}
      <div className="lg:col-span-7 bg-white/40 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Dynamic Transits & Essence Cycles
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Annual micro-vibrations generated by letter cycling in the birth name.
            </p>
          </div>

          {/* Year select simulation */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="bg-slate-50 text-slate-700 border border-slate-850 font-mono text-xs rounded px-2.5 py-1 focus:outline-none"
          >
            {yearsRange.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Display transits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase">PHYSICAL TRANSIT</span>
              <span className="px-1 py-0.2 bg-white border border-slate-200 text-[9px] rounded text-slate-400">First Name</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 flex items-center justify-center text-lg font-bold">
                {physicalTransit.letter}
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Transit Vibration</p>
                <p className="text-slate-200 font-bold">Vibration: {physicalTransit.val}</p>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 leading-snug">Influences health, energy levels, physical environment, and outer actions.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase">MENTAL TRANSIT</span>
              <span className="px-1 py-0.2 bg-white border border-slate-200 text-[9px] rounded text-slate-400">Middle Name</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded bg-purple-950/20 border border-purple-900/30 text-purple-400 flex items-center justify-center text-lg font-bold">
                {mentalTransit.letter}
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Transit Vibration</p>
                <p className="text-slate-200 font-bold">Vibration: {mentalTransit.val}</p>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 leading-snug">Influences career strategy, logical planning, focus, and business intellect.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase">SPIRITUAL TRANSIT</span>
              <span className="px-1 py-0.2 bg-white border border-slate-200 text-[9px] rounded text-slate-400">Last Name</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded bg-rose-950/20 border border-rose-900/30 text-rose-400 flex items-center justify-center text-lg font-bold">
                {spiritualTransit.letter}
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Transit Vibration</p>
                <p className="text-slate-200 font-bold">Vibration: {spiritualTransit.val}</p>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 leading-snug">Influences emotional peace, inner spiritual insights, and creative breakthroughs.</p>
          </div>
        </div>

        {/* Combined Essence Cycle summary */}
        <div className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-lg flex items-center justify-between font-mono text-xs">
          <div className="space-y-1">
            <span className="text-[9.5px] text-emerald-400 font-bold uppercase">Combined Essence Vibration for {selectedYear}</span>
            <p className="text-slate-700 text-[10.5px]">The overall energetic quality of this specific calendar alignment.</p>
          </div>
          <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-900/30 rounded-lg flex flex-col items-center justify-center text-emerald-300 font-bold">
            <span className="text-lgleading-none">{(physicalTransit.val + mentalTransit.val + spiritualTransit.val) % 9 || 9}</span>
            <span className="text-[7.5px] uppercase tracking-widest mt-0.5">ESSENCE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
