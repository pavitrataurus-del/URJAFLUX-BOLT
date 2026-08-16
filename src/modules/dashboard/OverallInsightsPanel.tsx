import React from "react";
import { Compass, Award, Star, Activity, Sparkles } from "lucide-react";

interface OverallInsightsPanelProps {
  overallScore: number;
  vastuScore: number;
  numerologyScore: number;
  lalKitabScore: number;
  hasVastu: boolean;
  hasNumerology: boolean;
  hasLalKitab: boolean;
  onNavigateToModule?: (moduleName: string) => void;
}

export const OverallInsightsPanel: React.FC<OverallInsightsPanelProps> = ({
  overallScore,
  vastuScore,
  numerologyScore,
  lalKitabScore,
  hasVastu,
  hasNumerology,
  hasLalKitab,
  onNavigateToModule
}) => {
  return (
    <div className="bg-white/25 border border-slate-200 rounded-xl p-5 space-y-5" id="overall-insights-panel">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-950 pb-2.5">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Overall Insights & Scoring Grid
          </h4>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Unified Core Astrological & Spatial Alignment Indices</p>
        </div>
        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/40 text-[9px] font-mono rounded font-bold uppercase">
          LIVE TELEMETRY
        </span>
      </div>

      {/* Circle meters grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50/40 border border-slate-200/50 rounded-xl text-center space-y-2">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Overall Score</span>
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-slate-900 fill-transparent" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-indigo-500 fill-transparent transition-all duration-1000"
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * overallScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-base font-bold text-slate-900 font-mono">{overallScore}%</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold tracking-wider">HARMONY INDEX</span>
        </div>

        {/* Vastu Score */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50/40 border border-slate-200/50 rounded-xl text-center space-y-2">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Vastu Score</span>
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-slate-900 fill-transparent" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={`${hasVastu ? "stroke-emerald-500" : "stroke-slate-700"} fill-transparent transition-all duration-1000`}
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * (hasVastu ? vastuScore : 0)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-base font-bold text-slate-900 font-mono">{hasVastu ? `${vastuScore}%` : "N/A"}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToModule && onNavigateToModule("vastu")}
            className="text-[9px] font-mono text-emerald-400 hover:text-slate-900 uppercase font-bold tracking-wider underline cursor-pointer bg-transparent border-0 p-0"
          >
            {hasVastu ? "SPATIAL ALIGNED" : "AWAITING VASTU"}
          </button>
        </div>

        {/* Numerology Score */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50/40 border border-slate-200/50 rounded-xl text-center space-y-2">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Numerology</span>
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-slate-900 fill-transparent" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={`${hasNumerology ? "stroke-amber-500" : "stroke-slate-700"} fill-transparent transition-all duration-1000`}
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * (hasNumerology ? numerologyScore : 0)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-base font-bold text-slate-900 font-mono">{hasNumerology ? `${numerologyScore}%` : "N/A"}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToModule && onNavigateToModule("numerology")}
            className="text-[9px] font-mono text-amber-400 hover:text-slate-900 uppercase font-bold tracking-wider underline cursor-pointer bg-transparent border-0 p-0"
          >
            {hasNumerology ? "GRID COMPUTED" : "RUN NUMEROLOGY"}
          </button>
        </div>

        {/* Lal Kitab Score */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50/40 border border-slate-200/50 rounded-xl text-center space-y-2">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Lal Kitab</span>
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-slate-900 fill-transparent" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={`${hasLalKitab ? "stroke-rose-500" : "stroke-slate-700"} fill-transparent transition-all duration-1000`}
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * (hasLalKitab ? lalKitabScore : 0)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-base font-bold text-slate-900 font-mono">{hasLalKitab ? `${lalKitabScore}%` : "N/A"}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToModule && onNavigateToModule("lalkitab")}
            className="text-[9px] font-mono text-rose-400 hover:text-slate-900 uppercase font-bold tracking-wider underline cursor-pointer bg-transparent border-0 p-0"
          >
            {hasLalKitab ? "KUNDLI MAP" : "RUN LAL KITAB"}
          </button>
        </div>
      </div>

      {/* Synthesis Commentary */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs text-slate-700">
        <h5 className="font-bold text-slate-900 flex items-center gap-1">
          <Activity className="w-4 h-4 text-emerald-400" />
          Cross-Module Synthesis Narrative
        </h5>
        <p className="leading-relaxed font-sans">
          {(!hasVastu && !hasNumerology && !hasLalKitab) ? (
            <span className="text-slate-400 italic">Awaiting Module Execution: Run analyses in the respective workspaces to unlock advanced cross-module intelligence reports.</span>
          ) : (
            <span>
              The client's energetic blueprint reveals highly localized alignments.
              {hasNumerology && " Numerological calculations show a stable Life Path vibration, which supports deep focus. "}
              {hasLalKitab && " Lal Kitab planetary calculations pinpoint a critical transit in progress requiring direct remedies. "}
              {hasVastu && " Vastu spatial coordinates match the structural flow of the primary property. "}
              Addressing structural deficiencies while performing recommended donations will safely lock the overall harmony score above 85%.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default OverallInsightsPanel;
