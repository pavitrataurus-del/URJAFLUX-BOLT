import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, FileText, RefreshCw, ChevronDown, ChevronRight, BookOpen, AlertTriangle } from "lucide-react";
import { VastuAnalysisResult, ObjectReportItem, buildObjectReportItems } from "../services/vastuAnalysisOrchestrator";

export interface VastuAnalysisResultsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  result: VastuAnalysisResult | null;
  onReRun: () => void;
  onGenerateReport: () => void;
  onAutoDetectEntities?: () => void;
  canvasTheme?: "light" | "dark";
}

export const VastuAnalysisResultsPanel: React.FC<VastuAnalysisResultsPanelProps> = ({
  isOpen,
  onClose,
  result,
  onReRun,
  onGenerateReport,
  onAutoDetectEntities,
  canvasTheme = "light"
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedWhyIds, setExpandedWhyIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Retrieve or build object report items (guarantees every detected object is present)
  const items: ObjectReportItem[] = result?.objectReportItems && result.objectReportItems.length > 0
    ? result.objectReportItems
    : (result ? buildObjectReportItems([], result.doshas, result.recognitionSummary || null) : []);

  const filteredItems = items.filter(item => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "CORRECT") return item.statusType === "CORRECT";
    if (statusFilter === "NEEDS_IMPROVEMENT") return item.statusType === "NEEDS_IMPROVEMENT";
    if (statusFilter === "MAJOR_ISSUE") return item.statusType === "MAJOR_ISSUE";
    return true;
  });

  const correctCount = items.filter(i => i.statusType === "CORRECT").length;
  const improvementCount = items.filter(i => i.statusType === "NEEDS_IMPROVEMENT").length;
  const majorIssueCount = items.filter(i => i.statusType === "MAJOR_ISSUE").length;

  const toggleWhy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWhyIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl h-full flex flex-col border-l shadow-2xl font-sans ${
        canvasTheme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-[#0b1220] border-slate-800 text-slate-100"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide flex items-center gap-2">
                URJAFLUX Vastu Analysis Report
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Verified Audit</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Evaluated at {result?.timestamp || "Just now"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReRun}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              <span>Re-Run</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calibration / incomplete analysis notice */}
        {result && result.overallScore === null && (
          <div className="mx-4 mt-3 p-3 rounded-xl border border-amber-300/80 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
            North calibration was not applied to this run. Mark North on the Vastu Chakra, then click <strong>Re-Run</strong> to assign directional zones and generate a compliance score.
          </div>
        )}

        {/* Audit Summary Metrics */}
        {result && (
          <div className="grid grid-cols-4 gap-2 p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-mono font-bold block">Compliance</span>
              <span className={`text-xl font-black font-mono ${
                (result.overallScore || 0) >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
              }`}>
                {result.overallScore !== null ? `${result.overallScore}%` : "N/A"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase font-mono font-bold block">✅ Correct</span>
              <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{correctCount}</span>
            </div>

            <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-center">
              <span className="text-[9px] text-amber-700 dark:text-amber-400 uppercase font-mono font-bold block">⚠ Needs Imp.</span>
              <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">{improvementCount}</span>
            </div>

            <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-center">
              <span className="text-[9px] text-rose-700 dark:text-rose-400 uppercase font-mono font-bold block">❌ Major Issues</span>
              <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">{majorIssueCount}</span>
            </div>
          </div>
        )}

        {/* Empty CAD Notice */}
        {result?.totalEntitiesEvaluated === 0 && (
          <div className="p-4 mx-4 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs font-medium space-y-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-amber-600 dark:text-amber-400">No Blueprint Entities Detected</h4>
                <p className="mt-1 leading-relaxed text-[11px]">
                  No elements were detected. Upload a floor plan or run spatial entity recognition.
                </p>
              </div>
            </div>
            {onAutoDetectEntities && (
              <button
                onClick={onAutoDetectEntities}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <span>Auto-Detect Blueprint Objects</span>
              </button>
            )}
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-xs bg-slate-50/80 dark:bg-slate-900/30">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-slate-500 font-bold">Filter Objects:</span>
            {[
              { id: "ALL", label: "All Objects" },
              { id: "CORRECT", label: "✅ Correct" },
              { id: "NEEDS_IMPROVEMENT", label: "⚠ Needs Imp." },
              { id: "MAJOR_ISSUE", label: "❌ Major Issue" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  statusFilter === f.id
                    ? "bg-emerald-600 text-white"
                    : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            Showing {filteredItems.length} of {items.length} objects
          </span>
        </div>

        {/* Object-Wise Audit Report List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {items.length === 0 ? "No OCR Elements Detected" : "No Objects Found For Filter"}
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 max-w-sm mx-auto font-medium leading-relaxed">
                {items.length === 0
                  ? (result?.summary || "OCR Scan Completed: No text detected on this resolution. Please upload a high-contrast image or use manual annotation.")
                  : "No detected floor plan elements match this filter selection."}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = !!expandedWhyIds[item.id];

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                >
                  {/* Object Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {item.objectName}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Zone: {item.zone}
                        </span>
                      </h3>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${
                      item.statusType === "CORRECT"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : item.statusType === "NEEDS_IMPROVEMENT"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Body Content */}
                  {item.statusType === "CORRECT" ? (
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <p className="leading-relaxed">
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">Explanation: </strong>
                        {item.explanation}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                      <p className="leading-relaxed">
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">Problem: </strong>
                        {item.problem}
                      </p>
                      {item.possibleEffect && (
                        <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">Possible Effect: </strong>
                          {item.possibleEffect}
                        </p>
                      )}
                      
                      {/* Available Remedies — consultant or user selects one */}
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono block flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Available Remedies (select one)
                        </span>
                        {(item.suggestedRemedies && item.suggestedRemedies.length > 0
                          ? item.suggestedRemedies
                          : item.suggestedRemedy
                          ? [item.suggestedRemedy]
                          : []
                        ).map((remedy, remedyIdx) => (
                          <p
                            key={remedyIdx}
                            className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed"
                          >
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold mr-1">
                              Option {remedyIdx + 1}:
                            </span>
                            {remedy}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expandable WHY? Section (Rules 5 & 6) */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <button
                      onClick={(e) => toggleWhy(item.id, e)}
                      className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer py-1"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? "Hide Technical Reasoning (WHY?)" : "WHY? (Technical & Architectural Reasoning)"}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-700 dark:text-slate-300 animate-in fade-in duration-150">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          <div><span className="text-slate-400 font-normal">Detection Method:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{item.why.detectionMethod}</span></div>
                          <div><span className="text-slate-400 font-normal">Detected OCR Label:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{item.why.detectedOcrLabel}</span></div>
                          <div><span className="text-slate-400 font-normal">Detection Confidence:</span> <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.why.detectionConfidence}</span></div>
                          <div><span className="text-slate-400 font-normal">Detected Centroid:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{item.why.detectedCentroid}</span></div>
                          <div><span className="text-slate-400 font-normal">Calculated Angle:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{item.why.calculatedAngle}</span></div>
                          <div><span className="text-slate-400 font-normal">Calculated Zone:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{item.why.calculatedZone}</span></div>
                          <div><span className="text-slate-400 font-normal">Applied Rule:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{item.why.appliedRule}</span></div>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                          <span className="text-slate-400 font-normal block mb-0.5">Rule Application Reasoning:</span>
                          <p className="font-sans text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                            {item.why.reason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            Close Panel
          </button>

          <button
            onClick={onGenerateReport}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Generate PDF Audit Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
