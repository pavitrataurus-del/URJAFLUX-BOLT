// ============================================================================
// URJAFLUX AI OS - Founder Knowledge Console (FKC)
// Module: FounderInboxView (Unified Pending Knowledge Queue & Filters)
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  IIngestionPipelinePackage,
  KnowledgeDomain,
} from '../../knowledge_ingestion/types/universalIngestion.types';
import { universalIngestionEngine } from '../../knowledge_ingestion/services/UniversalIngestionEngine';
import {
  Inbox,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Archive,
  Layers,
  FileText,
  Calendar,
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';

interface FounderInboxViewProps {
  userRole?: 'ADMIN' | 'END_USER';
  onSelectPackageForReview: (packageId: string) => void;
  onSelectPackageForMergeSplit?: (packageId: string) => void;
}

export const FounderInboxView: React.FC<FounderInboxViewProps> = ({
  userRole = 'ADMIN',
  onSelectPackageForReview,
  onSelectPackageForMergeSplit,
}) => {
  const [packages, setPackages] = useState<IIngestionPipelinePackage[]>(() =>
    universalIngestionEngine.getAllPackages(userRole)
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedDocument, setSelectedDocument] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  const refreshPackages = () => {
    setPackages(universalIngestionEngine.getAllPackages(userRole));
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages
      .filter((pkg) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = pkg.metadata.title.toLowerCase().includes(q);
          const matchesFile = pkg.fileName.toLowerCase().includes(q);
          const matchesEntity = pkg.entities.some((e) => e.name.toLowerCase().includes(q));
          if (!matchesTitle && !matchesFile && !matchesEntity) return false;
        }

        // Domain filter
        if (selectedDomain !== 'ALL' && pkg.metadata.domain !== selectedDomain) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'ALL') {
          const status = pkg.metadata.approvalStatus || 'PENDING';
          if (status !== selectedStatus) return false;
        }

        // Priority filter
        if (selectedPriority !== 'ALL' && pkg.evidence.knowledgePriority !== selectedPriority) {
          return false;
        }

        // Document filter
        if (selectedDocument !== 'ALL' && pkg.id !== selectedDocument) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.uploadedAt).getTime();
        const timeB = new Date(b.uploadedAt).getTime();
        return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
      });
  }, [packages, searchQuery, selectedDomain, selectedStatus, selectedPriority, selectedDocument, sortOrder]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredPackages.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    universalIngestionEngine.bulkUpdateStatus(selectedIds, 'APPROVE', 'Founder Admin');
    setSelectedIds([]);
    refreshPackages();
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    universalIngestionEngine.bulkUpdateStatus(selectedIds, 'REJECT', 'Founder Admin');
    setSelectedIds([]);
    refreshPackages();
  };

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    universalIngestionEngine.bulkUpdateStatus(selectedIds, 'ARCHIVE', 'Founder Admin');
    setSelectedIds([]);
    refreshPackages();
  };

  const handleSingleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    universalIngestionEngine.approvePackage(id, 'Founder Admin', 'Approved from Founder Inbox');
    refreshPackages();
  };

  const handleSingleReject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    universalIngestionEngine.rejectPackage(id, 'Founder Admin', 'Rejected from Founder Inbox');
    refreshPackages();
  };

  const handleSingleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    universalIngestionEngine.archivePackage(id, 'Founder Admin', 'Archived from Founder Inbox');
    refreshPackages();
  };

  // Distinct documents list for filter
  const availableDocuments = useMemo(() => {
    const map = new Map<string, string>();
    packages.forEach((p) => map.set(p.id, p.metadata.title || p.fileName));
    return Array.from(map.entries());
  }, [packages]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* HEADER BAR */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Founder Knowledge Inbox
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
                {filteredPackages.length} Packages Queue
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Unified extracted knowledge inbox for multi-domain verification and approval.
            </p>
          </div>
        </div>

        {/* BULK ACTIONS BAR */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {selectedIds.length} Selected
            </span>
            <div className="h-4 w-px bg-slate-800" />
            <button
              onClick={handleBulkApprove}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded flex items-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Bulk Approve
            </button>
            <button
              onClick={handleBulkReject}
              className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-500 text-slate-100 text-xs font-bold rounded flex items-center gap-1 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Bulk Reject
            </button>
            <button
              onClick={handleBulkArchive}
              className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded flex items-center gap-1 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" /> Bulk Archive
            </button>
          </div>
        )}
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs shrink-0">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search entity, document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 pl-8 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Domain Filter */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-2">
          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full bg-transparent py-1.5 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Domains</option>
            <option value="Vastu" className="bg-slate-900">Vastu</option>
            <option value="LalKitab" className="bg-slate-900">Lal Kitab</option>
            <option value="Numerology" className="bg-slate-900">Numerology</option>
            <option value="Chakra" className="bg-slate-900">Chakra</option>
            <option value="Astrology" className="bg-slate-900">Astrology</option>
            <option value="ResearchPaper" className="bg-slate-900">Research Paper</option>
            <option value="Book" className="bg-slate-900">Book</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-transparent py-1.5 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Statuses</option>
            <option value="PENDING" className="bg-slate-900">Pending</option>
            <option value="APPROVED" className="bg-slate-900">Approved</option>
            <option value="REJECTED" className="bg-slate-900">Rejected</option>
            <option value="DRAFT" className="bg-slate-900">Draft</option>
            <option value="ARCHIVED" className="bg-slate-900">Archived</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-2">
          <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full bg-transparent py-1.5 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Priorities</option>
            <option value="CRITICAL" className="bg-slate-900">Critical Priority</option>
            <option value="HIGH" className="bg-slate-900">High Priority</option>
            <option value="MEDIUM" className="bg-slate-900">Medium Priority</option>
            <option value="LOW" className="bg-slate-900">Low Priority</option>
          </select>
        </div>

        {/* Document Filter */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-2">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedDocument}
            onChange={(e) => setSelectedDocument(e.target.value)}
            className="w-full bg-transparent py-1.5 text-slate-200 focus:outline-none cursor-pointer truncate"
          >
            <option value="ALL" className="bg-slate-900">All Documents</option>
            {availableDocuments.map(([id, title]) => (
              <option key={id} value={id} className="bg-slate-900">
                {title}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <button
          onClick={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
          className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {sortOrder === 'NEWEST' ? 'Newest First' : 'Oldest First'}
          </span>
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
        </button>
      </div>

      {/* TABLE / QUEUE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-800 rounded-xl bg-slate-900/30 text-center p-6">
            <SlidersHorizontal className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No knowledge packages match your filters.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search parameters or uploading new documents.</p>
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredPackages.length > 0 &&
                        selectedIds.length === filteredPackages.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Document Title</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Entities / Rels</th>
                  <th className="p-3">Quality</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPackages.map((pkg) => {
                  const status = pkg.metadata.approvalStatus || 'PENDING';
                  const isSelected = selectedIds.includes(pkg.id);

                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-800 text-amber-300">
                      PENDING
                    </span>
                  );
                  if (status === 'APPROVED') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                        APPROVED
                      </span>
                    );
                  } else if (status === 'REJECTED') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 border border-rose-800 text-rose-300">
                        REJECTED
                      </span>
                    );
                  } else if (status === 'ARCHIVED') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-400">
                        ARCHIVED
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={pkg.id}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-800/60' : ''
                      }`}
                      onClick={() => onSelectPackageForReview(pkg.id)}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(pkg.id)}
                          className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 font-medium text-slate-200 max-w-xs truncate">
                        <div className="font-semibold text-slate-100 truncate">
                          {pkg.metadata.title || pkg.fileName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          {pkg.fileName} • {new Date(pkg.uploadedAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400 text-[11px]">
                          {pkg.metadata.domain}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">
                          {pkg.entities.length}
                        </span>{' '}
                        Entities /{' '}
                        <span className="text-cyan-400 font-bold">
                          {pkg.relationships.length}
                        </span>{' '}
                        Rels
                      </td>

                      <td className="p-3">
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {pkg.quality.overallQualityScore}%
                        </span>{' '}
                        <span className="text-[10px] text-slate-500 font-bold">
                          ({pkg.quality.qualityGrade})
                        </span>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        <span
                          className={`font-bold ${
                            pkg.evidence.knowledgePriority === 'CRITICAL'
                              ? 'text-rose-400'
                              : pkg.evidence.knowledgePriority === 'HIGH'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {pkg.evidence.knowledgePriority || 'MEDIUM'}
                        </span>
                      </td>

                      <td className="p-3">{statusBadge}</td>

                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPackageForReview(pkg.id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded font-bold transition-colors"
                          >
                            Review & Edit
                          </button>

                          {onSelectPackageForMergeSplit && (
                            <button
                              onClick={() => onSelectPackageForMergeSplit(pkg.id)}
                              className="px-2 py-1 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 text-[11px] rounded font-bold transition-colors"
                            >
                              Merge/Split
                            </button>
                          )}

                          {status !== 'APPROVED' && (
                            <button
                              onClick={(e) => handleSingleApprove(pkg.id, e)}
                              title="Approve Package"
                              className="p-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {status !== 'REJECTED' && (
                            <button
                              onClick={(e) => handleSingleReject(pkg.id, e)}
                              title="Reject Package"
                              className="p-1 bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 rounded transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {status !== 'ARCHIVED' && (
                            <button
                              onClick={(e) => handleSingleArchive(pkg.id, e)}
                              title="Archive Package"
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded transition-colors"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
