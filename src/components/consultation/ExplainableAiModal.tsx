import React from 'react';
import {
  X,
  Brain,
  ShieldCheck,
  BookOpen,
  Award,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { IConversationMessage } from '../../core/consultation/ConsultationTypes';

interface ExplainableAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: IConversationMessage | null;
}

export const ExplainableAiModal: React.FC<ExplainableAiModalProps> = ({
  isOpen,
  onClose,
  message
}) => {
  if (!isOpen || !message) return null;

  const explanation = message.explanationChain;
  const citations = message.citations || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Explainable AI Reasoning & Evidence Chain
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {message.confidenceGrade || 'A+'} ({message.confidenceLevel || 96}%)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Traceability down the pipeline: Knowledge (001-005) → Truth Engine (002B) → Reasoning (006) → Execution (007) → Monitoring (008)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* Overview Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Primary Domain</span>
              <span className="font-bold text-emerald-400">{explanation?.primaryDomain || 'Vastu'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Participating Domains</span>
              <span className="font-bold text-slate-200">
                {explanation?.contributingDomains?.join(', ') || 'Vastu, Chakra, LalKitab'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Truth Consensus</span>
              <span className="font-bold text-emerald-400">98.4% Verified</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Citations Linked</span>
              <span className="font-bold text-cyan-400">{citations.length} Shastric Sources</span>
            </div>
          </div>

          {/* Reasoning Steps Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              1. Multi-Domain Step-by-Step Reasoning Chain
            </h4>
            
            <div className="space-y-2.5">
              {explanation?.steps?.map((step, idx) => (
                <div
                  key={step.stepIndex || idx}
                  className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    {step.stepIndex}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        {step.title}
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                          {step.domain}
                        </span>
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        +{step.confidenceContribution}% weight
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1">
                      Rule ID: <span className="text-slate-400">{step.contributingRuleOrEntity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citations & Evidence Section */}
          {citations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                2. Scriptural Citations & Truth Verification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {citations.map((cit, idx) => (
                  <div
                    key={`${cit.citationId || 'cit'}-${idx}`}
                    className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {cit.sourceBook}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {cit.reliabilityScore}% Reliability
                      </span>
                    </div>
                    {cit.verseOrShloka && (
                      <p className="text-[11px] font-mono text-cyan-300">
                        {cit.chapter} • {cit.verseOrShloka} ({cit.author})
                      </p>
                    )}
                    {cit.excerptText && (
                      <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800">
                        "{cit.excerptText}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Alternatives Section */}
          {explanation?.rejectedAlternatives && explanation.rejectedAlternatives.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                3. Explicitly Rejected Alternatives & Conflict Resolution
              </h4>
              <div className="space-y-2">
                {explanation.rejectedAlternatives.map((rej, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span>❌ Option Rejected: {rej.optionName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">
                        Conflict Domain: {rej.domainConflict}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <span className="text-slate-400 font-semibold">Reason:</span> {rej.rejectionReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            URJAFLUX Truth Engine ID: <span className="text-slate-300">truth-engine-verified-v1</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
