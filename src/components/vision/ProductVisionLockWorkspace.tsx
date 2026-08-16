import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Cpu, 
  Compass, 
  Sparkles, 
  Wrench, 
  ArrowRight, 
  Check, 
  Ban, 
  Info, 
  Share2, 
  ListFilter,
  Eye,
  Sliders,
  Maximize2
} from "lucide-react";

import { ProductVisionLockService } from "../../services/product_vision/ProductVisionLockService";
import { VisionClassification, DesignStudioToolId } from "../../types/productVisionLock";

export const ProductVisionLockWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | "declaration"
    | "workflows"
    | "studio_tools"
    | "module_classification"
    | "anti_features"
    | "recommendations"
  >("declaration");

  const [classificationFilter, setClassificationFilter] = useState<string>("ALL");

  const report = useMemo(() => ProductVisionLockService.generateVisionLockReport(), []);

  const getClassificationBadge = (cls: VisionClassification) => {
    switch (cls) {
      case "CORE_VISION":
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Core Vision</span>;
      case "OPTIONAL":
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Optional</span>;
      case "FUTURE":
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Future Roadmap</span>;
      case "OUTSIDE_VISION":
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Outside Vision (Guarded)</span>;
    }
  };

  const filteredModules = useMemo(() => {
    if (classificationFilter === "ALL") return report.moduleAudits;
    return report.moduleAudits.filter(m => m.classification === classificationFilter);
  }, [report, classificationFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <Lock className="w-3 h-3" /> PRODUCT VISION LOCK
            </span>
            <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
              URJAFLUX AI OS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Product Vision Lock & Architectural Alignment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            URJAFLUX is an AI-Powered Spatial & Vastu Intelligence OS — NOT a CAD replacement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex items-center gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Vision Alignment</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{report.overallAlignmentScore}% Aligned</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setActiveTab("declaration")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "declaration"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Lock className="w-3.5 h-3.5" /> Core Vision Declaration
        </button>

        <button
          onClick={() => setActiveTab("workflows")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "workflows"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5" /> Primary User Workflows
        </button>

        <button
          onClick={() => setActiveTab("studio_tools")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "studio_tools"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> Lightweight Design Studio Tools ({report.supportedStudioTools.length})
        </button>

        <button
          onClick={() => setActiveTab("module_classification")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "module_classification"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Module Classification Audit
        </button>

        <button
          onClick={() => setActiveTab("anti_features")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "anti_features"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Ban className="w-3.5 h-3.5" /> Anti-Feature Guardrails ({report.antiFeatureGuardrails.length})
        </button>

        <button
          onClick={() => setActiveTab("recommendations")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "recommendations"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Strategic Recommendations
        </button>
      </div>

      {/* TAB 1: DECLARATION */}
      {activeTab === "declaration" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
                <Lock className="w-6 h-6" />
              </span>
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Executive Product Vision Lock</span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">URJAFLUX Core Purpose Declaration</h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
              URJAFLUX is <strong className="text-white underline decoration-emerald-400">NOT</strong> a replacement for AutoCAD, Revit, ArchiCAD, SketchUp, or any professional CAD/BIM software.
              URJAFLUX is an <strong className="text-emerald-400">AI-Powered Spatial Intelligence & Vastu Intelligence Operating System</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                <Eye className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="text-xs font-bold block text-white">Understand Space</span>
                <span className="text-[10px] text-slate-400">Vector & OCR parsing</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                <Maximize2 className="w-5 h-5 text-indigo-400 mx-auto" />
                <span className="text-xs font-bold block text-white">Analyze Space</span>
                <span className="text-[10px] text-slate-400">Geometry & topology</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                <Sparkles className="w-5 h-5 text-amber-400 mx-auto" />
                <span className="text-xs font-bold block text-white">Reason About Space</span>
                <span className="text-[10px] text-slate-400">Vastu & AI reasoning</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                <FileText className="w-5 h-5 text-rose-400 mx-auto" />
                <span className="text-xs font-bold block text-white">Generate Reports</span>
                <span className="text-[10px] text-slate-400">Executive client audits</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center space-y-1">
                <Compass className="w-5 h-5 text-sky-400 mx-auto" />
                <span className="text-xs font-bold block text-white">Recommend Improvements</span>
                <span className="text-[10px] text-slate-400">Non-destructive remedies</span>
              </div>
            </div>
          </div>

          {/* 4 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-emerald-500 font-bold text-xs uppercase block">Pillar 1</span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Spatial Intelligence</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Shoelace area calculations, vector perimeter geometry, door connectivity graphs, BFS travel paths, and 16-cardinal orientation mapping.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-indigo-500 font-bold text-xs uppercase block">Pillar 2</span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Vastu Intelligence</h3>
              <p className="text-xs text-slate-500 leading-normal">
                81-pada Vastu Purusha Mandala mapping, 16 directional zones, Pancha Tattva elemental balances, and planetary lord diagnostics.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-amber-500 font-bold text-xs uppercase block">Pillar 3</span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">AI Reasoning & Traces</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Multi-agent LLM reasoning chains providing human-understandable evidence justifications and non-destructive spatial remedies.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-sky-500 font-bold text-xs uppercase block">Pillar 4</span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Professional Reports</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Branded PDF/HTML report exports, spatial inventory breakdowns, and client-facing compliance certification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKFLOWS */}
      {activeTab === "workflows" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-emerald-500" /> Primary User Workflows Alignment
            </h2>
            <p className="text-xs text-slate-500">
              URJAFLUX supports two primary workflows. Every feature must serve one of these two pipelines.
            </p>

            <div className="space-y-6">
              {report.primaryWorkflows.map(wf => (
                <div key={wf.id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{wf.name}</h3>
                      <p className="text-xs text-slate-500">{wf.subtitle}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold self-start sm:self-auto">
                      Target: {wf.targetUser}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {wf.steps.map(step => (
                      <div key={step.stepNumber} className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-emerald-600">Step {step.stepNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            step.supportedByUrjaflux 
                              ? "bg-emerald-500/10 text-emerald-600" 
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {step.supportedByUrjaflux ? "URJAFLUX Native" : "External CAD"}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{step.phase}</h4>
                        <p className="text-[11px] text-slate-500">{step.description}</p>
                        <span className="text-[10px] font-mono text-indigo-500 block">Artifact: {step.outputArtifact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIGHTWEIGHT DESIGN STUDIO TOOLS */}
      {activeTab === "studio_tools" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-500" /> Authorized Lightweight Design Studio Toolset
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                19 Core Tools Locked
              </span>
            </div>
            <p className="text-xs text-slate-500">
              The Lightweight Design Studio is strictly for quick structural floor plan creation when no CAD drawing exists. Nothing beyond these 19 tools is part of the core editor.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {report.supportedStudioTools.map(tool => (
                <div key={tool.id} className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> {tool.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-600">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MODULE CLASSIFICATION AUDIT */}
      {activeTab === "module_classification" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" /> Platform System Module Classification Audit
              </h2>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Filter:</span>
                <select
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="ALL">All Classifications ({report.moduleAudits.length})</option>
                  <option value="CORE_VISION">Core Vision ({report.coreVisionCount})</option>
                  <option value="OPTIONAL">Optional ({report.optionalCount})</option>
                  <option value="FUTURE">Future Roadmap ({report.futureCount})</option>
                  <option value="OUTSIDE_VISION">Outside Vision ({report.outsideVisionCount})</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Module ID</th>
                    <th className="p-3">Module Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Architectural Justification</th>
                    <th className="p-3">Action Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredModules.map(mod => (
                    <tr key={mod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-semibold text-slate-400">{mod.id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{mod.moduleName}</td>
                      <td className="p-3 text-slate-500">{mod.category}</td>
                      <td className="p-3">{getClassificationBadge(mod.classification)}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">{mod.justification}</td>
                      <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400 max-w-xs">{mod.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANTI-FEATURE GUARDRAILS */}
      {activeTab === "anti_features" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-500" /> Anti-Feature Boundary Guardrails (Do NOT Implement)
            </h2>
            <p className="text-xs text-slate-500">
              To prevent feature creep into full CAD/BIM software, the following 10 feature domains are strictly prohibited from core development.
            </p>

            <div className="space-y-3">
              {report.antiFeatureGuardrails.map(af => (
                <div key={af.id} className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500" /> {af.featureName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      {af.category} — {af.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300"><strong>Why Excluded:</strong> {af.reasoning}</p>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-emerald-600 dark:text-emerald-400">
                    <strong>Suggested URJAFLUX Alternative:</strong> {af.suggestedAlternative}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STRATEGIC RECOMMENDATIONS */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" /> Strategic Architectural Recommendations
              </h2>
              <span className="text-xs font-mono text-slate-400">Version {report.visionVersion}</span>
            </div>

            <div className="space-y-3">
              {report.strategicArchitecturalRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {rec}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-xl space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">Executive Vision Guardians Sign-Off</span>
              <p className="text-xs text-slate-500">
                Locked by: {report.executiveGuardians.join(" • ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
