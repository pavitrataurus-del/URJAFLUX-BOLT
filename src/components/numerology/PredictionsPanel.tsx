// src/components/numerology/PredictionsPanel.tsx
import React, { useState } from "react";
import { NumerologyResult } from "./numerologyEngine";
import { TrendingUp, Calendar, Zap, Compass, Briefcase, DollarSign, Heart, Shield, BookOpen } from "lucide-react";

interface PredictionsPanelProps {
  result: NumerologyResult | null;
}

export default function PredictionsPanel({ result }: PredictionsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<"Career" | "Finance" | "Health" | "Relationships" | "Education" | "Business">("Career");

  if (!result) return null;

  const currentYear = new Date().getFullYear();
  const personalYear = result.predictions.personalYear;
  const nextPersonalYear = (personalYear % 9) + 1;

  // Real-time calculated predictions databases based on the personal year vibration
  const yearVibrationThematicInfo: Record<number, { theme: string; focus: string; explanation: string }> = {
    1: { theme: "New Beginnings & Original Action", focus: "Planting Seeds", explanation: "A highly dynamic start of a brand new 9-year cycle. Focus on individual autonomy, original ventures, and high courage." },
    2: { theme: "Cooperation, Partnership & Slow Growth", focus: "Cooperative Nurture", explanation: "A period demanding absolute patience, detail collection, emotional stabilization, and forming aligned friendships." },
    3: { theme: "Self-Expression, Joy & Expansion", focus: "Creative Manifestation", explanation: "A highly communicative, expressive, and social year. Cultivate artistic talents, writing, speaking, and optimism." },
    4: { theme: "Systematic Order, Hard Work & Stability", focus: "Securing Foundations", explanation: "A pragmatically demanding period focusing on structure, self-control, routine, and building physical assets." },
    5: { theme: "Change, Freedom & Adaptation", focus: "Sensory Transformation", explanation: "A fast-moving year filled with travel, spontaneous shifts, adapters, and learning to ride waves of freedom." },
    6: { theme: "Domestic duty, Loving Nurture & Service", focus: "Protective Guardian", explanation: "Focus on home layout symmetry, family wellness, counseling others, protective duty, and deep healing." },
    7: { theme: "Silent Introspection & Inner Analysis", focus: "Metaphysical Study", explanation: "A quiet, meditative period. Ideal for heavy scientific research, spiritual purification, and reading ancient scriptures." },
    8: { theme: "Executive Command, Sovereign Wealth & Justice", focus: "Sovereign Command", explanation: "An intense harvest year. Focus on corporate leadership, material wealth organization, and resolving karma." },
    9: { theme: "Planetary Completion, Charity & Release", focus: "Universal Forgiveness", explanation: "The final wrap-up phase of the 9-year cycle. Forgive old debts, complete loose ends, and prepare for a clean slate." }
  };

  const getCategorizedForecast = (yearVal: number, category: string) => {
    switch (category) {
      case "Career":
        if ([1, 5, 8].includes(yearVal)) return "High promotion potential. Demonstrate independent command, propose original designs, and assert your leadership.";
        if ([2, 6].includes(yearVal)) return "Best suited for collaborative tasks, resolving executive conflicts, and nurturing corporate wellness.";
        return "Steady execution of standard operational structures. Avoid rash terminations of current roles.";
      case "Finance":
        if (yearVal === 8) return "Peak Harvest Era! Exceptional wealth flows. Organize long-term investments, and complete real estate operations.";
        if (yearVal === 4) return "Pragmatic, tight budgets required. Avoid speculative investments. Build reliable physical savings.";
        return "Steady financial flow. Moderate expenditure on family beauty and domestic comfort.";
      case "Health":
        if (yearVal === 9) return "Time to release old toxic habits, detoxify physical organs, and embrace a complete organic lifestyle.";
        if (yearVal === 5) return "Watch for nervous over-exhaustion. Prioritize deep sleep, structured breathing, and avoid excessive stimulants.";
        return "Robust physical vitality supported by standard wellness and daily exercise rituals.";
      case "Relationships":
        if (yearVal === 2 || yearVal === 6) return "Exceptional year for romantic commitment, marriage, settling family feuds, and home harmony.";
        if (yearVal === 7) return "You may crave silent solitude and personal study. Communicate this requirement to your partner to avoid misunderstandings.";
        return "Harmonious balance of emotional and logical operations with friends and spouses.";
      case "Education":
        if (yearVal === 7) return "Golden era for research, deep reading, memorizing complex formulas, and pursuing specialized degrees.";
        if (yearVal === 3) return "Excellent for literature, languages, public speaking, and creative writing programs.";
        return "Successful comprehension of curriculum under disciplined daily study routines.";
      case "Business":
        if ([1, 8].includes(yearVal)) return "Incredible speed! Prime alignment for incorporating brand names, launching new lines, and raising enterprise capital.";
        if (yearVal === 9) return "Wrap up stale product lines, clean up outdated debt books, and prepare the operational blueprint for next year's launch.";
        return "Consolidate ongoing projects, ensure tight compliance, and nurture customer relationships.";
      default:
        return "No specific guidelines recorded.";
    }
  };

  const categoryIcons: Record<string, any> = {
    Career: Briefcase,
    Finance: DollarSign,
    Health: Shield,
    Relationships: Heart,
    Education: BookOpen,
    Business: TrendingUp
  };

  const currentTheme = yearVibrationThematicInfo[personalYear] || { theme: "Cosmic Integration", focus: "Balance", explanation: "A general phase of steady structural integration." };
  const nextTheme = yearVibrationThematicInfo[nextPersonalYear] || { theme: "Cosmic Integration", focus: "Balance", explanation: "A general phase of steady structural integration." };

  const categories: ("Career" | "Finance" | "Health" | "Relationships" | "Education" | "Business")[] = [
    "Career", "Finance", "Health", "Relationships", "Education", "Business"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Year Forecast Overview */}
      <div className="lg:col-span-5 bg-white/40 border border-slate-200 rounded-xl p-5 space-y-4 font-mono text-xs flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            Macro Cosmic Forecasts
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Temporal forecasts based on the calculated Personal Year vibrations.
          </p>
        </div>

        <div className="space-y-4">
          {/* Current Year */}
          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-lg space-y-1">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
              <span>CURRENT YEAR ({currentYear})</span>
              <span className="px-1.5 py-0.2 bg-amber-950/20 text-amber-400 border border-amber-900/30 rounded font-bold">Vibration {personalYear}</span>
            </div>
            <p className="text-slate-200 font-bold text-xs">{currentTheme.theme}</p>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{currentTheme.explanation}</p>
          </div>

          {/* Next Year */}
          <div className="p-3 bg-slate-50/40 border border-slate-200 rounded-lg space-y-1">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
              <span>NEXT YEAR ({currentYear + 1})</span>
              <span className="px-1.5 py-0.2 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded font-bold">Vibration {nextPersonalYear}</span>
            </div>
            <p className="text-slate-700 font-bold text-xs">{nextTheme.theme}</p>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{nextTheme.explanation}</p>
          </div>
        </div>

        <div className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between items-center font-bold text-[10px]">
          <span className="text-slate-400 uppercase">ACTIVE MONTHLY VIBRATION:</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded">
            Personal Month {result.predictions.personalMonth}
          </span>
        </div>
      </div>

      {/* Categorized Predictions */}
      <div className="lg:col-span-7 bg-white/40 border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Vibe Vectors & Micro trends
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Understand how active year vibrations interact across primary life aspects.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 border border-slate-200 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold transition-all rounded ${
                activeCategory === cat
                  ? "bg-emerald-600 text-slate-900"
                  : "text-slate-400 hover:text-slate-900"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Active Tab description */}
        {(() => {
          const Icon = categoryIcons[activeCategory];
          return (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <Icon className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">{activeCategory} Forecast</h4>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {getCategorizedForecast(personalYear, activeCategory)}
              </p>
              <div className="pt-2 border-t border-slate-200 text-[9.5px] text-slate-400 leading-snug">
                This prediction vector updates in real-time as the calendar progresses and represents standard guidelines from traditional Shani and Surya calculations.
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
