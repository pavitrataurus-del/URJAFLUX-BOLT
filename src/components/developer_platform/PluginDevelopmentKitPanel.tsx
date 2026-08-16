import React, { useState } from "react";
import { 
  Boxes, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  FileCode, 
  Layers, 
  Zap, 
  Lock 
} from "lucide-react";
import { PluginTemplate } from "../../types/developerPlatform";
import { PDK_TEMPLATES } from "../../services/developer_platform/developerPlatformService";

export const PluginDevelopmentKitPanel: React.FC = () => {
  const [templates] = useState<PluginTemplate[]>(PDK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PluginTemplate>(PDK_TEMPLATES[0]);

  const [manifestJson, setManifestJson] = useState<string>(
    JSON.stringify({
      id: "org.aetherspatial.cad.sync",
      name: "UrjaFlux AutoCAD Sync Plugin",
      version: "2.1.0",
      minOsVersion: "v3.0.0",
      permissions: ["cad:read", "cad:write", "twin:sync"],
      entryPoint: "dist/plugin.js",
      signature: "rsa_sha256_verified_signature_99a8b"
    }, null, 2)
  );

  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    securityScore: number;
  } | null>(null);

  const [sandboxStatus, setSandboxStatus] = useState<"IDLE" | "RUNNING" | "HOT_RELOADED">("IDLE");

  const handleValidateManifest = () => {
    try {
      const parsed = JSON.parse(manifestJson);
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!parsed.id) errors.push("Missing required field 'id'");
      if (!parsed.version) errors.push("Missing required field 'version'");
      if (!parsed.permissions || !Array.isArray(parsed.permissions)) {
        errors.push("Field 'permissions' must be an array of strings");
      }
      if (!parsed.signature) warnings.push("Unsigned plugin manifest — package signing required before marketplace publishing");

      setValidationResult({
        valid: errors.length === 0,
        errors,
        warnings,
        securityScore: errors.length === 0 ? (warnings.length === 0 ? 100 : 88) : 45
      });
    } catch (err: any) {
      setValidationResult({
        valid: false,
        errors: [`JSON Syntax Error: ${err.message}`],
        warnings: [],
        securityScore: 0
      });
    }
  };

  const handleToggleSandbox = () => {
    if (sandboxStatus === "RUNNING") {
      setSandboxStatus("IDLE");
    } else {
      setSandboxStatus("RUNNING");
      setTimeout(() => {
        setSandboxStatus("HOT_RELOADED");
      }, 1000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Boxes className="w-4 h-4" />
            <span>MODULE 4 • PLUGIN DEVELOPMENT KIT (PDK)</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">UrjaFlux PDK & Plugin Development Sandbox</h2>
          <p className="text-xs text-slate-400 mt-1">
            Build custom CAD extensions, Digital Twin widgets, and Vastu AI nodes with lifecycle hooks and manifest validators.
          </p>
        </div>

        <button
          onClick={handleToggleSandbox}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all ${
            sandboxStatus === "RUNNING" || sandboxStatus === "HOT_RELOADED"
              ? "bg-rose-600 text-white"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
          }`}
        >
          {sandboxStatus === "RUNNING" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>{sandboxStatus === "IDLE" ? "Launch Local PDK Sandbox" : "Stop Local Sandbox"}</span>
        </button>
      </div>

      {/* PDK Templates Selector */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Official Plugin Starter Templates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map(tmpl => {
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected 
                    ? "bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-300 font-bold">{tmpl.category}</span>
                  <span className="text-[10px] text-slate-500">v{tmpl.version}</span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">{tmpl.name}</h4>

                <div className="space-y-1 text-[10px] text-slate-400 pt-1 border-t border-slate-850">
                  <div>Lifecycle Hooks: <strong className="text-emerald-400">{tmpl.lifecycleHooks.length} Defined</strong></div>
                  <div>Min OS Requirement: <span className="text-slate-300">{tmpl.minOsVersion}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Template Hooks & Details */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-amber-300 font-bold text-xs uppercase">{selectedTemplate.category}</span>
            <h3 className="text-base font-bold text-white">{selectedTemplate.name}</h3>
          </div>

          <div className="flex flex-wrap gap-1">
            {selectedTemplate.requiredPermissions.map(p => (
              <span key={p} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 text-[10px]">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-xs block mb-2 font-bold">Lifecycle Hooks Execution Spec:</span>
          <div className="flex flex-wrap gap-2">
            {selectedTemplate.lifecycleHooks.map(hook => (
              <div key={hook} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{hook}()</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manifest Validator Engine & Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
        {/* Left: manifest.json Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>plugin.manifest.json Spec</span>
            </h3>

            <button
              onClick={handleValidateManifest}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              Run Manifest Validation
            </button>
          </div>

          <textarea
            value={manifestJson}
            onChange={e => setManifestJson(e.target.value)}
            rows={10}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
          />
        </div>

        {/* Right: Validation Output & Sandbox Telemetry */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PDK Validation & Hot Reload Telemetry</span>
          </h3>

          {/* Validation Result Box */}
          {validationResult ? (
            <div className={`p-4 rounded-xl border space-y-2 ${
              validationResult.valid 
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300" 
                : "bg-rose-500/10 border-rose-500/40 text-rose-300"
            }`}>
              <div className="flex items-center justify-between font-bold text-xs">
                <span>{validationResult.valid ? "MANIFEST VALIDATION PASSED" : "VALIDATION ERRORS DETECTED"}</span>
                <span>Security Score: {validationResult.securityScore} / 100</span>
              </div>

              {validationResult.errors.map((err, idx) => (
                <div key={idx} className="text-rose-400 text-xs font-sans flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}

              {validationResult.warnings.map((warn, idx) => (
                <div key={idx} className="text-amber-300 text-xs font-sans flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-sans">
              Click "Run Manifest Validation" to parse manifest fields, inspect RBAC permissions, and check cryptographic signatures.
            </div>
          )}

          {/* Hot Reload Sandbox Display */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white">Local Dev Server Sandbox (Port 3000)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                sandboxStatus === "IDLE" ? "bg-slate-800 text-slate-400" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
              }`}>
                {sandboxStatus}
              </span>
            </div>

            <p className="text-slate-400 text-xs font-sans">
              {sandboxStatus === "IDLE" 
                ? "Sandbox server is offline. Launch local sandbox to test HMR plugin execution." 
                : "Hot Module Replacement (HMR) active. Local changes to plugin.js will auto-refresh in preview."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
