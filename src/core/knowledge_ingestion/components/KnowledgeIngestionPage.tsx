import React, { useState } from 'react';
import { 
  UploadCloud, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  BookOpen,
  Cpu
} from 'lucide-react';
import { KnowledgeVaultDashboard } from './KnowledgeVaultDashboard';
import { KnowledgeImportWorkspace } from './KnowledgeImportWorkspace';
import { ParsingEngineDashboard } from '../../knowledge_parsing/components/ParsingEngineDashboard';
import { logger } from '../utils/logger';
import { importManager } from '../services/ImportManager';
import { formatBytes } from '../utils/fileUtils';

export const KnowledgeIngestionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'parsing' | 'dashboard' | 'audit'>('workspace');
  const recentLogs = logger.getRecentLogs();
  const historyEntries = importManager.getHistory();

  return (
    <div className="space-y-6">
      {/* Module Navigation Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-mono font-bold shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              KNOWLEDGE INGESTION ENGINE
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Enterprise Ingestion Framework • Foundation Sprint BUILD-017A
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'workspace'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Import Workspace
          </button>

          <button
            onClick={() => setActiveTab('parsing')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'parsing'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Parsing Engine
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Vault Dashboard
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Audit Logs
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'workspace' && <KnowledgeImportWorkspace />}

      {activeTab === 'parsing' && <ParsingEngineDashboard />}

      {activeTab === 'dashboard' && <KnowledgeVaultDashboard />}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Recent Import History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Import History ({historyEntries.length})
            </h3>
            {historyEntries.length === 0 ? (
              <p className="text-xs font-mono text-slate-400 py-4">No completed imports archived in history.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-2 px-3">Package Hash</th>
                      <th className="py-2 px-3">Format</th>
                      <th className="py-2 px-3">Size</th>
                      <th className="py-2 px-3">Processor / Pipeline</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Completed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {historyEntries.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">{h.packageHash}</td>
                        <td className="py-2 px-3 uppercase text-slate-500">.{h.extension}</td>
                        <td className="py-2 px-3 text-slate-500">{formatBytes(h.sizeBytes)}</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {h.processorVersion || '1.0.0'} / {h.pipelineVersion || 'v1'}
                        </td>
                        <td className="py-2 px-3 text-slate-400">
                          {h.processingDuration ? `${h.processingDuration}ms` : '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-400">{new Date(h.completedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Structured Audit Logs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm font-mono text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-emerald-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Structured Ingestion Audit Log ({recentLogs.length})
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Sanitized Output</span>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-2">
              {recentLogs.length === 0 ? (
                <p className="text-slate-600 italic py-2">No ingestion events logged yet.</p>
              ) : (
                recentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className="text-slate-500 flex-shrink-0">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      className={`font-bold flex-shrink-0 uppercase ${
                        log.level === 'FATAL' || log.level === 'ERROR'
                          ? 'text-rose-400'
                          : log.level === 'WARN'
                          ? 'text-amber-400'
                          : log.level === 'TRACE'
                          ? 'text-slate-500'
                          : 'text-blue-400'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-slate-200 font-semibold">{log.event}:</span>
                    <span className="text-slate-400 truncate">{JSON.stringify(log.details)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
