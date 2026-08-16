import React, { useState } from 'react';
import {
  Layers,
  Building2,
  FolderGit2,
  Activity,
  Brain,
  BookOpen,
  UserCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { IConversationContext } from '../../core/consultation/ConsultationTypes';
import { ConsultationContextManager } from '../../core/consultation/ConsultationContextManager';

interface ContextInspectorPanelProps {
  context: IConversationContext | null;
  onRefreshContext?: () => void;
}

export const ContextInspectorPanel: React.FC<ContextInspectorPanelProps> = ({
  context,
  onRefreshContext
}) => {
  const [activeSection, setActiveSection] = useState<string>('property');

  if (!context) {
    return (
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
        Loading active enterprise context...
      </div>
    );
  }

  const {
    userProfile,
    propertyContext,
    projectContext,
    monitoringContext,
    executionContext,
    recommendationContext,
    knowledgeContext
  } = context;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 text-slate-200 font-sans shadow-lg flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
            Active Context Inspector
          </h3>
        </div>
        <button
          onClick={onRefreshContext}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[10px] font-mono flex items-center gap-1 cursor-pointer"
          title="Refresh Context"
        >
          <RefreshCw className="w-3 h-3 text-emerald-400" />
          <span>Sync</span>
        </button>
      </div>

      {/* Role Badge */}
      <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">{userProfile.userName}</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {userProfile.userRole}
        </span>
      </div>

      {/* Context Accordions List */}
      <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar text-xs">
        
        {/* 1. PROPERTY CONTEXT (DOMAIN-001/008) */}
        <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === 'property' ? '' : 'property')}
            className="w-full p-2.5 flex items-center justify-between bg-slate-900/50 text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <span className="font-mono font-bold text-slate-200 flex items-center gap-2 text-[11px]">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Property Digital Twin
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Score: {propertyContext?.healthScore || 84}/100
              </span>
              {activeSection === 'property' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {activeSection === 'property' && (
            <div className="p-3 space-y-1.5 bg-slate-950/60 border-t border-slate-800/60 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-bold text-white">{propertyContext?.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type / Area:</span>
                <span>{propertyContext?.propertyType} ({propertyContext?.totalAreaSqFt} sqft)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Facing Grid:</span>
                <span className="text-cyan-400 font-bold">{propertyContext?.facingDirection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Snapshot:</span>
                <span className="text-slate-300">{propertyContext?.activeSnapshotId}</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. PROJECT EXECUTION CONTEXT (DOMAIN-007) */}
        <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === 'project' ? '' : 'project')}
            className="w-full p-2.5 flex items-center justify-between bg-slate-900/50 text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <span className="font-mono font-bold text-slate-200 flex items-center gap-2 text-[11px]">
              <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
              Project Execution Workflow
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">
                {projectContext?.completionPercentage}% Done
              </span>
              {activeSection === 'project' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {activeSection === 'project' && (
            <div className="p-3 space-y-1.5 bg-slate-950/60 border-t border-slate-800/60 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Project ID:</span>
                <span className="text-slate-200 font-bold">{projectContext?.projectId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Phase:</span>
                <span className="text-cyan-300">{projectContext?.currentPhase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Tasks:</span>
                <span className="text-amber-400 font-bold">{projectContext?.activeTasksCount} pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Engineer:</span>
                <span className="text-slate-300">{projectContext?.assignedEngineer}</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. MONITORING & ALERTS CONTEXT (DOMAIN-008) */}
        <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === 'monitoring' ? '' : 'monitoring')}
            className="w-full p-2.5 flex items-center justify-between bg-slate-900/50 text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <span className="font-mono font-bold text-slate-200 flex items-center gap-2 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Digital Twin Telemetry
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                {monitoringContext?.activeAlertsCount} Alerts
              </span>
              {activeSection === 'monitoring' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {activeSection === 'monitoring' && (
            <div className="p-3 space-y-1.5 bg-slate-950/60 border-t border-slate-800/60 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Alerts:</span>
                <span className="text-amber-400 font-bold">{monitoringContext?.activeAlertsCount} active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Critical Severity:</span>
                <span className="text-rose-400 font-bold">{monitoringContext?.criticalAlertsCount} critical</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Maintenance:</span>
                <span>{monitoringContext?.maintenancePriority} Priority</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. UNIFIED REASONING CONTEXT (DOMAIN-006) */}
        <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === 'reasoning' ? '' : 'reasoning')}
            className="w-full p-2.5 flex items-center justify-between bg-slate-900/50 text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <span className="font-mono font-bold text-slate-200 flex items-center gap-2 text-[11px]">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              Unified Reasoning Engine
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">
                {recommendationContext?.totalRecommendations} Recs
              </span>
              {activeSection === 'reasoning' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {activeSection === 'reasoning' && (
            <div className="p-3 space-y-1.5 bg-slate-950/60 border-t border-slate-800/60 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Remedies:</span>
                <span className="text-slate-200 font-bold">{recommendationContext?.totalRecommendations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Critical Remedies:</span>
                <span className="text-rose-400 font-bold">{recommendationContext?.criticalRemediesCount}</span>
              </div>
              <div className="text-[10px] text-purple-300 pt-1 border-t border-slate-800">
                Top Remedy: {recommendationContext?.topRecommendationTitle}
              </div>
            </div>
          )}
        </div>

        {/* 5. KNOWLEDGE & TRUTH ENGINE CONTEXT (DOMAIN-001..005) */}
        <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === 'knowledge' ? '' : 'knowledge')}
            className="w-full p-2.5 flex items-center justify-between bg-slate-900/50 text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <span className="font-mono font-bold text-slate-200 flex items-center gap-2 text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Enterprise Knowledge Base
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                {knowledgeContext?.verifiedCanonicalEntitiesCount} Verified
              </span>
              {activeSection === 'knowledge' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {activeSection === 'knowledge' && (
            <div className="p-3 space-y-1.5 bg-slate-950/60 border-t border-slate-800/60 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Ingested Shastras:</span>
                <span className="text-slate-200">{knowledgeContext?.ingestedDocumentsCount} Manuscripts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verified Entities:</span>
                <span className="text-emerald-400 font-bold">{knowledgeContext?.verifiedCanonicalEntitiesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Rules:</span>
                <span>{knowledgeContext?.activeRulesCount} Shastric Rules</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Context Synchronization Timestamp Footer */}
      <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Context ID: {context.contextId}</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3 h-3" />
          Active Sync
        </span>
      </div>

    </div>
  );
};
