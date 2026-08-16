import React from "react";
import { BookOpen, ShieldAlert, Cpu, Sparkles, FileCheck, ChevronRight, Activity, Clock } from "lucide-react";

interface AnalysisTimelineProps {
  currentStage: "none" | "knowledge" | "rules" | "calculations" | "interpretation" | "report" | "done" | "all";
  isExecuting: boolean;
  durationMs?: number;
}

export default function AnalysisTimeline({
  currentStage,
  isExecuting,
  durationMs = 0
}: AnalysisTimelineProps) {
  
  const stages = [
    {
      id: "knowledge",
      name: "Knowledge",
      description: "Treatise & RAG Search",
      icon: BookOpen,
      color: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
      idleColor: "border-slate-200 text-slate-400 bg-slate-50/20"
    },
    {
      id: "rules",
      name: "Rules",
      description: "Heuristic Evaluation",
      icon: ShieldAlert,
      color: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
      idleColor: "border-slate-200 text-slate-400 bg-slate-50/20"
    },
    {
      id: "calculations",
      name: "Calculations",
      description: "Vedic Math & Ayadi",
      icon: Cpu,
      color: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
      idleColor: "border-slate-200 text-slate-400 bg-slate-50/20"
    },
    {
      id: "interpretation",
      name: "Interpretation",
      description: "Remedy Matrix Inferences",
      icon: Sparkles,
      color: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
      idleColor: "border-slate-200 text-slate-400 bg-slate-50/20"
    },
    {
      id: "report",
      name: "Report",
      description: "Dossier Compilation",
      icon: FileCheck,
      color: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
      idleColor: "border-slate-200 text-slate-400 bg-slate-50/20"
    }
  ];

  const getStageIndex = (stageId: string) => {
    if (currentStage === "done") return 5;
    if (currentStage === "none") return -1;
    return stages.findIndex(s => s.id === stageId);
  };

  const activeIdx = getStageIndex(currentStage);

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg select-none">
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 animate-pulse">
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Engine Pipeline Monitor</h3>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Cycle duration: {durationMs > 0 ? `${durationMs.toFixed(0)}ms` : "idle"}</span>
          </div>
        </div>
      </div>

      {/* TIMELINE CONNECTOR BLOCK */}
      <div className="flex-1 w-full flex items-center justify-between max-w-4xl overflow-x-auto py-2 px-4 gap-2">
        {stages.map((st, idx) => {
          const isCompleted = activeIdx > idx;
          const isActive = activeIdx === idx && isExecuting;
          const isPending = activeIdx <= idx && !isActive;

          const Icon = st.icon;
          const style = isCompleted || isActive ? st.color : st.idleColor;

          return (
            <React.Fragment key={st.id}>
              {/* STAGE CONTAINER */}
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${style} ${
                    isActive ? "ring-2 ring-emerald-500/40 animate-pulse scale-105" : ""
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className={`text-[11px] font-mono block font-bold leading-none ${
                    isActive ? "text-emerald-400" : isCompleted ? "text-slate-200" : "text-slate-400"
                  }`}>
                    {st.name}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate block mt-0.5">{st.description}</span>
                </div>
              </div>

              {/* ARROW SPLIT */}
              {idx < stages.length - 1 && (
                <ChevronRight className={`w-4 h-4 shrink-0 ${isCompleted ? "text-emerald-500/60" : "text-slate-800"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
