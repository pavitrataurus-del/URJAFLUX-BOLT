// ============================================================================
// URJAFLUX AI OS - FOUNDER KNOWLEDGE CONSOLE (FKC)
// Consolidated Enterprise Knowledge Workspace (Founder Compliance Directive)
// ============================================================================

import React, { useState } from 'react';
import { UniversalIngestionWorkspace } from '../knowledge_ingestion/components/UniversalIngestionWorkspace';
import { VerificationDashboard } from '../knowledge/verification/components/VerificationDashboard';
import { FounderInboxView } from './components/FounderInboxView';
import { FounderReviewEditorView } from './components/FounderReviewEditorView';
import { FounderMergeSplitView } from './components/FounderMergeSplitView';
import {
  Inbox,
  FileSearch,
  GitMerge,
  ShieldCheck,
  Database,
  Layers,
} from 'lucide-react';

export type WorkspaceConsoleMode =
  | 'inbox'
  | 'editor'
  | 'mergesplit'
  | 'verification'
  | 'ingestion';

export default function EnterpriseKnowledgeWorkspace({
  userRole = 'ADMIN',
  initialMode = 'inbox',
}: {
  userRole?: 'ADMIN' | 'END_USER';
  initialMode?: WorkspaceConsoleMode;
}) {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceConsoleMode>(initialMode);
  const [activePackageId, setActivePackageId] = useState<string | undefined>(undefined);

  const handleSelectPackageForReview = (pkgId: string) => {
    setActivePackageId(pkgId);
    setWorkspaceMode('editor');
  };

  const handleSelectPackageForMergeSplit = (pkgId: string) => {
    setActivePackageId(pkgId);
    setWorkspaceMode('mergesplit');
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 overflow-hidden font-sans">
      {/* TOP CONSOLE NAVIGATION HEADER */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            URJAFLUX AI OS • Founder Knowledge Console (FKC)
          </span>
        </div>

        {/* WORKSPACE MODE TABS */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setWorkspaceMode('inbox')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 font-bold whitespace-nowrap ${
              workspaceMode === 'inbox'
                ? 'bg-emerald-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Founder Inbox
          </button>

          <button
            onClick={() => setWorkspaceMode('editor')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 font-bold whitespace-nowrap ${
              workspaceMode === 'editor'
                ? 'bg-emerald-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            Review & Editor
          </button>

          <button
            onClick={() => setWorkspaceMode('mergesplit')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 font-bold whitespace-nowrap ${
              workspaceMode === 'mergesplit'
                ? 'bg-emerald-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            Merge & Split Studio
          </button>

          <button
            onClick={() => setWorkspaceMode('verification')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 font-bold whitespace-nowrap ${
              workspaceMode === 'verification'
                ? 'bg-emerald-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verification Engine
          </button>

          <button
            onClick={() => setWorkspaceMode('ingestion')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 font-bold whitespace-nowrap ${
              workspaceMode === 'ingestion'
                ? 'bg-emerald-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Ingestion Pipeline
          </button>
        </div>
      </div>

      {/* CONSOLE VIEW BODY */}
      <div className="flex-1 overflow-hidden">
        {workspaceMode === 'inbox' && (
          <FounderInboxView
            userRole={userRole}
            onSelectPackageForReview={handleSelectPackageForReview}
            onSelectPackageForMergeSplit={handleSelectPackageForMergeSplit}
          />
        )}

        {workspaceMode === 'editor' && (
          <FounderReviewEditorView
            initialPackageId={activePackageId}
            userRole={userRole}
            onBackToInbox={() => setWorkspaceMode('inbox')}
          />
        )}

        {workspaceMode === 'mergesplit' && (
          <FounderMergeSplitView
            initialPackageId={activePackageId}
            userRole={userRole}
          />
        )}

        {workspaceMode === 'verification' && (
          <VerificationDashboard userRole={userRole} />
        )}

        {workspaceMode === 'ingestion' && (
          <UniversalIngestionWorkspace userRole={userRole} />
        )}
      </div>
    </div>
  );
}
