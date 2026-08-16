import React, { useState } from "react";
import { 
  Eye, 
  Layers, 
  Maximize2, 
  Compass, 
  Ruler, 
  Sliders, 
  Box, 
  Activity, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  RefreshCw,
  RotateCw,
  Move,
  Scissors
} from "lucide-react";
import { digitalTwinCore } from "../../services/digitalTwin/digitalTwinCore";
import { AnyDigitalTwin, RoomTwin, EquipmentTwin } from "../../types/digitalTwin";

export const Spatial3DViewer: React.FC = () => {
  const twins = digitalTwinCore.getAllTwins();
  const rooms = digitalTwinCore.getTwinsByCategory("ROOM") as RoomTwin[];
  const equipments = digitalTwinCore.getTwinsByCategory("EQUIPMENT") as EquipmentTwin[];

  // Viewer State
  const [selectedTwinId, setSelectedTwinId] = useState<string>("TWIN-RM-101");
  const [cameraPreset, setCameraPreset] = useState<"ISO" | "TOP" | "NORTH" | "SOUTH" | "EAST">("ISO");
  const [layerArchitecture, setLayerArchitecture] = useState(true);
  const [layerHvac, setLayerHvac] = useState(true);
  const [layerSensors, setLayerSensors] = useState(true);
  const [layerHeatmap, setLayerHeatmap] = useState(false);
  const [layerVastuZones, setLayerVastuZones] = useState(true);
  
  // Section Cut & Measurement state
  const [sectionCutZ, setSectionCutZ] = useState<number>(100); // 0 to 100%
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);
  const [measuredDistance, setMeasuredDistance] = useState<string | null>(null);

  const selectedTwin = digitalTwinCore.getTwinById(selectedTwinId);

  const handleMeasureClick = () => {
    setMeasurementMode(!measurementMode);
    if (!measurementMode) {
      setMeasuredDistance("18.42 meters (Clear Span)");
    } else {
      setMeasuredDistance(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#030712] text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* LEFT MAIN CANVAS VIEWPORT */}
      <div className="flex-1 flex flex-col relative bg-[#090d16] overflow-hidden min-h-[500px]">
        {/* Canvas Top Bar Controls */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-mono font-bold border border-emerald-500/20">
            <Box className="w-3.5 h-3.5" />
            <span>LIGHTWEIGHT WEBGL / CANVAS 3D TWIN ENGINE</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Camera Presets */}
          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="text-slate-500 mr-1">CAMERA:</span>
            {(["ISO", "TOP", "NORTH", "SOUTH", "EAST"] as const).map(preset => (
              <button
                key={preset}
                onClick={() => setCameraPreset(preset)}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  cameraPreset === preset 
                    ? "bg-emerald-600 text-white font-bold" 
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Top Right Tool Action Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-lg">
          <button
            onClick={handleMeasureClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              measurementMode ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{measurementMode ? "MEASURE ACTIVE" : "MEASURE DISTANCE"}</span>
          </button>
        </div>

        {/* 3D Interactive Spatial Renderer Canvas Simulation */}
        <div className="flex-1 w-full h-full relative flex items-center justify-center p-8 select-none overflow-hidden">
          {/* Compass Rose Overlay */}
          <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/80">
            <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center relative">
              <span className="absolute top-0.5 text-[9px] font-mono font-bold text-emerald-400">N</span>
              <span className="absolute bottom-0.5 text-[9px] font-mono text-slate-500">S</span>
              <span className="absolute right-1 text-[9px] font-mono text-slate-500">E</span>
              <span className="absolute left-1 text-[9px] font-mono text-slate-500">W</span>
              <Compass className="w-5 h-5 text-emerald-400 rotate-12" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">TRUE NORTH OFFSET</div>
              <div className="text-xs font-mono font-bold text-slate-200">+12.5° East (WGS84)</div>
            </div>
          </div>

          {/* Measured Distance Popover */}
          {measuredDistance && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-500/20 border border-amber-500/50 text-amber-300 px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-xl flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-400" />
              <span>MEASUREMENT RESULT: {measuredDistance}</span>
            </div>
          )}

          {/* ISOMETRIC/PERSPECTIVE BUILDING MODEL DISPLAY */}
          <div className={`w-full max-w-2xl aspect-4/3 relative flex items-center justify-center transition-all duration-500 ${
            cameraPreset === "TOP" ? "scale-90 rotate-0" : cameraPreset === "NORTH" ? "scale-95 rotate-45" : "scale-100 rotate-0"
          }`}>
            {/* Grid Floor Canvas */}
            <div className="absolute inset-0 border border-slate-800/60 rounded-2xl bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

            {/* Vastu Quadrant Overlays */}
            {layerVastuZones && (
              <div className="absolute inset-4 grid grid-cols-2 grid-rows-2 gap-2 opacity-25 pointer-events-none">
                <div className="border border-cyan-500/50 bg-cyan-500/10 rounded-lg p-2 flex items-start justify-start">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">VAYU (NW)</span>
                </div>
                <div className="border border-emerald-500/50 bg-emerald-500/10 rounded-lg p-2 flex items-start justify-end">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">ISHAN (NE)</span>
                </div>
                <div className="border border-indigo-500/50 bg-indigo-500/10 rounded-lg p-2 flex items-end justify-start">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">NIRRITI (SW)</span>
                </div>
                <div className="border border-rose-500/50 bg-rose-500/10 rounded-lg p-2 flex items-end justify-end">
                  <span className="text-[10px] font-mono text-rose-400 font-bold">AGNI (SE)</span>
                </div>
              </div>
            )}

            {/* Room Boxes Rendering */}
            <div className="relative w-full h-full p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-center gap-4 flex-1 mb-4">
                {/* NW Room Vayu */}
                <div 
                  onClick={() => setSelectedTwinId("TWIN-RM-103")}
                  className={`flex-1 h-36 rounded-xl border p-4 cursor-pointer transition-all duration-300 relative group ${
                    selectedTwinId === "TWIN-RM-103"
                      ? "bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                      : "bg-slate-900/80 border-slate-700/80 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-bold text-cyan-300">RM-103: VAYU HUB</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400">320 m² | 36 Desk Capacity</div>

                  {/* MEP equipment icon inside */}
                  {layerHvac && (
                    <div className="mt-3 flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>AHU-1 Duct Supply</span>
                    </div>
                  )}

                  {/* Heatmap overlay */}
                  {layerHeatmap && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-rose-500/30 rounded-xl pointer-events-none" />
                  )}
                </div>

                {/* NE Room Ishan */}
                <div 
                  onClick={() => setSelectedTwinId("TWIN-RM-101")}
                  className={`flex-1 h-36 rounded-xl border p-4 cursor-pointer transition-all duration-300 relative group ${
                    selectedTwinId === "TWIN-RM-101"
                      ? "bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                      : "bg-slate-900/80 border-slate-700/80 hover:border-emerald-500/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-bold text-emerald-300">RM-101: ISHAN SUITE</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400">120 m² | Executive Meditation</div>

                  {layerSensors && (
                    <div className="mt-3 flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded text-[9px] font-mono text-cyan-300 border border-cyan-500/30">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span>22.4°C | 48% RH</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SE Room Agni Vault */}
              <div className="flex justify-end">
                <div 
                  onClick={() => setSelectedTwinId("TWIN-RM-102")}
                  className={`w-1/2 h-32 rounded-xl border p-4 cursor-pointer transition-all duration-300 relative group ${
                    selectedTwinId === "TWIN-RM-102"
                      ? "bg-rose-500/20 border-rose-400 shadow-lg shadow-rose-500/20 scale-[1.02]"
                      : "bg-slate-900/80 border-slate-700/80 hover:border-rose-500/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-bold text-rose-300">RM-102: AGNI VAULT</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400">85 m² | Server Racks & Transformer</div>

                  {layerHvac && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTwinId("TWIN-EQP-AHU1");
                      }}
                      className="mt-2 flex items-center gap-1.5 bg-rose-950/80 px-2 py-1 rounded text-[9px] font-mono text-rose-300 border border-rose-500/30 hover:bg-rose-900/80"
                    >
                      <Zap className="w-3 h-3 text-rose-400" />
                      <span>TWIN-EQP-AHU1 (28.5 kW)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Clipper Controls Slider */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 shadow-lg">
          <Scissors className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono text-slate-400">SECTION CUT Z:</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sectionCutZ} 
            onChange={(e) => setSectionCutZ(Number(e.target.value))}
            className="w-28 accent-emerald-500 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-slate-200">{sectionCutZ}%</span>
        </div>
      </div>

      {/* RIGHT LAYER VISIBILITY & TWIN INSPECTOR SIDEBAR */}
      <div className="w-full lg:w-80 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
        {/* Layer Controls Panel */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Spatial Layer Visibility</h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { id: "arch", label: "3D Architecture & Walls", state: layerArchitecture, setState: setLayerArchitecture },
              { id: "mep", label: "MEP / HVAC Systems", state: layerHvac, setState: setLayerHvac },
              { id: "sns", label: "IoT Sensor Array", state: layerSensors, setState: setLayerSensors },
              { id: "heat", label: "Occupancy Heatmap", state: layerHeatmap, setState: setLayerHeatmap },
              { id: "vastu", label: "Vastu Zone Quadrants", state: layerVastuZones, setState: setLayerVastuZones }
            ].map(layer => (
              <label key={layer.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:bg-slate-900 cursor-pointer">
                <span className="text-slate-300">{layer.label}</span>
                <input 
                  type="checkbox" 
                  checked={layer.state} 
                  onChange={(e) => layer.setState(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Object Selection Property Inspector */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Twin Inspector</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ACTIVE
            </span>
          </div>

          {selectedTwin ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="text-[10px] text-slate-500">PERSISTENT TWIN ID</div>
                <div className="text-sm font-bold text-emerald-400">{selectedTwin.id}</div>
                <div className="text-xs text-slate-200 font-sans font-semibold">{selectedTwin.name}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">{selectedTwin.category}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]">{selectedTwin.status}</span>
                </div>
              </div>

              {/* Geometry specs */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold">3D Bounding Box Geometry</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>DX: <span className="text-emerald-400">{selectedTwin.geometry.bounds3D.dx}m</span></div>
                  <div>DY: <span className="text-emerald-400">{selectedTwin.geometry.bounds3D.dy}m</span></div>
                  <div>DZ: <span className="text-emerald-400">{selectedTwin.geometry.bounds3D.dz}m</span></div>
                  <div>Z-Offset: <span className="text-emerald-400">{selectedTwin.geometry.elevation}m</span></div>
                </div>
              </div>

              {/* Asset metadata if equipment/room */}
              {selectedTwin.asset && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Asset Governance Record</div>
                  <div className="text-slate-300">Tag: <span className="text-slate-100">{selectedTwin.asset.assetTag}</span></div>
                  <div className="text-slate-300">Vendor: <span className="text-slate-100">{selectedTwin.asset.manufacturer}</span></div>
                  <div className="text-slate-300">Next Maintenance: <span className="text-amber-400">{selectedTwin.asset.nextMaintenanceDate}</span></div>
                </div>
              )}

              {/* Custom Properties */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Key-Value Properties</div>
                {Object.entries(selectedTwin.properties).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-300 border-b border-slate-800/40 py-1">
                    <span className="text-slate-400">{k}:</span>
                    <span className="text-emerald-300 font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500 p-4 text-center">
              Click on any 3D spatial object in the viewer to inspect its digital twin properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
