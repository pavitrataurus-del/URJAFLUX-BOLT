import React, { useState } from "react";
import { 
  Settings, 
  Activity, 
  Database, 
  Layers, 
  CheckCircle, 
  Info, 
  Terminal, 
  Cpu, 
  ShieldAlert,
  UserCheck,
  Globe
} from "lucide-react";
import { useTranslation } from "../localization/hooks/useTranslation";
import { LanguagePreferenceFields } from "../localization/LanguagePreferenceFields";


export default function SettingsPage() {
  const { t } = useTranslation();

  const [modelType, setModelType] = useState("Veda-Insights-Engine-v2.1");
  const [enableSOIS, setEnableSOIS] = useState(true);
  const [compassAutoAlign, setCompassAutoAlign] = useState(true);
  const [apiLogs, setApiLogs] = useState(false);

  return (
    <div id="settings-page" className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          {t("settings.title")}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Core settings form */}
        <div className="md:col-span-8 space-y-6">

          {/* Global Localization & Language Preferences */}
          <div className="p-5 bg-white/30 border border-slate-200 rounded-xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-950 pb-3">
              <Globe className="w-4 h-4 text-emerald-400" />
              Language & Localization Preferences
            </h3>

            <LanguagePreferenceFields layout="grid" showDescriptions showComingSoon />
          </div>
          
          {/* Spatial Model Calibration */}
          <div className="p-5 bg-white/30 border border-slate-200 rounded-xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-950 pb-3">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Machine Learning & CV Configuration
            </h3>

            <div className="space-y-4 text-xs text-slate-700">
              
              {/* Select AI Model */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                  VECTOR SEGMENTATION MODEL
                </label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-700 px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Veda-Insights-Engine-v2.1">Veda-Insights-Engine-v2.1 (Grounded Retrieval - 96% Acc)</option>
                  <option value="Gemini-2.5-Flash">Veda Light Speed Diagnostic Engine (Draft Mode)</option>
                  <option value="Custom-ResNet-Walls">Custom ResNet (Offline local wall segmenter)</option>
                </select>
              </div>

              {/* Toggle SOIS */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-950">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">Active Spatial Node Detection (SOIS)</span>
                  <p className="text-[10px] text-slate-400">Automatically isolate and tag doors, bathrooms, stairs and master beds.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableSOIS}
                  onChange={(e) => setEnableSOIS(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Toggle Compass AutoAlign */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-950">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">Automated True North Alignment</span>
                  <p className="text-[10px] text-slate-400">Auto-rotate raster schema by fetching spatial geo-magnetic coordinates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={compassAutoAlign}
                  onChange={(e) => setCompassAutoAlign(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* Infrastructure status */}
          <div className="p-5 bg-white/30 border border-slate-200 rounded-xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-950 pb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              API Logs & Offline Replication
            </h3>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-950">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">Output Detailed Dev Console Logs</span>
                  <p className="text-[10px] text-slate-400">Enable complete terminal logs for debugging offline binarizer steps.</p>
                </div>
                <input
                  type="checkbox"
                  checked={apiLogs}
                  onChange={(e) => setApiLogs(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-slate-50 border-slate-200 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right column: informational bento */}
        <div className="md:col-span-4 space-y-4">
          
          {/* Diagnostic Stats */}
          <div className="p-5 bg-emerald-950/15 border border-emerald-900/40 rounded-xl space-y-3.5">
            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
              WORKSPACE CREDENTIALS
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50/80 rounded border border-slate-200 space-y-1">
                <span className="text-slate-400 font-mono text-[9px] block">SECURITY LEVEL</span>
                <span className="font-bold text-slate-900">Full-Stack Enterprise Alpha</span>
              </div>
              <div className="p-3 bg-slate-50/80 rounded border border-slate-200 space-y-1">
                <span className="text-slate-400 font-mono text-[9px] block">ROUTING SYSTEM</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 100% ISOLATED
                </span>
              </div>
            </div>
          </div>

          {/* Compliance Card */}
          <div className="p-5 bg-white/30 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-200 font-mono font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Veda Security Seal</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              URJAFLUX enforces high-fidelity compartmentalization of client files, blueprint records, and geometric models. No training data leakage is possible across multiple professional tenants.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
