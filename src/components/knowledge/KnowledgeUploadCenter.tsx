import React, { useState, useEffect, useRef } from "react";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app, db, db as pipelineDb, firebaseConfig, databaseId } from "../../firebase";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Database, 
  Sparkles, 
  FileCheck, 
  Clock, 
  RotateCcw, 
  Search, 
  Eye, 
  X, 
  Tag, 
  HelpCircle,
  ShieldCheck,
  FileCode,
  HardDrive,
  FolderPlus,
  Folder,
  BookOpen,
  Check,
  Trash2
} from "lucide-react";
import { 
  KnowledgeUploadPipelineService, 
  PipelineProgressState, 
  SupportedFileType 
} from "../../services/knowledgeUploadPipelineService";
import { KnowledgeVaultService, VaultDocument } from "../../services/knowledgeVaultService";
import { readFileArrayBuffer } from "../../services/docxTextExtractionService";
import { KNOWLEDGE_MAX_OCR_PAGES_PER_UPLOAD } from "../../services/knowledgeVaultLimits";
import { PdfIngestionProgressDashboard } from "./PdfIngestionProgressDashboard";

interface KnowledgeUploadCenterProps {
  onUploadSuccess?: (doc: VaultDocument) => void;
}

interface ScannedFileWithMeta {
  file: File;
  relativePath: string;
}

/** Pause between batch PDFs so OpenRouter/Groq TPM can recover. */
const BATCH_PDF_COOLDOWN_MS = 20_000;

function estimateDailyOcrCapacity(): { realisticBooksPerDay: number; ocrPagesPerBook: number } {
  return { realisticBooksPerDay: 8, ocrPagesPerBook: KNOWLEDGE_MAX_OCR_PAGES_PER_UPLOAD };
}

export const KnowledgeUploadCenter: React.FC<KnowledgeUploadCenterProps> = ({ onUploadSuccess }) => {
  const [uploadQueue, setUploadQueue] = useState<PipelineProgressState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [recentUploads, setRecentUploads] = useState<VaultDocument[]>([]);
  const [activePreviewDoc, setActivePreviewDoc] = useState<VaultDocument | null>(null);
  const [batchStats, setBatchStats] = useState<{ totalFiles: number; totalSize: number; processed: number } | null>(null);

  // Deletion workflow states
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<VaultDocument | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Firestore Connectivity Diagnostic State
  const [testState, setTestState] = useState<{ running: boolean; result: string | null; error: boolean }>({
    running: false,
    result: null,
    error: false,
  });

  const handleRunFirestoreConnectivityTest = async () => {
    setTestState({ running: true, result: "Executing...", error: false });

    try {
      const ref = doc(db, "connectivity_test", crypto.randomUUID());
      await setDoc(ref, {
          timestamp: Date.now(),
          source: "connectivity_test",
          status: "ok"
      });
      setTestState({
        running: false,
        result: "CONNECTIVITY TEST SUCCESS",
        error: false,
      });
    } catch (err: any) {
      const auth = getAuth(app);
      const authUser = auth.currentUser ? auth.currentUser.uid : "UNAUTHENTICATED";
      const projectId = firebaseConfig?.projectId || "UNKNOWN";
      
      const errorStr = `
- Firebase error code: ${err?.code}
- Firebase error message: ${err?.message}
- stack trace: ${err?.stack}
- authenticated user: ${authUser}
- project id: ${projectId}
`;
      setTestState({
        running: false,
        result: errorStr,
        error: true,
      });
    }
  };

  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRecentDocs();
  }, []);

  const loadRecentDocs = async (justIngested?: VaultDocument) => {
    if (justIngested?.id) {
      setRecentUploads((prev) =>
        [justIngested, ...prev.filter((d) => d.id !== justIngested.id)].slice(0, 10)
      );
    }
    await KnowledgeVaultService.refreshFromCloud();
    const docs = KnowledgeVaultService.getAllDocuments().sort(
      (a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
    );
    setRecentUploads(docs.slice(0, 10));
  };

  const handleDeleteDocument = async (doc: VaultDocument) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await KnowledgeVaultService.deleteDocument(doc.id, "Vastu Expert Admin");
      if (result.success) {
        setDeleteConfirmDoc(null);
        if (activePreviewDoc?.id === doc.id) setActivePreviewDoc(null);
        setDeleteNotification("Document deleted successfully.");
        setRecentUploads(prev => prev.filter(d => d.id !== doc.id));
        if (onUploadSuccess) onUploadSuccess(doc);
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
        setActivePreviewDoc(null);
        setDeleteNotification("Document deleted successfully.");
        setRecentUploads([]);
        if (onUploadSuccess) onUploadSuccess({} as any);
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

  // Helper: Format Bytes cleanly to B, KB, MB, GB
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Drag and Drop handlers with Folder Traversal support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Recursive HTML5 Directory Scanner
  const scanDirectoryEntry = async (entry: any, fileList: ScannedFileWithMeta[], path = ""): Promise<void> => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file((file: File) => {
          fileList.push({
            file,
            relativePath: path ? `${path}/${file.name}` : file.name
          });
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const readEntries = (): Promise<any[]> => {
        return new Promise((resolve) => {
          dirReader.readEntries((entries: any[]) => resolve(entries));
        });
      };
      
      let entries = await readEntries();
      while (entries.length > 0) {
        for (const subEntry of entries) {
          await scanDirectoryEntry(subEntry, fileList, path ? `${path}/${entry.name}` : entry.name);
        }
        entries = await readEntries();
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const scannedFiles: ScannedFileWithMeta[] = [];
    const items = e.dataTransfer.items;

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await scanDirectoryEntry(entry, scannedFiles);
          }
        } else {
          const file = item.getAsFile();
          if (file) {
            scannedFiles.push({ file, relativePath: file.name });
          }
        }
      }
    } else {
      const rawFiles = Array.from(e.dataTransfer.files);
      rawFiles.forEach(f => scannedFiles.push({ file: f, relativePath: f.name }));
    }

    if (scannedFiles.length > 0) {
      await processScannedFiles(scannedFiles);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawFiles = input.files ? Array.from(input.files) : [];
    if (rawFiles.length > 0) {
      const scannedFiles: ScannedFileWithMeta[] = rawFiles.map(file => ({
        file,
        relativePath: (file as any).webkitRelativePath || file.name
      }));
      await processScannedFiles(scannedFiles);
    }
    // Reset so the same PDF can be selected again for re-upload
    input.value = "";
  };

  // High-performance streaming reader for large books/files
  const readLargeFileContent = async (
    file: File,
    onProgressRead?: (pct: number) => void
  ): Promise<{ textContent: string; rawBuffer?: ArrayBuffer }> => {
    const isTextType =
      file.type.includes("text") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".json");

    if (isTextType) {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (evt) => {
          if (evt.lengthComputable && onProgressRead) {
            onProgressRead(Math.round((evt.loaded / evt.total) * 100));
          }
        };
        reader.onload = (evt) => resolve((evt.target?.result as string) || "");
        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
      });
      return { textContent: text };
    }

    const rawBuffer = await readFileArrayBuffer(file, onProgressRead);
    return { textContent: "", rawBuffer };
  };

  // Multi-file & Folder batch processing orchestrator
  const processScannedFiles = async (items: ScannedFileWithMeta[]) => {
    const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);
    const pdfCount = items.filter((i) => i.file.name.toLowerCase().endsWith(".pdf")).length;
    setBatchStats({
      totalFiles: items.length,
      totalSize,
      processed: 0
    });

    for (let index = 0; index < items.length; index++) {
      const { file, relativePath } = items[index];
      const tempId = `QUEUE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      
      const initialItemState: PipelineProgressState = {
        fileId: tempId,
        fileName: relativePath || file.name,
        fileSizeBytes: file.size,
        fileType: file.name.split('.').pop()?.toLowerCase() || "pdf",
        currentStep: "PENDING",
        progressPercent: 2,
        statusMessage: file.size > 20 * 1024 * 1024 
          ? `Reading large book (${formatBytes(file.size)})...` 
          : "Streaming document into pipeline..."
      };

      setUploadQueue(prev => [initialItemState, ...prev]);

      try {
        // Read file contents with progress feedback
        const { textContent, rawBuffer } = await readLargeFileContent(file, (readPct) => {
          setUploadQueue(prev => prev.map(q => q.fileId === tempId ? {
            ...q,
            progressPercent: Math.min(Math.round(readPct * 0.15), 15),
            statusMessage: `Reading content (${readPct}%)... (${formatBytes(file.size)})`
          } : q));
        });

        const doc = await KnowledgeUploadPipelineService.runPipeline(
          {
            name: relativePath || file.name,
            size: file.size,
            type: file.type,
            dataUrlOrText: textContent,
            rawBuffer,
            fileObj: file
          },
          (updatedState) => {
            setUploadQueue(prev => prev.map(q => (q.fileId === tempId || q.fileId === updatedState.fileId) ? { ...q, ...updatedState } : q));
          },
          selectedCategory
        );

        setBatchStats(prev => prev ? { ...prev, processed: prev.processed + 1 } : null);
        await loadRecentDocs(doc);
        if (onUploadSuccess) onUploadSuccess(doc);

        // Auto-clear completed upload from active queue after 3 seconds so completed files cleanly transition to Ingested Knowledge Documents
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(q => q.fileId !== tempId && q.fileId !== doc.id));
        }, 3000);
      } catch (err: any) {
        console.error(`File processing failed for ${file.name}:`, err);
        setUploadQueue(prev => prev.map(q => (q.fileId === tempId || q.fileName === (relativePath || file.name)) ? {
          ...q,
          currentStep: "FAILED",
          errorMessage: err?.message || "Failed to parse file content"
        } : q));
      }

      const isPdf = file.name.toLowerCase().endsWith(".pdf");
      if (index < items.length - 1 && isPdf && pdfCount > 1) {
        const cooldownId = `COOLDOWN-${index}`;
        setUploadQueue((prev) => [
          {
            fileId: cooldownId,
            fileName: "OCR provider cooldown",
            fileSizeBytes: 0,
            fileType: "pdf",
            currentStep: "PENDING",
            progressPercent: 5,
            statusMessage: `Pausing ${BATCH_PDF_COOLDOWN_MS / 1000}s before next PDF (OpenRouter/Groq rate limits)...`,
          },
          ...prev.filter((q) => q.fileId !== cooldownId),
        ]);
        await new Promise((r) => setTimeout(r, BATCH_PDF_COOLDOWN_MS));
        setUploadQueue((prev) => prev.filter((q) => q.fileId !== cooldownId));
      }
    }
  };

  // Retry failed upload
  const handleRetryUpload = async (item: PipelineProgressState) => {
    setUploadQueue(prev => prev.map(q => q.fileId === item.fileId ? {
      ...q,
      currentStep: "FAILED",
      errorMessage: "Retry requires re-selecting the file. Use Select Large Books / Files and upload again.",
      statusMessage: "Re-select file to retry upload.",
    } : q));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upload Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold font-mono text-emerald-300">Production Knowledge Upload Pipeline</h2>
            </div>
            <p className="text-xs text-slate-400">
              Ingest Vastu Shastras and treatises as <span className="text-emerald-400 font-mono font-bold">PDF, Word (.docx), or Text (.txt/.md)</span>. Scanned PDF OCR and full directory folders also supported.
            </p>
            <p className="text-[11px] text-amber-400/90 font-mono pt-1">
              Bulk OCR plan: ~{KNOWLEDGE_MAX_OCR_PAGES_PER_UPLOAD} Vision pages per scanned PDF • free tier ≈{" "}
              {estimateDailyOcrCapacity().realisticBooksPerDay} books/day • use folder upload overnight for large batches
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-amber-950/30 p-1.5 rounded-lg border border-amber-900/50">
              <span className="text-xs font-mono text-amber-500 font-bold px-2">Firestore Connectivity Diagnostics:</span>
              <button
                type="button"
                id="btn-run-firestore-connectivity-test"
                onClick={handleRunFirestoreConnectivityTest}
                disabled={testState.running}
                className={`font-mono text-xs px-3 py-1.5 rounded border font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  testState.running
                    ? "bg-amber-950/80 border-amber-600 text-amber-300 cursor-wait animate-pulse"
                    : testState.error
                    ? "bg-red-950 hover:bg-red-900 border-red-700 text-red-200"
                    : testState.result && !testState.error
                    ? "bg-emerald-950 hover:bg-emerald-900 border-emerald-600 text-emerald-200"
                    : "bg-amber-900/60 hover:bg-amber-800/80 border-amber-600/80 text-amber-200"
                }`}
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>{testState.running ? "Testing..." : "Run Firestore Connectivity Test"}</span>
              </button>
            </div>

            <span className="text-xs font-mono text-slate-400">Category Tag:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="All">Auto-Detect Category</option>
              <option value="Vastu Shastra">Vastu Shastra</option>
              <option value="Lal Kitab">Lal Kitab</option>
              <option value="Numerology">Numerology</option>
              <option value="Ayadi Numerology">Ayadi Numerology</option>
              <option value="Astrology">Astrology</option>
              <option value="Ayadi Formulas">Ayadi Formulas</option>
              <option value="Toilet Rules">Toilet Rules</option>
              <option value="Kitchen Rules">Kitchen Rules</option>
              <option value="Entrance Rules">Entrance Rules</option>
              <option value="Bedroom Rules">Bedroom Rules</option>
              <option value="Water Elements">Water Elements</option>
              <option value="Remedies & Corrections">Remedies & Corrections</option>
            </select>
          </div>
        </div>

        {/* Firestore Connectivity Diagnostic Output Banner */}
        {testState.result && (
          <div
            id="firestore-connectivity-test-output"
            className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 shadow-inner ${
              testState.error
                ? "bg-red-950/90 border-red-800 text-red-200"
                : "bg-emerald-950/90 border-emerald-800 text-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-black/40">
                {testState.error ? "FAIL" : "PASS"}
              </span>
              <span>{testState.result}</span>
            </div>
            <button
              type="button"
              onClick={() => setTestState({ running: false, result: null, error: false })}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            isDragging 
              ? "border-emerald-400 bg-emerald-950/40" 
              : "border-slate-700 hover:border-emerald-500 bg-slate-950/50"
          }`}
        >
          <div className="p-3 bg-emerald-900/40 rounded-full text-emerald-400 border border-emerald-800/60 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <Folder className="w-6 h-6 text-emerald-300" />
          </div>

          <div className="space-y-1 max-w-lg">
            <h3 className="font-bold text-sm font-mono text-slate-200">
              Drag & Drop PDF, Word, Text Files, or Entire Folders Here
            </h3>
            <p className="text-xs text-slate-400">
              Supports <span className="text-emerald-400 font-mono font-bold">PDF · DOCX · TXT · MD · CSV</span>, scanned PDF OCR, and nested subdirectories.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* File Selector */}
            <label className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Select Large Books / Files</span>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.docx,.doc,.txt,.md,.csv,.xlsx,.xls,image/*" 
                onChange={handleFileInput} 
                className="hidden" 
              />
            </label>

            {/* Folder / Directory Selector */}
            <label className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-600/50 font-mono text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <span>Upload Entire Folder / Directory</span>
              <input 
                ref={folderInputRef}
                type="file" 
                /* @ts-ignore */
                webkitdirectory=""
                /* @ts-ignore */
                directory=""
                multiple 
                onChange={handleFileInput} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>

      {/* Batch Processing Statistics */}
      {batchStats && batchStats.totalFiles > 1 && (
        <div className="bg-slate-900 border border-emerald-900/50 p-4 rounded-xl text-white flex items-center justify-between text-xs font-mono shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950 rounded-lg text-emerald-400 border border-emerald-800">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-emerald-300">Batch Directory Ingestion in Progress</div>
              <div className="text-slate-400">Processed {batchStats.processed} of {batchStats.totalFiles} files ({formatBytes(batchStats.totalSize)} total)</div>
              <div className="text-amber-400/80 pt-1">
                {batchStats.totalFiles > estimateDailyOcrCapacity().realisticBooksPerDay
                  ? `⚠ ${batchStats.totalFiles} files may exceed today's free OCR quota — remaining will finish after midnight UTC or quota reset.`
                  : "Sequential upload with 20s OCR cooldown between PDFs."}
              </div>
            </div>
          </div>
          <div className="font-bold text-emerald-400 text-sm">
            {Math.round((batchStats.processed / batchStats.totalFiles) * 100)}% Complete
          </div>
        </div>
      )}

      {/* Active Upload Pipeline Queue UI */}
      {uploadQueue.filter(i => i.currentStep !== "COMPLETED").length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              <h3 className="font-bold font-mono text-slate-900 text-sm">
                Active Ingestion Pipeline Queue ({uploadQueue.filter(i => i.currentStep !== "COMPLETED").length})
              </h3>
            </div>
            <button
              onClick={() => {
                setUploadQueue([]);
                setBatchStats(null);
              }}
              className="text-xs font-mono text-slate-400 hover:text-slate-600"
            >
              Clear Queue
            </button>
          </div>

          <div className="space-y-4">
            {uploadQueue.filter(i => i.currentStep !== "COMPLETED").map(item => (
              <PdfIngestionProgressDashboard 
                key={item.fileId} 
                item={item} 
                onRetry={handleRetryUpload} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
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

      {/* Recently Ingested Documents List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold font-mono text-slate-900 text-sm">Ingested Knowledge Documents ({recentUploads.length})</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              disabled={recentUploads.length === 0}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-mono flex items-center gap-1 transition-all disabled:opacity-40"
              title="Delete all uploaded knowledge documents"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete All</span>
            </button>
            <span className="text-xs font-mono text-slate-400 border-l border-slate-200 pl-2">Persisted in Firestore</span>
          </div>
        </div>

        {recentUploads.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-xl text-center space-y-2 font-mono">
            <Database className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-600">No Ingested Documents</div>
            <div className="text-[11px] text-slate-400">All uploaded books and documents have been deleted or cleared.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentUploads.map(doc => (
              <div key={doc.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 hover:border-emerald-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {doc.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs font-mono mt-1 truncate" title={doc.title}>{doc.title}</h4>
                  </div>

                  <span className="bg-slate-900 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded font-bold shrink-0">
                    {doc.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-mono line-clamp-2">
                  {doc.ocrText || "Document extracted and indexed in Knowledge Vault."}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-200">
                  <span>Version {doc.version} • {formatBytes(doc.sizeBytes)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActivePreviewDoc(doc)}
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                      title="Inspect Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteConfirmDoc(doc);
                      }}
                      className="text-slate-400 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Inspector Modal */}
      {activePreviewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {activePreviewDoc.category}
                </span>
                <h3 className="font-bold text-slate-900 font-mono text-sm mt-1">{activePreviewDoc.title}</h3>
              </div>
              <button onClick={() => setActivePreviewDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">ID: {activePreviewDoc.id}</div>
                <div className="text-slate-500">Original File: {activePreviewDoc.originalName}</div>
                <div className="text-slate-500">Size: {formatBytes(activePreviewDoc.sizeBytes)}</div>
                <div className="text-slate-500">Status: {activePreviewDoc.status}</div>
                <div className="text-slate-500">OCR Confidence: {activePreviewDoc.ocrConfidence}%</div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Extracted Text Content</label>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-xl max-h-60 overflow-y-auto leading-relaxed text-[11px]">
                  {activePreviewDoc.ocrText}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setDeleteError(null);
                  setDeleteConfirmDoc(activePreviewDoc);
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Document</span>
              </button>
              <button
                onClick={() => setActivePreviewDoc(null)}
                className="bg-slate-900 text-white font-mono text-xs px-4 py-2 rounded-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DOCUMENT MODAL */}
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

    </div>
  );
};

