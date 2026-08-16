// src/components/numerology/RemediesPanel.tsx
import React from "react";
import { NumerologyResult, LUCKY_FACTORS } from "./numerologyEngine";
import { ShieldCheck, Compass, Palette, Calendar, Hash, Type, HelpCircle, Activity } from "lucide-react";

interface RemediesPanelProps {
  result: NumerologyResult | null;
}

export default function RemediesPanel({ result }: RemediesPanelProps) {
  if (!result) return null;

  // Let's use Life Path as the primary remedy focus
  const lp = result.lifePath.value;
  // If lp is master, reduce to single digit for remedies
  const refNum = lp > 9 ? lp % 9 || 9 : lp;
  const factors = LUCKY_FACTORS[refNum] || LUCKY_FACTORS[1];

  // Business signature or letterhead guidelines based on numbers
  const getBusinessRecommendations = (num: number) => {
    switch (num) {
      case 1:
        return "Sign your business contracts on Sundays during daylight hours. Keep your office entrance styled with gold/brass decorations. Start your signatures with an upward flourish.";
      case 2:
        return "Choose Mondays for negotiations. Incorporate silver trim in your workspace, and prioritize calm, balanced interior acoustics to keep your mental state stable.";
      case 3:
        return "Thursday is your peak power day. Great for teaching, writing, and branding launches. Use saffron yellow envelopes for corporate letters.";
      case 4:
        return "Use heavy, rectangular oak desks. Avoid starting key projects on Saturdays. Maintain a strict digital backup system for all client records.";
      case 5:
        return "Wednesdays are ideal for signing contracts and launching advertising campaigns. Style your desk with a healthy jade plant to invite fresh ideas.";
      case 6:
        return "Fridays are highly auspicious. Style your meeting rooms with exquisite artwork and symmetrical layouts. Focus on high-end beauty and customer care.";
      case 7:
        return "Choose Thursdays for research. Maintain a clean, silent study corner. Use light green or gray writing pens for designing long-term corporate blueprints.";
      case 8:
        return "Saturday is your execution day. Maintain high order and complete legal compliance. Keep a small dark blue/indigo artifact on your desk for stability.";
      case 9:
        return "Tuesdays are perfect for physical action, clearing out bad stock, or completing construction steps. Keep your corporate logos styled with energetic red.";
      default:
        return "Maintain a symmetrical, clean workspace with natural lighting to keep all single-digit vibrations in harmony.";
    }
  };

  const remedyGrid = [
    { label: "LUCKY VIBRATIONS", value: `Numbers: ${refNum}, ${refNum === 9 ? 1 : refNum + 1}`, icon: Hash, color: "text-amber-400 border-amber-900/30" },
    { label: "LUCKY COLOURS", value: factors.colors.join(", "), icon: Palette, color: "text-emerald-400 border-emerald-900/30" },
    { label: "LUCKY DAYS", value: factors.days.join(", "), icon: Calendar, color: "text-emerald-400 border-emerald-900/30" },
    { label: "AUSPICIOUS DIRECTIONS", value: factors.directions.join(", "), icon: Compass, color: "text-rose-400 border-rose-900/30" },
    { label: "BRAND / INITIAL RECS", value: factors.initials.join(", "), icon: Type, color: "text-purple-400 border-purple-900/30" },
    { label: "ASTRONOMICAL GEMSTONE", value: factors.stone, icon: Activity, color: "text-cyan-400 border-cyan-900/30" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Factors Grid */}
      <div className="lg:col-span-7 bg-white/40 border border-slate-200 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Vedic Remedial Coordinates
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Personalized spatial, color, and days-alignment suggestions to boost single-digit harmony.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          {remedyGrid.map((rem, idx) => {
            const Icon = rem.icon;
            return (
              <div key={idx} className="p-3.5 bg-slate-50/60 border border-slate-200 hover:border-slate-850 rounded-lg flex items-center gap-3 transition-colors">
                <div className={`p-2 rounded bg-white border ${rem.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 block uppercase font-bold tracking-wider">{rem.label}</span>
                  <p className="text-slate-900 font-bold mt-0.5">{rem.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Business & Corporate recommendations */}
      <div className="lg:col-span-5 bg-white/40 border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-400" />
            Corporate Naming & Signature guidelines
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Specific business signature and workspace directives based on the primary vibration.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs space-y-3 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Active Enterprise Directive</span>
          </div>
          <p className="text-slate-700">
            {getBusinessRecommendations(refNum)}
          </p>
          <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded text-[9px] text-emerald-300">
            Directive generated dynamically by evaluating primary Life Path ({lp}) vibration harmonics.
          </div>
        </div>

        <p className="text-[9.5px] text-slate-400 font-mono italic leading-relaxed pt-2.5 border-t border-slate-950">
          *Always combine these tips with correct floorplan spatial layout remedies as detailed in the Vastu Registry.
        </p>
      </div>
    </div>
  );
}
