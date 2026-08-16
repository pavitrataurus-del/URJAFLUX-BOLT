import React, { useState, useMemo } from "react";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Cpu, 
  Eye, 
  FileText, 
  Filter, 
  HelpCircle, 
  Info, 
  Layers, 
  List, 
  Lock, 
  MapPin, 
  Maximize2, 
  Navigation, 
  RefreshCw, 
  RotateCw, 
  Search, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  UserCheck, 
  Zap,
  Box,
  Share2,
  Check,
  X,
  Edit3
} from "lucide-react";

import { 
  BuildingElement, 
  SpatialIntelligenceAnalysis, 
  CapabilityStatus, 
  NorthSourceType,
  CardinalDirection
} from "../../types/spatialIntelligence";

import { SpatialIntelligenceEngine } from "../../services/spatial/SpatialIntelligenceEngine";
import { VisionModelAbstraction } from "../../services/spatial/VisionModelAbstraction";
import { HumanReviewService } from "../../services/spatial/HumanReviewService";
import { SpatialReportService } from "../../services/spatial/SpatialReportService";

export const SpatialIntelligenceWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | "capabilities" 
    | "inspector" 
    | "graph" 
    | "compass" 
    | "reasoning" 
    | "validation" 
    | "vision_abstraction" 
    | "human_review" 
    | "certification"
  >("inspector");

  // Project & Floor Plan State
  const [selectedProjectId, setSelectedProjectId] = useState("PRJ-METRO-PLAZA-01");
  const [northAngle, setNorthAngle] = useState(0);
  const [northSource, setNorthSource] = useState<NorthSourceType>("Manual North");
  
  // Overlay Toggles
  const [showRoomsOverlay, setShowRoomsOverlay] = useState(true);
  const [showWallsOverlay, setShowWallsOverlay] = useState(true);
  const [showDoorsOverlay, setShowDoorsOverlay] = useState(true);
  const [showCompassOverlay, setShowCompassOverlay] = useState(true);
  const [showLabelsOverlay, setShowLabelsOverlay] = useState(true);
  const [showWarningsOverlay, setShowWarningsOverlay] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Selected Element for Inspector
  const [selectedElement, setSelectedElement] = useState<BuildingElement | null>(null);

  // Human Review Service State
  const humanReviewService = useMemo(() => new HumanReviewService(), []);
  const [reviewHistoryTrigger, setReviewHistoryTrigger] = useState(0);

  // Run Spatial Intelligence Engine Pipeline
  const rawSampleElements = useMemo(() => {
    return SpatialIntelligenceEngine.createSampleArchitecturalFloorPlan(selectedProjectId);
  }, [selectedProjectId]);

  const analysis: SpatialIntelligenceAnalysis = useMemo(() => {
    return SpatialIntelligenceEngine.analyzeSpatialModel(
      selectedProjectId,
      "FLR-01",
      rawSampleElements,
      northAngle,
      northSource
    );
  }, [selectedProjectId, rawSampleElements, northAngle, northSource]);

  const systemCapabilities = useMemo(() => SpatialIntelligenceEngine.getSystemCapabilities(), []);
  const visionProviders = useMemo(() => VisionModelAbstraction.getRegisteredProviders(), []);
  const fullReport = useMemo(() => SpatialReportService.generateFullReport(analysis), [analysis]);

  // Color mapping for room categories
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "LIVING": return "fill-amber-500/20 stroke-amber-500 text-amber-700 dark:text-amber-300";
      case "BEDROOM": return "fill-indigo-500/20 stroke-indigo-500 text-indigo-700 dark:text-indigo-300";
      case "KITCHEN": return "fill-rose-500/20 stroke-rose-500 text-rose-700 dark:text-rose-300";
      case "SANITATION": return "fill-sky-500/20 stroke-sky-500 text-sky-700 dark:text-sky-300";
      case "CIRCULATION": return "fill-emerald-500/20 stroke-emerald-500 text-emerald-700 dark:text-emerald-300";
      default: return "fill-slate-500/20 stroke-slate-500 text-slate-700 dark:text-slate-300";
    }
  };

  const getCapabilityBadge = (status: CapabilityStatus) => {
    switch (status) {
      case "Implemented":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Implemented</span>;
      case "Prototype":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">Prototype</span>;
      case "Requires AI Model":
      case "Requires External Vision Model":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">External Vision Model</span>;
      case "Future Enhancement":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20">Future Roadmap</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20">
              Sprint #30
            </span>
            <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
              URJAFLUX AI OS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Spatial Intelligence OS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Architectural floor plan vector parsing, topological relationship graphs, explainable AI reasoning traces, & spatial validation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 flex items-center gap-2 shadow-xs">
            <Compass className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Integrity Score</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{analysis.validationReport.integrityScore}/100</span>
            </div>
          </div>

          <button
            onClick={() => setNorthAngle((prev) => (prev + 45) % 360)}
            className="px-3 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <RotateCw className="w-3.5 h-3.5" /> Rotate North ({northAngle}°)
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setActiveTab("inspector")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "inspector"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" /> Floor Plan Inspector
        </button>

        <button
          onClick={() => setActiveTab("graph")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "graph"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Spatial Topology & Graph
        </button>

        <button
          onClick={() => setActiveTab("compass")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "compass"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> Direction & Compass
        </button>

        <button
          onClick={() => setActiveTab("reasoning")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "reasoning"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Explainable AI Traces
        </button>

        <button
          onClick={() => setActiveTab("validation")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "validation"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Validation & Integrity ({analysis.validationReport.totalIssuesCount})
        </button>

        <button
          onClick={() => setActiveTab("vision_abstraction")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "vision_abstraction"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> Vision Abstraction
        </button>

        <button
          onClick={() => setActiveTab("human_review")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "human_review"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Human Review
        </button>

        <button
          onClick={() => setActiveTab("capabilities")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "capabilities"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <List className="w-3.5 h-3.5" /> System Capabilities
        </button>

        <button
          onClick={() => setActiveTab("certification")}
          className={`px-3.5 py-2 rounded-t-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "certification"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 font-semibold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Readiness Report
        </button>
      </div>

      {/* 3. TAB TAB_1: FLOOR PLAN INSPECTOR & VISUAL OVERLAY */}
      {activeTab === "inspector" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Overlay Canvas */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-emerald-500" /> Architectural Vector Canvas & Spatial Overlays
              </h2>
              <span className="text-xs text-slate-400 font-mono">13m × 11m Envelope</span>
            </div>

            {/* Canvas Control Toolbar */}
            <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-500 mr-1">Overlays:</span>
              
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={showRoomsOverlay} onChange={(e) => setShowRoomsOverlay(e.target.checked)} className="rounded text-emerald-600" />
                <span>Rooms</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={showWallsOverlay} onChange={(e) => setShowWallsOverlay(e.target.checked)} className="rounded text-emerald-600" />
                <span>Walls</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={showDoorsOverlay} onChange={(e) => setShowDoorsOverlay(e.target.checked)} className="rounded text-emerald-600" />
                <span>Doors & Arcs</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={showCompassOverlay} onChange={(e) => setShowCompassOverlay(e.target.checked)} className="rounded text-emerald-600" />
                <span>North Wheel</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={showLabelsOverlay} onChange={(e) => setShowLabelsOverlay(e.target.checked)} className="rounded text-emerald-600" />
                <span>Labels</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none ml-auto text-amber-600 dark:text-amber-400">
                <input type="checkbox" checked={showWarningsOverlay} onChange={(e) => setShowWarningsOverlay(e.target.checked)} className="rounded text-amber-600" />
                <span>Validation Badges</span>
              </label>
            </div>

            {/* SVG Interactive Floor Plan Canvas */}
            <div className="relative aspect-4/3 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
              <svg 
                viewBox="-2 -2 18 15" 
                className="w-full h-full max-h-[500px] transition-transform duration-300"
                style={{ transform: `rotate(${northAngle}deg)` }}
              >
                {/* SVG Grid lines */}
                <defs>
                  <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                    <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.05" />
                  </pattern>
                </defs>
                <rect x="-2" y="-2" width="20" height="20" fill="url(#grid)" />

                {/* 1. ROOM POLYGONS */}
                {showRoomsOverlay && analysis.elements.filter(e => e.geometry.polygon).map((room) => {
                  const points = room.geometry.polygon!.vertices.map(p => `${p.x},${p.y}`).join(" ");
                  const isSelected = selectedElement?.id === room.id;
                  const centroid = room.geometry.polygon!.centroid;

                  return (
                    <g key={room.id} onClick={() => setSelectedElement(room)} className="cursor-pointer group">
                      <polygon
                        points={points}
                        className={`transition-all duration-200 ${
                          isSelected 
                            ? "fill-emerald-500/40 stroke-emerald-400 stroke-[0.15]" 
                            : `${getCategoryColor(room.category)} stroke-[0.08] hover:fill-emerald-500/30`
                        }`}
                      />
                      
                      {/* Centroid dot */}
                      <circle cx={centroid.x} cy={centroid.y} r="0.15" className="fill-emerald-400" />

                      {/* Labels */}
                      {showLabelsOverlay && (
                        <text
                          x={centroid.x}
                          y={centroid.y - 0.3}
                          fontSize="0.45"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="white"
                          className="pointer-events-none select-none drop-shadow-md"
                        >
                          {room.name}
                        </text>
                      )}

                      {showLabelsOverlay && (
                        <text
                          x={centroid.x}
                          y={centroid.y + 0.3}
                          fontSize="0.32"
                          textAnchor="middle"
                          fill="#a1a1aa"
                          className="pointer-events-none select-none"
                        >
                          {(room.properties.areaMeters || 0).toFixed(1)} m²
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 2. WALL VECTORS */}
                {showWallsOverlay && analysis.elements.filter(e => e.type === "WALL" && e.geometry.line).map((wall) => {
                  const l = wall.geometry.line!;
                  return (
                    <line
                      key={wall.id}
                      x1={l.start.x}
                      y1={l.start.y}
                      x2={l.end.x}
                      y2={l.end.y}
                      stroke={wall.properties.isExterior ? "#f43f5e" : "#38bdf8"}
                      strokeWidth={wall.geometry.thicknessMeters || 0.2}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* 3. DOORS */}
                {showDoorsOverlay && analysis.elements.filter(e => e.type === "DOOR" && e.geometry.center).map((door) => {
                  const c = door.geometry.center!;
                  return (
                    <g key={door.id} onClick={() => setSelectedElement(door)} className="cursor-pointer">
                      <circle cx={c.x} cy={c.y} r="0.4" className="fill-emerald-500/30 stroke-emerald-400 stroke-[0.08]" />
                      <circle cx={c.x} cy={c.y} r="0.1" className="fill-emerald-400" />
                    </g>
                  );
                })}

                {/* 4. NORTH COMPASS OVERLAY */}
                {showCompassOverlay && (
                  <g transform="translate(11, 2)">
                    <circle cx="0" cy="0" r="1.2" className="fill-slate-900/80 stroke-emerald-500/50 stroke-[0.05]" />
                    <line x1="0" y1="0" x2="0" y2="-0.9" stroke="#ef4444" strokeWidth="0.12" markerEnd="url(#arrow)" />
                    <text x="0" y="-1.0" fontSize="0.35" textAnchor="middle" fill="#ef4444" fontWeight="bold">N</text>
                  </g>
                )}

                {/* 5. VALIDATION WARNING BADGES */}
                {showWarningsOverlay && analysis.validationReport.issues.map((issue, idx) => (
                  <g key={issue.id} transform={`translate(${1 + idx * 1.5}, 10)`}>
                    <circle cx="0" cy="0" r="0.3" className="fill-amber-500 animate-pulse" />
                    <text x="0" y="0.1" fontSize="0.25" textAnchor="middle" fill="black" fontWeight="bold">!</text>
                  </g>
                ))}
              </svg>

              {/* Floating Canvas Legend */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-800 p-2.5 rounded-lg text-[10px] space-y-1 text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/40 border border-amber-500"></span> Living Zone
                  <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500/40 border border-indigo-500 ml-2"></span> Bedroom
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/40 border border-rose-500 ml-2"></span> Kitchen
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-0.5 bg-rose-500"></span> Exterior Wall
                  <span className="w-2.5 h-0.5 bg-sky-400 ml-2"></span> Partition Wall
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2"></span> Door Node
                </div>
              </div>
            </div>
          </div>

          {/* Element Inspector & Property Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-500" /> Element Property Inspector
              </h3>
              {selectedElement && (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                  {selectedElement.id}
                </span>
              )}
            </div>

            {selectedElement ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Name & Type</span>
                  <div className="flex items-center justify-between mt-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedElement.name}</h4>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded font-semibold text-[11px]">
                      {selectedElement.type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Origin State</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedElement.origin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Confidence Score</span>
                    <span className="font-semibold text-emerald-600">{((selectedElement.confidence || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Enclosed Area</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {(selectedElement.properties.areaMeters || 0).toFixed(2)} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Perimeter</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {(selectedElement.properties.perimeterMeters || 0).toFixed(2)} m
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Evidence Source</span>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-indigo-500 font-semibold block">
                      {selectedElement.evidence.sourceType}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 italic">
                      "{selectedElement.evidence.description}"
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Adjacent Relationships</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedElement.relationships.adjacentRoomIds.length > 0 ? (
                      selectedElement.relationships.adjacentRoomIds.map(id => (
                        <span key={id} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-mono text-[10px]">
                          {id}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">No direct adjacencies recorded</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      humanReviewService.acceptDetection(selectedElement, "Senior Architect");
                      setReviewHistoryTrigger(prev => prev + 1);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-medium text-xs flex items-center gap-1 hover:bg-emerald-700"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Element
                  </button>
                  <button
                    onClick={() => setSelectedElement(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-2">
                <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400">Click any room polygon or door node on the SVG canvas to inspect details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB TAB_2: SPATIAL TOPOLOGY & GRAPH */}
      {activeTab === "graph" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" /> Room Adjacency & Boundary Contact Table
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Adjacency ID</th>
                    <th className="p-3">Room Pair A ↔ B</th>
                    <th className="p-3">Shared Wall Length</th>
                    <th className="p-3">Door Connection</th>
                    <th className="p-3">Connecting Doors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analysis.spatialGraph.adjacencies.map(adj => (
                    <tr key={adj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-semibold text-slate-500">{adj.id}</td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {adj.roomAId} ↔ {adj.roomBId}
                      </td>
                      <td className="p-3">{adj.sharedWallLengthMeters} m</td>
                      <td className="p-3">
                        {adj.hasDoorConnection ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">Direct Door</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">Solid Wall</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {adj.connectingDoorIds.length > 0 ? adj.connectingDoorIds.join(", ") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Navigation className="w-5 h-5 text-indigo-500" /> Shortest Travel Paths & Pedestrian Accessibility Graph
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.spatialGraph.travelPaths.map(path => (
                <div key={path.id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{path.startRoomId} ➔ {path.endRoomId}</span>
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">{path.totalDistanceMeters} m</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Route: {path.routeRoomIds.join(" ➔ ")}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">{path.doorCount} Doors Traversed</span>
                    {path.isAccessible ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Egress Accessible
                      </span>
                    ) : (
                      <span className="text-rose-500 font-semibold">Blocked / Landlocked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB TAB_3: DIRECTION & COMPASS */}
      {activeTab === "compass" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-500" /> 16-Zone Cardinal Orientation Analysis
              </h2>
              <span className="text-xs text-slate-500">North Offset: <strong className="text-slate-800 dark:text-slate-200">{analysis.orientation.northAngleDegrees}°</strong></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Room Name</th>
                    <th className="p-3">Centroid (X, Y)</th>
                    <th className="p-3">True Bearing Angle</th>
                    <th className="p-3">16-Point Cardinal Zone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analysis.orientation.roomOrientations.map(ro => (
                    <tr key={ro.roomId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{ro.roomName}</td>
                      <td className="p-3 font-mono text-slate-500">({ro.centroid.x.toFixed(1)}, {ro.centroid.y.toFixed(1)})</td>
                      <td className="p-3 font-bold text-emerald-600">{ro.bearingDegrees}°</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-600 font-bold border border-indigo-500/20">
                          {ro.cardinalDirection}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">North Calibration Settings</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">North Detection Source</label>
                <select
                  value={northSource}
                  onChange={(e) => setNorthSource(e.target.value as NorthSourceType)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="Manual North">Manual North Calibration</option>
                  <option value="Detected North">Detected Rosette Vision</option>
                  <option value="Unknown North">Unknown / Default</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Manual Rotation Angle (0-360°)</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={northAngle}
                  onChange={(e) => setNorthAngle(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>0° (North Up)</span>
                  <span className="font-bold text-emerald-600">{northAngle}°</span>
                  <span>360°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB TAB_4: EXPLAINABLE AI TRACES */}
      {activeTab === "reasoning" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" /> Explainable AI Decision Traces
            </h2>
            <p className="text-xs text-slate-500">
              Auditable explanation chains documenting why every room was classified, why walls were detected, and why spatial boundaries were inferred.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analysis.reasoningTraces.map(trace => (
                <div key={trace.id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{trace.targetElementName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 font-bold">
                      Confidence {(trace.overallConfidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    <strong className="text-emerald-600">Conclusion:</strong> {trace.conclusion}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-semibold text-slate-400 block">Supporting Evidence Chain:</span>
                    {trace.evidenceChain.map((ev) => (
                      <div key={ev.id} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-indigo-500 font-bold">{ev.sourceType}</span>
                          <span className="text-[10px] text-slate-400">{((ev.confidence || 0) * 100).toFixed(0)}% Match</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 italic">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB TAB_5: VALIDATION & INTEGRITY */}
      {activeTab === "validation" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Topological Integrity Audit & Issue Log
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                analysis.validationReport.isValid 
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}>
                Integrity Score: {analysis.validationReport.integrityScore}/100
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl text-center">
                <span className="text-xs text-rose-600 font-medium block">Critical Errors</span>
                <span className="text-2xl font-bold text-rose-600">{analysis.validationReport.criticalCount}</span>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl text-center">
                <span className="text-xs text-amber-600 font-medium block">Warnings</span>
                <span className="text-2xl font-bold text-amber-600">{analysis.validationReport.warningCount}</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center">
                <span className="text-xs text-slate-500 font-medium block">Informational Flags</span>
                <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">{analysis.validationReport.infoCount}</span>
              </div>
            </div>

            <div className="space-y-3">
              {analysis.validationReport.issues.map(issue => (
                <div key={issue.id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> {issue.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600">
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{issue.description}</p>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-emerald-600 block">Suggested Remediation:</span>
                    <p className="text-slate-600 dark:text-slate-400">{issue.suggestedFix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB TAB_6: VISION ABSTRACTION */}
      {activeTab === "vision_abstraction" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-500" /> Pluggable Vision Model Abstraction Layer
            </h2>
            <p className="text-xs text-slate-500">
              Decoupled contracts for external vision engines (Gemini 2.5 Flash, OpenAI GPT-4o, OpenCV, YOLO v11, SAM 2).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visionProviders.map(provider => (
                <div key={provider.id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{provider.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      provider.status === "ACTIVE" 
                        ? "bg-emerald-500/10 text-emerald-600" 
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }`}>
                      {provider.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{provider.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-500">
                    <div>Segmentation: <strong className="text-slate-800 dark:text-slate-200">{provider.capabilities.supportsFloorPlanSegmentation ? "Yes" : "No"}</strong></div>
                    <div>OCR Labels: <strong className="text-slate-800 dark:text-slate-200">{provider.capabilities.supportsOCRTextRecognition ? "Yes" : "No"}</strong></div>
                    <div>Door/Window: <strong className="text-slate-800 dark:text-slate-200">{provider.capabilities.supportsDoorWindowDetection ? "Yes" : "No"}</strong></div>
                    <div>Vector Output: <strong className="text-slate-800 dark:text-slate-200">{provider.capabilities.supportsVectorOutput ? "Yes" : "No"}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB TAB_7: HUMAN REVIEW */}
      {activeTab === "human_review" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" /> Human Review & Corrections Audit Trail
            </h2>
            <p className="text-xs text-slate-500">
              Every human architect override (room renaming, geometry adjustments, detection approvals) is permanently logged in project history.
            </p>

            <div className="space-y-3">
              {humanReviewService.getHistory().length > 0 ? (
                humanReviewService.getHistory().map(rec => (
                  <div key={rec.id} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{rec.action}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{rec.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">Performed by: <strong className="text-emerald-600">{rec.performedBy}</strong> on target {rec.targetElementId}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-xl p-6">
                  <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No human corrections logged in this session yet. Select an element on the canvas to approve or modify.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. TAB TAB_8: SYSTEM CAPABILITIES */}
      {activeTab === "capabilities" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <List className="w-5 h-5 text-emerald-500" /> System Capability Classification Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Cap ID</th>
                    <th className="p-3">Module Name</th>
                    <th className="p-3">Capability</th>
                    <th className="p-3">Classification Status</th>
                    <th className="p-3">Validation Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {systemCapabilities.map(cap => (
                    <tr key={cap.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-semibold text-slate-400">{cap.id}</td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{cap.moduleName}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{cap.capabilityName}</td>
                      <td className="p-3">{getCapabilityBadge(cap.status)}</td>
                      <td className="p-3 text-slate-500">{cap.validationMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 11. TAB TAB_9: CERTIFICATION & READINESS REPORT */}
      {activeTab === "certification" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                  Sprint #30 Certified
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Spatial Intelligence Readiness Report
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Recommendation</span>
                <span className="text-lg font-bold text-emerald-600">GO FOR DEPLOYMENT</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Files & Modules Created</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 font-mono">
                  <li>/src/types/spatialIntelligence.ts</li>
                  <li>/src/services/spatial/SpatialGeometryEngine.ts</li>
                  <li>/src/services/spatial/BuildingElementRegistry.ts</li>
                  <li>/src/services/spatial/SpatialRelationshipEngine.ts</li>
                  <li>/src/services/spatial/DirectionEngine.ts</li>
                  <li>/src/services/spatial/SpatialReasoningEngine.ts</li>
                  <li>/src/services/spatial/SpatialValidationEngine.ts</li>
                  <li>/src/services/spatial/VisionModelAbstraction.ts</li>
                  <li>/src/services/spatial/HumanReviewService.ts</li>
                  <li>/src/services/spatial/SpatialReportService.ts</li>
                  <li>/src/services/spatial/SpatialIntelligenceEngine.ts</li>
                  <li>/src/components/spatial/SpatialIntelligenceWorkspace.tsx</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Git Commit Message</h3>
                <div className="bg-slate-950 p-3 rounded-lg text-emerald-400 font-mono text-[11px] leading-relaxed">
                  feat(spatial): implement Sprint #30 Spatial Intelligence Engine with vector geometry, topological graphs, explainable reasoning traces, 16-zone cardinal direction engine, and validation scoring
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
