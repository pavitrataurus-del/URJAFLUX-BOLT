import React, { useState } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  ArrowUpRight, 
  FileText, 
  Lock 
} from "lucide-react";
import { HumanApprovalRequest, ApprovalAction } from "../../types/autonomousAi";
import { INITIAL_APPROVAL_REQUESTS } from "../../services/autonomous_ai/autonomousAiService";

export const HumanApprovalCenterPanel: React.FC = () => {
  const [approvals, setApprovals] = useState<HumanApprovalRequest[]>(INITIAL_APPROVAL_REQUESTS);
  const [selectedApp, setSelectedApp] = useState<HumanApprovalRequest | null>(INITIAL_APPROVAL_REQUESTS[0]);
  const [commentText, setCommentText] = useState("");
  const [actionDoneMessage, setActionDoneMessage] = useState("");

  const handleResolveAction = (action: ApprovalAction) => {
    if (!selectedApp) return;

    const resolvedTime = new Date().toLocaleString();
    const updated = approvals.map(app => {
      if (app.id === selectedApp.id) {
        return {
          ...app,
          status: (action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : action === "DELEGATE" ? "DELEGATED" : "ESCALATED") as any,
          resolvedAt: resolvedTime,
          decisionAction: action,
          decisionComment: commentText || "Action resolved by Human Supervisor",
          auditTrail: [
            ...app.auditTrail,
            {
              timestamp: resolvedTime,
              action: `RESOLVED_${action}`,
              actor: "Super Admin (pavitra@urjaflux.io)",
              notes: commentText || `Decision: ${action}`
            }
          ]
        };
      }
      return app;
    });

    setApprovals(updated);
    setSelectedApp(updated.find(a => a.id === selectedApp.id) || null);
    setActionDoneMessage(`Action successfully resolved with decision: ${action}`);
    setCommentText("");
    setTimeout(() => setActionDoneMessage(""), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>MODULE 4 • HUMAN APPROVAL & GOVERNANCE GATEWAY</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">High-Risk Human Approval Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop gatekeeping for high-risk autonomous AI actions, hardware overrides, and system parameter changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{approvals.filter(a => a.status === "PENDING").length} PENDING APPROVALS</span>
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionDoneMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionDoneMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Pending List */}
        <div className="lg:col-span-1 space-y-3">
          {approvals.map(app => {
            const isSelected = selectedApp?.id === app.id;
            return (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected 
                    ? "bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">{app.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    app.status === "PENDING" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                    app.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                    "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}>
                    {app.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">{app.actionTitle}</h4>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-850">
                  <span className="text-rose-400 font-bold">RISK: {app.riskLevel}</span>
                  <span className="text-slate-500">Timeout: {app.timeoutMinutes}m</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Request Detail View */}
        {selectedApp && (
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{selectedApp.riskLevel} RISK ACTION APPROVAL • {selectedApp.id}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{selectedApp.actionTitle}</h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">Requestor Agent: {selectedApp.requestorAgentId}</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300 font-bold text-xs">
                Role Required: {selectedApp.requiredRole}
              </span>
            </div>

            {/* Risk Details Note */}
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-1">
              <span className="text-rose-400 font-bold text-xs">Risk Assessment & Impact Analysis:</span>
              <p className="text-slate-200 text-xs font-sans">{selectedApp.riskDetails}</p>
            </div>

            {/* Action Buttons (If Pending) */}
            {selectedApp.status === "PENDING" ? (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <label className="block text-slate-300 text-xs">Human Supervisor Decision Notes / Comments:</label>
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Enter audit notes or instructions..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleResolveAction("APPROVE")}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Action</span>
                  </button>

                  <button
                    onClick={() => handleResolveAction("REJECT")}
                    className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Action</span>
                  </button>

                  <button
                    onClick={() => handleResolveAction("DELEGATE")}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Delegate</span>
                  </button>

                  <button
                    onClick={() => handleResolveAction("ESCALATE")}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span>Escalate</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold text-xs">Decision Status: {selectedApp.status}</span>
                <p className="text-slate-300 text-xs font-sans">Resolved At: {selectedApp.resolvedAt}</p>
                <p className="text-slate-400 text-xs font-sans italic">Comment: "{selectedApp.decisionComment}"</p>
              </div>
            )}

            {/* Audit Trail */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Approval Audit Trail</span>
              </h3>

              <div className="space-y-2">
                {selectedApp.auditTrail.map((trail, idx) => (
                  <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] flex justify-between">
                    <div>
                      <span className="font-bold text-amber-300 block">{trail.action}</span>
                      <span className="text-slate-400 font-sans">{trail.notes}</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <div>{trail.actor}</div>
                      <div>{trail.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
