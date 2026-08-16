// Module 6: Enterprise Connectors Hub UI
import React, { useState } from "react";
import {
  Link,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Server,
  Activity,
  HardDrive
} from "lucide-react";
import { EnterpriseConnector, ConnectorProviderType } from "../../types/integrationPlatform";
import { EnterpriseConnectorPlatform } from "../../core/integration/EnterpriseConnectorPlatform";

export const EnterpriseConnectorHub: React.FC = () => {
  const [connectors, setConnectors] = useState<EnterpriseConnector[]>(() =>
    EnterpriseConnectorPlatform.getConnectors()
  );
  const [testResult, setTestResult] = useState<string | null>(null);

  const refreshConnectors = () => {
    setConnectors(EnterpriseConnectorPlatform.getConnectors());
  };

  const handleTestConnection = (id: string) => {
    const res = EnterpriseConnectorPlatform.testConnectorConnection(id);
    setTestResult(res.message);
    refreshConnectors();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Module 6
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              Enterprise Ecosystem
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Enterprise SaaS & Cloud Connectors
          </h2>
          <p className="text-xs text-slate-300">
            Bi-directional connectors for Google Drive, SharePoint, Microsoft 365, Slack, Teams, SMTP, and REST APIs.
          </p>
        </div>

        <button
          onClick={refreshConnectors}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Connectors
        </button>
      </div>

      {testResult && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center justify-between">
          <span>{testResult}</span>
          <button onClick={() => setTestResult(null)} className="text-emerald-700 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((conn) => (
          <div key={conn.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider block w-fit mb-1">
                  {conn.provider}
                </span>
                <h3 className="font-bold text-sm text-slate-900">{conn.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{conn.id}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                conn.status === "CONNECTED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}>
                {conn.status === "CONNECTED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {conn.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-[10px] block">Latency</span>
                <span className="font-bold text-slate-800">{conn.latencyMs} ms</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Events Sync</span>
                <span className="font-bold text-slate-800">{conn.totalEventsProcessed}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Errors</span>
                <span className="font-bold text-slate-800">{conn.errorCount}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Last Sync: {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleTimeString() : "Never"}
              </span>

              <button
                onClick={() => handleTestConnection(conn.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Test Connection
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
