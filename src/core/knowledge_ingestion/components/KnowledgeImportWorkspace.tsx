import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileCode,
  XCircle,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { useKnowledgeIngestionQueue } from '../hooks/useKnowledgeIngestionQueue';
import { ProcessingStage, LifecycleStatus, FileValidationResult, IngestionQueueItem } from '../types/ingestion.types';
import { formatBytes } from '../utils/fileUtils';

export const KnowledgeImportWorkspace: React.FC = () => {
  const {
    queue,
    uploadFiles,
    pauseQueue,
    resumeQueue,
    cancelItem,
    retryItem,
    clearCompleted
  } = useKnowledgeIngestionQueue();

  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<readonly FileValidationResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const result = uploadFiles(e.dataTransfer.files);
      if (result.rejectedCount > 0) {
        setValidationErrors(result.validationFailures);
      } else {
        setValidationErrors([]);
      }
    }
  }, [uploadFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const result = uploadFiles(e.target.files);
      if (result.rejectedCount > 0) {
        setValidationErrors(result.validationFailures);
      } else {
        setValidationErrors([]);
      }
      e.target.value = '';
    }
  }, [uploadFiles]);

  const triggerBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getStatusBadge = (item: IngestionQueueItem) => {
    if (item.lifecycleStatus === LifecycleStatus.PAUSED) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          <PauseCircle className="w-3 h-3" />
          PAUSED
        </span>
      );
    }

    if (item.lifecycleStatus === LifecycleStatus.CANCELLED) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
          <XCircle className="w-3 h-3" />
          CANCELLED
        </span>
      );
    }

    if (item.lifecycleStatus === LifecycleStatus.FAILED) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-3 h-3" />
          FAILED
        </span>
      );
    }

    if (item.lifecycleStatus === LifecycleStatus.COMPLETED || item.processingStage === ProcessingStage.READY) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          COMPLETED
        </span>
      );
    }

    switch (item.processingStage) {
      case ProcessingStage.QUEUED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Layers className="w-3 h-3" />
            QUEUED
          </span>
        );
      case ProcessingStage.VALIDATING:
      case ProcessingStage.REGISTERING:
      case ProcessingStage.UPLOADING:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            {item.processingStage}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {item.processingStage}
          </span>
        );
    }
  };

  const hasActiveUploads = queue.some((q) => q.lifecycleStatus === LifecycleStatus.ACTIVE);
  const isPausedState = queue.some((q) => q.lifecycleStatus === LifecycleStatus.PAUSED);

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.epub,.docx,.txt,.md,.markdown,.jpg,.jpeg,.png,.tiff,.tif,application/pdf,image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.005]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3 pointer-events-none">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
              Knowledge Package Ingestion Zone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Drag & Drop files here or click to browse
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {['PDF', 'EPUB', 'DOCX', 'TXT', 'MARKDOWN'].map((ext) => (
              <span
                key={ext}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                .{ext.toLowerCase()}
              </span>
            ))}
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Max 50MB per file • Duplicate detection enabled
          </p>
        </div>
      </div>

      {/* Validation Failures Banner */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl p-4 text-rose-800 dark:text-rose-300 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              File Validation Rejected ({validationErrors.length})
            </div>
            <button
              onClick={() => setValidationErrors([])}
              className="text-xs text-rose-600 hover:text-rose-800 dark:hover:text-rose-200 font-mono"
            >
              Dismiss
            </button>
          </div>
          <ul className="text-xs font-mono space-y-1 list-disc pl-5">
            {validationErrors.map((err, idx) => (
              <li key={idx}>
                <strong>{err.file.name}</strong>:{' '}
                {err.errors.map((e) => e.errorMessage).join(' ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Queue Toolbar & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Ingestion Queue ({queue.length})
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Active import batch execution status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasActiveUploads && (
              <button
                onClick={pauseQueue}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 transition-colors flex items-center gap-1.5"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                Pause Queue
              </button>
            )}

            {isPausedState && (
              <button
                onClick={resumeQueue}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Resume Queue
              </button>
            )}

            <button
              onClick={clearCompleted}
              disabled={!queue.some((q) => q.lifecycleStatus === LifecycleStatus.COMPLETED || q.lifecycleStatus === LifecycleStatus.CANCELLED)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Completed
            </button>
          </div>
        </div>

        {/* Queue Items Table */}
        {queue.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            No files in ingestion queue. Drop files above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Format</th>
                  <th className="py-2 px-3">Package Ref</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">Progress</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(item)}
                    </td>

                    <td className="py-3 px-3 uppercase font-bold text-slate-600 dark:text-slate-300">
                      .{item.metadata.extension}
                    </td>

                    <td className="py-3 px-3 text-slate-900 dark:text-white font-medium">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[200px]" title={item.metadata.packageHash}>
                          {item.metadata.packageHash}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatBytes(item.totalBytes)}
                    </td>

                    <td className="py-3 px-3 w-48">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{item.progressPercentage}%</span>
                          <span>{formatBytes(item.bytesProcessed)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-150 ${
                              item.lifecycleStatus === LifecycleStatus.FAILED
                                ? 'bg-rose-500'
                                : item.lifecycleStatus === LifecycleStatus.COMPLETED
                                ? 'bg-emerald-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${item.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {item.lifecycleStatus === LifecycleStatus.FAILED || item.lifecycleStatus === LifecycleStatus.CANCELLED ? (
                          <button
                            onClick={() => retryItem(item.id)}
                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Retry Upload"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : null}

                        {item.lifecycleStatus === LifecycleStatus.ACTIVE ? (
                          <button
                            onClick={() => cancelItem(item.id)}
                            className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Cancel Upload"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
