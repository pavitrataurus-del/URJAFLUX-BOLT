// Module 7: Public API Platform V2 & Developer Portal UI
import React, { useState } from "react";
import {
  Code,
  Key,
  Globe,
  Copy,
  Check,
  Plus,
  Shield,
  FileCode,
  Terminal,
  RefreshCw
} from "lucide-react";
import { ApiV2Endpoint, ApiKeyCredentialV2 } from "../../types/integrationPlatform";
import { PublicApiPlatformV2 } from "../../core/integration/PublicApiPlatformV2";

export const DeveloperPortalApiView: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyCredentialV2[]>(() =>
    PublicApiPlatformV2.getApiKeys()
  );
  const endpoints = PublicApiPlatformV2.getEndpoints();
  const [newKeyName, setNewKeyName] = useState<string>("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const res = PublicApiPlatformV2.createApiKey(
      "tenant_org_01",
      newKeyName,
      ["read:projects", "write:analysis", "read:knowledge", "execute:plugins"],
      "ENTERPRISE"
    );

    setCreatedSecret(res.secretKey);
    setApiKeys(PublicApiPlatformV2.getApiKeys());
    setNewKeyName("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Module 7
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              OpenAPI 3.0 V2
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Public API Platform V2 & Developer Portal
          </h2>
          <p className="text-xs text-slate-300">
            Issue API Keys, configure OAuth scopes, enforce sliding window rate limits, and inspect OpenAPI specifications.
          </p>
        </div>
      </div>

      {/* API Key Creation Form */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-600" /> Issue New Enterprise API Key
        </h3>

        <form onSubmit={handleCreateApiKey} className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. Production CAD Pipeline Ingestion Key"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Issue Key
          </button>
        </form>

        {createdSecret && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-amber-900 block">Copy Secret Key (Will not be shown again):</span>
            <div className="flex items-center justify-between font-mono text-xs text-amber-950 bg-white p-2 rounded border border-amber-300">
              <span>{createdSecret}</span>
              <button onClick={() => copyToClipboard(createdSecret)} className="text-indigo-600 hover:text-indigo-800">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active API Keys */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Developer API Keys ({apiKeys.length})</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Key Name</th>
                <th className="p-3">Prefix</th>
                <th className="p-3">Rate Limit Tier</th>
                <th className="p-3">Scopes</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiKeys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{k.keyName}</td>
                  <td className="p-3 font-mono text-slate-600">{k.keyPrefix}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                      {k.rateLimitTier}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">{k.scopes.join(", ")}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {k.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OpenAPI Endpoints Catalog */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Public API V2 OpenAPI Endpoints</h3>
        <div className="space-y-2">
          {endpoints.map((ep) => (
            <div key={ep.path} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded font-bold text-[10px] ${
                  ep.method === "GET" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono font-bold text-slate-900">{ep.path}</span>
                <span className="text-slate-500">{ep.summary}</span>
              </div>

              <span className="text-slate-400 font-mono text-[11px]">Scope: {ep.requiredScope} ({ep.rateLimitPerMinute} req/min)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
