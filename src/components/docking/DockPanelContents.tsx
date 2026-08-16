import React, { useState, useEffect } from 'react';
import { 
  FileCode, Eye, EyeOff, Layers, HardDrive, Compass, Brain, 
  Activity, Settings, Clipboard, Terminal as TermIcon, AlertTriangle, Play, Pause, FastForward 
} from 'lucide-react';

// Structure for selected CAD elements
export interface CadElement {
  id: string;
  name: string;
  layer: string;
  type: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  area: number;
  material: string;
  vastu: string;
  energy: string;
  status: string;
}

export const sampleElements: CadElement[] = [
  {
    id: 'wall_01',
    name: 'Main Structural Wall',
    layer: 'Architecture',
    type: 'Wall Element',
    x: 12.5,
    y: 0.0,
    z: 1.2,
    width: 15.0,
    height: 3.5,
    area: 52.5,
    material: 'Reinforced Concrete',
    vastu: 'Shala Boundary (Heaviness Anchor)',
    energy: '88.4% Aligned',
    status: 'Operational'
  },
  {
    id: 'door_01',
    name: 'Main Entrance Gate',
    layer: 'Openings',
    type: 'Entrance Portal',
    x: 45.2,
    y: 12.4,
    z: 0.0,
    width: 3.2,
    height: 2.8,
    area: 8.96,
    material: 'Teak Wood & Brass',
    vastu: 'Northeast Devata Path (Pranya)',
    energy: '98.2% Optimal',
    status: 'Optimal'
  },
  {
    id: 'hvac_01',
    name: 'Primary HVAC Core',
    layer: 'MEP Systems',
    type: 'Environmental Unit',
    x: 22.1,
    y: 18.9,
    z: 4.2,
    width: 1.8,
    height: 1.8,
    area: 3.24,
    material: 'Galvanized Steel',
    vastu: 'Northwest Vayu Zone (Air Movement)',
    energy: '92.0% Balanced',
    status: 'Active Monitoring'
  },
  {
    id: 'solar_01',
    name: 'Solar Storage Array',
    layer: 'MEP Systems',
    type: 'Power Generator',
    x: 64.0,
    y: 8.5,
    z: 0.0,
    width: 12.0,
    height: 6.0,
    area: 72.0,
    material: 'Polycrystalline Silicon',
    vastu: 'Southeast Agni Zone (Thermal Flux)',
    energy: '95.5% High Yield',
    status: 'Active Powering'
  },
  {
    id: 'marker_01',
    name: 'Brahmasthan Center Marker',
    layer: 'Vastu Grid',
    type: 'Geometric Anchor',
    x: 35.0,
    y: 25.0,
    z: 0.0,
    width: 2.0,
    height: 2.0,
    area: 4.0,
    material: 'Virtual Coordinate Node',
    vastu: 'Brahman Core (Absolute Void Center)',
    energy: '99.8% Perfect Harmony',
    status: 'Aligned'
  }
];

// Left Accordion Panel Component
interface LeftAccordionProps {
  onSelectElement: (elem: CadElement) => void;
  selectedElementId: string;
}

export function LeftAccordionPanel({ onSelectElement, selectedElementId }: LeftAccordionProps) {
  const [expanded, setExpanded] = useState<'Assets' | 'Layers' | 'Objects' | 'Knowledge' | 'Reports' | 'Analysis'>('Assets');
  const [layersVisibility, setLayersVisibility] = useState<Record<string, boolean>>({
    'Architecture': true,
    'Openings': true,
    'MEP Systems': true,
    'Vastu Grid': true,
    'Thermal Overlay': false
  });

  const [elements, setElements] = useState<CadElement[]>(sampleElements);

  const toggleLayer = (layer: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayersVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleHeaderClick = (section: typeof expanded) => {
    setExpanded(section);
  };

  return (
    <div className="flex flex-col h-full bg-[#05080e] select-none text-[11px] font-mono border-slate-900">
      {/* 1. ASSETS */}
      <div className="border-b border-slate-900 flex flex-col shrink-0">
        <button 
          onClick={() => handleHeaderClick('Assets')}
          className={`h-7 px-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-left transition-colors ${
            expanded === 'Assets' ? 'bg-[#0d1425] text-emerald-400' : 'bg-[#070b13] text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span>{expanded === 'Assets' ? '▼' : '▶'}</span>
            <span>Assets Registry</span>
          </span>
          <span className="text-[9px] text-slate-500 font-normal">3 Files</span>
        </button>
        {expanded === 'Assets' && (
          <div className="p-2.5 space-y-2 bg-[#05080f] border-t border-slate-900 max-h-[180px] overflow-y-auto custom-scrollbar text-slate-300">
            <div className="flex items-center justify-between p-1.5 bg-[#090e18] border border-slate-800 hover:border-slate-700 rounded-sm">
              <span className="truncate text-slate-300">Ground_Floor_Plan.dwg</span>
              <span className="text-[9px] text-slate-500 shrink-0 font-mono">14.2 MB</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-[#090e18] border border-slate-800 hover:border-slate-700 rounded-sm">
              <span className="truncate text-slate-300">3D_Harmonics_Structural.fbx</span>
              <span className="text-[9px] text-slate-500 shrink-0 font-mono">42.8 MB</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-[#090e18] border border-slate-800 hover:border-slate-700 rounded-sm">
              <span className="truncate text-slate-300">Vastu_Energy_Aura.png</span>
              <span className="text-[9px] text-slate-500 shrink-0 font-mono">4.1 MB</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. LAYERS */}
      <div className="border-b border-slate-900 flex flex-col shrink-0">
        <button 
          onClick={() => handleHeaderClick('Layers')}
          className={`h-7 px-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-left transition-colors ${
            expanded === 'Layers' ? 'bg-[#0d1425] text-emerald-400' : 'bg-[#070b13] text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span>{expanded === 'Layers' ? '▼' : '▶'}</span>
            <span>Layers Manager</span>
          </span>
          <span className="text-[9px] text-slate-500 font-normal">{Object.keys(layersVisibility).length} Total</span>
        </button>
        {expanded === 'Layers' && (
          <div className="p-2.5 space-y-1.5 bg-[#05080f] border-t border-slate-900 text-slate-300">
            {Object.entries(layersVisibility).map(([layer, isVisible]) => (
              <div 
                key={layer}
                onClick={(e) => toggleLayer(layer, e)}
                className="flex items-center justify-between p-1 hover:bg-slate-800/40 rounded-sm cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    layer === 'Architecture' ? 'bg-[#4338ca]' :
                    layer === 'Openings' ? 'bg-[#059669]' :
                    layer === 'MEP Systems' ? 'bg-[#d97706]' :
                    layer === 'Vastu Grid' ? 'bg-[#9333ea]' :
                    'bg-[#db2777]'
                  }`} />
                  <span className="text-slate-300 font-mono">{layer}</span>
                </div>
                <button className="text-slate-500 hover:text-slate-300">
                  {isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. OBJECTS */}
      <div className="border-b border-slate-900 flex flex-col shrink-0">
        <button 
          onClick={() => handleHeaderClick('Objects')}
          className={`h-7 px-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-left transition-colors ${
            expanded === 'Objects' ? 'bg-[#0d1425] text-emerald-400' : 'bg-[#070b13] text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span>{expanded === 'Objects' ? '▼' : '▶'}</span>
            <span>Entity tree</span>
          </span>
          <span className="text-[9px] text-slate-500 font-normal">{elements.length} Items</span>
        </button>
        {expanded === 'Objects' && (
          <div className="p-2 bg-[#05080f] border-t border-slate-900 max-h-[220px] overflow-y-auto custom-scrollbar space-y-1">
            {elements.map((elem) => {
              const isSelected = elem.id === selectedElementId;
              return (
                <div
                  key={elem.id}
                  onClick={() => onSelectElement(elem)}
                  className={`flex items-center justify-between p-2 rounded-sm cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-l-2 border-emerald-500 text-slate-100 font-bold' 
                      : 'hover:bg-slate-800/40 border-l-2 border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-mono">{elem.name}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 truncate font-sans">{elem.type} • {elem.layer}</p>
                  </div>
                  <span className="text-[8px] bg-slate-900 text-slate-500 px-1 py-0.5 rounded-sm font-mono shrink-0">
                    {elem.id}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. KNOWLEDGE */}
      <div className="border-b border-slate-900 flex flex-col shrink-0">
        <button 
          onClick={() => handleHeaderClick('Knowledge')}
          className={`h-7 px-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-left transition-colors ${
            expanded === 'Knowledge' ? 'bg-[#0d1425] text-emerald-400' : 'bg-[#070b13] text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span>{expanded === 'Knowledge' ? '▼' : '▶'}</span>
            <span>Knowledge Vault</span>
          </span>
          <span className="text-[9px] text-slate-500 font-normal">Active Synced</span>
        </button>
        {expanded === 'Knowledge' && (
          <div className="p-3 bg-[#05080f] border-t border-slate-900 text-slate-300 space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-slate-900 pb-1.5"><span className="text-slate-500">Semantic Nodes:</span><span className="text-emerald-400 font-bold">1,420 Nodes</span></div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5"><span className="text-slate-500">Ontology Rules:</span><span className="text-slate-300">84 Active</span></div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5"><span className="text-slate-500">Query Engine:</span><span className="text-slate-300">SPARQL / Vector</span></div>
            <p className="text-[9px] text-slate-500 leading-normal mt-1 text-center italic">
              Knowledge vault holds semantic Vastu and physical twins.
            </p>
          </div>
        )}
      </div>

      {/* 5. REPORTS */}
      <div className="border-b border-slate-900 flex flex-col shrink-0">
        <button 
          onClick={() => handleHeaderClick('Reports')}
          className={`h-7 px-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-left transition-colors ${
            expanded === 'Reports' ? 'bg-[#0d1425] text-emerald-400' : 'bg-[#070b13] text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span>{expanded === 'Reports' ? '▼' : '▶'}</span>
            <span>Report Sections</span>
          </span>
          <span className="text-[9px] text-slate-500 font-normal">5 Chapters</span>
        </button>
        {expanded === 'Reports' && (
          <div className="p-3 bg-[#05080f] border-t border-slate-900 text-slate-400 space-y-2 text-[10px]">
            <div className="flex items-center gap-2 text-slate-300 font-semibold"><FileCode className="w-3 h-3 text-blue-400 shrink-0" /> Ch 1: Executive Summary</div>
            <div className="flex items-center gap-2 text-slate-300 font-semibold"><FileCode className="w-3 h-3 text-blue-400 shrink-0" /> Ch 2: Spatial Layout Audits</div>
            <div className="flex items-center gap-2 text-slate-300 font-semibold"><FileCode className="w-3 h-3 text-blue-400 shrink-0" /> Ch 3: Vastu Directional Ratings</div>
            <div className="flex items-center gap-2 text-slate-300 font-semibold"><FileCode className="w-3 h-3 text-blue-400 shrink-0" /> Ch 4: Physical & Thermal Diagnostics</div>
            <div className="flex items-center gap-2 text-slate-300 font-semibold"><FileCode className="w-3 h-3 text-blue-400 shrink-0" /> Ch 5: AI Remedial Predictions</div>
          </div>
        )}
      </div>

      {/* 6. ANALYSIS */}
      <div className="border-b border-slate-900 flex flex-col shrink-0">
        <button 
          onClick={() => handleHeaderClick('Analysis')}
          className={`h-7 px-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-left transition-colors ${
            expanded === 'Analysis' ? 'bg-[#0d1425] text-emerald-400' : 'bg-[#070b13] text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span>{expanded === 'Analysis' ? '▼' : '▶'}</span>
            <span>Spatial Scores</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-mono">92 / 100</span>
        </button>
        {expanded === 'Analysis' && (
          <div className="p-3 bg-[#05080f] border-t border-slate-900 text-slate-300 space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-slate-900 pb-1.5"><span className="text-slate-500">Vastu Score:</span><span className="text-emerald-400 font-bold">92/100</span></div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5"><span className="text-slate-500">Thermal Index:</span><span className="text-slate-300">1.05 Coefficient</span></div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5"><span className="text-slate-500">Northeast Gate:</span><span className="text-emerald-400 font-bold font-mono">PASSED</span></div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5"><span className="text-slate-500">North Devata Alignment:</span><span className="text-slate-300 font-mono">+4.2° Deviation</span></div>
          </div>
        )}
      </div>

      {/* Fill bottom space empty */}
      <div className="flex-1 bg-[#05080f]" />
    </div>
  );
}

// Right Properties Inspector Panel Component
interface RightInspectorProps {
  element: CadElement | null;
  onUpdateElement: (elem: CadElement) => void;
  projectName: string;
}

export function RightInspectorPanel({ element, onUpdateElement, projectName }: RightInspectorProps) {
  if (!element) {
    return (
      <div className="p-4 text-center text-slate-500 font-mono text-[11px] h-full flex flex-col justify-center bg-[#05080e]">
        <Compass className="w-8 h-8 mx-auto mb-2 text-slate-700 animate-pulse" />
        <p>NO ELEMENT SELECTED</p>
        <p className="text-[9px] text-slate-600 mt-1 uppercase font-sans">
          Select an entity tree node in Left Panel or double-click canvas objects to load attributes.
        </p>
      </div>
    );
  }

  const handleChange = (field: keyof CadElement, value: any) => {
    onUpdateElement({
      ...element,
      [field]: value
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#05080e] text-[11px] font-mono divide-y divide-slate-900 overflow-y-auto custom-scrollbar">
      
      {/* SELECTION HEADER */}
      <div className="p-3 bg-[#070b13]">
        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Entity Selection</h4>
        <div className="space-y-2">
          <div>
            <label className="text-[9px] text-slate-500 uppercase">Entity Name</label>
            <input 
              type="text" 
              value={element.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-[#090f19] border border-slate-800 text-slate-200 px-2 py-1 mt-0.5 rounded-sm text-[11px] focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500 uppercase">Type</label>
              <div className="w-full bg-slate-950 border border-slate-900/60 text-slate-400 px-2 py-1 mt-0.5 rounded-sm select-all">
                {element.type}
              </div>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase">Entity ID</label>
              <div className="w-full bg-slate-950 border border-slate-900/60 text-emerald-400 font-bold px-2 py-1 mt-0.5 rounded-sm select-all">
                {element.id}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GEOMETRY MATRIX */}
      <div className="p-3">
        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Coordinate Geometry</h4>
        <div className="space-y-2">
          {/* Coordinates Row */}
          <div>
            <label className="text-[9px] text-slate-500 uppercase">Coordinates (X, Y, Z)</label>
            <div className="grid grid-cols-3 gap-1 mt-0.5">
              <div className="flex items-center bg-[#090f19] border border-slate-800 px-1 rounded-sm">
                <span className="text-[9px] text-slate-500 mr-1 font-sans">X</span>
                <input 
                  type="number" 
                  value={element.x} 
                  onChange={(e) => handleChange('x', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none text-slate-200 py-0.5 outline-none font-mono text-center" 
                />
              </div>
              <div className="flex items-center bg-[#090f19] border border-slate-800 px-1 rounded-sm">
                <span className="text-[9px] text-slate-500 mr-1 font-sans">Y</span>
                <input 
                  type="number" 
                  value={element.y} 
                  onChange={(e) => handleChange('y', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none text-slate-200 py-0.5 outline-none font-mono text-center" 
                />
              </div>
              <div className="flex items-center bg-[#090f19] border border-slate-800 px-1 rounded-sm">
                <span className="text-[9px] text-slate-500 mr-1 font-sans">Z</span>
                <input 
                  type="number" 
                  value={element.z} 
                  onChange={(e) => handleChange('z', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none text-slate-200 py-0.5 outline-none font-mono text-center" 
                />
              </div>
            </div>
          </div>

          {/* Size / Scale Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500 uppercase">Width (m)</label>
              <input 
                type="number" 
                value={element.width} 
                onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#090f19] border border-slate-800 text-slate-200 px-2 py-1 mt-0.5 rounded-sm font-mono focus:outline-none" 
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase">Height (m)</label>
              <input 
                type="number" 
                value={element.height} 
                onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#090f19] border border-slate-800 text-slate-200 px-2 py-1 mt-0.5 rounded-sm font-mono focus:outline-none" 
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] bg-slate-950 border border-slate-900/60 p-2 rounded-sm">
            <span className="text-slate-500">Calculated Footprint Area:</span>
            <span className="text-slate-300 font-bold">{(element.width * element.height).toFixed(2)} m²</span>
          </div>
        </div>
      </div>

      {/* VASTU AND ENVIRONMENTAL ATTRIBUTES */}
      <div className="p-3 space-y-2">
        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Parametric Attributes</h4>
        
        <div>
          <label className="text-[9px] text-slate-500 uppercase">Material Composition</label>
          <input 
            type="text" 
            value={element.material}
            onChange={(e) => handleChange('material', e.target.value)}
            className="w-full bg-[#090f19] border border-slate-800 text-slate-200 px-2 py-1 mt-0.5 rounded-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[9px] text-slate-500 uppercase">Vastu Quadrant / Directional Node</label>
          <input 
            type="text" 
            value={element.vastu}
            onChange={(e) => handleChange('vastu', e.target.value)}
            className="w-full bg-[#090f19] border border-slate-800 text-slate-200 px-2 py-1 mt-0.5 rounded-sm focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center bg-slate-950 p-2 border border-slate-900/60 rounded-sm">
          <span className="text-slate-500 font-mono">Aura Energy Rating:</span>
          <span className="text-emerald-400 font-bold">{element.energy}</span>
        </div>
      </div>

      {/* METADATA REGISTRY */}
      <div className="p-3 space-y-1.5 text-[10px]">
        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Metadata Registry</h4>
        <div className="flex justify-between"><span className="text-slate-500">Current Project:</span><span className="text-slate-300">{projectName}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Modifying Authority:</span><span className="text-slate-300">UrjaFlux AI Core</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Audit Status:</span><span className="text-emerald-400 font-bold">SHA-256 SIGNED</span></div>
        <div className="flex justify-between"><span className="text-slate-500">System State:</span><span className="text-emerald-500 uppercase font-bold">{element.status}</span></div>
      </div>

      {/* RELATIONSHIPS */}
      <div className="p-3 text-[10px]">
        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Relational Edges</h4>
        <div className="bg-slate-950 border border-slate-900 p-2 rounded-sm text-slate-500 space-y-1">
          <p className="text-slate-400">• Associated Layer: <span className="text-indigo-400">{element.layer}</span></p>
          <p className="text-slate-400">• Dependent Matrices: <span className="text-amber-400">Mesh_3D, Telemetry_Buffers</span></p>
          <p className="text-slate-400">• Vastu Grid Rule: <span className="text-purple-400">SRE-VGrid-Devata-Rule#092</span></p>
        </div>
      </div>

    </div>
  );
}

// Bottom Console Multi-tab Panel Component
interface BottomConsoleProps {
  debugLogs: string[];
  addLog: (msg: string) => void;
}

export function BottomTabsPanel({ debugLogs, addLog }: BottomConsoleProps) {
  const [activeTab, setActiveTab] = useState<'Logs' | 'Output' | 'Timeline' | 'Terminal' | 'Notifications'>('Logs');
  const [termInput, setTermInput] = useState('');
  const [termHistory, setTermHistory] = useState<string[]>([
    'URJAFLUX AI OS [Kernel v2.0-STABLE]',
    'Secure licensing bound. Device telemetry loaded.',
    'Type /help or /vastu or /diagnose to run compiler diagnostics.',
    ''
  ]);

  const [simPlaying, setSimPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 5>(1);
  const [simTick, setSimTick] = useState(140);

  // Timeline tick increment simulation
  useEffect(() => {
    let interval: any;
    if (simPlaying) {
      interval = setInterval(() => {
        setSimTick(prev => (prev >= 1000 ? 0 : prev + simSpeed));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simPlaying, simSpeed]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termInput.trim()) return;
    const cmd = termInput.trim().toLowerCase();
    const newHist = [...termHistory, `usr@urjaflux$ ${termInput}`];

    if (cmd === '/help') {
      newHist.push(
        '  Available commands:',
        '  /help      - Display this command console utility instructions',
        '  /vastu     - Print structural diagnostic Vastu vector calculations',
        '  /diagnose  - Compile current layers layout and count physical anchors',
        '  /clear     - Flush terminal stream logs buffer'
      );
    } else if (cmd === '/vastu') {
      newHist.push(
        '  [vastu-compiler] Initiating directional mapping audit...',
        '  Coordinates: Core Brahmasthan X:35.0 Y:25.0',
        '  Alignments: Northeast 98.2% (Passed), Northwest 92.0% (Passed), Southeast 95.5% (Passed)',
        '  Energy Rating: Excellent (92.5/100 harmonized)'
      );
      addLog('Executed terminal vastu diagnostics audit');
    } else if (cmd === '/diagnose') {
      newHist.push(
        '  [system-diagnostics] Scanning floor plan layers...',
        '  Found layers: Architecture (Visible), Openings (Visible), MEP Systems (Visible), Vastu Grid (Visible)',
        '  Registered 5 interactive entities inside the telemetry matrix.',
        '  Static memory heap allocations: 4.8MB / Node buffers: OK.'
      );
      addLog('Executed terminal system diagnostics compile');
    } else if (cmd === '/clear') {
      setTermHistory([]);
      setTermInput('');
      return;
    } else {
      newHist.push(`  Command not recognized: "${termInput}". Type /help for assistance.`);
    }

    setTermHistory(newHist);
    setTermInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#05080e] text-[11px] font-mono border-t border-slate-900">
      
      {/* TABS HEADER */}
      <div className="h-7 border-b border-slate-900 bg-[#070b13] flex items-center px-4 gap-2 shrink-0 justify-between">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setActiveTab('Logs')}
            className={`px-2.5 h-7 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'Logs' ? 'border-emerald-500 text-emerald-400 bg-slate-950/30' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Diagnostic Logs
          </button>
          <button 
            onClick={() => setActiveTab('Output')}
            className={`px-2.5 h-7 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'Output' ? 'border-emerald-500 text-emerald-400 bg-slate-950/30' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Compiler Output
          </button>
          <button 
            onClick={() => setActiveTab('Timeline')}
            className={`px-2.5 h-7 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'Timeline' ? 'border-emerald-500 text-emerald-400 bg-slate-950/30' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Simulation Timeline
          </button>
          <button 
            onClick={() => setActiveTab('Terminal')}
            className={`px-2.5 h-7 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'Terminal' ? 'border-emerald-500 text-emerald-400 bg-slate-950/30' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Mock Terminal
          </button>
          <button 
            onClick={() => setActiveTab('Notifications')}
            className={`px-2.5 h-7 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'Notifications' ? 'border-emerald-500 text-emerald-400 bg-slate-950/30' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Warnings & Alarms
          </button>
        </div>
        <span className="text-[9px] text-slate-600 uppercase font-bold shrink-0">
          STRE Console OK
        </span>
      </div>

      {/* TABS CONTENT */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#05080f] custom-scrollbar text-slate-300">
        
        {/* LOGS VIEW */}
        {activeTab === 'Logs' && (
          <div className="space-y-1 font-mono text-[10px] text-slate-400">
            {debugLogs.length === 0 ? (
              <p className="text-slate-600">[SYSTEM IDLE] System telemetry stable. Listening for input loops...</p>
            ) : (
              debugLogs.map((log, idx) => (
                <p key={idx} className="border-l border-emerald-500/20 pl-2">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-slate-300">{log}</span>
                </p>
              ))
            )}
          </div>
        )}

        {/* OUTPUT VIEW */}
        {activeTab === 'Output' && (
          <div className="space-y-1 font-mono text-[10px] text-slate-400">
            <p className="text-emerald-500 font-bold">[SUCCESS] Grid vector matrices compiled successfully.</p>
            <p className="text-slate-500">  - Rules Checked: 84 / Rules Failed: 0</p>
            <p className="text-slate-500">  - Render Buffers: Mesh geometry triangles count: 12,504 vertices</p>
            <p className="text-slate-500">  - Vastu compliance deviation score: 4.2° Northwest True Angle</p>
            <p className="text-slate-500">  - Spatial energy fields bound: Southeast (Fire), Northeast (Water), Northwest (Air)</p>
          </div>
        )}

        {/* TIMELINE VIEW */}
        {activeTab === 'Timeline' && (
          <div className="space-y-3 p-1">
            <div className="flex items-center gap-3 bg-[#080d15] p-2 border border-slate-800 rounded-sm">
              <button 
                onClick={() => setSimPlaying(!simPlaying)}
                className={`p-1 rounded hover:bg-slate-800 border border-slate-700 text-slate-300 ${simPlaying ? 'text-emerald-400' : ''}`}
                title={simPlaying ? 'Pause Simulation' : 'Run Simulation'}
              >
                {simPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setSimSpeed(prev => prev === 1 ? 2 : prev === 2 ? 5 : 1)}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-sm flex items-center gap-1 uppercase text-[9px] font-bold"
              >
                <FastForward className="w-3 h-3 text-emerald-400" />
                <span>Speed: {simSpeed}x</span>
              </button>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-slate-500 text-[9px] w-12 text-right">Tick: {simTick}</span>
                <div className="flex-1 h-1.5 bg-slate-950 rounded-full relative overflow-hidden border border-slate-900">
                  <div className="h-full bg-emerald-500" style={{ width: `${(simTick / 1000) * 100}%` }} />
                </div>
                <span className="text-slate-600 text-[9px]">1000 MAX</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 text-center uppercase leading-normal">
              Simulation tracks thermal currents, spatial energy fluctuations, and electromagnetic solar convergence.
            </p>
          </div>
        )}

        {/* TERMINAL VIEW */}
        {activeTab === 'Terminal' && (
          <div className="flex flex-col h-full min-h-[140px]">
            <div className="flex-1 overflow-y-auto space-y-1 max-h-[110px] custom-scrollbar font-mono text-[10px] text-slate-400">
              {termHistory.map((line, idx) => (
                <p key={idx} className="whitespace-pre-wrap">{line}</p>
              ))}
            </div>
            <form onSubmit={handleCommand} className="flex items-center gap-1.5 pt-1.5 border-t border-slate-900 mt-2 shrink-0">
              <span className="text-emerald-500 font-bold">usr@urjaflux$</span>
              <input 
                type="text" 
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                placeholder="Type /help or /vastu and press enter..."
                className="flex-1 bg-transparent border-none outline-none text-slate-200 text-[10px] font-mono placeholder-slate-700"
              />
            </form>
          </div>
        )}

        {/* NOTIFICATIONS VIEW */}
        {activeTab === 'Notifications' && (
          <div className="space-y-1 text-slate-400 text-[10px] font-mono">
            <div className="flex items-start gap-1.5 text-amber-500 bg-amber-500/5 p-1.5 border border-amber-500/10 rounded-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">[WARN] Heavy Mass Quadrant Deviation</p>
                <p className="text-[9px] text-slate-500">Southwest sector load is below 22%. Balanced traditional structures suggest locating maximum mass anchor elements in Southwest quadrant.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
