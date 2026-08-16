import React from "react";
import { Play, ShieldAlert, Cpu, FileCheck, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";

interface AnalysisControlPanelProps {
  isAnalyzing: boolean;
  activeEngine: "none" | "knowledge" | "rules" | "calculations" | "interpretation" | "report" | "all";
  onRunFullAnalysis: () => void;
  onRunRuleEngine: () => void;
  onRunCalculationEngine: () => void;
  onRunInterpretationEngine: () => void;
  onGenerateReport: () => void;
  hasExecuted: boolean;
  executionWarningsCount?: number;
}

export default function AnalysisControlPanel({
  isAnalyzing,
  activeEngine,
  onRunFullAnalysis,
  onRunRuleEngine,
  onRunCalculationEngine,
  onRunInterpretationEngine,
  onGenerateReport,
  hasExecuted,
  executionWarningsCount = 0
}: AnalysisControlPanelProps) {
  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3.5 shadow-lg hover:border-slate-200 transition-colors select-none">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Analysis Control</h3>
            <p className="text-[10px] text-slate-400 font-mono">Engine Execution Core</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* RUN FULL ORCHESTRATION PIPELINE BUTTON */}
        <button
          onClick={onRunFullAnalysis}
          disabled={isAnalyzing}
          className={`w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isAnalyzing
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
          }`}
        >
          {isAnalyzing && activeEngine === "all" ? (
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isAnalyzing && activeEngine === "all" ? "ORCHESTRATING PIPELINE..." : "RUN FULL ANALYSIS"}
        </button>

        {/* INDIVIDUAL PIPELINE STEPS GATES */}
        <div className="space-y-1.5 pt-1.5">
          <span className="text-[9px] font-mono text-slate-400 uppercase block tracking-wider mb-1">
            Manual Component Execution
          </span>

          {/* 1. Rule Engine */}
          <button
            onClick={onRunRuleEngine}
            disabled={isAnalyzing}
            className={`w-full p-2 rounded-lg border flex items-center justify-between text-left text-xs font-mono transition-all ${
              activeEngine === "rules"
                ? "bg-emerald-600/10 border-emerald-500/40 text-emerald-400"
                : "bg-slate-50/60 border-slate-850 hover:border-slate-200 text-slate-700 hover:bg-white/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>1. Run Rule Engine</span>
            </div>
            {isAnalyzing && activeEngine === "rules" ? (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            ) : hasExecuted ? (
              <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">READY</span>
            ) : (
              <span className="text-[8px] text-slate-400">RUN</span>
            )}
          </button>

          {/* 2. Calculation Engine */}
          <button
            onClick={onRunCalculationEngine}
            disabled={isAnalyzing}
            className={`w-full p-2 rounded-lg border flex items-center justify-between text-left text-xs font-mono transition-all ${
              activeEngine === "calculations"
                ? "bg-emerald-600/10 border-emerald-500/40 text-emerald-400"
                : "bg-slate-50/60 border-slate-850 hover:border-slate-200 text-slate-700 hover:bg-white/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>2. Run Calculation Engine</span>
            </div>
            {isAnalyzing && activeEngine === "calculations" ? (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            ) : hasExecuted ? (
              <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">READY</span>
            ) : (
              <span className="text-[8px] text-slate-400">RUN</span>
            )}
          </button>

          {/* 3. Interpretation Engine */}
          <button
            onClick={onRunInterpretationEngine}
            disabled={isAnalyzing}
            className={`w-full p-2 rounded-lg border flex items-center justify-between text-left text-xs font-mono transition-all ${
              activeEngine === "interpretation"
                ? "bg-emerald-600/10 border-emerald-500/40 text-emerald-400"
                : "bg-slate-50/60 border-slate-850 hover:border-slate-200 text-slate-700 hover:bg-white/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>3. Run Interpretation Engine</span>
            </div>
            {isAnalyzing && activeEngine === "interpretation" ? (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            ) : hasExecuted ? (
              <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">READY</span>
            ) : (
              <span className="text-[8px] text-slate-400">RUN</span>
            )}
          </button>

          {/* 4. Generate Report Document */}
          <button
            onClick={onGenerateReport}
            disabled={isAnalyzing}
            className={`w-full p-2 rounded-lg border flex items-center justify-between text-left text-xs font-mono transition-all ${
              activeEngine === "report"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-slate-50/60 border-slate-850 hover:border-slate-200 text-slate-700 hover:bg-white/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>4. Compile Report Dossier</span>
            </div>
            {isAnalyzing && activeEngine === "report" ? (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            ) : hasExecuted ? (
              <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">READY</span>
            ) : (
              <span className="text-[8px] text-slate-400">BUILD</span>
            )}
          </button>
        </div>

        {/* STATUS BRIEFING */}
        <div className="p-2.5 bg-slate-50/40 border border-slate-850 rounded-lg text-[10px] font-mono space-y-1 text-left">
          <div className="flex justify-between">
            <span className="text-slate-400">Pipeline Status:</span>
            {isAnalyzing ? (
              <span className="text-amber-400 animate-pulse font-bold uppercase">Executing...</span>
            ) : hasExecuted ? (
              <span className="text-emerald-400 font-bold uppercase">Fully Synced (100%)</span>
            ) : (
              <span className="text-slate-400 uppercase">Awaiting Trigger</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Vastu Compliance:</span>
            {hasExecuted ? (
              <span className="text-rose-400 font-bold">CATASTROPHIC REMEDIES NEEDED</span>
            ) : (
              <span className="text-slate-400">Unevaluated</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
