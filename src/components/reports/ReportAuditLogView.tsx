import React from 'react';
import { ShieldCheck, History, User, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { ReportRegistry } from '../../core/reports/ReportRegistry';

export const ReportAuditLogView: React.FC = () => {
  const auditLogs = ReportRegistry.getInstance().getAllAuditLogs();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Immutable Report Audit Log & Compliance Governance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete chronological audit trail documenting document creations, section modifications, status approvals, and export history.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {auditLogs.length} Log Entries Recorded
        </span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {auditLogs.map((log) => (
          <div
            key={log.auditId}
            className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-slate-700 transition"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  log.action === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  log.action === 'CREATED' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {log.action}
                </span>
                <span className="font-mono text-slate-400">Report ID: <span className="text-slate-200">{log.reportId}</span></span>
              </div>
              <p className="text-slate-200 text-xs">{log.details}</p>
              <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-1">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {log.performedBy} ({log.userRole})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Cryptographically Logged
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
