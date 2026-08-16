import React, { useState } from 'react';
import {
  X,
  Plus,
  MessageSquare,
  Search,
  Archive,
  Clock,
  Sparkles,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { IConversationSession, UserRole } from '../../core/consultation/ConsultationTypes';
import { ConsultationSessionManager } from '../../core/consultation/ConsultationSessionManager';
import { ConversationMemoryService } from '../../core/consultation/ConversationMemoryService';

interface SessionExplorerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  userRole: UserRole;
}

export const SessionExplorerDrawer: React.FC<SessionExplorerDrawerProps> = ({
  isOpen,
  onClose,
  activeSessionId,
  onSelectSession,
  onNewSession,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');

  if (!isOpen) return null;

  const sessionManager = ConsultationSessionManager.getInstance();
  const allSessions = sessionManager.getAllSessions();

  const filteredSessions = allSessions.filter(s => {
    const matchesSearch = s.conversationTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white font-mono">
                Session Explorer & History
              </h3>
              <p className="text-[11px] text-slate-400">
                Manage AI consultation threads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="p-4 space-y-3 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>START NEW CONSULTATION</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search session threads..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
            {(['ALL', 'ACTIVE', 'ARCHIVED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`flex-1 py-1 rounded transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-slate-500">
              No consultation sessions found matching query.
            </div>
          ) : (
            filteredSessions.map(ses => {
              const isActive = ses.sessionId === activeSessionId;
              const summary = ConversationMemoryService.getInstance().getSummary(ses.sessionId);

              return (
                <div
                  key={ses.sessionId}
                  onClick={() => {
                    onSelectSession(ses.sessionId);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 relative group ${
                    isActive
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold leading-snug text-white flex items-center gap-1.5">
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />}
                      {ses.conversationTitle}
                    </h4>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 uppercase font-bold ${
                        ses.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ses.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(ses.lastActiveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span>{ses.messageCount} exchanges</span>
                    <span>•</span>
                    <span className="text-cyan-400">{ses.activeUserRole}</span>
                  </div>

                  {summary && (
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-[10px] text-slate-400 line-clamp-2">
                      <span className="text-slate-300 font-semibold">Summary:</span> {summary.summaryText}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                    <span>ID: {ses.sessionId}</span>
                    {ses.status === 'ACTIVE' && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          sessionManager.archiveSession(ses.sessionId);
                        }}
                        className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Archive Session"
                      >
                        <Archive className="w-3 h-3" />
                        <span>Archive</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] font-mono text-slate-500 text-center">
          URJAFLUX Conversation Memory Buffer Active • Total Threads: {allSessions.length}
        </div>

      </div>
    </div>
  );
};
