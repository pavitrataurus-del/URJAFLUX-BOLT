import React, { useState } from "react";
import { CheckCircle2, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { VastuWorkflowStep, VastuWorkflowDerived } from "../../types/vastuWorkflow";

interface WorkflowProgressChipProps {
  canvasTheme: "light" | "dark";
  steps: VastuWorkflowStep[];
  workflow: VastuWorkflowDerived;
  ocrRunning?: boolean;
}

export const WorkflowProgressChip: React.FC<WorkflowProgressChipProps> = ({
  canvasTheme,
  steps,
  workflow,
  ocrRunning = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isDark = canvasTheme === "dark";

  const displaySteps = steps.filter((s) => s.id !== "run_analysis" && s.id !== "results");
  const completedCount = displaySteps.filter((s) => s.status === "completed").length;
  const currentIndex = displaySteps.findIndex((s) => s.status === "current");
  const stepDisplayNum = currentIndex >= 0 ? currentIndex + 1 : Math.min(completedCount + 1, displaySteps.length);

  return (
    <div className="fixed left-3 bottom-3 z-40 max-w-[min(420px,calc(100vw-24px))]">
      <div
        className={`rounded-2xl border shadow-lg transition-all ${
          isDark
            ? "bg-[#0a0e16]/90 border-white/10 shadow-black/40"
            : "bg-white/90 border-slate-200/80 shadow-slate-300/30"
        }`}
        style={{ backdropFilter: "blur(16px)" }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left"
        >
          <div className="flex items-center gap-1 shrink-0">
            {displaySteps.map((step) => (
              <span
                key={step.id}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  step.status === "completed"
                    ? "bg-emerald-500"
                    : step.status === "current"
                    ? "bg-sky-500 animate-pulse"
                    : isDark
                    ? "bg-slate-600"
                    : "bg-slate-300"
                }`}
              />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Step {stepDisplayNum} of {displaySteps.length}
            </p>
            <p className={`text-xs font-semibold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {workflow.canRunAnalysis
                ? "Ready for Analysis"
                : displaySteps.find((s) => s.status === "current")?.label ?? "Workflow"}
            </p>
          </div>
          {ocrRunning ? (
            <Loader2 className="w-4 h-4 text-sky-500 animate-spin shrink-0" />
          ) : workflow.canRunAnalysis ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>

        {expanded && (
          <div className={`px-3 pb-3 pt-0 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <ul className="space-y-1 mt-2">
              {displaySteps.map((step) => (
                <li
                  key={step.id}
                  className={`flex items-center gap-2 text-[11px] py-1 ${
                    step.status === "completed"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : step.status === "current"
                      ? "text-sky-600 dark:text-sky-400 font-semibold"
                      : isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                  ) : step.status === "current" && step.id === "ocr" && ocrRunning ? (
                    <Loader2 className="w-3 h-3 shrink-0 animate-spin" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-current shrink-0 opacity-60" />
                  )}
                  <span className="truncate">{step.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowProgressChip;
