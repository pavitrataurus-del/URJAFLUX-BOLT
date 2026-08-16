import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Layers, 
  PieChart, 
  Cpu, 
  CheckCircle2 
} from "lucide-react";
import { EXECUTIVE_DASHBOARD_METRICS } from "../../services/industry_solutions/industrySolutionsService";

export const IndustryExecutiveDashboardsPanel = () => {
  const [selectedRole, setSelectedRole] = useState<"CEO" | "COO" | "CTO" | "CFO" | "OPERATIONS" | "COMPLIANCE">("CEO");

  const executiveRoles = [
    { id: "CEO", label: "Chief Executive (CEO)", desc: "Global Multi-Industry Strategic Health & ROI" },
    { id: "COO", label: "Chief Operations (COO)", desc: "Digital Twin Coverage & Operations Telemetry" },
    { id: "CTO", label: "Chief Technology (CTO)", desc: "AI Agent Reasoning Precision & SCADA Latency" },
    { id: "CFO", label: "Chief Financial (CFO)", desc: "Energy Savings & Avoided Maintenance Costs" },
    { id: "OPERATIONS", label: "Operations Director", desc: "Live Sensor Streams & Real-time Alerts" },
    { id: "COMPLIANCE", label: "Compliance Officer", desc: "Regulatory Audit Readiness & Standards" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>MODULE 13 • INDUSTRY EXECUTIVE DASHBOARDS</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Role-Based Executive Command Centers & Cross-Industry Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tailored executive views for CEO, COO, CTO, CFO, Operations, and Compliance officers aggregating multi-industry telemetry and digital twins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">
            CROSS-INDUSTRY SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* EXECUTIVE ROLE SELECTOR TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {executiveRoles.map(role => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                isSelected 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-md shadow-amber-500/10" 
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>

      {/* EXECUTIVE ROLE DASHBOARD CARDS */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {executiveRoles.find(r => r.id === selectedRole)?.label} Command View
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            {executiveRoles.find(r => r.id === selectedRole)?.desc}
          </p>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXECUTIVE_DASHBOARD_METRICS.map(m => (
            <div key={m.id} className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-sans">{m.title}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-amber-300">{m.value}</span>
                <span className="text-[10px] text-emerald-400 font-bold font-sans">{m.changeText}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400 font-sans">
                <span>Scope: <strong className="text-slate-200">{m.industryScope}</strong></span>
                <span className="text-emerald-400">Validated</span>
              </div>
            </div>
          ))}
        </div>

        {/* CROSS-INDUSTRY COMPARISON MATRIX */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Cross-Industry Benchmark Comparison Matrix</span>
            <span className="text-amber-400">Synchronized Engine</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-3">Industry Domain</th>
                  <th className="py-2.5 px-3">Digital Twin Mesh</th>
                  <th className="py-2.5 px-3">Domain AI Agent</th>
                  <th className="py-2.5 px-3">Regulatory Standards</th>
                  <th className="py-2.5 px-3">Operational Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300 font-sans text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-300">Construction</td>
                  <td className="py-2.5 px-3">BIM Structural Bridge Twin</td>
                  <td className="py-2.5 px-3 font-mono">ConstructaAI</td>
                  <td className="py-2.5 px-3">IBC 2024 / OSHA</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">100% Ready</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-300">Smart City</td>
                  <td className="py-2.5 px-3">Municipal Water Network</td>
                  <td className="py-2.5 px-3 font-mono">CityGovAI</td>
                  <td className="py-2.5 px-3">ISO 37120 / GIS</td>
                  <td className="py-2.5 px-3 text-sky-400 font-mono font-bold">Requires GIS API</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-300">Healthcare</td>
                  <td className="py-2.5 px-3">ICU Ward Airflow Twin</td>
                  <td className="py-2.5 px-3 font-mono">MediTwinAI</td>
                  <td className="py-2.5 px-3">ASHRAE 170</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">100% Ready</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-300">Manufacturing</td>
                  <td className="py-2.5 px-3">Robotic Line Vibration Twin</td>
                  <td className="py-2.5 px-3 font-mono">FactoryOptimaAI</td>
                  <td className="py-2.5 px-3">ISO 55000 / VDMA</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">100% Ready</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-300">Energy & Utilities</td>
                  <td className="py-2.5 px-3">400kV Substation Topology</td>
                  <td className="py-2.5 px-3 font-mono">GridSentinelAI</td>
                  <td className="py-2.5 px-3">IEEE 1547 / NERC CIP</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">100% Ready</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-300">ESG & Sustainability</td>
                  <td className="py-2.5 px-3">Zero-Carbon Campus Twin</td>
                  <td className="py-2.5 px-3 font-mono">SustainaAI</td>
                  <td className="py-2.5 px-3">GHG Protocol / LEED v4.1</td>
                  <td className="py-2.5 px-3 text-teal-400 font-mono font-bold">Requires EPA API</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
