// src/components/numerology/CalculationTracePanel.tsx
import React from "react";
import { NumerologyResult } from "./numerologyEngine";
import { Cpu, Terminal, CheckCircle2 } from "lucide-react";

interface CalculationTracePanelProps {
  result: NumerologyResult | null;
}

export default function CalculationTracePanel({ result }: CalculationTracePanelProps) {
  if (!result) {
    return (
      <div className="bg-white/60 border border-slate-200 rounded-xl p-5 text-center font-mono text-xs text-slate-400 py-12 space-y-2">
        <Cpu className="w-8 h-8 mx-auto text-slate-700 animate-pulse" />
        <p>Awaiting Calculation Engine Execution</p>
      </div>
    );
  }

  const calculationDetails = [
    { title: "Life Path Number (LPN)", trace: result.lifePath.trace },
    { title: "Destiny / Expression Number (DEN)", trace: result.destiny.trace },
    { title: "Soul Urge / Heart's Desire (SUN)", trace: result.soulUrge.trace },
    { title: "Personality Number (PN)", trace: result.personality.trace },
    { title: "Birthday Number (BN)", trace: result.birthdayNum.trace },
    { title: "Maturity Number (MN)", trace: result.maturity.trace },
    { title: "Balance Number (BAL)", trace: result.balance.trace },
    { title: "Hidden Passion Number (HPN)", trace: result.hiddenPassion.trace },
    { title: "Subconscious Self Number (SSN)", trace: result.subconsciousSelf.trace },
    { title: "Rational Thought Number (RTN)", trace: result.rationalThought.trace },
    { title: "Pinnacles Ages & Vibrations", trace: result.pinnacles.trace },
    { title: "Challenges Ages & Vibrations", trace: result.challenges.trace },
    { title: "Predictions (Year, Month, Day)", trace: result.predictions.trace }
  ];

  return (
    <div className="bg-white/60 border border-slate-200 rounded-xl p-5 space-y-5 font-mono text-xs">
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Mathematical Calculation Trace
        </h3>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Step-by-step arithmetic proof logs detailing how every numeric frequency is reduced.
        </p>
      </div>

      {/* Formula breakdowns */}
      <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
        {calculationDetails.map((item, idx) => (
          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {item.title}
            </h4>
            <div className="pl-5 space-y-1 text-[9.5px] text-slate-400 leading-relaxed border-l border-slate-200">
              {item.trace.map((line, lIdx) => (
                <p key={lIdx}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Terminal engine execution trace */}
      <div className="space-y-2 border-t border-slate-950 pt-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          Universal Engine Execution Logs
        </h4>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-[140px] overflow-y-auto text-[8.5px] text-slate-400 font-mono space-y-1">
          {result.traceLogs.map((log, idx) => (
            <p key={idx} className="leading-tight">
              <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
