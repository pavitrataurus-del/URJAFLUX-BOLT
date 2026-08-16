import React, { useState } from "react";
import { ConsultantIntelligenceService } from "../../engines/decision/ConsultantIntelligenceService";
import { PropertyComparisonResult } from "../../engines/decision/types";
import { RecognizedEntity } from "../../recognition/types";
import { DoshaItem } from "../../services/vastuAnalysisOrchestrator";
import { 
  Briefcase, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  ArrowRightLeft, 
  Database, 
  Save, 
  FileCheck,
  Building2,
  TrendingUp
} from "lucide-react";

interface ConsultantSuitePanelProps {
  entities: RecognizedEntity[];
  doshas: DoshaItem[];
  overallScore: number;
}

export default function ConsultantSuitePanel({ entities, doshas, overallScore }: ConsultantSuitePanelProps) {
  const [activeTab, setActiveTab] = useState<"overrides" | "remedies" | "comparison" | "analytics">("overrides");

  // Override Form State
  const [selectedEntityId, setSelectedEntityId] = useState<string>(entities[0]?.id || "");
  const [newTypeName, setNewTypeName] = useState("");
  const [consultantNotes, setConsultantNotes] = useState("");
  const [overrideSavedMsg, setOverrideSavedMsg] = useState("");

  // Comparison State
  const [comparisonResult, setComparisonResult] = useState<PropertyComparisonResult | null>(null);

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  const handleSaveOverride = () => {
    if (!selectedEntity || !newTypeName) return;
    ConsultantIntelligenceService.saveOverride(
      selectedEntity.id,
      selectedEntity.name,
      selectedEntity.type,
      newTypeName,
      newTypeName,
      consultantNotes
    );
    setOverrideSavedMsg(`Classification override saved for '${selectedEntity.name}' -> '${newTypeName}'`);
    setTimeout(() => setOverrideSavedMsg(""), 3000);
  };

  const handleRemedyAction = (remedyId: string, status: "ACCEPTED" | "REJECTED") => {
    ConsultantIntelligenceService.setRemedyStatus(remedyId, status);
  };

  const handleRunComparison = () => {
    // Phase 4: Zero Fabrication Policy. Require authentic property snapshot history.
    // Synthetic score subtraction is strictly prohibited.
    setComparisonResult(null);
  };

  const overridesList = ConsultantIntelligenceService.getOverrides();
  const remedyStatuses = ConsultantIntelligenceService.getRemedyStatuses();
  const analyticsList = ConsultantIntelligenceService.getAnonymousAnalytics();

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      {/* PANEL HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-900 text-amber-400 rounded-xl border border-slate-800">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Consultant Workstation & Intelligence Suite</h3>
            <p className="text-[11px] text-slate-500">Overrides, Remedy Sign-offs, Version Comparisons & Telemetry</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overrides")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === "overrides" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Entity Overrides</span>
        </button>

        <button
          onClick={() => setActiveTab("remedies")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === "remedies" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Remedy Approvals</span>
        </button>

        <button
          onClick={() => setActiveTab("comparison")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === "comparison" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Layout Version Compare</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === "analytics" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Anonymous Dataset</span>
        </button>
      </div>

      {/* TAB 1: OVERRIDES */}
      {activeTab === "overrides" && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Consultant Recognition Override Form
            </span>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-mono">Select Entity to Override:</label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              >
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name} ({ent.type}) - Zone: {ent.zone}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-mono">Corrected Classification / Function:</label>
              <input
                type="text"
                placeholder="e.g. Pooja Room, Master Bedroom, Septic Tank"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-mono">Consultant Professional Notes:</label>
              <textarea
                placeholder="Reason for manual classification override..."
                value={consultantNotes}
                onChange={(e) => setConsultantNotes(e.target.value)}
                rows={2}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>

            <button
              onClick={handleSaveOverride}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Professional Override</span>
            </button>

            {overrideSavedMsg && (
              <p className="text-[11px] font-bold text-emerald-600 text-center animate-fade-in">
                {overrideSavedMsg}
              </p>
            )}
          </div>

          {/* OVERRIDES AUDIT HISTORY */}
          {overridesList.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                Active Consultant Overrides ({overridesList.length})
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto font-mono text-[11px]">
                {overridesList.map((ovr) => (
                  <div key={ovr.id} className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex justify-between">
                    <div>
                      <span className="font-bold">{ovr.originalName}</span> → <span className="font-bold text-indigo-700">{ovr.overriddenType}</span>
                      <p className="text-[10px] text-amber-800 font-sans mt-0.5">{ovr.consultantNotes}</p>
                    </div>
                    <span className="text-[9px] text-amber-600">{ovr.timestamp.slice(11, 16)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REMEDY APPROVALS */}
      {activeTab === "remedies" && (
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
            Consultant Remedy Acceptance Sign-off ({doshas.length} Remedies)
          </span>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {doshas.map((dosha, idx) => {
              const remedyId = `REM-${idx + 1}`;
              const currentStatus = remedyStatuses[remedyId]?.status || "PENDING";

              return (
                <div key={dosha.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{dosha.title}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      currentStatus === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" :
                      currentStatus === "REJECTED" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {currentStatus}
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px]">{dosha.remedy}</p>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
                    <button
                      onClick={() => handleRemedyAction(remedyId, "ACCEPTED")}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Accept Remedy</span>
                    </button>
                    <button
                      onClick={() => handleRemedyAction(remedyId, "REJECTED")}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Reject Remedy</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LAYOUT VERSION COMPARISON */}
      {activeTab === "comparison" && (
        <div className="space-y-3">
          <button
            onClick={handleRunComparison}
            className="w-full py-2.5 bg-slate-900 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-slate-800"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Generate Side-By-Side Property Version Comparison</span>
          </button>

          {!comparisonResult ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
              <p className="text-xs font-bold text-slate-700 font-mono">Comparison unavailable.</p>
              <p className="text-[11px] text-slate-500">No historical version found. Upload a prior property version to execute comparison audit.</p>
            </div>
          ) : (
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 font-mono text-[11px]">VERSION COMPARISON REPORT</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">+{comparisonResult.scoreDelta}% SCORE GAIN</span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">{comparisonResult.versionA.label}</span>
                  <span className="text-xl font-bold text-rose-400">{comparisonResult.versionA.overallScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">{comparisonResult.versionA.defectCount} Defect Items</span>
                </div>

                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">{comparisonResult.versionB.label}</span>
                  <span className="text-xl font-bold text-emerald-400">{comparisonResult.versionB.overallScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">{comparisonResult.versionB.defectCount} Defect Items</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-200 space-y-1">
                <span className="font-bold text-[10px] uppercase font-mono block text-emerald-400">Resolved Energy Defects:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {comparisonResult.resolvedDefects.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] text-slate-300 italic">{comparisonResult.improvementSummary}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANONYMOUS DATASET */}
      {activeTab === "analytics" && (
        <div className="space-y-2 font-mono text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            Anonymous Platform Improvement Telemetry ({analyticsList.length} Entries)
          </span>

          <p className="text-[11px] text-slate-500 font-sans">
            Tracks recognition corrections & remedy acceptance anonymously to continuously calibrate platform rules without exposing client blueprints.
          </p>

          <div className="p-3 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 max-h-48 overflow-y-auto space-y-1 text-[10px]">
            {analyticsList.length === 0 ? (
              <p className="text-slate-500">No anonymous logs recorded yet in this session.</p>
            ) : (
              analyticsList.map((log, i) => (
                <div key={i} className="border-b border-slate-800 pb-1">
                  <span className="text-amber-400 font-bold">[{log.timestamp.slice(11, 19)}]</span> Entity: {log.entityType} | Overridden: {log.wasOverridden ? "YES" : "NO"} | Rule: {log.appliedRuleId}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
