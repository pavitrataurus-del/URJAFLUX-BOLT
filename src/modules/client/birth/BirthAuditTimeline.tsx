import React from "react";
import { Client } from "../../../types/app";
import { ShieldAlert, Clock, UserCheck, Edit3 } from "lucide-react";

interface BirthAuditTimelineProps {
  client: Client;
}

export const BirthAuditTimeline: React.FC<BirthAuditTimelineProps> = ({ client }) => {
  const logs = client.birthAuditLog || [];

  return (
    <div id="birth-audit-timeline" className="bg-white/35 border border-slate-200 rounded-xl p-5 space-y-4">
      <div>
        <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
          Registry Audit Trail (HIPAA-grade)
        </h4>
        <p className="text-[10px] text-slate-400 font-mono">SECURE TIME-STAMPED MODIFICATION HISTORY</p>
      </div>

      <div className="relative border-l border-slate-200 ml-2.5 pl-4 py-2 space-y-4">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Dot marker */}
              <div className="absolute -left-[21.5px] top-0.5 bg-emerald-600 rounded-full w-2.5 h-2.5 border border-slate-200 group-hover:bg-rose-400 transition-colors" />
              
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono gap-1">
                  <span className="text-slate-700 font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    OPERATOR: {log.operator.toUpperCase()}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-600" />
                    {new Date(log.timestamp).toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{log.details}</p>
                <div className="text-[9px] font-mono text-emerald-400/80 bg-slate-50 px-2 py-0.5 rounded-full inline-block">
                  ACTION: {log.action.toUpperCase()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="relative">
            {/* Dot marker */}
            <div className="absolute -left-[21.5px] top-0.5 bg-slate-700 rounded-full w-2.5 h-2.5 border border-slate-200" />
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 font-bold">SYSTEM INIT</span>
                <span className="text-slate-600">{client.joinedDate || "Pre-existing"}</span>
              </div>
              <p className="text-xs text-slate-400 italic">No administrative edits or audits logged for this profile yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
