import React from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Upload,
  Scan,
  Compass,
  Target,
  Sparkles,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Award,
  PanelRightClose,
  ChevronRight,
} from "lucide-react";
import {
  VastuWorkflowDerived,
  VastuWorkflowStep,
  CALIBRATION_BLOCK_MESSAGE,
  VastuProjectMode,
} from "../../types/vastuWorkflow";
import { VastuAnalysisResult } from "../../services/vastuAnalysisOrchestrator";

interface VastuWorkflowWizardProps {
  canvasTheme: "light" | "dark";
  projectMode?: VastuProjectMode;
  workflow: VastuWorkflowDerived;
  steps: VastuWorkflowStep[];
  ocrRunning: boolean;
  roomCount: number;
  blueprintName?: string;
  vastuNorthCalibration: number;
  setVastuNorthCalibration: (value: number) => void;
  chakraDeployed: boolean;
  chakraOrientationCalibrated: boolean;
  isAnalyzing: boolean;
  analysisResult: VastuAnalysisResult | null;
  onClose: () => void;
  onUploadBlueprint: () => void;
  onInsertEntity?: (type: string) => void;
  onAddVastuChakra: () => void;
  onConfirmNorthCalibration: () => void;
  onRunVastuAnalysis: () => void;
  onGenerateReport: () => void;
  onOpenAnalysisPanel: () => void;
  variant?: "sidebar" | "floating";
}

const StepIcon: React.FC<{ status: VastuWorkflowStep["status"]; spinning?: boolean }> = ({
  status,
  spinning = false,
}) => {
  if (status === "completed") {
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
  }
  if (status === "current" && spinning) {
    return <Loader2 className="w-4 h-4 text-sky-500 shrink-0 animate-spin" />;
  }
  if (status === "current") {
    return <Circle className="w-4 h-4 text-sky-500 shrink-0 fill-sky-500/25" />;
  }
  return <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />;
};

export const VastuWorkflowWizard: React.FC<VastuWorkflowWizardProps> = ({
  canvasTheme,
  projectMode = "blueprint",
  workflow,
  steps,
  ocrRunning,
  roomCount,
  blueprintName,
  vastuNorthCalibration,
  setVastuNorthCalibration,
  chakraDeployed,
  chakraOrientationCalibrated,
  isAnalyzing,
  analysisResult,
  onClose,
  onUploadBlueprint,
  onInsertEntity,
  onAddVastuChakra,
  onConfirmNorthCalibration,
  onRunVastuAnalysis,
  onGenerateReport,
  onOpenAnalysisPanel,
  variant = "sidebar",
}) => {
  const { currentStepId, canRunAnalysis, runButtonLabel, showResults } = workflow;
  const isBlank = projectMode === "blank";

  const statusLabel = (status: VastuWorkflowStep["status"]) => {
    if (status === "completed") return "Completed";
    if (status === "current") return "Current Step";
    return "Pending";
  };

  return (
    <div
      className={`flex flex-col text-sm font-sans ${
        variant === "floating"
          ? "h-full"
          : `w-80 border-l shrink-0 shadow-xl z-20 ${
              canvasTheme === "light"
                ? "bg-white border-slate-200 text-slate-800"
                : "bg-[#070b13] border-slate-800 text-slate-200"
            }`
      } ${variant === "floating" ? (canvasTheme === "light" ? "text-slate-800" : "text-slate-200") : ""}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Vastu Workspace
          </p>
          <h2 className="text-sm font-bold tracking-tight">Step-by-Step Guide</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-5">
        {/* Step checklist */}
        <ol className="space-y-2">
          {steps
            .filter((s) => s.id !== "results")
            .map((step) => (
              <li
                key={step.id}
                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                  step.status === "current"
                    ? "border-sky-400/60 bg-sky-50 dark:bg-sky-950/30 shadow-sm"
                    : step.status === "completed"
                    ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-slate-200 dark:border-slate-800 opacity-70"
                }`}
              >
                <StepIcon
                  status={step.status}
                  spinning={step.id === "ocr" && ocrRunning}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-tight">{step.label}</p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      step.status === "completed"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : step.status === "current"
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-slate-400"
                    }`}
                  >
                    {statusLabel(step.status)}
                  </p>
                </div>
                {step.status === "completed" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                )}
              </li>
            ))}
        </ol>

        {/* Current step action card */}
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            canvasTheme === "light"
              ? "bg-slate-50 border-slate-200"
              : "bg-slate-900/50 border-slate-700"
          }`}
        >
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Your next action
          </p>

          {currentStepId === "upload" && (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isBlank
                  ? "Blank canvas is ready. Use the Draw floor plan toolbar at the bottom to sketch walls and rooms."
                  : "Start by uploading your architectural blueprint. All other steps unlock after upload."}
              </p>
              {!isBlank && (
                <button
                  type="button"
                  onClick={onUploadBlueprint}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                >
                  <Upload className="w-5 h-5" />
                  Upload Blueprint
                </button>
              )}
            </>
          )}

            {currentStepId === "ocr" && (
            <>
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                {ocrRunning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isBlank ? (
                  <Target className="w-5 h-5" />
                ) : (
                  <Scan className="w-5 h-5" />
                )}
                <span className="font-semibold text-sm">
                  {isBlank
                    ? roomCount > 0
                      ? `${roomCount} room${roomCount !== 1 ? "s" : ""} on canvas`
                      : "Draw your floor plan"
                    : ocrRunning
                      ? "Detecting rooms from blueprint…"
                      : "OCR could not detect room labels"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isBlank
                  ? "Add at least one Room (and optional walls, doors, windows) using the toolbar. Then continue to Vastu Chakra."
                  : ocrRunning
                    ? "Reading room labels from your blueprint. No analysis runs at this stage — only text recognition."
                    : "Upload a higher-contrast blueprint or ensure room names are readable, then upload again."}
              </p>
              {isBlank && onInsertEntity && (
                <button
                  type="button"
                  onClick={() => onInsertEntity("Room")}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                >
                  <Target className="w-5 h-5" />
                  Add Room
                </button>
              )}
              {!isBlank && blueprintName && (
                <p className="text-[10px] font-mono text-slate-400 truncate">{blueprintName}</p>
              )}
            </>
          )}

          {currentStepId === "add_chakra" && (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isBlank
                  ? `You have ${roomCount} room${roomCount !== 1 ? "s" : ""} drawn. Place the Vastu Chakra at the center of your layout.`
                  : `OCR found ${roomCount} room label${roomCount !== 1 ? "s" : ""}. Place the Vastu Chakra on your blueprint.`}
              </p>
              <button
                type="button"
                onClick={onAddVastuChakra}
                className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.98] text-sm"
              >
                <Compass className="w-6 h-6" />
                Add Vastu Chakra
              </button>
            </>
          )}

          {currentStepId === "adjust_chakra" && (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Adjust the Chakra on the blueprint using only these controls on the canvas:
              </p>
              <ul className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                {["Move", "Rotate", "Expand", "Shrink"].map((label) => (
                  <li
                    key={label}
                    className="py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                  >
                    {label}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-slate-400">
                Drag the centre to move. Use the handles around the Chakra for rotation and size.
                This step completes only after you move, rotate, or resize the Chakra.
              </p>
            </>
          )}

          {currentStepId === "mark_north" && (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Align the Chakra so North matches your blueprint, then confirm.
              </p>
              <div className="space-y-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                    <Target className="w-4 h-4" />
                    North Direction
                  </span>
                  <span className="font-mono">{vastuNorthCalibration}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={vastuNorthCalibration}
                  onChange={(e) => setVastuNorthCalibration(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={onConfirmNorthCalibration}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Mark North & Confirm
                </button>
              </div>
              {chakraOrientationCalibrated && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  North marked — step complete
                </p>
              )}
            </>
          )}

          {currentStepId === "run_analysis" && (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Calibration is complete. Run Vastu Analysis to evaluate compliance, doshas, and remedies.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Ready for Analysis
              </div>
            </>
          )}

          {currentStepId === "results" && showResults && analysisResult && (
            <>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Analysis Complete
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase">Score</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {analysisResult.overallScore != null ? `${analysisResult.overallScore}%` : "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <ShieldCheck className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase">Compliance</p>
                  <p className="text-lg font-bold">
                    {analysisResult.passedRulesCount}/{analysisResult.totalRulesCount}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase">Doshas</p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                    {analysisResult.doshas.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                  <FileText className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase">Report</p>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Ready</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {analysisResult.summary}
              </p>
              <button
                type="button"
                onClick={onOpenAnalysisPanel}
                className="w-full py-2 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                View Compliance, Doshas & Remedies
              </button>
              <button
                type="button"
                onClick={onGenerateReport}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Always-visible Run Analysis */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0 bg-white/80 dark:bg-[#070b13]/90 backdrop-blur-sm">
        {!canRunAnalysis && !showResults && (
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            {chakraDeployed && !chakraOrientationCalibrated
              ? CALIBRATION_BLOCK_MESSAGE
              : "Complete each step above to unlock analysis."}
          </p>
        )}
        <button
          type="button"
          onClick={onRunVastuAnalysis}
          disabled={!canRunAnalysis || isAnalyzing}
          className={`w-full py-3.5 px-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm ${
            canRunAnalysis && !isAnalyzing
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 active:scale-[0.98]"
              : "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {runButtonLabel}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VastuWorkflowWizard;
