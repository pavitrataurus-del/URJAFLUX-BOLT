import React, { useState } from "react";
import { 
  LifeBuoy, 
  Download, 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  ThumbsUp, 
  Bug, 
  Send, 
  Terminal, 
  ShieldCheck, 
  Sparkles, 
  FileJson,
  RefreshCw
} from "lucide-react";
import { DiagnosticBundle, CustomerFeedbackEntry } from "../../types/customerLifecycle";
import { INITIAL_FEEDBACK, createDiagnosticBundle } from "../../services/customer_lifecycle/customerLifecycleService";

export const SupportAndDiagnosticsPanel: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<CustomerFeedbackEntry[]>(INITIAL_FEEDBACK);
  const [activeTab, setActiveTab] = useState<"DIAGNOSTICS" | "SUPPORT_CASE" | "CUSTOMER_FEEDBACK">("DIAGNOSTICS");

  // Diagnostic state
  const [diagBundle, setDiagBundle] = useState<DiagnosticBundle | null>(null);
  const [isGeneratingDiag, setIsGeneratingDiag] = useState(false);

  // New Case State
  const [caseSubject, setCaseSubject] = useState("");
  const [caseSeverity, setCaseSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [caseDesc, setCaseDesc] = useState("");
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);

  // Feedback State
  const [fbTitle, setFbTitle] = useState("");
  const [fbType, setFbType] = useState<CustomerFeedbackEntry["type"]>("FEATURE_REQUEST");
  const [fbDesc, setFbDesc] = useState("");

  const handleGenerateDiagnostics = () => {
    setIsGeneratingDiag(true);
    setTimeout(() => {
      const bundle = createDiagnosticBundle();
      setDiagBundle(bundle);
      setIsGeneratingDiag(false);
    }, 1000);
  };

  const handleDownloadJson = () => {
    if (!diagBundle) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(diagBundle, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${diagBundle.bundleId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCreateSupportCase = (e: React.FormEvent) => {
    e.preventDefault();
    const caseId = `CAS-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    setCreatedCaseId(caseId);
    setCaseSubject("");
    setCaseDesc("");
  };

  const handleVoteFeedback = (id: string) => {
    setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, votes: f.votes + 1 } : f));
  };

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbTitle) return;
    const newFb: CustomerFeedbackEntry = {
      id: `fb-${Date.now().toString(36)}`,
      type: fbType,
      title: fbTitle,
      description: fbDesc,
      userEmail: "enterprise-user@urjaflux.com",
      severity: "MEDIUM",
      votes: 1,
      status: "OPEN",
      createdAt: new Date().toISOString()
    };
    setFeedbackList(prev => [newFb, ...prev]);
    setFbTitle("");
    setFbDesc("");
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("DIAGNOSTICS")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "DIAGNOSTICS"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Diagnostic Bundle Generator</span>
          </button>
          <button
            onClick={() => setActiveTab("SUPPORT_CASE")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "SUPPORT_CASE"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support Case Generator</span>
          </button>
          <button
            onClick={() => setActiveTab("CUSTOMER_FEEDBACK")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "CUSTOMER_FEEDBACK"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Feedback & Roadmap Voting ({feedbackList.length})</span>
          </button>
        </div>

        <div className="text-xs font-mono text-emerald-400 flex items-center gap-2 pr-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sanitized Enterprise Telemetry Collector</span>
        </div>
      </div>

      {/* DIAGNOSTICS VIEW */}
      {activeTab === "DIAGNOSTICS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <FileJson className="w-5 h-5 text-emerald-400" />
              <span>Enterprise Diagnostic Bundle & Health Report Generator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Collects sanitized environment configs, memory profile, active DB health, and recent console stacktraces for tier-3 engineering support.
            </p>
          </div>

          <button
            disabled={isGeneratingDiag}
            onClick={handleGenerateDiagnostics}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGeneratingDiag ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Collecting Diagnostic Telemetry...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-white" />
                <span>Generate Diagnostic Package</span>
              </>
            )}
          </button>

          {diagBundle && (
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-emerald-400 font-bold text-sm">{diagBundle.bundleId}</span>
                  <span className="text-slate-400 text-xs block mt-0.5">{diagBundle.timestamp}</span>
                </div>
                <button
                  onClick={handleDownloadJson}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Diagnostic JSON</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-2">
                  <div className="text-slate-300 font-bold">Environment Metadata</div>
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <div>App Version: <span className="text-white">{diagBundle.environmentInfo.appVersion}</span></div>
                    <div>Node Environment: <span className="text-white">{diagBundle.environmentInfo.nodeEnv}</span></div>
                    <div>Memory Usage: <span className="text-white">{diagBundle.environmentInfo.memoryUsageMb} MB</span></div>
                    <div>Database Engine: <span className="text-emerald-400">{diagBundle.environmentInfo.activeDatabase}</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-2">
                  <div className="text-slate-300 font-bold">Services Health Checklist</div>
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    {Object.entries(diagBundle.healthReport).map(([key, status]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span className="text-emerald-400 font-bold">{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Log Summary */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-2">
                <div className="text-slate-300 font-bold">Tail Kernel Console Logs</div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  {diagBundle.logSummary.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUPPORT CASE VIEW */}
      {activeTab === "SUPPORT_CASE" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <LifeBuoy className="w-5 h-5 text-emerald-400" />
              <span>Create Tier-3 Enterprise Support Ticket</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Direct escalation path to URJAFLUX Lead Support & Customer Success Engineers.
            </p>
          </div>

          <form onSubmit={handleCreateSupportCase} className="space-y-4 max-w-xl font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Ticket Subject / Title</label>
              <input
                type="text"
                required
                value={caseSubject}
                onChange={e => setCaseSubject(e.target.value)}
                placeholder="e.g., Latency spike in Digital Twin 3D rendering cluster"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Severity Impact Level</label>
              <select
                value={caseSeverity}
                onChange={e => setCaseSeverity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="LOW">LOW • General Query / Feature Request</option>
                <option value="MEDIUM">MEDIUM • Minor Degradation (Non-blocking)</option>
                <option value="HIGH">HIGH • Critical Production Degradation</option>
                <option value="CRITICAL">CRITICAL • Platform Outage / Airgap Lockout</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Detailed Reproduction Steps / Error Summary</label>
              <textarea
                rows={4}
                required
                value={caseDesc}
                onChange={e => setCaseDesc(e.target.value)}
                placeholder="Include steps, expected behavior, and observed logs..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Support Ticket</span>
            </button>
          </form>

          {createdCaseId && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Support Case Logged: {createdCaseId}</span>
              </div>
              <span className="text-slate-400">Target SLA Response: &lt; 15 Mins</span>
            </div>
          )}
        </div>
      )}

      {/* CUSTOMER FEEDBACK & ROADMAP VOTING VIEW */}
      {activeTab === "CUSTOMER_FEEDBACK" && (
        <div className="space-y-6">
          {/* Submit New Feedback Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Submit Feature Request / Feedback</span>
            </h3>

            <form onSubmit={handleAddFeedback} className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="col-span-2">
                <input
                  type="text"
                  required
                  value={fbTitle}
                  onChange={e => setFbTitle(e.target.value)}
                  placeholder="e.g., Export Digital Twin 3D mesh directly to glTF format"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <select
                  value={fbType}
                  onChange={e => setFbType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="FEATURE_REQUEST">Feature Request</option>
                  <option value="BUG_REPORT">Bug Report</option>
                  <option value="SATISFACTION_SURVEY">CSAT Survey Comment</option>
                </select>
              </div>

              <div className="col-span-3">
                <input
                  type="text"
                  value={fbDesc}
                  onChange={e => setFbDesc(e.target.value)}
                  placeholder="Additional context or technical justification..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Post Feedback Item
                </button>
              </div>
            </form>
          </div>

          {/* Feedback Queue */}
          <div className="grid grid-cols-1 gap-4">
            {feedbackList.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] font-bold border border-slate-800">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400">{item.status}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-slate-400 font-sans">{item.description}</p>
                  <div className="text-[10px] text-slate-500">Submitted by: {item.userEmail} • {item.createdAt}</div>
                </div>

                <button
                  onClick={() => handleVoteFeedback(item.id)}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-bold flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{item.votes} Votes</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
