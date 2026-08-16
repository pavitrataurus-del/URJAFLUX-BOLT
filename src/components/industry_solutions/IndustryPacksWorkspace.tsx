import { useState } from "react";
import { 
  HardHat, 
  Building2, 
  Activity, 
  Factory, 
  Zap, 
  Building, 
  GraduationCap, 
  Truck, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  Radio, 
  FileCheck, 
  AlertTriangle 
} from "lucide-react";
import { IndustryId, IndustryDigitalTwinTemplate, IndustryKpiMetric, IndustryWorkflowTemplate } from "../../types/industrySolutions";
import { 
  INDUSTRY_SOLUTION_PACKS, 
  INDUSTRY_DIGITAL_TWIN_TEMPLATES, 
  INDUSTRY_KPI_METRICS, 
  INDUSTRY_WORKFLOW_TEMPLATES 
} from "../../services/industry_solutions/industrySolutionsService";

export const IndustryPacksWorkspace = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId>("CONSTRUCTION");

  const twinTemplates = INDUSTRY_DIGITAL_TWIN_TEMPLATES.filter(t => t.industryId === selectedIndustry);
  const kpiMetrics = INDUSTRY_KPI_METRICS.filter(k => k.category.toLowerCase().includes(selectedIndustry.toLowerCase()) || true);
  const workflows = INDUSTRY_WORKFLOW_TEMPLATES.filter(w => w.industryId === selectedIndustry);

  const packInfo = INDUSTRY_SOLUTION_PACKS.find(p => p.industryId === selectedIndustry) || INDUSTRY_SOLUTION_PACKS[0];

  const industryNav = [
    { id: "CONSTRUCTION", label: "Construction & Infrastructure (M2)", icon: HardHat },
    { id: "SMART_CITY", label: "Smart City & Govt (M3)", icon: Building2 },
    { id: "HEALTHCARE", label: "Healthcare & Hospital (M4)", icon: Activity },
    { id: "MANUFACTURING", label: "Manufacturing & Plant (M5)", icon: Factory },
    { id: "ENERGY", label: "Energy & Utilities (M6)", icon: Zap },
    { id: "COMMERCIAL_RE", label: "Commercial Real Estate (M7)", icon: Building },
    { id: "EDUCATION", label: "Education Campus (M8)", icon: GraduationCap },
    { id: "LOGISTICS", label: "Logistics & Transport (M9)", icon: Truck }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>MODULES 2–9 • VERTICAL INDUSTRY SOLUTION PACKS</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Domain Digital Twin Templates, Workflows & Dashboards</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-configured vertical solution packs for construction, municipal smart cities, healthcare facilities, manufacturing, energy grids, CRE, campuses, and logistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">
            {selectedIndustry} PACK ACTIVE
          </span>
        </div>
      </div>

      {/* INDUSTRY SELECTION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {industryNav.map(nav => {
          const Icon = nav.icon;
          const isSelected = selectedIndustry === nav.id;
          return (
            <button
              key={nav.id}
              onClick={() => setSelectedIndustry(nav.id as IndustryId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap border transition-all cursor-pointer ${
                isSelected 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-md shadow-amber-500/10" 
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{nav.label}</span>
            </button>
          );
        })}
      </div>

      {/* PACK METADATA SUMMARY */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">{packInfo.name}</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">{packInfo.description}</p>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold shrink-0">
            {packInfo.version}
          </span>
        </div>

        {/* Feature Flags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-sans text-xs">
          <span className="text-slate-400 text-xs font-bold font-mono">Active Capabilities:</span>
          {Object.entries(packInfo.featureFlags).map(([flag, val]) => (
            <span key={flag} className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
              val ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-900 text-slate-500 border-slate-800"
            }`}>
              {flag}: {val ? "ENABLED" : "OFF"}
            </span>
          ))}
        </div>

        {selectedIndustry === "HEALTHCARE" && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs font-sans">
            ⚠️ <strong>Healthcare Regulatory Disclaimer:</strong> URJAFLUX Healthcare Solution Pack provides spatial layout engineering, equipment tracking, and HVAC airflow management. It does NOT make medical clinical diagnostic claims or provide patient treatment instructions.
          </div>
        )}

        {selectedIndustry === "SMART_CITY" && (
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-200 text-xs font-sans">
            🌐 <strong>GIS Integration Gateway Notice:</strong> Municipal spatial layers and traffic sensor telemetry require active connection to municipal Esri ArcGIS or OpenStreetMap GIS servers.
          </div>
        )}
      </div>

      {/* SECTION 1: DIGITAL TWIN TEMPLATES */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Digital Twin Templates for {selectedIndustry}</span>
          <span className="text-amber-400 font-bold">CAD/3D Mesh Integration</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {twinTemplates.map(twin => (
            <div key={twin.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-300 font-bold">{twin.id}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  {twin.classification}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white">{twin.name}</h4>
              <p className="text-[11px] text-slate-300 font-sans">{twin.description}</p>

              <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between text-[10px] text-slate-400 font-sans">
                <span>Mesh Type: <strong className="text-slate-200 font-mono">{twin.type}</strong></span>
                <span>Active Sensors: <strong className="text-amber-300 font-mono">{twin.sensorCount} Nodes</strong></span>
              </div>
            </div>
          ))}

          {twinTemplates.length === 0 && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs font-sans italic">
              Digital twin template configured for {selectedIndustry}. Select other domain tabs to view specific CAD/3D meshes.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: WORKFLOW TEMPLATES & KPIS */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Industry Workflow Templates & KPI Benchmarks</span>
          <span className="text-amber-400 font-bold">Automated Industry Logic</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Workflows */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Domain Workflows:</span>
            {workflows.map(wf => (
              <div key={wf.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold text-xs">{wf.name}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                    {wf.stepsCount} Steps
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">{wf.description}</p>
                <div className="text-[10px] text-slate-400 font-sans">
                  Trigger: <code className="text-emerald-300 font-mono">{wf.triggerEvent}</code>
                </div>
              </div>
            ))}
          </div>

          {/* KPIs */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Domain KPI Metrics:</span>
            <div className="space-y-2">
              {kpiMetrics.map(kpi => (
                <div key={kpi.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">{kpi.category}</span>
                    <h5 className="text-xs font-bold text-white mt-0.5">{kpi.name}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-400">{kpi.currentValue}</span>
                    <span className="text-[10px] text-slate-400 block">Target: {kpi.targetValue} {kpi.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
