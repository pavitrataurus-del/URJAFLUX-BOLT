import React, { useState, useEffect } from 'react';
import { 
  Compass, LayoutGrid, Palette, Type, Grid, Square, List, 
  Settings, Check, X, AlertTriangle, Info, ArrowRight, ChevronRight, 
  ChevronDown, Search, Folder, File, Play, RefreshCw, Layers, 
  Sliders, User, Shield, HelpCircle, Terminal, Eye, ExternalLink, 
  Copy, CheckSquare, Plus, Trash2, Edit2, Maximize2
} from 'lucide-react';
import SpatialObjectModelPage from './SpatialObjectModelPage';
import ApplicationKernelPage from './ApplicationKernelPage';
import ProjectWorkflowValidationPage from './ProjectWorkflowValidationPage';

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<'object_model' | 'kernel_runtime' | 'project_workflow' | 'architecture' | 'panels' | 'tokens' | 'interactions' | 'components'>('object_model');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // States for interactive specs inside playground
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    'root': true,
    'site_01': true,
    'building_A': false
  });
  const [selectedTreeNodes, setSelectedTreeNodes] = useState<string[]>(['room_101']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState('LOCAL_GRID_WGS84');
  const [demoInputVal, setDemoInputVal] = useState('STRE-CENTRAL-NODE-01');

  // Architecture view state
  const [hoveredWireframeArea, setHoveredWireframeArea] = useState<string | null>(null);

  // Docking simulator state
  const [simDockState, setSimDockState] = useState<'LEFT' | 'RIGHT' | 'BOTTOM' | 'FLOAT'>('RIGHT');
  const [simCollapsed, setSimCollapsed] = useState<boolean>(false);
  const [simWidth, setSimWidth] = useState<number>(320);

  // Command palette simulation state
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  const [paletteQuery, setPaletteQuery] = useState<string>('');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState<number>(0);

  const triggerCopy = (token: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const toggleTreeNode = (id: string) => {
    setTreeExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectTreeNode = (id: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedTreeNodes(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else {
      setSelectedTreeNodes([id]);
    }
  };

  // Listen for Ctrl+K global command palette simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
        setPaletteQuery('');
        setSelectedPaletteIndex(0);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const simulatedCommands = [
    { category: 'Navigation', label: 'Go to Spatial Workspace', action: 'NAV_WORKSPACE', shortcut: 'G W' },
    { category: 'Navigation', label: 'Go to Design System', action: 'NAV_DESIGN', shortcut: 'G D' },
    { category: 'Navigation', label: 'Go to Project Dashboard', action: 'NAV_DASHBOARD', shortcut: 'G P' },
    { category: 'Calibration', label: 'Recalibrate North Alignment', action: 'CAL_NORTH', shortcut: 'C N' },
    { category: 'Calibration', label: 'Apply Vastu Mandala Overlay (9x9)', action: 'CAL_MANDALA', shortcut: 'C M' },
    { category: 'Layout', label: 'Toggle Explorer Panel Visibility', action: 'TOGGLE_EXPLORER', shortcut: 'Alt + 1' },
    { category: 'Layout', label: 'Toggle Inspector Panel Visibility', action: 'TOGGLE_INSPECTOR', shortcut: 'Alt + 2' },
    { category: 'Layout', label: 'Toggle Bottom Output Console', action: 'TOGGLE_CONSOLE', shortcut: 'Alt + `' },
    { category: 'Settings', label: 'Save Current Workspace Preset', action: 'SAVE_LAYOUT', shortcut: 'Ctrl + S' },
  ];

  const filteredCommands = simulatedCommands.filter(cmd => 
    cmd.label.toLowerCase().includes(paletteQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  // 1. Color Palette Tokens Data
  const semanticColors = [
    { name: 'Background (App Canvas)', token: 'bg-[#04060b]', desc: 'Absolute baseline app background', preview: 'bg-[#04060b] border border-slate-800' },
    { name: 'Surface (Containers)', token: 'bg-[#070b13]', desc: 'Base surface for floating panes, panels, and sidebars', preview: 'bg-[#070b13] border border-slate-800' },
    { name: 'Surface Elevated', token: 'bg-[#0b1322]', desc: 'Elevated panel headers, menu overlays, dropdowns', preview: 'bg-[#0b1322] border border-slate-700' },
    { name: 'Primary Accent', token: 'bg-[#10b981]', desc: 'Active states, primary selections, success markers (Emerald-500)', preview: 'bg-[#10b981]' },
    { name: 'Primary Accent Hover', token: 'bg-[#059669]', desc: 'Emerald hover state', preview: 'bg-[#059669]' },
    { name: 'Primary Accent Muted', token: 'bg-[#065f46]', desc: 'Background fill for selected or high-priority tabs', preview: 'bg-[#065f46]' },
    { name: 'Secondary Accent', token: 'bg-[#6366f1]', desc: 'Alternative indicators, structural groups (Indigo-500)', preview: 'bg-[#6366f1]' },
    { name: 'Danger Accent', token: 'bg-[#f43f5e]', desc: 'Errors, high priority alerts, critical constraints (Rose-500)', preview: 'bg-[#f43f5e]' },
    { name: 'Danger Accent Muted', token: 'bg-[#9f1239]', desc: 'Error background fill or severe warnings (Rose-800)', preview: 'bg-[#9f1239]' },
    { name: 'Warning Accent', token: 'bg-[#f59e0b]', desc: 'Non-blocking violations, calibration alerts (Amber-500)', preview: 'bg-[#f59e0b]' },
    { name: 'Border Default', token: 'border-[#1e293b]', desc: 'Standard internal pane and element boundary lines', preview: 'border border-[#1e293b]' },
    { name: 'Border Highlight', token: 'border-slate-700', desc: 'Active border selection or focused frame indicators', preview: 'border border-slate-700' },
    { name: 'Text Primary', token: 'text-slate-100', desc: 'Absolute high-contrast body, numeric data, readouts', preview: 'bg-[#04060b] text-slate-100 flex items-center justify-center font-mono text-[9px]', content: 'Aa' },
    { name: 'Text Secondary', token: 'text-slate-400', desc: 'Standard descriptive labels, metadata headings', preview: 'bg-[#04060b] text-slate-400 flex items-center justify-center font-mono text-[9px]', content: 'Aa' },
    { name: 'Text Muted / Code', token: 'text-slate-500', desc: 'Unfocused labels, grid parameters, coordinate logs', preview: 'bg-[#04060b] text-slate-500 flex items-center justify-center font-mono text-[9px]', content: 'Aa' },
  ];

  // 2. Typography Modular Scale Data
  const typographyScale = [
    { level: 'Display Header', font: 'Plus Jakarta Sans', weight: 'Bold (700)', size: '20px (1.25rem)', line: '1.25', cls: 'text-xl font-bold tracking-tight text-slate-100', usage: 'High-level dashboard titles, primary site coordinate summaries' },
    { level: 'Primary Heading', font: 'Plus Jakarta Sans', weight: 'SemiBold (600)', size: '16px (1.0rem)', line: '1.35', cls: 'text-base font-semibold text-slate-200', usage: 'Major category panels, modal titles, focus sections' },
    { level: 'Card / Panel Title', font: 'Plus Jakarta Sans', weight: 'Medium (500)', size: '14px (0.875rem)', line: '1.4', cls: 'text-sm font-medium text-slate-300', usage: 'Inspector title cards, nested toolsets, list groups' },
    { level: 'Body Text', font: 'Plus Jakarta Sans', weight: 'Regular (400)', size: '14px (0.875rem)', line: '1.6', cls: 'text-sm font-normal text-slate-400 leading-relaxed', usage: 'Standard documentation paragraphs, guidelines, user logs' },
    { level: 'Label (Technical)', font: 'JetBrains Mono / Code', weight: 'Bold (700)', size: '10px (0.625rem)', line: '1.2', cls: 'text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-400', usage: 'Pill tags, grid IDs, spatial classification labels' },
    { level: 'Metadata / Small Text', font: 'Plus Jakarta Sans', weight: 'Medium (500)', size: '11px (0.6875rem)', line: '1.5', cls: 'text-[11px] font-medium text-slate-500', usage: 'Descriptive subheadings, instructions, timestamp indices' },
    { level: 'Terminal / Coordinate Code', font: 'JetBrains Mono / Code', weight: 'Regular (400)', size: '10px (0.625rem)', line: '1.5', cls: 'text-[10px] font-mono text-slate-300', usage: 'System status bar parameters, 3D coordinate inputs, error logs' },
  ];

  return (
    <div className="flex-1 w-full h-full bg-[#04060b] flex flex-col overflow-hidden font-sans select-none border-t border-slate-900 relative">
      
      {/* 1. TOP TITLE CONTROL BAR */}
      <div className="h-12 shrink-0 bg-[#070b13] border-b border-slate-900 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xs font-bold font-mono tracking-widest text-slate-100 leading-none">URJAFLUX DESIGN SYSTEM</h1>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1 inline-block">Official Desktop Framework Standard • v2.0-STRE</span>
          </div>
        </div>

        {/* Global Design Tab Navigation */}
        <div className="flex items-center gap-1">
          {[
            { id: 'object_model', label: '1. Object Model & Entity Framework' },
            { id: 'kernel_runtime', label: '2. Application Kernel & Runtime' },
            { id: 'project_workflow', label: '3. Lifecycle & Workflow Validation' },
            { id: 'architecture', label: '4. OS Architecture' },
            { id: 'panels', label: '5. Panel Standards' },
            { id: 'tokens', label: '6. Design Tokens' },
            { id: 'interactions', label: '7. System Logic' },
            { id: 'components', label: '8. Playground Spec' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`h-7 px-3 rounded text-[10px] font-bold font-mono uppercase tracking-wider transition-all border ${
                activeTab === tab.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN DOCUMENTATION CANVAS */}
      {activeTab === 'object_model' ? (
        <SpatialObjectModelPage />
      ) : activeTab === 'kernel_runtime' ? (
        <ApplicationKernelPage />
      ) : activeTab === 'project_workflow' ? (
        <ProjectWorkflowValidationPage />
      ) : (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-12">

          {/* ========================================================= */}
          {/* TAB 1: OS ARCHITECTURE BLUEPRINT */}
          {/* ========================================================= */}
          {activeTab === 'architecture' && (
            <div className="space-y-10 animate-fade-in">
              <div className="border-b border-slate-900 pb-4">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">CHAPTER 01</span>
                <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight mt-1">Universal Desktop Architecture & Shell Blueprint</h2>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  URJAFLUX enforces a single, rigid desktop shell to avoid the visual clutter of standard SaaS dashboards. Every view conforms to these coordinate layouts.
                </p>
              </div>

              {/* INTERACTIVE WORKSPACE WIREFRAME */}
              <div className="bg-[#070b13] border border-slate-900 rounded p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">1. Interactive Layout Coordinate Wireframe</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Hover over any region of the architectural blueprint below to inspect its layout rules, constraints, and pixel metrics.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Schematic Mockup Container */}
                  <div className="lg:col-span-2 border border-slate-800 rounded bg-[#04060b] p-3 flex flex-col gap-1 text-[10px] font-mono select-none">
                    
                    {/* Header bar mock */}
                    <div 
                      onMouseEnter={() => setHoveredWireframeArea('header')}
                      onMouseLeave={() => setHoveredWireframeArea(null)}
                      className={`h-7 border rounded transition-all flex items-center justify-between px-2 cursor-pointer ${
                        hoveredWireframeArea === 'header' ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400' : 'bg-[#070b13] border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>GLOBAL_HEADER [h-14 / 56px]</span>
                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1 rounded">Z-INDEX: 30</span>
                    </div>

                    {/* Middle columns wrapper */}
                    <div className="flex gap-1 h-32">
                      
                      {/* Left Navigation Rail mock */}
                      <div 
                        onMouseEnter={() => setHoveredWireframeArea('nav_rail')}
                        onMouseLeave={() => setHoveredWireframeArea(null)}
                        className={`w-6 border rounded transition-all flex flex-col items-center justify-between py-1 cursor-pointer ${
                          hoveredWireframeArea === 'nav_rail' ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400' : 'bg-[#070b13] border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="rotate-270 whitespace-nowrap text-[7px]">NAV_RAIL [w-16]</span>
                        <div className="w-2.5 h-2.5 bg-slate-800 rounded-sm" />
                      </div>

                      {/* Explorer panel mock */}
                      <div 
                        onMouseEnter={() => setHoveredWireframeArea('explorer')}
                        onMouseLeave={() => setHoveredWireframeArea(null)}
                        className={`w-20 border rounded transition-all flex flex-col justify-between p-1.5 cursor-pointer ${
                          hoveredWireframeArea === 'explorer' ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400' : 'bg-[#070b13] border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="border-b border-slate-800 pb-0.5 text-[7px] uppercase font-bold">Explorer</div>
                        <div className="flex-1 flex flex-col justify-center gap-1 text-[8px] text-slate-500">
                          <span>• Tree_01</span>
                          <span>• Tree_02</span>
                        </div>
                        <span className="text-[7px] text-slate-500">w-64</span>
                      </div>

                      {/* Center canvas mock */}
                      <div 
                        onMouseEnter={() => setHoveredWireframeArea('canvas')}
                        onMouseLeave={() => setHoveredWireframeArea(null)}
                        className={`flex-1 border rounded transition-all flex flex-col justify-between p-1.5 cursor-pointer ${
                          hoveredWireframeArea === 'canvas' ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400' : 'bg-[#04060b] border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[7px]">
                          <span className="text-emerald-500">CANVAS_WORKSPACE &gt; 65%</span>
                          <span>(0,0) GRID</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center opacity-40">
                          <Compass className="w-6 h-6 stroke-[1]" />
                        </div>
                        <span className="text-[7px] text-right">VECTOR ENGINE 60FPS</span>
                      </div>

                      {/* Inspector panel mock */}
                      <div 
                        onMouseEnter={() => setHoveredWireframeArea('inspector')}
                        onMouseLeave={() => setHoveredWireframeArea(null)}
                        className={`w-24 border rounded transition-all flex flex-col justify-between p-1.5 cursor-pointer ${
                          hoveredWireframeArea === 'inspector' ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400' : 'bg-[#070b13] border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="border-b border-slate-800 pb-0.5 text-[7px] uppercase font-bold">Inspector</div>
                        <div className="flex-1 flex flex-col justify-center gap-1 text-[8px] text-slate-500">
                          <span>[Prop: 0.12]</span>
                          <span>[Geom: Zone]</span>
                        </div>
                        <span className="text-[7px]">w-80</span>
                      </div>

                    </div>

                    {/* Bottom Console mock */}
                    <div 
                      onMouseEnter={() => setHoveredWireframeArea('console')}
                      onMouseLeave={() => setHoveredWireframeArea(null)}
                      className={`h-8 border rounded transition-all flex items-center justify-between px-2 cursor-pointer ${
                        hoveredWireframeArea === 'console' ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400' : 'bg-[#070b13] border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>CONSOLE_OUTPUT_DOCK [h-32 / 128px]</span>
                      <span className="text-[8px]">LOG_STREAM</span>
                    </div>

                    {/* Status bar mock */}
                    <div 
                      onMouseEnter={() => setHoveredWireframeArea('statusbar')}
                      onMouseLeave={() => setHoveredWireframeArea(null)}
                      className={`h-5 border rounded transition-all flex items-center justify-between px-2 cursor-pointer ${
                        hoveredWireframeArea === 'statusbar' ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400' : 'bg-[#070b13] border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>STATUS_BAR [h-6 / 24px]</span>
                      <span>X: 142.04 Y: -84.22</span>
                    </div>

                  </div>

                  {/* Context Panel displaying hovered metadata */}
                  <div className="bg-[#04060b] border border-slate-900 rounded p-4 font-mono text-xs text-slate-300 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">INTERACTIVE READER</span>
                      <h4 className="text-sm font-bold uppercase text-slate-100 border-b border-slate-900 pb-2 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        <span>
                          {hoveredWireframeArea === 'header' && 'Global App Header'}
                          {hoveredWireframeArea === 'nav_rail' && 'Primary Nav Rail'}
                          {hoveredWireframeArea === 'explorer' && 'Explorer Side Panel'}
                          {hoveredWireframeArea === 'canvas' && 'Main Workspace Canvas'}
                          {hoveredWireframeArea === 'inspector' && 'Inspector Side Panel'}
                          {hoveredWireframeArea === 'console' && 'Bottom Output Panel'}
                          {hoveredWireframeArea === 'statusbar' && 'Compact Status Bar'}
                          {!hoveredWireframeArea && 'Select / Hover Component'}
                        </span>
                      </h4>

                      <div className="mt-3 space-y-2.5 text-[11px] text-slate-400 leading-relaxed">
                        {hoveredWireframeArea === 'header' && (
                          <>
                            <p><strong>Strict Bounds:</strong> Fixed 56px height. Background `#070b13`.</p>
                            <p><strong>Responsibilities:</strong> Houses only the app brand logo, workspace coordinate switchers, WGS84 global query search, live calibration engine alerts, and profiles.</p>
                            <p className="text-amber-500 font-bold">Rule: Never host module-specific action buttons or dashboard parameters here.</p>
                          </>
                        )}
                        {hoveredWireframeArea === 'nav_rail' && (
                          <>
                            <p><strong>Strict Bounds:</strong> Width is 64px collapsed, 256px expanded. Centered icons.</p>
                            <p><strong>Responsibilities:</strong> High-priority vertical workspace selectors. Houses ONLY top-level engineering routes (Dashboard, Projects, Workspace, Reports, Knowledge, Settings).</p>
                            <p className="text-amber-500 font-bold">Rule: Icons must strictly use Lucide library, and cannot contain nested trees or accordions.</p>
                          </>
                        )}
                        {hoveredWireframeArea === 'explorer' && (
                          <>
                            <p><strong>Strict Bounds:</strong> Width 220px to 360px resizable. Left aligned.</p>
                            <p><strong>Responsibilities:</strong> Adapts automatically to the active navigation module. Renders project folders, spatial layer indices, coordinates lists, or report outline hierarchies.</p>
                            <p className="text-amber-500 font-bold">Rule: Must feature a 32px alphanumeric tree-filter input at the top.</p>
                          </>
                        )}
                        {hoveredWireframeArea === 'canvas' && (
                          <>
                            <p><strong>Strict Bounds:</strong> Min 65% width. Dominates center layout.</p>
                            <p><strong>Responsibilities:</strong> Precision engineering viewport. Renders 2D CAD drafting planes, 3D digital twin meshes, and aligned Vastu mandala energy coordinate models.</p>
                            <p className="text-amber-500 font-bold">Rule: Sizing is strictly derived via ResizeObserver on wrapper container. Never write static browser dimension hooks.</p>
                          </>
                        )}
                        {hoveredWireframeArea === 'inspector' && (
                          <>
                            <p><strong>Strict Bounds:</strong> Width 280px to 420px. Right aligned.</p>
                            <p><strong>Responsibilities:</strong> Diagnostic parameter input and geometric readings. Contains strictly five constant tabs: Properties, Geometry, Analysis, Metadata, History.</p>
                            <p className="text-amber-500 font-bold">Rule: If no spatial entity is selected, it must render a visually matted descriptive guide (progressive disclosure).</p>
                          </>
                        )}
                        {hoveredWireframeArea === 'console' && (
                          <>
                            <p><strong>Strict Bounds:</strong> Height 120px to 280px resizable. Docked bottom.</p>
                            <p><strong>Responsibilities:</strong> Collapsible terminal and log runner. Emits spatial compiler steps, physics simulation readouts, calibration coordinates log, and API response logs.</p>
                            <p className="text-amber-500 font-bold">Rule: Can be toggled on/off instantly via hotkey `Ctrl + ~` without resetting the main canvas.</p>
                          </>
                        )}
                        {hoveredWireframeArea === 'statusbar' && (
                          <>
                            <p><strong>Strict Bounds:</strong> Fixed 24px height. Muted background `#070b13`.</p>
                            <p><strong>Responsibilities:</strong> Compact technical parameters. Monospace readouts of cursor hover coordinates (X/Y/Z), grid zoom level, snap-grid locks, and pending queue sync status.</p>
                            <p className="text-amber-500 font-bold">Rule: Zero standard text body. Only uppercase monospace codes permitted.</p>
                          </>
                        )}
                        {!hoveredWireframeArea && (
                          <p className="italic text-slate-500">Move your cursor over any portion of the left wireframe mock application shell to see its designated spatial boundaries and layout constraints.</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-3 mt-4 text-[10px] text-slate-500 font-mono">
                      <span>URJA_CORE_SHELL_SPEC</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FIVE SPECIFICATIONS IN TAB 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                
                {/* 1. Complete Application Architecture */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 01</span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase">Desktop Application Architecture</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The URJAFLUX shell is established as a single-page application frame. 
                    It completely forbids standard vertical stacking layouts and treats the viewport as a rigid grid with fixed bounds (`height: 100vh`).
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Viewport is locked to layout shell grid blocks.</li>
                    <li>Global components use precise z-index staging (`Z-INDEX: 10` for panels, `Z-INDEX: 30` for floating dropdowns, `Z-INDEX: 50` for notifications).</li>
                    <li>Shared container frames must occupy a unified canvas wrapper.</li>
                  </ul>
                </div>

                {/* 2. Navigation Specification */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 02</span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase">Navigation Architecture</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Module switches happen exclusively through the Left Navigation Rail. 
                    No router redirecting that results in blank screen flicker is allowed. Everything occurs inside the continuous application runtime.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Navigation triggers module configuration changes in the Explorer.</li>
                    <li>The Left Rail remains collapsed at `16w / 64px` to maximize drafting width.</li>
                    <li>Hotkeys `Alt + [1-6]` are registered to instantly swap active layouts.</li>
                  </ul>
                </div>

                {/* 3. Workspace Blueprint */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 03</span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase">Workspace Blueprint</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The main drafting viewport is an uncompromised high-performance region. 
                    It dynamically swaps rendering contexts (SVG for 2D, WebGL/ThreeJS canvas for 3D digital twins).
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Minimum workspace footprint width must not drop below 65%.</li>
                    <li>The canvas relies on parent boundaries via `ResizeObserver` loops.</li>
                    <li>Tabs at the top enable multiple engineering projects to stay open without cache loss.</li>
                  </ul>
                </div>

                {/* 4. Layout Rules */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 04</span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase">Layout Rules (Anti-Slop Alignment)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    To maintain spatial precision, double-line overlaps and visual thickness build-up are banned. 
                    Layout components must align to shared boundaries.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Use negative overlapping margins (e.g. `border-r -mr-[1px]`) to resolve double borders.</li>
                    <li>Border widths are locked to exactly `1px`.</li>
                    <li>All boxes must utilize a strict 8px visual padding increment layout.</li>
                  </ul>
                </div>

                {/* 5. Future Expansion Rules */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3 md:col-span-2">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 05</span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase">Future Expansion Rules (SDK Registry Protocol)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Future sub-modules (e.g., physical simulation models, external API collectors) must not build custom sidebars or duplicate controls. 
                    They must strictly register as plugins following standard interface declarations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-slate-400 mt-2">
                    <div className="bg-[#04060b] border border-slate-900 p-3 rounded">
                      <span className="text-indigo-400 font-bold block mb-1">Registration Standard Interface</span>
                      <code>
                        interface IUrjafluxModule &#123;<br />
                        &nbsp;&nbsp;id: string;<br />
                        &nbsp;&nbsp;getExplorerComponent(): React.Component;<br />
                        &nbsp;&nbsp;getToolbarControls(): IToolItem[];<br />
                        &nbsp;&nbsp;getInspectorData(id: string): IPropData;<br />
                        &#125;
                      </code>
                    </div>
                    <div className="bg-[#04060b] border border-slate-900 p-3 rounded">
                      <span className="text-emerald-400 font-bold block mb-1">Dynamic Rendering Pipeline</span>
                      <p className="leading-relaxed">
                        When a custom plugin is selected, the layout manager immediately clears previous Explorer states and mounts the returned sub-components, maintaining absolute visual consistency.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PANEL STANDARDS & DOCKING */}
          {/* ========================================================= */}
          {activeTab === 'panels' && (
            <div className="space-y-10 animate-fade-in">
              <div className="border-b border-slate-900 pb-4">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">CHAPTER 02</span>
                <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight mt-1">Workspace Panels & Docking Standards</h2>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Specifications detailing the Explorer, Inspector, Canvas Grid, Toolbar, and bottom Console metrics. Includes the live Docking state engine simulator.
                </p>
              </div>

              {/* DOCKING SIMULATOR */}
              <div className="bg-[#070b13] border border-slate-900 p-6 rounded space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Docking Framework Engine State</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Cycle through docking nodes to see the live layout state calculation serialized by the system.</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {['LEFT', 'RIGHT', 'BOTTOM', 'FLOAT'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSimDockState(mode as any)}
                        className={`px-2 py-1 text-[10px] font-mono font-bold rounded border uppercase ${
                          simDockState === mode 
                            ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Dock {mode}
                      </button>
                    ))}
                    <span className="h-4 w-[1px] bg-slate-800 mx-2" />
                    <button
                      onClick={() => setSimCollapsed(!simCollapsed)}
                      className={`px-2 py-1 text-[10px] font-mono font-bold rounded border uppercase ${
                        simCollapsed 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {simCollapsed ? 'Collapsed' : 'Expanded'}
                    </button>
                  </div>
                </div>

                {/* Simulator Visualizer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
                  {/* Visual Render Grid */}
                  <div className="lg:col-span-2 border border-slate-900 h-52 bg-[#04060b] rounded relative overflow-hidden flex p-1 gap-1">
                    
                    {/* Left Explorer Panel */}
                    <div className={`border rounded p-1.5 flex flex-col justify-between bg-[#070b13] transition-all duration-300 ${
                      simDockState === 'LEFT' 
                        ? (simCollapsed ? 'w-8 border-amber-500/50' : 'w-32 border-emerald-500/50') 
                        : 'w-16 border-slate-800'
                    }`}>
                      <div className="border-b border-slate-850 pb-0.5 text-[8px] text-slate-400 uppercase font-bold truncate">Explorer</div>
                      <div className="text-[8px] text-slate-500 italic truncate">{simDockState === 'LEFT' ? (simCollapsed ? 'C' : 'Tree items') : 'Default'}</div>
                      <div className="text-[8px] text-slate-400 truncate">{simDockState === 'LEFT' ? 'D_LEFT' : 'STATIC'}</div>
                    </div>

                    {/* Central Canvas Container */}
                    <div className="flex-1 border border-slate-800 bg-[#030508] rounded flex flex-col justify-between p-2">
                      <div className="text-[8px] text-slate-500 flex justify-between">
                        <span>WORKSPACE_CENTER</span>
                        <span>GRID_CALIBRATED</span>
                      </div>
                      
                      {/* Simulated float panel if floating is active */}
                      {simDockState === 'FLOAT' && (
                        <div className="absolute top-12 left-1/4 w-36 border border-indigo-500/50 bg-[#0b1322] rounded p-1.5 shadow-2xl z-10 animate-fade-in text-[8px]">
                          <div className="flex justify-between border-b border-slate-800 pb-0.5 font-bold text-slate-200">
                            <span>FLOATING_PANE</span>
                            <Maximize2 className="w-2 h-2 text-indigo-400" />
                          </div>
                          <span className="text-slate-400 mt-1 block">X: 15.4 Y: -82.1</span>
                        </div>
                      )}

                      <div className="text-[8px] text-slate-400 text-center uppercase">precision_twin_mesh</div>
                      <div className="text-[8px] text-slate-500 text-right">Z_AXIS: 0.00m</div>
                    </div>

                    {/* Right Inspector Panel */}
                    <div className={`border rounded p-1.5 flex flex-col justify-between bg-[#070b13] transition-all duration-300 ${
                      simDockState === 'RIGHT' 
                        ? (simCollapsed ? 'w-8 border-amber-500/50' : 'w-32 border-emerald-500/50') 
                        : 'w-16 border-slate-800'
                    }`}>
                      <div className="border-b border-slate-850 pb-0.5 text-[8px] text-slate-400 uppercase font-bold truncate">Inspector</div>
                      <div className="text-[8px] text-slate-500 italic truncate">{simDockState === 'RIGHT' ? (simCollapsed ? 'C' : 'Properties') : 'Default'}</div>
                      <div className="text-[8px] text-slate-400 truncate">{simDockState === 'RIGHT' ? 'D_RIGHT' : 'STATIC'}</div>
                    </div>

                    {/* Bottom Console Panel (if active) */}
                    <div className={`absolute bottom-1 left-1 right-1 bg-[#0b1322]/90 border border-indigo-500/40 rounded px-2 py-1 transition-all ${
                      simDockState === 'BOTTOM' ? (simCollapsed ? 'h-6 opacity-80' : 'h-16') : 'h-0 opacity-0 overflow-hidden'
                    }`}>
                      <div className="flex justify-between items-center text-[7px] text-indigo-400 font-bold uppercase">
                        <span>Docked Console Output</span>
                        <span>[STREAMING]</span>
                      </div>
                      {!simCollapsed && <div className="text-[7px] text-slate-500 mt-1">STRE_COORDS_RESOLVED: 95.82 Hz • ALL CORE PHYSICS OK</div>}
                    </div>

                  </div>

                  {/* Serialized JSON Config readout */}
                  <div className="bg-[#04060b] border border-slate-900 rounded p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">LAYOUT ENGINE JSON STATE</span>
                      <div className="bg-slate-950 p-3 rounded border border-slate-900 text-[10px] text-emerald-400 font-mono overflow-x-auto">
                        <pre>
{`{
  "paneId": "urja_inspector_dock",
  "dockState": "DOCKED_${simDockState}",
  "isCollapsed": ${simCollapsed},
  "dimensions": {
    "width": ${simCollapsed ? 32 : simWidth}px,
    "height": "100%"
  },
  "constraints": {
    "minWidth": 240,
    "maxWidth": 420
  }
}`}
                        </pre>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-3 italic">Live computed configurations synchronized to persistent user workspace profiles.</p>
                  </div>
                </div>
              </div>

              {/* SIX SPECIFICATIONS IN TAB 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
                
                {/* 1. Explorer Standards */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 06</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase">Explorer Panel Standards</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    explorer operates strictly on left-dock coordinates. Width constraints are locked between 220px (minimum readability) and 360px (maximum drafting width).
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Alphanumeric filter header is mandatory.</li>
                    <li>Tree depth must be capped at 3 folder levels deep.</li>
                    <li>Row heights are fixed to exactly 24px.</li>
                  </ul>
                </div>

                {/* 2. Inspector Standards */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 07</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase">Inspector Panel Standards</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    inspector is the dedicated panel for entity metadata, alignment geometry, and energetic rating diagnostics.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Strictly 5 categories: Properties, Geometry, Analysis, Metadata, History.</li>
                    <li>Input field measurements must explicitly state metric units (m, mm, deg).</li>
                    <li>Readouts must be right-justified monospace.</li>
                  </ul>
                </div>

                {/* 3. Canvas Standards */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 08</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase">Canvas Viewport Standards</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The canvas serves as the spatial operating core. Absolute backgrounds are restricted to safe dark slate `#04060b`.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Major grid interval color: `#1e293b` (10m metrics).</li>
                    <li>Minor grid interval color: `#0d1525` (1m metrics).</li>
                    <li>Crosshair coordinates indicator fixed at `0, 0` origin.</li>
                  </ul>
                </div>

                {/* 4. Toolbar Standards */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 09</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase">Toolbar Standards</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tool controls float strictly inside the central canvas, positioned either top-center or mounted immediately above the drafting frame.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Button dimensions are locked to exactly `32px x 32px`.</li>
                    <li>Visual categories separated by `1px` vertical dividers.</li>
                    <li>Disabled tools must show a muted opacity of `0.4`.</li>
                  </ul>
                </div>

                {/* 5. Status Bar Standards */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 10</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase">Status Bar Standards</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sticky compact status bar at the bottom layout. Serves as the micro-diagnostic telemetry stream for coordinates and sync.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Fixed height of exactly `24px` (`h-6`).</li>
                    <li>Characters strictly uppercase JetBrains Mono monospace.</li>
                    <li>Renders: Zoom percentage, Snap state, and coordinates.</li>
                  </ul>
                </div>

                {/* 6. Docking Framework Rules */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 11</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase">Docking Framework Rules</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Panes support floating states or clean docking constraints. They can snap to left, right, or bottom regions during mouse drag.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Transitions between states use instant cubic-bezier transitions.</li>
                    <li>Floating bounds are clipped to viewport parameters.</li>
                    <li>Coordinates and sizing are fully stored in LocalStorage profiles.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: SYSTEM TOKENS */}
          {/* ========================================================= */}
          {activeTab === 'tokens' && (
            <div className="space-y-10 animate-fade-in">
              <div className="border-b border-slate-900 pb-4">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">CHAPTER 03</span>
                <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight mt-1">Design Tokens: Spacing, Colors & Typography</h2>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Official specifications defining the visual atoms of the entire operating system. All styles map to these strict values.
                </p>
              </div>

              {/* Spacing & Radii System */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 8-Point Spacing Table */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Grid className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">8-Point Spacing System</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Arbitrary margins or random padding values are strictly prohibited. Layout increments use the following standard scale:
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
                    <div className="border border-slate-900 p-2 bg-[#04060b]">
                      <span className="text-emerald-400 block font-bold">4px</span>
                      <span className="text-slate-500 text-[8px]">0.25rem (Tiny)</span>
                    </div>
                    <div className="border border-slate-900 p-2 bg-[#04060b]">
                      <span className="text-emerald-400 block font-bold">8px</span>
                      <span className="text-slate-500 text-[8px]">0.5rem (Grid Base)</span>
                    </div>
                    <div className="border border-slate-900 p-2 bg-[#04060b]">
                      <span className="text-emerald-400 block font-bold">12px</span>
                      <span className="text-slate-500 text-[8px]">0.75rem (Inner Element)</span>
                    </div>
                    <div className="border border-slate-900 p-2 bg-[#04060b]">
                      <span className="text-emerald-400 block font-bold">16px</span>
                      <span className="text-slate-500 text-[8px]">1.0rem (Container)</span>
                    </div>
                    <div className="border border-slate-900 p-2 bg-[#04060b]">
                      <span className="text-emerald-400 block font-bold">24px</span>
                      <span className="text-slate-500 text-[8px]">1.5rem (Sub-Section)</span>
                    </div>
                    <div className="border border-slate-900 p-2 bg-[#04060b]">
                      <span className="text-emerald-400 block font-bold">32px</span>
                      <span className="text-slate-500 text-[8px]">2.0rem (Section)</span>
                    </div>
                    <div className="border border-slate-900 p-2 bg-[#04060b]">
                      <span className="text-emerald-400 block font-bold">48px</span>
                      <span className="text-slate-500 text-[8px]">3.0rem (Viewport safe)</span>
                    </div>
                    <div className="border border-slate-900 p-2 bg-[#04060b]">
                      <span className="text-emerald-400 block font-bold">64px+</span>
                      <span className="text-slate-500 text-[8px]">4.0rem+ (Major break)</span>
                    </div>
                  </div>
                </div>

                {/* Mathematical Radius Scale */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Square className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Radius & Nested Corner Math</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    To prevent visual overlap and alignment dissonance, standard components use conservative corner rounding:
                  </p>
                  <ul className="space-y-2 text-[11px] font-mono">
                    <li className="flex justify-between border-b border-slate-900/60 pb-1">
                      <span className="text-slate-400">Buttons & Inputs:</span>
                      <span className="text-emerald-400 font-bold">rounded-sm (2px) or rounded (4px)</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-900/60 pb-1">
                      <span className="text-slate-400">Cards & Sidebars:</span>
                      <span className="text-emerald-400 font-bold">rounded-md (6px)</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-900/60 pb-1">
                      <span className="text-slate-400">Large Panels & Modals:</span>
                      <span className="text-emerald-400 font-bold">rounded-lg (8px)</span>
                    </li>
                    <li className="text-[10px] text-amber-500 leading-normal pt-2 italic">
                      Rule of Perfect nesting: Inner Radius = Outer Radius - Padding.<br />
                      If outer border-radius is 8px, and inner padding is 4px, the child element radius MUST be exactly 4px.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Color Tokens Directory */}
              <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Semantic Color Registry</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {semanticColors.map((color, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => triggerCopy(color.name, color.token)}
                      className="border border-slate-900 hover:border-slate-800 p-3 rounded bg-[#04060b]/40 cursor-pointer flex items-center gap-3 transition-all relative group"
                    >
                      <div className={`w-8 h-8 rounded-sm shrink-0 flex items-center justify-center ${color.preview}`}>
                        {color.content && color.content}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-200 block truncate font-mono uppercase">{color.name}</span>
                        <code className="text-[9px] text-slate-500 font-mono block truncate group-hover:text-emerald-400">{color.token}</code>
                      </div>
                      {copiedToken === color.name ? (
                        <span className="absolute right-2 top-2 text-[8px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-1 rounded font-mono">Copied</span>
                      ) : (
                        <Copy className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 absolute right-2 top-2 transition-opacity" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography Scale Specs */}
              <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Type className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Modular Typographic Scale</h3>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 font-mono text-[10px] uppercase">
                        <th className="pb-2 font-bold">Token Level</th>
                        <th className="pb-2 font-bold">Font Family & Weight</th>
                        <th className="pb-2 font-bold">Size & Line Height</th>
                        <th className="pb-2 font-bold">Visual Preview</th>
                        <th className="pb-2 font-bold">Intended Usage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-mono text-[11px] text-slate-300">
                      {typographyScale.map((font, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/10">
                          <td className="py-3 font-bold text-emerald-400">{font.level}</td>
                          <td className="py-3 text-slate-400">{font.font}<br /><span className="text-[10px] text-slate-500">{font.weight}</span></td>
                          <td className="py-3 text-slate-400">{font.size}<br /><span className="text-[10px] text-slate-500">LH {font.line}</span></td>
                          <td className="py-3">
                            <span className={font.cls}>URJAFLUX SRE</span>
                          </td>
                          <td className="py-3 text-slate-500 text-[10px]">{font.usage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: SYSTEM LOGIC & INTERACTIONS */}
          {/* ========================================================= */}
          {activeTab === 'interactions' && (
            <div className="space-y-10 animate-fade-in">
              <div className="border-b border-slate-900 pb-4">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">CHAPTER 04</span>
                <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight mt-1">Workspace State & Interaction Specifications</h2>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  State synchronization protocols, keyboard shortcut structures, micro-feedback benchmarks, and accessibility focus indexes.
                </p>
              </div>

              {/* COMMAND PALETTE INTERACTIVE SIMULATOR */}
              <div className="bg-[#070b13] border border-slate-900 p-6 rounded space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span>1. Interactive Command Palette Simulator</span>
                      <span className="text-[9px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-1 rounded font-normal">SIMULATOR</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Press <kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded text-[10px]">Ctrl + K</kbd> to launch the simulated operating console or click the button on the right.</p>
                  </div>
                  
                  <button 
                    onClick={() => setPaletteOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase font-mono rounded transition-colors"
                  >
                    Launch Cmd Console
                  </button>
                </div>

                {/* Live simulated console inside design system page */}
                {paletteOpen && (
                  <div className="border border-slate-800 rounded bg-[#04060b] shadow-2xl p-4 font-mono text-xs text-slate-300 max-w-lg mx-auto relative animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>URJA_COMMAND_PALETTE_PROMPT</span>
                      </div>
                      <button onClick={() => setPaletteOpen(false)} className="text-slate-500 hover:text-slate-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-[#070b13] border border-slate-900 rounded px-2.5 py-1.5 mb-3">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        value={paletteQuery}
                        onChange={(e) => {
                          setPaletteQuery(e.target.value);
                          setSelectedPaletteIndex(0);
                        }}
                        placeholder="Search workspace commands, tools, or navigation routes..." 
                        className="bg-transparent focus:outline-none w-full text-xs text-slate-200 font-mono" 
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, idx) => (
                          <div 
                            key={cmd.label}
                            onMouseEnter={() => setSelectedPaletteIndex(idx)}
                            className={`px-2 py-1.5 rounded cursor-pointer flex items-center justify-between transition-colors ${
                              selectedPaletteIndex === idx ? 'bg-emerald-600/10 text-emerald-400 font-bold' : 'hover:bg-slate-900/40 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] bg-slate-900 px-1 py-0.5 rounded text-slate-500 uppercase">{cmd.category}</span>
                              <span className="text-[11px]">{cmd.label}</span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono font-normal">{cmd.shortcut}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-slate-500">No system coordinates, views or commands found for "{paletteQuery}"</div>
                      )}
                    </div>

                    <div className="border-t border-slate-900 pt-2 mt-3 flex justify-between text-[9px] text-slate-500">
                      <span>↑↓ TO NAVIGATE • ENTER TO EXECUTE</span>
                      <span>ESC TO CLOSE</span>
                    </div>
                  </div>
                )}
              </div>

              {/* FOUR SPECIFICATIONS IN TAB 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                
                {/* 1. Workspace State Management */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 12</span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase">Workspace State Management</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Decoupled rendering ensures vector coordinate recalculations bypass heavy React virtual DOM renders. 
                    UI panels sync via an event-driven pub/sub queue.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Core layout sizes and panels state are serialized cleanly on mutation.</li>
                    <li>Undo/redo history uses the command pattern block inside memory storage.</li>
                    <li>Coordinate translation requests are debounced to exactly 16ms.</li>
                  </ul>
                </div>

                {/* 2. Keyboard Shortcut Philosophy */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 13</span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase">Keyboard Shortcut Philosophy</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Designed as a keyboard-first console utility. All critical calibration commands must be accessible through precise keyboard chords.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>`V` Pointer/Selector | `H` Drag/Pan | `C` Compass calibration.</li>
                    <li>`Ctrl + K` global command palette prompt is absolute.</li>
                    <li>`Esc` removes selected entities or dismisses floating overlays instantly.</li>
                  </ul>
                </div>

                {/* 3. Interaction Principles */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 14</span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase">Interaction Principles</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Micro-feedbacks provide tactile confidence. All visual changes occur within strict, mathematically sound curve limits.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Instant clicks transition within 80ms to avoid latency.</li>
                    <li>Hover targets reveal interactive bounds with standard `hover:bg-slate-800/40`.</li>
                    <li>Progressive disclosure hides calibration targets until selection is made.</li>
                  </ul>
                </div>

                {/* 4. Accessibility Rules & Motion Curve */}
                <div className="bg-[#070b13] border border-slate-900 p-5 rounded space-y-3">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">SPECIFICATION 15</span>
                  <h4 className="text-sm font-bold text-slate-200 uppercase">Accessibility Rules & Motion Curve</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    WCAG AA compliant color contrast standards. Font rendering and focus paths conform to high physical density needs.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
                    <li>Primary text contrast ratio is strictly verified &gt; 4.5:1.</li>
                    <li>Transitions use linear easing variables: `cubic-bezier(0.16, 1, 0.3, 1)`.</li>
                    <li>Focus outline indicator is locked to `focus:border-emerald-500 focus:ring-1`.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: COMPONENT PLAYGROUND SPEC */}
          {/* ========================================================= */}
          {activeTab === 'components' && (
            <div className="space-y-12 animate-fade-in">
              <div className="border-b border-slate-900 pb-4">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">CHAPTER 05</span>
                <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight mt-1">Interactive Component Playground</h2>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Live renders of standard components following the strict design system. These components are interactive and ready for copy-paste.
                </p>
              </div>

              {/* 1. BUTTON STATES GRID */}
              <div className="bg-[#070b13] border border-slate-900 p-6 rounded space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2 flex items-center justify-between">
                  <span>SYSTEM BUTTON INTERFACES (SMALL, MEDIUM, LARGE)</span>
                  <span className="text-[9px] text-slate-500 font-normal">CLASS COMPLIANCE</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Button Spec Rows */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">1. Primary Action Button (Standard Emerald Grid Action)</span>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-[10px] uppercase font-mono rounded transition-colors duration-150">Small Pri</button>
                        <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase font-mono rounded transition-colors duration-150">Medium Primary</button>
                        <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm uppercase font-mono rounded transition-colors duration-150">Large Primary</button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">2. Secondary Slate Button (Internal Layout / Dock Controls)</span>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 bg-[#0d1424] hover:bg-[#121d34] border border-slate-800 text-slate-300 font-bold text-[10px] uppercase font-mono rounded transition-colors duration-150">Small Sec</button>
                        <button className="px-3.5 py-1.5 bg-[#0d1424] hover:bg-[#121d34] border border-slate-800 text-slate-300 font-bold text-xs uppercase font-mono rounded transition-colors duration-150">Medium Secondary</button>
                        <button className="px-6 py-2.5 bg-[#0d1424] hover:bg-[#121d34] border border-slate-800 text-slate-300 font-bold text-sm uppercase font-mono rounded transition-colors duration-150">Large Secondary</button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">3. Ghost Button (Hover states / Header Tabs)</span>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-[10px] uppercase font-mono rounded transition-colors duration-150">Small Ghost</button>
                        <button className="px-3.5 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-xs uppercase font-mono rounded transition-colors duration-150">Medium Ghost</button>
                        <button className="px-6 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-sm uppercase font-mono rounded transition-colors duration-150">Large Ghost</button>
                      </div>
                    </div>
                  </div>

                  {/* Icon Buttons & Special Action Types */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">4. Danger Action & Success Icons</span>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 bg-[#9f1239]/10 border border-[#f43f5e]/30 text-[#f43f5e] font-bold text-[10px] uppercase font-mono rounded hover:bg-[#9f1239]/20 transition-colors">Delete Entity</button>
                        <button className="px-3 py-1.5 bg-[#065f46]/20 border border-[#10b981]/30 text-emerald-400 font-bold text-[10px] uppercase font-mono rounded hover:bg-[#065f46]/30 transition-colors">Calibrate OK</button>
                        <button className="p-1.5 bg-[#0d1424] border border-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors" title="Settings">
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors" title="Confirm Alignment">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">5. Floating Actions & Toolbar Controls</span>
                      <div className="flex items-center gap-2">
                        <div className="h-7 bg-[#0d1424] border border-slate-800 rounded flex items-center p-0.5 font-mono">
                          <button className="h-full px-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-[9px] uppercase font-bold rounded-sm">2D View</button>
                          <button className="h-full px-2 text-emerald-400 bg-[#065f46]/30 text-[9px] uppercase font-bold rounded-sm border border-[#10b981]/20">3D View</button>
                          <button className="h-full px-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-[9px] uppercase font-bold rounded-sm">Orthographic</button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">6. Disabled Button Compliance (No action, visually muted)</span>
                      <div className="flex items-center gap-2">
                        <button disabled className="px-3 py-1.5 bg-[#0d1424]/40 border border-slate-900 text-slate-600 text-[10px] uppercase font-mono rounded cursor-not-allowed">Primary Disabled</button>
                        <button disabled className="px-3 py-1.5 border border-slate-900/40 text-slate-600 text-[10px] uppercase font-mono rounded cursor-not-allowed">Ghost Disabled</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. FORMS & INPUT CONTROLS */}
              <div className="bg-[#070b13] border border-slate-900 p-6 rounded space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">
                  ENTERPRISE FORMS, VALIDATIONS & FIELD STATES
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Standard Form Block */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono text-slate-400 uppercase block tracking-wider">
                      Coordinate Target ID <span className="text-[#f43f5e]">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={demoInputVal}
                      onChange={(e) => setDemoInputVal(e.target.value)}
                      className="w-full h-8 px-2.5 bg-[#04060b] border border-slate-800 rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" 
                    />
                    <span className="text-[9px] text-slate-500 font-mono block">Standard grid index formatting (STRE-ID)</span>
                  </div>

                  {/* Error State Block */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono text-slate-400 uppercase block tracking-wider">
                      Calibration Offset (Error State)
                    </label>
                    <input 
                      type="text" 
                      defaultValue="958.482 OFFSET ERROR"
                      className="w-full h-8 px-2.5 bg-[#04060b] border border-[#f43f5e]/60 rounded font-mono text-xs text-[#f43f5e] focus:outline-none focus:border-[#f43f5e]" 
                    />
                    <span className="text-[9px] text-[#f43f5e] font-mono flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 animate-pulse" /> Spatial boundary coordinate mismatch detected.
                    </span>
                  </div>

                  {/* Read Only & Disabled */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono text-slate-500 uppercase block tracking-wider">
                      WGS84 Reference Zone (Read-Only)
                    </label>
                    <input 
                      type="text" 
                      value="EPSG:4326 SYSTEM CONSTANT" 
                      readOnly
                      className="w-full h-8 px-2.5 bg-[#04060b]/40 border border-slate-900 text-slate-500 rounded font-mono text-xs cursor-default select-none" 
                    />
                    <span className="text-[9px] text-slate-600 font-mono block">System locked - calibrate via console</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-900/60">
                  {/* Select Dropdown Spec */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold font-mono text-slate-400 uppercase block tracking-wider">
                      Coordinate Reference Framework
                    </label>
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full h-8 px-2.5 bg-[#04060b] hover:bg-[#070b13] border border-slate-800 text-left text-xs text-slate-200 rounded font-mono flex items-center justify-between transition-colors"
                    >
                      <span>{selectedDropdownOption}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute left-0 mt-1 w-full bg-[#070b13] border border-slate-800 rounded shadow-xl z-20 text-xs font-mono text-slate-300 divide-y divide-slate-900">
                        {['LOCAL_GRID_WGS84', 'COMPASS_ALIGNED_CHAKRA', 'BRAHMASTHAN_CENTERED', 'EPSG_900913_WEBMERC'].map((opt) => (
                          <div 
                            key={opt}
                            onClick={() => {
                              setSelectedDropdownOption(opt);
                              setDropdownOpen(false);
                            }}
                            className={`px-2.5 py-1.5 cursor-pointer flex items-center justify-between ${
                              selectedDropdownOption === opt ? 'bg-emerald-600/10 text-emerald-400' : 'hover:bg-[#0b1322]'
                            }`}
                          >
                            <span>{opt}</span>
                            {selectedDropdownOption === opt && <Check className="w-3 h-3 text-emerald-400" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Multi-Select / Checkbox spec */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold font-mono text-slate-400 uppercase block tracking-wider">
                      Active Physics Engine Pass Constraints
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <label className="flex items-center gap-2 cursor-pointer bg-[#04060b] border border-slate-800 p-2 rounded hover:border-slate-700 transition-colors">
                        <input type="checkbox" defaultChecked className="accent-emerald-600" />
                        <span className="text-slate-300">Magnetic Grid</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-[#04060b] border border-slate-800 p-2 rounded hover:border-slate-700 transition-colors">
                        <input type="checkbox" defaultChecked className="accent-emerald-600" />
                        <span className="text-slate-300">Vastu Mandala (9x9)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ENTERPRISE DATA TABLE */}
              <div className="bg-[#070b13] border border-slate-900 p-6 rounded space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">
                  ENTERPRISE DATA TABLE (STRE GRID SPECIFICATION)
                </h4>

                <div className="border border-slate-900 rounded overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#0b1322] border-b border-slate-900 text-slate-400 font-bold text-[10px] uppercase">
                        <th className="p-3 w-8">
                          <input type="checkbox" className="accent-emerald-600" />
                        </th>
                        <th className="p-3">Entity Key</th>
                        <th className="p-3">Coordinate Position</th>
                        <th className="p-3">Vgrid Classification</th>
                        <th className="p-3">Energy Rating</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300">
                      {/* Row 1 - Selected State */}
                      <tr className="bg-emerald-600/5 text-emerald-400 border-l border-emerald-500 font-bold">
                        <td className="p-3">
                          <input type="checkbox" defaultChecked className="accent-emerald-600" />
                        </td>
                        <td className="p-3">marker_01</td>
                        <td className="p-3">X: 0.0m, Y: 0.0m, Z: 0.0m</td>
                        <td className="p-3">Brahmasthan (Center Core)</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-400 text-[9px] rounded font-mono font-bold">100/100 PURE</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> LOCKED
                          </span>
                        </td>
                      </tr>

                      {/* Row 2 - Hovered/Normal State */}
                      <tr className="hover:bg-[#0b1322]/40 transition-colors">
                        <td className="p-3">
                          <input type="checkbox" className="accent-emerald-600" />
                        </td>
                        <td className="p-3">wall_01</td>
                        <td className="p-3">X: -12.5m, Y: 8.4m, Z: 0.0m</td>
                        <td className="p-3">North Boundary Fence</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 bg-indigo-600/10 text-indigo-400 text-[9px] rounded font-mono">82/100 SHIELD</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 text-slate-400 text-[10px]">
                            ACTIVE
                          </span>
                        </td>
                      </tr>

                      {/* Row 3 - Warning State */}
                      <tr className="hover:bg-[#0b1322]/40 bg-amber-500/[0.02] text-amber-500">
                        <td className="p-3">
                          <input type="checkbox" className="accent-emerald-600" />
                        </td>
                        <td className="p-3">hvac_01</td>
                        <td className="p-3">X: 18.2m, Y: -14.1m, Z: 2.2m</td>
                        <td className="p-3">Southeast Zone (Agni Flux)</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 bg-amber-600/10 text-amber-400 text-[9px] rounded font-mono font-bold">45/100 DAMPED</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 text-amber-500 text-[10px]">
                            CALIBRATING
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. TREE VIEW COORD EXPANSION */}
              <div className="bg-[#070b13] border border-slate-900 p-6 rounded space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">
                  ENTERPRISE SPATIAL OBJECT TREE (WORKTREE SPEC)
                </h4>

                <div className="w-80 bg-[#04060b] border border-slate-900 rounded p-2.5 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center gap-2 px-1.5 py-1 bg-[#070b13] border border-slate-900/60 rounded mb-2">
                    <Search className="w-3 h-3 text-slate-500" />
                    <input type="text" placeholder="Filter entities..." className="bg-transparent focus:outline-none text-[10px] w-full text-slate-300" />
                  </div>

                  {/* Root Node */}
                  <div className="space-y-0.5">
                    <div 
                      onClick={() => toggleTreeNode('root')}
                      className="flex items-center gap-1.5 py-1 px-1.5 hover:bg-slate-900 rounded-sm cursor-pointer"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${treeExpanded['root'] ? '' : '-rotate-90'}`} />
                      <Folder className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold">UrjaProject_Core</span>
                    </div>

                    {/* Level 1 Nodes */}
                    {treeExpanded['root'] && (
                      <div className="pl-4 space-y-0.5">
                        
                        {/* Site Folder */}
                        <div 
                          onClick={() => toggleTreeNode('site_01')}
                          className="flex items-center gap-1.5 py-1 px-1.5 hover:bg-slate-900 rounded-sm cursor-pointer"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${treeExpanded['site_01'] ? '' : '-rotate-90'}`} />
                          <Folder className="w-3.5 h-3.5 text-amber-400" />
                          <span>Coordinates_Main_Grid</span>
                        </div>

                        {/* Level 2 Nodes (Coordinates Files) */}
                        {treeExpanded['site_01'] && (
                          <div className="pl-4 space-y-0.5">
                            <div 
                              onClick={(e) => selectTreeNode('room_101', e)}
                              className={`flex items-center justify-between py-1 px-1.5 rounded-sm cursor-pointer ${
                                selectedTreeNodes.includes('room_101') ? 'bg-emerald-600/10 text-emerald-400 font-bold' : 'hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <File className="w-3.5 h-3.5 text-slate-500" />
                                <span>marker_01 [Brahmasthan]</span>
                              </div>
                              <span className="text-[8px] text-emerald-500 font-bold">GRID_LOCKED</span>
                            </div>

                            <div 
                              onClick={(e) => selectTreeNode('room_102', e)}
                              className={`flex items-center justify-between py-1 px-1.5 rounded-sm cursor-pointer ${
                                selectedTreeNodes.includes('room_102') ? 'bg-emerald-600/10 text-emerald-400 font-bold' : 'hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <File className="w-3.5 h-3.5 text-slate-500" />
                                <span>wall_01 [Outer Boundary]</span>
                              </div>
                              <span className="text-[8px] text-slate-500">2D_Vect</span>
                            </div>
                          </div>
                        )}

                        {/* Building A Folder (Closed) */}
                        <div 
                          onClick={() => toggleTreeNode('building_A')}
                          className="flex items-center gap-1.5 py-1 px-1.5 hover:bg-slate-900 rounded-sm cursor-pointer"
                        >
                          <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${treeExpanded['building_A'] ? 'rotate-90' : ''}`} />
                          <Folder className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Energy_Harmonics_Layer</span>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. DIAGNOSTICS & SYSTEM STATUS STATES */}
              <div className="bg-[#070b13] border border-slate-900 p-6 rounded space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">
                  FEEDBACK INDICATORS, SYSTEM STATES & LOADERS
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
                  {/* Status Badges */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-500 uppercase block">State Badges (Categorized)</span>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-[9px] uppercase tracking-wider">OK / Locked</span>
                        <span className="px-2 py-0.5 bg-amber-500/15 text-amber-500 border border-amber-500/20 rounded-full font-bold text-[9px] uppercase tracking-wider">Mismatched</span>
                        <span className="px-2 py-0.5 bg-rose-600/15 text-[#f43f5e] border border-rose-500/20 rounded-full font-bold text-[9px] uppercase tracking-wider">Failure Core</span>
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-bold text-[9px] uppercase tracking-wider">Compiling</span>
                      </div>
                    </div>

                    {/* Progress Indicator Spec */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-500 uppercase block">Spatial Analysis Progress (72% Realized)</span>
                      <div className="w-full bg-[#04060b] border border-slate-900 h-2.5 rounded-sm p-0.5">
                        <div className="h-full bg-emerald-600 rounded-sm" style={{ width: '72%' }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                        <span>CALIBRATING HARMONIC PASS</span>
                        <span>72% COMPLETE</span>
                      </div>
                    </div>
                  </div>

                  {/* Skeletons & Feedbacks */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-500 uppercase block">Skeletal Data Loading Placeholder (No layout jump)</span>
                      <div className="border border-slate-900/60 p-3 rounded bg-[#04060b]/40 space-y-2 animate-pulse">
                        <div className="h-3 bg-[#0d1424] rounded w-1/3" />
                        <div className="h-2.5 bg-[#0d1424] rounded w-full" />
                        <div className="h-2.5 bg-[#0d1424] rounded w-2/3" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-500 uppercase block">Loader Sequence</span>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        <span>Compiling vector geometries into spatial twin...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          </div>
        </div>
      )}
    </div>
  );
}
