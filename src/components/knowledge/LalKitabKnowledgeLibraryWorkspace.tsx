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
  UserCheck,
  Compass,
  Zap,
  Globe,
  Tag
} from 'lucide-react';

import {
  LalKitabMasterKnowledgeRegistry,
  ILalKitabOntologyEntity,
  ILalKitabRelationship,
  ILalKitabConflict,
  ILalKitabDuplicateMatch,
  ILalKitabQualityScoreBreakdown,
  ILalKitabEndUserEntity,
  LalKitabEntityType,
  KnowledgeStatus
} from '../../core/knowledge_sources';

interface LalKitabKnowledgeLibraryWorkspaceProps {
  userRole?: 'Admin' | 'EndUser' | 'ExpertReviewer';
}

export const LalKitabKnowledgeLibraryWorkspace: React.FC<LalKitabKnowledgeLibraryWorkspaceProps> = ({
  userRole: initialUserRole = 'Admin'
}) => {
  const [role, setRole] = useState<'Admin' | 'EndUser'>(
    initialUserRole === 'Admin' ? 'Admin' : 'EndUser'
  );

  const [activeTab, setActiveTab] = useState<
    | 'Overview'
    | 'Entity Browser'
    | 'Knowledge Explorer'
    | 'Source Manager'
    | 'Conflict Resolution'
    | 'Verification Queue'
    | 'Canonical Rules'
    | 'Knowledge Graph'
    | 'Duplicate Detection'
    | 'Quality Dashboard'
    | 'Audit History'
  >('Overview');

  const registry = LalKitabMasterKnowledgeRegistry.getInstance();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<LalKitabEntityType | 'All'>('All');
  const [selectedPlanet, setSelectedPlanet] = useState<string>('All');
  const [selectedHouse, setSelectedHouse] = useState<number | 0>(0);
  const [selectedStatus, setSelectedStatus] = useState<KnowledgeStatus | 'All'>('All');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('lk-grh-001');

  const adminEntities = registry.getAdminEntities();
  const endUserEntities = registry.getEndUserEntities();

  const selectedAdminEntity = registry.getAdminEntityById(selectedEntityId) || adminEntities[0];
  const selectedEndUserEntity = registry.getEndUserEntityById(selectedEntityId) || endUserEntities[0];

  const conflicts = registry.getAllConflicts();
  const duplicates = registry.getDuplicateMatches();
  const relationships = registry.getAllRelationships();

  const qualityBreakdown = registry.getAdminQualityScore(selectedEntityId);

  // Filtered lists
  const filteredAdminEntities = registry.searchEntities({
    query: searchQuery,
    entityType: selectedType,
    planetId: selectedPlanet !== 'All' ? selectedPlanet : undefined,
    houseNumber: selectedHouse !== 0 ? selectedHouse : undefined,
    status: selectedStatus
  });

  const filteredEndUserEntities = endUserEntities.filter(e => {
    const matchType = selectedType === 'All' || e.entityType === selectedType;
    const matchHouse = selectedHouse === 0 || e.houseNumber === selectedHouse;
    const matchQuery = !searchQuery ||
      e.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.hindiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchHouse && matchQuery;
  });

  // Action handlers
  const handleResolveConflict = (conflictId: string, status: 'RESOLVED_CANONICAL' | 'CONTEXTUAL_SPLIT') => {
    registry.resolveConflict(conflictId, status, 'Resolved via Admin Workspace interface', 'Admin Acharya');
    setActiveTab('Conflict Resolution'); // Refresh
  };

  const handleUpdateStatus = (entityId: string, newStatus: KnowledgeStatus) => {
    registry.updateStatus(entityId, newStatus, 'Admin Acharya', 'Manual status promotion in Admin Workspace');
    setActiveTab('Entity Browser');
  };

  const canonicalCount = adminEntities.filter(e => e.status === 'CANONICAL').length;
  const canonicalPercent = Math.round((canonicalCount / Math.max(1, adminEntities.length)) * 100);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100 tracking-wide">
                DOMAIN-003 — Enterprise Lal Kitab Intelligence Library
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/50">
                LAL KITAB CANON
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified Shastric Grahas, Bhavs, Upays, Daan, Objects & Spatial Alignments
            </p>
          </div>
        </div>

        {/* ROLE TOGGLE FOR VERIFICATION */}
        <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl">
          <span className="text-xs font-mono text-slate-400 pl-2">RBAC Mode:</span>
          <button
            onClick={() => setRole('Admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              role === 'Admin'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => setRole('EndUser')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              role === 'EndUser'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>End User View</span>
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center space-x-1 px-4 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
        {(
          role === 'Admin'
            ? [
                'Overview',
                'Entity Browser',
                'Knowledge Explorer',
                'Source Manager',
                'Conflict Resolution',
                'Verification Queue',
                'Canonical Rules',
                'Knowledge Graph',
                'Duplicate Detection',
                'Quality Dashboard',
                'Audit History'
              ]
            : ['Overview', 'Entity Browser', 'Knowledge Explorer', 'Canonical Rules', 'Knowledge Graph']
        ).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3.5 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === tab
                ? 'border-amber-400 text-amber-400 bg-amber-500/5 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab === 'Overview' && <Layers className="w-3.5 h-3.5" />}
            {tab === 'Entity Browser' && <Database className="w-3.5 h-3.5" />}
            {tab === 'Knowledge Explorer' && <Search className="w-3.5 h-3.5" />}
            {tab === 'Source Manager' && <BookOpen className="w-3.5 h-3.5" />}
            {tab === 'Conflict Resolution' && <AlertTriangle className="w-3.5 h-3.5" />}
            {tab === 'Verification Queue' && <FileCheck className="w-3.5 h-3.5" />}
            {tab === 'Canonical Rules' && <Award className="w-3.5 h-3.5" />}
            {tab === 'Knowledge Graph' && <GitBranch className="w-3.5 h-3.5" />}
            {tab === 'Duplicate Detection' && <Copy className="w-3.5 h-3.5" />}
            {tab === 'Quality Dashboard' && <Activity className="w-3.5 h-3.5" />}
            {tab === 'Audit History' && <History className="w-3.5 h-3.5" />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-900/90 space-y-6">
        {/* TAB 1: OVERVIEW & DASHBOARD METRICS */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            {/* METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>TOTAL ONTOLOGY ENTITIES</span>
                  <Database className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100">{adminEntities.length}</div>
                <div className="text-[11px] text-amber-400 font-mono">Grahas, Bhavs, Upays, Daan & Metals</div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>CANONICAL COMPLIANCE</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">{canonicalPercent}%</div>
                <div className="text-[11px] text-slate-400 font-mono">{canonicalCount} of {adminEntities.length} Verified</div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>ACTIVE CONFLICTS</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400">{conflicts.length}</div>
                <div className="text-[11px] text-slate-400 font-mono">Edition Discrepancies Managed</div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>KNOWLEDGE GRAPH LINKS</span>
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-400">{relationships.length}</div>
                <div className="text-[11px] text-slate-400 font-mono">Cross-Entity Relationships</div>
              </div>
            </div>

            {/* ENTITY TYPE DISTRIBUTION SUMMARY */}
            <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Canonical Lal Kitab Entity Taxonomy</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">Farman Manuscripts (1939 - 1952)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {[
                  { label: 'Grahas (Planets)', count: adminEntities.filter(e => e.entityType === 'Graha').length, color: 'text-amber-400 bg-amber-950/30 border-amber-800/40' },
                  { label: 'Bhavs (Houses)', count: adminEntities.filter(e => e.entityType === 'Bhav').length, color: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/40' },
                  { label: 'Remedies (Upays)', count: adminEntities.filter(e => e.entityType === 'Remedy').length, color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' },
                  { label: 'Objects & Metals', count: adminEntities.filter(e => e.entityType === 'Object' || e.entityType === 'Metal').length, color: 'text-purple-400 bg-purple-950/30 border-purple-800/40' },
                  { label: 'Directions & Rooms', count: adminEntities.filter(e => e.entityType === 'Direction' || e.entityType === 'Room').length, color: 'text-blue-400 bg-blue-950/30 border-blue-800/40' },
                  { label: 'Conditions & Rules', count: adminEntities.filter(e => e.entityType === 'ConditionalRule').length, color: 'text-rose-400 bg-rose-950/30 border-rose-800/40' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border space-y-1 ${item.color}`}>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">{item.label}</div>
                    <div className="text-xl font-bold font-mono">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FEATURED CANONICAL ENTITY HIGHLIGHT */}
            <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Featured Shastric Entity Manifest</span>
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-800/40">
                  CONFIDENCE GRADE {selectedAdminEntity.truthEngineMetrics.confidenceGrade} (98/100)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3 lg:col-span-2">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-100">{selectedAdminEntity.canonicalName}</h4>
                    <p className="text-xs font-mono text-slate-400">{selectedAdminEntity.hindiName} • {selectedAdminEntity.urduName}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3.5 rounded-lg border border-slate-800/80">
                    {selectedAdminEntity.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedAdminEntity.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700/60 rounded text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3 text-xs font-mono">
                  <div className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800 pb-1">
                    Traceable Source Provenance
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Source Book:</span>
                      <span className="font-semibold">{selectedAdminEntity.sourceTraceability.sourceBook}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chapter / Farman:</span>
                      <span>{selectedAdminEntity.sourceTraceability.chapter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Page / Paragraph:</span>
                      <span>p.{selectedAdminEntity.sourceTraceability.pageNumber} ({selectedAdminEntity.sourceTraceability.paragraph})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">OCR Confidence:</span>
                      <span className="text-emerald-400 font-bold">{Math.round(selectedAdminEntity.sourceTraceability.ocrConfidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENTITY BROWSER */}
        {activeTab === 'Entity Browser' && (
          <div className="space-y-4">
            {/* CONTROLS & SEARCH BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search entities, Hindi names, metals..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="All">All Entity Types</option>
                <option value="Graha">Graha (Planet)</option>
                <option value="Bhav">Bhav (House)</option>
                <option value="Remedy">Remedy (Upay)</option>
                <option value="Object">Object</option>
                <option value="Metal">Metal</option>
                <option value="Direction">Direction</option>
                <option value="ConditionalRule">Conditional Rule</option>
              </select>

              <select
                value={selectedHouse}
                onChange={e => setSelectedHouse(Number(e.target.value))}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value={0}>All Houses (Bhav 1-12)</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                  <option key={h} value={h}>Bhav {h}</option>
                ))}
              </select>

              {role === 'Admin' && (
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as any)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="All">All Statuses</option>
                  <option value="CANONICAL">Canonical</option>
                  <option value="DRAFT">Draft</option>
                  <option value="DISPUTED">Disputed</option>
                </select>
              )}
            </div>

            {/* ENTITY GRID / LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(role === 'Admin' ? filteredAdminEntities : filteredEndUserEntities).map((entity: any) => (
                <div
                  key={entity.id}
                  onClick={() => setSelectedEntityId(entity.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    selectedEntityId === entity.id
                      ? 'bg-slate-950 border-amber-500/80 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">
                      {entity.entityType}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Grade {entity.truthEngineMetrics?.confidenceGrade || entity.confidenceGrade || 'A+'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{entity.canonicalName}</h4>
                    <p className="text-xs font-mono text-slate-400">{entity.hindiName}</p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {entity.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <span>{entity.associatedMetal || entity.category}</span>
                    {role === 'Admin' && (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        entity.status === 'CANONICAL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {entity.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: KNOWLEDGE EXPLORER */}
        {activeTab === 'Knowledge Explorer' && (
          <div className="space-y-4">
            <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Enterprise Search & Discovery Engine</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">Full-text & Semantic Matching</span>
              </div>

              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter keyword e.g. 'Solid Silver', '43 Days', 'Surya', 'Mangal Badd', 'Kitchen'..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Search Results ({filteredAdminEntities.length} Matches)</div>
                {filteredAdminEntities.map(item => (
                  <div key={item.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-100">{item.canonicalName}</span>
                      <span className="text-xs font-mono text-amber-400 font-bold">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-400 pt-1">
                      <span>Source: {item.sourceTraceability.sourceBook}</span>
                      <span>Chapter: {item.sourceTraceability.chapter}</span>
                      <span className="text-emerald-400">OCR: {Math.round(item.sourceTraceability.ocrConfidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOURCE MANAGER (ADMIN) */}
        {activeTab === 'Source Manager' && role === 'Admin' && (
          <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Primary Manuscript Source Books & Traceability</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">5 APPROVED EDITIONS</span>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Lal Kitab 1939 Farman', language: 'Urdu / Punjabi', pages: 384, reliability: 99, status: 'CANONICAL MASTER' },
                { title: 'Ilm Samudrik Lal Kitab 1940', language: 'Urdu', pages: 256, reliability: 97, status: 'APPROVED CANON' },
                { title: 'Lal Kitab Gutke 1941 Edition', language: 'Urdu', pages: 192, reliability: 96, status: 'APPROVED CANON' },
                { title: 'Lal Kitab Tarmeem 1942 Edition', language: 'Hindi / Urdu', pages: 320, reliability: 98, status: 'APPROVED CANON' },
                { title: 'Lal Kitab 1952 Complete Farman', language: 'Hindi Master Translation', pages: 576, reliability: 100, status: 'GOLD STANDARD' }
              ].map((book, i) => (
                <div key={i} className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">{book.title}</h4>
                    <p className="text-xs font-mono text-slate-400">{book.language} • {book.pages} Pages</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-amber-950/60 text-amber-400 rounded border border-amber-800/40 block">
                      {book.status}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                      Reliability Score: {book.reliability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CONFLICT RESOLUTION (ADMIN) */}
        {activeTab === 'Conflict Resolution' && role === 'Admin' && (
          <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Scriptural Conflict & Edition Discrepancy Manager</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">{conflicts.length} Recorded Conflicts</span>
            </div>

            <div className="space-y-4">
              {conflicts.map(conflict => (
                <div key={conflict.conflictId} className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">{conflict.conflictType}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                      conflict.status === 'RESOLVED_CANONICAL' || conflict.status === 'CONTEXTUAL_SPLIT'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : 'bg-amber-950 text-amber-400'
                    }`}>
                      {conflict.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-semibold">{conflict.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                      <span className="text-slate-400 font-bold block">{conflict.sourceA}:</span>
                      <p className="text-slate-300">{conflict.claimA}</p>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                      <span className="text-slate-400 font-bold block">{conflict.sourceB}:</span>
                      <p className="text-slate-300">{conflict.claimB}</p>
                    </div>
                  </div>

                  {conflict.resolutionNotes && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs font-mono text-emerald-300">
                      <span className="font-bold block">Resolution Notes ({conflict.resolvedBy}):</span>
                      <p>{conflict.resolutionNotes}</p>
                    </div>
                  )}

                  {conflict.status === 'UNRESOLVED' && (
                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => handleResolveConflict(conflict.conflictId, 'RESOLVED_CANONICAL')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg transition-all"
                      >
                        Approve 1952 Canonical Standard
                      </button>
                      <button
                        onClick={() => handleResolveConflict(conflict.conflictId, 'CONTEXTUAL_SPLIT')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-all"
                      >
                        Mark Contextual Rule Split
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CANONICAL RULES */}
        {activeTab === 'Canonical Rules' && (
          <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Verified Canonical Lal Kitab Rules</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">{endUserEntities.length} Active Rules</span>
            </div>

            <div className="space-y-3">
              {endUserEntities.map(rule => (
                <div key={rule.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100">{rule.canonicalName}</h4>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                      GRADE {rule.confidenceGrade} ({rule.confidenceScore}/100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: KNOWLEDGE GRAPH */}
        {activeTab === 'Knowledge Graph' && (
          <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                <GitBranch className="w-4 h-4" />
                <span>Lal Kitab Dependency & Inter-Entity Knowledge Graph</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">{relationships.length} Graph Edges</span>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relationships.map(rel => {
                  const src = registry.getAdminEntityById(rel.sourceEntityId);
                  const tgt = registry.getAdminEntityById(rel.targetEntityId);
                  return (
                    <div key={rel.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span>{src?.canonicalName || rel.sourceEntityId}</span>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-cyan-400">{rel.relationshipType}</span>
                        <span>{tgt?.canonicalName || rel.targetEntityId}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{rel.description}</p>
                      {rel.isConditional && (
                        <div className="text-[10px] text-amber-300/80 italic">Condition: {rel.conditionText}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LalKitabKnowledgeLibraryWorkspace;
