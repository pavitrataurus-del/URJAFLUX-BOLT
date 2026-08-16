import React, { useState, useEffect } from "react";
import { 
  Terminal, Play, Cpu, RefreshCw, Layers, Shield, Activity, 
  Settings, Key, AlertTriangle, CheckCircle2, Server, Globe, 
  Sliders, ArrowRight, CornerDownRight, Database, GitMerge, 
  HelpCircle, Info, Lock, Network, Search, Zap, Trash2, 
  Eye, Save, RotateCcw, RotateCw, ListFilter, AlertCircle, Sparkles,
  User, Check, Clock, FileText, ChevronRight, X, Briefcase, BarChart2
} from "lucide-react";

// Types for Simulated OS State
interface CommandLog {
  id: string;
  name: string;
  timestamp: string;
  status: "SUCCESS" | "VALIDATING" | "ROLLED_BACK" | "EXECUTED";
  transactionId?: string;
}

interface EventLog {
  id: string;
  name: string;
  payload: string;
  timestamp: string;
}

interface BackgroundJob {
  id: string;
  name: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  progress: number;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  duration: string;
}

export default function ApplicationKernelPage() {
  // Navigation & Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    | "diagram"
    | "boot"
    | "registry"
    | "managers"
    | "commands"
    | "jobs"
    | "security"
    | "future"
  >("diagram");

  // Telemetry state simulation
  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState(42.4);
  const [activeJobsCount, setActiveJobsCount] = useState(2);
  const [eventCount, setEventCount] = useState(148);
  const [lastAction, setLastAction] = useState<string>("SYSTEM_IDLE");

  // 2. Boot sequence selected step
  const [bootStep, setBootStep] = useState<number>(10);
  const [bootLog, setBootLog] = useState<string[]>([
    "[KERNEL] Initializing Configuration layer...",
    "[KERNEL] Environment loaded successfully.",
    "[SEC] Executed secure profile initialization for pavitra.taurus@gmail.com",
    "[BOOT] Core Services registered (EntityService, RuleEngineService).",
    "[PLUGINS] Mounted 14 enterprise plugins cleanly.",
    "[BOOT] Restored workspace coordinate bounds.",
    "[DATABASE] Local indexing for WGS84 coordinates completed.",
    "[BOOT] Session successfully fully restored. Ready."
  ]);

  // 9. Command System state simulation
  const [commandHistory, setCommandHistory] = useState<CommandLog[]>([
    { id: "cmd_101", name: "DrawWall {p1: [0,0], p2: [10,0]}", timestamp: "12:10:01", status: "SUCCESS" },
    { id: "cmd_102", name: "PlaceDoor {placementOffset: 3.5m}", timestamp: "12:10:15", status: "SUCCESS" },
    { id: "cmd_103", name: "RunVastuAnalysis", timestamp: "12:10:30", status: "SUCCESS" },
  ]);
  const [redoHistory, setRedoHistory] = useState<CommandLog[]>([]);
  const [activeTransaction, setActiveTransaction] = useState<string | null>(null);

  // 10. Event Bus simulated stream
  const [eventsStream, setEventsStream] = useState<EventLog[]>([
    { id: "evt_302", name: "WorkspaceChanged", payload: "{ zoom: 1.25, pan: [120, -45] }", timestamp: "12:10:48" },
    { id: "evt_301", name: "AnalysisCompleted", payload: "{ vastuScore: 88.5, pranaEfficiency: 92 }", timestamp: "12:10:30" },
    { id: "evt_300", name: "EntityCreated", payload: "{ id: 'ent_902', type: 'Door', hostedBy: 'ent_002' }", timestamp: "12:10:15" }
  ]);

  // 13. Background Job System state
  const [jobs, setJobs] = useState<BackgroundJob[]>([
    { id: "job_01", name: "Rasterizing imported High-Res architectural PDF blueprint", priority: "HIGH", progress: 100, status: "COMPLETED", duration: "1.2s" },
    { id: "job_02", name: "Evaluating structural loading algorithms (10,000 spatial vectors)", priority: "CRITICAL", progress: 45, status: "RUNNING", duration: "2.4s" },
    { id: "job_03", name: "Gemini AI Semantic categorization of space notes", priority: "MEDIUM", progress: 0, status: "QUEUED", duration: "Pending" },
    { id: "job_04", name: "Indexing Knowledge Graph database links", priority: "LOW", progress: 0, status: "QUEUED", duration: "Pending" }
  ]);

  // Command input simulation state
  const [cmdInput, setCmdInput] = useState("MoveObject {id: 'ent_003', dx: 4.5, dy: 0}");

  // Triggering telemetry animations
  useEffect(() => {
    const interval = setInterval(() => {
      // Small randomized fluctuations for visual dynamics
      setFps(Math.floor(58 + Math.random() * 4));
      setMemory(parseFloat((42.1 + Math.random() * 0.6).toFixed(1)));
      
      // Progress increment for jobs
      setJobs(prev => prev.map(job => {
        if (job.status === "RUNNING") {
          const nextProg = job.progress + Math.floor(Math.random() * 12);
          if (nextProg >= 100) {
            return { ...job, progress: 100, status: "COMPLETED", duration: "3.2s" };
          }
          return { ...job, progress: nextProg };
        }
        return job;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteCommand = (customCmd?: string) => {
    const commandText = customCmd || cmdInput;
    if (!commandText.trim()) return;

    const time = new Date().toLocaleTimeString();
    const cmdId = `cmd_${100 + commandHistory.length + 1}`;
    
    // Create new transaction logic
    const isTransActive = activeTransaction !== null;
    const newCmd: CommandLog = {
      id: cmdId,
      name: commandText,
      timestamp: time,
      status: isTransActive ? "EXECUTED" : "SUCCESS",
      transactionId: activeTransaction || undefined
    };

    setCommandHistory(prev => [newCmd, ...prev]);
    setRedoHistory([]);
    setLastAction(`COMMAND: ${commandText.split(" ")[0]}`);

    // Trigger associated event
    const evtId = `evt_${300 + eventsStream.length + 1}`;
    const newEvt: EventLog = {
      id: evtId,
      name: "EntityModified",
      payload: `{ commandId: "${cmdId}", expression: "${commandText}" }`,
      timestamp: time
    };
    setEventsStream(prev => [newEvt, ...prev]);
    setEventCount(c => c + 1);

    if (!customCmd) {
      setCmdInput("");
    }
  };

  const handleUndo = () => {
    if (commandHistory.length === 0) return;
    const nextCmds = [...commandHistory];
    const undone = nextCmds.shift();
    if (undone) {
      setCommandHistory(nextCmds);
      setRedoHistory(prev => [undone, ...prev]);
      setLastAction(`UNDO: ${undone.name.split(" ")[0]}`);
      
      // Fire Event
      const time = new Date().toLocaleTimeString();
      setEventsStream(prev => [{
        id: `evt_${400 + prev.length}`,
        name: "UndoExecuted",
        payload: `{ revertedCommandId: "${undone.id}" }`,
        timestamp: time
      }, ...prev]);
    }
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;
    const nextRedos = [...redoHistory];
    const redone = nextRedos.shift();
    if (redone) {
      setCommandHistory(prev => [redone, ...prev]);
      setRedoHistory(nextRedos);
      setLastAction(`REDO: ${redone.name.split(" ")[0]}`);
      
      // Fire Event
      const time = new Date().toLocaleTimeString();
      setEventsStream(prev => [{
        id: `evt_${400 + prev.length}`,
        name: "RedoExecuted",
        payload: `{ reappliedCommandId: "${redone.id}" }`,
        timestamp: time
      }, ...prev]);
    }
  };

  const handleBeginTransaction = () => {
    const txId = `tx_00${Math.floor(100 + Math.random() * 900)}`;
    setActiveTransaction(txId);
    setLastAction("TRANSACTION_BEGIN");
    
    const time = new Date().toLocaleTimeString();
    setEventsStream(prev => [{
      id: `evt_tx_${prev.length}`,
      name: "TransactionBegun",
      payload: `{ transactionId: "${txId}" }`,
      timestamp: time
    }, ...prev]);
  };

  const handleCommitTransaction = () => {
    if (!activeTransaction) return;
    const txId = activeTransaction;
    setActiveTransaction(null);
    setLastAction("TRANSACTION_COMMIT");

    // Upgrade all commands under this transaction to success
    setCommandHistory(prev => prev.map(cmd => {
      if (cmd.transactionId === txId) {
        return { ...cmd, status: "SUCCESS" };
      }
      return cmd;
    }));

    const time = new Date().toLocaleTimeString();
    setEventsStream(prev => [{
      id: `evt_tx_${prev.length}`,
      name: "TransactionCommitted",
      payload: `{ transactionId: "${txId}", status: "ATOMIC_COMMIT_SUCCESS" }`,
      timestamp: time
    }, ...prev]);
  };

  const handleRollbackTransaction = () => {
    if (!activeTransaction) return;
    const txId = activeTransaction;
    setActiveTransaction(null);
    setLastAction("TRANSACTION_ROLLBACK");

    // Rollback commands belonging to active transaction
    setCommandHistory(prev => prev.map(cmd => {
      if (cmd.transactionId === txId) {
        return { ...cmd, status: "ROLLED_BACK" };
      }
      return cmd;
    }));

    const time = new Date().toLocaleTimeString();
    setEventsStream(prev => [{
      id: `evt_tx_${prev.length}`,
      name: "TransactionRolledBack",
      payload: `{ transactionId: "${txId}", status: "STATE_RESTORED" }`,
      timestamp: time
    }, ...prev]);
  };

  const triggerJobRun = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, status: "RUNNING", progress: 10 };
      }
      return j;
    }));
    setLastAction(`JOB_START: ${jobId}`);
  };

  return (
    <div className="w-full h-full bg-[#04060a] flex flex-col overflow-hidden font-mono text-[11px] text-slate-300">
      
      {/* 1. TOP STATS BAR (TELEMETRY STRATEGY) */}
      <div className="h-10 shrink-0 bg-[#060a12] border-b border-slate-900/80 flex items-center justify-between px-6 select-none z-10">
        <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-[9px] uppercase tracking-widest">LIVE KERNEL TELEMETRY MONITOR</span>
        </div>

        <div className="flex items-center gap-6 text-[9px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">SYS_HEALTH:</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.2 rounded">100.0% STABLE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">CORE_LOAD_FPS:</span>
            <span className="font-bold text-slate-200">{fps} FPS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">HEAP_MEMORY:</span>
            <span className="font-bold text-slate-200">{memory} MB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">ACTIVE_JOBS:</span>
            <span className="font-bold text-slate-200">{jobs.filter(j => j.status === "RUNNING").length} IN_FLIGHT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">LAST_SYSTEM_OP:</span>
            <span className="font-bold text-amber-500">{lastAction}</span>
          </div>
        </div>
      </div>

      {/* 2. TAB SUB-NAV BAR */}
      <div className="h-9 shrink-0 bg-[#080d19] border-b border-slate-900/60 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-1">
          {[
            { id: "diagram", label: "Runtime Diagram", icon: Layers },
            { id: "boot", label: "Boot Sequence", icon: Cpu },
            { id: "registry", label: "Module & Plugin Framework", icon: Network },
            { id: "managers", label: "Manager & Service Layer", icon: Sliders },
            { id: "commands", label: "Interactive Transaction Stack", icon: GitMerge },
            { id: "jobs", label: "Background Processing System", icon: Clock },
            { id: "security", label: "Security & Permissions", icon: Shield },
            { id: "future", label: "Future & Extensibility Specs", icon: FileText }
          ].map(t => {
            const IsActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`h-6.5 px-2.5 rounded-sm font-bold flex items-center gap-1.5 transition-all text-[9px] uppercase border ${
                  IsActive 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">URJAFLUX KERNEL OS v3</span>
      </div>

      {/* 3. WORKING CONTENT AREA */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        
        {/* ========================================================================= */}
        {/* SUB-TAB 1: RUNTIME ARCHITECTURE DIAGRAM */}
        {/* ========================================================================= */}
        {activeTab === "diagram" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Visual Vector Stack Canvas */}
            <div className="flex-1 bg-[#04060a] p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">1. ARCHITECTURAL STACK REPRESENTATION</span>
                <h3 className="text-sm font-bold text-slate-100">Constitutional Module Runtime Flow</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  URJAFLUX is built on a strictly decoupled hierarchical topology. No visual layer binds with database models directly. Every instruction is marshalled through the Kernel event bus.
                </p>
              </div>

              {/* Graphic Flow Layout */}
              <div className="my-6 space-y-2.5 max-w-xl mx-auto w-full">
                
                {/* Visual block builder */}
                {[
                  { layer: "UI / Presentation Layer", desc: "Decoupled viewport panels & inspection sheets. Subscribes purely to Viewport State events.", color: "border-slate-800 text-slate-400 bg-slate-950/40" },
                  { layer: "Rendering & Compute Engines", desc: "2D/3D matrix projection vectors & SVG shaders. Decoupled from core layout geometries.", color: "border-slate-800 text-slate-400 bg-slate-950/40" },
                  { layer: "Analysis Engines (SRE)", desc: "Immutable structural analyzers & rule monitors. Outputs Vastu scoring without modifying vectors.", color: "border-indigo-900/60 text-indigo-400 bg-indigo-950/10" },
                  { layer: "Event Bus & Message Queue", desc: "Immutable publish-subscribe system. Broker for all micro-operations & telemetry.", color: "border-emerald-900/60 text-emerald-400 bg-emerald-950/10 font-bold" },
                  { layer: "System Core Managers & Services", desc: "Centralized controllers managing clipboards, undo histories, plugins, and background jobs.", color: "border-purple-900/60 text-purple-400 bg-purple-950/10" },
                  { layer: "Constitutional Kernel Runtime", desc: "Boot manager, permission systems, global state registers. The single point of authorization.", color: "border-indigo-600/30 text-indigo-400 bg-indigo-600/5 font-bold text-[12px] h-11" },
                  { layer: "Global State / Entity Framework", desc: "Immutable structural models containing spatial classes, and relationship definitions.", color: "border-slate-800 text-slate-400 bg-slate-950/40" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className={`p-2.5 border rounded flex flex-col justify-center text-left hover:border-slate-700 transition-all ${item.color}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold tracking-wider uppercase">{item.layer}</span>
                        <span className="text-[7.5px] text-slate-600 font-mono">LAYER 0{7 - idx}</span>
                      </div>
                      <p className="text-[9.5px] text-slate-500 mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                    {idx < 6 && (
                      <div className="flex justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-800 transform rotate-90" />
                      </div>
                    )}
                  </div>
                ))}

              </div>

              <div className="p-3 bg-[#070b13] border border-slate-900 rounded max-w-xl mx-auto w-full">
                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest block">Strict Dependency Constraints</span>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Dependency vectors point exclusively downwards. Visual elements can call Managers via the Command interface, but Managers are strictly forbidden from knowing, importing, or mutating rendering assets.
                </p>
              </div>
            </div>

            {/* Dependency rules specifications panel */}
            <div className="w-[35%] bg-[#060a12] border-l border-slate-900 p-6 overflow-y-auto custom-scrollbar space-y-6 shrink-0">
              <div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">CONSTITUTIONAL BOUNDARIES</span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">Decade-Proof Runtime Boundaries</h3>
              </div>

              <div className="space-y-4">
                {[
                  { title: "UI Decoupling", desc: "No panel or layout button owns transactional state. If the entire React layout is unmounted or crashes, the underlying platform Kernel, state tree, and pending transaction queue remain 100% active, allowing instant recovery." },
                  { title: "Immutable Geometry Principle", desc: "Spatial rendering calculations exist purely client-side. The database and background analyzer receive standard geometric vectors, perform evaluations, and store outcome models completely separate from spatial vertices." },
                  { title: "Broker-Only Communications", desc: "Direct cross-module method invocation (e.g., calling a Vastu engine method inside a wall layout module) is strictly prohibited. Subsystems must request actions through the Command Processor." },
                  { title: "Isolate Plugin Sanity", desc: "Third-party plugins execute in constrained JS sandboxes. If a plugin throws a memory heap error or blocks execution, the kernel forcefully terminates the plugin worker and logs diagnostic traces without destabilizing active modules." }
                ].map((rule, idx) => (
                  <div key={idx} className="p-3 bg-[#04060a] border border-slate-900/60 rounded space-y-1">
                    <span className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest">Rule {idx + 1}: {rule.title}</span>
                    <p className="text-[10px] text-slate-400 leading-normal">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: BOOT SEQUENCE & LIFECYCLE */}
        {/* ========================================================================= */}
        {activeTab === "boot" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Interactive Timeline of Boot Sequence */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">SYSTEM INITIALIZATION FLOW</span>
                <h3 className="text-sm font-bold text-slate-100">10-Step Deterministic Startup Boot Sequence</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Click on the sequence checkpoints below to inspect their operational scopes, required services, and diagnostic validation scripts.
                </p>
              </div>

              {/* Step checklist */}
              <div className="space-y-2 max-w-xl">
                {[
                  { id: 1, name: "Configure Layer (Initialize Configuration)", status: "COMPLETED", detail: "Loads baseline system defaults, organization level rulesets, and default workspace configurations." },
                  { id: 2, name: "Environment Binding (Load Environment)", status: "COMPLETED", detail: "Resolves secure environment variables, proxy URLs, and telemetry sockets." },
                  { id: 3, name: "Identity Registration (Load User Profile)", status: "COMPLETED", detail: "Authenticates spatial session for pavitra.taurus@gmail.com. Sets role permissions." },
                  { id: 4, name: "Services Boot (Initialize Core Services)", status: "COMPLETED", detail: "Instantiates central engines (EntityService, VastuEngine, SemanticSearchEngine)." },
                  { id: 5, name: "Managers Mounting (Initialize Core Managers)", status: "COMPLETED", detail: "Spawns WorkspaceManager, SelectionManager, ThemeManager, and UndoHistoryManager." },
                  { id: 6, name: "Plugins Assembly (Load Custom Plugins)", status: "COMPLETED", detail: "Registers extension types, structural checkers, and custom PDF parsing workers." },
                  { id: 7, name: "Workspace Workspace Bounds Restoration", status: "COMPLETED", detail: "Re-creates panels, canvas layouts, grid coordinates, and selection points." },
                  { id: 8, name: "Database Handshake (Handshake Project DB)", status: "COMPLETED", detail: "Resolves remote indexing, synchronizes Firestore collections, and indexes references." },
                  { id: 9, name: "Session Recovery (Restore Active Workspace)", status: "COMPLETED", detail: "Resolves unsaved temporary buffers and active local drafting sequences." },
                  { id: 10, name: "Ready State Synchronization (Broadcasting)", status: "COMPLETED", detail: "Fires ReadyEvent. Releases UI rendering blocks and initializes the drafting canvas." }
                ].map(step => {
                  const isSelected = bootStep === step.id;
                  return (
                    <div 
                      key={step.id} 
                      onClick={() => setBootStep(step.id)}
                      className={`p-3 rounded border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-slate-950 border-emerald-500/40 text-slate-100" 
                          : "bg-[#070b13] border-slate-900/60 text-slate-400 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          STAGE {step.id}: {step.name}
                        </span>
                        <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded font-bold font-mono">Verified</span>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pl-5 border-l border-emerald-500/30 space-y-2">
                          <p className="text-[11px] text-slate-300 leading-normal">{step.detail}</p>
                          <div className="p-2 bg-slate-900/40 border border-slate-800/80 rounded text-[9.5px] text-slate-400">
                            <span className="font-bold text-slate-200 block mb-1">Simulated Diagnostic Console:</span>
                            <span>$ kernel_os --validate-stage {step.id} --verbosity=high <br /></span>
                            <span className="text-emerald-400">» Diagnostic check completed. No memory leaks or circular imports found. OK.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lifecycle phases definition column */}
            <div className="w-[35%] bg-[#060a12] border-l border-slate-900 p-6 overflow-y-auto custom-scrollbar space-y-6 shrink-0">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">LIFECYCLE STATUS MATRIX</span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">Platform Run-States</h3>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Cold Start", desc: "Platform bootstrapping with clean caches, loading fresh environment bindings, and initializing memory caches." },
                  { name: "Warm Start", desc: "Session recovery from saved IndexedDB caches, skipping structural initializations for ultra-fast load times (<500ms)." },
                  { name: "Project Switch", desc: "Gracefully flush current spatial models, unmount visual listeners, commit pending journals, and hot-load new indices." },
                  { name: "Suspend & Resume", desc: "Saves high-fidelity canvas states to local session states when browser switches tabs. Automatically restores without memory leak overflows." },
                  { name: "Crash Recovery Protocol", desc: "If unhandled exceptions destabilize the thread, a specialized background worker restores the local drafting memory automatically without data loss." }
                ].map((lc, i) => (
                  <div key={i} className="p-3 bg-[#04060a] border border-slate-900 rounded space-y-1">
                    <span className="font-bold text-[10px] text-slate-300 uppercase tracking-widest">{lc.name}</span>
                    <p className="text-[10px] text-slate-500 leading-normal">{lc.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 3: MODULE & PLUGIN REGISTRY SPECIFICATIONS */}
        {/* ========================================================================= */}
        {activeTab === "registry" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Core definitions layout */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">PLUGIN & MODULE ARCHITECTURE</span>
                <h3 className="text-sm font-bold text-slate-100">Decoupled Plugin Manifest Declarations</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Every plugin inside URJAFLUX is declared as a structural JSON/YAML file specifying its permissions, registered entities, and command hooks. This isolates third-party code.
                </p>
              </div>

              {/* Sample specification */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" /> manifest.json - Module Registration Spec
                </span>
                <pre className="p-4 bg-slate-950 border border-slate-900 text-slate-400 rounded text-[10px] overflow-x-auto select-all leading-relaxed">
{`{
  "id": "urjaflux.module.vastu_analysis",
  "version": "1.4.0",
  "name": "Advanced Vedic Spatial Reasoning Engine",
  "dependencies": ["urjaflux.kernel.core", "urjaflux.services.entity_db"],
  "permissions": [
    "SPATIAL_GEOMETRY_READ",
    "METADATA_WRITE_ACCESS",
    "BACKGROUND_WORKER_EXECUTION"
  ],
  "registry": {
    "entities": [
      { "type": "VastuAnchorNode", "category": "Analysis", "inherits": "SpatialEntity" }
    ],
    "commands": [
      { "id": "Vastu.ExecuteZoneValidation", "title": "Run Astrological Prana Grid Analysis" }
    ],
    "ui": {
      "inspectors": ["/dist/components/VastuInspector.js"],
      "sidepanels": ["/dist/components/ChakraControlPanel.js"],
      "contextMenus": ["Vastu.BalanceRoomEnergy"]
    },
    "rules": [
      { "code": "V-E-01", "name": "Brahmasthan Void Constraint", "severity": "CRITICAL" }
    ]
  }
}`}
                </pre>
              </div>
            </div>

            {/* Extension features listing panel */}
            <div className="w-[35%] bg-[#060a12] border-l border-slate-900 p-6 overflow-y-auto custom-scrollbar space-y-6 shrink-0">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">MODULE SANDBOX RULES</span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">Platform Sandboxing Rules</h3>
              </div>

              <div className="space-y-4 text-[10px]">
                <div className="p-4 bg-[#04060a] border border-slate-900 rounded space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secure Sandboxed Isolation</span>
                  </div>
                  <p className="text-slate-400 leading-normal">
                    Third-party plugins can only interact with the application state via proxy APIs. Direct DOM modification, cross-origin communication, or unsafe script injections are fully restricted by the Kernel at runtime.
                  </p>
                </div>

                <div className="p-4 bg-[#04060a] border border-slate-900 rounded space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Lazy Mounted Execution</span>
                  </div>
                  <p className="text-slate-400 leading-normal">
                    Plugins are only initialized into memory when an active entity depending on them is clicked or rendered. This saves critical memory resources, ensuring flawless execution on lower-end hardware devices.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 4: MANAGER & SERVICE LAYER MATRICES */}
        {/* ========================================================================= */}
        {activeTab === "managers" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Split layout: Services vs Managers */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">RUNTIME ARCHITECTURE MAP</span>
                <h3 className="text-sm font-bold text-slate-100">Managers vs. Services Core Matrix</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  **Managers** control state behaviors and coordinate UX flows. **Services** execute tasks based on deterministic contracts and are strictly stateless.
                </p>
              </div>

              {/* Service Layer */}
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1.5">Stateless Service LayerContracts</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "Entity Service", desc: "Resolves unique indices, spatial coordinates, and stores structural nodes." },
                    { name: "Vastu Analysis Service", desc: "Calculates quadrant weights, solar entry angles, and energy scoring vectors." },
                    { name: "Rule Evaluation Service", desc: "Executes mathematical logic equations against active coordinate grids." },
                    { name: "Report Studio Service", desc: "Synthesizes structured PDF documents from active diagnostics and markdown templates." },
                    { name: "Storage Service", desc: "Manages remote persistent databases (Firestore) and local key-value indexes." },
                    { name: "Telemetry Service", desc: "Pipes execution performance metrics to centralized diagnostics logs." }
                  ].map((srv, idx) => (
                    <div key={idx} className="p-3 bg-[#070b13] border border-slate-900/80 rounded space-y-1 hover:border-slate-800 transition-all">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{srv.name}</span>
                      <p className="text-[10px] text-slate-400 leading-normal">{srv.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Manager Layer list */}
            <div className="w-[38%] bg-[#060a12] border-l border-slate-900 p-6 overflow-y-auto custom-scrollbar space-y-6 shrink-0">
              <div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">STATEFUL MANAGES</span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">Runtime Manager Controllers</h3>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Workspace Manager", desc: "Tracks active canvas bounds, panels layout, zoom settings, and visual layers state." },
                  { name: "Selection Manager", desc: "Calculates hit detection vectors and collision bounds to manage active focus nodes." },
                  { name: "Command History Manager", desc: "Owns the global undo/redo transactional journals queue." },
                  { name: "Background Job Manager", desc: "Coordinates background computations based on prioritized worker queues." },
                  { name: "System Plugin Manager", desc: "Controls initialization and mounts plugin sandbox modules cleanly." },
                  { name: "Notification Manager", desc: "Pipes critical system announcements, alerts, and feedback overlays." }
                ].map((mgr, idx) => (
                  <div key={idx} className="p-3 bg-[#04060a] border border-slate-900 rounded space-y-1">
                    <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">{mgr.name}</span>
                    <p className="text-[10px] text-slate-500 leading-normal">{mgr.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 5: INTERACTIVE TRANSACTION STACK */}
        {/* ========================================================================= */}
        {activeTab === "commands" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Interactive simulator controls */}
            <div className="w-[55%] p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">COMMAND SYSTEM SIMULATOR</span>
                <h3 className="text-sm font-bold text-slate-100">Transactional State Stack</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Every user or AI interaction is dispatched as an immutable **Command** within an isolated atomic **Transaction**. Test execute, group, commit, or rollback mutations.
                </p>
              </div>

              {/* Console operations */}
              <div className="p-4 bg-slate-950/80 border border-slate-900 rounded space-y-4">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">1. Operation Dispatch Console</span>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={cmdInput}
                    onChange={(e) => setCmdInput(e.target.value)}
                    placeholder="Enter command expression..."
                    className="flex-1 bg-[#04060a] border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono text-[10px] focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={() => handleExecuteCommand()}
                    className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase rounded-sm transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Dispatch
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900">
                  <span className="text-[8px] text-slate-600 uppercase font-bold flex items-center mr-2">Quick Macros:</span>
                  {[
                    "DrawWall {p1: [0, 0], p2: [15, 0]}",
                    "RotateObject {id: 'ent_001', angle: 45}",
                    "PlaceFurniture {type: 'Table', zone: 'Northwest'}",
                    "TriggerVastuAudit"
                  ].map((mac, i) => (
                    <button 
                      key={i}
                      onClick={() => handleExecuteCommand(mac)}
                      className="bg-[#070b13] hover:bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded text-[9px] transition-colors"
                    >
                      {mac.split(" {")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction controls */}
              <div className="p-4 bg-[#070b13] border border-slate-900 rounded space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-[9px] text-slate-300 uppercase tracking-wider font-bold block">2. Transaction Controller (Atomic Scopes)</span>
                  {activeTransaction ? (
                    <span className="text-[8px] bg-amber-950 text-amber-500 border border-amber-900 px-1.5 py-0.2 rounded font-bold">
                      ACTIVE TRANSACTION: {activeTransaction}
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-600">NO ACTIVE TRANSACTION</span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  Wrap multiple independent layout actions within a single unit. If any check fails, the transaction is completely rolled back, returning spatial coordinates to their exact original state.
                </p>

                <div className="flex gap-2">
                  <button 
                    onClick={handleBeginTransaction}
                    disabled={activeTransaction !== null}
                    className="flex-1 h-7 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 border border-indigo-900 disabled:opacity-40 disabled:pointer-events-none font-bold uppercase rounded-sm text-[9px]"
                  >
                    Begin Transaction
                  </button>
                  <button 
                    onClick={handleCommitTransaction}
                    disabled={activeTransaction === null}
                    className="flex-1 h-7 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900 disabled:opacity-40 disabled:pointer-events-none font-bold uppercase rounded-sm text-[9px]"
                  >
                    Commit Transaction
                  </button>
                  <button 
                    onClick={handleRollbackTransaction}
                    disabled={activeTransaction === null}
                    className="flex-1 h-7 bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-900 disabled:opacity-40 disabled:pointer-events-none font-bold uppercase rounded-sm text-[9px]"
                  >
                    Rollback (Atomic)
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Live Stack & Event Bus */}
            <div className="flex-1 bg-[#060a12] border-l border-slate-900 flex flex-col overflow-hidden">
              
              {/* Journal panel */}
              <div className="flex-1 p-6 flex flex-col min-h-0 border-b border-slate-900">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-400" /> State Mutation History Queue
                  </span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={handleUndo} 
                      disabled={commandHistory.length === 0}
                      className="p-1 rounded bg-[#04060a] border border-slate-800 hover:border-slate-600 disabled:opacity-35 text-slate-400 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={handleRedo}
                      disabled={redoHistory.length === 0}
                      className="p-1 rounded bg-[#04060a] border border-slate-800 hover:border-slate-600 disabled:opacity-35 text-slate-400 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-[10px]">
                  {commandHistory.length === 0 ? (
                    <div className="text-slate-600 italic py-8 text-center">No active actions in history stack.</div>
                  ) : (
                    commandHistory.map((cmd) => (
                      <div 
                        key={cmd.id} 
                        className={`p-2.5 rounded border flex items-center justify-between transition-all ${
                          cmd.status === "ROLLED_BACK" 
                            ? "bg-rose-950/20 border-rose-900/40 opacity-50" 
                            : cmd.status === "EXECUTED" 
                            ? "bg-amber-950/20 border-amber-900/40"
                            : "bg-[#04060a] border-slate-900"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-[8px] bg-slate-900 text-slate-500 px-1 py-0.2 rounded font-mono">{cmd.id}</span>
                            <span className={cmd.status === "ROLLED_BACK" ? "line-through text-slate-500" : "text-slate-300"}>
                              {cmd.name}
                            </span>
                          </div>
                          {cmd.transactionId && (
                            <span className="text-[7.5px] text-amber-500 font-bold block mt-1">Transaction Wrapped: {cmd.transactionId}</span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-slate-600 block text-[8px] font-mono">{cmd.timestamp}</span>
                          <span className={`text-[8px] font-bold uppercase block mt-0.5 ${
                            cmd.status === "SUCCESS" 
                              ? "text-emerald-400" 
                              : cmd.status === "ROLLED_BACK" 
                              ? "text-rose-500 font-bold" 
                              : "text-amber-500"
                          }`}>
                            {cmd.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Event bus stream panel */}
              <div className="h-[40%] p-6 flex flex-col min-h-0 bg-[#04060a]">
                <div className="border-b border-slate-900 pb-2 mb-3">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5" /> Immutable Event Broker Stream ({eventCount} Total)
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 font-mono text-[9.5px]">
                  {eventsStream.map((evt) => (
                    <div key={evt.id} className="p-2 bg-slate-950 border border-slate-900/80 rounded flex justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] bg-slate-900 text-emerald-500 px-1 py-0.2 rounded font-bold font-mono">{evt.id}</span>
                          <span className="text-slate-300 font-bold uppercase">{evt.name}</span>
                        </div>
                        <span className="text-slate-500 text-[8.5px] block mt-0.5 truncate">{evt.payload}</span>
                      </div>
                      <span className="text-slate-600 text-[8px] shrink-0 font-mono mt-0.5">{evt.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 6: BACKGROUND JOB SYSTEM */}
        {/* ========================================================================= */}
        {activeTab === "jobs" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Thread listing and interaction */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">ASYNC SERVICES</span>
                <h3 className="text-sm font-bold text-slate-100">Stateful Background Job Scheduler</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Avoid blocking primary rendering loops. Costly procedures like structural simulations, indexing, and AI validations are marshalled into prioritized isolated workers.
                </p>
              </div>

              {/* Live job checklist */}
              <div className="space-y-3 max-w-xl">
                {jobs.map(job => (
                  <div key={job.id} className="p-4 bg-[#070b13] border border-slate-900 rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] bg-slate-950 text-slate-500 px-1 py-0.2 rounded font-bold">{job.id}</span>
                        <span className="font-bold text-[10px] text-slate-200">{job.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold ${
                          job.priority === "CRITICAL" 
                            ? "bg-rose-950 text-rose-400 border border-rose-900/30" 
                            : job.priority === "HIGH" 
                            ? "bg-amber-950 text-amber-500 border border-amber-900/30" 
                            : "bg-slate-900 text-slate-500"
                        }`}>
                          {job.priority} Priority
                        </span>
                        
                        <span className={`text-[9px] font-bold uppercase ${
                          job.status === "COMPLETED" 
                            ? "text-emerald-400" 
                            : job.status === "RUNNING" 
                            ? "text-indigo-400 animate-pulse" 
                            : "text-slate-500"
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress tracking */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Worker Pipeline Execution</span>
                        <span className="font-bold text-slate-300">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-[#04060a] border border-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${job.progress}%` }}
                          className={`h-full transition-all duration-300 ${
                            job.status === "COMPLETED" 
                              ? "bg-emerald-500" 
                              : job.status === "RUNNING" 
                              ? "bg-indigo-500" 
                              : "bg-slate-800"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Controller actions */}
                    <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1">
                      <span>Execution Time: <span className="font-bold text-slate-300">{job.duration}</span></span>
                      {job.status === "QUEUED" && (
                        <button 
                          onClick={() => triggerJobRun(job.id)}
                          className="h-6 px-2.5 bg-indigo-950 border border-indigo-900/40 hover:border-indigo-700/80 text-indigo-400 rounded text-[8.5px] uppercase font-bold"
                        >
                          Manual Initialize
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance and scheduling specification sidebar */}
            <div className="w-[35%] bg-[#060a12] border-l border-slate-900 p-6 overflow-y-auto custom-scrollbar space-y-6 shrink-0">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">JOB MANAGER CONTRACTS</span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">Multi-Threading Specifications</h3>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Thread-Safe Isolation", desc: "Heavy architectural computations load inside HTML5 Web Workers completely separated from the central browser GUI thread. This guarantees 100% stable interaction loops, staying completely clear of micro-stuttering." },
                  { title: "Deterministic Queue Scheduling", desc: "Background processes use a priority heap algorithm. Critical viewport operations (vector scaling) immediately interrupt low-priority indexing processes (knowledge base link searches)." },
                  { title: "Graceful Interruption Policy", desc: "All background jobs support strict cancellation protocols. If an active user modifies a wall vector mid-analysis, the running structural job is immediately cancelled to avoid computing outdated vectors." }
                ].map((spec, i) => (
                  <div key={i} className="p-3.5 bg-[#04060a] border border-slate-900 rounded space-y-1">
                    <span className="font-bold text-[10px] text-slate-300 uppercase tracking-widest">{spec.title}</span>
                    <p className="text-[10px] text-slate-500 leading-normal">{spec.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 7: SECURITY MODEL & CONFIGURATION */}
        {/* ========================================================================= */}
        {activeTab === "security" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Security controls listing */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">SECURITY & COMPLIANCE</span>
                <h3 className="text-sm font-bold text-slate-100">Enterprise Access & Isolation Model</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ensure strict compliance across team collaborative spaces. No user or plugin can execute database writes or state adjustments without verifying credentials against the local authorization broker.
                </p>
              </div>

              {/* Graphical representation of credentials validation */}
              <div className="p-4 bg-slate-950 border border-slate-900/80 rounded space-y-3.5">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">1. Active Access Scope Audit</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#04060a] border border-slate-800 rounded text-[10px]">
                    <div className="text-slate-500 mb-1">Authenticated Account</div>
                    <div className="font-bold text-slate-200">pavitra.taurus@gmail.com</div>
                    <div className="text-[9px] text-indigo-400 font-mono mt-1">Tenant Profile ID: u_9042-8821</div>
                  </div>
                  <div className="p-3 bg-[#04060a] border border-slate-800 rounded text-[10px]">
                    <div className="text-slate-500 mb-1">Authorization Clearance</div>
                    <div className="font-bold text-emerald-400 uppercase">Principal Enterprise Architect</div>
                    <div className="text-[9px] text-slate-500 mt-1">Access Token: Active JSON Web Signature</div>
                  </div>
                </div>
              </div>

              {/* Layered Config specifications */}
              <div className="space-y-3">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1.5">Layered Configuration Architecture</span>
                <div className="space-y-2.5">
                  {[
                    { level: "Level 1: System Level Config", scope: "Hardcoded platform limitations, baseline boundaries, and telemetry dispatch URLs." },
                    { level: "Level 2: Tenant Level Config", scope: "Organization rulesets, astrological algorithms parameter scopes, and customized color pallets." },
                    { level: "Level 3: Workspace Level Config", scope: "Layout rules, viewport snap grids, toolbar panels configurations, and keyboard shortcuts." },
                    { level: "Level 4: Project Level Config", scope: "Active coordinates boundaries, magnetic North orientations, and client spatial blueprints." }
                  ].map((cfg, i) => (
                    <div key={i} className="p-3 bg-[#070b13] border border-slate-900 rounded flex justify-between gap-4">
                      <span className="font-bold text-[10px] text-indigo-400 uppercase tracking-wider shrink-0 w-44">{cfg.level}</span>
                      <p className="text-[10px] text-slate-400 leading-normal">{cfg.scope}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar specification details */}
            <div className="w-[35%] bg-[#060a12] border-l border-slate-900 p-6 overflow-y-auto custom-scrollbar space-y-6 shrink-0">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">COMPLIANCE POLICY</span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">Isolations & Audits Specs</h3>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Command Permission Interceptor", desc: "All system dispatches verify user permissions prior to modifying any coordinate states. Unauthorized attempts trigger warning flags in logging, preventing accidental overrides." },
                  { title: "Comprehensive Audit Logs", desc: "Mutations write SHA-256 cryptographically chained logs containing precise timestamps, user details, and old/new parameter blocks. This ensures flawless diagnostic histories." },
                  { title: "Immutable Data Cache isolation", desc: "No external process reads directly from in-memory coordinates caches. Caches are managed behind safe getter/setter interfaces." }
                ].map((spec, i) => (
                  <div key={i} className="p-3.5 bg-[#04060a] border border-slate-900 rounded space-y-1">
                    <span className="font-bold text-[10px] text-slate-300 uppercase tracking-widest">{spec.title}</span>
                    <p className="text-[10px] text-slate-500 leading-normal">{spec.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 8: FUTURE EXPANSION RULES & ARCHITECTURE DECISIONS */}
        {/* ========================================================================= */}
        {activeTab === "future" && (
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#05080f] space-y-8">
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono block">CONSTITUTIONAL MANIFESTO</span>
                <h2 className="text-base font-bold text-slate-100 mt-1">URJAFLUX 10-Year Architectural Guidelines & Core Decisions</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  This document serves as the absolute architectural blueprint. Every future engineering module, drafting engine, or integration system must inherit this exact constitutional framework.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Rule of Infinite Geometric Extensibility", rule: "All physical geometries (points, lines, splines, meshes) must exist as plain data vectors inheriting from SpatialEntity. Custom visual assets or proprietary 3D formats can only be bound via reference hashes — never by mutating the core drafting classes." },
                  { title: "Strict Stateless Services Rule", rule: "Services must remain strictly stateless. No service (e.g. VastuEngineService) is allowed to store variables, local arrays, or configuration variables inside its local scope. All states must live inside the global state tree managed by the WorkspaceManager." },
                  { title: "Immutable Event Record Integrity", rule: "Events are 100% read-only structures. No component is allowed to intercept, mutate, or suppress an active event record on the Event Bus. Event dispatch must happen in sequence to ensure perfect telemetry and undo fidelity." },
                  { title: "Multi-User Event-Sourcing Protocol", rule: "In future collaboration releases, document synchronization must execute via event-sourcing streams. Instead of uploading full 3D models, components broadcast serialized Command records. The local kernel will re-apply these commands to synchronize states." }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 bg-[#070b13] border border-slate-900 rounded-sm space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block font-mono">SECTION 12.{idx + 1}: {item.title}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.rule}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-indigo-950/10 border border-indigo-900/40 rounded space-y-2 text-xs text-indigo-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <Shield className="w-4 h-4" />
                  <span className="uppercase tracking-widest text-[9px]">Platform Architecture Sign-off</span>
                </div>
                <p className="leading-relaxed">
                  Certified and approved by pavitra.taurus@gmail.com, Enterprise Platform Designer & Principal Systems Engineer of URJAFLUX AI OS.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
