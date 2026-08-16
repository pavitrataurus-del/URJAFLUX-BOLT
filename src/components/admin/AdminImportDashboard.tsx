// URJAFLUX BUILD-021B - Admin Streaming Import Dashboard
// Complete Enterprise Import Pipeline UI with drag-drop, streaming metrics, duplicate modal, and controls.

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Cpu,
  Clock,
  Zap,
  FileText,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  Trash2,
  Layers
} from "lucide-react";

import { EnterpriseImportEngine } from "../../core/import_engine/EnterpriseImportEngine";
import { ImportJobMetrics, DuplicateDetectionResult, DuplicateResolution, ImportEventType } from "../../core/import_engine/types";

interface AdminImportDashboardProps {
  userRole?: string;
}

export default function AdminImportDashboard({ userRole = "ADMIN" }: AdminImportDashboardProps) {
  const engine = EnterpriseImportEngine.getInstance();
  const jobManager = engine.jobManager;

  const [jobs, setJobs] = useState<ImportJobMetrics[]>([]);
  const [activeJob, setActiveJob] = useState<ImportJobMetrics | null>(null);
  const [duplicateModal, setDuplicateModal] = useState<{
    show: boolean;
    info?: DuplicateDetectionResult;
    resolver?: (res: DuplicateResolution) => void;
  }>({ show: false });

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ingestStatusMsg, setIngestStatusMsg] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    refreshJobs();

    if (!jobManager || typeof jobManager.addEventListener !== 'function') {
      const interval = setInterval(refreshJobs, 10000);
      return () => clearInterval(interval);
    }

    // Register event listeners safely
    const unsubStarted = typeof jobManager.addEventListener === 'function' ? jobManager.addEventListener(ImportEventType.IMPORT_STARTED, refreshJobs) : () => {};
    const unsubProgress = typeof jobManager.addEventListener === 'function' ? jobManager.addEventListener(ImportEventType.PAGE_STREAMED, refreshJobs) : () => {};
    const unsubCheckpoint = typeof jobManager.addEventListener === 'function' ? jobManager.addEventListener(ImportEventType.CHECKPOINT_CREATED, refreshJobs) : () => {};
    const unsubPaused = typeof jobManager.addEventListener === 'function' ? jobManager.addEventListener(ImportEventType.JOB_PAUSED, refreshJobs) : () => {};
    const unsubCompleted = typeof jobManager.addEventListener === 'function' ? jobManager.addEventListener(ImportEventType.JOB_COMPLETED, refreshJobs) : () => {};
    const unsubFailed = typeof jobManager.addEventListener === 'function' ? jobManager.addEventListener(ImportEventType.JOB_FAILED, refreshJobs) : () => {};
    const unsubCancelled = typeof jobManager.addEventListener === 'function' ? jobManager.addEventListener(ImportEventType.IMPORT_CANCELLED, refreshJobs) : () => {};

    const interval = setInterval(refreshJobs, 10000);

    return () => {
      if (typeof unsubStarted === 'function') unsubStarted();
      if (typeof unsubProgress === 'function') unsubProgress();
      if (typeof unsubCheckpoint === 'function') unsubCheckpoint();
      if (typeof unsubPaused === 'function') unsubPaused();
      if (typeof unsubCompleted === 'function') unsubCompleted();
      if (typeof unsubFailed === 'function') unsubFailed();
      if (typeof unsubCancelled === 'function') unsubCancelled();
      clearInterval(interval);
    };
  }, []);

  const refreshJobs = () => {
    const all = jobManager.getAllJobs();
    setJobs([...all]);

    const running = all.find(j => j.status === "PAGE_STREAMING" || j.status === "CHECKPOINTING");
    if (running) {
      setActiveJob({ ...running });
    } else if (all.length > 0) {
      setActiveJob({ ...all[all.length - 1] });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 bg-amber-950/20 border border-amber-800/40 rounded-xl text-amber-200 flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
        <div>
          <h3 className="font-semibold text-lg">Access Restricted</h3>
          <p className="text-sm opacity-80">The Enterprise Streaming Import Engine Dashboard (BUILD-021B) is reserved for Administrators.</p>
        </div>
      </div>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await startImportPipeline(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      await startImportPipeline(file);
    }
  };

  const startImportPipeline = async (file: File) => {
    setIngestStatusMsg(`Ingesting ${file.name}...`);
    try {
      await engine.ingestDocument(file, file.name, {
        onDuplicateDetected: (dupInfo) => {
          return new Promise<DuplicateResolution>((resolve) => {
            setDuplicateModal({
              show: true,
              info: dupInfo,
              resolver: (res) => {
                setDuplicateModal({ show: false });
                resolve(res);
              }
            });
          });
        },
        onProgress: () => {
          refreshJobs();
        }
      });
      setIngestStatusMsg(`Successfully completed ingestion for ${file.name}`);
    } catch (err: any) {
      setIngestStatusMsg(`Import failed: ${err.message}`);
    }
  };

  const runningJobs = jobs.filter(j => j.status === "PAGE_STREAMING" || j.status === "CHECKPOINTING");
  const queuedJobs = jobs.filter(j => j.status === "QUEUED" || j.status === "VALIDATING" || j.status === "HASHING");
  const completedJobs = jobs.filter(j => j.status === "COMPLETED");
  const failedJobs = jobs.filter(j => j.status === "FAILED");

  return (
    <div className="space-y-6 text-slate-100">
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              BUILD-021B ONLINE
            </span>
            <span className="text-xs text-slate-400">Sprint-2 Enterprise Pipeline</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Enterprise Streaming Import Engine Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            High-throughput page-by-page streaming document parser with zero-copy RAM buffers (&lt;100MB RAM target).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshJobs}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh State
          </button>
        </div>
      </div>

      {/* METRICS & GAUGES STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Active / Queued Jobs</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {runningJobs.length} <span className="text-sm text-slate-400 font-normal">running ({queuedJobs.length} queued)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Streaming Speed</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {activeJob?.speedPagesPerSec || 0} <span className="text-sm text-slate-400 font-normal">pg/s ({activeJob?.speedMBPerSec || 0} MB/s)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Memory Usage Target (&lt;100MB)</div>
            <div className="text-xl font-bold text-amber-300 mt-0.5">
              {activeJob?.memoryUsageMB || 32.5} <span className="text-sm text-slate-400 font-normal">MB</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Completed Imports</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {completedJobs.length} <span className="text-sm text-slate-400 font-normal">documents</span>
            </div>
          </div>
        </div>
      </div>

      {/* DRAG AND DROP INGESTION ZONE */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging ? "border-emerald-500 bg-emerald-950/20" : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.txt,.md,.csv,.xlsx,.dxf,.dwg"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-300">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">Stream Ingest Large Document</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Supports massive PDFs (up to 500+ MB), High-Res Images (PNG, JPG, WEBP), Markdown & Future CAD/Docx formats.
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition inline-flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Browse File to Import
        </button>
        {ingestStatusMsg && (
          <div className="mt-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-md inline-block">
            {ingestStatusMsg}
          </div>
        )}
      </div>

      {/* LIVE ACTIVE IMPORT MONITOR */}
      {activeJob && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">{activeJob.fileName}</h4>
                <p className="text-xs text-slate-400">
                  {activeJob.fileSizeMB} MB • Parser: <span className="text-slate-300">{activeJob.parserType}</span> • Status:{" "}
                  <span className="text-emerald-400 font-semibold">{activeJob.status}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeJob.status === "PAGE_STREAMING" && (
                <button
                  onClick={() => engine.pauseJob(activeJob.jobId)}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause Job
                </button>
              )}

              {(activeJob.status === "PAUSED" || activeJob.status === "FAILED") && selectedFile && (
                <button
                  onClick={() => engine.resumeJob(activeJob.jobId, selectedFile, selectedFile.name)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Resume Job
                </button>
              )}

              <button
                onClick={() => engine.cancelJob(activeJob.jobId)}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Job
              </button>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Progress: Page {activeJob.currentPage} of {activeJob.totalPages} ({activeJob.progressPercentage}%)</span>
              <span>ETA: {activeJob.etaSeconds}s remaining</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${activeJob.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* STREAMING METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400">Throughput Rate:</span>
              <div className="font-semibold text-white mt-0.5">{activeJob.speedPagesPerSec} pg/s</div>
            </div>
            <div>
              <span className="text-slate-400">Data Rate:</span>
              <div className="font-semibold text-white mt-0.5">{activeJob.speedMBPerSec} MB/s</div>
            </div>
            <div>
              <span className="text-slate-400">Checkpoints Saved:</span>
              <div className="font-semibold text-emerald-400 mt-0.5">{activeJob.checkpointSavedCount} saved</div>
            </div>
            <div>
              <span className="text-slate-400">Live Memory:</span>
              <div className="font-semibold text-amber-300 mt-0.5">{activeJob.memoryUsageMB} MB RAM</div>
            </div>
          </div>
        </div>
      )}

      {/* ALL JOBS QUEUE TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Ingestion Job Queue History
        </h3>

        {jobs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No active or historical streaming import jobs in the queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Job ID</th>
                  <th className="py-2.5 px-3 font-semibold">Document Name</th>
                  <th className="py-2.5 px-3 font-semibold">Size</th>
                  <th className="py-2.5 px-3 font-semibold">Parser</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Progress</th>
                  <th className="py-2.5 px-3 font-semibold">Checkpoints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map((job) => (
                  <tr key={job.jobId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono text-slate-300">{job.jobId}</td>
                    <td className="py-3 px-3 font-medium text-white">{job.fileName}</td>
                    <td className="py-3 px-3 text-slate-400">{job.fileSizeMB} MB</td>
                    <td className="py-3 px-3 text-slate-400">{job.parserType}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        job.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : job.status === "FAILED"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : job.status === "PAUSED"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {job.currentPage} / {job.totalPages} ({job.progressPercentage}%)
                    </td>
                    <td className="py-3 px-3 text-slate-400">{job.checkpointSavedCount} checkpoints</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DUPLICATE WARNING MODAL */}
      {duplicateModal.show && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Duplicate Document Detected</h3>
            </div>
            <p className="text-xs text-slate-300">
              SHA-256 hash or filename matches an existing Knowledge Vault record:{" "}
              <span className="font-semibold text-amber-300">{duplicateModal.info?.existingBookTitle}</span>.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Match Type: <span className="text-white font-medium">{duplicateModal.info?.duplicateType}</span></div>
              <div>SHA-256 Checksum: <span className="text-mono text-[10px] text-slate-300">{duplicateModal.info?.checksumSha256.substring(0, 20)}...</span></div>
            </div>

            <p className="text-xs text-slate-400">Select administrative action:</p>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => duplicateModal.resolver?.("SKIP")}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold text-left px-3 border border-slate-700"
              >
                1. Skip Ingestion (Ignore File)
              </button>
              <button
                onClick={() => duplicateModal.resolver?.("REPLACE")}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold text-left px-3"
              >
                2. Replace Existing Document
              </button>
              <button
                onClick={() => duplicateModal.resolver?.("NEW_VERSION")}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold text-left px-3"
              >
                3. Create New Version (v2.0)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
