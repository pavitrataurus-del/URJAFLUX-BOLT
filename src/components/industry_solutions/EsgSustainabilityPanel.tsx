import { useState } from "react";
import { 
  Leaf, 
  Droplets, 
  Zap, 
  Trash2, 
  Award, 
  FileText, 
  Globe, 
  CheckCircle2, 
  TrendingDown, 
  Layers 
} from "lucide-react";

export const EsgSustainabilityPanel = () => {
  const [selectedTab, setSelectedTab] = useState<"CARBON" | "WATER" | "LEED" | "WASTE">("CARBON");
  const [calculatedScope1, setCalculatedScope1] = useState(1240); // MT CO2e
  const [calculatedScope2, setCalculatedScope2] = useState(3180); // MT CO2e
  const [calculatedScope3, setCalculatedScope3] = useState(8920); // MT CO2e

  const totalCarbon = calculatedScope1 + calculatedScope2 + calculatedScope3;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-widest">
            <Leaf className="w-4 h-4" />
            <span>MODULE 10 • ESG & SUSTAINABILITY PLATFORM</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Enterprise Carbon Accounting, Water & Green Building Scoring</h2>
          <p className="text-xs text-slate-400 mt-1">
            Scope 1-3 greenhouse gas calculation, water intensity tracking, LEED/GRESB green building scorecard, and ESG audit reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold text-xs">
            13,340 MT CO2e TOTAL Scope 1-3
          </span>
        </div>
      </div>

      {/* EXTERNAL DATA DEPENDENCY NOTICE */}
      <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-200 text-xs font-sans space-y-1">
        <div className="flex items-center gap-2 font-bold font-mono text-teal-300">
          <Globe className="w-4 h-4" />
          <span>REQUIRES EXTERNAL DATA SOURCE CLASSIFICATION</span>
        </div>
        <p>
          Scope 2 local grid emission factors and Scope 3 supplier embodied carbon calculations rely on external APIs (DEFRA, US EPA eGRID, and Grid Carbon Intensity Feeds).
        </p>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Scope 1 Direct Carbon</span>
          <span className="text-lg font-bold text-teal-300">{calculatedScope1.toLocaleString()} MT CO2e</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
            <TrendingDown className="w-3 h-3" /> -4.2% YoY (Boiler Efficiency)
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Scope 2 Electricity Grid</span>
          <span className="text-lg font-bold text-teal-300">{calculatedScope2.toLocaleString()} MT CO2e</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
            <TrendingDown className="w-3 h-3" /> -12.1% YoY (Solar Microgrid)
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Scope 3 Supply Chain</span>
          <span className="text-lg font-bold text-teal-300">{calculatedScope3.toLocaleString()} MT CO2e</span>
          <span className="text-[10px] text-amber-400 flex items-center gap-1 font-sans">
            Requires Supplier Factor API
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">LEED Building Scorecard</span>
          <span className="text-lg font-bold text-emerald-300">84 / 110 (PLATINUM)</span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
            Certified v4.1 Operations
          </span>
        </div>
      </div>

      {/* DETAIL WORKSPACE TABS */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setSelectedTab("CARBON")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              selectedTab === "CARBON"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            Scope 1-3 Carbon Footprint
          </button>
          <button
            onClick={() => setSelectedTab("WATER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              selectedTab === "WATER"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            Water Recycling & Intensity
          </button>
          <button
            onClick={() => setSelectedTab("LEED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              selectedTab === "LEED"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            LEED / GRESB Green Scorecard
          </button>
          <button
            onClick={() => setSelectedTab("WASTE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              selectedTab === "WASTE"
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            Zero-Waste & Circular Economy
          </button>
        </div>

        {selectedTab === "CARBON" && (
          <div className="space-y-4 font-sans text-xs">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              GHG Protocol Emissions Breakdown & External Factor Calibration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
                <span className="font-mono text-teal-300 font-bold">Scope 1 Direct Combustion</span>
                <p className="text-slate-400 text-[11px]">Natural gas HVAC boilers, backup diesel generators, and fleet vehicles.</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-mono text-[11px]">
                  <span>Calculated:</span>
                  <strong className="text-white">{calculatedScope1} MT</strong>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
                <span className="font-mono text-teal-300 font-bold">Scope 2 Indirect Energy</span>
                <p className="text-slate-400 text-[11px]">Purchased electricity, steam, and district cooling with hourly grid carbon intensity.</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-mono text-[11px]">
                  <span>Calculated:</span>
                  <strong className="text-white">{calculatedScope2} MT</strong>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
                <span className="font-mono text-teal-300 font-bold">Scope 3 Value Chain</span>
                <p className="text-slate-400 text-[11px]">Embodied carbon in construction materials (concrete/steel), logistics, and tenant operations.</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-mono text-[11px]">
                  <span>Calculated:</span>
                  <strong className="text-white">{calculatedScope3} MT</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "WATER" && (
          <div className="space-y-3 font-sans text-xs">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Water Consumption & Closed-Loop Recycling Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-teal-300 font-bold">Greywater Recycling Rate</span>
                  <span className="text-emerald-400 font-bold">68.4%</span>
                </div>
                <p className="text-slate-400 text-[11px]">On-site membrane bioreactor processing HVAC cooling tower blowdown for landscape irrigation.</p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-teal-300 font-bold">Potable Water Intensity</span>
                  <span className="text-white font-bold">14.2 L / occupant / day</span>
                </div>
                <p className="text-slate-400 text-[11px]">Smart flow meter telemetry detecting sub-surface pipe leaks in real-time.</p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "LEED" && (
          <div className="space-y-3 font-sans text-xs">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              LEED v4.1 Building Certification Scorecard
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Energy & Atmosphere</span>
                <span className="font-bold text-white text-sm font-mono">28 / 33 Points</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Indoor Environmental Quality</span>
                <span className="font-bold text-white text-sm font-mono">14 / 16 Points</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Water Efficiency</span>
                <span className="font-bold text-white text-sm font-mono">10 / 12 Points</span>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "WASTE" && (
          <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl font-sans text-xs space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-teal-300 font-bold">Landfill Diversion Tonnage</span>
              <span className="text-emerald-400 font-bold">92.1% Diverted</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Automated optical sorting and organic composting tracking across manufacturing plants and commercial properties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
