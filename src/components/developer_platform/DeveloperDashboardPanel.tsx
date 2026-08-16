import React, { useState } from "react";
import { 
  Code, 
  Key, 
  Webhook, 
  Plus, 
  ShieldCheck, 
  Activity, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  Globe, 
  Layers, 
  BarChart3, 
  Smartphone 
} from "lucide-react";
import { DeveloperApplication, ApiKeyRecord, WebhookEndpoint } from "../../types/developerPlatform";
import { 
  INITIAL_DEVELOPER_APPS, 
  INITIAL_API_KEYS, 
  INITIAL_WEBHOOKS 
} from "../../services/developer_platform/developerPlatformService";

export const DeveloperDashboardPanel: React.FC = () => {
  const [apps, setApps] = useState<DeveloperApplication[]>(INITIAL_DEVELOPER_APPS);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>(INITIAL_API_KEYS);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(INITIAL_WEBHOOKS);
  
  const [selectedAppId, setSelectedAppId] = useState<string>(INITIAL_DEVELOPER_APPS[0].id);
  const [isRegisteringApp, setIsRegisteringApp] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");
  const [newAppType, setNewAppType] = useState<"WEB_APP" | "CLI_TOOL" | "PLUGIN_EXTENSION" | "AUTOMATION_BOT">("PLUGIN_EXTENSION");

  const [copiedKeyId, setCopiedKeyId] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  const currentApp = apps.find(a => a.id === selectedAppId) || apps[0];

  const handleRegisterApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName) return;

    const newApp: DeveloperApplication = {
      id: `APP-URJA-DEV-${Math.floor(100 + Math.random() * 900)}`,
      tenantId: "TENANT-URJA-CORP",
      name: newAppName,
      description: newAppDesc || "Developer application extension for UrjaFlux platform.",
      publisherName: "Current Workspace Developer",
      appType: newAppType,
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
      apiKeysCount: 1,
      webhooksCount: 0,
      monthlyApiRequests: 0
    };

    const defaultKey: ApiKeyRecord = {
      id: `KEY-${Math.floor(100 + Math.random() * 900)}`,
      appId: newApp.id,
      keyPrefix: `urja_live_${Math.random().toString(36).substring(2, 8)}...`,
      label: "Default Primary API Key",
      scopes: ["cad:read", "twin:read", "ai:query"],
      createdAt: new Date().toISOString().split("T")[0],
      lastUsedAt: "Never",
      active: true
    };

    setApps(prev => [newApp, ...prev]);
    setApiKeys(prev => [defaultKey, ...prev]);
    setSelectedAppId(newApp.id);
    setIsRegisteringApp(false);
    setNewAppName("");
    setNewAppDesc("");
    setNoticeMessage(`Application "${newApp.name}" registered successfully with API credentials.`);
    setTimeout(() => setNoticeMessage(""), 4000);
  };

  const handleCreateApiKey = () => {
    if (!currentApp) return;

    const newKey: ApiKeyRecord = {
      id: `KEY-${Math.floor(100 + Math.random() * 900)}`,
      appId: currentApp.id,
      keyPrefix: `urja_live_${Math.random().toString(36).substring(2, 8)}...`,
      label: `Key #${currentApp.apiKeysCount + 1}`,
      scopes: ["cad:read", "cad:write", "twin:sync", "ai:execute"],
      createdAt: new Date().toISOString().split("T")[0],
      lastUsedAt: "Just created",
      active: true
    };

    setApiKeys(prev => [newKey, ...prev]);
    setApps(prev => prev.map(a => a.id === currentApp.id ? { ...a, apiKeysCount: a.apiKeysCount + 1 } : a));
    setNoticeMessage(`Generated new API Key token for ${currentApp.name}`);
    setTimeout(() => setNoticeMessage(""), 3000);
  };

  const handleCreateWebhook = () => {
    if (!currentApp) return;

    const newHook: WebhookEndpoint = {
      id: `HOOK-${Math.floor(100 + Math.random() * 900)}`,
      appId: currentApp.id,
      targetUrl: `https://api.tenant-domain.com/webhooks/${currentApp.id.toLowerCase()}`,
      eventsSubscribed: ["twin.telemetry.alert", "vastu.audit.completed"],
      secretToken: `whsec_${Math.random().toString(36).substring(2, 14)}`,
      status: "HEALTHY",
      lastDeliveredAt: "Never",
      successRate: 100
    };

    setWebhooks(prev => [newHook, ...prev]);
    setApps(prev => prev.map(a => a.id === currentApp.id ? { ...a, webhooksCount: a.webhooksCount + 1 } : a));
    setNoticeMessage(`Registered Webhook Endpoint for ${currentApp.name}`);
    setTimeout(() => setNoticeMessage(""), 3000);
  };

  const handleCopyKey = (keyId: string, prefix: string) => {
    navigator.clipboard.writeText(`${prefix}full_secret_token_value`);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(""), 2000);
  };

  const filteredKeys = apiKeys.filter(k => k.appId === currentApp?.id);
  const filteredWebhooks = webhooks.filter(w => w.appId === currentApp?.id);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Code className="w-4 h-4" />
            <span>MODULE 1 • DEVELOPER PORTAL & APP REGISTRATION</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Enterprise Developer Applications & API Keys</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage application credentials, OAuth2 clients, secret API keys, webhook endpoints, and usage quotas.
          </p>
        </div>

        <button
          onClick={() => setIsRegisteringApp(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Developer App</span>
        </button>
      </div>

      {/* Notification Banner */}
      {noticeMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Register App Modal / Form */}
      {isRegisteringApp && (
        <form onSubmit={handleRegisterApp} className="bg-slate-950 border border-emerald-500/50 p-5 rounded-2xl space-y-4 font-mono">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <span>Register New UrjaFlux Platform Application</span>
            <button type="button" onClick={() => setIsRegisteringApp(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">Application Name</label>
              <input
                type="text"
                value={newAppName}
                onChange={e => setNewAppName(e.target.value)}
                placeholder="e.g. Solar CAD Structural Analyzer"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Application Category / Type</label>
              <select
                value={newAppType}
                onChange={e => setNewAppType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="PLUGIN_EXTENSION">PLUGIN_EXTENSION (CAD / Twin / Vastu Plugin)</option>
                <option value="AUTOMATION_BOT">AUTOMATION_BOT (AI Autonomous Agent)</option>
                <option value="WEB_APP">WEB_APP (OAuth Client Dashboard)</option>
                <option value="CLI_TOOL">CLI_TOOL (Developer Terminal Script)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Application Purpose / Description</label>
            <textarea
              value={newAppDesc}
              onChange={e => setNewAppDesc(e.target.value)}
              placeholder="Describe what your extension or client application will do..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRegisteringApp(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: App Selection & App Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Apps List Column */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Registered Developer Apps</span>
            <span className="text-emerald-400 font-bold">{apps.length} Total</span>
          </h3>

          <div className="space-y-3">
            {apps.map(app => {
              const isSelected = selectedAppId === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? "bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-300 font-bold">{app.id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                      {app.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{app.name}</h4>

                  <p className="text-[11px] text-slate-400 font-sans line-clamp-2">{app.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-850">
                    <span>Keys: {app.apiKeysCount}</span>
                    <span>Webhooks: {app.webhooksCount}</span>
                    <span className="text-emerald-400">{app.monthlyApiRequests.toLocaleString()} req/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected App Details & Keys/Webhooks Management */}
        {currentApp && (
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
                  <span>{currentApp.appType}</span>
                  <span>•</span>
                  <span>{currentApp.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{currentApp.name}</h3>
                <p className="text-xs text-slate-400 font-sans mt-1">{currentApp.description}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center min-w-[140px]">
                <span className="text-[10px] text-slate-400 block">Monthly API Quota</span>
                <span className="text-base font-bold text-emerald-400">
                  {currentApp.monthlyApiRequests.toLocaleString()} / 500,000
                </span>
              </div>
            </div>

            {/* API Keys Subpanel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>API Keys & OAuth Secret Credentials</span>
                </h4>

                <button
                  onClick={handleCreateApiKey}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Generate Key</span>
                </button>
              </div>

              <div className="space-y-3">
                {filteredKeys.length > 0 ? (
                  filteredKeys.map(key => (
                    <div key={key.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-xs">{key.label}</span>
                          <span className="text-[10px] text-slate-500">• Created: {key.createdAt}</span>
                        </div>
                        <div className="text-emerald-400 font-mono text-xs">{key.keyPrefix}</div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {key.scopes.map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] text-slate-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyKey(key.id, key.keyPrefix)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0"
                      >
                        {copiedKeyId === key.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied Token</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Token</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 text-slate-500 text-center">
                    No active API keys generated for this application yet.
                  </div>
                )}
              </div>
            </div>

            {/* Webhook Endpoints Subpanel */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Event Webhook Endpoints</span>
                </h4>

                <button
                  onClick={handleCreateWebhook}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Webhook</span>
                </button>
              </div>

              <div className="space-y-3">
                {filteredWebhooks.length > 0 ? (
                  filteredWebhooks.map(hook => (
                    <div key={hook.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-xs truncate max-w-xs">{hook.targetUrl}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                          {hook.status} ({hook.successRate}% Success)
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        Secret: <span className="text-emerald-400 font-mono">{hook.secretToken}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {hook.eventsSubscribed.map(evt => (
                          <span key={evt} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] text-amber-300">
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 text-slate-500 text-center">
                    No webhooks registered for this app.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
