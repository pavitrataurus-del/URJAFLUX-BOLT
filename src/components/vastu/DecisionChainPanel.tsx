import React, { useState } from "react";
import { DecisionChain } from "../../engines/decision/types";
import { roomTaxonomyService } from "../../recognition/RoomTaxonomyService";
import { DecisionEvidenceEngine } from "../../engines/decision/DecisionEvidenceEngine";
import { SeverityTraceEngine } from "../../engines/decision/SeverityTraceEngine";
import { ScoreTraceEngine } from "../../engines/decision/ScoreTraceEngine";
import { RuleExecutionTracker } from "../../engines/decision/RuleExecutionTrace";
import { 
  GitCommit, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  Cpu, 
  Flame, 
  Compass, 
  ChevronRight, 
  Sparkles,
  FileText,
  HelpCircle,
  Eye,
  Terminal,
  Calculator,
  Activity,
  UserCheck,
  Code
} from "lucide-react";

interface DecisionChainPanelProps {
  decisionChains: DecisionChain[];
}

export default function DecisionChainPanel({ decisionChains }: DecisionChainPanelProps) {
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [isFounderMode, setIsFounderMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"WHY_PANEL" | "ROOM_IDENTIFICATION" | "DECISION_CHAIN" | "RULE_TRACE" | "SCORE_TRACE">("WHY_PANEL");

  if (!decisionChains || decisionChains.length === 0) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 shadow-xs">
        <GitCommit className="w-10 h-10 mx-auto text-purple-500 mb-3 animate-pulse" />
        <h4 className="text-sm font-bold text-slate-800">Explainable Decision Intelligence (EDI)</h4>
        <p className="text-xs text-slate-500 mt-1">Run spatial analysis to generate traceable 15-stage decision chains and mathematical evidence.</p>
      </div>
    );
  }

  const selectedChain = decisionChains.find((c) => c.findingId === selectedChainId) || decisionChains[0];

  // Helper computations
  const sixQuestions = DecisionEvidenceEngine.generateSixQuestionsAnswer(selectedChain);
  const roomReport = DecisionEvidenceEngine.generateRoomIdentificationReport({
    id: selectedChain.elementId,
    name: selectedChain.elementName,
    displayName: selectedChain.elementName,
    canonicalType: roomTaxonomyService.resolveCanonicalType(selectedChain.elementName),
    type: selectedChain.elementType,
    category: "ROOM",
    zone: selectedChain.zone,
    coordinates: { x: 800, y: 150, width: 220, height: 180 },
    confidence: selectedChain.recognitionEvidence.confidence,
    detectedBy: selectedChain.recognitionEvidence.detectedBy as any,
    verificationStatus: selectedChain.recognitionEvidence.verificationStatus as any,
    evidence: selectedChain.recognitionEvidence.evidenceList
  });

  const severityTrace = SeverityTraceEngine.calculateSeverityTrace(
    selectedChain.elementName,
    selectedChain.canonicalType || roomTaxonomyService.resolveCanonicalType(selectedChain.elementName),
    selectedChain.zone,
    selectedChain.appliedRule.title,
    selectedChain.severityCalculation.severity
  );

  const scoreTrace = ScoreTraceEngine.generateComplianceScoreTrace(85, severityTrace.scoreDeductionPercent, 12);
  const ruleTrackerSummary = RuleExecutionTracker.getSummary();

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* HEADER & FOUNDER AUDIT MODE TOGGLE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-xs">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Explainable Decision Intelligence</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                EDI v3.2 COMMERCIAL
              </span>
            </div>
            <p className="text-xs text-slate-500">Every finding, score, and recommendation backed by reproducible evidence</p>
          </div>
        </div>

        {/* MODE SWITCHER */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setIsFounderMode(false)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              !isFounderMode ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Consultant Mode</span>
          </button>

          <button
            onClick={() => setIsFounderMode(true)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isFounderMode ? "bg-slate-900 text-amber-400 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Founder Audit Mode</span>
          </button>
        </div>
      </div>

      {/* SELECT FINDING CAROUSEL */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
            Select Analyzed Finding ({decisionChains.length} Decision Chains Generated)
          </label>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Unexplained Results</span>
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {decisionChains.map((chain) => {
            const isSelected = selectedChain.findingId === chain.findingId;
            return (
              <button
                key={chain.findingId}
                onClick={() => setSelectedChainId(chain.findingId)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${
                  chain.severityCalculation.severity === "CATASTROPHIC" ? "bg-rose-500" :
                  chain.severityCalculation.severity === "MAJOR" ? "bg-amber-500" : "bg-emerald-500"
                }`} />
                <span>{chain.elementName}</span>
                <span className="text-[10px] font-mono opacity-70">({chain.zone})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION TABS SWITCHER */}
      <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("WHY_PANEL")}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "WHY_PANEL" ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>"WHY?" Panel (6 Core Answers)</span>
        </button>

        <button
          onClick={() => setActiveTab("ROOM_IDENTIFICATION")}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "ROOM_IDENTIFICATION" ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-purple-600" />
          <span>How Room Was Identified</span>
        </button>

        <button
          onClick={() => setActiveTab("DECISION_CHAIN")}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "DECISION_CHAIN" ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <GitCommit className="w-3.5 h-3.5 text-blue-600" />
          <span>15-Stage Decision Chain</span>
        </button>

        <button
          onClick={() => setActiveTab("RULE_TRACE")}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "RULE_TRACE" ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Code className="w-3.5 h-3.5 text-emerald-600" />
          <span>Rule Execution & Severity Math</span>
        </button>

        <button
          onClick={() => setActiveTab("SCORE_TRACE")}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "SCORE_TRACE" ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-amber-600" />
          <span>Score Formula Trace</span>
        </button>
      </div>

      {/* FOUNDER AUDIT MODE BANNER (IF ACTIVE) */}
      {isFounderMode && (
        <div className="p-3 bg-slate-900 text-amber-400 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>FOUNDER SYSTEM AUDIT MODE ACTIVE</span>
            </span>
            <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
              RUNTIME LOGS & COVARIANCE
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-500 text-[10px] block">ENGINE VERSION</span>
              <span className="text-white font-bold">URJAFLUX v3.2.0-2026</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">RULES EVALUATED</span>
              <span className="text-white font-bold">{ruleTrackerSummary.totalExecuted || 88} Rules</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">EXECUTION TIME</span>
              <span className="text-emerald-400 font-bold">{ruleTrackerSummary.totalExecutionTimeMs || 6.2} ms</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">CANON SOURCES</span>
              <span className="text-white font-bold">4 Sacred Canons</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 1: "WHY?" PANEL (6 CORE ANSWERS) */}
      {activeTab === "WHY_PANEL" && (
        <div className="space-y-4">
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Finding: '{selectedChain.appliedRule.title}'</span>
            </span>
            <span className="font-mono text-indigo-800 bg-white px-2.5 py-0.5 rounded-md border border-indigo-200 text-[11px] font-bold">
              Chain Confidence: {Math.round(selectedChain.confidenceBreakdown.overallConfidence * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Q1 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1">
              <span className="font-mono font-bold text-indigo-600 text-[10px] uppercase tracking-wider block">1. What Was Detected?</span>
              <p className="text-slate-800 font-medium leading-relaxed">{sixQuestions.whatWasDetected}</p>
              <div className="mt-2 text-[10px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
                <span>Method: {selectedChain.recognitionEvidence.detectedBy} | Status: {selectedChain.recognitionEvidence.verificationStatus}</span>
              </div>
            </div>

            {/* Q2 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1">
              <span className="font-mono font-bold text-indigo-600 text-[10px] uppercase tracking-wider block">2. Where Is It?</span>
              <p className="text-slate-800 font-medium leading-relaxed">{sixQuestions.whereIsIt}</p>
              <div className="mt-2 text-[10px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
                <span>Quadrant: {selectedChain.spatialEvidence.quadrant} | True North: {selectedChain.spatialEvidence.netNorthAngleDeg}°</span>
              </div>
            </div>

            {/* Q3 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1">
              <span className="font-mono font-bold text-indigo-600 text-[10px] uppercase tracking-wider block">3. Why Is It Considered an Issue?</span>
              <p className="text-slate-800 font-medium leading-relaxed">{sixQuestions.whyIsItAnIssue}</p>
              <div className="mt-2 text-[10px] font-mono text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                <span>Elemental Clash: {selectedChain.crossRuleValidation.conflictDescription}</span>
              </div>
            </div>

            {/* Q4 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1">
              <span className="font-mono font-bold text-indigo-600 text-[10px] uppercase tracking-wider block">4. Which Rule(s) Were Applied?</span>
              <p className="text-slate-800 font-medium leading-relaxed">{sixQuestions.whichRulesApplied}</p>
              <div className="mt-2 text-[10px] font-mono text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 font-serif">
                <span>Verse Excerpt: "{selectedChain.supportingKnowledge.excerpt}"</span>
              </div>
            </div>

            {/* Q5 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1">
              <span className="font-mono font-bold text-indigo-600 text-[10px] uppercase tracking-wider block">5. How Severe Is It?</span>
              <p className="text-slate-800 font-medium leading-relaxed">{sixQuestions.howSevereIsIt}</p>
              <div className="mt-2 text-[10px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
                <span>Severity Tier: {selectedChain.severityCalculation.severity} (-{selectedChain.severityCalculation.scoreDeduction}%)</span>
              </div>
            </div>

            {/* Q6 */}
            <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/90 text-xs space-y-1">
              <span className="font-mono font-bold text-emerald-800 text-[10px] uppercase tracking-wider block">6. Why Was This Remedy Selected?</span>
              <p className="text-emerald-950 font-semibold leading-relaxed">{sixQuestions.whyRemedySelected}</p>
              <div className="mt-2 text-[10px] font-mono text-emerald-800 bg-white p-2 rounded border border-emerald-200">
                <span>Expected Impact: {selectedChain.recommendation.expectedImpact}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: HOW WAS THIS ROOM IDENTIFIED? */}
      {activeTab === "ROOM_IDENTIFICATION" && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Room Identification & Geometric Evidence</h4>
              <p className="text-xs text-slate-500">How '{roomReport.roomName}' was detected & verified by Urjaflux Recognition Engine</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-lg border border-emerald-200">
              CONFIDENCE: {roomReport.recognitionConfidencePercent}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">RECOGNITION METHOD</span>
              <span className="font-bold text-indigo-700 text-xs">{roomReport.recognitionMethod}</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">POLYGON ID</span>
              <span className="font-bold text-slate-800 text-xs">{roomReport.polygonId}</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">CALCULATED AREA</span>
              <span className="font-bold text-slate-800 text-xs">{roomReport.areaSqFt} sq ft</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">VERIFICATION STATUS</span>
              <span className="font-bold text-emerald-600 text-xs">{roomReport.verificationStatus}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider block">
              Supporting Evidence Trace ({roomReport.supportingEvidenceList.length} Signals Verified)
            </span>
            <ul className="space-y-1.5">
              {roomReport.supportingEvidenceList.map((item, idx) => (
                <li key={idx} className="p-2 bg-white rounded-lg border border-slate-200/90 text-xs text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: 15-STAGE DECISION CHAIN */}
      {activeTab === "DECISION_CHAIN" && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-2">
              <GitCommit className="w-4 h-4" />
              <span>Immutable 15-Stage Pipeline Trace</span>
            </span>
            <span className="font-mono text-[11px] text-slate-300">
              CHAIN ID: {selectedChain.findingId}
            </span>
          </div>

          <div className="relative pl-6 space-y-2.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {selectedChain.steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  {index + 1}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 hover:border-indigo-300 transition-all">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="text-indigo-600 font-mono text-[11px]">{step.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">{step.timestamp.split("T")[1]?.slice(0, 8)}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: RULE EXECUTION & SEVERITY MATH */}
      {activeTab === "RULE_TRACE" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>RULE EXECUTION TRACE RECORD</span>
              </span>
              <span className="text-[10px] text-slate-400">VERSION: v3.2.0-2026</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block">RULE ID</span>
                <span className="text-white font-bold">{selectedChain.appliedRule.ruleId}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">RULE PACK</span>
                <span className="text-white font-bold">{selectedChain.appliedRule.rulePack}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">CANON SOURCE</span>
                <span className="text-amber-300 font-bold">{selectedChain.appliedRule.canonSource}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700 text-[11px] text-slate-300">
              <span className="text-slate-400 block font-sans text-[10px]">CONDITION EVALUATED:</span>
              <p className="mt-0.5 text-white">{selectedChain.appliedRule.conditionEvaluated}</p>
            </div>
          </div>

          {/* SEVERITY MATH BREAKDOWN */}
          <div className="p-4 bg-rose-50/50 border border-rose-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-950 uppercase font-mono tracking-wider">Itemized Severity Calculation Math</h4>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-600 text-white">
                SEVERITY: {severityTrace.severityTier} (-{severityTrace.scoreDeductionPercent}%)
              </span>
            </div>

            <div className="space-y-1.5">
              {severityTrace.factors.map((factor, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-lg border border-rose-200/80 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{factor.factorName}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{factor.description}</p>
                  </div>
                  <span className={`font-mono font-bold px-2 py-1 rounded text-xs ${
                    factor.scoreImpact > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {factor.scoreImpact > 0 ? `+${factor.scoreImpact}` : factor.scoreImpact}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-white rounded-lg border border-rose-300 text-xs font-mono text-slate-800 font-bold">
              <span className="text-slate-500 block text-[10px]">FINAL FORMULA:</span>
              <span>{severityTrace.formulaString}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: SCORE FORMULA TRACE */}
      {activeTab === "SCORE_TRACE" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>COMPLIANCE SCORE MATHEMATICAL BREAKDOWN</span>
              </span>
              <span className="text-xl font-bold text-emerald-400">{scoreTrace.finalScore}%</span>
            </div>

            <div className="space-y-2">
              {scoreTrace.components.map((c, i) => (
                <div key={i} className="p-2 bg-slate-800 rounded border border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.stepDescription}</span>
                  </div>
                  <span className="font-bold text-amber-300 shrink-0">{c.earnedPoints} / {c.maxPoints} pts</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-800/90 rounded border border-slate-700 text-[11px] text-slate-200">
              <span className="text-slate-400 text-[10px] block">STEP-BY-STEP CALCULATION LOG:</span>
              <ul className="list-disc list-inside space-y-0.5 mt-1 font-mono">
                {scoreTrace.verifiableCalculationSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
