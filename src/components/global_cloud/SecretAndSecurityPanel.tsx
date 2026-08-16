import { useState } from "react";
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Cpu 
} from "lucide-react";
import { SecretVaultRecord, InfrastructureSecurityPolicy } from "../../types/globalCloudPlatform";
import { SECRET_VAULT_RECORDS, INFRASTRUCTURE_SECURITY_POLICIES } from "../../services/global_cloud/globalCloudService";

export const SecretAndSecurityPanel = () => {
  const [secrets, setSecrets] = useState<SecretVaultRecord[]>(SECRET_VAULT_RECORDS);
  const [policies] = useState<InfrastructureSecurityPolicy[]>(INFRASTRUCTURE_SECURITY_POLICIES);
  const [rotatingKey, setRotatingKey] = useState("");
  const [rotationMessage, setRotationMessage] = useState("");

  const handleRotateSecret = (secretKey: string) => {
    setRotatingKey(secretKey);
    setRotationMessage(`Triggering key rotation for ${secretKey} across secret engine...`);
    setTimeout(() => {
      setSecrets(prev => prev.map(s => {
        if (s.secretKey === secretKey) {
          const verNum = parseInt(s.version.replace('v', '')) + 1;
          return {
            ...s,
            version: `v${verNum}`,
            lastRotatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return s;
      }));
      setRotatingKey("");
      setRotationMessage(`Successfully rotated ${secretKey}! New key version deployed.`);
      setTimeout(() => setRotationMessage(""), 3500);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
            <Lock className="w-4 h-4" />
            <span>MODULES 6 & 8 • SECRET MANAGEMENT & ZERO TRUST SECURITY</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Vault Secret Engines & Workload Identity Federation</h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated key rotation across Google Cloud Secret Manager, Azure Key Vault, AWS Secrets Manager, and Kyverno image signing policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-xs">
            100% ZERO TRUST ENFORCED
          </span>
        </div>
      </div>

      {/* SECTION 1: SECRET VAULT ENGINE & ROTATION SCHEDULE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Multi-Vault Encryption Keys & Auto-Rotation</span>
            <span className="text-sky-400 font-bold">Module 6 • Secret Management</span>
          </h3>

          {rotationMessage && (
            <span className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold animate-pulse">
              {rotationMessage}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {secrets.map(secret => (
            <div key={secret.secretKey} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold">
                  {secret.version}
                </span>
                <span className="text-[10px] text-amber-300 font-bold">{secret.environment}</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white break-all">{secret.secretKey}</h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">{secret.vaultEngine}</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Rotated:</span>
                  <span className="text-emerald-300 font-bold">{secret.lastRotatedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rotation Schedule:</span>
                  <span className="text-slate-200">Every {secret.autoRotationDays} Days</span>
                </div>
                <div className="pt-1 border-t border-slate-800 text-[9px] text-slate-400 truncate">
                  Ref: <span className="text-sky-300">{secret.encryptedRef}</span>
                </div>
              </div>

              <button
                disabled={rotatingKey === secret.secretKey}
                onClick={() => handleRotateSecret(secret.secretKey)}
                className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${rotatingKey === secret.secretKey ? "animate-spin text-sky-400" : ""}`} />
                <span>Rotate Secret Key</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: WORKLOAD IDENTITY & POD SECURITY POLICIES */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Module 8 • Infrastructure Security & Workload Identity Matrix</span>
        </h3>

        <div className="space-y-3">
          {policies.map(pol => (
            <div key={pol.policyId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">{pol.policyId}</span>
                  <h4 className="text-sm font-bold text-white">{pol.name}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    ✓ {pol.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-bold">
                    {pol.standard}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans">{pol.details}</p>

              {pol.requiresExternalSigner && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-amber-200 text-xs font-sans mt-2">
                  ⚠️ <strong>External Security Requirement:</strong> Container cryptographic image signature verification requires an operational connection to: <code className="text-amber-300 font-mono">{pol.externalServiceDependency}</code>.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
