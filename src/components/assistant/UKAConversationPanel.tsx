/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 6 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Interactive Consultation Workspace
 * 
 * UKAConversationPanel.tsx: Primary Professional Consultation Conversation Interface.
 * Renders executive consultation cards (No casual chat bubbles).
 * Displays Observation, Explanation, Evidence, Recommendation, Benefit, Next Step, Review Status.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  ShieldCheck,
  Lock,
  Compass,
  CheckCircle2,
  FileText,
  Globe,
  Award,
  Layers,
  Cpu,
  ChevronDown
} from "lucide-react";
import {
  ProfessionalConsultationResult,
  UKAUserRole,
  UKALanguage,
  UKAConsultationStyle
} from "../../assistant/UKATypes";

export interface ConsultationTurn {
  turnId: string;
  userQuestion: string;
  result: ProfessionalConsultationResult;
  timestamp: string;
}

interface UKAConversationPanelProps {
  turns: ConsultationTurn[];
  userRole: UKAUserRole;
  selectedLanguage: UKALanguage;
  consultationStyle: UKAConsultationStyle;
  visitorUsage: { questionsUsed: number; maxFreeQuestions: number; gatingPromptDisplayed: boolean };
  isLoading: boolean;
  onSubmitQuestion: (question: string) => void;
  onLanguageChange: (lang: UKALanguage) => void;
  onStyleChange: (style: UKAConsultationStyle) => void;
  onUpgradeRequest?: () => void;
}

export const UKAConversationPanel: React.FC<UKAConversationPanelProps> = ({
  turns,
  userRole,
  selectedLanguage,
  consultationStyle,
  visitorUsage,
  isLoading,
  onSubmitQuestion,
  onLanguageChange,
  onStyleChange,
  onUpgradeRequest
}) => {
  const [questionInput, setQuestionInput] = useState("");
  const [expandedDiagnostics, setExpandedDiagnostics] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isGated = userRole === "VISITOR" && visitorUsage.questionsUsed >= visitorUsage.maxFreeQuestions;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || isLoading) return;
    onSubmitQuestion(questionInput.trim());
    setQuestionInput("");
  };

  const toggleDiagnostics = (turnId: string) => {
    setExpandedDiagnostics((prev) => ({
      ...prev,
      [turnId]: !prev[turnId]
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 shadow-xl flex flex-col h-full min-h-[600px] gap-4">
      {/* Top Consultation Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Professional Consultation Workspace
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                NON-LLM CANON
              </span>
            </h2>
            <p className="text-xs text-slate-400">URJAFLUX Knowledge Assistant (UKA) spatial decision engine</p>
          </div>
        </div>

        {/* Language & Style Selector Chips */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 gap-1 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as UKALanguage)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="EN" className="bg-slate-900">English (EN)</option>
              <option value="HI" className="bg-slate-900">Hindi (HI)</option>
              <option value="HINGLISH" className="bg-slate-900">Hinglish</option>
            </select>
          </div>

          {/* Consultation Style Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 gap-1 text-xs text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={consultationStyle}
              onChange={(e) => onStyleChange(e.target.value as UKAConsultationStyle)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="PROFESSIONAL_CONSULTANT" className="bg-slate-900">Professional Consultant</option>
              <option value="SIMPLE_HOMEOWNER" className="bg-slate-900">Simple Homeowner</option>
              <option value="TRADITIONAL_SCHOLAR" className="bg-slate-900">Traditional Scholar</option>
              <option value="BUILDER" className="bg-slate-900">Builder</option>
              <option value="ARCHITECT" className="bg-slate-900">Architect</option>
              {userRole === "FOUNDER" && <option value="FOUNDER" className="bg-slate-900">Founder Mode</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Visitor Free Consultation Quota Bar */}
      {userRole === "VISITOR" && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">
              Visitor Tier Access: <span className="text-emerald-400 font-mono">{Math.max(0, visitorUsage.maxFreeQuestions - visitorUsage.questionsUsed)}</span> of {visitorUsage.maxFreeQuestions} free consultations remaining
            </span>
          </div>
          {isGated ? (
            <button
              onClick={onUpgradeRequest}
              className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded text-[11px] shadow-md transition-all"
            >
              Unlock Unlimited Membership
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-mono">2 Free Questions Included</span>
          )}
        </div>
      )}

      {/* Consultation Turn Stream */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 max-h-[550px]">
        {turns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl my-auto">
            <Compass className="w-12 h-12 text-emerald-400/60 mb-3 animate-pulse" />
            <h3 className="text-base font-semibold text-slate-200">Interactive Vastu Spatial Consultation</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Ask any spatial, Vastu, or architectural question regarding your property. URJAFLUX UKA provides evidence-based, canonical spatial evaluation.
            </p>
          </div>
        ) : (
          turns.map((turn) => {
            const { turnId, userQuestion, result, timestamp } = turn;
            const sections = result.structuredSections;
            const audit = result.founderAuditPackage;

            return (
              <div
                key={turnId}
                className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden"
              >
                {/* User Inquiry Header Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded mt-0.5">
                      INQUIRY
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{userQuestion}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{timestamp}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 rounded-full flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {sections?.professionalReviewStatus || "PEER_APPROVED"}
                  </span>
                </div>

                {/* Gating Notice Banner */}
                {result.isMembershipGated && (
                  <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-3 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{result.publicResponseText}</span>
                    </div>
                    <button
                      onClick={onUpgradeRequest}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-[11px] shrink-0"
                    >
                      Upgrade
                    </button>
                  </div>
                )}

                {/* Structured Professional Consultation Output */}
                {!result.isMembershipGated && sections && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Observation */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        1. Spatial Observation
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">{sections.observation}</p>
                    </div>

                    {/* 2. Explanation */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        2. Expert Explanation
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">{sections.explanation}</p>
                    </div>

                    {/* 3. Supporting Evidence */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col gap-1 md:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        3. Canonical Supporting Evidence
                      </span>
                      <p className="text-xs text-slate-200 font-mono bg-slate-950/80 p-2.5 rounded border border-slate-800/90 leading-relaxed">
                        {sections.supportingEvidence}
                      </p>
                    </div>

                    {/* 4. Recommendation */}
                    <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3.5 flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        4. Actionable Recommendation
                      </span>
                      <p className="text-xs text-emerald-100 leading-relaxed">{sections.professionalRecommendation}</p>
                    </div>

                    {/* 5. Expected Benefit */}
                    <div className="bg-teal-950/30 border border-teal-800/50 rounded-lg p-3.5 flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        5. Expected Benefit
                      </span>
                      <p className="text-xs text-teal-100 leading-relaxed">{sections.expectedBenefit}</p>
                    </div>

                    {/* 6. Suggested Next Steps */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 md:col-span-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium">
                          Suggested Next Steps: {sections.suggestedNextSteps?.join(" | ") || "Proceed with implementation"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Founder Mode Diagnostics Collapsible */}
                {userRole === "FOUNDER" && audit && (
                  <div className="border-t border-slate-800 pt-3 mt-1">
                    <button
                      onClick={() => toggleDiagnostics(turnId)}
                      className="w-full text-left flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 font-mono font-medium"
                    >
                      <span className="flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        FOUNDER DIAGNOSTICS & SYSTEM AUDIT PACKAGE
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedDiagnostics[turnId] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedDiagnostics[turnId] && (
                      <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-indigo-900/60 font-mono text-[11px] text-slate-300 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-slate-400">Execution Time:</span> {audit.processingDurationMs}ms</div>
                          <div><span className="text-slate-400">Confidence:</span> {audit.confidenceBreakdown?.overallConfidence || 100}%</div>
                          <div><span className="text-slate-400">Role Check:</span> {audit.permissionChecks?.role} ({audit.permissionChecks?.allowed ? "ALLOWED" : "DENIED"})</div>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-1">Modules Consulted:</span>
                          <div className="flex flex-wrap gap-1">
                            {audit.modulesConsulted?.map((m, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px]">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-1">Evidence Sources Used:</span>
                          <div className="flex flex-wrap gap-1">
                            {audit.evidenceSourcesUsed?.map((src, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded text-[10px]">
                                {src}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Question Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 pt-3 flex flex-col gap-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            disabled={isLoading || isGated}
            placeholder={
              isGated
                ? "Visitor free question quota reached. Upgrade to continue consultation..."
                : "Ask any spatial consultation question (e.g. 'What is the Vastu remedy for South-East Kitchen?')..."
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500/70 transition-all shadow-inner pr-12"
          />
          <button
            type="submit"
            disabled={isLoading || isGated || !questionInput.trim()}
            className="absolute right-2.5 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Non-LLM Canonical Rules & Padavinyasa Matrix Engine</span>
          <span>Role: {userRole}</span>
        </div>
      </form>
    </div>
  );
};
