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
  Search,
  BookOpen,
  Sparkles,
  Activity,
  UserCheck,
  Compass,
  Star,
  CheckCircle2,
  XCircle,
  FileText,
  Sliders,
  Filter,
  Eye,
  RefreshCw,
  Zap,
  Globe,
  Tag,
  Sun,
  Moon,
  Feather
} from 'lucide-react';

import {
  AstrologyMasterKnowledgeRegistry,
  IAstrologyOntologyEntity,
  IAstrologyRelationship,
  IAstrologyConflict,
  IAstrologyDuplicateMatch,
  IAstrologyQualityScoreBreakdown,
  IAstrologyEndUserEntity,
  AstrologyEntityType,
  AstrologyKnowledgeStatus as KnowledgeStatus
} from '../../core/knowledge_sources';

interface AstrologyKnowledgeLibraryWorkspaceProps {
  userRole?: 'Admin' | 'EndUser' | 'ExpertReviewer';
}

export const AstrologyKnowledgeLibraryWorkspace: React.FC<AstrologyKnowledgeLibraryWorkspaceProps> = ({
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

  const registry = AstrologyMasterKnowledgeRegistry.getInstance();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AstrologyEntityType | 'All'>('All');
  const [selectedPlanet, setSelectedPlanet] = useState<string>('All');
  const [selectedRashi, setSelectedRashi] = useState<string>('All');
  const [selectedNakshatra, setSelectedNakshatra] = useState<string>('All');
  const [selectedBhava, setSelectedBhava] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<KnowledgeStatus | 'All'>('All');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('grh-001');

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
    planet: selectedPlanet,
    rashi: selectedRashi,
    nakshatra: selectedNakshatra,
    bhava: selectedBhava,
    status: selectedStatus
  });

  const filteredEndUserEntities = endUserEntities.filter(e => {
    const matchType = selectedType === 'All' || e.entityType === selectedType;
    const matchQuery =
      !searchQuery ||
      e.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchQuery;
  });

  const handleResolveConflict = (conflictId: string, status: 'RESOLVED_CANONICAL' | 'CONTEXTUAL_SPLIT') => {
    registry.resolveConflict(conflictId, status, 'Resolved via Astrology Workspace Admin UI', 'Admin Astrologer');
    // Force re-render trigger
    setSelectedEntityId(prev => prev);
  };

  const handleDuplicateAction = (matchId: string, status: 'MERGED' | 'DISMISSED') => {
    registry.updateDuplicateStatus(matchId, status);
    setSelectedEntityId(prev => prev);
  };

  const handleStatusChange = (entityId: string, newStatus: KnowledgeStatus) => {
    registry.updateStatus(entityId, newStatus, 'Admin Astrologer', `Status set to ${newStatus}`);
    setSelectedEntityId(prev => prev);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER WITH STRICT KNOWLEDGE-ONLY DISCLAIMER */}
      <div className="p-6 bg-slate-900 border border-amber-500/30 rounded-xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <Sun className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-amber-100">
                  DOMAIN-005 — Enterprise Astrology Intelligence Library
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v1.0 CANONICAL
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                The canonical Vedic & Classical Astrology knowledge repository for URJAFLUX AI OS. Verified source-backed ontology covering Grahas, Rashis, Nakshatras, Bhavas, Yogas, Divisional Charts, and Dasha frameworks.
              </p>
            </div>
          </div>

          {/* RBAC ROLE TOGGLE */}
          <div className="flex items-center space-x-3 bg-slate-800/80 p-2 rounded-lg border border-slate-700">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-300">View Context:</span>
            <button
              onClick={() => setRole('Admin')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                role === 'Admin'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin (Full Audit)
            </button>
            <button
              onClick={() => setRole('EndUser')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                role === 'EndUser'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              End User (Canonical)
            </button>
          </div>
        </div>

        {/* STRICT DISCLAIMER */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2 text-xs text-amber-300/90 bg-amber-950/30 px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Architectural Scope Mandate:</strong> This is an Enterprise Knowledge Base only. It stores, verifies, and catalogs classical astrology literature. It strictly DOES NOT perform Kundli birth-chart generation, planetary positioning, transit calculations, horoscope predictions, or remedy prescriptions.
          </span>
        </div>
      </div>

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Entities</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{adminEntities.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1">100% Traceable</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Canonical Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{endUserEntities.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Visible to End Users</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Conflicts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{conflicts.length}</div>
          <div className="text-[10px] text-amber-300 mt-1">Requires SME Resolution</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Duplicate Matches</span>
            <Copy className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{duplicates.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Similarity Threshold &ge;60%</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Graph Relationships</span>
            <GitBranch className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{relationships.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Cross-Domain Synced</div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center space-x-1 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
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
        ].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Astrology Knowledge Architecture Overview</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The Enterprise Astrology Intelligence Library provides an authoritative, evidence-backed knowledge graph covering classical Vedic astrology literature. It anchors astrological taxonomy across eight primary entity types to support high-fidelity knowledge retrieval.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">9 Classical Grahas</h4>
                  <p className="text-xs text-slate-400">Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, Ketu with explicit exaltation, debilitation, and mooltrikona degree metadata.</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">12 Rashis & 27 Nakshatras</h4>
                  <p className="text-xs text-slate-400">Complete zodiac sign properties, modalities, elements, and lunar mansion lords with deity and symbol attributes.</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">12 Bhavas & Yogas</h4>
                  <p className="text-xs text-slate-400">House significations (Kendra, Trikona, Dusthana) and classical yoga combinations (Gaja Kesari, Budhaditya, Raja Yogas).</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Divisional Charts & Dashas</h4>
                  <p className="text-xs text-slate-400">Varga classifications (D1 to D60) and Vimshottari cycle frameworks maintained as pure conceptual knowledge.</p>
                </div>
              </div>
            </div>

            {/* FEATURED CANONICAL ENTITIES */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-md font-semibold text-slate-100 flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Canonical Astrology Entities</span>
                </span>
                <span className="text-xs text-amber-400">
                  Showing {role === 'Admin' ? adminEntities.length : endUserEntities.length} Registered
                </span>
              </h3>

              <div className="space-y-3">
                {(role === 'Admin' ? adminEntities : endUserEntities).slice(0, 4).map(entity => (
                  <div
                    key={entity.id}
                    onClick={() => setSelectedEntityId(entity.id)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedEntityId === entity.id
                        ? 'bg-amber-950/20 border-amber-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {entity.entityType}
                        </span>
                        <h4 className="text-sm font-bold">{entity.canonicalName}</h4>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                        Score: {'truthEngineMetrics' in entity ? entity.truthEngineMetrics.confidenceScore : entity.confidenceScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{entity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR PANEL */}
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-md font-semibold text-slate-100 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Truth Engine Status</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Classical Sources</span>
                  <span className="text-slate-200 font-mono font-semibold">BPHS, Phaladeepika, Saravali</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Verification Engine</span>
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Conflict Engine</span>
                  <span className="text-amber-400 font-semibold">{conflicts.length} Active</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Knowledge Graph Sync</span>
                  <span className="text-indigo-400 font-semibold">Cross-Domain Ready</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-md font-semibold text-slate-100 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Quality Score Summary</span>
              </h3>
              <div className="p-4 bg-slate-950 rounded-lg text-center space-y-2">
                <div className="text-3xl font-extrabold text-amber-400 font-mono">
                  {qualityBreakdown.overallScore} / 100
                </div>
                <div className="text-xs text-slate-400">
                  Grade: <span className="font-bold text-amber-300">{qualityBreakdown.grade}</span> (Verified Classical Authority)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENTITY BROWSER */}
      {activeTab === 'Entity Browser' && (
        <div className="space-y-6">
          {/* SEARCH AND FILTERS */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Graha, Rashi, Nakshatra, Bhava, Yoga..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-800 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
                className="bg-slate-950 text-slate-300 border border-slate-800 text-xs px-3 py-2 rounded-lg"
              >
                <option value="All">All Types</option>
                <option value="Graha">Grahas</option>
                <option value="Rashi">Rashis</option>
                <option value="Nakshatra">Nakshatras</option>
                <option value="Bhava">Bhavas</option>
                <option value="Yoga">Yogas</option>
                <option value="DivisionalChart">Divisional Charts</option>
                <option value="DashaConcept">Dasha Concepts</option>
              </select>

              {role === 'Admin' && (
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as any)}
                  className="bg-slate-950 text-slate-300 border border-slate-800 text-xs px-3 py-2 rounded-lg"
                >
                  <option value="All">All Statuses</option>
                  <option value="CANONICAL">CANONICAL</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                </select>
              )}
            </div>
          </div>

          {/* GRID DISPLAY */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(role === 'Admin' ? filteredAdminEntities : filteredEndUserEntities).map(e => (
              <div
                key={e.id}
                onClick={() => setSelectedEntityId(e.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedEntityId === e.id
                    ? 'bg-amber-950/20 border-amber-500 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {e.entityType}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {'status' in e ? e.status : 'CANONICAL'}
                    </span>
                  </div>
                  <h4 className="text-md font-bold text-slate-100">{e.canonicalName}</h4>
                  {e.sanskritName && <p className="text-xs text-amber-400/90 mt-0.5 font-sans">{e.sanskritName}</p>}
                  <p className="text-xs text-slate-400 mt-3 line-clamp-3">{e.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Confidence: {'truthEngineMetrics' in e ? e.truthEngineMetrics.confidenceScore : e.confidenceScore}%</span>
                  <span className="text-amber-400 flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KNOWLEDGE EXPLORER */}
      {activeTab === 'Knowledge Explorer' && selectedAdminEntity && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {selectedAdminEntity.entityType} Entity Record
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-1">{selectedAdminEntity.canonicalName}</h2>
              {selectedAdminEntity.sanskritName && (
                <p className="text-sm text-amber-300 mt-0.5">{selectedAdminEntity.sanskritName}</p>
              )}
            </div>
            {role === 'Admin' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={selectedAdminEntity.status}
                  onChange={e => handleStatusChange(selectedAdminEntity.id, e.target.value as KnowledgeStatus)}
                  className="bg-slate-950 text-amber-400 border border-slate-800 text-xs px-3 py-1.5 rounded-lg font-semibold"
                >
                  <option value="CANONICAL">CANONICAL</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ontological Attributes</h3>
              <p className="text-sm text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800 leading-relaxed">
                {selectedAdminEntity.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {selectedAdminEntity.associatedPlanet && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block">Associated Planet</span>
                    <span className="text-amber-300 font-semibold">{selectedAdminEntity.associatedPlanet}</span>
                  </div>
                )}
                {selectedAdminEntity.associatedRashi && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block">Associated Rashi</span>
                    <span className="text-amber-300 font-semibold">{selectedAdminEntity.associatedRashi}</span>
                  </div>
                )}
                {selectedAdminEntity.associatedElement && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block">Element</span>
                    <span className="text-amber-300 font-semibold">{selectedAdminEntity.associatedElement}</span>
                  </div>
                )}
                {selectedAdminEntity.associatedGemstone && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block">Gemstone</span>
                    <span className="text-amber-300 font-semibold">{selectedAdminEntity.associatedGemstone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SOURCE TRACEABILITY & TRUTH ENGINE METRICS */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Traceability & Truth Metrics</h3>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Source Book</span>
                  <span className="text-amber-300 font-medium">{selectedAdminEntity.sourceTraceability.sourceBook}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Author & Edition</span>
                  <span className="text-slate-200">{selectedAdminEntity.sourceTraceability.author} ({selectedAdminEntity.sourceTraceability.edition})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Chapter & Verse</span>
                  <span className="text-slate-200">{selectedAdminEntity.sourceTraceability.chapter}, {selectedAdminEntity.sourceTraceability.verseOrShloka}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">OCR Confidence</span>
                  <span className="text-emerald-400 font-mono font-bold">{(selectedAdminEntity.sourceTraceability.ocrConfidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Truth Engine Confidence</span>
                  <span className="text-amber-400 font-mono font-bold">{selectedAdminEntity.truthEngineMetrics.confidenceScore}% ({selectedAdminEntity.truthEngineMetrics.confidenceGrade})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONFLICT RESOLUTION */}
      {activeTab === 'Conflict Resolution' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="text-md font-bold text-slate-100 mb-1">Astrological Conflict Engine & Discrepancies</h3>
            <p className="text-xs text-slate-400">
              Manages classical discrepancies between Vedic texts (e.g., exact point vs 10-degree arc exaltation degrees, Sri Pati Equal House vs Bhava Chalita systems).
            </p>
          </div>

          <div className="space-y-4">
            {conflicts.map(c => (
              <div key={c.conflictId} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {c.conflictType}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    c.status === 'RESOLVED_CANONICAL' ? 'bg-emerald-500/10 text-emerald-400' :
                    c.status === 'CONTEXTUAL_SPLIT' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <p className="text-sm text-slate-200">{c.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-amber-400 font-semibold block mb-1">Source A: {c.sourceA}</span>
                    <p className="text-slate-300">{c.claimA}</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-amber-400 font-semibold block mb-1">Source B: {c.sourceB}</span>
                    <p className="text-slate-300">{c.claimB}</p>
                  </div>
                </div>

                {role === 'Admin' && c.status === 'UNRESOLVED' && (
                  <div className="pt-3 flex space-x-3">
                    <button
                      onClick={() => handleResolveConflict(c.conflictId, 'RESOLVED_CANONICAL')}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                    >
                      Set Canonical Priority
                    </button>
                    <button
                      onClick={() => handleResolveConflict(c.conflictId, 'CONTEXTUAL_SPLIT')}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                    >
                      Preserve Contextual Split
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: KNOWLEDGE GRAPH */}
      {activeTab === 'Knowledge Graph' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-md font-bold text-slate-100 flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>Cross-Domain Knowledge Graph Inspector</span>
          </h3>
          <p className="text-xs text-slate-400">
            Synapses connecting Astrology entities to shared celestial and elemental nodes across Vastu, Chakra, Lal Kitab, and Numerology domains.
          </p>

          <div className="space-y-3 pt-2">
            {relationships.map(rel => (
              <div key={rel.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-amber-400">{rel.sourceEntityId}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                    {rel.relationshipType}
                  </span>
                  <span className="font-mono text-emerald-400">{rel.targetEntityId}</span>
                </div>
                <span className="text-slate-400">{rel.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: QUALITY DASHBOARD */}
      {activeTab === 'Quality Dashboard' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
          <h3 className="text-md font-bold text-slate-100 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>5-Factor Truth & Quality Score Engine</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-xs text-slate-400 block mb-1">OCR Accuracy</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{qualityBreakdown.ocrAccuracy}%</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-xs text-slate-400 block mb-1">Source Authority</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{qualityBreakdown.sourceAuthority}%</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-xs text-slate-400 block mb-1">Evidence Strength</span>
              <span className="text-xl font-bold text-indigo-400 font-mono">{qualityBreakdown.evidenceStrength}%</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-xs text-slate-400 block mb-1">SME Consensus</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">{qualityBreakdown.smeConsensus}%</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-xs text-slate-400 block mb-1">Onto-Completeness</span>
              <span className="text-xl font-bold text-purple-400 font-mono">{qualityBreakdown.ontologicalCompleteness}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
