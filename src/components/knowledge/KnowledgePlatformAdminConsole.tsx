// Module 15: Knowledge Platform Admin Console
import React, { useState } from "react";
import {
  Database,
  Layers,
  GitBranch,
  ShieldCheck,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Tag,
  Search,
  ExternalLink,
  Cpu,
  FileText,
  Sliders,
  History,
  Info
} from "lucide-react";
import { KnowledgeDocument, IngestionJob, GovernanceAuditLog, CitationFeedback, AutoSyncSourceConfig } from "../../types/knowledgeIntelligence";
import { KnowledgeLibraryService } from "../../core/knowledge/KnowledgeLibraryService";
import { DocumentIngestionPipeline } from "../../core/knowledge/DocumentIngestionPipeline";
import { VectorEmbeddingEngine } from "../../core/knowledge/VectorEmbeddingEngine";
import { KnowledgeGraphEngine } from "../../core/knowledge/KnowledgeGraphEngine";
import { KnowledgeGovernanceService } from "../../core/knowledge/KnowledgeGovernanceService";
import { KnowledgeFeedbackService } from "../../core/knowledge/KnowledgeFeedbackService";
import { KnowledgePackService } from "../../core/knowledge/KnowledgePackService";
import { KnowledgeAnalyticsService } from "../../core/knowledge/KnowledgeAnalyticsService";
import { KnowledgeAutoSyncService } from "../../core/knowledge/KnowledgeAutoSyncService";

interface KnowledgePlatformAdminConsoleProps {
  tenantId?: string;
}

export const KnowledgePlatformAdminConsole: React.FC<KnowledgePlatformAdminConsoleProps> = ({
  tenantId = "tenant_org_01"
}) => {
  const [activeTab, setActiveTab] = useState<
    "LIBRARY" | "INGESTION" | "VECTORS" | "GRAPH" | "GOVERNANCE" | "FEEDBACK" | "PACKS" | "AUTOSYNC" | "ANALYTICS"
  >("LIBRARY");

  // State handles
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(() =>
    KnowledgeLibraryService.getDocuments(tenantId)
  );
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(documents[0] || null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("Vastu Shastra");
  const [newContent, setNewContent] = useState<string>("");

  // Ingestion jobs state
  const [ingestionJobs, setIngestionJobs] = useState<IngestionJob[]>(() =>
    DocumentIngestionPipeline.getJobs(tenantId)
  );

  // Audit logs state
  const [auditLogs] = useState<GovernanceAuditLog[]>(() =>
    KnowledgeGovernanceService.getAuditLogs(tenantId)
  );

  // Feedback queue state
  const [feedbackList, setFeedbackList] = useState<CitationFeedback[]>(() =>
    KnowledgeFeedbackService.getFeedbackQueue(tenantId)
  );

  // Auto sync state
  const [syncConfigs, setSyncConfigs] = useState<AutoSyncSourceConfig[]>(() =>
    KnowledgeAutoSyncService.getSyncConfigs(tenantId)
  );

  // Pack Import JSON state
  const [importJsonText, setImportJsonText] = useState<string>("");
  const [importResult, setImportResult] = useState<string | null>(null);

  const refreshDocuments = () => {
    const list = KnowledgeLibraryService.getDocuments(tenantId);
    setDocuments(list);
    if (list.length > 0 && !selectedDoc) setSelectedDoc(list[0]);
  };

  const handleCreateDocument = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const doc = KnowledgeLibraryService.createDocument(
      newTitle,
      newContent,
      {
        category: newCategory,
        tags: ["Custom", "Enterprise"],
        accessLevel: "CONFIDENTIAL"
      },
      tenantId,
      "Admin User"
    );

    // Ingest into vector engine
    const { chunks } = DocumentIngestionPipeline.processIngestion(
      doc.id,
      doc.title,
      doc.content,
      tenantId,
      "MARKDOWN"
    );
    VectorEmbeddingEngine.indexAllChunks(chunks);

    KnowledgeGovernanceService.logAction(
      tenantId,
      "USR-ADMIN",
      "TENANT_ADMIN",
      "CREATE",
      "DOCUMENT",
      doc.id,
      `Created custom document ${doc.title}`
    );

    setNewTitle("");
    setNewContent("");
    setShowCreateModal(false);
    refreshDocuments();
  };

  const handleRollback = (docId: string, verId: string) => {
    const updated = KnowledgeLibraryService.rollbackVersion(docId, tenantId, verId, "Admin User");
    if (updated) {
      setSelectedDoc(updated);
      refreshDocuments();
      KnowledgeGovernanceService.logAction(
        tenantId,
        "USR-ADMIN",
        "TENANT_ADMIN",
        "UPDATE",
        "DOCUMENT",
        docId,
        `Rollback document to version snapshot ${verId}`
      );
    }
  };

  const handleExportPack = () => {
    const pack = KnowledgePackService.exportKnowledgePack(
      "Enterprise Master Knowledge Pack",
      "Full export of corporate and canonical Vastu Shastra rules",
      tenantId
    );
    const jsonStr = JSON.stringify(pack, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `URJAFLUX_Knowledge_Pack_${tenantId}.json`;
    a.click();
  };

  const handleImportPack = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const validation = KnowledgePackService.validatePackSchema(parsed);
      if (!validation.valid) {
        setImportResult(`Import failed: ${validation.errors.join(", ")}`);
        return;
      }
      const res = KnowledgePackService.importKnowledgePack(parsed, tenantId, "CREATE_NEW_VERSION");
      setImportResult(`Successfully imported ${res.importedDocsCount} documents and ${res.importedNodesCount} graph nodes!`);
      refreshDocuments();
    } catch (e) {
      setImportResult(`Invalid JSON file format: ${(e as Error).message}`);
    }
  };

  const analytics = KnowledgeAnalyticsService.getAnalyticsOverview(tenantId);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Module 1 - 15 Platform Management
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              Enterprise Governance Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Knowledge Intelligence Platform Admin Console
          </h1>
          <p className="text-sm text-slate-300">
            Control repository ingestion, document versioning, vector indexes, knowledge graph nodes, compliance audit trails, and auto-sync webhooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPack}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            <Download className="w-4 h-4" /> Export Knowledge Pack
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Document
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-medium">
        {[
          { id: "LIBRARY", label: "Knowledge Library & Versions", icon: BookOpen },
          { id: "INGESTION", label: "Ingestion & OCR", icon: FileText },
          { id: "VECTORS", label: "Vector Index", icon: Layers },
          { id: "GRAPH", label: "Knowledge Graph", icon: GitBranch },
          { id: "GOVERNANCE", label: "Governance Audit", icon: ShieldCheck },
          { id: "FEEDBACK", label: "RLHF Queue", icon: Activity },
          { id: "PACKS", label: "Knowledge Packs", icon: Upload },
          { id: "AUTOSYNC", label: "Auto-Sync Webhooks", icon: RefreshCw },
          { id: "ANALYTICS", label: "Analytics & Gaps", icon: Cpu }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white font-semibold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {/* Tab 1: Knowledge Library & Versions */}
        {activeTab === "LIBRARY" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3 lg:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Documents ({documents.length})
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedDoc?.id === doc.id
                        ? "bg-indigo-50/80 border-indigo-400 shadow-sm"
                        : "bg-white border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 truncate">{doc.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {doc.currentVersion}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{doc.summary}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Category: {doc.metadata.category}</span>
                      <span>Versions: {doc.versions.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedDoc && (
              <div className="lg:col-span-2 space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selectedDoc.title}</h2>
                      <p className="text-xs text-slate-500">ID: {selectedDoc.id} | Tenant: {selectedDoc.tenantId}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {selectedDoc.status}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedDoc.content}
                  </div>
                </div>

                {/* Version History Audit & Rollback */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600" /> Version History & Snapshot Rollback
                  </h3>
                  <div className="space-y-2">
                    {selectedDoc.versions.map((ver) => (
                      <div key={ver.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded text-[11px] mr-2">
                            v{ver.versionNumber}
                          </span>
                          <span className="text-slate-700">{ver.changeSummary}</span>
                          <span className="text-slate-400 text-[11px] block mt-0.5">By {ver.author} on {new Date(ver.timestamp).toLocaleString()}</span>
                        </div>
                        {ver.versionNumber !== selectedDoc.currentVersion && (
                          <button
                            onClick={() => handleRollback(selectedDoc.id, ver.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Rollback
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Ingestion & OCR */}
        {activeTab === "INGESTION" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Document Ingestion Pipeline & PII Redaction Queue
            </h3>
            <div className="space-y-3">
              {ingestionJobs.map(job => (
                <div key={job.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{job.documentTitle}</span>
                    <span className="text-slate-500 block">Source: {job.sourceType} | Job ID: {job.id}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-semibold">
                      PII Masked: {job.piiRedactedCount}
                    </span>
                    <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 font-semibold">
                      Chunks: {job.extractedChunksCount}
                    </span>
                    <span className="font-bold text-emerald-600 uppercase">{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Vector Index */}
        {activeTab === "VECTORS" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Vector Embedding & Hybrid Index Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Total Indexed Chunks</span>
                <span className="text-2xl font-bold text-indigo-900 block">{analytics.totalChunks}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Dense Vector Dimensions</span>
                <span className="text-2xl font-bold text-indigo-900 block">32 Dimensions</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Hybrid Search Algorithm</span>
                <span className="text-2xl font-bold text-emerald-800 block">BM25 + RRF (k=60)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Knowledge Graph */}
        {activeTab === "GRAPH" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-600" /> Knowledge Graph Ontology & Triplet Registry
            </h3>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
              <div className="text-slate-400 flex justify-between pb-2 border-b border-slate-800">
                <span>Total Nodes: {analytics.totalGraphNodes}</span>
                <span>Total Edges: {analytics.totalGraphEdges}</span>
              </div>
              <p className="text-emerald-400">Ontology structure loaded and synchronized across tenant partition [{tenantId}].</p>
            </div>
          </div>
        )}

        {/* Tab 5: Governance & Audit */}
        {activeTab === "GOVERNANCE" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Compliance Audit Trail Logs
            </h3>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-indigo-900 mr-2">[{log.action}]</span>
                    <span className="text-slate-800">{log.details}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">User: {log.userId} ({log.userRole}) at {new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                    PII Masked
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: RLHF Queue */}
        {activeTab === "FEEDBACK" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> RLHF Feedback & Citation Accuracy Queue
            </h3>
            <div className="space-y-2">
              {feedbackList.map((fb) => (
                <div key={fb.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Query: "{fb.query}"</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${fb.rating === "POSITIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {fb.rating} ({fb.feedbackType})
                    </span>
                  </div>
                  <p className="text-slate-500">Submitted by: {fb.userId} | Status: {fb.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Knowledge Packs */}
        {activeTab === "PACKS" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" /> Import Knowledge Pack JSON
              </h3>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste Knowledge Pack JSON content here..."
                className="w-full h-32 p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none"
              />
              <button
                onClick={handleImportPack}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md"
              >
                Validate & Import Pack
              </button>
              {importResult && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                  {importResult}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 8: Auto-Sync Webhooks */}
        {activeTab === "AUTOSYNC" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-600" /> Auto-Sync Webhook Triggers
            </h3>
            <div className="space-y-3">
              {syncConfigs.map((cfg) => (
                <div key={cfg.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{cfg.sourceName}</span>
                    <span className="text-slate-500">Type: {cfg.type} | Frequency: Every {cfg.syncFrequencyMinutes} mins</span>
                    <span className="text-slate-400 block mt-0.5">Endpoint: {cfg.endpointUrl}</span>
                  </div>
                  <button
                    onClick={() => {
                      KnowledgeAutoSyncService.triggerManualSync(cfg.id);
                      setSyncConfigs(KnowledgeAutoSyncService.getSyncConfigs(tenantId));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm"
                  >
                    Sync Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 9: Analytics & Gaps */}
        {activeTab === "ANALYTICS" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase">Knowledge Gap Detection</h4>
                <div className="space-y-2">
                  {analytics.knowledgeGapsDetected.map((gap, i) => (
                    <div key={i} className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
                      <span className="font-bold block">{gap.queryTopic} ({gap.queryCount} queries)</span>
                      <span>Recommendation: {gap.recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase">Top Referenced Sources</h4>
                <div className="space-y-2">
                  {analytics.topReferencedSources.map((src, i) => (
                    <div key={i} className="p-2.5 rounded bg-white border border-slate-200 flex justify-between items-center">
                      <span className="font-medium text-slate-800">{src.documentTitle}</span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{src.citationCount} citations</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Canonical Document to Knowledge Repository</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Vastu Guidelines for Data Centers"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                >
                  <option value="Vastu Shastra">Vastu Shastra</option>
                  <option value="Corporate Vastu">Corporate Vastu</option>
                  <option value="Ayadi Numerology">Ayadi Numerology</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Markdown / Plaintext Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Rule: Structural alignment must strictly coordinate with cardinal poles..."
                  className="w-full h-40 p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
              >
                Ingest Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
