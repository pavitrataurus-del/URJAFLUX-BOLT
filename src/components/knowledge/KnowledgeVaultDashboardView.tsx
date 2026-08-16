import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  FileText, 
  Award,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  History,
  HardDrive,
  Eye,
  X,
  Check,
  Edit3,
  Layers,
  Filter
} from "lucide-react";
import { 
  KnowledgeVaultService, 
  VaultDocument, 
  VaultRule, 
  VaultCategory, 
  VaultStats,
  RuleApprovalStatus,
  DeletionAuditLog 
} from "../../services/knowledgeVaultService";
import { KnowledgeUploadPipelineService } from "../../services/knowledgeUploadPipelineService";
import { readFileArrayBuffer } from "../../services/docxTextExtractionService";

import { KnowledgeUploadCenter } from "./KnowledgeUploadCenter";
import { MultimodalIntelligenceView } from "./MultimodalIntelligenceView";
import { KnowledgeVaultWelcomePanel } from "./KnowledgeVaultWelcomePanel";
import { VaultStatCard, VaultTabButton } from "./KnowledgeVaultUi";
import { LayoutDashboard } from "lucide-react";

interface KnowledgeVaultDashboardViewProps {
  onOpenWizard?: () => void;
}

export const KnowledgeVaultDashboardView: React.FC<KnowledgeVaultDashboardViewProps> = () => {
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "UPLOAD_PIPELINE" | "DOCUMENTS" | "RULES_EXPLORER" | "BACKUP_RESTORE" | "MULTIMODAL_EMKIE"
  >("OVERVIEW");
  
  // State
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [rules, setRules] = useState<VaultRule[]>([]);
  const [categories, setCategories] = useState<VaultCategory[]>([]);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [approvalFilter, setApprovalFilter] = useState<string>("ALL");
  const [documentFilter, setDocumentFilter] = useState<string>("All");
  const [rulesPage, setRulesPage] = useState(1);
  const RULES_PAGE_SIZE = 50;
  
  // Modals & UI States
  const [activeRuleModal, setActiveRuleModal] = useState<VaultRule | null>(null);
  const [editingRule, setEditingRule] = useState<Partial<VaultRule> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  // Document Management & Deletion Workflow States
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<VaultDocument | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<DeletionAuditLog[]>([]);

  const [detailsModalDoc, setDetailsModalDoc] = useState<VaultDocument | null>(null);
  const [rawTextModalDoc, setRawTextModalDoc] = useState<VaultDocument | null>(null);
  const [reprocessingDocId, setReprocessingDocId] = useState<string | null>(null);
  const [reprocessStatus, setReprocessStatus] = useState<string>("");
  const [refreshingRulesDocId, setRefreshingRulesDocId] = useState<string | null>(null);

  useEffect(() => {
    refreshVaultData();
  }, []);

  useEffect(() => {
    setRulesPage(1);
  }, [searchQuery, selectedCategory, approvalFilter, documentFilter]);

  const refreshVaultData = async () => {
    await KnowledgeVaultService.refreshFromCloud();
    const currentStats = await KnowledgeVaultService.getVaultStats();
    setStats(currentStats);
    setDocuments(
      KnowledgeVaultService.getAllDocuments().sort(
        (a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
      )
    );
    setRules(KnowledgeVaultService.getAllRules());
    setCategories(KnowledgeVaultService.getAllCategories());
    setAuditLogs(KnowledgeVaultService.getDeletionAuditLogs());
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDeleteDocument = async (doc: VaultDocument) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await KnowledgeVaultService.deleteDocument(doc.id, "Vastu Expert Admin");
      if (result.success) {
        setDeleteConfirmDoc(null);
        setDeleteNotification("Document deleted successfully.");
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
        await refreshVaultData();
        setTimeout(() => setDeleteNotification(null), 4000);
      } else {
        setDeleteError(result.errorMessage || "Deletion failed.");
      }
    } catch (err: any) {
      console.error("Failed to delete document:", err);
      setDeleteError(err?.message || String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllDocuments = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await KnowledgeVaultService.deleteAllDocuments("Vastu Expert Admin");
      if (result.success) {
        setShowDeleteAllConfirm(false);
        setDeleteNotification("Document deleted successfully.");
        setDocuments([]);
        await refreshVaultData();
        setTimeout(() => setDeleteNotification(null), 4000);
      } else {
        setDeleteError(result.errorMessage || "Bulk deletion failed.");
      }
    } catch (err: any) {
      console.error("Failed to delete all documents:", err);
      setDeleteError(err?.message || String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReprocessDocument = async (docId: string) => {
    setReprocessingDocId(docId);
    setReprocessStatus("Initiating full ingestion pipeline reprocess...");
    try {
      await KnowledgeVaultService.reprocessDocument(docId, (progress) => {
        if (progress?.statusMessage) setReprocessStatus(progress.statusMessage);
      });
      await refreshVaultData();
    } catch (err: any) {
      alert(`Reprocessing failed: ${err?.message || "Unknown error"}`);
    } finally {
      setReprocessingDocId(null);
      setReprocessStatus("");
    }
  };

  const handleRefreshRulesFromChunks = async (docId: string) => {
    setRefreshingRulesDocId(docId);
    try {
      const before = KnowledgeVaultService.getAllRules().filter((r) => r.documentId === docId).length;
      const count = await KnowledgeVaultService.reextractRulesFromStoredChunks(docId);
      await refreshVaultData();
      if (count > before) {
        setDeleteNotification(`Refreshed rules for book: ${before} → ${count} (+${count - before}).`);
      } else if (count < before) {
        setDeleteNotification(
          `Rules unchanged at ${count} — refresh would drop ${before} → ${count} (skipped). Re-upload the document once to rebuild page text archive.`
        );
      } else {
        const doc = KnowledgeVaultService.getDocumentById(docId);
        const pages = doc?.ocrPagesWithText ?? "?";
        const total = doc?.totalPages ?? "?";
        setDeleteNotification(
          count <= 30 && Number(pages) < Number(total) * 0.5
            ? `Rules unchanged at ${count} — only ${pages}/${total} pages in stored text. Re-upload the book once (new fix saves full page archive), then Refresh Rules again.`
            : `Rules unchanged at ${count} — all rules already extracted from stored OCR text (${pages}/${total} pages).`
        );
      }
    } catch (err: any) {
      alert(`Rule refresh failed: ${err?.message || "Unknown error"}`);
    } finally {
      setRefreshingRulesDocId(null);
    }
  };

  const handleRefreshAllRulesFromChunks = async () => {
    if (documents.length === 0) return;
    const ok = window.confirm(
      "Refresh rules from stored OCR text for all books?\n\nBooks with little OCR text may keep fewer rules. Mayamatam should stay ~401; Viswakarm needs re-upload after quota reset."
    );
    if (!ok) return;
    setRefreshingRulesDocId("__all__");
    try {
      let total = 0;
      let increased = 0;
      for (const doc of documents) {
        const before = KnowledgeVaultService.getAllRules().filter((r) => r.documentId === doc.id).length;
        const count = await KnowledgeVaultService.reextractRulesFromStoredChunks(doc.id);
        total += count;
        if (count > before) increased += count - before;
      }
      await refreshVaultData();
      setDeleteNotification(
        increased > 0
          ? `Refreshed ${documents.length} book(s) — vault total ${total} rules (+${increased} net).`
          : `Refreshed ${documents.length} book(s) — ${total} rules total (no net increase; OCR text is the limit).`
      );
    } catch (err: any) {
      alert(`Rule refresh failed: ${err?.message || "Unknown error"}`);
    } finally {
      setRefreshingRulesDocId(null);
    }
  };

  // Upload Document Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = input.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    setUploadProgress(`Initiating pipeline for ${file.name}...`);

    try {
      const isTextType = file.type.includes("text") || 
        file.name.endsWith(".txt") || 
        file.name.endsWith(".md") || 
        file.name.endsWith(".json") || 
        file.name.endsWith(".csv");

      let textContent = "";
      let rawBuffer: ArrayBuffer | undefined;
      if (isTextType) {
        textContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve((evt.target?.result as string) || "");
          reader.onerror = reject;
          reader.readAsText(file);
        });
      } else {
        rawBuffer = await readFileArrayBuffer(file);
      }

      await KnowledgeUploadPipelineService.runPipeline(
        {
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          dataUrlOrText: textContent,
          rawBuffer,
          fileObj: file
        },
        (progress) => {
          setUploadProgress(progress.statusMessage || `Processing... ${progress.progressPercent ?? 0}%`);
        },
        selectedCategory !== "All" ? selectedCategory : "Vastu Shastra"
      );

      setUploadProgress("Ingestion complete! Document active in Knowledge Brain.");
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress("");
        refreshVaultData();
        setActiveTab("DOCUMENTS");
      }, 1200);
    } catch (err: any) {
      console.error("Upload error:", err);
      setIsUploading(false);
      setUploadProgress(`Upload failed: ${err?.message || "Unknown error"}`);
    } finally {
      input.value = "";
    }
  };

  // Rule edit actions
  const handleSaveEditRule = async () => {
    if (!activeRuleModal || !editingRule) return;
    await KnowledgeVaultService.editAndApproveRule(activeRuleModal.id, editingRule, "Vastu Expert Admin");
    setActiveRuleModal(null);
    setEditingRule(null);
    await refreshVaultData();
  };

  // Backup & Restore Actions
  const handleExportVault = async () => {
    const jsonStr = await KnowledgeVaultService.exportVaultJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `URJAFLUX-KNOWLEDGE-VAULT-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setBackupStatus("Vault exported successfully as JSON!");
  };

  const handleImportVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = evt.target?.result as string;
        const res = await KnowledgeVaultService.importVaultJson(json);
        setBackupStatus(`Successfully restored ${res.restoredDocs} documents & ${res.restoredRules} rules!`);
        await refreshVaultData();
      } catch (err) {
        alert("Failed to import backup JSON. Check file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleCreateAutoSnapshot = async () => {
    const snap = await KnowledgeVaultService.createAutomaticBackup();
    setBackupStatus(`Auto snapshot created: ${snap.backupName}`);
    await refreshVaultData();
  };

  // Filtered lists
  const filteredRules = rules.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.recommendation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || r.category === selectedCategory;
    const matchesStatus = approvalFilter === "ALL" || r.approvalStatus === approvalFilter;
    const matchesDoc = documentFilter === "All" || r.documentId === documentFilter;
    return matchesSearch && matchesCat && matchesStatus && matchesDoc;
  });

  const rulesPageCount = Math.max(1, Math.ceil(filteredRules.length / RULES_PAGE_SIZE));
  const paginatedRules = filteredRules.slice(
    (rulesPage - 1) * RULES_PAGE_SIZE,
    rulesPage * RULES_PAGE_SIZE
  );

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Stats — compact row under welcome on overview, always visible on other tabs */}
      {activeTab !== "OVERVIEW" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <VaultStatCard
            label="Books"
            value={stats?.totalDocuments || 0}
            hint="Firestore mein saved"
            icon={BookOpen}
            accent="emerald"
          />
          <VaultStatCard
            label="Rules"
            value={stats?.approvedRules || rules.length}
            hint="Analysis ke liye ready"
            icon={ShieldCheck}
            accent="violet"
          />
          <VaultStatCard
            label="Storage"
            value={`${(((stats?.storageUsageBytes || 1024) / 1024 / 1024)).toFixed(1)} MB`}
            hint="Documents + indexed data"
            icon={HardDrive}
            accent="blue"
          />
          <VaultStatCard
            label="Status"
            value="Online"
            hint="Cloud synced"
            icon={Award}
            accent="emerald"
          />
        </div>
      )}

      {/* Tab navigation — pill bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 overflow-x-auto">
        <VaultTabButton
          active={activeTab === "OVERVIEW"}
          onClick={() => setActiveTab("OVERVIEW")}
          icon={LayoutDashboard}
          label="Home"
        />
        <VaultTabButton
          active={activeTab === "UPLOAD_PIPELINE"}
          onClick={() => setActiveTab("UPLOAD_PIPELINE")}
          icon={Upload}
          label="Upload"
        />
        <VaultTabButton
          active={activeTab === "RULES_EXPLORER"}
          onClick={() => setActiveTab("RULES_EXPLORER")}
          icon={ShieldCheck}
          label="Rules"
          count={rules.length}
        />
        <VaultTabButton
          active={activeTab === "DOCUMENTS"}
          onClick={() => setActiveTab("DOCUMENTS")}
          icon={BookOpen}
          label="Books"
          count={documents.length}
        />
        <VaultTabButton
          active={activeTab === "MULTIMODAL_EMKIE"}
          onClick={() => setActiveTab("MULTIMODAL_EMKIE")}
          icon={Layers}
          label="Multimodal"
        />
        <VaultTabButton
          active={activeTab === "BACKUP_RESTORE"}
          onClick={() => setActiveTab("BACKUP_RESTORE")}
          icon={HardDrive}
          label="Backup"
        />
      </div>

      {/* Tab content panel */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm min-h-[320px]">
        {activeTab === "OVERVIEW" && (
          <div className="p-4 sm:p-6 space-y-6">
            <KnowledgeVaultWelcomePanel
              stats={stats}
              onNavigate={(tab) => setActiveTab(tab)}
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <VaultStatCard
                label="Books"
                value={stats?.totalDocuments || 0}
                hint="Firestore mein saved"
                icon={BookOpen}
                accent="emerald"
              />
              <VaultStatCard
                label="Rules"
                value={stats?.approvedRules || rules.length}
                hint="Analysis ke liye ready"
                icon={ShieldCheck}
                accent="violet"
              />
              <VaultStatCard
                label="Storage"
                value={`${(((stats?.storageUsageBytes || 1024) / 1024 / 1024)).toFixed(1)} MB`}
                hint="Documents + indexed data"
                icon={HardDrive}
                accent="blue"
              />
              <VaultStatCard
                label="Status"
                value="Online"
                hint="Cloud synced"
                icon={Award}
                accent="emerald"
              />
            </div>
          </div>
        )}

        {activeTab === "UPLOAD_PIPELINE" && (
          <div className="p-4 sm:p-6">
            <KnowledgeUploadCenter onUploadSuccess={refreshVaultData} />
          </div>
        )}

        {activeTab === "RULES_EXPLORER" && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Rule refresh toolbar — re-extract from stored OCR chunks without re-upload */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-xs font-mono text-amber-950 space-y-1">
              <p className="font-bold">Refresh extracted rules (no OCR / no re-upload)</p>
              <p className="text-amber-800/80">
                Rebuilds rules from text already saved in Firestore chunks — use after cap changes or OCR fixes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => refreshVaultData()}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5"
                title="Reload rule counts from Firestore"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Dashboard
              </button>
              <button
                onClick={() => handleRefreshAllRulesFromChunks()}
                disabled={documents.length === 0 || refreshingRulesDocId !== null}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingRulesDocId === "__all__" ? "animate-spin" : ""}`} />
                Refresh All Books
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search rule ID, condition, category, or remedy..."
                className="w-full bg-slate-50 border border-slate-200 text-xs font-mono rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-mono rounded-lg px-3 py-2 text-slate-700"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={approvalFilter}
                onChange={e => setApprovalFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-mono rounded-lg px-3 py-2 text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">APPROVED ONLY</option>
                <option value="PENDING">PENDING ONLY</option>
                <option value="REJECTED">REJECTED ONLY</option>
              </select>

              <select
                value={documentFilter}
                onChange={e => setDocumentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-mono rounded-lg px-3 py-2 text-slate-700 max-w-[220px]"
              >
                <option value="All">All Books</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 px-1">
            <span>
              Showing {filteredRules.length === 0 ? 0 : (rulesPage - 1) * RULES_PAGE_SIZE + 1}–
              {Math.min(rulesPage * RULES_PAGE_SIZE, filteredRules.length)} of {filteredRules.length} rules
            </span>
            {rulesPageCount > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={rulesPage <= 1}
                  onClick={() => setRulesPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40"
                >
                  Previous
                </button>
                <span>Page {rulesPage} / {rulesPageCount}</span>
                <button
                  type="button"
                  disabled={rulesPage >= rulesPageCount}
                  onClick={() => setRulesPage((p) => Math.min(rulesPageCount, p + 1))}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {paginatedRules.map(rule => (
              <div key={rule.id} className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{rule.id}</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{rule.category}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{rule.documentTitle}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.approvalStatus === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                      rule.approvalStatus === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                    }`}>
                      {rule.approvalStatus}
                    </span>
                    <span className="text-slate-400 text-[10px]">Rev {rule.version}</span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900">{rule.condition}</p>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <strong className="text-slate-700">Remedy Action: </strong>{rule.recommendation}
                </p>

                {rule.evidence?.sourceBook && (
                  <div className="text-[11px] text-slate-400 font-mono pt-1">
                    Internal Source: {rule.evidence.sourceBook} {rule.evidence.chapter ? `• ${rule.evidence.chapter}` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredRules.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-mono text-xs">
              No rules match your filters.
            </div>
          )}
        </div>
        )}

        {activeTab === "DOCUMENTS" && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs font-mono text-amber-900">
            <span className="font-bold">Refresh Rules: </span>
            Each book card below has an amber <strong>Refresh Rules</strong> button — re-extracts rules from stored text without re-uploading the file.
          </div>
          {/* Notification Toast */}
          {deleteNotification && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in font-mono text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold">{deleteNotification}</span>
              </div>
              <button onClick={() => setDeleteNotification(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {reprocessingDocId && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3 text-blue-900 text-xs font-mono">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              <div>
                <span className="font-bold">Reprocessing Document Pipeline: </span>
                <span>{reprocessStatus}</span>
              </div>
            </div>
          )}

          {/* Action Header & Bulk Controls */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800 text-xs font-mono">
                Knowledge Base ({documents.length} {documents.length === 1 ? 'Document' : 'Documents'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAuditLogsModal(true)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-sm transition-all"
                title="View Deletion Audit Log History"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span>Deletion Logs ({auditLogs.length})</span>
              </button>

              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                disabled={documents.length === 0}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40"
                title="Permanently wipe ALL documents and knowledge artifacts"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Delete All Documents</span>
              </button>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 p-12 rounded-2xl text-center space-y-3 font-mono">
              <Database className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Documents in Knowledge Vault</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All uploaded documents, embeddings, knowledge graph nodes, and search indexes have been cleared. Upload new PDF, Word, or text files using the Ingestion Pipeline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm hover:border-emerald-300 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">{doc.category}</span>
                      <h3 className="font-bold text-slate-900 text-sm font-mono">{doc.title}</h3>
                      <p className="text-xs text-slate-500">Author: {doc.author} • Format: {doc.fileType.toUpperCase()}</p>
                    </div>
                    <span className="bg-slate-900 text-emerald-400 font-mono text-[10px] px-2.5 py-1 rounded-md font-bold shrink-0">
                      {doc.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <p className="text-xs text-slate-600 line-clamp-3 font-mono leading-relaxed">
                      {doc.rawTextContent || doc.ocrText || "Text content stored permanently."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 pt-1">
                    <span>Extracted Rules: {doc.extractedRulesCount} ({doc.approvedRulesCount} Approved)</span>
                    <span>OCR Confidence: {doc.ocrConfidence}%</span>
                  </div>
                  {(doc.ocrPagesWithText != null || doc.visionOcrPagesAttempted != null) && (
                    <div className="text-[10px] font-mono text-slate-500">
                      Text coverage: {doc.ocrPagesWithText ?? "?"} / {doc.totalPages} pages
                      {doc.visionOcrPagesAttempted ? ` • Vision OCR attempted: ${doc.visionOcrPagesAttempted}` : ""}
                    </div>
                  )}

                  {/* Management Action Bar */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setDetailsModalDoc(doc)}
                      className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs flex items-center gap-1 transition-all"
                      title="View Document Details & Hierarchy"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => setRawTextModalDoc(doc)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs flex items-center gap-1 transition-all"
                      title="View Page-by-Page Raw Content"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Content</span>
                    </button>

                    <button
                      onClick={() => handleRefreshRulesFromChunks(doc.id)}
                      disabled={refreshingRulesDocId === doc.id || reprocessingDocId === doc.id}
                      className="px-2 py-1.5 text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                      title="Re-extract rules from stored chunks (no OCR, dynamic cap by page coverage)"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshingRulesDocId === doc.id ? "animate-spin" : ""}`} />
                      <span>Refresh Rules</span>
                    </button>

                    <button
                      onClick={() => handleReprocessDocument(doc.id)}
                      disabled={reprocessingDocId === doc.id}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs flex items-center gap-1 transition-all disabled:opacity-50"
                      title="Reprocess Document through Ingestion Pipeline"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${reprocessingDocId === doc.id ? 'animate-spin text-indigo-600' : ''}`} />
                      <span>Reprocess</span>
                    </button>

                    <button
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteConfirmDoc(doc);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs flex items-center gap-1 transition-all"
                      title="Permanently Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {activeTab === "MULTIMODAL_EMKIE" && (
          <div className="p-4 sm:p-6">
            <MultimodalIntelligenceView />
          </div>
        )}

        {activeTab === "BACKUP_RESTORE" && (
          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Backup & Restore</h3>
              <p className="text-sm text-slate-500 mt-1">
                Puri vault JSON mein export karein ya purani backup se restore karein — books aur rules safe rahenge.
              </p>
            </div>

            {backupStatus && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-sm">
                {backupStatus}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                <Download className="w-6 h-6 text-emerald-600" />
                <h4 className="font-semibold text-sm text-slate-800">Export vault</h4>
                <p className="text-xs text-slate-500">Saari books, rules aur categories ek JSON file mein download karein.</p>
                <button
                  onClick={handleExportVault}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                <Upload className="w-6 h-6 text-blue-600" />
                <h4 className="font-semibold text-sm text-slate-800">Restore backup</h4>
                <p className="text-xs text-slate-500">Pehle export ki hui JSON file upload karke vault wapas laayein.</p>
                <label className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Import JSON
                  <input type="file" accept=".json" onChange={handleImportVault} className="hidden" />
                </label>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                <RotateCcw className="w-6 h-6 text-amber-600" />
                <h4 className="font-semibold text-sm text-slate-800">Cloud snapshot</h4>
                <p className="text-xs text-slate-500">Abhi ka snapshot Firestore mein save ho jayega.</p>
                <button
                  onClick={handleCreateAutoSnapshot}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Snapshot banao
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteConfirmDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="bg-red-100 p-2.5 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-mono">
                Are you sure you want to permanently delete this document?
              </h3>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-mono text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">Document Name:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]" title={deleteConfirmDoc.title}>
                  {deleteConfirmDoc.title}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">Upload Date:</span>
                <span className="font-medium text-slate-800">
                  {deleteConfirmDoc.uploadedAt ? new Date(deleteConfirmDoc.uploadedAt).toLocaleString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">Size:</span>
                <span className="font-medium text-slate-800">
                  {formatBytes(deleteConfirmDoc.sizeBytes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Page Count:</span>
                <span className="font-medium text-slate-800">
                  {deleteConfirmDoc.totalPages || 1} {deleteConfirmDoc.totalPages === 1 ? "page" : "pages"}
                </span>
              </div>
            </div>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs font-mono space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Deletion Error:</span>
                </div>
                <p className="whitespace-pre-wrap break-words">{deleteError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirmDoc(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-mono text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDocument(deleteConfirmDoc)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-mono bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ALL DOCUMENTS MODAL */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-red-200 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="bg-red-100 p-2.5 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-mono">
                Delete All Knowledge Documents?
              </h3>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-900 text-xs font-mono space-y-2">
              <strong className="block text-red-700 text-sm font-bold">CRITICAL WARNING:</strong>
              <p className="leading-relaxed">
                This action will permanently delete ALL uploaded knowledge and cannot be undone.
              </p>
              <p className="text-[11px] text-red-800">
                All raw documents, vector embeddings, knowledge graph nodes/edges, search indexes, and OCR tables will be erased across cloud and local storage.
              </p>
            </div>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs font-mono space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Deletion Error:</span>
                </div>
                <p className="whitespace-pre-wrap break-words">{deleteError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteAllConfirm(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-mono text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllDocuments}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-mono bg-red-700 hover:bg-red-600 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Wiping All Knowledge...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete All Knowledge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETION AUDIT LOGS MODAL */}
      {showAuditLogsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-mono">
                <History className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Enterprise Deletion Audit Logs</h3>
              </div>
              <button
                onClick={() => setShowAuditLogsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 font-mono text-xs">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No deletion events recorded yet.
                </div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] pb-1 border-b border-slate-200">
                      <span className="font-bold text-slate-800">{log.id}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div>
                        <span className="text-slate-400">Document: </span>
                        <span className="font-bold text-slate-900">{log.fileName}</span>
                        <span className="text-slate-400 text-[10px]"> ({log.documentId})</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Deleted By: </span>
                        <span className="font-bold text-emerald-700">{log.deletedBy}</span>
                        <span className="text-slate-400 text-[10px]"> • {log.durationMs}ms</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Embeddings:</span>
                        <span className="font-bold text-indigo-600">{log.objectsRemoved.embeddingsCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Graph Nodes:</span>
                        <span className="font-bold text-indigo-600">{log.objectsRemoved.graphNodesCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Graph Edges:</span>
                        <span className="font-bold text-indigo-600">{log.objectsRemoved.graphEdgesCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Registry Objects:</span>
                        <span className="font-bold text-indigo-600">{log.objectsRemoved.registryObjectsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAuditLogsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-mono hover:bg-slate-800 transition-all"
              >
                Close Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {detailsModalDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 space-y-4 shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">{detailsModalDoc.category}</span>
                <h3 className="font-bold text-base text-slate-900 font-mono mt-1">{detailsModalDoc.title}</h3>
                <p className="text-xs text-slate-500 font-mono">Doc ID: {detailsModalDoc.id} • Format: {detailsModalDoc.fileType.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setDetailsModalDoc(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px]">Status</span>
                  <p className="font-bold text-slate-800 mt-0.5">{detailsModalDoc.status}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px]">OCR Confidence</span>
                  <p className="font-bold text-emerald-600 mt-0.5">{detailsModalDoc.ocrConfidence}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px]">Total Pages</span>
                  <p className="font-bold text-slate-800 mt-0.5">{detailsModalDoc.totalPages || 1}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px]">Extracted Rules</span>
                  <p className="font-bold text-indigo-600 mt-0.5">{detailsModalDoc.extractedRulesCount}</p>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 font-mono text-xs">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>Knowledge Brain Pipeline Artifacts</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div>• Structured Model: <span className="text-emerald-300 font-bold">Active</span></div>
                  <div>• Semantic Model: <span className="text-emerald-300 font-bold">Active</span></div>
                  <div>• Keyword Inverted Index: <span className="text-emerald-300 font-bold">Indexed</span></div>
                  <div>• Vector Embeddings: <span className="text-emerald-300 font-bold">Generated</span></div>
                  <div>• Graph Nodes & Edges: <span className="text-emerald-300 font-bold">Linked</span></div>
                  <div>• Governance Approval: <span className="text-emerald-300 font-bold">{detailsModalDoc.approvedRulesCount} Rules Approved</span></div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailsModalDoc(null)}
                className="px-4 py-2 bg-slate-900 text-white font-mono text-xs rounded-lg hover:bg-slate-800 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW RAW CONTENT MODAL */}
      {rawTextModalDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 space-y-4 shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-mono">{rawTextModalDoc.title}</h3>
                <p className="text-xs text-slate-500 font-mono">Extracted Text Content • {rawTextModalDoc.id}</p>
              </div>
              <button
                onClick={() => setRawTextModalDoc(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-y-auto flex-1 whitespace-pre-wrap">
              {rawTextModalDoc.rawTextContent || rawTextModalDoc.ocrText || "No raw text available."}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setRawTextModalDoc(null)}
                className="px-4 py-2 bg-slate-900 text-white font-mono text-xs rounded-lg hover:bg-slate-800 transition-all"
              >
                Close Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT & APPROVE RULE */}
      {activeRuleModal && editingRule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 font-mono text-sm">Edit & Approve Rule: {activeRuleModal.id}</h3>
              <button onClick={() => setActiveRuleModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <input
                  type="text"
                  value={editingRule.category || ""}
                  onChange={e => setEditingRule({ ...editingRule, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Condition Statement</label>
                <textarea
                  rows={3}
                  value={editingRule.condition || ""}
                  onChange={e => setEditingRule({ ...editingRule, condition: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Prescribed Remedy Action</label>
                <textarea
                  rows={3}
                  value={editingRule.recommendation || ""}
                  onChange={e => setEditingRule({ ...editingRule, recommendation: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setActiveRuleModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-mono text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditRule}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs rounded-lg font-bold"
              >
                Save & Approve Rule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
