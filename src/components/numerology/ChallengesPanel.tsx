// src/components/numerology/ChallengesPanel.tsx
import React from "react";
import { NumerologyResult } from "./numerologyEngine";
import { Compass, Calendar, ArrowRight, ShieldAlert } from "lucide-react";

interface ChallengesPanelProps {
  result: NumerologyResult | null;
}

export default function ChallengesPanel({ result }: ChallengesPanelProps) {
  if (!result) return null;

  const { c1, c2, c3, c4 } = result.challenges;

  const challengeInterpretations: Record<number, string> = {
    0: "The Challenge of Choice. No specific obstacle is forced upon you, leaving you with complete spiritual responsibility and freedom to define your growth.",
    1: "The Challenge of Individuality. Overcome dependence, submissiveness, and the fear of standing alone. You must learn authentic courage and assertiveness.",
    2: "The Challenge of Sensitivity. Protect your boundaries from external emotional drama. Avoid overreacting, self-consciousness, and pleasing others excessively.",
    3: "The Challenge of Expression. Overcome social anxiety, fear of public judgment, and creative blocking. Do not scatter your talents or dwell in shallow gossip.",
    4: "The Challenge of Order. Overcome laziness, disorganization, and instability. Avoid being overly rigid, dogmatic, or stubborn. Develop reliable structures.",
    5: "The Challenge of Change. Overcome restlessness, fear of commitment, and sensory addictions. Balance your craving for freedom with focused discipline.",
    6: "The Challenge of Responsibility. Avoid over-protecting others, holding unrealistic standards of perfection, and imposing your will. Practice unconditional love.",
    7: "The Challenge of Faith. Overcome skepticism, intellectual pride, and fear of spiritual realms. Balance deep scientific research with inner trust and meditation.",
    8: "The Challenge of Command. Overcome fear of material lack or obsession with absolute financial power. Harmonize spiritual wisdom with pragmatic organization."
  };

  const challengesList = [
    { id: 1, label: "FIRST CHALLENGE (YOUTH)", val: c1.value, startAge: c1.startAge, endAge: c1.endAge },
    { id: 2, label: "SECOND CHALLENGE (DEVELOPMENT)", val: c2.value, startAge: c2.startAge, endAge: c2.endAge },
    { id: 3, label: "THIRD CHALLENGE (WISDOM)", val: c3.value, startAge: c3.startAge, endAge: c3.endAge },
    { id: 4, label: "FOURTH CHALLENGE (LEGACY)", val: c4.value, startAge: c4.startAge, endAge: c4.endAge === 99 ? "End of Life" : c4.endAge }
  ];

  return (
    <div className="bg-white/40 border border-slate-200 rounded-xl p-5 space-y-5">
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          The Four Challenge Hurdles
        </h3>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Frictional points in the cosmic design designed to test, shape, and strengthen spiritual endurance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        {challengesList.map((c) => (
          <div key={c.id} className="p-4 bg-slate-50/60 border border-slate-200 hover:border-slate-850 rounded-xl transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold tracking-wider">{c.label}</span>
                <span className="text-[9.5px] text-rose-400 font-bold bg-rose-950/40 border border-rose-900/30 px-1.5 py-0.2 rounded">
                  C{c.id}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{c.val}</span>
                <span className="text-[10px] text-slate-400 font-medium">Obstacle</span>
              </div>

              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                AGE: {c.startAge} <ArrowRight className="w-3 h-3 text-slate-700" /> {c.endAge}
              </p>

              <p className="text-slate-400 text-[10.5px] leading-relaxed border-t border-slate-200 pt-3">
                {challengeInterpretations[c.val] || "Represents a point of developmental tension calling for conscious awareness, patience, and resolve."}
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8px] tracking-widest text-slate-400 uppercase font-bold bg-white px-2 py-0.5 rounded w-max border border-slate-850">
              <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
              <span>Challenge Cycle {c.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
