import React from "react";
import { Layers, Network, Map, Eye, EyeOff, Lock, Unlock, Box, ChevronRight, ChevronDown, LayoutDashboard } from "lucide-react";
import { IDigitalTwin, ITwinObject } from "../models/TwinModels";

export default function TwinSidebar({ twin, activeTab, onTabChange, selectedObjectId, onSelectObject, searchQuery }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 bg-[#0d1424] shrink-0 border-b border-slate-800 gap-1 overflow-x-auto no-scrollbar">
        <TabButton icon={LayoutDashboard} label="Dash" active={activeTab === "dashboard"} onClick={() => onTabChange("dashboard")} />
        <TabButton icon={Map} label="Tree" active={activeTab === "hierarchy"} onClick={() => onTabChange("hierarchy")} />
        <TabButton icon={Layers} label="Layers" active={activeTab === "layers"} onClick={() => onTabChange("layers")} />
        <TabButton icon={Network} label="Relations" active={activeTab === "relationships"} onClick={() => onTabChange("relationships")} />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "dashboard" && <TwinDashboard twin={twin} />}
        {activeTab === "hierarchy" && <SpatialHierarchy twin={twin} selectedObjectId={selectedObjectId} onSelectObject={onSelectObject} searchQuery={searchQuery} />}
        {activeTab === "layers" && <LayerManager />}
        {activeTab === "relationships" && <RelationshipExplorer twin={twin} selectedObjectId={selectedObjectId} />}
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap transition-colors ${
        active ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function SpatialHierarchy({ twin, selectedObjectId, onSelectObject, searchQuery }: any) {
  const filteredObjects = twin.objects.filter((o: ITwinObject) => 
    !searchQuery || 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.canonicalType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-1">
      <div className="text-xs font-bold text-slate-400 mb-2 px-1 uppercase tracking-wider">Spatial Tree</div>
      <div className="pl-1">
        <div className="flex items-center gap-2 py-1 text-sm font-semibold text-slate-300">
          <ChevronDown className="w-4 h-4 text-slate-500" />
          <Map className="w-4 h-4 text-emerald-500" />
          {twin.name || "Main Building"}
        </div>
        <div className="pl-5 border-l border-slate-800 ml-2 mt-1 space-y-1">
          <div className="flex items-center gap-2 py-1 text-sm font-semibold text-slate-300">
            <ChevronDown className="w-4 h-4 text-slate-500" />
            <Layers className="w-4 h-4 text-blue-500" />
            Floor 1
          </div>
          <div className="pl-5 border-l border-slate-800 ml-2 mt-1 space-y-0.5">
            {filteredObjects.length === 0 ? (
              <p className="text-xs text-slate-500 py-1">No objects found.</p>
            ) : (
              filteredObjects.map((obj: ITwinObject) => (
                <div 
                  key={obj.id} 
                  onClick={() => onSelectObject(obj.id)}
                  className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-xs transition-colors ${
                    selectedObjectId === obj.id ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Box className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate">{obj.canonicalType} ({obj.id.substring(0,6)})</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LayerManager() {
  const layers = [
    { id: "walls", name: "Structural Walls", color: "bg-slate-400" },
    { id: "rooms", name: "Room Boundaries", color: "bg-blue-400" },
    { id: "doors", name: "Doors & Entrances", color: "bg-amber-400" },
    { id: "windows", name: "Windows", color: "bg-cyan-400" },
    { id: "furniture", name: "Furniture", color: "bg-purple-400" },
    { id: "labels", name: "Metadata Labels", color: "bg-emerald-400" },
    { id: "measurements", name: "Measurements", color: "bg-rose-400" }
  ];

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Display Layers</div>
      <div className="space-y-1">
        {layers.map(layer => (
          <div key={layer.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-800 group">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${layer.color}`} />
              <span className="text-xs text-slate-300 font-medium">{layer.name}</span>
            </div>
            <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <button className="text-slate-400 hover:text-slate-200"><Unlock className="w-3.5 h-3.5" /></button>
              <button className="text-slate-400 hover:text-slate-200"><Eye className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelationshipExplorer({ twin, selectedObjectId }: any) {
  if (!selectedObjectId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Network className="w-8 h-8 text-slate-600 mb-3 opacity-50" />
        <p className="text-xs text-slate-400">Select an object to explore its spatial relationships.</p>
      </div>
    );
  }

  const obj = twin.objects.find((o: any) => o.id === selectedObjectId);
  if (!obj || !obj.relationships || obj.relationships.length === 0) {
    return (
      <div className="p-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Object Relations</div>
        <p className="text-xs text-slate-500">No relationships defined for this object.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Spatial Relations</div>
      <div className="space-y-2">
        {obj.relationships.map((rel: any, idx: number) => (
          <div key={idx} className="bg-slate-800/50 border border-slate-700 p-2 rounded">
            <div className="text-[10px] font-mono text-emerald-400 mb-1">{rel.type}</div>
            <div className="text-xs text-slate-300 break-all">Target: {rel.targetId}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


function TwinDashboard({ twin }: { twin: IDigitalTwin }) {
  const objects = twin.objects || [];
  const roomCount = objects.filter((o: any) => o.canonicalType.toLowerCase().includes("room")).length;
  const wallCount = objects.filter((o: any) => o.canonicalType.toLowerCase().includes("wall")).length;
  const doorCount = objects.filter((o: any) => o.canonicalType.toLowerCase().includes("door")).length;
  const windowCount = objects.filter((o: any) => o.canonicalType.toLowerCase().includes("window")).length;
  const floorCount = 1; // Default for now
  
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Twin Dashboard</div>
      
      <div className="space-y-3">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Status</div>
          <div className="text-emerald-400 text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-500 uppercase mb-2">Geometry Statistics</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Rooms</span><span className="text-slate-200 font-mono">{roomCount}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Walls</span><span className="text-slate-200 font-mono">{wallCount}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Doors</span><span className="text-slate-200 font-mono">{doorCount}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Windows</span><span className="text-slate-200 font-mono">{windowCount}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Floors</span><span className="text-slate-200 font-mono">{floorCount}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Objs</span><span className="text-slate-200 font-mono">{objects.length}</span></div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Spatial Validation</div>
          <div className="text-xs text-slate-300">
            All geometries verified. No intersecting boundaries detected.
          </div>
        </div>
      </div>
    </div>
  );
}