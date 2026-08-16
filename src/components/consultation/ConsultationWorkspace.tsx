import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  ShieldCheck,
  Building2,
  FolderGit2,
  Activity,
  Cpu,
  BookOpen,
  UserCheck,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Layers,
  BarChart2,
  FileText
} from 'lucide-react';
import {
  IConversationMessage,
  IConversationSession,
  IConversationContext,
  UserRole,
  ISuggestedAction
} from '../../core/consultation/ConsultationTypes';
import { ConsultationSessionManager } from '../../core/consultation/ConsultationSessionManager';
import { ConsultationContextManager } from '../../core/consultation/ConsultationContextManager';
import { ExplainableAiModal } from './ExplainableAiModal';
import { ContextInspectorPanel } from './ContextInspectorPanel';
import { SessionExplorerDrawer } from './SessionExplorerDrawer';
import { ConsultationAuditPanel } from './ConsultationAuditPanel';

interface ConsultationWorkspaceProps {
  initialUserRole?: UserRole;
  propertyId?: string;
  projectId?: string;
  onNavigateToModule?: (moduleName: string) => void;
}

export const ConsultationWorkspace: React.FC<ConsultationWorkspaceProps> = ({
  initialUserRole = 'ADMIN',
  propertyId,
  projectId,
  onNavigateToModule
}) => {
  const sessionManager = ConsultationSessionManager.getInstance();

  const [userRole, setUserRole] = useState<UserRole>(initialUserRole);
  const [activeSession, setActiveSession] = useState<IConversationSession | null>(() =>
    sessionManager.getActiveSession()
  );
  const [messages, setMessages] = useState<IConversationMessage[]>(() =>
    activeSession ? sessionManager.getSessionMessages(activeSession.sessionId) : []
  );

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Active view tab: 'chat' | 'inspector' | 'audit'
  const [activeTab, setActiveTab] = useState<'chat' | 'inspector' | 'audit'>('chat');

  // Modals & Drawers state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [explainableMessage, setExplainableMessage] = useState<IConversationMessage | null>(null);

  // Active Context snapshot
  const [context, setContext] = useState<IConversationContext | null>(() =>
    ConsultationContextManager.getInstance().assembleContext(userRole, propertyId, projectId)
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Sync state when active session changes
  const handleSelectSession = (sessionId: string) => {
    sessionManager.setActiveSession(sessionId);
    const ses = sessionManager.getSessionById(sessionId);
    if (ses) {
      setActiveSession(ses);
      setMessages(sessionManager.getSessionMessages(sessionId));
      setContext(ConsultationContextManager.getInstance().assembleContext(userRole, ses.propertyId, ses.projectId));
    }
  };

  const handleNewSession = () => {
    const newSes = sessionManager.createNewSession(
      `AI Consultation - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      userRole,
      propertyId,
      projectId
    );
    setActiveSession(newSes);
    setMessages(sessionManager.getSessionMessages(newSes.sessionId));
    setContext(ConsultationContextManager.getInstance().assembleContext(userRole, propertyId, projectId));
  };

  const handleSendQuery = (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isProcessing) return;

    setInputQuery('');
    setIsProcessing(true);

    const sesId = activeSession?.sessionId || handleNewSessionAndGetId();

    setTimeout(() => {
      const { assistantMessage } = sessionManager.sendUserQuery(sesId, q, userRole);
      setMessages(sessionManager.getSessionMessages(sesId));
      setIsProcessing(false);
      setContext(ConsultationContextManager.getInstance().assembleContext(userRole, propertyId, projectId));
    }, 350);
  };

  const handleNewSessionAndGetId = (): string => {
    const ses = sessionManager.createNewSession('AI Consultation Session', userRole, propertyId, projectId);
    setActiveSession(ses);
    return ses.sessionId;
  };

  const handleActionClick = (action: ISuggestedAction) => {
    if (onNavigateToModule) {
      onNavigateToModule(action.targetModule);
    }
  };

  const quickPrompts = [
    'Why was 528Hz diffuser recommended?',
    'Check Digital Twin Health Score',
    'Show Active Workflow Tasks',
    'Explain Brahmasthan Clearance Rule',
    'Pancha Tattva Compliance Audit'
  ];

  return (
    <div id="consultation-workspace" className="flex flex-col h-[820px] bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden font-sans shadow-2xl">
      
      {/* Top Workspace Header */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & Active Session Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
                URJAFLUX AI Consultation & Conversation Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                DOMAIN-009
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active Thread: <span className="text-slate-200 font-semibold">{activeSession?.conversationTitle || 'General Consultation'}</span>
            </p>
          </div>
        </div>

        {/* Controls: Role Switcher, Session Drawer Toggle, New Session */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          
          {/* RBAC Role Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-[10px] text-slate-500 px-1 uppercase font-bold">Role:</span>
            {(['ADMIN', 'PROJECT_MANAGER', 'FIELD_ENGINEER', 'END_USER'] as UserRole[]).map(r => (
              <button
                key={r}
                onClick={() => {
                  setUserRole(r);
                  setContext(ConsultationContextManager.getInstance().assembleContext(r, propertyId, projectId));
                }}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  userRole === r
                    ? 'bg-emerald-600 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Session Explorer Drawer Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Open Session Explorer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Threads ({sessionManager.getAllSessions().length})</span>
          </button>

          {/* New Session Button */}
          <button
            onClick={handleNewSession}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

        </div>
      </div>

      {/* Main Workspace Tabs Bar */}
      <div className="px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI Consultation Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'inspector'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Context Inspector</span>
          </button>

          {(userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER') && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Audit & Analytics</span>
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Truth Engine Verified
          </span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">Orchestration Active</span>
        </div>
      </div>

      {/* Workspace Body Area */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* Tab 1: Chat Workspace + Context Sidebar */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Primary Chat Feed */}
            <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
              
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Brain className="w-12 h-12 text-slate-700 mx-auto animate-bounce" />
                    <p className="text-xs font-mono text-slate-500">
                      No exchanges in this thread yet. Select a prompt below or ask any question.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.sender === 'USER';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                            isUser
                              ? 'bg-emerald-600 text-slate-950'
                              : 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isUser ? 'YOU' : 'AI'}
                        </div>

                        {/* Message Content Box */}
                        <div
                          className={`p-4 rounded-2xl space-y-3 text-xs leading-relaxed ${
                            isUser
                              ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-100'
                              : 'bg-slate-900 border border-slate-800 text-slate-200'
                          }`}
                        >
                          {/* Message Header Info */}
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800/60 pb-1.5">
                            <span className="font-bold uppercase text-slate-300">
                              {isUser ? 'User Request' : 'Enterprise Orchestration Response'}
                            </span>
                            <div className="flex items-center gap-2">
                              {msg.confidenceLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                                  {msg.confidenceGrade || 'A+'} ({msg.confidenceLevel}%)
                                </span>
                              )}
                              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>

                          {/* Text Body */}
                          <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap font-sans text-slate-200">
                            {msg.content}
                          </div>

                          {/* Source Domain Tags */}
                          {msg.sourceDomains && msg.sourceDomains.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="text-[10px] font-mono text-slate-500 self-center">Sources:</span>
                              {msg.sourceDomains.map(d => (
                                <span
                                  key={d}
                                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Explainable AI Button & Actions Bar */}
                          {!isUser && (
                            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                              
                              {/* Why This Answer Button */}
                              <button
                                onClick={() => setExplainableMessage(msg)}
                                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <HelpCircle className="w-3 h-3" />
                                <span>Why this answer? (Explain Reasoning)</span>
                              </button>

                              {/* Action Buttons */}
                              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.suggestedActions.map(act => (
                                    <button
                                      key={act.actionId}
                                      onClick={() => handleActionClick(act)}
                                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                      title={act.description}
                                    >
                                      <span>{act.label}</span>
                                      <ChevronRight className="w-3 h-3 text-emerald-400" />
                                    </button>
                                  ))}
                                </div>
                              )}

                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })
                )}

                {isProcessing && (
                  <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 max-w-sm font-mono text-xs text-emerald-400">
                    <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Orchestrating enterprise knowledge & truth engine...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-6 py-2 bg-slate-900/40 border-t border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 shrink-0 font-bold uppercase">Quick Queries:</span>
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(qp)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-mono transition-colors shrink-0 border border-slate-800 cursor-pointer"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendQuery();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={e => setInputQuery(e.target.value)}
                    placeholder="Ask any consultation question (e.g., 'Why was 528Hz recommended?', 'Check Digital Twin status')..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isProcessing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-mono text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Desktop Context Inspector Side Panel */}
            <div className="hidden lg:block w-80 border-l border-slate-800 p-3 bg-slate-950 overflow-y-auto">
              <ContextInspectorPanel
                context={context}
                onRefreshContext={() =>
                  setContext(ConsultationContextManager.getInstance().assembleContext(userRole, propertyId, projectId))
                }
              />
            </div>

          </div>
        )}

        {/* Tab 2: Context Inspector Mobile/Full View */}
        {activeTab === 'inspector' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <ContextInspectorPanel
              context={context}
              onRefreshContext={() =>
                setContext(ConsultationContextManager.getInstance().assembleContext(userRole, propertyId, projectId))
              }
            />
          </div>
        )}

        {/* Tab 3: Audit & Analytics */}
        {activeTab === 'audit' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <ConsultationAuditPanel userRole={userRole} />
          </div>
        )}

      </div>

      {/* Explainable AI Modal */}
      <ExplainableAiModal
        isOpen={Boolean(explainableMessage)}
        onClose={() => setExplainableMessage(null)}
        message={explainableMessage}
      />

      {/* Session Explorer Drawer */}
      <SessionExplorerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeSessionId={activeSession?.sessionId || null}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        userRole={userRole}
      />

    </div>
  );
};
