import React, { useState } from "react";
import { 
  Key, 
  Monitor, 
  Terminal, 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertTriangle, 
  Download, 
  Laptop, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  ExternalLink
} from "lucide-react";
import { LicenseRecord, DesktopPackagingConfig } from "../../types/customerLifecycle";
import { INITIAL_LICENSES, DESKTOP_PACKAGING_SPECS, generateOfflineLicenseToken } from "../../services/customer_lifecycle/customerLifecycleService";

export const LicenseAndDesktopPanel: React.FC = () => {
  const [licenses, setLicenses] = useState<LicenseRecord[]>(INITIAL_LICENSES);
  const [packagingSpecs] = useState<DesktopPackagingConfig[]>(DESKTOP_PACKAGING_SPECS);
  const [activeTab, setActiveTab] = useState<"LICENSES" | "DESKTOP_DISTRIBUTION" | "TOKEN_GENERATOR">("LICENSES");

  // License Generator State
  const [genOrgName, setGenOrgName] = useState("Acme Global Energy");
  const [genTier, setGenTier] = useState<LicenseRecord["tier"]>("ENTERPRISE_LTS");
  const [genSeats, setGenSeats] = useState(100);
  const [genExpDays, setGenExpDays] = useState(365);
  const [generatedResult, setGeneratedResult] = useState<{ token: string; validationHash: string; signature: string } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleGenerateLicense = () => {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + genExpDays);
    const result = generateOfflineLicenseToken(genOrgName, genTier, genSeats, expDate.toISOString().split("T")[0]);
    setGeneratedResult(result);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("LICENSES")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "LICENSES"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Enterprise Licenses ({licenses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("TOKEN_GENERATOR")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "TOKEN_GENERATOR"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Offline License Generator</span>
          </button>
          <button
            onClick={() => setActiveTab("DESKTOP_DISTRIBUTION")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "DESKTOP_DISTRIBUTION"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop Application Packaging</span>
          </button>
        </div>

        <div className="text-xs font-mono text-emerald-400 flex items-center gap-2 pr-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Cryptographic Offline RSA Signature Validation</span>
        </div>
      </div>

      {/* MODULE 3: LICENSES VIEW */}
      {activeTab === "LICENSES" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {licenses.map(lic => (
              <div key={lic.licenseId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                      {lic.status}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 font-mono">{lic.orgName}</h3>
                    <p className="text-xs text-slate-400">License ID: {lic.licenseId}</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-slate-950 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold">
                    {lic.tier}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Seat Utilization ({lic.seatsUsed} / {lic.seatsAllocated} Seats):</span>
                    <span className="text-white font-bold">{Math.round((lic.seatsUsed / lic.seatsAllocated) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(lic.seatsUsed / lic.seatsAllocated) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Activation Key:</span>
                    <span className="text-amber-300 font-bold">{lic.activationKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Issued / Expires:</span>
                    <span className="text-slate-200">{lic.issuedAt} → {lic.expiresAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Offline Validation:</span>
                    <span className="text-emerald-400">{lic.offlineValidationEnabled ? "ENABLED (RSA 2048)" : "DISABLED"}</span>
                  </div>
                </div>

                {/* Registered Devices */}
                <div className="border-t border-slate-800/80 pt-3 space-y-2">
                  <div className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                    <span>Registered Workstation Devices ({lic.registeredDevices.length})</span>
                    <span className="text-[10px] text-slate-500">Device Lock Enforced</span>
                  </div>
                  <div className="space-y-1.5">
                    {lic.registeredDevices.map(dev => (
                      <div key={dev.deviceId} className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/50 text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-slate-200 font-bold">{dev.deviceName}</span>
                          <span className="text-slate-500">({dev.os})</span>
                        </div>
                        <span className="text-slate-400 text-[10px]">{dev.lastPing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOKEN GENERATOR VIEW */}
      {activeTab === "TOKEN_GENERATOR" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span>Offline Cryptographic License Token Generator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Generates offline air-gapped activation keys verified using embedded RSA public key signatures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Customer / Organization Name</label>
              <input
                type="text"
                value={genOrgName}
                onChange={e => setGenOrgName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">License Tier</label>
              <select
                value={genTier}
                onChange={e => setGenTier(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ENTERPRISE_LTS">ENTERPRISE LTS (Unlimited Nodes)</option>
                <option value="GLOBAL_OPERATIONS">GLOBAL OPERATIONS (Multi-Site)</option>
                <option value="PLATINUM_SUITE">PLATINUM SUITE</option>
                <option value="TRIAL_30_DAY">TRIAL 30-DAY EVALUATION</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Seats Allocated</label>
              <input
                type="number"
                value={genSeats}
                onChange={e => setGenSeats(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">License Validity Duration</label>
              <select
                value={genExpDays}
                onChange={e => setGenExpDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={30}>30 Days Trial</option>
                <option value={180}>180 Days (6 Months)</option>
                <option value={365}>365 Days (1 Year)</option>
                <option value={1095}>1095 Days (3 Year Enterprise LTS)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateLicense}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>Generate RSA Cryptographic License Payload</span>
          </button>

          {generatedResult && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                <span>Cryptographic Air-Gapped License Payload</span>
                <button
                  onClick={() => handleCopy(generatedResult.token)}
                  className="px-3 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? "Copied!" : "Copy Token"}</span>
                </button>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block mb-1">Encrypted License Token Payload:</span>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-amber-300 break-all">
                  {generatedResult.token}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">SHA-256 Validation Hash:</span>
                  <div className="text-slate-300 truncate mt-0.5">{generatedResult.validationHash}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">RSA Signature:</span>
                  <div className="text-emerald-400 truncate mt-0.5">{generatedResult.signature}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 4: DESKTOP APPLICATION DISTRIBUTION */}
      {activeTab === "DESKTOP_DISTRIBUTION" && (
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <span className="font-bold font-mono">DEPLOYMENT CLASSIFICATION: SPECIFICATION_READY & REQUIRES_BUILD_RUNNER</span>
              <p className="mt-1">
                Desktop package installers (.msi, .pkg, .deb) and silent deployment CLI configurations are fully specified below. Note that actual binary compilation and EV code signing require external GitHub Actions / Azure DevOps CI runners equipped with Windows SignTool, Apple Developer Notarization keys, and Linux GPG keys.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {packagingSpecs.map(spec => (
              <div key={spec.platform} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-bold text-white font-mono">{spec.appName}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Platform Target: {spec.platform} • Version: {spec.version}</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                    {spec.packagingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Installer Builder Toolchain:</span>
                    <span className="text-slate-200 font-bold">{spec.installerBuilder}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Auto Config File Injection Path:</span>
                    <span className="text-amber-300 font-bold">{spec.autoConfigPath}</span>
                  </div>

                  <div className="col-span-2 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Silent Enterprise Unattended Installation Command:</span>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                      {spec.silentInstallCommand}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Repair Installation Command:</span>
                    <span className="text-slate-300">{spec.repairCommand}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Uninstall Command:</span>
                    <span className="text-rose-300">{spec.uninstallCommand}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>External Build Infrastructure Dependency:</span>
                  <span className="text-amber-300 font-bold">{spec.externalInfraDependency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
