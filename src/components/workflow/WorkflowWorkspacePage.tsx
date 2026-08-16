import React, { useState, useEffect } from "react";
import {
  Play,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Plus,
  Compass,
  FileText,
  Activity,
  Layers,
  Inbox,
  Bell,
  Trash2,
  GitBranch,
  Grid,
  ShieldAlert,
  ArrowRight,
  Database,
  ArrowRightLeft
} from "lucide-react";
import { WorkflowOrchestrationEngine } from "../../core/workflow/WorkflowEngine";
import { EnterpriseEventBus } from "../../core/workflow/EventBus";
import { BusinessRulesEngine } from "../../core/workflow/RulesEngine";
import { EnterpriseScheduler, NotificationEngine, CronJob } from "../../core/workflow/SchedulerNotifications";
import {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowStepInstance,
  TaskEntity,
  ApprovalChain,
  WorkflowEvent,
  BusinessRule,
  NotificationPayload,
  SlaMetric
} from "../../core/workflow/WorkflowTypes";

export const WorkflowWorkspacePage: React.FC = () => {
  const engine = WorkflowOrchestrationEngine.getInstance();
  const eventBus = EnterpriseEventBus.getInstance();
  const rulesEngine = BusinessRulesEngine.getInstance();
  const scheduler = EnterpriseScheduler.getInstance();
  const notifEngine = NotificationEngine.getInstance();

  // Selected Tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "designer" | "executions" | "tasks" | "approvals" | "scheduler" | "events" | "notifications"
  >("dashboard");

  // State
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [stepInstances, setStepInstances] = useState<WorkflowStepInstance[]>([]);
  const [tasks, setTasks] = useState<TaskEntity[]>([]);
  const [approvals, setApprovals] = useState<ApprovalChain[]>([]);
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [slas, setSlas] = useState<SlaMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [eventsList, setEventsList] = useState<WorkflowEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  // Selection states
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [selectedDef, setSelectedDef] = useState<WorkflowDefinition | null>(null);

  // New Workflow Definition State
  const [isCreatingDef, setIsCreatingDef] = useState(false);
  const [newDefName, setNewDefName] = useState("");
  const [newDefDesc, setNewDefDesc] = useState("");

  // Simulated Event Trigger Form
  const [customEventSource, setCustomEventSource] = useState("DOMAIN-012");
  const [customEventName, setCustomEventName] = useState("VISION_DEFECT_DETECTED");
  const [customSeverity, setCustomSeverity] = useState("CRITICAL");

  // Load and refresh state helper
  const refreshAllState = () => {
    setDefinitions(engine.getDefinitions());
    setInstances(engine.getInstances());
    setStepInstances(engine.getStepInstances());
    setTasks(engine.getTasks());
    setApprovals(engine.getApprovals());
    setRules(rulesEngine.getRules());
    setSlas(engine.getSlas());
    setAuditLogs(engine.getAuditLogs());
    setCronJobs(scheduler.getJobs());
    setEventsList(eventBus.getHistory());
    setNotifications(notifEngine.getNotifications());
  };

  useEffect(() => {
    refreshAllState();
    // Simulate real-time monitoring tick
    const interval = setInterval(() => {
      refreshAllState();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleStartWorkflow = (defId: string) => {
    const inst = engine.startWorkflow(defId, { severity: "CRITICAL" }, "Manager Admin");
    if (inst) {
      setSelectedInstance(inst);
      setActiveTab("executions");
      refreshAllState();
    }
  };

  const handleResolveApproval = (approvalId: string, role: string, decision: "APPROVED" | "REJECTED" | "REWORK_REQUESTED") => {
    engine.resolveApproval(approvalId, role, decision, "Manually audited via console workflow inbox.", "Manager Admin");
    refreshAllState();
  };

  const handleCompleteTask = (taskId: string) => {
    engine.completeTask(taskId, "Field Operator");
    refreshAllState();
  };

  const handleTriggerCustomEvent = () => {
    eventBus.publish({
      type: "DOMAIN_EVENT",
      source: customEventSource,
      name: customEventName,
      payload: {
        severity: customSeverity,
        assetId: "asset_9921",
        coords: { x: 42, y: 120 },
        zone: "Northeast",
        element: "Water Seepage"
      }
    });
    refreshAllState();
    setActiveTab("events");
  };

  const handleCreateWorkflowDef = () => {
    if (!newDefName) return;
    const defId = `wf_${Math.random().toString(36).substring(2, 9)}`;
    engine.createDefinition({
      id: defId,
      name: newDefName,
      description: newDefDesc,
      version: 1,
      status: "ACTIVE",
      owner: "ADMIN",
      steps: [
        {
          id: "step_1",
          name: "Initial Automated Validation",
          type: "AUTOMATIC_STEP",
          config: {},
          nextStepIds: ["step_2"]
        },
        {
          id: "step_2",
          name: "Manager Final Approval Sign-off",
          type: "APPROVAL",
          config: {
            approvalTitle: "Verify custom pipeline compliance",
            approverRoles: ["PROJECT_MANAGER"]
          },
          nextStepIds: []
        }
      ],
      metadata: {}
    });
    setIsCreatingDef(false);
    setNewDefName("");
    setNewDefDesc("");
    refreshAllState();
  };

  const handleTriggerJob = (jobId: string) => {
    scheduler.triggerJobNow(jobId);
    refreshAllState();
  };

  return (
    <div className="bg-[#FAF9F6] text-stone-800 min-h-screen p-6 font-sans">
      {/* Title Header */}
      <header className="mb-8 border-b border-stone-200 pb-5">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold tracking-wider text-amber-700 uppercase">Domain-013 Orchestration</span>
            <h1 className="text-3xl font-display font-semibold text-stone-900 mt-1">Enterprise Automation & Workflow Engine</h1>
            <p className="text-sm text-stone-500 mt-1">
              Command-and-control event broker routing processes, SLA tracking, and notifications.
            </p>
          </div>
          <button
            onClick={() => {
              setIsCreatingDef(true);
              setActiveTab("designer");
            }}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded text-sm transition-all shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Design New Workflow
          </button>
        </div>
      </header>

      {/* Main Tabs Selection */}
      <div className="flex border-b border-stone-200 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { id: "dashboard", label: "Dashboard", icon: Grid },
          { id: "designer", label: "Workflow Designer", icon: GitBranch },
          { id: "executions", label: "Active Executions", icon: Activity },
          { id: "tasks", label: "Task Board", icon: FileText },
          { id: "approvals", label: "Approval Inbox", icon: Inbox },
          { id: "scheduler", label: "Scheduler Console", icon: Clock },
          { id: "events", label: "Event Explorer", icon: ArrowRightLeft },
          { id: "notifications", label: "Notifications", icon: Bell }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border-amber-700 text-amber-950 bg-amber-50/50"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* VIEWPORT AREA */}
      <main className="grid grid-cols-1 gap-6">
        {/* --- 1. DASHBOARD VIEW --- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Summary Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm">
                <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">Active Instances</span>
                <div className="text-3xl font-semibold text-stone-900 mt-2">
                  {instances.filter(i => i.status === "RUNNING").length}
                </div>
                <div className="text-xs text-amber-600 mt-2">Currently being orchestrated</div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm">
                <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">Pending Approvals</span>
                <div className="text-3xl font-semibold text-stone-900 mt-2">
                  {approvals.filter(a => a.status === "PENDING").length}
                </div>
                <div className="text-xs text-blue-600 mt-2">Awaiting decision checks</div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm">
                <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">SLA Breach Alarms</span>
                <div className="text-3xl font-semibold text-red-600 mt-2">
                  {slas.filter(s => s.status === "BREACHED").length}
                </div>
                <div className="text-xs text-stone-500 mt-2">Overdue step definitions</div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm">
                <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">Events Propagated</span>
                <div className="text-3xl font-semibold text-stone-900 mt-2">{eventsList.length}</div>
                <div className="text-xs text-green-600 mt-2">Routed by Pub/Sub Bus</div>
              </div>
            </div>

            {/* Quick Launch & Active Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Pre-seeded definitions (Blueprint launch pad) */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
                <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center gap-2">
                  <Play className="w-4 h-4 text-amber-700" /> Predefined Workflow Blueprint Templates
                </h3>
                <div className="space-y-4">
                  {definitions.map(def => (
                    <div key={def.id} className="p-4 rounded border border-stone-100 hover:border-amber-200 bg-[#FCFBF9] transition-all flex justify-between items-start">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">{def.name}</span>
                          <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-mono">v{def.version}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">{def.description}</p>
                        <div className="flex gap-2 mt-2">
                          {def.steps.map((st, sIdx) => (
                            <span key={st.id} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded flex items-center gap-1">
                              {sIdx + 1}. {st.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartWorkflow(def.id)}
                        className="bg-amber-800 hover:bg-amber-900 text-white text-xs px-3 py-1.5 rounded font-medium transition-all"
                      >
                        Launch Instance
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Fire Custom Simulator Event */}
              <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
                <h3 className="text-lg font-medium text-stone-900 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-700" /> Event Bus Simulator
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Inject synthetic events into the Broker to watch the rules engine auto-orchestrate workflows.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1">Source Domain</label>
                    <select
                      value={customEventSource}
                      onChange={e => setCustomEventSource(e.target.value)}
                      className="w-full text-xs border border-stone-200 p-2 rounded focus:outline-none"
                    >
                      <option value="DOMAIN-012">DOMAIN-012 (Vision AI Perception)</option>
                      <option value="DOMAIN-011">DOMAIN-011 (Spatial CAD Engine)</option>
                      <option value="SYSTEM">CORE SYSTEM</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1">Event Identifier</label>
                    <select
                      value={customEventName}
                      onChange={e => {
                        setCustomEventName(e.target.value);
                        if (e.target.value === "VASTU_COMPLIANCE_FAILED") {
                          setCustomEventSource("DOMAIN-011");
                        } else {
                          setCustomEventSource("DOMAIN-012");
                        }
                      }}
                      className="w-full text-xs border border-stone-200 p-2 rounded focus:outline-none"
                    >
                      <option value="VISION_DEFECT_DETECTED">VISION_DEFECT_DETECTED (Defect Logged)</option>
                      <option value="VASTU_COMPLIANCE_FAILED">VASTU_COMPLIANCE_FAILED (Layout Clash)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1">Severity / Parameter</label>
                    <select
                      value={customSeverity}
                      onChange={e => setCustomSeverity(e.target.value)}
                      className="w-full text-xs border border-stone-200 p-2 rounded focus:outline-none"
                    >
                      <option value="CRITICAL">CRITICAL (Triggers auto remediation workflow)</option>
                      <option value="LOW">LOW (Standard OCR verification warning)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleTriggerCustomEvent}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs py-2 rounded font-medium transition-all"
                  >
                    Publish to Event Bus
                  </button>
                </div>
              </div>
            </div>

            {/* Configured Rules Board */}
            <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
              <h3 className="text-md font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-700" /> active Orchestration Business Rules (Rules Engine)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map(rule => (
                  <div key={rule.id} className="p-4 rounded border border-stone-100 bg-[#FCFBF9]">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-stone-900">{rule.name}</span>
                      <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">Active</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{rule.description}</p>
                    <div className="border-t border-stone-100 mt-2 pt-2 text-[11px] text-stone-600 space-y-1">
                      <div>
                        <strong className="text-stone-950">IF: </strong> Event is{" "}
                        <span className="font-mono bg-stone-100 px-1 text-amber-800">{rule.triggerEvent}</span>
                      </div>
                      {rule.conditions.map((c, idx) => (
                        <div key={idx}>
                          <strong className="text-stone-950">AND: </strong> {c.field} {c.operator} {c.value}
                        </div>
                      ))}
                      <div className="text-amber-800 font-semibold mt-1">
                        <strong>THEN: </strong> Route {rule.actions.length} process actions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 2. WORKFLOW DESIGNER VIEW --- */}
        {activeTab === "designer" && (
          <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-stone-900">DAG DAG Interactive Process Designer</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Design sequential, parallel, or branching pipelines represented as Directed Acyclic Graphs.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingDef(true)}
                className="bg-amber-800 text-white text-xs px-3 py-1.5 rounded hover:bg-amber-900 font-medium"
              >
                Create Custom DAG Definition
              </button>
            </div>

            {isCreatingDef && (
              <div className="mb-6 p-4 border border-stone-200 rounded-lg bg-[#FAF9F6]">
                <h4 className="text-sm font-semibold text-stone-900 mb-3">Define New DAG</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-stone-600 block mb-1">Process Name</label>
                    <input
                      type="text"
                      value={newDefName}
                      onChange={e => setNewDefName(e.target.value)}
                      placeholder="e.g. Site Survey Dispatch Loop"
                      className="w-full text-xs p-2 border border-stone-200 rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-600 block mb-1">Description</label>
                    <input
                      type="text"
                      value={newDefDesc}
                      onChange={e => setNewDefDesc(e.target.value)}
                      placeholder="e.g. Orchestrates field visits and safety reviews"
                      className="w-full text-xs p-2 border border-stone-200 rounded focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreatingDef(false)}
                    className="text-stone-500 hover:text-stone-700 text-xs px-3 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateWorkflowDef}
                    className="bg-stone-900 text-white text-xs px-3 py-1 rounded"
                  >
                    Save Definition Schema
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Definitions Selector list */}
              <div className="border border-stone-200 rounded p-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Select Pipeline Model</h4>
                {definitions.map(def => (
                  <button
                    key={def.id}
                    onClick={() => {
                      setSelectedDef(def);
                    }}
                    className={`w-full text-left p-3 rounded text-xs transition-all border ${
                      selectedDef?.id === def.id
                        ? "border-amber-700 bg-amber-50/40 font-semibold"
                        : "border-stone-100 hover:bg-stone-50"
                    }`}
                  >
                    <div className="text-stone-900">{def.name}</div>
                    <div className="text-stone-500 font-normal mt-0.5">Steps: {def.steps.length}</div>
                  </button>
                ))}
              </div>

              {/* Visualized Steps Hierarchy DAG */}
              <div className="md:col-span-2 border border-stone-200 rounded bg-[#FCFBF9] p-6 flex flex-col items-center justify-center min-h-[300px]">
                {selectedDef ? (
                  <div className="w-full max-w-lg space-y-8">
                    <div className="text-center mb-4">
                      <span className="text-xs bg-stone-100 px-2 py-0.5 rounded font-mono text-stone-600">{selectedDef.id}</span>
                      <h4 className="font-semibold text-stone-800 mt-1">{selectedDef.name}</h4>
                    </div>

                    <div className="flex flex-col gap-4">
                      {selectedDef.steps.map((st, index) => (
                        <div key={st.id} className="relative flex flex-col items-center">
                          <div className="bg-white border border-stone-200 rounded p-4 shadow-sm w-full max-w-sm relative z-10 flex justify-between items-center">
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-amber-700">{st.type}</span>
                              <div className="text-xs font-semibold text-stone-900 mt-0.5">{st.name}</div>
                              {st.config.assignedRole && (
                                <div className="text-[10px] text-stone-500 mt-1">Assignee Role: {st.config.assignedRole}</div>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono bg-stone-100 px-1 py-0.5 rounded">
                              {st.slaMinutes || 120}m SLA
                            </div>
                          </div>

                          {index < selectedDef.steps.length - 1 && (
                            <div className="h-8 w-0.5 bg-stone-300 absolute -bottom-8">
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FCFBF9] text-[9px] text-stone-500 p-0.5 font-mono">
                                DAG Link
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-stone-400">
                    <GitBranch className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                    <p className="text-sm">Select a process pipeline to visualize the DAG model flow.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- 3. ACTIVE EXECUTIONS VIEW --- */}
        {activeTab === "executions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Executions queue list */}
            <div className="bg-white rounded-lg border border-stone-200 p-5 shadow-sm space-y-4">
              <h3 className="text-md font-semibold text-stone-900">Current Workflow Instances</h3>
              {instances.length === 0 ? (
                <div className="text-xs text-stone-500">No active instances. Launch one from the Dashboard panel.</div>
              ) : (
                <div className="space-y-2">
                  {instances.map(inst => (
                    <button
                      key={inst.id}
                      onClick={() => setSelectedInstance(inst)}
                      className={`w-full text-left p-3 rounded transition-all text-xs border ${
                        selectedInstance?.id === inst.id
                          ? "border-amber-700 bg-amber-50/40"
                          : "border-stone-100 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-stone-900">{inst.definitionName}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            inst.status === "COMPLETED"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {inst.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1 font-mono">{inst.id}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">Started: {new Date(inst.startedAt).toLocaleTimeString()}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Execution Details Panel */}
            <div className="lg:col-span-2 space-y-4">
              {selectedInstance ? (
                <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm space-y-6">
                  {/* Title */}
                  <div className="flex justify-between items-start border-b border-stone-100 pb-4">
                    <div>
                      <span className="text-xs font-mono text-stone-400">ID: {selectedInstance.id}</span>
                      <h4 className="text-lg font-semibold text-stone-900">{selectedInstance.definitionName}</h4>
                      <p className="text-xs text-stone-500">Trigger Context: {selectedInstance.context.initiatedBy || "Automated Rule"}</p>
                    </div>
                    <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded text-xs font-semibold">
                      {selectedInstance.status}
                    </span>
                  </div>

                  {/* Active Step status logs */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Orchestrated Step Pipeline</h5>
                    <div className="space-y-3">
                      {stepInstances
                        .filter(s => s.instanceId === selectedInstance.id)
                        .map(step => (
                          <div key={step.id} className="p-3 border border-stone-100 rounded bg-[#FAF9F6] flex justify-between items-center text-xs">
                            <div>
                              <div className="font-semibold text-stone-950">{step.name}</div>
                              <div className="text-[10px] text-stone-400 flex gap-3 mt-1">
                                <span>Type: {step.type}</span>
                                {step.assignedRole && <span>Role: {step.assignedRole}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 text-[9px] rounded font-semibold ${
                                  step.status === "COMPLETED"
                                    ? "bg-green-50 text-green-700"
                                    : step.status === "FAILED"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-yellow-50 text-yellow-700 animate-pulse"
                                }`}
                              >
                                {step.status}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Unified Audit Timeline for this instance */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Transactional Audit Trail</h5>
                    <div className="border-l-2 border-stone-100 pl-4 space-y-4">
                      {auditLogs
                        .filter(log => log.instanceId === selectedInstance.id || log.instanceId === "GLOBAL")
                        .map((log, index) => (
                          <div key={index} className="relative text-xs">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-stone-300 border-2 border-white" />
                            <div className="text-[10px] text-stone-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</div>
                            <p className="text-stone-700 mt-0.5">{log.message}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm text-center text-stone-400 py-16">
                  <Activity className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                  <p className="text-sm">Select an active execution instance from the left column to view audit trails.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 4. TASK BOARD --- */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 border border-stone-200 rounded-lg shadow-sm">
              <div>
                <h3 className="text-md font-semibold text-stone-900">Task Management & Escort Pipeline</h3>
                <p className="text-xs text-stone-500 mt-1">Manual operations generated and tracked directly by workflows.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Kanban Column: Todo */}
              {["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map(col => {
                const colTasks = tasks.filter(t => (col === "TODO" ? t.status === "TODO" : col === "IN_PROGRESS" ? t.status === "IN_PROGRESS" : col === "REVIEW" ? t.status === "REVIEW" : t.status === "DONE"));
                return (
                  <div key={col} className="bg-stone-100 p-4 rounded-lg min-h-[400px] flex flex-col gap-3">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{col} ({colTasks.length})</span>
                    {colTasks.length === 0 ? (
                      <div className="text-xs text-stone-400 text-center py-8">Empty</div>
                    ) : (
                      colTasks.map(task => (
                        <div key={task.id} className="bg-white p-4 rounded border border-stone-200 shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-stone-900 text-xs">{task.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                task.priority === "CRITICAL"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-stone-100 text-stone-600"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-stone-500 text-[11px] leading-relaxed">{task.description}</p>

                          {/* Checklist */}
                          {task.checklist.length > 0 && (
                            <div className="border-t border-stone-100 pt-2 space-y-1">
                              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Audit Checklist</span>
                              {task.checklist.map(item => (
                                <div key={item.id} className="flex items-center gap-2 text-[11px]">
                                  <input
                                    type="checkbox"
                                    checked={item.isCompleted}
                                    onChange={() => {
                                      item.isCompleted = !item.isCompleted;
                                      refreshAllState();
                                    }}
                                    className="rounded border-stone-300 text-amber-700 focus:ring-amber-500"
                                  />
                                  <span className={item.isCompleted ? "line-through text-stone-400" : "text-stone-700"}>{item.text}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {task.status !== "DONE" && (
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              className="w-full mt-3 bg-stone-950 text-white text-[10px] py-1.5 rounded hover:bg-stone-800 transition-all font-medium"
                            >
                              Complete Checklist Task
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- 5. APPROVAL INBOX --- */}
        {activeTab === "approvals" && (
          <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-medium text-stone-900 mb-2">Manual Approval Pipeline</h3>
            <p className="text-xs text-stone-500 mb-6">Validate automated symbol extractions, Vastu corrections, and critical site remedies.</p>

            {approvals.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <Inbox className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                <p className="text-sm">No approvals pending. All workflows are clear!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvals.map(app => (
                  <div key={app.id} className="border border-stone-200 rounded-lg p-5 flex justify-between items-start bg-[#FCFBF9]">
                    <div className="max-w-md space-y-1">
                      <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-mono font-semibold">APPROVAL REQUIRED</span>
                      <h4 className="font-semibold text-stone-900 text-sm mt-1">{app.title}</h4>
                      <p className="text-xs text-stone-500">Instance ID: {app.instanceId}</p>

                      <div className="flex gap-2 mt-3 pt-2 border-t border-stone-100">
                        {app.requiredApprovers.map((req, idx) => (
                          <span key={idx} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                            Role: {req.role} — {req.approved ? "Approved" : "Pending"}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {app.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleResolveApproval(app.id, "PROJECT_MANAGER", "APPROVED")}
                            className="bg-green-700 hover:bg-green-800 text-white text-xs px-4 py-2 rounded font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleResolveApproval(app.id, "PROJECT_MANAGER", "REJECTED")}
                            className="bg-red-700 hover:bg-red-800 text-white text-xs px-4 py-2 rounded font-medium"
                          >
                            Reject & Fail
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold bg-green-50 text-green-700 px-3 py-1.5 rounded">
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- 6. SCHEDULER CONSOLE --- */}
        {activeTab === "scheduler" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jobs list */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-stone-200 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-medium text-stone-900">Background Cron Timers & Jobs</h3>
              <p className="text-xs text-stone-500">Scheduled maintenance task, background event cleaners, and SLA alarms.</p>

              <div className="space-y-3">
                {cronJobs.map(job => (
                  <div key={job.id} className="p-4 border border-stone-100 rounded-lg bg-[#FCFBF9] flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-xs">{job.name}</span>
                        <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-mono">{job.expression}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1 flex gap-3">
                        <span>Type: {job.type}</span>
                        <span>Retries left: {job.maxRetries - job.retryCount}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">Last run: {job.lastRun ? new Date(job.lastRun).toLocaleString() : "Never"}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTriggerJob(job.id)}
                        className="bg-stone-950 text-white text-xs px-3 py-1.5 rounded hover:bg-stone-800"
                      >
                        Trigger Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduler executions history */}
            <div className="bg-white rounded-lg border border-stone-200 p-5 shadow-sm space-y-4">
              <h3 className="text-md font-semibold text-stone-900">Timer History Log</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {scheduler.getHistory().map((hist, index) => (
                  <div key={index} className="p-3 border border-stone-100 rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-stone-900">{hist.jobId}</span>
                      <span
                        className={`text-[9px] font-semibold ${
                          hist.status === "SUCCESS" ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {hist.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-1 font-mono">Timestamp: {new Date(hist.runAt).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 7. EVENT EXPLORER --- */}
        {activeTab === "events" && (
          <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-stone-900">Pub/Sub Event Bus Buffer</h3>
                <p className="text-xs text-stone-500 mt-1">Immutable trace buffer of routed system domain, system, and user events.</p>
              </div>
            </div>

            {eventsList.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <ArrowRightLeft className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                <p className="text-sm">No events routed yet. Fire a simulator event on the Dashboard!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventsList.map(evt => (
                  <div key={evt.id} className="p-4 border border-stone-100 rounded bg-[#FCFBF9] text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-stone-900">{evt.name}</span>
                      <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-mono">{evt.source}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-1">Routed ID: {evt.id}</div>
                    <div className="mt-3 bg-stone-950 text-green-400 p-3 rounded font-mono text-[10px] overflow-x-auto">
                      {JSON.stringify(evt.payload, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- 8. NOTIFICATIONS VIEW --- */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-medium text-stone-900 mb-2">Notification Center</h3>
            <p className="text-xs text-stone-500 mb-6">Dispatched notifications over Email, SMS, Webhooks, or In-App channels.</p>

            {notifications.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <Bell className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                <p className="text-sm">No notifications issued.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 border border-stone-100 rounded-lg bg-[#FCFBF9] flex justify-between items-center">
                    <div>
                      <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{n.channel}</span>
                      <h4 className="font-semibold text-stone-900 text-xs mt-1.5">{n.title}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{n.body}</p>
                      <div className="text-[10px] text-stone-400 mt-2 font-mono">Recipient: {n.recipient}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                      {n.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
