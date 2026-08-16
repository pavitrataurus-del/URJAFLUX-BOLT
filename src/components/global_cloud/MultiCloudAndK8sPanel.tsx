import { useState } from "react";
import { 
  Cloud, 
  Layers, 
  FileCode, 
  Server, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  Lock, 
  Cpu, 
  Globe 
} from "lucide-react";
import { CloudProviderProfile, KubernetesResourceDef, IaCTemplate } from "../../types/globalCloudPlatform";
import { 
  CLOUD_PROVIDER_PROFILES, 
  KUBERNETES_RESOURCE_TEMPLATES, 
  IAC_TEMPLATES 
} from "../../services/global_cloud/globalCloudService";

export const MultiCloudAndK8sPanel = () => {
  const [providers] = useState<CloudProviderProfile[]>(CLOUD_PROVIDER_PROFILES);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(CLOUD_PROVIDER_PROFILES[0].id);
  const [k8sResources] = useState<KubernetesResourceDef[]>(KUBERNETES_RESOURCE_TEMPLATES);
  const [selectedK8sKind, setSelectedK8sKind] = useState<string>(KUBERNETES_RESOURCE_TEMPLATES[1].kind);
  const [iacTemplates] = useState<IaCTemplate[]>(IAC_TEMPLATES);
  const [selectedIacId, setSelectedIacId] = useState<string>(IAC_TEMPLATES[0].id);

  const [copiedCodeId, setCopiedCodeId] = useState("");

  const currentProvider = providers.find(p => p.id === selectedProviderId) || providers[0];
  const currentK8s = k8sResources.find(k => k.kind === selectedK8sKind) || k8sResources[0];
  const currentIac = iacTemplates.find(i => i.id === selectedIacId) || iacTemplates[0];

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(""), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
            <Cloud className="w-4 h-4" />
            <span>MODULES 1, 2 & 3 • MULTI-CLOUD, KUBERNETES & IAC PLATFORM</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Cloud Abstraction, K8s Descriptors & Infrastructure as Code</h2>
          <p className="text-xs text-slate-400 mt-1">
            Provider abstraction layer across GCP, Azure, AWS, and Private Kubernetes with production manifests and Terraform/Helm/Kustomize templates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-xs">
            4 PROVIDERS ACTIVE
          </span>
        </div>
      </div>

      {/* SECTION 1: CLOUD PROVIDER SELECTION MATRIX */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Supported Deployment Cloud Targets</span>
          <span className="text-sky-400 font-bold">Module 1 • Multi-Cloud Abstraction</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providers.map(p => {
            const isSelected = selectedProviderId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProviderId(p.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected 
                    ? "bg-slate-950 border-sky-500 shadow-lg shadow-sky-500/10" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-300 font-bold">{p.id}</span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] font-bold">
                    {p.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{p.name}</h4>

                <div className="text-[10px] text-slate-400 space-y-1 pt-2 border-t border-slate-850 font-sans">
                  <div>Engine: <strong className="text-slate-200">{p.managedKubernetesEngine}</strong></div>
                  <div>Secret Vault: <span className="text-sky-300">{p.secretManagerService}</span></div>
                  <div>Regions: <span className="text-amber-300">{p.regionCount} Available</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Provider Details */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
          <div>
            <span className="text-sky-400 font-bold block">{currentProvider.name} Capability Spec</span>
            <p className="text-slate-400 text-xs font-sans mt-0.5">Primary Default Region: {currentProvider.defaultRegion}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {currentProvider.supportedCapabilities.map(cap => (
              <span key={cap} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sky-300 text-[10px] font-bold">
                ✓ {cap}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: KUBERNETES MANIFEST DESCRIPTORS */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" />
            <span>Module 2 • Kubernetes Platform Artifacts</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {k8sResources.map(res => (
              <button
                key={res.kind}
                onClick={() => setSelectedK8sKind(res.kind)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  selectedK8sKind === res.kind 
                    ? "bg-sky-600/20 text-sky-300 border-sky-500" 
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {res.kind}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-sky-400 font-bold text-sm">{currentK8s.kind} Spec ({currentK8s.name})</span>
              <p className="text-slate-400 text-xs font-sans mt-0.5">
                Target Namespace: <code className="text-amber-300 font-mono">{currentK8s.namespace}</code>
                {currentK8s.replicas && ` • Replicas: ${currentK8s.replicas}`}
                {currentK8s.cpuRequest && ` • CPU Req/Limit: ${currentK8s.cpuRequest}/${currentK8s.cpuLimit}`}
              </p>
            </div>

            <button
              onClick={() => handleCopyCode(`K8S-${currentK8s.kind}`, currentK8s.yamlContent)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCodeId === `K8S-${currentK8s.kind}` ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-sky-400">Copied YAML</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy K8s Manifest</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-850 text-sky-300 overflow-x-auto text-xs leading-relaxed max-h-72">
            <code>{currentK8s.yamlContent}</code>
          </pre>
        </div>
      </div>

      {/* SECTION 3: INFRASTRUCTURE AS CODE (TERRAFORM / HELM / KUSTOMIZE) */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>Module 3 • Infrastructure as Code (IaC) Templates</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {iacTemplates.map(iac => (
              <button
                key={iac.id}
                onClick={() => setSelectedIacId(iac.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  selectedIacId === iac.id 
                    ? "bg-sky-600/20 text-sky-300 border-sky-500" 
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {iac.tool}: {iac.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-sky-400 font-bold text-sm">{currentIac.name} ({currentIac.tool})</span>
              <p className="text-slate-400 text-xs font-sans mt-0.5">File Path: <code className="text-emerald-300">{currentIac.filePath}</code></p>
            </div>

            <button
              onClick={() => handleCopyCode(currentIac.id, currentIac.content)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedCodeId === currentIac.id ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-sky-400">Copied Template</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy IaC Template</span>
                </>
              )}
            </button>
          </div>

          {currentIac.requiresRealCredentials && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-200 text-xs font-sans">
              ⚠️ <strong>External Credential Requirement:</strong> Executing this Terraform manifest requires active credentials:{" "}
              {currentIac.requiredCredentialsList.map(c => <code key={c} className="text-amber-300 font-mono mx-1">{c}</code>)}
            </div>
          )}

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-850 text-sky-300 overflow-x-auto text-xs leading-relaxed max-h-80">
            <code>{currentIac.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
