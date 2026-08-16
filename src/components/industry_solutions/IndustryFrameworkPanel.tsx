import { useState } from "react";
import { 
  Layers, 
  Settings2, 
  Shield, 
  CheckCircle2, 
  Key, 
  Sliders, 
  Globe, 
  Boxes, 
  Sparkles, 
  Copy 
} from "lucide-react";
import { IndustrySolutionMetadata } from "../../types/industrySolutions";
import { INDUSTRY_SOLUTION_PACKS } from "../../services/industry_solutions/industrySolutionsService";

export const IndustryFrameworkPanel = () => {
  const [packs, setPacks] = useState<IndustrySolutionMetadata[]>(INDUSTRY_SOLUTION_PACKS);
  const [selectedPackId, setSelectedPackId] = useState<string>(INDUSTRY_SOLUTION_PACKS[0].id);
  const [copiedConfigId, setCopiedConfigId] = useState("");

  const currentPack = packs.find(p => p.id === selectedPackId) || packs[0];

  const handleToggleFeatureFlag = (flagKey: string) => {
    setPacks(prev => prev.map(p => {
      if (p.id === selectedPackId) {
        return {
          ...p,
          featureFlags: {
            ...p.featureFlags,
            [flagKey]: !p.featureFlags[flagKey]
          }
        };
      }
      return p;
    }));
  };

  const handleCopyPackConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPack, null, 2));
    setCopiedConfigId(currentPack.id);
    setTimeout(() => setCopiedConfigId(""), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>MODULE 1 • REUSABLE INDUSTRY SOLUTION ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Industry Solution Framework & Multi-Tenant Registries</h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero-code solution registration, feature flag overrides, theme profiles, role presets, and module activation across all 9 industry domains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">
            9 INDUSTRY PACKS REGISTERED
          </span>
        </div>
      </div>

      {/* INDUSTRY PACK SELECTION GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Registered Industry Solution Packs</span>
          <span className="text-amber-400 font-bold">Configurable Infrastructure</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {packs.map(p => {
            const isSelected = selectedPackId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPackId(p.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected 
                    ? "bg-slate-950 border-amber-500 shadow-lg shadow-amber-500/10" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-300 font-bold">{p.industryId}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                    {p.version}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white">{p.name}</h4>
                <p className="text-[10px] text-slate-400 font-sans line-clamp-2">{p.tagline}</p>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                  <span>Licensing: <strong className="text-slate-200">{p.licensingTier}</strong></span>
                  <span className="text-amber-400 font-bold">✓ Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED PACK CONFIGURATION EDITOR */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-5 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                {currentPack.id}
              </span>
              <h3 className="text-sm font-bold text-white">{currentPack.name} Configuration</h3>
            </div>
            <p className="text-slate-400 text-xs font-sans mt-0.5">{currentPack.description}</p>
          </div>

          <button
            onClick={handleCopyPackConfig}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copiedConfigId === currentPack.id ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">Copied Config JSON</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Pack JSON</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Feature Flags Toggle Section */}
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Industry Feature Flags</span>
            </h4>

            <div className="space-y-2 font-sans text-xs">
              {Object.entries(currentPack.featureFlags).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-200 font-mono text-[11px]">{key}</span>
                  <button
                    onClick={() => handleToggleFeatureFlag(key)}
                    className={`px-3 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                      enabled 
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                        : "bg-slate-900 text-slate-500 border-slate-800"
                    }`}
                  >
                    {enabled ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Role Presets & Module Activations */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Configured Role Presets</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentPack.rolePresets.map(role => (
                  <span key={role} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 text-[10px] font-bold font-sans">
                    👤 {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>Activated Core Modules</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentPack.moduleActivations.map(mod => (
                  <span key={mod} className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold font-sans">
                    ⚙️ {mod}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* External Dependencies */}
        {currentPack.externalDependencies.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-200 text-xs font-sans">
            ⚠️ <strong>External System Integration Dependencies:</strong> {currentPack.externalDependencies.join(" • ")}
          </div>
        )}
      </div>
    </div>
  );
};
