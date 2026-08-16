import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Compass, 
  Layers, 
  Check, 
  X,
  Building2,
  ListChecks,
  Activity
} from "lucide-react";

export type EvaluationModuleType = "VASTU" | "LAL_KITAB" | "NUMEROLOGY" | "INTEGRATED";

export type StageExecutionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "SKIPPED" | "NOT_AVAILABLE";

export interface EvaluationStageInfo {
  id: string;
  stageName: string;
  status: StageExecutionStatus;
  statusText?: string;
  confidence?: number;
  details?: string;
  timestamp?: number;
}

export interface EvaluationRuntimeMetrics {
  layoutElementsRecognized: number;
  northAlignmentVerified: boolean;
  northAngleDegrees?: number;
  zonesEvaluated: number;
  issuesIdentified: number;
  recommendationsPrepared: number;
  confidenceAverage?: number;
  elapsedTimeMs: number;
}

export interface EvaluationProgressState {
  moduleType: EvaluationModuleType;
  currentStageId: string;
  currentStageName: string;
  isComplete: boolean;
  stages: EvaluationStageInfo[];
  metrics: EvaluationRuntimeMetrics;
  completedTransitionStep?: "EVALUATION_COMPLETE" | "PREPARING_EXECUTIVE_REPORT" | "REPORT_READY";
}

export type EvaluationStageCallback = (state: EvaluationProgressState) => void;

interface EvaluationExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: EvaluationProgressState | null;
  onViewReport?: () => void;
}

export default function EvaluationExperienceModal({
  isOpen,
  onClose,
  state,
  onViewReport
}: EvaluationExperienceModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !state) return null;

  const moduleTitleMap: Record<EvaluationModuleType, { name: string; tag: string }> = {
    VASTU: { name: "Vastu Spatial Evaluation", tag: "Spatial Energy Matrix" },
    LAL_KITAB: { name: "Lal Kitab Assessment", tag: "Planetary Aspect Evaluation" },
    NUMEROLOGY: { name: "Numerological Assessment", tag: "Vibrational Spatial Grid" },
    INTEGRATED: { name: "Integrated Property Assessment", tag: "Unified Spatial & Astrological Matrix" }
  };

  const currentModule = moduleTitleMap[state.moduleType] || moduleTitleMap.VASTU;

  const getStatusBadge = (stage: EvaluationStageInfo) => {
    switch (stage.status) {
      case "COMPLETED":
        return (
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{stage.statusText || "Verified"}</span>
            {stage.confidence !== undefined && (
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono ml-1">
                {Math.round(stage.confidence * 100)}%
              </span>
            )}
          </div>
        );
      case "RUNNING":
        return (
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200 animate-pulse">
            <Activity className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Evaluating...</span>
          </div>
        );
      case "SKIPPED":
        return (
          <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200">
            <Minus className="w-3.5 h-3.5 text-slate-400" />
            <span>Skipped</span>
          </div>
        );
      case "NOT_AVAILABLE":
        return (
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200">
            <X className="w-3.5 h-3.5 text-slate-300" />
            <span>Not Available</span>
          </div>
        );
      case "PENDING":
      default:
        return (
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50/80 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <span>Awaiting</span>
          </div>
        );
    }
  };

  const isTransitioningToReport = state.completedTransitionStep && state.completedTransitionStep !== "EVALUATION_COMPLETE";
  const isReportReady = state.completedTransitionStep === "REPORT_READY";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER BAR */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">{currentModule.name}</h2>
                <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentModule.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive Property Evaluation & Spatial Verification
              </p>
            </div>
          </div>
          {state.isComplete && (
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* METRICS CARDS OVERVIEW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Layout Elements</span>
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {state.metrics.layoutElementsRecognized}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recognized</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>North Alignment</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono flex items-center gap-1">
              {state.metrics.northAlignmentVerified ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {state.metrics.northAngleDegrees !== undefined ? `${state.metrics.northAngleDegrees}°` : "Verified"}
                </span>
              ) : (
                <span className="text-amber-600">Aligning...</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cardinal Calibration</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Zones Evaluated</span>
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {state.metrics.zonesEvaluated}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">16-Zone Matrix</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <ListChecks className="w-3.5 h-3.5 text-slate-400" />
              <span>Recommendations</span>
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {state.metrics.recommendationsPrepared}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Formulated</div>
          </div>
        </div>

        {/* STAGES LIST */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>Evaluation Execution Progress</span>
              <span className="text-[10px] font-normal text-slate-400">({state.stages.filter(s => s.status === "COMPLETED").length} of {state.stages.length} Completed)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Elapsed: {(state.metrics.elapsedTimeMs / 1000).toFixed(1)}s
            </span>
          </div>

          <div className="space-y-2.5">
            {state.stages.map((stage) => (
              <div 
                key={stage.id} 
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  stage.status === "RUNNING"
                    ? "bg-amber-50/50 border-amber-300/80 shadow-xs"
                    : stage.status === "COMPLETED"
                    ? "bg-white border-slate-200"
                    : "bg-slate-50/50 border-slate-200/60 opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    stage.status === "COMPLETED" ? "bg-emerald-500" :
                    stage.status === "RUNNING" ? "bg-amber-500 animate-ping" :
                    stage.status === "SKIPPED" ? "bg-slate-400" : "bg-slate-300"
                  }`} />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {stage.stageName}
                    </span>
                    {stage.details && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {stage.details}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {getStatusBadge(stage)}
                </div>
              </div>
            ))}
          </div>

          {/* VIEW DETAILS EXPANDER */}
          <div className="pt-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>View Evaluation Details & Verified Features</span>
              </span>
              {showDetails ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {showDetails && (
              <div className="mt-2.5 p-4 bg-slate-900 text-slate-200 rounded-xl text-xs space-y-2 font-mono border border-slate-800 animate-in fade-in duration-150">
                <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-400 text-[11px]">
                  <span>VERIFIED PARAMETER</span>
                  <span>STATUS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Rooms & Zones Recognized:</span>
                  <span className="text-emerald-400 font-bold">{state.metrics.layoutElementsRecognized} Items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Directional Matrix Alignment:</span>
                  <span className="text-emerald-400 font-bold">Verified ({state.metrics.northAngleDegrees ?? 0}°)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Spatial Directional Grid:</span>
                  <span className="text-emerald-400 font-bold">16 Zones Calibrated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Identified Findings:</span>
                  <span className="text-amber-400 font-bold">{state.metrics.issuesIdentified} Items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Formulated Recommendations:</span>
                  <span className="text-emerald-400 font-bold">{state.metrics.recommendationsPrepared} Prepared</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER & COMPLETION TRANSITION */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          {!state.isComplete ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Activity className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Actively evaluating spatial property parameters...</span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>
                  {state.completedTransitionStep === "PREPARING_EXECUTIVE_REPORT"
                    ? "Preparing Executive Assessment Report..."
                    : state.completedTransitionStep === "REPORT_READY"
                    ? "Professional Assessment Ready"
                    : "Spatial Evaluation Complete"}
                </span>
              </div>

              {isReportReady ? (
                <button
                  onClick={() => {
                    if (onViewReport) onViewReport();
                    onClose();
                  }}
                  className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Executive Report</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Close Panel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
