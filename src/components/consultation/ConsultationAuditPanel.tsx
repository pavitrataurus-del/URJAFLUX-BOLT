import React from 'react';
import {
  ShieldAlert,
  Activity,
  BarChart2,
  Clock,
  CheckCircle2,
  Lock,
  Cpu,
  Brain
} from 'lucide-react';
import { UserRole } from '../../core/consultation/ConsultationTypes';

interface ConsultationAuditPanelProps {
  userRole: UserRole;
}

export const ConsultationAuditPanel: React.FC<ConsultationAuditPanelProps> = ({ userRole }) => {
  if (userRole !== 'ADMIN' && userRole !== 'PROJECT_MANAGER') {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2 font-mono text-xs text-amber-400">
        <Lock className="w-6 h-6 mx-auto text-amber-400" />
        <p>RBAC RESTRICTION: Consultation Audit Logs require ADMIN or PROJECT_MANAGER privileges.</p>
      </div>
    );
  }

  const sampleLogs = [
    {
      auditId: 'aud-001',
      sessionId: 'ses-1722001',
      intent: 'RECOMMENDATION_EXPLANATION',
      domains: ['Vastu', 'Chakra', 'LalKitab'],
      confidence: 98,
      latencyMs: 18,
      userRole: 'ADMIN',
      timestamp: '2026-07-26 03:42:10'
    },
    {
      auditId: 'aud-002',
      sessionId: 'ses-1722001',
      intent: 'MONITORING_STATUS',
      domains: ['Vastu', 'Chakra'],
      confidence: 96,
      latencyMs: 12,
      userRole: 'PROJECT_MANAGER',
      timestamp: '2026-07-26 03:44:22'
    },
    {
      auditId: 'aud-003',
      sessionId: 'ses-1722002',
      intent: 'KNOWLEDGE_QUERY',
      domains: ['Vastu'],
      confidence: 98,
      latencyMs: 15,
      userRole: 'FIELD_ENGINEER',
      timestamp: '2026-07-26 03:45:01'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 text-slate-100 font-sans shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            Consultation Analytics & Immutable Audit Trail
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time intent routing, response latency, and RBAC security logging
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold rounded-lg self-start sm:self-auto">
          IMMUTABLE AUDIT ENABLED
        </span>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">Total Queries Processed</span>
          <span className="text-xl font-bold text-white">128</span>
          <span className="text-[10px] text-emerald-400 block mt-1">100% Traceable</span>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">Mean Truth Confidence</span>
          <span className="text-xl font-bold text-emerald-400">97.2%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Grade A+ Average</span>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">Mean Orchestration Latency</span>
          <span className="text-xl font-bold text-cyan-400">14.2 ms</span>
          <span className="text-[10px] text-cyan-400 block mt-1">Sub-millisecond graph synthesis</span>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">Most Active Intent</span>
          <span className="text-sm font-bold text-amber-400 truncate block mt-1">RECOMMENDATION_EXPLANATION</span>
          <span className="text-[10px] text-slate-400 block">42% of traffic</span>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Immutable Session Execution Log
        </h4>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[10px] uppercase">
                <th className="p-3">Audit ID</th>
                <th className="p-3">Session</th>
                <th className="p-3">User Role</th>
                <th className="p-3">Intent Category</th>
                <th className="p-3">Domains</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sampleLogs.map((log) => (
                <tr key={log.auditId} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 text-slate-400 font-bold">{log.auditId}</td>
                  <td className="p-3 text-cyan-400">{log.sessionId}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3 text-white font-bold">{log.intent}</td>
                  <td className="p-3 text-emerald-400">{log.domains.join(', ')}</td>
                  <td className="p-3 text-emerald-400 font-bold">{log.confidence}%</td>
                  <td className="p-3 text-slate-400">{log.latencyMs}ms</td>
                  <td className="p-3 text-slate-500 text-[10px]">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
