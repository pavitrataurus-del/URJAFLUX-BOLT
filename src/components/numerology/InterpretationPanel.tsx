// src/components/numerology/InterpretationPanel.tsx
import React from "react";
import { NumerologyResult } from "./numerologyEngine";
import { Brain, HelpCircle, AlertCircle, Sparkles } from "lucide-react";

interface InterpretationPanelProps {
  result: NumerologyResult | null;
}

export default function InterpretationPanel({ result }: InterpretationPanelProps) {
  if (!result) return null;

  const lp = result.lifePath.value;
  const dest = result.destiny.value;

  // Combination synthesis analysis (Vedic interpretation guidelines)
  const getCombinationGuideline = () => {
    if (lp === dest) {
      return "Synchronized Mirror Alignment. High focus, direct path, very low friction. The user's core inner desire completely mirrors their external path. Ensure they do not become overly rigid or single-focused.";
    }

    if ((lp === 1 && dest === 2) || (lp === 2 && dest === 1)) {
      return "Sovereign-Diplomat Combination. Inner drive for executive command combined with an external path of compromise and partnership. High ability to lead teams with deep empathy.";
    }

    if ((lp === 3 && dest === 4) || (lp === 4 && dest === 3)) {
      return "Creative-Builder Combination. Holds structured, systematic execution skills balanced by lighthearted, social creative output. Excellent for starting high-quality design firms.";
    }

    if ((lp === 5 && dest === 8) || (lp === 8 && dest === 5)) {
      return "Dynamic-Sovereign Combination. Thrives on high-speed commercial change, rapid adaptation, and massive financial leadership. Requires careful attention to avoid sudden burnouts.";
    }

    return "Dual-Vector Harmony. Holds standard complementary traits. Work to align the inner Life Path motivation with the external Destiny output to minimize emotional friction.";
  };

  const guidelines = [
    {
      title: "Core Duality (Life Path vs. Destiny)",
      desc: getCombinationGuideline()
    },
    {
      title: "Vedic Grid Interpretation Directive",
      desc: "Check for empty rows in the Lo Shu grid. For example, if the entire bottom row (8-1-6) is missing, the client may experience temporary delays in physical execution or travel plans. Provide remedy directions accordingly."
    },
    {
      title: "Consultation Delivery Tip",
      desc: "Always present remedies (lucky colors, days, gemstone orientations) as empowering, protective alignments rather than absolute fatalistic limits. Foster proactive initiative and self-command."
    }
  ];

  return (
    <div className="bg-white/60 border border-slate-200 rounded-xl p-5 space-y-5 font-mono text-xs">
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-purple-400" />
          Wisdom Interpretation Directives
        </h3>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Guidelines and diagnostic combinations to help formulate highly polished professional consultations.
        </p>
      </div>

      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
        {guidelines.map((g, idx) => (
          <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <h4 className="text-[10.5px] font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
              {g.title}
            </h4>
            <p className="text-slate-400 text-[10px] leading-relaxed border-t border-slate-200/50 pt-2 font-medium">
              {g.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3 bg-emerald-950/15 border border-emerald-900/30 text-emerald-300 rounded-lg text-[9.5px] flex gap-2">
        <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>Interpretations are synthesized by the Universal Interpretation Engine, syncing with local scriptural evidence.</span>
      </div>
    </div>
  );
}
