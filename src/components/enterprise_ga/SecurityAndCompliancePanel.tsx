import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  FileCheck2, 
  UserCheck, 
  Trash2, 
  Download, 
  Code2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { complianceAndSecurityService } from "../../services/enterprise/complianceAndSecurityService";

export const SecurityAndCompliancePanel: React.FC = () => {
  const [controls] = useState(complianceAndSecurityService.getComplianceControls());
  const [rawInput, setRawInput] = useState("<script>alert('xss-test')</script>");
  const [sanitizedOutput, setSanitizedOutput] = useState(complianceAndSecurityService.sanitizeInput("<script>alert('xss-test')</script>"));
  const [dsrRequests, setDsrRequests] = useState(complianceAndSecurityService.getDataSubjectRequests());
  const [notification, setNotification] = useState<string | null>(null);

  const handleSanitizeTest = (val: string) => {
    setRawInput(val);
    setSanitizedOutput(complianceAndSecurityService.sanitizeInput(val));
  };

  const handleExportData = () => {
    const req = complianceAndSecurityService.requestDataExport("usr-admin-01");
    setDsrRequests([...complianceAndSecurityService.getDataSubjectRequests()]);
    setNotification(`Data Subject Export Request '${req.id}' processed successfully.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteData = () => {
    const req = complianceAndSecurityService.requestDataDeletion("usr-admin-01");
    setDsrRequests([...complianceAndSecurityService.getDataSubjectRequests()]);
    setNotification(`Right to be Forgotten (Deletion) Request '${req.id}' executed.`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>MODULE 5 & 6: SECURITY HARDENING & COMPLIANCE READINESS</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">ISO 27001, SOC 2, OWASP ASVS, DPDP India & GDPR</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Input sanitization engines, RBAC policies, granular consent records, and automated Data Subject Workflows for global privacy compliance.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid: OWASP Live Sanitizer & Data Subject Rights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live OWASP Input Sanitizer Tester */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">OWASP ASVS Input Sanitizer</h3>
          </div>

          <div className="space-y-2">
            <label className="text-slate-400 font-bold text-[10px]">Test Raw User Input (Script / XSS Injection):</label>
            <input 
              type="text" 
              value={rawInput}
              onChange={(e) => handleSanitizeTest(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-400 font-bold text-[10px]">Sanitized & Html-Encoded Output:</label>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs break-all">
              {sanitizedOutput || "(Empty)"}
            </div>
          </div>
        </div>

        {/* Data Subject Rights (DPDP India / GDPR) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Data Subject Rights & Privacy Workflows</h3>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportData}
              className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT USER PII DATA</span>
            </button>
            <button 
              onClick={handleDeleteData}
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[11px] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>RIGHT TO BE FORGOTTEN</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Recent Data Subject Audit Logs</div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {dsrRequests.map(r => (
                <div key={r.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-300">{r.id} ({r.requestType})</span>
                  <span className="text-emerald-400 font-bold">{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Framework Controls Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileCheck2 className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Compliance Framework Controls Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-2 px-3">Framework</th>
                <th className="py-2 px-3">Control Code & Name</th>
                <th className="py-2 px-3">In-App Status</th>
                <th className="py-2 px-3">Evidence Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {controls.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-bold text-indigo-300">
                    {c.framework}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.controlCode} • {c.description}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      c.inAppStatus === "IMPLEMENTED_IN_APP" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {c.inAppStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[10px] font-mono">
                    {c.evidenceSnippet}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
