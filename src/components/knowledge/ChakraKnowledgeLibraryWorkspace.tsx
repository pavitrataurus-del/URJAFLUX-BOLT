import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Database,
  GitBranch,
  AlertTriangle,
  Copy,
  Award,
  History,
  FileCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Sparkles,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Info,
  Lock,
  Radio,
  FileText,
  Activity,
  Maximize2,
  Check,
  Sliders,
  Cpu,
  UserCheck
} from 'lucide-react';

import {
  ChakraMasterKnowledgeRegistry,
  IChakraOntologyEntity,
  IChakraRelationship,
  IChakraKnowledgeConflict,
  IChakraDuplicateMatch,
  IChakraQualityScoreBreakdown,
  IChakraEndUserEntity,
  ExpertReviewStatus,
  EvidenceLevel
} from '../../core/knowledge_sources';

interface ChakraKnowledgeLibraryWorkspaceProps {
  userRole?: 'Admin' | 'EndUser' | 'ExpertReviewer';
}

export const ChakraKnowledgeLibraryWorkspace: React.FC<ChakraKnowledgeLibraryWorkspaceProps> = ({
  userRole: initialUserRole = 'Admin'
}) => {
  const [role, setRole] = useState<'Admin' | 'EndUser'>(
    initialUserRole === 'Admin' ? 'Admin' : 'EndUser'
  );
  
  const [activeTab, setActiveTab] = useState<
    | 'Overview'
    | 'Chakra Registry'
    | 'Ontology Explorer'
    | 'Knowledge Graph'
    | 'Relationship Explorer'
    | 'Conflict Resolution'
    | 'Duplicate Detection'
    | 'Quality Dashboard'
    | 'Version History'
    | 'Evidence Explorer'
    | 'Approval Queue'
    | 'Admin Notes'
  >('Overview');

  const registry = ChakraMasterKnowledgeRegistry.getInstance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElement, setSelectedElement] = useState('All');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('chk-001');

  const adminEntities = registry.getAdminEntities();
  const endUserEntities = registry.getEndUserEntities();

  const selectedAdminEntity = registry.getAdminEntityById(selectedEntityId) || adminEntities[0];
  const selectedEndUserEntity = registry.getEndUserEntityById(selectedEntityId) || endUserEntities[0];

  const conflicts = registry.getAllConflicts();
  const duplicates = registry.getDuplicateMatches();
  const documents = registry.getAllDocuments();
  const relationships = registry.getAllRelationships();

  const qualityBreakdown = registry.getAdminQualityScore(selectedEntityId);

  // Filtered lists
  const filteredAdminEntities = adminEntities.filter(e => {
    const matchElem = selectedElement === 'All' || e.element.toLowerCase().includes(selectedElement.toLowerCase());
    const matchText = !searchQuery ||
      e.sanskritName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.seedMantra.toLowerCase().includes(searchQuery.toLowerCase());
    return matchElem && matchText;
  });

  const filteredEndUserEntities = endUserEntities.filter(e => {
    const matchElem = selectedElement === 'All' || e.element.toLowerCase().includes(selectedElement.toLowerCase());
    const matchText = !searchQuery ||
      e.sanskritName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.seedMantra.toLowerCase().includes(searchQuery.toLowerCase());
    return matchElem && matchText;
  });

  // Conflict Action Handler
  const handleResolveConflict = (conflictId: string, status: ExpertReviewStatus) => {
    registry.resolveConflict(conflictId, status, 'Acharya Dr. V. K. Shastri', 'Conflict reviewed and resolved via Workspace UI.');
    setActiveTab('Conflict Resolution');
  };

  // Duplicate Merge Handler
  const handleMergeDuplicate = (sourceId: string, matchedId: string) => {
    registry.mergeDuplicate(sourceId, matchedId);
    setActiveTab('Duplicate Detection');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans border-t border-slate-800">
      {/* Top Header & Role Switcher */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-purple-600/20 border border-amber-500/30 rounded-xl text-amber-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-purple-200 to-indigo-200">
                DOMAIN-002 — Enterprise Chakra Intelligence Library
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                URJAFLUX OS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Canonical Chakra Ontology • Knowledge Graph • Conflict Engine • Evidence Verification
            </p>
          </div>
        </div>

        {/* RBAC Mode Selector */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <span className="text-xs font-medium text-slate-400 px-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" /> RBAC View:
          </span>
          <button
            onClick={() => setRole('Admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              role === 'Admin'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Admin / Expert
          </button>
          <button
            onClick={() => setRole('EndUser')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              role === 'EndUser'
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> End User (Public)
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="bg-slate-900/60 border-b border-slate-800/80 px-6 overflow-x-auto flex space-x-1 scrollbar-none">
        {[
          { name: 'Overview', icon: Activity, public: true },
          { name: 'Chakra Registry', icon: Database, public: true },
          { name: 'Ontology Explorer', icon: Layers, public: true },
          { name: 'Knowledge Graph', icon: GitBranch, public: true },
          { name: 'Relationship Explorer', icon: Radio, public: true },
          { name: 'Conflict Resolution', icon: AlertTriangle, public: false, count: conflicts.filter(c => c.reviewStatus === 'Pending').length },
          { name: 'Duplicate Detection', icon: Copy, public: false, count: duplicates.length },
          { name: 'Quality Dashboard', icon: Award, public: false },
          { name: 'Version History', icon: History, public: false },
          { name: 'Evidence Explorer', icon: FileCheck, public: false },
          { name: 'Approval Queue', icon: CheckCircle2, public: false },
          { name: 'Admin Notes', icon: Lock, public: false }
        ]
          .filter(t => role === 'Admin' || t.public)
          .map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.name;
            return (
              <button
                key={t.name}
                onClick={() => setActiveTab(t.name as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{t.name}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Main Workspace Body */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Canonical Chakras</span>
                  <Database className="w-5 h-5 text-amber-400" />
                </div>
                <div className="mt-3 text-3xl font-bold text-slate-100">{adminEntities.length}</div>
                <div className="mt-1 text-xs text-amber-400/90 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 7 Primary + Minor Sub-Chakras
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cross-Domain Rels</span>
                  <GitBranch className="w-5 h-5 text-purple-400" />
                </div>
                <div className="mt-3 text-3xl font-bold text-slate-100">{relationships.length}</div>
                <div className="mt-1 text-xs text-purple-400/90 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Vastu Zones, Elements, Remedies
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Knowledge Quality</span>
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="mt-3 text-3xl font-bold text-emerald-400">98 / 100</div>
                <div className="mt-1 text-xs text-emerald-400/90 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Grade A+ Scriptural Integrity
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Primary Scriptures</span>
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div className="mt-3 text-3xl font-bold text-slate-100">{documents.length}</div>
                <div className="mt-1 text-xs text-blue-400/90 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Sat-Cakra-Nirupana & Siva Samhita
                </div>
              </div>
            </div>

            {/* Quick Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Chakra Energy Matrix Overview */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    Canonical Chakra Energy Spectrum
                  </h2>
                  <span className="text-xs text-slate-400">Pancha Mahabhuta Alignment</span>
                </div>

                <div className="space-y-3">
                  {adminEntities.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedEntityId(c.id);
                        setActiveTab('Chakra Registry');
                      }}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 shadow-md"
                          style={{
                            backgroundColor:
                              c.chakraNumber === 1 ? '#ef4444' :
                              c.chakraNumber === 2 ? '#f97316' :
                              c.chakraNumber === 3 ? '#eab308' :
                              c.chakraNumber === 4 ? '#22c55e' :
                              c.chakraNumber === 5 ? '#3b82f6' :
                              c.chakraNumber === 6 ? '#6366f1' : '#a855f7'
                          }}
                        >
                          {c.chakraNumber}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                              {c.sanskritName}
                            </span>
                            <span className="text-xs text-slate-400">({c.englishName})</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="text-amber-400 font-semibold">{c.seedMantra}</span> • {c.element} • {c.crossDomainLinks.direction}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-medium text-slate-300">{c.bodyRegion}</div>
                          <div className="text-[11px] text-slate-500">{c.crossDomainLinks.vastuZone}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: RBAC Status & System Health */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    RBAC Security Policy Status
                  </h3>
                  <div className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800/80 pb-2">
                      <span>Active Security Level:</span>
                      <span className={role === 'Admin' ? 'text-amber-400' : 'text-purple-400'}>
                        {role === 'Admin' ? 'Admin / Full Access' : 'End User Sanitized'}
                      </span>
                    </div>
                    <p>
                      {role === 'Admin'
                        ? 'Displaying un-redacted primary sources, confidence metrics, conflict logs, and review workflows.'
                        : 'Restricted strictly to Approved Chakra Knowledge and Approved Recommendations. Internal reasoning and confidence internals are suppressed.'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    System Integration Engine
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Knowledge Graph Sync:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Cross-Domain Linker:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Active (DOM-001)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Future DOMAIN-007 Matrix:</span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> Schema Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHAKRA REGISTRY */}
        {activeTab === 'Chakra Registry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Master List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <Search className="w-4 h-4 text-slate-400 ml-1" />
                <input
                  type="text"
                  placeholder="Search Sanskrit name, English name, Mantra..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none flex-1"
                />
              </div>

              <div className="space-y-2">
                {(role === 'Admin' ? filteredAdminEntities : filteredEndUserEntities).map(e => {
                  const isSelected = e.id === selectedEntityId;
                  return (
                    <div
                      key={e.id}
                      onClick={() => setSelectedEntityId(e.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 text-slate-100 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center">
                            {e.chakraNumber}
                          </span>
                          <span className="font-bold text-sm text-slate-100">{e.sanskritName}</span>
                          <span className="text-xs text-slate-400">({e.englishName})</span>
                        </div>
                        <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {e.seedMantra}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-2 flex items-center gap-3">
                        <span>Element: {e.element}</span>
                        <span>•</span>
                        <span>Petals: {e.lotusPetals}</span>
                        <span>•</span>
                        <span>Color: {e.color}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Detailed Entity Inspection Drawer */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {role === 'Admin' ? (
                /* ADMIN VIEW FULL DETAILS */
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-slate-100">
                          {selectedAdminEntity.sanskritName}
                        </span>
                        <span className="text-lg text-slate-400">
                          ({selectedAdminEntity.englishName})
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                          Chakra #{selectedAdminEntity.chakraNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{selectedAdminEntity.commonName}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
                        Confidence: {(selectedAdminEntity.confidenceScore * 100).toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        SME: {selectedAdminEntity.expertReviewer}
                      </div>
                    </div>
                  </div>

                  {/* Attribute Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1">Element & Geometry</span>
                      <span className="font-semibold text-slate-200">{selectedAdminEntity.element}</span>
                      <div className="text-slate-400 mt-0.5">{selectedAdminEntity.geometry}</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1">Seed Mantra & Frequency</span>
                      <span className="font-semibold text-amber-400">{selectedAdminEntity.seedMantra}</span>
                      <div className="text-slate-400 mt-0.5">{selectedAdminEntity.frequencies.join(', ')}</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1">Associated Deity & Shakti</span>
                      <span className="font-semibold text-slate-200">{selectedAdminEntity.associatedDeity}</span>
                      <div className="text-slate-400 mt-0.5">{selectedAdminEntity.associatedShakti}</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1">Endocrine Glands</span>
                      <span className="font-semibold text-slate-200">{selectedAdminEntity.endocrineGlands.join(', ')}</span>
                    </div>
                  </div>

                  {/* Functions & Indicators */}
                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-bold block mb-1">Balanced State</span>
                      <p className="text-slate-300 leading-relaxed">{selectedAdminEntity.balancedState}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-amber-400 font-bold block mb-1">Underactive Indicators</span>
                        <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                          {selectedAdminEntity.underactiveIndicators.map((ind, idx) => (
                            <li key={idx}>{ind}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-red-400 font-bold block mb-1">Blocked Indicators</span>
                        <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                          {selectedAdminEntity.blockedIndicators.map((ind, idx) => (
                            <li key={idx}>{ind}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Approved Remedies & Crystals */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">Approved Remedies & Crystals</span>
                      <p className="text-slate-300 mb-2">{selectedAdminEntity.approvedRemedies.join(' • ')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAdminEntity.crystals.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-purple-300 rounded text-[11px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Admin Source Metadata & Versioning */}
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/20 text-[11px] text-slate-400 space-y-1">
                      <div className="font-bold text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Admin Source Verification Metadata
                      </div>
                      <div>Primary Source: <span className="text-slate-200">{selectedAdminEntity.primarySource}</span></div>
                      <div>Evidence Level: <span className="text-slate-200">{selectedAdminEntity.evidenceLevel}</span></div>
                      <div>Version: <span className="text-slate-200">{selectedAdminEntity.version}</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* END USER SANITIZED VIEW */
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-slate-100">
                        {selectedEndUserEntity.sanskritName}
                      </span>
                      <span className="text-lg text-slate-400">
                        ({selectedEndUserEntity.englishName})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedEndUserEntity.commonName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1">Element</span>
                      <span className="font-semibold text-slate-200">{selectedEndUserEntity.element}</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1">Seed Mantra</span>
                      <span className="font-semibold text-amber-400">{selectedEndUserEntity.seedMantra}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 font-bold block mb-1">Balanced State</span>
                    <p className="text-slate-300 leading-relaxed">{selectedEndUserEntity.balancedState}</p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-bold block mb-1">Approved Recommendations</span>
                    <p className="text-slate-300">{selectedEndUserEntity.approvedRemedies.join(' • ')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ONTOLOGY EXPLORER */}
        {activeTab === 'Ontology Explorer' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  Canonical Chakra Ontology Catalog Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deep multidimensional field mappings across Sanskrit texts, biofield endocrinology & Vastu zones.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3">#</th>
                    <th className="p-3">Sanskrit / English</th>
                    <th className="p-3">Element & Color</th>
                    <th className="p-3">Bija Mantra</th>
                    <th className="p-3">Endocrine Gland</th>
                    <th className="p-3">Herb & Crystal</th>
                    <th className="p-3">Vastu Zone</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {adminEntities.map(e => (
                    <tr key={e.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="p-3 font-bold text-amber-400">{e.chakraNumber}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-100">{e.sanskritName}</div>
                        <div className="text-[11px] text-slate-500">{e.englishName}</div>
                      </td>
                      <td className="p-3">
                        <div>{e.element}</div>
                        <div className="text-[11px] text-slate-500">{e.color}</div>
                      </td>
                      <td className="p-3 font-bold text-amber-300">{e.seedMantra}</td>
                      <td className="p-3">{e.endocrineGlands.join(', ')}</td>
                      <td className="p-3">
                        <div>{e.herbs.slice(0, 2).join(', ')}</div>
                        <div className="text-[11px] text-purple-400">{e.crystals.slice(0, 2).join(', ')}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">{e.crossDomainLinks.vastuZone}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                          {e.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: KNOWLEDGE GRAPH */}
        {activeTab === 'Knowledge Graph' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-400" />
                  Knowledge Graph Visualization & Cross-Domain Links
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bi-directional links between Chakras, Pancha Mahabhutas, Directions, Vastu Zones & Remedies.
                </p>
              </div>
            </div>

            {/* Interactive Graph Node Representation */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-4 left-4 text-xs text-slate-500 flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" /> Graph Nodes Connected: {adminEntities.length * 3}
              </div>

              {/* Node Layout Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 w-full">
                {adminEntities.map(c => (
                  <div
                    key={c.id}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-xl text-center space-y-2 transition-all group"
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-sm shadow-lg group-hover:scale-110 transition-transform">
                      {c.seedMantra}
                    </div>
                    <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300">
                      {c.sanskritName}
                    </div>
                    <div className="text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded border border-slate-800/80">
                      ↓ {c.crossDomainLinks.panchaMahabhuta}
                    </div>
                    <div className="text-[10px] text-purple-300 bg-purple-950/30 p-1.5 rounded border border-purple-800/30">
                      ↓ {c.crossDomainLinks.vastuZone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RELATIONSHIP EXPLORER */}
        {activeTab === 'Relationship Explorer' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-indigo-400" />
                  Chakra Relationship Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  SUPPORTS, BALANCES, WEAKENS, BLOCKS, STRENGTHENS, AFFECTS, CONNECTED_TO.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relationships.map(r => (
                <div key={r.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded">
                      {r.relationshipType}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Weight: {r.weight}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{r.description}</p>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 flex justify-between">
                    <span>Source: {r.sourceDocumentId}</span>
                    <span>Status: {r.approvalStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CONFLICT RESOLUTION (ADMIN ONLY) */}
        {activeTab === 'Conflict Resolution' && role === 'Admin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Conflict Detection & Expert Resolution Pipeline
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detects Book A vs Book B and Research vs Traditional contradictions. Both sources are preserved.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {conflicts.map(c => (
                <div key={c.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                        {c.conflictType}
                      </span>
                      <span className="text-sm font-bold text-slate-200">{c.topicName}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 font-bold rounded ${
                      c.reviewStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      c.reviewStatus === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {c.reviewStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-bold text-amber-300">{c.sourceATitle}</div>
                      <p className="text-slate-300 italic">"{c.statementA}"</p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-bold text-purple-300">{c.sourceBTitle}</div>
                      <p className="text-slate-300 italic">"{c.statementB}"</p>
                    </div>
                  </div>

                  {c.expertNotes && (
                    <div className="text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-slate-300">
                      <span className="font-bold text-slate-400">Expert Reviewer Notes ({c.reviewedBy}):</span> {c.expertNotes}
                    </div>
                  )}

                  {c.reviewStatus === 'Pending' && (
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={() => handleResolveConflict(c.id, 'Approved')}
                        className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve both with Expert Reconciliation
                      </button>
                      <button
                        onClick={() => handleResolveConflict(c.id, 'Needs Revision')}
                        className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Flag for Secondary SME Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: DUPLICATE DETECTION (ADMIN ONLY) */}
        {activeTab === 'Duplicate Detection' && role === 'Admin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Copy className="w-5 h-5 text-indigo-400" />
                  Duplicate Detection & Merging Engine
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identifies duplicate Chakras, Remedies, Mantras & Symbols. Merge only after expert approval.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {duplicates.map((d, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100">{d.sourceTitle}</span>
                      <span className="text-slate-500">↔</span>
                      <span className="font-bold text-amber-300">{d.matchedTitle}</span>
                    </div>
                    <div className="text-slate-400 mt-1 flex items-center gap-3">
                      <span>Type: {d.matchType}</span>
                      <span>•</span>
                      <span>Similarity: {(d.similarityScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMergeDuplicate(d.sourceId, d.matchedId)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all"
                  >
                    Merge Nodes
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: QUALITY DASHBOARD (ADMIN ONLY) */}
        {activeTab === 'Quality Dashboard' && role === 'Admin' && qualityBreakdown && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  Knowledge Quality Scoring Engine (0 - 100)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluates source quality, evidence count, expert approval, and ontology completeness.
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold text-emerald-400">{qualityBreakdown.overallScore}</span>
                <span className="text-xs text-slate-400 ml-1">/ 100 ({qualityBreakdown.qualityGrade})</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Source Quality Score</span>
                <span className="text-lg font-bold text-slate-100">{qualityBreakdown.sourceQualityScore} / 20</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Evidence Count Score</span>
                <span className="text-lg font-bold text-slate-100">{qualityBreakdown.evidenceCountScore} / 15</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Ontology Completeness</span>
                <span className="text-lg font-bold text-slate-100">{qualityBreakdown.ontologyCompletenessScore} / 25</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: VERSION HISTORY */}
        {activeTab === 'Version History' && role === 'Admin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              Audit Log & Version History
            </h2>

            <div className="space-y-3 text-xs">
              {documents.map(d => (
                <div key={d.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-100">{d.title}</div>
                    <div className="text-slate-400 mt-0.5">Author: {d.author} • Category: {d.category}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
                      {d.version}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: EVIDENCE EXPLORER */}
        {activeTab === 'Evidence Explorer' && role === 'Admin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-purple-400" />
              Evidence Explorer & Verification Levels
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {adminEntities.map(e => (
                <div key={e.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{e.sanskritName} ({e.englishName})</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded">
                      {e.evidenceLevel}
                    </span>
                  </div>
                  <div className="text-slate-400">Primary Source: {e.primarySource}</div>
                  <div className="text-slate-500">Secondary Source: {e.secondarySource}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: APPROVAL QUEUE */}
        {activeTab === 'Approval Queue' && role === 'Admin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Expert Approval Pipeline
            </h2>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
              All 7 canonical primary Chakras have received formal approval from Acharya Dr. V. K. Shastri. Queue is clear.
            </div>
          </div>
        )}

        {/* TAB 12: ADMIN NOTES */}
        {activeTab === 'Admin Notes' && role === 'Admin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Confidential Admin Notes & System Export
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              Confidential internal notes regarding biofield resonance experiments, Sanskrit pronunciation acoustic waveforms, and cross-domain energy mappings. Access restricted to authorized AI OS Administrators and Expert Reviewers.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChakraKnowledgeLibraryWorkspace;
