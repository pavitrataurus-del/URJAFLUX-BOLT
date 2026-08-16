import React, { useState } from "react";
import { Client } from "../../types/app";
import { Settings, Save, CheckCircle, ShieldAlert, Key } from "lucide-react";

interface ClientSettingsProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => Promise<any>;
}

export const ClientSettings: React.FC<ClientSettingsProps> = ({ client, onUpdateClient }) => {
  const [preferredLang, setPreferredLang] = useState(client.language || "English");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [portalAccess, setPortalAccess] = useState("Viewer");
  const [slaLevel, setSlaLevel] = useState("Standard");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedClient: Client = {
        ...client,
        language: preferredLang,
        status: client.status // keep same
      };
      await onUpdateClient(updatedClient);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error committing client parameters:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            Client Configuration Parameters & SLAs
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            ADJUST PORTAL PERMISSIONS, WEBHOOKS, AND DISPATCH channels FOR THE INDIVIDUAL DOSSIER
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-emerald-400 animate-fade">
              <CheckCircle className="w-3.5 h-3.5" />
              COMMITTED
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span>{saving ? "SAVING..." : "COMMIT SETTINGS"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Box 1: Notifications & Dispatches */}
        <div className="p-5 bg-white/35 border border-slate-200 rounded-xl space-y-4">
          <h4 className="text-[10.5px] font-mono text-emerald-400 uppercase tracking-widest border-b border-slate-950 pb-2 font-bold">
            Real-time Dispatch Configurations
          </h4>

          <div className="space-y-3 pt-1">
            {/* Email Dispatch */}
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-slate-700">Email dispatch on Report Generation</span>
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="rounded border-slate-200 text-emerald-600 focus:ring-indigo-500/30 bg-slate-50 h-4 w-4"
              />
            </label>

            {/* SMS Dispatch */}
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-slate-700">SMS dispatch for follow-ups</span>
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="rounded border-slate-200 text-emerald-600 focus:ring-indigo-500/30 bg-slate-50 h-4 w-4"
              />
            </label>

            {/* WhatsApp Dispatch */}
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-slate-700">WhatsApp real-time Vedic remedies digests</span>
              <input
                type="checkbox"
                checked={notifyWhatsApp}
                onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                className="rounded border-slate-200 text-emerald-600 focus:ring-indigo-500/30 bg-slate-50 h-4 w-4"
              />
            </label>
          </div>
        </div>

        {/* Box 2: Service SLAs & Portal */}
        <div className="p-5 bg-white/35 border border-slate-200 rounded-xl space-y-4">
          <h4 className="text-[10.5px] font-mono text-emerald-400 uppercase tracking-widest border-b border-slate-950 pb-2 font-bold">
            SLA Tiers & Portal Controls
          </h4>

          <div className="space-y-3">
            {/* Portal Role */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Portal Access Role</label>
              <select
                value={portalAccess}
                onChange={(e) => setPortalAccess(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="Viewer">Viewer (Read-Only)</option>
                <option value="Collaborator">Collaborator (Upload Floor Plans)</option>
                <option value="Admin">Administrator (Complete Workspace Access)</option>
              </select>
            </div>

            {/* SLA Level */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Consultancy SLA Tier</label>
              <select
                value={slaLevel}
                onChange={(e) => setSlaLevel(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="Standard">Standard Consultations (72hr turnaround)</option>
                <option value="Priority">Priority Reconciliations (24hr turnaround)</option>
                <option value="Enterprise">Enterprise Elite Alpha (Instantaneous AI Support)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClientSettings;
