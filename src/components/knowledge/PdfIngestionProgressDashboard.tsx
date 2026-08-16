import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Zap, 
  BookOpen, 
  Cpu, 
  Hourglass, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  RotateCcw,
  Terminal,
  Layers,
  Sparkles,
  XCircle
} from "lucide-react";
import { PipelineProgressState, PIPELINE_STAGES as SERVICE_PIPELINE_STAGES } from "../../services/knowledgeUploadPipelineService";

interface PdfIngestionProgressDashboardProps {
  item: PipelineProgressState;
  onRetry?: (item: PipelineProgressState) => void;
}

export const PIPELINE_STAGES = SERVICE_PIPELINE_STAGES.map((stage) => ({
  id: stage.id,
  name: stage.shortName,
  short: `${stage.id}. ${stage.shortName.split(" ")[0]}`,
}));

export const PdfIngestionProgressDashboard: React.FC<PdfIngestionProgressDashboardProps> = ({
  item,
  onRetry
}) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const [liveElapsedMs, setLiveElapsedMs] = useState<number>(item.elapsedMs || 0);

  // Live timer tick during active processing
  useEffect(() => {
    if (item.currentStep === "COMPLETED" || item.currentStep === "FAILED") {
      setLiveElapsedMs(item.elapsedMs || 0);
      return;
    }

    const startTime = item.startTimeMs || Date.now();
    const interval = setInterval(() => {
      setLiveElapsedMs(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [item.currentStep, item.startTimeMs, item.elapsedMs]);

  const activeStage = item.stageNumber || (item.currentStep === "COMPLETED" ? 8 : 1);
  const isFailed = item.currentStep === "FAILED";
  const isCompleted = item.currentStep === "COMPLETED";

  // Helper bytes formatter
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Helper duration formatter
  const formatDuration = (ms: number) => {
    if (!ms || ms <= 0) return "0.0s";
    const seconds = (ms / 1000).toFixed(1);
    if (ms >= 60000) {
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      return `${mins}m ${secs}s`;
    }
    return `${seconds}s`;
  };

  const handleCopyErrorLog = () => {
    const errorDetails = item.errorDetails;
    const logContent = `
URJAFLUX AI OS - DOCUMENT INGESTION EXCEPTION REPORT
==========================================================================
File Name: ${item.fileName} (${formatBytes(item.fileSizeBytes)})
Failed Stage: Stage ${errorDetails?.stageNumber || activeStage} - ${errorDetails?.stageName || item.stageName || "Unknown Stage"}
Page Number: ${errorDetails?.pageNumber || item.currentPage || "N/A"} of ${item.totalPages || "N/A"}
Processing Duration: ${formatDuration(errorDetails?.durationMs || liveElapsedMs)}
Timestamp: ${new Date().toISOString()}

EXCEPTION MESSAGE:
${errorDetails?.message || item.errorMessage || "Unknown error"}

COMPLETE STACK TRACE:
${errorDetails?.stackTrace || "No stack trace recorded"}
==========================================================================
`;
    navigator.clipboard.writeText(logContent.trim());
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <div className={`border rounded-2xl p-5 space-y-5 shadow-sm transition-all duration-300 ${
      isFailed ? "bg-red-50/50 border-red-200" : isCompleted ? "bg-emerald-50/30 border-emerald-200" : "bg-white border-slate-200"
    }`}>
      {/* 1. Dashboard Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isFailed ? "bg-red-100 text-red-700 border-red-300" :
            isCompleted ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
            "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
            <FileText className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold font-mono text-slate-900 text-sm truncate max-w-md" title={item.fileName}>
                {item.fileName}
              </h3>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 uppercase">
                {item.fileType || "document"}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                {formatBytes(item.fileSizeBytes)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-slate-600">
              <span className="font-bold text-slate-700">
                Stage {activeStage} of {PIPELINE_STAGES.length}: {item.stageName || PIPELINE_STAGES[activeStage - 1]?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge & Percentage */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono text-slate-500 font-semibold">Overall Progress</div>
            <div className={`text-xl font-bold font-mono ${
              isFailed ? "text-red-600" : isCompleted ? "text-emerald-700" : "text-blue-600"
            }`}>
              {item.progressPercent || 0}%
            </div>
          </div>

          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 border shadow-xs ${
            isFailed ? "bg-red-100 text-red-800 border-red-300" :
            isCompleted ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
            "bg-blue-100 text-blue-800 border-blue-300 animate-pulse"
          }`}>
            {isFailed && <XCircle className="w-4 h-4 text-red-600" />}
            {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {!isFailed && !isCompleted && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
            <span>{isFailed ? "FAILED" : isCompleted ? "COMPLETED" : "INGESTING"}</span>
          </span>
        </div>
      </div>

      {/* 2. Main Live Animated Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600">
          <span className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{item.statusMessage || "Processing document pipeline..."}</span>
          </span>
          <span className="font-bold">{item.progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-300 relative ${
              isFailed ? "bg-red-500" : isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 animate-pulse"
            }`}
            style={{ width: `${Math.max(item.progressPercent || 2, 2)}%` }}
          />
        </div>
      </div>

      {/* 3. Live 8-Stage Ingestion Pipeline Flow Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-500" />
            <span>8-Stage Document Ingestion Pipeline (PDF · Word · Text)</span>
          </span>
          <span className="text-slate-400 font-normal">
            Stage {Math.min(activeStage, PIPELINE_STAGES.length)} / {PIPELINE_STAGES.length} {isCompleted ? 'Completed' : 'Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map((stage) => {
            const timing = item.stageTimings?.[stage.id];
            const isStageDone = (stage.id < activeStage || isCompleted) && timing?.status !== "RUNNING";
            const isStageCurrent = (stage.id === activeStage && !isCompleted && !isFailed) || timing?.status === "RUNNING";
            const isStageFailed = (stage.id === activeStage && isFailed) || timing?.status === "FAILED";

            return (
              <div
                key={stage.id}
                className={`p-2.5 rounded-xl text-xs font-mono border transition-all flex flex-col justify-between space-y-1.5 ${
                  isStageFailed
                    ? "bg-red-100/80 border-red-300 text-red-900 shadow-xs"
                    : isStageCurrent
                    ? "bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-300/50 shadow-xs"
                    : isStageDone
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                    : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px]">STAGE {stage.id < 10 ? `0${stage.id}` : stage.id}</span>
                  {isStageFailed && <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                  {isStageDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  {isStageCurrent && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />}
                </div>
                <div className="font-bold text-[11px] leading-tight truncate" title={stage.name}>
                  {stage.name}
                </div>
                <div className="text-[10px] font-mono text-slate-600 flex items-center justify-between pt-0.5 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-700">
                    {timing?.durationMs !== undefined
                      ? formatDuration(timing.durationMs)
                      : timing?.status === "RUNNING"
                      ? "Running..."
                      : isStageDone
                      ? "Completed"
                      : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Real-Time Metrics Cards Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {/* Metric 1: Current Page / Total Pages */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold">
            <span>Pages Processed</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-900">
            {item.currentPage || 0} / {item.totalPages || 0}
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            {item.totalPages ? `Page ${item.currentPage || 0} active` : "Analyzing pages..."}
          </div>
        </div>

        {/* Metric 2: Processing Duration */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold">
            <span>Processing Time</span>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-900">
            {formatDuration(liveElapsedMs)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            Continuous duration
          </div>
        </div>

        {/* Metric 3: Speed (Pages per second) */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold">
            <span>Throughput Speed</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-900">
            {item.pagesPerSecond ? `${item.pagesPerSecond.toFixed(1)} /s` : "0.0 /s"}
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            Pages processed / sec
          </div>
        </div>

        {/* Metric 4: Estimated Time Remaining */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold">
            <span>Estimated Time</span>
            <Hourglass className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 truncate">
            {isCompleted ? "Finished" : item.estimatedTimeRemainingMs ? formatDuration(item.estimatedTimeRemainingMs) : "Calculating..."}
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            {isCompleted ? "0s remaining" : "Dynamic ETA calculation"}
          </div>
        </div>

        {/* Metric 5: Native vs OCR Extraction Status */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold">
            <span>Extraction Mode</span>
            <FileText className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xs font-bold font-mono text-purple-900 truncate" title={item.extractionMode || "Native Text"}>
            {item.extractionMode || "Native Text"}
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            OCR fallback policy
          </div>
        </div>

        {/* Metric 6: Current Memory Usage */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold">
            <span>Memory Heap</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-900">
            {item.memoryUsageMB ? `${item.memoryUsageMB} MB` : "Standard"}
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            JS engine heap size
          </div>
        </div>
      </div>

      {/* 5. ORIGINAL EXCEPTION DIAGNOSTIC DRAWER (IF FAILED) */}
      {isFailed && (
        <div className="bg-red-900 text-white p-5 rounded-2xl space-y-4 border border-red-700 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold font-mono text-red-100 text-sm">
                  Pipeline Exception Encountered in Stage {item.errorDetails?.stageNumber || activeStage}: {item.errorDetails?.stageName || item.stageName || "Unknown Stage"}
                </h4>
                <p className="text-red-200 text-xs font-mono mt-1 font-semibold leading-relaxed">
                  {item.errorDetails?.message || item.errorMessage || "An unexpected error occurred during ingestion."}
                </p>
              </div>
            </div>

            {onRetry && (
              <button
                onClick={() => onRetry(item)}
                className="bg-white hover:bg-red-50 text-red-900 font-mono text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Upload</span>
              </button>
            )}
          </div>

          {/* Toggle Details Button */}
          <div className="pt-2 border-t border-red-800 flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="text-red-200 hover:text-white flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-red-300" />
              <span>{showErrorDetails ? "Hide Exception Details" : "Show Details (Full Stack Trace & Metadata)"}</span>
              {showErrorDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={handleCopyErrorLog}
              className="text-red-200 hover:text-white flex items-center gap-1.5 cursor-pointer font-bold"
            >
              {copiedLog ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLog ? "Copied Log!" : "Copy Diagnostics"}</span>
            </button>
          </div>

          {/* Collapsible Technical Details & Stack Trace */}
          {showErrorDetails && (
            <div className="space-y-3 pt-2 text-xs font-mono border-t border-red-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-red-950/80 p-3 rounded-xl border border-red-800 text-red-200">
                <div>
                  <span className="text-red-400 text-[10px] block">TARGET FILE</span>
                  <span className="font-bold text-white truncate block">{item.fileName}</span>
                </div>
                <div>
                  <span className="text-red-400 text-[10px] block">FAILED STAGE</span>
                  <span className="font-bold text-white block">Stage {item.errorDetails?.stageNumber || activeStage}</span>
                </div>
                <div>
                  <span className="text-red-400 text-[10px] block">PAGE NUMBER</span>
                  <span className="font-bold text-white block">{item.errorDetails?.pageNumber || item.currentPage || "N/A"}</span>
                </div>
                <div>
                  <span className="text-red-400 text-[10px] block">DURATION</span>
                  <span className="font-bold text-white block">{formatDuration(item.errorDetails?.durationMs || liveElapsedMs)}</span>
                </div>
              </div>

              <div>
                <div className="text-red-300 text-[11px] font-bold mb-1 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>UNSUPPRESSED ORIGINAL STACK TRACE:</span>
                </div>
                <pre className="bg-slate-950 text-red-300 font-mono text-[11px] p-4 rounded-xl overflow-x-auto whitespace-pre-wrap select-text border border-red-900/60 max-h-64 leading-relaxed">
                  {item.errorDetails?.stackTrace || "No stack trace available."}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
