import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Terminal,
  Database,
  Search,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  FileCode,
  HardDrive,
  Brain
} from 'lucide-react';
import {
  KnowledgeUploadPipelineService,
  PIPELINE_STAGES
} from '../services/knowledgeUploadPipelineService';
import {
  StageExecutionState,
  PipelineLogEntry,
  KnowledgeDocument,
  StageId
} from '../types';
import { RuntimeKnowledgeValidationSuite } from './RuntimeKnowledgeValidationSuite';

interface PresetDocument {
  name: string;
  sizeMB: number;
  pages: number;
  type: string;
  description: string;
  triggersTimeout: boolean;
}

const PRESET_DOCUMENTS: PresetDocument[] = [
  {
    name: 'Vastu_Architecture_Master_Guide_V4.pdf',
    sizeMB: 45.2,
    pages: 168,
    type: 'Vastu & Spatial Design PDF',
    description: 'Large 45MB Vastu PDF (168 pages). Generates 15.7MB graph payload that triggers Stage 11 Firestore 3s timeout fallback.',
    triggersTimeout: true,
  },
  {
    name: 'Urjaflux_Structural_Codes_2026.pdf',
    sizeMB: 12.4,
    pages: 48,
    type: 'Engineering Spec',
    description: 'Medium 12MB engineering specification document with high-density architectural matrices.',
    triggersTimeout: false,
  },
  {
    name: 'Spatial_Energy_Flow_Summary.pdf',
    sizeMB: 3.8,
    pages: 14,
    type: 'Design Summary',
    description: 'Lightweight layout diagram with 14 pages of direction vector nodes.',
    triggersTimeout: false,
  },
];

export const KnowledgeUploadCenter: React.FC = () => {
  const [pipelineService] = useState(() => new KnowledgeUploadPipelineService());
  const [stageStates, setStageStates] = useState<Map<StageId, StageExecutionState>>(new Map());
  const [currentStageId, setCurrentStageId] = useState<StageId>(1);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [logs, setLogs] = useState<PipelineLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'terminal' | 'repository' | 'payload' | 'validation'>('pipeline');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  
  // Custom upload fields
  const [customFileName, setCustomFileName] = useState<string>('Vastu_45MB_Sample_Book.pdf');
  const [customSizeMB, setCustomSizeMB] = useState<number>(45);
  const [customPages, setCustomPages] = useState<number>(168);
  const [forceTimeoutSim, setForceTimeoutSim] = useState<boolean>(true);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pipelineService.onStageChange((states, currentStage, progress) => {
      setStageStates(states);
      setCurrentStageId(currentStage);
      setOverallProgress(progress);
    });

    pipelineService.onLog((log) => {
      setLogs((prev) => [...prev, log]);
    });
  }, [pipelineService]);

  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  const handleStartIngestion = async (preset?: PresetDocument) => {
    if (isProcessing) return;

    setLogs([]);
    setIsProcessing(true);

    const fileName = preset ? preset.name : customFileName;
    const sizeMB = preset ? preset.sizeMB : customSizeMB;
    const pages = preset ? preset.pages : customPages;
    const type = preset ? preset.type : 'Custom Upload PDF';
    const simulateHang = preset ? preset.triggersTimeout : forceTimeoutSim;

    try {
      const docResult = await pipelineService.executePipeline({
        fileName,
        fileSizeMB: sizeMB,
        pageCount: pages,
        documentType: type,
        simulatedHangOnStage11: simulateHang,
      });

      setDocuments((prev) => [docResult, ...prev]);
      setSelectedDoc(docResult);
      setActiveTab('validation');
    } catch (err) {
      console.error('Pipeline error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const stage11State = stageStates.get(11);
  const stage11Fallback = stage11State?.isFallbackTriggered;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5" />
              URJAFLUX AI OS • Knowledge Pipeline Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              12-Stage Knowledge Ingestion & Resilience Center
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              High-speed document chunking, Vastu spatial parsing, vector embedding, and resilient Firestore persistence with automatic 3-second <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">Promise.race</code> timeout fallback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all border ${
                activeTab === 'pipeline'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 inline mr-2" />
              Pipeline View
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all border ${
                activeTab === 'terminal'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4 inline mr-2" />
              Live Console ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('repository')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all border ${
                activeTab === 'repository'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Repository ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all border ${
                activeTab === 'validation'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-2 text-emerald-400" />
              E2E Validation Test
            </button>
          </div>
        </div>
      </div>

      {/* Preset Launcher & Upload Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Presets Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Test Bench & Preset Documents
            </h2>
            <span className="text-xs text-slate-400">Click preset to test Stage 11 fallback</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_DOCUMENTS.map((preset, idx) => (
              <div
                key={idx}
                className="group relative bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
              >
                {preset.triggersTimeout && (
                  <span className="absolute -top-2.5 right-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Stage 11 Timeout Test
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs mb-1 group-hover:text-indigo-300 transition-colors truncate">
                    <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{preset.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-2">
                    <span>{preset.sizeMB} MB</span>
                    <span>•</span>
                    <span>{preset.pages} Pages</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <button
                  onClick={() => handleStartIngestion(preset)}
                  disabled={isProcessing}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  Run 12-Stage Ingestion
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Upload Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-indigo-400" />
              Custom Document Config
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Document Title / File</label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">File Size (MB)</label>
                  <input
                    type="number"
                    value={customSizeMB}
                    onChange={(e) => setCustomSizeMB(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Page Count</label>
                  <input
                    type="number"
                    value={customPages}
                    onChange={(e) => setCustomPages(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 text-xs">Simulate Stage 11 Hang</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceTimeoutSim}
                    onChange={(e) => setForceTimeoutSim(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleStartIngestion()}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Pipeline Active ({overallProgress}%)
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Ingest Custom File
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Overall Progress Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Ingestion Execution Progress
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white font-mono">
                    {overallProgress}%
                  </span>
                  <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                    Current Stage: Stage {currentStageId} - {PIPELINE_STAGES[currentStageId - 1]?.shortName}
                  </span>
                  {stage11Fallback && (
                    <span className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Stage 11 Fallback Triggered (3s Promise.race Bypassed Freeze)
                    </span>
                  )}
                </div>
              </div>

              {/* Status Indicator Badges */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Persistence Strategy</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {stage11Fallback ? 'Sanitized Minimal Payload (Fallback)' : 'Standard Firestore Write'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 relative ${
                  stage11Fallback
                    ? 'bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500'
                    : 'bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400'
                }`}
                style={{ width: `${overallProgress}%` }}
              >
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                )}
              </div>
            </div>
          </div>

          {/* Special Stage 11 Resilience Highlight Box */}
          <div className={`p-5 rounded-2xl border transition-all ${
            stage11Fallback
              ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${stage11Fallback ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Stage 11: Firestore Persistence Resilience Engine
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                      3-Sec Timeout Guard
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    When uploading large Vastu PDFs (e.g. 45MB, 168 pages), the graph payload can cause a silent Firestore network freeze at 96%. Our <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">Promise.race([firestoreWrite, timeout(3000)])</code> detects the hang, bypasses the freeze, sanitizes the payload, and force transitions to Stage 12.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Raw Payload</span>
                  <span className="text-rose-400 font-semibold">15,750 KB</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Sanitized Payload</span>
                  <span className="text-emerald-400 font-semibold">78 KB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Visual Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center justify-between">
              <span>Pipeline Stage Grid (1 to {PIPELINE_STAGES.length})</span>
              <span className="text-xs font-normal text-slate-400">
                {Array.from(stageStates.values()).filter((s) => s.status === 'completed' || s.status === 'fallback').length} / {PIPELINE_STAGES.length} Stages Completed
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {PIPELINE_STAGES.map((stage) => {
                const state = stageStates.get(stage.id);
                const isCurrent = currentStageId === stage.id && isProcessing;
                const isCompleted = state?.status === 'completed';
                const isFallback = state?.status === 'fallback';

                return (
                  <div
                    key={stage.id}
                    className={`relative p-4 rounded-xl border transition-all ${
                      isFallback
                        ? 'bg-amber-950/20 border-amber-500/50 text-amber-200'
                        : isCurrent
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 text-indigo-200'
                        : isCompleted
                        ? 'bg-slate-950/80 border-slate-800/80 text-slate-300'
                        : 'bg-slate-950/40 border-slate-800/40 text-slate-400 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Stage {stage.id}
                      </span>

                      {isFallback ? (
                        <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Fallback Bypassed
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Complete
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Processing
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Pending</span>
                      )}
                    </div>

                    <h4 className="font-semibold text-xs text-slate-200 mb-1 line-clamp-1">
                      {stage.name}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 h-8 leading-tight mb-2">
                      {state?.detail || stage.description}
                    </p>

                    {/* Stage Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isFallback
                            ? 'bg-amber-400'
                            : isCompleted
                            ? 'bg-emerald-400'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${state?.progress || 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Live Terminal Log Tab */}
      {activeTab === 'terminal' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">
                Live Knowledge Ingestion Event Stream
              </h2>
            </div>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            >
              Clear Logs
            </button>
          </div>

          <div className="font-mono text-xs bg-slate-900/90 rounded-xl p-4 border border-slate-800/80 h-96 overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-400 text-center py-20">
                No logs generated yet. Click "Run 12-Stage Ingestion" on any document preset above.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 p-1.5 rounded transition-colors ${
                    log.level === 'warn'
                      ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-500'
                      : log.level === 'error'
                      ? 'bg-rose-500/10 text-rose-300 border-l-2 border-rose-500'
                      : log.level === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-slate-400 text-[10px] select-none">{log.timestamp}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-indigo-300 font-semibold select-none">
                    ST-{log.stageId}
                  </span>
                  <span className="flex-1 leading-relaxed">{log.message}</span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* Repository Tab */}
      {activeTab === 'repository' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Ingested Knowledge Assets ({documents.length})
            </h2>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm">No ingested documents in active repository context.</p>
              <button
                onClick={() => handleStartIngestion(PRESET_DOCUMENTS[0])}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-all"
              >
                Run Test Preset Ingestion
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Document Title</th>
                    <th className="p-3">Size & Pages</th>
                    <th className="p-3">Firestore Mode</th>
                    <th className="p-3">Chunks / Graph Nodes</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span>{doc.title}</span>
                      </td>
                      <td className="p-3 text-slate-400">
                        {doc.fileSizeMB} MB • {doc.pageCount} Pages
                      </td>
                      <td className="p-3">
                        {doc.sanitized ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-[10px]">
                            Sanitized Fallback (3s Timeout)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 text-[10px]">
                            Direct Firestore Write
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300 font-mono">
                        {doc.chunkCount} chunks • {doc.graphNodesCount} nodes
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-medium text-[10px] flex items-center w-fit gap-1">
                          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                          Ready for Search Index
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setActiveTab('payload');
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs transition-colors"
                        >
                          Inspect Payload
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payload Inspection Tab */}
      {activeTab === 'payload' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              Stage 11 Payload Inspection (Oversized vs Sanitized)
            </h2>
            <button
              onClick={() => setActiveTab('pipeline')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Back to Pipeline
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between text-rose-400 text-xs font-semibold">
                <span>Raw Heavy Payload (Causes Silent Hang)</span>
                <span>~15,750 KB</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-400 bg-slate-900 p-3 rounded-lg overflow-x-auto h-64 border border-slate-800">
{`{
  "documentId": "doc_urja_45mb_vastu",
  "title": "${selectedDoc?.title || customFileName}",
  "fileSizeMB": ${selectedDoc?.fileSizeMB || customSizeMB},
  "rawPdfEmbeddings": [
    [0.0823, -0.421, 0.9912, ... 1536 float32 dimensions x 1344 chunks],
    [0.1192, -0.002, 0.4421, ... 1536 dimensions]
  ],
  "fullGraphTopology": {
    "nodes": [ /* 2352 Vastu directional property nodes */ ],
    "edges": [ /* 8920 directional flow tension tensors */ ]
  },
  "firestoreStatus": "HANGS_ON_NETWORK_ACK (>3000ms)"
}`}
              </pre>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                <span>Sanitized Minimal Payload (3s Timeout Fallback)</span>
                <span>~78 KB</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto h-64 border border-slate-800">
{`{
  "documentId": "doc_urja_45mb_vastu",
  "title": "${selectedDoc?.title || customFileName}",
  "fileSizeMB": ${selectedDoc?.fileSizeMB || customSizeMB},
  "sanitized": true,
  "sanitizedReason": "3s Promise.race timeout bypassed Firestore network freeze",
  "essentialMetadata": {
    "category": "Vastu & Spatial Design PDF",
    "pages": ${selectedDoc?.pageCount || customPages},
    "canonicalTags": ["urjaflux", "vastu-architect"],
    "localGraphBufferRef": "buffer_vault_0x9a83"
  },
  "transitionState": "Stage 12 Search Index Active"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* End-to-End Knowledge Validation Test Tab */}
      {activeTab === 'validation' && (
        <RuntimeKnowledgeValidationSuite
          document={selectedDoc || documents[0] || null}
          autoRun={true}
        />
      )}
    </div>
  );
};
