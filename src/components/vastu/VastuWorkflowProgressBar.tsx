import React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { VastuWorkflowStep } from "../../types/vastuWorkflow";

interface VastuWorkflowProgressBarProps {
  steps: VastuWorkflowStep[];
  ocrRunning?: boolean;
  canvasTheme: "light" | "dark";
}

export const VastuWorkflowProgressBar: React.FC<VastuWorkflowProgressBarProps> = ({
  steps,
  ocrRunning = false,
  canvasTheme,
}) => {
  const displaySteps = steps.filter((s) => s.id !== "run_analysis" && s.id !== "results");

  return (
    <div
      className={`px-4 py-2 border-b shrink-0 ${
        canvasTheme === "light"
          ? "bg-white/95 border-slate-200"
          : "bg-[#0a101c]/95 border-slate-800"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium">
        {displaySteps.map((step) => {
          const isOcrStep = step.id === "ocr";
          const spinning = isOcrStep && ocrRunning && step.status === "current";

          return (
            <span
              key={step.id}
              className={`flex items-center gap-1.5 transition-colors ${
                step.status === "completed"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : step.status === "current"
                  ? "text-sky-600 dark:text-sky-400 font-semibold"
                  : "text-slate-400"
              }`}
            >
              {step.status === "completed" ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : spinning ? (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
              ) : (
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    step.status === "current" ? "bg-sky-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              )}
              <span>{step.label}</span>
              {step.status === "completed" && <span className="text-[10px] opacity-80">✓</span>}
            </span>
          );
        })}
        {steps.find((s) => s.id === "mark_north")?.status === "completed" && (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
            Ready for Analysis ✓
          </span>
        )}
      </div>
    </div>
  );
};

export default VastuWorkflowProgressBar;
