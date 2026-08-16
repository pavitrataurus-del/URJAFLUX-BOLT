// Module 8: Webhook Management Console UI
import React, { useState } from "react";
import {
  Globe,
  RotateCcw,
  Key,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Send,
  ShieldCheck
} from "lucide-react";
import { WebhookEndpointSubscription, WebhookDeliveryLog } from "../../types/integrationPlatform";
import { WebhookPlatformService } from "../../core/integration/WebhookPlatformService";

export const WebhookManagementConsole: React.FC = () => {
  const [subs, setSubs] = useState<WebhookEndpointSubscription[]>(() =>
    WebhookPlatformService.getSubscriptions()
  );
  const [logs, setLogs] = useState<WebhookDeliveryLog[]>(() =>
    WebhookPlatformService.getDeliveryLogs()
  );
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [rotatedSecret, setRotatedSecret] = useState<string | null>(null);

  const refreshWebhooks = () => {
    setSubs(WebhookPlatformService.getSubscriptions());
    setLogs(WebhookPlatformService.getDeliveryLogs());
  };

  const handleRegisterWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    WebhookPlatformService.registerWebhook("tenant_org_01", targetUrl, ["project.imported", "analysis.finished"]);
    setTargetUrl("");
    refreshWebhooks();
  };

  const handleRotateSecret = (id: string) => {
    const sec = WebhookPlatformService.rotateSecretKey(id);
    if (sec) setRotatedSecret(sec);
    refreshWebhooks();
  };

  const handleDispatchTestWebhook = () => {
    WebhookPlatformService.dispatchWebhookEvent("analysis.finished", {
      projectId: "PRJ-CAD-8801",
      complianceScore: 94.5
    });
    refreshWebhooks();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Module 8
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              HMAC SHA-256 Signed
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Enterprise Webhook Platform Console
          </h2>
          <p className="text-xs text-slate-300">
            Incoming & outgoing webhooks, HMAC SHA-256 signature validation, secret key rotation, and delivery logs.
          </p>
        </div>

        <button
          onClick={handleDispatchTestWebhook}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <Send className="w-3.5 h-3.5" /> Dispatch Test Payload
        </button>
      </div>

      {/* Subscriptions */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" /> Webhook Subscriptions ({subs.length})
        </h3>

        <form onSubmit={handleRegisterWebhook} className="flex gap-3">
          <input
            type="url"
            placeholder="https://api.corporate-dms.com/v1/urjaflux-webhooks"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Register Subscription
          </button>
        </form>

        {rotatedSecret && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-mono">
            Rotated Signing Secret Key: {rotatedSecret}
          </div>
        )}

        <div className="space-y-2">
          {subs.map((s) => (
            <div key={s.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 font-mono block">{s.targetUrl}</span>
                <span className="text-slate-500 text-[11px]">Subscribed Events: {s.subscribedEvents.join(", ")}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-bold">{s.deliverySuccessCount} Deliveries</span>
                <button
                  onClick={() => handleRotateSecret(s.id)}
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px]"
                >
                  Rotate Secret
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Logs */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Webhook Delivery Audit Logs</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Response Code</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Signature Header</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{l.id}</td>
                  <td className="p-3 font-sans text-indigo-700 font-semibold">{l.eventTopic}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      HTTP {l.responseCode}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 font-sans">{l.durationMs} ms</td>
                  <td className="p-3 text-slate-400 text-[10px] truncate max-w-[200px]">{l.signatureHeader}</td>
                  <td className="p-3 text-slate-400 font-sans text-[11px]">{new Date(l.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
