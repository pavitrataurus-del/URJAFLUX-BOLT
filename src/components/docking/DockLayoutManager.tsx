import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, LayoutGrid, RotateCcw, Save, Bug, MonitorPlay, 
  Layers, BrainCircuit, FileText, Compass, Settings 
} from 'lucide-react';
import { DockManager } from '../../core/docking/DockManager';
import { WorkspaceMode, IDockLayout } from '../../core/docking/DockTypes';

export default function DockLayoutManager() {
  // We keep this main export as a backward compatible or lightweight render if needed,
  // but we provide the custom 'WorkspaceDropdown' for direct header embedding.
  return <WorkspaceDropdown />;
}

export function WorkspaceDropdown() {
  const manager = DockManager.getInstance();
  const [isOpen, setIsOpen] = useState(false);
  const [layouts, setLayouts] = useState<IDockLayout[]>(manager.getLayouts());
  const [activeLayout, setActiveLayout] = useState<IDockLayout>(manager.getCurrentLayout());
  const [debugMode, setDebugMode] = useState<boolean>(manager.getDebugMode());
  const [customName, setCustomName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = manager.subscribe(() => {
      setLayouts(manager.getLayouts());
      setActiveLayout(manager.getCurrentLayout());
      setDebugMode(manager.getDebugMode());
    });
    return unsubscribe;
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSaveDialog(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchMode = (mode: WorkspaceMode) => {
    manager.switchMode(mode);
    setIsOpen(false);
  };

  const handleSelectLayout = (layout: IDockLayout) => {
    manager.applyLayout(layout);
    setIsOpen(false);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    manager.saveCustomLayout(customName.trim());
    setCustomName('');
    setShowSaveDialog(false);
    setIsOpen(false);
  };

  const handleReset = () => {
    if (window.confirm('Restore factory defaults? This will revert custom docking widths and layouts.')) {
      manager.resetLayout();
      setIsOpen(false);
    }
  };

  const getModeLabel = (mode: WorkspaceMode) => {
    switch (mode) {
      case 'DRAWING': return 'Drafting (2D)';
      case 'ANALYSIS': return 'Analysis';
      case 'KNOWLEDGE': return 'Knowledge (3D)';
      case 'REPORT_WRITING': return 'Report Studio';
      case 'PRESENTATION': return 'Presentation';
      default: return 'Drafting';
    }
  };

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-7 px-3 bg-[#0d1527] hover:bg-[#111c34] border border-slate-800 text-slate-300 rounded text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider transition-colors"
        title="Switch Layout Modes and Options"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
        <span>Workspace: {getModeLabel(activeLayout.selectedMode)}</span>
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </button>

      {/* Premium CAD-style Dropdown Container */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 bg-[#070b13] border border-slate-800 rounded shadow-2xl z-50 text-[10px] select-none text-slate-300 divide-y divide-slate-800 font-mono">
          
          {/* Section: Layout Presets */}
          <div className="p-2 space-y-0.5">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-2 block mb-1">
              Workspace Presets
            </span>
            
            <button
              onClick={() => handleSwitchMode('DRAWING')}
              className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center gap-2 transition-colors ${
                activeLayout.selectedMode === 'DRAWING' && activeLayout.isSystemPreset
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Drafting Mode (2D)</span>
            </button>

            <button
              onClick={() => handleSwitchMode('ANALYSIS')}
              className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center gap-2 transition-colors ${
                activeLayout.selectedMode === 'ANALYSIS' && activeLayout.isSystemPreset
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Analysis Mode</span>
            </button>

            <button
              onClick={() => handleSwitchMode('KNOWLEDGE')}
              className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center gap-2 transition-colors ${
                activeLayout.selectedMode === 'KNOWLEDGE' && activeLayout.isSystemPreset
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Knowledge Mode (3D)</span>
            </button>

            <button
              onClick={() => handleSwitchMode('REPORT_WRITING')}
              className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center gap-2 transition-colors ${
                activeLayout.selectedMode === 'REPORT_WRITING' && activeLayout.isSystemPreset
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Report Mode</span>
            </button>

            <button
              onClick={() => handleSwitchMode('PRESENTATION')}
              className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center gap-2 transition-colors ${
                activeLayout.selectedMode === 'PRESENTATION' && activeLayout.isSystemPreset
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Presentation Mode</span>
            </button>
          </div>

          {/* Render Custom Layouts if any */}
          {layouts.filter(l => !l.isSystemPreset).length > 0 && (
            <div className="p-2 space-y-0.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-2 block mb-1">
                Custom Layouts
              </span>
              {layouts.filter(l => !l.isSystemPreset).map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectLayout(item)}
                  className={`w-full text-left px-2 py-1 rounded-sm transition-colors ${
                    activeLayout.id === item.id
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                      : 'hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  • {item.name}
                </button>
              ))}
            </div>
          )}

          {/* Section: Layout Utilities */}
          <div className="p-2 space-y-1">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-2 block mb-1">
              Layout Options
            </span>
            
            {showSaveDialog ? (
              <form onSubmit={handleSaveCustom} className="px-2 py-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="Preset Name..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-1.5 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] text-slate-200 focus:outline-none focus:border-emerald-500 h-6"
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    type="submit"
                    className="flex-1 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[8px] uppercase rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-[8px] uppercase rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="w-full text-left px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-2 rounded-sm"
              >
                <Save className="w-3 h-3 text-slate-500" />
                <span>Save Current Layout</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-full text-left px-2 py-1 hover:bg-rose-950/20 hover:text-rose-400 flex items-center gap-2 rounded-sm"
            >
              <RotateCcw className="w-3 h-3 text-rose-500/80" />
              <span>Reset Factory Layout</span>
            </button>
          </div>

          {/* Section: Diagnostics Debug (Developer Tools) */}
          <div className="p-2">
            <button
              onClick={() => {
                manager.toggleDebugMode();
                setIsOpen(false);
              }}
              className={`w-full text-left px-2 py-1 flex items-center gap-2 rounded-sm ${
                debugMode 
                  ? 'bg-yellow-500/10 text-yellow-500 font-bold' 
                  : 'hover:bg-slate-800 text-slate-500 hover:text-slate-400'
              }`}
            >
              <Bug className="w-3 h-3" />
              <span>Developer Diagnostics</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
