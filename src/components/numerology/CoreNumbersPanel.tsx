// src/components/numerology/CoreNumbersPanel.tsx
import React from "react";
import { NumerologyResult, SystemType, NUMEROLOGY_INTERPRETATIONS } from "./numerologyEngine";
import { Award, Compass, Eye, Heart, Shuffle, Smile, Star, Zap, Activity } from "lucide-react";

interface CoreNumbersPanelProps {
  result: NumerologyResult | null;
  system: SystemType;
  onSystemChange: (system: SystemType) => void;
}

export default function CoreNumbersPanel({
  result,
  system,
  onSystemChange
}: CoreNumbersPanelProps) {
  if (!result) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 bg-white/10 rounded-xl space-y-2">
        <Compass className="w-10 h-10 text-slate-700 mx-auto animate-spin" />
        <p className="text-sm font-mono text-slate-400">Awaiting Calculation Engine Execution</p>
        <p className="text-[10px] text-slate-400 font-mono">Ensure client Date of Birth and Full Name are populated in UCMS.</p>
      </div>
    );
  }

  // Helper to lookup interpretation safely
  const getInterpretation = (type: "lifePath" | "destiny" | "soulUrge", value: number) => {
    const section = NUMEROLOGY_INTERPRETATIONS[type];
    if (section && section[value]) return section[value];
    // fallback
    if (value > 9) {
      const reduced = value % 9 || 9;
      if (section && section[reduced]) return section[reduced];
    }
    return { title: "Custom Cosmic Alignment", desc: "Expresses unique multi-layered vibrations that merge with primary natal alignments." };
  };

  const lpInterp = getInterpretation("lifePath", result.lifePath.value);
  const destInterp = getInterpretation("destiny", result.destiny.value);
  const suInterp = getInterpretation("soulUrge", result.soulUrge.value);

  const primaryCards = [
    {
      label: "Life Path (DOB)",
      value: result.lifePath.value,
      isMaster: result.lifePath.isMaster,
      icon: Zap,
      color: "text-amber-400 border-amber-900/30 bg-amber-950/20",
      title: lpInterp.title,
      desc: lpInterp.desc,
      sanskrit: lpInterp.sanskrit,
      authority: lpInterp.authority
    },
    {
      label: "Destiny / Expression (Name)",
      value: result.destiny.value,
      isMaster: result.destiny.isMaster,
      icon: Award,
      color: "text-emerald-400 border-emerald-900/30 bg-emerald-950/20",
      title: destInterp.title,
      desc: destInterp.desc
    },
    {
      label: "Soul Urge / Heart's Desire",
      value: result.soulUrge.value,
      isMaster: result.soulUrge.isMaster,
      icon: Heart,
      color: "text-rose-400 border-rose-900/30 bg-rose-950/20",
      title: suInterp.title,
      desc: suInterp.desc
    }
  ];

  const secondaryNumbers = [
    { label: "Personality", value: result.personality.value, icon: Smile, desc: "How you express outwardly and are perceived." },
    { label: "Birthday Number", value: result.birthdayNum.value, icon: Star, desc: "Inherent talents, strengths, and basic tools." },
    { label: "Maturity Number", value: result.maturity.value, icon: Compass, desc: "Future destiny unlocking in your mid-thirties." },
    { label: "Balance Number", value: result.balance.value, icon: Shuffle, desc: "Supportive defense structure under crisis." },
    { label: "Hidden Passion", value: result.hiddenPassion.value, icon: Star, desc: "Your dominant inner skill and desire." },
    { label: "Subconscious Self", value: result.subconsciousSelf.value, icon: Eye, desc: "Inherent security, self-reliance, and mental depth." },
    { label: "Rational Thought", value: result.rationalThought.value, icon: Activity, desc: "Your unique logical and cognitive approach." }
  ];

  return (
    <div className="space-y-6">
      {/* Header and system selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/30 p-4 border border-slate-200 rounded-xl">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Core Vibration Array
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            The fundamental alphanumeric vibrations defining the spiritual blueprint.
          </p>
        </div>

        {/* System Toggle */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-850 rounded">
          {(["Pythagorean", "Chaldean"] as SystemType[]).map((sys) => (
            <button
              key={sys}
              onClick={() => onSystemChange(sys)}
              className={`px-3 py-1 text-[10px] font-mono font-bold transition-all rounded ${
                system === sys
                  ? "bg-emerald-600 text-slate-900"
                  : "text-slate-400 hover:text-slate-900"
              }`}
            >
              {sys.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {primaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white/50 border border-slate-200 rounded-xl p-5 hover:border-slate-200 transition-all space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest block">{card.label}</span>
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase">{card.title}</h4>
                </div>
                <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center font-mono font-bold ${card.color}`}>
                  <span className="text-xl leading-none">{card.value}</span>
                  {card.isMaster && <span className="text-[7.5px] tracking-widest mt-0.5">MASTER</span>}
                </div>
              </div>

              {card.sanskrit && (
                <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded w-max">
                  <Star className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{card.sanskrit} • {card.authority}</span>
                </div>
              )}

              <p className="text-slate-400 text-xs font-mono leading-relaxed">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Array */}
      <div className="bg-white/20 border border-slate-200 rounded-xl p-5 space-y-4">
        <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-950 pb-2">
          Secondary Vibration Coordinates
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryNumbers.map((num, idx) => {
            const Icon = num.icon;
            return (
              <div key={idx} className="p-3 bg-slate-50/50 border border-slate-200 hover:border-slate-850 rounded-lg flex gap-3">
                <div className="w-10 h-10 shrink-0 bg-white border border-slate-200 text-emerald-400 rounded-lg flex items-center justify-center font-mono font-bold text-lg">
                  {num.value}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[9.5px] font-mono font-bold text-slate-200 truncate block">{num.label}</span>
                  <p className="text-[9.5px] text-slate-400 font-mono leading-snug truncate" title={num.desc}>
                    {num.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bridge Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50/40 border border-slate-200 rounded-xl flex items-center justify-between gap-3 font-mono">
          <div className="space-y-0.5">
            <span className="text-[9.5px] font-bold text-amber-500 tracking-wider uppercase block">Life Path - Destiny Bridge</span>
            <p className="text-[10.5px] text-slate-400">Harmonizes your life purpose with your actual destiny.</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-400 flex items-center justify-center font-bold text-lg">
            {result.bridgeLP_Destiny}
          </div>
        </div>

        <div className="p-4 bg-slate-50/40 border border-slate-200 rounded-xl flex items-center justify-between gap-3 font-mono">
          <div className="space-y-0.5">
            <span className="text-[9.5px] font-bold text-emerald-500 tracking-wider uppercase block">Soul Urge - Personality Bridge</span>
            <p className="text-[10.5px] text-slate-400">Harmonizes inner heart desires with outer presentation.</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
            {result.bridgeHearts_Personality}
          </div>
        </div>
      </div>
    </div>
  );
}
