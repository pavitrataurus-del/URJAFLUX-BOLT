import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Compass, Shield, Maximize2, Layers } from 'lucide-react';
import { DockManager } from '../../core/docking/DockManager';
import { 
  LeftAccordionPanel, 
  RightInspectorPanel, 
  BottomTabsPanel, 
  CadElement, 
  sampleElements 
} from './DockPanelContents';
import CadBlueprintWorkspace from '../CadBlueprintWorkspace';

interface DockContainerProps {
  canvasContent: React.ReactNode;
  debugLogs: string[];
  addLog: (msg: string) => void;
  activeWorkspaceTab: string;
}

export default function DockContainer({ 
  canvasContent, 
  debugLogs, 
  addLog, 
  activeWorkspaceTab 
}: DockContainerProps) {
  if (activeWorkspaceTab === "2D Viewer") {
    return <CadBlueprintWorkspace />;
  }

  const manager = DockManager.getInstance();
  const [layout, setLayout] = useState(manager.getCurrentLayout());
  
  // Strict Open/Closed panel state tracking (Part 3 & 14)
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync with DockManager selection and preset mode (Part 17 & 18)
  const [elements, setElements] = useState<CadElement[]>(sampleElements);
  const [selectedElement, setSelectedElement] = useState<CadElement | null>(sampleElements[4]); // Defaults to Brahmasthan Center Marker

  useEffect(() => {
    // Subscribe to docking state changes
    const unsubscribe = manager.subscribe(() => {
      setLayout(manager.getCurrentLayout());
      setIsFullscreen(manager.getFullscreenCanvas());
    });
    return unsubscribe;
  }, []);

  // Keyboard Shortcuts (Part 18)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      
      if (isCtrl && e.key === '1') {
        e.preventDefault();
        setIsLeftOpen(prev => !prev);
        addLog(`Toggled Left Panel: ${!isLeftOpen ? 'OPEN' : 'CLOSED'}`);
      } else if (isCtrl && e.key === '2') {
        e.preventDefault();
        setIsRightOpen(prev => !prev);
        addLog(`Toggled Right Panel: ${!isRightOpen ? 'OPEN' : 'CLOSED'}`);
      } else if (isCtrl && e.key === '3') {
        e.preventDefault();
        setIsBottomOpen(prev => !prev);
        addLog(`Toggled Bottom Panel: ${!isBottomOpen ? 'OPEN' : 'CLOSED'}`);
      } else if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
        addLog(`Toggled Screen Fullscreen`);
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
          addLog('Exited fullscreen view');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLeftOpen, isRightOpen, isBottomOpen, isFullscreen]);

  const handleSelectElement = (elem: CadElement) => {
    setSelectedElement(elem);
    addLog(`Selected Entity: [${elem.id}] ${elem.name}`);
  };

  const handleUpdateElement = (updatedElem: CadElement) => {
    setSelectedElement(updatedElem);
    setElements(prev => prev.map(e => e.id === updatedElem.id ? updatedElem : e));
    addLog(`Parametric Update: ${updatedElem.name} attributes modified.`);
  };

  // SVG 2D Canvas blueprint drawing with selection sync (Part 13 & 15)
  const renderInteractiveBlueprint = () => {
    return (
      <div className="w-full h-full bg-[#04060b] flex items-center justify-center relative overflow-hidden select-none">
        {/* Engineering grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1322_1px,transparent_1px),linear-gradient(to_bottom,#0c1322_1px,transparent_1px)] bg-[size:24px_24px] opacity-65" />
        
        {/* Subtle cardinal guidelines crossing center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-slate-900/40 border-dashed" />
          <div className="absolute h-full w-[1px] bg-slate-900/40 border-dashed" />
        </div>

        {/* CAD Grid Metadata overlay */}
        <div className="absolute top-3 left-4 text-[9px] font-mono text-slate-500 uppercase flex flex-col gap-0.5 pointer-events-none z-10">
          <span>GRID ID: STRE-MAIN-COORD</span>
          <span>SPATIAL SYSTEM: {selectedElement?.id === 'marker_01' ? 'WGS84' : 'LOCAL CARTE'}</span>
          <span>CAMERA: Orthographic 2D</span>
          <span>RESOLUTION: 1.0mm/px</span>
        </div>

        {/* Interactive SVG Group */}
        <svg 
          className="w-full h-full absolute inset-0 z-10" 
          viewBox="0 0 1000 650"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Vastu mandala sectors */}
          <g className="opacity-20 pointer-events-none">
            {/* Outer perimeter */}
            <rect x="250" y="75" width="500" height="500" fill="none" stroke="#1e293b" strokeWidth="1" />
            <line x1="250" y1="75" x2="750" y2="575" stroke="#1e293b" strokeWidth="0.5" />
            <line x1="750" y1="75" x2="250" y2="575" stroke="#1e293b" strokeWidth="0.5" />
            {/* Sector lines */}
            <line x1="416" y1="75" x2="416" y2="575" stroke="#1e293b" strokeWidth="0.5" />
            <line x1="583" y1="75" x2="583" y2="575" stroke="#1e293b" strokeWidth="0.5" />
            <line x1="250" y1="241" x2="750" y2="241" stroke="#1e293b" strokeWidth="0.5" />
            <line x1="250" y1="408" x2="750" y2="408" stroke="#1e293b" strokeWidth="0.5" />
          </g>

          {/* Render each CAD entity */}
          {elements.map((elem) => {
            const isSelected = selectedElement?.id === elem.id;
            
            // Map our virtual units roughly to SVG coordinates
            // Base center point at SVG X: 500, Y: 325
            const baseCenter = { x: 500, y: 325 };
            const drawX = baseCenter.x + elem.x * 4;
            const drawY = baseCenter.y - elem.y * 4; // invert Y for standard screen coordinates
            const drawW = elem.width * 5;
            const drawH = elem.height * 5;

            // Render specific layouts based on element ID
            if (elem.id === 'wall_01') {
              return (
                <g key={elem.id} className="cursor-pointer" onClick={() => handleSelectElement(elem)}>
                  <rect 
                    x={drawX - drawW / 2} 
                    y={drawY - drawH / 2} 
                    width={drawW} 
                    height={drawH} 
                    fill={isSelected ? '#065f46' : '#0f172a'} 
                    stroke={isSelected ? '#10b981' : '#334155'} 
                    strokeWidth={isSelected ? '2' : '1'}
                    className="transition-all duration-150 hover:stroke-emerald-400"
                  />
                  <text 
                    x={drawX} 
                    y={drawY + 4} 
                    textAnchor="middle" 
                    fill={isSelected ? '#34d399' : '#64748b'} 
                    className="text-[9px] font-mono font-bold uppercase select-none pointer-events-none"
                  >
                    Wall
                  </text>
                </g>
              );
            }

            if (elem.id === 'door_01') {
              return (
                <g key={elem.id} className="cursor-pointer" onClick={() => handleSelectElement(elem)}>
                  {/* Gate opening path */}
                  <path 
                    d={`M ${drawX - drawW / 2} ${drawY} A ${drawW} ${drawW} 0 0 1 ${drawX + drawW / 2} ${drawY - drawW}`} 
                    fill="none" 
                    stroke={isSelected ? '#10b981' : '#059669'} 
                    strokeWidth="1.5" 
                    strokeDasharray="3 2"
                  />
                  {/* Open panel */}
                  <line 
                    x1={drawX - drawW / 2} 
                    y1={drawY} 
                    x2={drawX + drawW / 2} 
                    y2={drawY - drawW} 
                    stroke={isSelected ? '#34d399' : '#10b981'} 
                    strokeWidth={isSelected ? '2.5' : '1.5'} 
                  />
                  <text 
                    x={drawX} 
                    y={drawY - drawW - 6} 
                    textAnchor="middle" 
                    fill={isSelected ? '#34d399' : '#10b981'} 
                    className="text-[8px] font-mono select-none pointer-events-none uppercase"
                  >
                    Northeast Gate
                  </text>
                </g>
              );
            }

            if (elem.id === 'hvac_01') {
              return (
                <g key={elem.id} className="cursor-pointer" onClick={() => handleSelectElement(elem)}>
                  <circle 
                    cx={drawX} 
                    cy={drawY} 
                    r={drawW / 2} 
                    fill={isSelected ? '#1e1b4b' : '#0f172a'} 
                    stroke={isSelected ? '#818cf8' : '#4f46e5'} 
                    strokeWidth={isSelected ? '2' : '1'} 
                    className="transition-all duration-150 hover:stroke-indigo-400"
                  />
                  {/* Internal fan blade visuals */}
                  <line x1={drawX - 4} y1={drawY} x2={drawX + 4} y2={drawY} stroke="#4f46e5" strokeWidth="1" />
                  <line x1={drawX} y1={drawY - 4} x2={drawX} y2={drawY + 4} stroke="#4f46e5" strokeWidth="1" />
                  <text 
                    x={drawX} 
                    y={drawY - drawW / 2 - 4} 
                    textAnchor="middle" 
                    fill={isSelected ? '#a5b4fc' : '#818cf8'} 
                    className="text-[8px] font-mono select-none pointer-events-none uppercase"
                  >
                    HVAC Core
                  </text>
                </g>
              );
            }

            if (elem.id === 'solar_01') {
              return (
                <g key={elem.id} className="cursor-pointer" onClick={() => handleSelectElement(elem)}>
                  <rect 
                    x={drawX - drawW / 2} 
                    y={drawY - drawH / 2} 
                    width={drawW} 
                    height={drawH} 
                    fill={isSelected ? '#1e293b' : '#0b1329'} 
                    stroke={isSelected ? '#f59e0b' : '#d97706'} 
                    strokeWidth={isSelected ? '2' : '1'} 
                    className="transition-all duration-150 hover:stroke-amber-400"
                  />
                  {/* Cell dividers */}
                  <line x1={drawX} y1={drawY - drawH / 2} x2={drawX} y2={drawY + drawH / 2} stroke="#451a03" strokeWidth="0.5" />
                  <line x1={drawX - drawW / 2} y1={drawY} x2={drawX + drawW / 2} y2={drawY} stroke="#451a03" strokeWidth="0.5" />
                  <text 
                    x={drawX} 
                    y={drawY + 3} 
                    textAnchor="middle" 
                    fill={isSelected ? '#fcd34d' : '#f59e0b'} 
                    className="text-[8px] font-mono select-none pointer-events-none uppercase font-bold"
                  >
                    Solar Array
                  </text>
                </g>
              );
            }

            if (elem.id === 'marker_01') {
              return (
                <g key={elem.id} className="cursor-pointer animate-pulse" onClick={() => handleSelectElement(elem)}>
                  {/* Outer mandala rings */}
                  <circle cx={drawX} cy={drawY} r={drawW * 1.5} fill="none" stroke="#7e22ce" strokeWidth="0.5" strokeDasharray="2 3" />
                  <circle cx={drawX} cy={drawY} r={drawW} fill="none" stroke={isSelected ? '#a855f7' : '#9333ea'} strokeWidth="0.75" />
                  <circle cx={drawX} cy={drawY} r={drawW / 2} fill={isSelected ? '#3b0764' : '#581c87'} stroke="#c084fc" strokeWidth="1" />
                  {/* Center Star Cross */}
                  <line x1={drawX - 12} y1={drawY} x2={drawX + 12} y2={drawY} stroke="#c084fc" strokeWidth="1" />
                  <line x1={drawX} y1={drawY - 12} x2={drawX} y2={drawY + 12} stroke="#c084fc" strokeWidth="1" />
                  <text 
                    x={drawX} 
                    y={drawY - drawW * 1.5 - 4} 
                    textAnchor="middle" 
                    fill={isSelected ? '#e9d5ff' : '#c084fc'} 
                    className="text-[8px] font-mono select-none pointer-events-none uppercase font-bold tracking-widest"
                  >
                    Brahmasthan
                  </text>
                </g>
              );
            }

            return null;
          })}

          {/* Compass rose on the corner */}
          <g transform="translate(100, 550)" className="pointer-events-none opacity-40">
            <circle cx="0" cy="0" r="35" fill="none" stroke="#475569" strokeWidth="1" />
            {/* Cardinal ticks */}
            <line x1="0" y1="-35" x2="0" y2="35" stroke="#475569" strokeWidth="0.5" />
            <line x1="-35" y1="0" x2="35" y2="0" stroke="#475569" strokeWidth="0.5" />
            {/* North Indicator arrow */}
            <polygon points="0,-40 -6,-10 0,-15 6,-10" fill="#f43f5e" />
            <text x="0" y="-45" textAnchor="middle" fill="#f43f5e" className="text-[10px] font-mono font-bold">N</text>
            <text x="45" y="4" textAnchor="middle" fill="#64748b" className="text-[8px] font-mono">E</text>
            <text x="-45" y="4" textAnchor="middle" fill="#64748b" className="text-[8px] font-mono">W</text>
            <text x="0" y="52" textAnchor="middle" fill="#64748b" className="text-[8px] font-mono">S</text>
          </g>
        </svg>

        {/* Selected overlay card - CAD styling */}
        {selectedElement && (
          <div className="absolute bottom-4 right-4 bg-[#070b13]/95 border border-slate-800 rounded p-2 text-[9px] font-mono text-slate-400 z-20 shadow-lg pointer-events-none max-w-xs flex flex-col gap-0.5">
            <div className="text-emerald-400 font-bold uppercase border-b border-slate-800 pb-1 mb-1 flex justify-between">
              <span>{selectedElement.name}</span>
              <span>{selectedElement.id}</span>
            </div>
            <span>TYPE: {selectedElement.type}</span>
            <span>COORD: X:{selectedElement.x.toFixed(1)} Y:{selectedElement.y.toFixed(1)} Z:{selectedElement.z.toFixed(1)}</span>
            <span>FOOTPRINT: {selectedElement.width.toFixed(1)}m x {selectedElement.height.toFixed(1)}m ({(selectedElement.width * selectedElement.height).toFixed(1)}m²)</span>
            <span>VGRID CLASSIFY: {selectedElement.vastu}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col relative min-h-0 min-w-0 overflow-hidden bg-[#05080f]">
      {/* 3-Column main docking grid (Part 1 & 14) */}
      <div className="flex-1 flex relative min-h-0 min-w-0 overflow-hidden">
        
        {/* LEFT PANEL: Accordion view (Part 1, 14, 15) */}
        {!isFullscreen && isLeftOpen && (
          <div className="w-[20%] min-w-[200px] max-w-[350px] flex flex-col shrink-0 h-full overflow-hidden bg-[#05080e] border-r border-slate-900 relative">
            <div className="flex items-center justify-between h-8 bg-[#070b13] border-b border-slate-900 px-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Worktree Accordion
              </span>
              <button 
                onClick={() => {
                  setIsLeftOpen(false);
                  addLog('Collapsed Worktree Accordion Panel');
                }}
                className="p-1 hover:bg-slate-800 rounded-sm text-slate-500 hover:text-slate-300 transition-colors"
                title="Collapse Panel (Ctrl+1)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <LeftAccordionPanel 
                selectedElementId={selectedElement?.id || ''}
                onSelectElement={handleSelectElement}
              />
            </div>
          </div>
        )}

        {/* Collapsed Left Indicator Strip */}
        {!isFullscreen && !isLeftOpen && (
          <button 
            onClick={() => {
              setIsLeftOpen(true);
              addLog('Expanded Worktree Accordion Panel');
            }}
            className="w-5 bg-[#070b13] hover:bg-[#0c1424] border-r border-slate-900 flex flex-col items-center justify-start pt-4 text-slate-600 hover:text-emerald-400 transition-colors shrink-0 z-20 group"
            title="Expand Left Panel (Ctrl+1)"
          >
            <ChevronRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-[8px] font-bold tracking-widest font-mono rotate-90 whitespace-nowrap origin-left mt-8 block">
              WORKTREE
            </span>
          </button>
        )}

        {/* CENTER COLUMN: Canvas Area + optional bottom panel */}
        <div className="flex-1 flex flex-col relative min-w-0 min-h-0">
          
          {/* Main Canvas view box */}
          <div
            onDoubleClick={() => {
              setIsFullscreen(prev => !prev);
              addLog(`Toggled Fullscreen Canvas state: ${!isFullscreen ? 'ACTIVE' : 'DEACTIVE'}`);
            }}
            className="flex-1 min-w-0 min-h-0 relative bg-[#040609]"
            title="Double-click canvas area to maximize/fullscreen"
          >
            {activeWorkspaceTab === "2D Viewer" ? renderInteractiveBlueprint() : canvasContent}
          </div>

          {/* BOTTOM PANEL: Engineering Terminal (Part 1, 14, 15) */}
          {!isFullscreen && isBottomOpen && (
            <div className="h-[240px] shrink-0 border-t border-slate-900 bg-[#05080e] relative">
              <div className="absolute top-1.5 right-3 z-30">
                <button 
                  onClick={() => {
                    setIsBottomOpen(false);
                    addLog('Closed Bottom Console Panel');
                  }}
                  className="p-1 hover:bg-slate-800 rounded-sm text-slate-500 hover:text-slate-300 transition-colors"
                  title="Close Console Panel (Ctrl+3)"
                >
                  <ChevronLeft className="w-3.5 h-3.5 rotate-270" />
                </button>
              </div>

              <div className="h-full">
                <BottomTabsPanel debugLogs={debugLogs} addLog={addLog} />
              </div>
            </div>
          )}
        </div>

        {/* Collapsed Right Indicator Strip */}
        {!isFullscreen && !isRightOpen && (
          <button 
            onClick={() => {
              setIsRightOpen(true);
              addLog('Expanded Properties Inspector Panel');
            }}
            className="w-5 bg-[#070b13] hover:bg-[#0c1424] border-l border-slate-900 flex flex-col items-center justify-start pt-4 text-slate-600 hover:text-emerald-400 transition-colors shrink-0 z-20 group"
            title="Expand Right Panel (Ctrl+2)"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-[8px] font-bold tracking-widest font-mono -rotate-90 whitespace-nowrap origin-right mt-8 block">
              INSPECTOR
            </span>
          </button>
        )}

        {/* RIGHT PANEL: Inspector (Part 1, 14, 15) */}
        {!isFullscreen && isRightOpen && (
          <div className="w-[20%] min-w-[200px] max-w-[350px] flex flex-col shrink-0 h-full overflow-hidden bg-[#05080e] border-l border-slate-900 relative">
            <div className="flex items-center justify-between h-8 bg-[#070b13] border-b border-slate-900 px-3">
              <button 
                onClick={() => {
                  setIsRightOpen(false);
                  addLog('Collapsed Properties Inspector Panel');
                }}
                className="p-1 hover:bg-slate-800 rounded-sm text-slate-500 hover:text-slate-300 transition-colors"
                title="Collapse Panel (Ctrl+2)"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Properties Inspector
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <RightInspectorPanel 
                element={selectedElement}
                onUpdateElement={handleUpdateElement}
                projectName={layout.name || "Default Project"}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
