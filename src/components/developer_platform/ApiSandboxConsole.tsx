import React, { useState } from "react";
import { 
  Play, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  Key, 
  Activity, 
  RotateCw, 
  Copy, 
  Layers 
} from "lucide-react";
import { ApiSandboxRequest, ApiSandboxResponse } from "../../types/developerPlatform";
import { executeApiSandboxCall } from "../../services/developer_platform/developerPlatformService";

export const ApiSandboxConsole: React.FC = () => {
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
  const [endpoint, setEndpoint] = useState("/api/v3/twin/telemetry");
  const [apiKeyToken, setApiKeyToken] = useState("urja_live_9f8a7b6c5d4e3f");
  const [queryParams, setQueryParams] = useState<string>("zoneId=ZONE-NE-01");
  const [bodyJson, setBodyJson] = useState<string>(
    JSON.stringify({
      cadFileId: "CAD-2026-FLOOR-01",
      action: "EXTRACT_VASTU_HEATMAP"
    }, null, 2)
  );

  const [response, setResponse] = useState<ApiSandboxResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);

    setTimeout(() => {
      const qParamsObj: Record<string, string> = {};
      queryParams.split("&").forEach(pair => {
        const [k, v] = pair.split("=");
        if (k && v) qParamsObj[k] = v;
      });

      const req: ApiSandboxRequest = {
        endpoint,
        method,
        headers: {
          "Authorization": `Bearer ${apiKeyToken}`,
          "Content-Type": "application/json"
        },
        queryParams: qParamsObj,
        bodyJson: method === "POST" || method === "PUT" ? bodyJson : undefined
      };

      const res = executeApiSandboxCall(req);
      setResponse(res);
      setIsExecuting(false);
    }, 400);
  };

  const presetEndpoints = [
    { method: "GET", path: "/api/v3/twin/telemetry", params: "zoneId=ZONE-NE-01" },
    { method: "GET", path: "/api/v3/cad/layers", params: "fileId=CAD-2026-FLOOR-01" },
    { method: "POST", path: "/api/v3/ai/vastu-audit", params: "" }
  ];

  const handleCopyResponseBody = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.bodyData, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Send className="w-4 h-4" />
            <span>MODULE 5 • INTERACTIVE API SANDBOX & REQUEST BUILDER</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Live UrjaFlux API Testing Console</h2>
          <p className="text-xs text-slate-400 mt-1">
            Test CAD, Digital Twin, and AI Vastu endpoints, validate Authorization headers, and inspect JSON payloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 font-bold">
            ENVIRONMENT: LIVE SANDBOX
          </span>
        </div>
      </div>

      {/* Preset Endpoints Chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-slate-400 font-bold self-center mr-1">Quick Presets:</span>
        {presetEndpoints.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setMethod(p.method as any);
              setEndpoint(p.path);
              setQueryParams(p.params);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <span className="text-emerald-400 font-bold">{p.method}</span>
            <span>{p.path}</span>
          </button>
        ))}
      </div>

      {/* Request Builder Form */}
      <form onSubmit={handleSendRequest} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={method}
            onChange={e => setMethod(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <input
            type="text"
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            placeholder="/api/v3/..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
            required
          />

          <button
            type="submit"
            disabled={isExecuting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isExecuting ? (
              <RotateCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 fill-current" />
            )}
            <span>{isExecuting ? "Executing..." : "Send API Request"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-1 font-bold">Bearer API Key Token</label>
            <input
              type="text"
              value={apiKeyToken}
              onChange={e => setApiKeyToken(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">Query Parameters</label>
            <input
              type="text"
              value={queryParams}
              onChange={e => setQueryParams(e.target.value)}
              placeholder="e.g. zoneId=ZONE-NE-01&limit=10"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {(method === "POST" || method === "PUT") && (
          <div>
            <label className="block text-slate-300 mb-1 font-bold">Request JSON Body Payload</label>
            <textarea
              value={bodyJson}
              onChange={e => setBodyJson(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </form>

      {/* Response Display Panel */}
      {response && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                {response.statusCode} {response.statusText}
              </span>

              <span className="text-slate-400">Latency: <strong className="text-emerald-400">{response.latencyMs} ms</strong></span>
              <span className="text-slate-400">Rate Limit Remaining: <strong className="text-amber-300">{response.rateLimitRemaining} / 10,000</strong></span>
            </div>

            <button
              onClick={handleCopyResponseBody}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              {copiedResponse ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy JSON Payload</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-850 text-emerald-300 overflow-x-auto text-xs leading-relaxed max-h-80">
            <code>{JSON.stringify(response.bodyData, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
