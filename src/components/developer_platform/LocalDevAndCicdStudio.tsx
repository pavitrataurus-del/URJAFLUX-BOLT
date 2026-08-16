import React, { useState } from "react";
import { 
  GitBranch, 
  BarChart3, 
  HelpCircle, 
  Copy, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  AlertTriangle, 
  Activity 
} from "lucide-react";
import { CicdTemplate, DeveloperAnalyticsMetrics } from "../../types/developerPlatform";
import { 
  CICD_TEMPLATES, 
  INITIAL_DEVELOPER_METRICS 
} from "../../services/developer_platform/developerPlatformService";

export const LocalDevAndCicdStudio: React.FC = () => {
  const [cicdTemplates] = useState<CicdTemplate[]>(CICD_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<CicdTemplate>(CICD_TEMPLATES[0]);
  const [metrics] = useState<DeveloperAnalyticsMetrics>(INITIAL_DEVELOPER_METRICS);
  
  const [activeTab, setActiveTab] = useState<"CICD" | "ANALYTICS" | "SUPPORT">("CICD");
  const [copiedYaml, setCopiedYaml] = useState(false);

  // Troubleshooting Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [issueType, setIssueType] = useState<"AUTH_FAILURE" | "CAD_SYNC_ERROR" | "WEBHOOK_FAIL">("AUTH_FAILURE");

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(selectedTemplate.yamlContent);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <GitBranch className="w-4 h-4" />
            <span>MODULE 9-14 • LOCAL DEV, CI/CD & DEVELOPER SUPPORT</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">CI/CD Pipelines, Analytics & Troubleshooting Hub</h2>
          <p className="text-xs text-slate-400 mt-1">
            Production GitHub Actions & GitLab CI templates, developer ecosystem analytics, and guided diagnostic support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("CICD")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === "CICD" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            CI/CD Pipelines
          </button>

          <button
            onClick={() => setActiveTab("ANALYTICS")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === "ANALYTICS" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            Dev Analytics
          </button>

          <button
            onClick={() => setActiveTab("SUPPORT")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === "SUPPORT" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            Support & Wizard
          </button>
        </div>
      </div>

      {/* CI/CD PIPELINES TAB */}
      {activeTab === "CICD" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {cicdTemplates.map(tmpl => (
              <button
                key={tmpl.provider}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`px-4 py-2 rounded-xl font-bold border text-xs cursor-pointer transition-all ${
                  selectedTemplate.provider === tmpl.provider 
                    ? "bg-slate-950 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10" 
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tmpl.provider.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-emerald-400 font-bold text-sm">{selectedTemplate.fileName}</span>
                <p className="text-slate-400 text-xs font-sans mt-0.5">{selectedTemplate.description}</p>
              </div>

              <button
                onClick={handleCopyYaml}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedYaml ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied YAML</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Pipeline YAML</span>
                  </>
                )}
              </button>
            </div>

            {selectedTemplate.requiresExternalRunner && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-200 text-xs font-sans">
                ⚠️ Note: Automated CI execution requires external runners (e.g. GitHub Actions Runner or GitLab Runner instance).
              </div>
            )}

            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-850 text-emerald-300 overflow-x-auto text-xs leading-relaxed max-h-96">
              <code>{selectedTemplate.yamlContent}</code>
            </pre>
          </div>
        </div>
      )}

      {/* DEVELOPER ANALYTICS TAB */}
      {activeTab === "ANALYTICS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-slate-400 text-xs">Registered Developers</span>
              <div className="text-2xl font-bold text-white">{metrics.totalRegisteredDevs.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400">+14% month-over-month</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-slate-400 text-xs">Monthly API Volume</span>
              <div className="text-2xl font-bold text-emerald-400">{(metrics.totalMonthlyApiRequests / 1000000).toFixed(2)}M Requests</div>
              <span className="text-[10px] text-slate-500">Avg Latency: {metrics.avgApiLatencyMs} ms</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-slate-400 text-xs">SDK Downloads</span>
              <div className="text-2xl font-bold text-amber-300">{metrics.totalSdkDownloads.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500">TypeScript & Python leading</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-slate-400 text-xs">Marketplace Packages</span>
              <div className="text-2xl font-bold text-white">{metrics.marketplacePackagesCount} Active</div>
              <span className="text-[10px] text-emerald-400">Error Rate: {metrics.apiErrorRatePercentage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ENTERPRISE SUPPORT & TROUBLESHOOTING WIZARD TAB */}
      {activeTab === "SUPPORT" && (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Interactive Developer Troubleshooting Wizard</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Diagnose common API integration, CAD layer sync, and authentication token errors.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-bold">Step 1: Select Symptom Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "AUTH_FAILURE", title: "API Key / OAuth 401 Unauthorized" },
                  { id: "CAD_SYNC_ERROR", title: "CAD Layer Extraction Timeout" },
                  { id: "WEBHOOK_FAIL", title: "Webhook Delivery 5xx Failure" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setIssueType(opt.id as any)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      issueType === opt.id 
                        ? "bg-slate-900 border-emerald-500 text-emerald-300 font-bold" 
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-400">Step 2: Recommended Resolution Steps</span>
              {issueType === "AUTH_FAILURE" && (
                <div className="space-y-1 text-slate-300 text-xs font-sans">
                  <div>1. Verify token prefix is <code className="text-emerald-300 font-mono">urja_live_</code>.</div>
                  <div>2. Check that key scopes include requested resource (e.g., <code className="text-amber-300 font-mono">cad:read</code>).</div>
                  <div>3. Run <code className="text-emerald-300 font-mono">urjaflux doctor --verbose</code> in terminal to verify auth token validity.</div>
                </div>
              )}
              {issueType === "CAD_SYNC_ERROR" && (
                <div className="space-y-1 text-slate-300 text-xs font-sans">
                  <div>1. Confirm CAD file format is DWG_2026 or DXF_2024.</div>
                  <div>2. Ensure file payload size does not exceed 100MB limit.</div>
                  <div>3. Check PDK plugin manifest permission <code className="text-emerald-300 font-mono">cad:write</code> is granted.</div>
                </div>
              )}
              {issueType === "WEBHOOK_FAIL" && (
                <div className="space-y-1 text-slate-300 text-xs font-sans">
                  <div>1. Verify target server responds with HTTP 200 within 5000ms.</div>
                  <div>2. Validate HMAC HMAC-SHA256 signature using secret token.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
