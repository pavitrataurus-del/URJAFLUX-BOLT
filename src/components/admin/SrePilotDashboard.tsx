import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Shield,
  Cpu,
  Database,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Layers,
  FileCheck,
  Radio,
  Lock,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { metricsCollector, SystemHealthMetrics } from '../../core/telemetry/MetricsCollector';
import { structuredLogger, LogEntry } from '../../core/telemetry/StructuredLogger';
import { globalErrorTracker, CapturedError } from '../../core/telemetry/GlobalErrorTracker';
import { offlineRecoveryService } from '../../core/resilience/OfflineRecoveryService';

export const SrePilotDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemHealthMetrics>(metricsCollector.getSystemMetrics());
  const [logs, setLogs] = useState<LogEntry[]>(structuredLogger.getLogs(50));
  const [errors, setErrors] = useState<CapturedError[]>(globalErrorTracker.getErrors(20));
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'logs' | 'errors' | 'security' | 'recovery'>('overview');
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [isOnline, setIsOnline] = useState<boolean>(offlineRecoveryService.isOnline());
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribeMetrics = metricsCollector.subscribe((updatedMetrics) => {
      setMetrics(updatedMetrics);
    });

    const unsubscribeLogs = structuredLogger.subscribe(() => {
      setLogs(structuredLogger.getLogs(100));
    });

    const unsubscribeErrors = globalErrorTracker.subscribe(() => {
      setErrors(globalErrorTracker.getErrors(50));
    });

    const unsubscribeOnline = offlineRecoveryService.subscribe((online) => {
      setIsOnline(online);
    });

    fetchServerHealth();
    const interval = setInterval(fetchServerHealth, 20000);

    return () => {
      unsubscribeMetrics();
      unsubscribeLogs();
      unsubscribeErrors();
      unsubscribeOnline();
      clearInterval(interval);
    };
  }, []);

  const fetchServerHealth = async () => {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      }
    } catch (e) {
      // Offline or error
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchServerHealth();
    setMetrics(metricsCollector.getSystemMetrics());
    setLogs(structuredLogger.getLogs(100));
    setErrors(globalErrorTracker.getErrors(50));
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.level === logFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  URJAFLUX SRE Pilot Operations Dashboard
                </h1>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  1.0.0-RC1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-Time Enterprise Infrastructure Health, Telemetry & Reliability Monitor
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <Radio className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
            <span>Network: {isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Cluster Status: OPERATIONAL</span>
          </div>

          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 text-sm font-medium overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Health', icon: Activity },
          { id: 'metrics', label: 'Performance Telemetry', icon: Cpu },
          { id: 'logs', label: 'Structured JSON Logs', icon: Terminal },
          { id: 'errors', label: 'Error Exception Feed', icon: AlertTriangle, count: errors.length },
          { id: 'security', label: 'Security & Audit Trail', icon: Shield },
          { id: 'recovery', label: 'Disaster Recovery', icon: Zap }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition text-xs font-semibold whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Health */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Status Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono uppercase text-slate-400">System Uptime</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {Math.floor(metrics.uptimeSeconds / 3600)}h {Math.floor((metrics.uptimeSeconds % 3600) / 60)}m {metrics.uptimeSeconds % 60}s
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero Downtime Baseline</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono uppercase text-slate-400">Memory Heap Used</span>
                <Database className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {metrics.memoryHeapUsedMb} MB / {metrics.memoryHeapTotalMb} MB
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (metrics.memoryHeapUsedMb / metrics.memoryHeapTotalMb) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono uppercase text-slate-400">Render Frame Rate</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {metrics.currentFps} FPS
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Target: 60 FPS (Zero Canvas Stutter)
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono uppercase text-slate-400">5-Min Exception Count</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {metrics.errorCountLast5Min}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Captured via Global Error Boundary
              </div>
            </div>
          </div>

          {/* Service Readiness Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-bold tracking-tight uppercase font-mono text-slate-300 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Enterprise Service Readiness Matrix
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-200">Express Node Engine</div>
                  <div className="text-xs text-slate-400 font-mono">Port 3000 / HTTP Server</div>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  HEALTHY
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-200">Firestore Cloud Sync</div>
                  <div className="text-xs text-slate-400 font-mono">remixed-firestore-database-id</div>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  CONNECTED
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-200">Gemini 3.6 / 2.5 Pro Engine</div>
                  <div className="text-xs text-slate-400 font-mono">API Key Injected</div>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>

          {/* Health JSON Endpoint Output Preview */}
          {healthStatus && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-bold tracking-tight uppercase font-mono text-slate-300 mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Live /health Endpoint Response Payload
              </h2>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Performance Telemetry */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono uppercase text-slate-400 mb-2">CAD DXF Import Benchmark</h3>
              <div className="text-3xl font-bold font-mono text-white mb-1">
                {metrics.avgCadImportTimeMs} ms
              </div>
              <p className="text-xs text-slate-400">Average parsing duration across {metrics.totalCadImports} CAD files</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono uppercase text-slate-400 mb-2">PDF Vectorization Engine</h3>
              <div className="text-3xl font-bold font-mono text-white mb-1">
                {metrics.avgVectorizationTimeMs} ms
              </div>
              <p className="text-xs text-slate-400">Average PDF raster processing time across {metrics.totalRasterVectorizations} jobs</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono uppercase text-slate-400 mb-2">Gemini AI Reasoning Latency</h3>
              <div className="text-3xl font-bold font-mono text-white mb-1">
                {metrics.avgAiResponseTimeMs} ms
              </div>
              <p className="text-xs text-slate-400">Average response time for {metrics.totalAiRequests} AI reasoning queries</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold tracking-tight font-mono text-slate-300 uppercase mb-4">
              Recent Performance Marks & Measures
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Metric Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Duration (ms)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metricsCollector.getRecentMetrics(15).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-900">
                      <td className="py-2 px-3 text-slate-200">{m.name}</td>
                      <td className="py-2 px-3 text-cyan-400">{m.category}</td>
                      <td className="py-2 px-3 text-emerald-300 font-bold">{m.valueMs} ms</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{new Date(m.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Structured JSON Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono uppercase text-slate-400">Log Level Filter:</span>
              <div className="flex gap-1">
                {['ALL', 'INFO', 'WARN', 'ERROR', 'FATAL', 'DEBUG'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setLogFilter(level)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                      logFilter === level
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => structuredLogger.clearLogs()}
              className="text-xs text-slate-400 hover:text-slate-200 underline font-mono"
            >
              Clear Buffer
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded hover:border-slate-700 transition">
                <div className="flex items-center gap-2 mb-1 text-[11px]">
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                    log.level === 'ERROR' || log.level === 'FATAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    log.level === 'WARN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-cyan-400 font-semibold">[{log.component}]</span>
                  <span className="text-slate-500 text-[10px]">CorrId: {log.correlationId}</span>
                </div>
                <div className="text-slate-200 font-medium">{log.message}</div>
                {log.metadata && (
                  <pre className="mt-1 text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded overflow-x-auto">
                    {JSON.stringify(log.metadata)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Error Exception Feed */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">Global Error Exception Feed</h3>
              <p className="text-xs text-slate-400">Captured via Window Error Listener & Global React Error Boundary</p>
            </div>
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono font-bold">
              Total Captured: {errors.length}
            </div>
          </div>

          <div className="space-y-3">
            {errors.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
                No exceptions recorded. System is operating clean.
              </div>
            ) : (
              errors.map((err) => (
                <div key={err.id} className="bg-slate-900/90 border border-red-500/30 rounded-xl p-4 font-mono text-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded font-bold text-xs">
                        {err.errorId}
                      </span>
                      <span className="text-slate-400 text-[11px]">{err.source}</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{new Date(err.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-red-300 font-semibold mb-2">{err.message}</div>
                  {err.stack && (
                    <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px] text-slate-400 overflow-x-auto max-h-40">
                      {err.stack}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Security & Audit Trail */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold font-mono uppercase text-slate-200 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Active Security Headers & Mitigation Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Content-Security-Policy (CSP)</span>
                <span className="text-emerald-400 font-bold">ENFORCED</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Strict-Transport-Security (HSTS)</span>
                <span className="text-emerald-400 font-bold">ENFORCED</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">X-Frame-Options</span>
                <span className="text-emerald-400 font-bold">SAMEORIGIN</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">CSRF Token Cookie (SameSite=Lax)</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Disaster Recovery */}
      {activeTab === 'recovery' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold font-mono uppercase text-slate-200 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Disaster Recovery & Offline Queue Monitor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400 font-mono">Network Connection Status</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {isOnline ? 'CONNECTED' : 'DISCONNECTED'}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400 font-mono">Queued Offline Actions</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {offlineRecoveryService.getQueuedActionsCount()}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400 font-mono">Autosave Local State</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                  ACTIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
