import React, { useState } from "react";
import { 
  BrainCircuit, 
  Target, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Users, 
  Compass, 
  Edit3, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Hash, 
  Copy, 
  Check 
} from "lucide-react";
import { useRuntimeEvaluationSession } from "../../core/session/RuntimeEvaluationSession";
import { ClientDiscoveryModal } from "../discovery/ClientDiscoveryModal";

export const ClientContextProfileView: React.FC = () => {
  const session = useRuntimeEvaluationSession();
  const profile = session.clientContextProfile;
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!profile) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Client Context Profile Not Yet Generated
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Module-2 (CCIE) requires a completed Client Discovery record. Complete Module-1 Discovery to produce the consultant context profile.
          </p>
        </div>
        <button
          onClick={() => setIsDiscoveryOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Launch Client Discovery Engine</span>
        </button>

        <ClientDiscoveryModal 
          isOpen={isDiscoveryOpen} 
          onClose={() => setIsDiscoveryOpen(false)} 
        />
      </div>
    );
  }

  const priorityColorMap = {
    HIGH: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    LOW: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-500/30 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Client Context Intelligence Engine (CCIE)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  KIE Sprint-2 Module 2
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Structured Consultant Context — Downstream Context for All KIE Pipeline Modules
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDiscoveryOpen(true)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Edit Discovery Data</span>
          </button>
        </div>

        {/* METADATA STRIP */}
        <div className="pt-3 border-t border-indigo-900/60 flex flex-wrap items-center justify-between text-xs font-mono gap-3 text-indigo-200/90">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800">
              <Hash className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Client ID:</span>
              <span className="text-emerald-400 font-bold">{profile.clientId}</span>
              <button onClick={() => handleCopy(profile.clientId, "clientId")} className="hover:text-white ml-1">
                {copiedId === "clientId" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800">
              <Hash className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-slate-400">Consultation ID:</span>
              <span className="text-indigo-300 font-bold">{profile.consultationId}</span>
              <button onClick={() => handleCopy(profile.consultationId, "consultationId")} className="hover:text-white ml-1">
                {copiedId === "consultationId" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Context Generated: {new Date(profile.generatedAtTimestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* OVERARCHING CONSULTATION OBJECTIVE CARD */}
      <div className="p-5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/30 space-y-2">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Target className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Synthesized Consultation Objective</h3>
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 italic leading-relaxed">
          "{profile.consultationObjective}"
        </p>
      </div>

      {/* 2-COLUMN GRID OF CONSULTANT CONTEXT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. PROBLEM CLASSIFICATION & GOALS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                1 & 2. Client Concern & Goal Matrix
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-semibold border border-amber-500/20">
              {profile.problemClassification.totalProblemsCount} Concerns Identified
            </span>
          </div>

          {/* Primary Problem */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Primary Client Concern</span>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
              <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
                {profile.problemClassification.primaryProblem}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500 text-white font-bold">
                PRIMARY
              </span>
            </div>
          </div>

          {/* Secondary Problems */}
          {profile.problemClassification.secondaryProblems.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Secondary Client Concerns</span>
              <div className="flex flex-wrap gap-2">
                {profile.problemClassification.secondaryProblems.map((sec) => (
                  <span 
                    key={sec} 
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Primary Goal */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Primary Target Goal</span>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium leading-relaxed">
              "{profile.primaryGoalText}"
            </div>
          </div>
        </div>

        {/* 3. CONSULTATION PRIORITY & REASONING */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                3. Consultation Priority
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${priorityColorMap[profile.consultationPriority]}`}>
              PRIORITY: {profile.consultationPriority}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Priority Allocation Reasoning</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#070c18] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              {profile.priorityReasoning}
            </p>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 italic font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Consultation Priority guides response timing and non-invasive balancing focus.</span>
          </div>
        </div>

        {/* 4. CLIENT CONSTRAINTS SUMMARY */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                4. Property & Practical Constraints
              </h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Ownership Status:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.constraintsSummary.ownershipStatus}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Budget Constraint:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.constraintsSummary.budgetLevel}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">No Demolition Rule:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${profile.constraintsSummary.hasNoDemolitionRule ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30" : "bg-slate-100 text-slate-600"}`}>
                {profile.constraintsSummary.hasNoDemolitionRule ? "STRICT YES" : "NO"}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-[#070c18] rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              {profile.constraintsSummary.formattedSummary}
            </div>
          </div>
        </div>

        {/* 5. CLIENT PREFERENCE SUMMARY */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                5. Client Preferences & Deliverable Summary
              </h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Remedy Preference:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{profile.preferenceSummary.remedyStyle}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Report Language:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.preferenceSummary.preferredLanguage}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Report Deliverable Type:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{profile.preferenceSummary.preferredReportType}</span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-[#070c18] rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              {profile.preferenceSummary.formattedSummary}
            </div>
          </div>
        </div>

      </div>

      {/* 6. FAMILY CONTEXT SUMMARY */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Users className="w-4 h-4 text-sky-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            6. Family Composition Context
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 dark:bg-[#070c18] rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Total Occupants</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{profile.familyContextSummary.totalMembers} Members</span>
            <span className="text-[10px] text-slate-500 block truncate">{profile.familyContextSummary.breakdownText}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#070c18] rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Special Demographics</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.familyContextSummary.hasSeniorCitizens && <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-600 border border-purple-500/20 font-bold">Senior Citizen</span>}
              {profile.familyContextSummary.hasChildren && <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-600 border border-sky-500/20 font-bold">Children</span>}
              {profile.familyContextSummary.hasWorkingProfessionals && <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">Working Professionals</span>}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#070c18] rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Formatted Context Summary</span>
            <span className="text-xs text-slate-700 dark:text-slate-300 block font-normal leading-tight mt-1">
              {profile.familyContextSummary.formattedSummary}
            </span>
          </div>
        </div>
      </div>

      <ClientDiscoveryModal 
        isOpen={isDiscoveryOpen} 
        onClose={() => setIsDiscoveryOpen(false)} 
      />
    </div>
  );
};
