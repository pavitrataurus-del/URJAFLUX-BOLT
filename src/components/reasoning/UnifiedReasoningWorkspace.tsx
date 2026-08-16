import React, { useState } from 'react';
import {
  Brain,
  GitBranch,
  ShieldCheck,
  Scale,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Sparkles,
  BookOpen,
  RefreshCw,
  User,
  UserCheck,
  Eye,
  Sliders,
  Flame,
  Droplets,
  Compass,
  Activity,
  ArrowRight,
  Shield,
  Clock,
  Filter,
  BarChart3,
  Check,
  X
} from 'lucide-react';

import {
  IReasoningSession,
  IReasoningInput,
  IRecommendation,
  IReasoningChain,
  IReasoningConflict,
  UserRole,
  KnowledgeDomain,
  RecommendationPriority,
  RecommendationCategory
} from '../../core/reasoning/ReasoningTypes';

import { UnifiedReasoningRegistry } from '../../core/reasoning/UnifiedReasoningRegistry';
import { CrossDomainReasoningEngine } from '../../core/reasoning/CrossDomainReasoningEngine';

export const UnifiedReasoningWorkspace: React.FC = () => {
  const registry = UnifiedReasoningRegistry.getInstance();
  const engine = CrossDomainReasoningEngine.getInstance();

  // State
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [sessions, setSessions] = useState<IReasoningSession[]>(() => registry.getAllSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.sessionId || '');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'session_creator' | 'graph' | 'recommendations' | 'evidence' | 'conflicts' | 'explanations' | 'audit'
  >('overview');

  // Filter state for Recommendations
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Item for Detail Modal / Inspector
  const [selectedRecommendation, setSelectedRecommendation] = useState<IRecommendation | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<IReasoningConflict | null>(null);

  // New Session Input Form State
  const [inputForm, setInputForm] = useState<IReasoningInput>({
    propertyType: 'Residential',
    roomOrZone: 'Northeast (Eeshan)',
    cardinalDirection: 'Northeast',
    primaryElement: 'Jala (Water)',
    associatedPlanet: 'Guru (Jupiter)',
    chakraZone: 'Ajna',
    numerologyPathNumber: 3,
    numerologyNameNumber: 3,
    lalKitabHousePlacement: 1,
    astrologyRashiSign: 'Meena (Pisces)',
    problemStatement: 'Spatial alignment and elemental balance for executive master study and puja area.'
  });
  const [customSessionTitle, setCustomSessionTitle] = useState<string>('');

  // Conflict Override Form State
  const [overrideDomain, setOverrideDomain] = useState<KnowledgeDomain>('Vastu');
  const [overrideStrategy, setOverrideStrategy] = useState<string>('');
  const [overrideNotes, setOverrideNotes] = useState<string>('');

  const activeSession = sessions.find(s => s.sessionId === activeSessionId) || sessions[0];

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession = registry.createSession(
      inputForm,
      customSessionTitle.trim() || undefined
    );
    const updated = registry.getAllSessions();
    setSessions(updated);
    setActiveSessionId(newSession.sessionId);
    setActiveTab('overview');
  };

  const handleStatusOverride = (recId: string, newStatus: 'APPROVED' | 'DRAFT' | 'REJECTED_BY_ADMIN' | 'OVERRIDDEN') => {
    if (!activeSession) return;
    registry.overrideRecommendationStatus(activeSession.sessionId, recId, newStatus);
    setSessions([...registry.getAllSessions()]);
  };

  const handleConflictOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict) return;
    registry.overrideConflictResolution(
      selectedConflict.conflictId,
      overrideDomain,
      overrideStrategy,
      overrideNotes,
      'Admin Knowledge Engineer'
    );
    setSessions([...registry.getAllSessions()]);
    setSelectedConflict(null);
  };

  // Filter recommendations based on search & RBAC
  const rawRecs = activeSession?.recommendations || [];
  const endUserRecs = engine.sanitizeForEndUser(rawRecs);

  const displayRecs = userRole === 'END_USER'
    ? rawRecs.filter(r => r.status === 'APPROVED')
    : rawRecs;

  const filteredRecs = displayRecs.filter(r => {
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const matchesQuery = searchQuery === '' ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPriority && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* HEADER & RBAC TOOLBAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600 rounded-lg text-white">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">Unified Reasoning & Recommendation Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                DOMAIN-006
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Cross-domain evidence aggregation, conflict resolution, and explainable recommendation orchestration
            </p>
          </div>
        </div>

        {/* RBAC ROLE SELECTOR TOGGLE */}
        <div className="flex items-center space-x-3 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 px-2 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> View Role:
          </span>
          <button
            onClick={() => setUserRole('ADMIN')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center space-x-1.5 ${
              userRole === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admin Knowledge Eng.</span>
          </button>
          <button
            onClick={() => setUserRole('END_USER')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center space-x-1.5 ${
              userRole === 'END_USER'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>End-User Client</span>
          </button>
        </div>
      </div>

      {/* SESSION SELECTOR BAR */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Active Session:</span>
          <select
            value={activeSessionId}
            onChange={(e) => setActiveSessionId(e.target.value)}
            className="text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {sessions.map(s => (
              <option key={s.sessionId} value={s.sessionId}>
                {s.sessionTitle} ({s.recommendations.length} Recs)
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setActiveTab('session_creator')}
          className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Reasoning Session</span>
        </button>
      </div>

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="border-b border-slate-200 flex space-x-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'graph'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Context Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'recommendations'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Recommendations ({filteredRecs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'evidence'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Evidence Browser</span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'conflicts'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Conflict Resolver ({activeSession?.conflicts.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('explanations')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'explanations'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Explainable Chains</span>
        </button>

        {userRole === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        )}
      </div>

      {/* ----------------------------------------------------
          TAB 1: OVERVIEW DASHBOARD
      ---------------------------------------------------- */}
      {activeTab === 'overview' && activeSession && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loaded Entities</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeSession.unifiedContext.totalEntitiesLoaded}</p>
              <span className="text-xs text-indigo-600 font-medium">Across 5 Knowledge Libraries</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Recommendations</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{rawRecs.length}</p>
              <span className="text-xs text-emerald-600 font-medium">{rawRecs.filter(r => r.status === 'APPROVED').length} Approved for End-User</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Confidence</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {Math.round(rawRecs.reduce((sum, r) => sum + r.confidenceScore, 0) / (rawRecs.length || 1))}%
              </p>
              <span className="text-xs text-indigo-600 font-medium">Grade A+ Canonical Quality</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cross-Domain Conflicts</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{activeSession.conflicts.length}</p>
              <span className="text-xs text-slate-500 font-medium">Auto-Arbitrated by Truth Engine</span>
            </div>
          </div>

          {/* DOMAIN COVERAGE STATS */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Multi-Domain Knowledge Coverage Breakdown</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(activeSession.unifiedContext.domainCoverage).map(([domain, count]) => (
                <div key={domain} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <span className="text-xs font-semibold text-slate-500 block">{domain}</span>
                  <span className="text-lg font-bold text-indigo-600 mt-1 block">{count}</span>
                  <span className="text-[10px] text-slate-400">Entities Integrated</span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP RECOMMENDATIONS PREVIEW */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Top Synthesized Recommendations ({filteredRecs.length})</span>
              </h3>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {filteredRecs.slice(0, 3).map(rec => (
                <div key={rec.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                        {rec.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                        rec.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1">{rec.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-600 block">{rec.confidenceScore}%</span>
                      <span className="text-[10px] font-semibold text-slate-400 block">Grade {rec.confidenceGrade}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRecommendation(rec);
                        setActiveTab('recommendations');
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: SESSION CREATOR FORM
      ---------------------------------------------------- */}
      {activeTab === 'session_creator' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Initiate Unified Reasoning Session</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide spatial, temporal, planetary, and elemental parameters. The engine will retrieve verified knowledge across Vastu, Chakra, Lal Kitab, Numerology, and Astrology.
            </p>
          </div>

          <form onSubmit={handleCreateSession} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Session Title / Label</label>
              <input
                type="text"
                placeholder="e.g. Master Residence - Northeast Puja & Study Space"
                value={customSessionTitle}
                onChange={e => setCustomSessionTitle(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Property Category</label>
                <select
                  value={inputForm.propertyType}
                  onChange={e => setInputForm({ ...inputForm, propertyType: e.target.value as any })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Personal Space">Personal Space</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Room / Spatial Zone</label>
                <select
                  value={inputForm.roomOrZone}
                  onChange={e => setInputForm({ ...inputForm, roomOrZone: e.target.value as any })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="Northeast (Eeshan)">Northeast (Eeshan)</option>
                  <option value="Southwest (Nairutya)">Southwest (Nairutya)</option>
                  <option value="Northwest (Vayavya)">Northwest (Vayavya)</option>
                  <option value="Southeast (Agneya)">Southeast (Agneya)</option>
                  <option value="Center (Brahmasthan)">Center (Brahmasthan)</option>
                  <option value="Entrance">Entrance</option>
                  <option value="Master Bedroom">Master Bedroom</option>
                  <option value="Puja Room">Puja Room</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Office Workspace">Office Workspace</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Element</label>
                <select
                  value={inputForm.primaryElement}
                  onChange={e => setInputForm({ ...inputForm, primaryElement: e.target.value as any })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="Agni (Fire)">Agni (Fire)</option>
                  <option value="Jala (Water)">Jala (Water)</option>
                  <option value="Prithvi (Earth)">Prithvi (Earth)</option>
                  <option value="Vayu (Air)">Vayu (Air)</option>
                  <option value="Akasha (Space)">Akasha (Space)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Associated Planetary Ruler</label>
                <select
                  value={inputForm.associatedPlanet}
                  onChange={e => setInputForm({ ...inputForm, associatedPlanet: e.target.value as any })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="Surya (Sun)">Surya (Sun)</option>
                  <option value="Chandra (Moon)">Chandra (Moon)</option>
                  <option value="Mangal (Mars)">Mangal (Mars)</option>
                  <option value="Budh (Mercury)">Budh (Mercury)</option>
                  <option value="Guru (Jupiter)">Guru (Jupiter)</option>
                  <option value="Shukra (Venus)">Shukra (Venus)</option>
                  <option value="Shani (Saturn)">Shani (Saturn)</option>
                  <option value="Rahu">Rahu</option>
                  <option value="Ketu">Ketu</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Chakra Energetic Focus</label>
                <select
                  value={inputForm.chakraZone}
                  onChange={e => setInputForm({ ...inputForm, chakraZone: e.target.value as any })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="Muladhara">Muladhara</option>
                  <option value="Swadhisthana">Swadhisthana</option>
                  <option value="Manipura">Manipura</option>
                  <option value="Anahata">Anahata</option>
                  <option value="Vishuddha">Vishuddha</option>
                  <option value="Ajna">Ajna</option>
                  <option value="Sahasrara">Sahasrara</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Astrological Rashi Sign</label>
                <input
                  type="text"
                  value={inputForm.astrologyRashiSign}
                  onChange={e => setInputForm({ ...inputForm, astrologyRashiSign: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Problem Statement / Objectives</label>
              <textarea
                rows={3}
                value={inputForm.problemStatement}
                onChange={e => setInputForm({ ...inputForm, problemStatement: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Execute Reasoning Engine</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: CONTEXT GRAPH VIEWER
      ---------------------------------------------------- */}
      {activeTab === 'graph' && activeSession && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-600" />
                <span>Unified Reasoning Graph Explorer</span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing normalized nodes ({activeSession.unifiedContext.nodes.length}) and cross-domain edges ({activeSession.unifiedContext.edges.length})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NODES LIST */}
            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-96 overflow-y-auto">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Graph Nodes ({activeSession.unifiedContext.nodes.length})</span>
              {activeSession.unifiedContext.nodes.map(n => (
                <div key={n.id} className="p-2.5 bg-white border border-slate-200 rounded-md text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.label}</span>
                    <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-indigo-100 text-indigo-800">{n.domain}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Source: {n.sourceBook} | Quality Score: {n.confidenceScore}%</p>
                </div>
              ))}
            </div>

            {/* EDGES LIST */}
            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-96 overflow-y-auto">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Graph Edges & Synapses ({activeSession.unifiedContext.edges.length})</span>
              {activeSession.unifiedContext.edges.map(e => (
                <div key={e.id} className="p-2.5 bg-white border border-slate-200 rounded-md text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{e.relationType}</span>
                    {e.isCrossDomain && (
                      <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-amber-100 text-amber-800">Cross-Domain</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 4: RECOMMENDATION EXPLORER
      ---------------------------------------------------- */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search recommendations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="Vastu Spatial Alignment">Vastu Spatial Alignment</option>
                <option value="Unified Cross-Domain Synergy">Unified Cross-Domain Synergy</option>
                <option value="Karmic Remedial Strategy">Karmic Remedial Strategy</option>
                <option value="Chakra Energetic Harmony">Chakra Energetic Harmony</option>
                <option value="Numeric Name Vibration">Numeric Name Vibration</option>
              </select>

              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* RECOMMENDATIONS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecs.map(rec => (
              <div key={rec.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                      {rec.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                      rec.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {rec.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                  <p className="text-xs text-slate-600">{rec.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Supporting Domains: <strong>{rec.supportingDomains.join(', ')}</strong></span>
                    <span className="font-bold text-indigo-600">{rec.confidenceScore}% (Grade {rec.confidenceGrade})</span>
                  </div>

                  {userRole === 'ADMIN' && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400">Admin Controls:</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStatusOverride(rec.id, 'APPROVED')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold hover:bg-emerald-100"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusOverride(rec.id, 'DRAFT')}
                          className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold hover:bg-amber-100"
                        >
                          Draft
                        </button>
                        <button
                          onClick={() => handleStatusOverride(rec.id, 'REJECTED_BY_ADMIN')}
                          className="px-2 py-1 bg-rose-50 text-rose-700 rounded text-[10px] font-semibold hover:bg-rose-100"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 5: EVIDENCE BROWSER
      ---------------------------------------------------- */}
      {activeTab === 'evidence' && activeSession && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Canonical Source Citations & Evidence Bundles</span>
          </h3>

          <div className="space-y-3">
            {rawRecs.map(rec => (
              <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 block">Source Books & Citations:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rec.supportingEvidence.sourceCitations.map((cit, i) => (
                      <div key={i} className="p-2 bg-white border border-slate-200 rounded text-xs space-y-0.5">
                        <span className="font-bold text-indigo-900 block">{cit.book}</span>
                        <span className="text-[10px] text-slate-500 block">Author: {cit.author} | Chapter: {cit.chapter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 6: CONFLICT RESOLUTION PANEL
      ---------------------------------------------------- */}
      {activeTab === 'conflicts' && activeSession && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>Cross-Domain Conflict Arbitrator</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Preserving viewpoints while enforcing Truth Engine priority
            </span>
          </div>

          <div className="space-y-3">
            {activeSession.conflicts.map(conf => (
              <div key={conf.conflictId} className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">
                    Conflict: {conf.domainA} vs {conf.domainB}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                    {conf.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-white border border-amber-200 rounded">
                    <span className="font-bold text-slate-700 block mb-0.5">{conf.domainA} Claim:</span>
                    <p className="text-slate-600">{conf.claimA}</p>
                  </div>
                  <div className="p-2 bg-white border border-amber-200 rounded">
                    <span className="font-bold text-slate-700 block mb-0.5">{conf.domainB} Claim:</span>
                    <p className="text-slate-600">{conf.claimB}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-700 pt-1">
                  <strong>Resolution Strategy:</strong> {conf.resolutionStrategy}
                </div>

                {userRole === 'ADMIN' && (
                  <div className="pt-2 border-t border-amber-200 flex justify-end">
                    <button
                      onClick={() => setSelectedConflict(conf)}
                      className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
                    >
                      Admin Override Conflict
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 7: EXPLAINABLE CHAINS
      ---------------------------------------------------- */}
      {activeTab === 'explanations' && activeSession && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Explainable Reasoning Chains & Step-by-Step Traces</span>
          </h3>

          <div className="space-y-4">
            {activeSession.reasoningChains.map(chain => (
              <div key={chain.chainId} className="p-4 border border-slate-200 rounded-lg space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">Chain #{chain.chainId}</span>
                  <span className="text-xs font-bold text-emerald-600">Overall Confidence: {chain.overallChainConfidence}%</span>
                </div>

                <p className="text-xs text-slate-700 bg-white p-2.5 border border-slate-200 rounded">
                  {chain.explanationSummary}
                </p>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Step-by-Step Logic Execution:</span>
                  {chain.steps.map(s => (
                    <div key={s.stepNumber} className="p-2.5 bg-white border border-slate-200 rounded text-xs flex items-start space-x-3">
                      <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                        {s.stepNumber}
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{s.title}</span>
                        <p className="text-slate-600 text-[11px]">{s.description}</p>
                        <span className="text-[10px] text-indigo-600 block">Rule: {s.ruleApplied}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 8: AUDIT TRAIL LOGS
      ---------------------------------------------------- */}
      {activeTab === 'audit' && activeSession && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Reasoning Session Audit History Log</span>
          </h3>

          <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs space-y-1 max-h-80 overflow-y-auto">
            {activeSession.auditLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADMIN CONFLICT OVERRIDE */}
      {selectedConflict && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Admin Conflict Resolution Override</h3>
              <button onClick={() => setSelectedConflict(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConflictOverride} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Winning Domain Priority</label>
                <select
                  value={overrideDomain}
                  onChange={e => setOverrideDomain(e.target.value as KnowledgeDomain)}
                  className="w-full text-xs p-2 border border-slate-300 rounded"
                >
                  <option value="Vastu">Vastu</option>
                  <option value="Chakra">Chakra</option>
                  <option value="LalKitab">LalKitab</option>
                  <option value="Numerology">Numerology</option>
                  <option value="Astrology">Astrology</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Resolution Strategy</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prioritize Vastu spatial orientation while using secondary neutral element remedy."
                  value={overrideStrategy}
                  onChange={e => setOverrideStrategy(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Admin Audit Notes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Notes explaining why this override is being applied..."
                  value={overrideNotes}
                  onChange={e => setOverrideNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedConflict(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
