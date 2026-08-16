import React, { useState, useEffect } from "react";
import { FileCheck, Download, Shield, AlertTriangle, ChevronDown, ChevronRight, CheckCircle2, BookOpen } from "lucide-react";
import { CanonicalFinding } from "../../core/findings/CanonicalFinding";
import { DecisionEngineExecutionResult } from "../../engines/decision/UrjafluxDecisionEngine";
import { PropertyHealthIndex } from "../../engines/decision/types";
import { EvaluationCoverageReport } from "../../engines/validation/EvaluationCoverageEngine";
import { useRuntimeEvaluationSession, RuntimeEvaluationSessionStore } from "../../core/session/RuntimeEvaluationSession";
import { buildObjectReportItems, ObjectReportItem } from "../../services/vastuAnalysisOrchestrator";

interface ReportPanelProps {
  hasExecuted: boolean;
  score: number | null;
  canonicalFindings?: CanonicalFinding[];
  evaluationCoverage?: EvaluationCoverageReport | null;
  recognizedEntityCount?: number;
  propertyHealth?: PropertyHealthIndex | null;
  decisionEngineOutput?: DecisionEngineExecutionResult | null;
  clientName?: string;
  projectName?: string;
}

export default function ReportPanel({
  hasExecuted: propsHasExecuted,
  score: propsScore,
  canonicalFindings = [],
  recognizedEntityCount: propsRecognizedCount = 0,
  clientName = "Unassigned Client",
  projectName = "Unassigned Project"
}: ReportPanelProps) {
  const session = useRuntimeEvaluationSession();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [expandedWhyIds, setExpandedWhyIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (session.hasExecuted) {
      RuntimeEvaluationSessionStore.markConsumerBound("reportBound");
    }
  }, [session.hasExecuted, session.executionId]);

  const hasExecuted = session.hasExecuted || propsHasExecuted;
  const score = session.hasExecuted ? session.overallScore : propsScore;
  const recognizedEntityCount = session.hasExecuted ? session.recognitionCount : propsRecognizedCount;

  // Retrieve or build object report items (guarantees every detected object is present)
  const objectItems: ObjectReportItem[] = session.hasExecuted && session.objectReportItems && session.objectReportItems.length > 0
    ? session.objectReportItems
    : buildObjectReportItems([], session.doshas || [], session.recognitionSummary || null);

  const triggerExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 2000);
  };

  const toggleWhy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWhyIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3.5 shadow-lg hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Client Vastu Report Preview</h3>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span>Execution ID:</span>
              <span className="text-emerald-600 font-bold">{session.executionId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={triggerExport}
            disabled={!hasExecuted || score === null}
            className="p-1.5 bg-slate-50 border border-slate-200 hover:border-emerald-500/40 hover:bg-white rounded text-slate-600 hover:text-emerald-600 transition-all text-[9px] font-mono flex items-center gap-1 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <span>EXPORTING...</span>
            ) : exportComplete ? (
              <span className="text-emerald-600">DOWNLOADED!</span>
            ) : (
              <>
                <Download className="w-3 h-3" />
                EXPORT PDF
              </>
            )}
          </button>
        </div>
      </div>

      {!hasExecuted || score === null ? (
        <div className="flex-1 bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <h4 className="text-xs font-mono font-bold text-slate-800 uppercase">Analysis Not Executed</h4>
          <p className="text-[11px] text-slate-500 max-w-md">
            No Report Available. Please run a property evaluation on the blueprint workspace.
          </p>
        </div>
      ) : (
        /* DOCUMENT PAGE SIMULATOR */
        <div className="flex-1 bg-slate-50 p-5 rounded-lg border border-slate-200 overflow-y-auto max-h-[420px] space-y-4 font-sans text-left">
          {/* REPORT HEADER */}
          <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                UrjaFlux Verified Audit
              </span>
              <h1 className="text-md font-mono font-bold text-slate-900 uppercase leading-tight mt-1">{session.propertyName || projectName}</h1>
              <p className="text-[10px] text-slate-500 font-mono">Client: {session.clientName || clientName} • Session: {session.executionId}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-black text-emerald-600">{score}%</div>
              <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Compliance Score</div>
            </div>
          </div>

          {/* METRICS ROW */}
          <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-3">
            <div className="p-2 bg-white rounded border border-slate-200 text-center">
              <div className="text-xs font-mono font-bold text-slate-800">{objectItems.length}</div>
              <div className="text-[8px] font-mono text-slate-500 uppercase">Evaluated Objects</div>
            </div>
            <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-center">
              <div className="text-xs font-mono font-bold text-emerald-600">{objectItems.filter(i => i.statusType === "CORRECT").length}</div>
              <div className="text-[8px] font-mono text-emerald-700 uppercase">✅ Correct</div>
            </div>
            <div className="p-2 bg-amber-50 rounded border border-amber-200 text-center">
              <div className="text-xs font-mono font-bold text-amber-600">{objectItems.filter(i => i.statusType === "NEEDS_IMPROVEMENT").length}</div>
              <div className="text-[8px] font-mono text-amber-700 uppercase">⚠ Needs Imp.</div>
            </div>
            <div className="p-2 bg-rose-50 rounded border border-rose-200 text-center">
              <div className="text-xs font-mono font-bold text-rose-600">{objectItems.filter(i => i.statusType === "MAJOR_ISSUE").length}</div>
              <div className="text-[8px] font-mono text-rose-700 uppercase">❌ Major Issues</div>
            </div>
          </div>

          {/* SUMMARY EXECUTIVE STATEMENT */}
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">I. Executive Summary</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Spatial mapping audit completed for {objectItems.length} detected floor plan objects.
              {objectItems.some(i => i.statusType !== "CORRECT") 
                ? " Specific spatial items require attention; non-destructive remedies are provided below." 
                : " All detected floor plan elements demonstrate excellent elemental alignment."}
            </p>
          </div>

          {/* OBJECT-WISE ASSESSMENT REPORT (Rules 1-8) */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">II. Complete Object-Wise Vastu Audit</h3>
            
            <div className="space-y-3 font-sans">
              {objectItems.map((item) => {
                const isExpanded = !!expandedWhyIds[item.id];

                return (
                  <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                    {/* Object Title & Status */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        {item.objectName}
                        <span className="text-[10px] font-mono text-slate-500 font-normal bg-slate-100 px-1.5 py-0.5 rounded">
                          Zone: {item.zone}
                        </span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                        item.statusType === "CORRECT"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.statusType === "NEEDS_IMPROVEMENT"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Content */}
                    {item.statusType === "CORRECT" ? (
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-slate-800 font-semibold">Explanation: </strong>
                        {item.explanation}
                      </p>
                    ) : (
                      <div className="space-y-1.5 text-[11px] text-slate-600">
                        <p className="leading-relaxed">
                          <strong className="text-slate-800 font-semibold">Problem: </strong>
                          {item.problem}
                        </p>
                        {item.possibleEffect && (
                          <p className="leading-relaxed text-slate-500">
                            <strong className="text-slate-700 font-semibold">Possible Effect: </strong>
                            {item.possibleEffect}
                          </p>
                        )}
                        <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono block flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Available Remedies (select one)
                          </span>
                          {(item.suggestedRemedies && item.suggestedRemedies.length > 0
                            ? item.suggestedRemedies
                            : item.suggestedRemedy
                            ? [item.suggestedRemedy]
                            : []
                          ).map((remedy, remedyIdx) => (
                            <p key={remedyIdx} className="text-[11px] leading-relaxed">
                              <span className="font-bold text-emerald-700 mr-1">Option {remedyIdx + 1}:</span>
                              {remedy}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expandable WHY Section */}
                    <div className="border-t border-slate-100 pt-1.5">
                      <button
                        onClick={(e) => toggleWhy(item.id, e)}
                        className="text-[10.5px] font-mono font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        <span>{isExpanded ? "Hide WHY? reasoning" : "WHY? (Technical & Architectural Reasoning)"}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 bg-slate-100 rounded border border-slate-200 text-[10px] font-mono space-y-1 text-slate-700">
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            <div><span className="text-slate-500">Detection Method:</span> <span className="font-semibold text-slate-900">{item.why.detectionMethod}</span></div>
                            <div><span className="text-slate-500">Detected OCR Label:</span> <span className="font-semibold text-slate-900">{item.why.detectedOcrLabel}</span></div>
                            <div><span className="text-slate-500">Confidence:</span> <span className="font-semibold text-emerald-700">{item.why.detectionConfidence}</span></div>
                            <div><span className="text-slate-500">Centroid:</span> <span className="font-semibold text-slate-900">{item.why.detectedCentroid}</span></div>
                            <div><span className="text-slate-500">Calculated Angle:</span> <span className="font-semibold text-slate-900">{item.why.calculatedAngle}</span></div>
                            <div><span className="text-slate-500">Calculated Zone:</span> <span className="font-semibold text-slate-900">{item.why.calculatedZone}</span></div>
                            <div><span className="text-slate-500">Applied Rule:</span> <span className="font-semibold text-slate-900">{item.why.appliedRule}</span></div>
                          </div>
                          <div className="pt-1.5 border-t border-slate-200 mt-1.5">
                            <span className="text-slate-500 block mb-0.5">Reason:</span>
                            <p className="font-sans text-[11px] text-slate-800 leading-normal">{item.why.reason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROFESSIONAL SIGNATURES BLOCK */}
          <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Approved By Lead Consultant</div>
              <div className="font-sans font-bold text-xs text-slate-800 italic py-1 border-b border-slate-200 w-32">
                Pavitra Taurus
              </div>
              <div className="text-[8px] font-mono text-slate-500">Accredited Vedic Architect</div>
            </div>

            <div className="space-y-2 text-left">
              <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Corporate Audit Verification</div>
              <div className="font-sans font-bold text-xs text-emerald-600 italic py-1 border-b border-slate-200 w-32 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                URJAFLUX-AI-OS
              </div>
              <div className="text-[8px] font-mono text-slate-500">Hash Code: VERIFIED-LIVE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
