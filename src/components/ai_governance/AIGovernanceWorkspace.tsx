import React, { useState, useEffect } from "react";
import {
  Cpu,
  Terminal,
  Sliders,
  Gauge,
  History,
  DollarSign,
  Activity,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  UserCheck,
  Eye,
  Check,
  ArrowDownUp
} from "lucide-react";
import {
  AIGateway,
  AIModelRegistry,
  PromptRegistry,
  AIObservability,
  AIGovernanceService,
  AIExperimentService,
  AIProviderType,
  ModelStatus,
  PromptApprovalStatus,
  ExperimentType,
  PolicyAction,
  AIModel,
  PromptTemplate,
  PromptVersion,
  AIExperiment,
  AIPolicy
} from "../../core/ai_governance";

export const AIGovernanceWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "registry" | "studio" | "diff" | "gateway" | "experiments" | "benchmarks" | "cost" | "health" | "governance" | "audit"
  >("gateway");

  // Services instances
  const gateway = AIGateway.getInstance();
  const modelRegistry = AIModelRegistry.getInstance();
  const promptRegistry = PromptRegistry.getInstance();
  const observability = AIObservability.getInstance();
  const governanceService = AIGovernanceService.getInstance();
  const experimentService = AIExperimentService.getInstance();

  // State
  const [models, setModels] = useState<AIModel[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [targetModel, setTargetModel] = useState<string>("mdl-gemini-3-6-flash");
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [isRunningPlayground, setIsRunningPlayground] = useState<boolean>(false);

  // Diff State
  const [diffTemplateId, setDiffTemplateId] = useState<string>("");
  const [diffVersions, setDiffVersions] = useState<PromptVersion[]>([]);
  const [v1Id, setV1Id] = useState<string>("");
  const [v2Id, setV2Id] = useState<string>("");

  // Governance / Policy States
  const [policies, setPolicies] = useState<AIPolicy[]>([]);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    ruleType: "SAFETY" as "SAFETY" | "COST" | "RESTRICTION",
    action: PolicyAction.DENY,
    matchPattern: "",
    maxMonthlyCostLimit: 0,
    isEnforced: true,
    createdBy: "pavitra.taurus@gmail.com",
    updatedBy: "pavitra.taurus@gmail.com",
    version: "1.0.0",
    status: "ACTIVE",
    tags: [] as string[]
  });

  // Experiments state
  const [experiments, setExperiments] = useState<AIExperiment[]>([]);

  // Observability & Cost states
  const [usages, setUsages] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditFilter, setAuditFilter] = useState<string>("ALL");
  const [auditSearch, setAuditSearch] = useState<string>("");

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    const allModels = modelRegistry.getModels();
    const allTemplates = promptRegistry.getTemplates();
    const allPolicies = governanceService.getPolicies();
    const allExps = experimentService.getExperiments();
    const allUsages = observability.getUsages();
    const allBudgets = observability.getBudgets();
    const allAudits = observability.getAuditLogs();

    setModels(allModels);
    setTemplates(allTemplates);
    setPolicies([...allPolicies]);
    setExperiments([...allExps]);
    setUsages([...allUsages]);
    setBudgets([...allBudgets]);
    setAuditLogs([...allAudits]);

    if (allTemplates.length > 0) {
      if (!selectedTemplateId) {
        handleTemplateChange(allTemplates[0].id);
      }
      if (!diffTemplateId) {
        handleDiffTemplateChange(allTemplates[0].id);
      }
    }
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = promptRegistry.getTemplate(id);
    if (tmpl) {
      setSelectedTemplate(tmpl);
      // prefill variables
      const vars: Record<string, string> = {};
      tmpl.variables.forEach(v => {
        if (v === "building_blueprint_data") vars[v] = "Toilets situated in North-East sector, Entrance on East-North-East.";
        else if (v === "birth_details") vars[v] = "DOB: 1994-11-23, TOB: 08:30 AM, Saturn in 4th house, Jupiter in 6th.";
        else if (v === "location_profile") vars[v] = "Geo Coordinate: New Delhi, India";
        else if (v === "planetary_positions") vars[v] = "Sun in 1st House, Saturn in 4th House, Mars in 8th House";
        else if (v === "current_dasha") vars[v] = "Rahu Mahadasha, Saturn Antardasha";
        else if (v === "client_age") vars[v] = "31 Years";
        else vars[v] = "Default diagnostic context";
      });
      setTemplateVariables(vars);
    }
  };

  const handleDiffTemplateChange = (id: string) => {
    setDiffTemplateId(id);
    const versionsList = promptRegistry.getVersions(id);
    setDiffVersions(versionsList);
    if (versionsList.length >= 2) {
      setV1Id(versionsList[0].id);
      setV2Id(versionsList[1].id);
    } else if (versionsList.length === 1) {
      setV1Id(versionsList[0].id);
      setV2Id(versionsList[0].id);
    }
  };

  const executePlayground = async () => {
    if (!selectedTemplateId) return;
    setIsRunningPlayground(true);
    setPlaygroundResponse(null);

    // Enforce prompt compile locally
    try {
      const response = await gateway.executePrompt({
        templateId: selectedTemplateId,
        variables: templateVariables,
        userId: "pavitra.taurus@gmail.com",
        department: "Vastu Analytics",
        contextDomain: "DOMAIN-018:AIWorkspacePlayground",
        overrideModelId: targetModel
      });

      setPlaygroundResponse(response);
    } catch (err: any) {
      setPlaygroundResponse({
        text: `Gateway Execution Failure: ${err.message || "Unknown error"}`,
        modelUsed: targetModel,
        providerUsed: AIProviderType.GEMINI,
        latencyMs: 120,
        tokens: { prompt: 0, completion: 0, total: 0 },
        costInUsd: 0,
        policyAction: PolicyAction.DENY
      });
    } finally {
      setIsRunningPlayground(false);
      refreshAllData();
    }
  };

  // Policy methods
  const handleTogglePolicy = (id: string) => {
    governanceService.togglePolicy(id);
    refreshAllData();
  };

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    governanceService.addPolicy({
      ...newPolicy,
      tags: newPolicy.matchPattern ? ["auto-filter"] : [],
      metadata: {}
    });
    setShowAddPolicyModal(false);
    setNewPolicy({
      name: "",
      description: "",
      ruleType: "SAFETY",
      action: PolicyAction.DENY,
      matchPattern: "",
      maxMonthlyCostLimit: 0,
      isEnforced: true,
      createdBy: "pavitra.taurus@gmail.com",
      updatedBy: "pavitra.taurus@gmail.com",
      version: "1.0.0",
      status: "ACTIVE",
      tags: []
    });
    refreshAllData();
  };

  // Experiment toggles
  const handleToggleExperiment = (id: string) => {
    experimentService.toggleExperiment(id);
    refreshAllData();
  };

  const handleRunEvaluation = (targetId: string) => {
    experimentService.executeEvaluation(targetId, "mdl-gemini-3-1-pro");
    refreshAllData();
    alert(`LLM-as-a-judge evaluation successfully compiled for model: ${targetId}`);
  };

  // Observability & Cost helpers
  const totalEnterpriseTokens = usages.reduce((sum, u) => sum + u.totalTokens, 0);
  const totalEnterpriseCost = usages.reduce((sum, u) => sum + u.costInUsd, 0);
  const currentMonthForecast = totalEnterpriseCost * 1.4; // Simulated dynamic projection

  // Filtered audits
  const filteredAudits = auditLogs.filter(log => {
    if (auditFilter !== "ALL" && log.severity !== auditFilter) return false;
    if (auditSearch) {
      const s = auditSearch.toLowerCase();
      return (
        log.action.toLowerCase().includes(s) ||
        log.details.toLowerCase().includes(s) ||
        log.userId.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div id="ai-governance-workspace" className="p-6 bg-[#FAF9F5] text-[#2C2A29] min-h-screen">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#EBE9E0] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#1B365D]/10 text-[#1B365D] rounded-lg">
              <Cpu className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#1B365D]">
              UrjaFlux AI Governance Layer
            </h1>
          </div>
          <p className="text-sm text-[#706E6B] mt-2 max-w-2xl">
            DOMAIN-018 — Enterprise model registries, prompt validation playgrounds, non-invasive safety policies, shadow experiment coordinators, and cost intelligence audits.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <div className="bg-[#FFFFFF] border border-[#EBE9E0] px-4 py-2 rounded-lg text-xs flex flex-col justify-center min-w-[120px]">
            <span className="text-[#706E6B] font-semibold uppercase tracking-wider block">Total Logs</span>
            <span className="text-base font-bold text-[#1B365D]">{usages.length} queries</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#EBE9E0] px-4 py-2 rounded-lg text-xs flex flex-col justify-center min-w-[120px]">
            <span className="text-[#706E6B] font-semibold uppercase tracking-wider block">Token Ingress</span>
            <span className="text-base font-bold text-[#1B365D]">{totalEnterpriseTokens.toLocaleString()}</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#EBE9E0] px-4 py-2 rounded-lg text-xs flex flex-col justify-center min-w-[120px]">
            <span className="text-[#706E6B] font-semibold uppercase tracking-wider block">Accumulated Cost</span>
            <span className="text-base font-bold text-[#8C2D19]">${totalEnterpriseCost.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-[#EBE9E0] mb-6">
        {[
          { id: "gateway", label: "AI Gateway Console", icon: Terminal },
          { id: "studio", label: "Prompt Studio", icon: FileCode },
          { id: "diff", label: "Prompt Diff", icon: Sliders },
          { id: "registry", label: "Model Catalog", icon: Cpu },
          { id: "governance", label: "Governance Center", icon: ShieldCheck },
          { id: "experiments", label: "Shadow & A/B Testing", icon: Sliders },
          { id: "benchmarks", label: "Evaluation Suite", icon: Gauge },
          { id: "cost", label: "Cost & Budgets", icon: DollarSign },
          { id: "health", label: "Provider Health", icon: Activity },
          { id: "audit", label: "Audit Log Explorer", icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-t border-x ${
                isActive
                  ? "bg-[#FFFFFF] text-[#1B365D] border-[#EBE9E0] border-b-transparent translate-y-[1px]"
                  : "bg-transparent text-[#706E6B] border-transparent hover:text-[#2C2A29] hover:bg-[#EBE9E0]/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Workspace content sections */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#EBE9E0] p-6 shadow-sm min-h-[500px]">
        {/* TAB 1: AI Gateway Console */}
        {activeTab === "gateway" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1B365D]">Centralized AI Gateway Console</h3>
                <p className="text-xs text-[#706E6B]">Compile enterprise prompt templates with variables, select target LLM models, and preview responses under safety policies.</p>
              </div>
              <button
                onClick={refreshAllData}
                className="flex items-center gap-1 text-xs text-[#1B365D] hover:underline font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Synchronize Registries
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Settings column */}
              <div className="lg:col-span-4 space-y-4 border-r border-[#EBE9E0] pr-0 lg:pr-6">
                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-2">
                    1. Select Registered Template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={e => handleTemplateChange(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none focus:border-[#1B365D]"
                  >
                    <option value="">-- Choose Template --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplate && (
                  <div className="bg-[#FAF9F5] p-3 rounded-lg border border-[#EBE9E0] text-xs">
                    <p className="font-semibold text-[#1B365D] mb-1">{selectedTemplate.name}</p>
                    <p className="text-[#706E6B] leading-relaxed mb-2">{selectedTemplate.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-[#EBE9E0] text-[#2C2A29] px-2 py-0.5 rounded text-[10px] font-bold">
                        ACTIVE VERSION: {selectedTemplate.activeVersionId}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-2">
                    2. Dynamic Target Variables
                  </label>
                  <div className="space-y-3 bg-[#FAF9F5] p-3 rounded-lg border border-[#EBE9E0]">
                    {Object.keys(templateVariables).length === 0 ? (
                      <p className="text-[#706E6B] text-xs italic">No variables needed for this prompt.</p>
                    ) : (
                      Object.keys(templateVariables).map(key => (
                        <div key={key}>
                          <label className="block text-[10px] font-bold text-[#706E6B] mb-1 uppercase">
                            {key.replace(/_/g, " ")}
                          </label>
                          <textarea
                            value={templateVariables[key]}
                            onChange={e =>
                              setTemplateVariables({ ...templateVariables, [key]: e.target.value })
                            }
                            rows={3}
                            className="w-full bg-white border border-[#EBE9E0] rounded-lg p-2 text-xs text-[#2C2A29] focus:outline-none focus:border-[#1B365D]"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-2">
                    3. Route Model Override
                  </label>
                  <select
                    value={targetModel}
                    onChange={e => setTargetModel(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none focus:border-[#1B365D]"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.provider})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#706E6B] mt-1">
                    By default, requests matching vastu:* or lalkitab:* auto-route to designated models unless overridden.
                  </p>
                </div>

                <button
                  onClick={executePlayground}
                  disabled={isRunningPlayground || !selectedTemplateId}
                  className="w-full bg-[#1B365D] hover:bg-[#142946] text-white py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isRunningPlayground ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Executing Secure Call...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Route Gateway Query
                    </>
                  )}
                </button>
              </div>

              {/* Right Output column */}
              <div className="lg:col-span-8 flex flex-col h-full justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-2">
                    Gateway Tracing Output
                  </label>

                  {!playgroundResponse ? (
                    <div className="bg-[#FAF9F5] rounded-xl border border-dashed border-[#EBE9E0] p-12 text-center h-[350px] flex flex-col items-center justify-center">
                      <Terminal className="w-12 h-12 text-[#706E6B] opacity-50 mb-3" />
                      <p className="text-sm font-semibold text-[#1B365D]">Awaiting Gateway Request</p>
                      <p className="text-xs text-[#706E6B] max-w-md mt-1">
                        Select a template, fill in prompt variables, and click 'Route Gateway Query' to fire a secure server-side proxy request.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Telemetry panel */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F5] p-3 rounded-xl border border-[#EBE9E0]">
                        <div className="text-xs">
                          <span className="text-[#706E6B] block text-[10px] uppercase font-bold">Latency</span>
                          <span className="font-bold text-[#1B365D]">{playgroundResponse.latencyMs} ms</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-[#706E6B] block text-[10px] uppercase font-bold">Tokens Consumed</span>
                          <span className="font-bold text-[#1B365D]">
                            {playgroundResponse.tokens.total} ({playgroundResponse.tokens.prompt} in /{" "}
                            {playgroundResponse.tokens.completion} out)
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-[#706E6B] block text-[10px] uppercase font-bold">Transaction Cost</span>
                          <span className="font-bold text-[#8C2D19]">${playgroundResponse.costInUsd.toFixed(6)}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-[#706E6B] block text-[10px] uppercase font-bold">Safety Policy Action</span>
                          <span
                            className={`font-bold uppercase ${
                              playgroundResponse.policyAction === PolicyAction.ALLOW
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {playgroundResponse.policyAction}
                          </span>
                        </div>
                      </div>

                      {/* Compilation check */}
                      <div className="bg-[#FFFFFF] rounded-xl border border-[#EBE9E0] p-4 text-xs">
                        <span className="text-[#706E6B] font-bold block uppercase mb-1">Compiled Prompt Payload (Audit Traced)</span>
                        <div className="bg-[#FAF9F5] p-3 rounded border border-[#EBE9E0] text-slate-700 font-mono text-[11px] max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {promptRegistry.compile(selectedTemplateId, templateVariables)}
                        </div>
                      </div>

                      {/* Actual Response content */}
                      <div className="bg-[#FFFFFF] rounded-xl border border-[#EBE9E0] p-4">
                        <span className="text-[#706E6B] font-bold text-xs block uppercase mb-2">Gateway Response (Plaintext)</span>
                        <div className="bg-[#FAF9F5] p-4 rounded border border-[#EBE9E0] text-[#2C2A29] text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                          {playgroundResponse.text}
                        </div>
                      </div>

                      {/* Shadow output if active */}
                      {playgroundResponse.shadowResult && (
                        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                          <span className="text-amber-800 font-bold text-xs flex items-center gap-1.5 uppercase mb-1">
                            <Activity className="w-4 h-4 animate-pulse" /> Background Shadow Test Stream
                          </span>
                          <p className="text-[10px] text-amber-700 mb-2">
                            A shadow payload was securely mirrored to local model '{playgroundResponse.shadowResult.modelId}' for verification. Production latency was unaffected.
                          </p>
                          <div className="bg-[#FFFFFF] p-3 rounded border border-amber-200 text-slate-700 font-mono text-[11px] max-h-24 overflow-y-auto">
                            {playgroundResponse.shadowResult.text}
                          </div>
                          <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                            Shadow Latency: {playgroundResponse.shadowResult.latencyMs} ms
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs">
                  <h4 className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Decentralized Integration Layer
                  </h4>
                  <p className="mt-1 leading-relaxed text-emerald-700">
                    This single gateway routes real-time client queries securely. Standard domains like Vastu Reasoning or Lal Kitab never make direct client-side SDK requests; they only call this governance proxy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Prompt Studio */}
        {activeTab === "studio" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1B365D]">Enterprise Prompt Studio</h3>
                <p className="text-xs text-[#706E6B]">Manage the centralized catalog of approved prompts. Avoid hardcoded strings in business microservices.</p>
              </div>
              <button
                onClick={() => {
                  const title = prompt("Enter template name:");
                  if (!title) return;
                  const desc = prompt("Enter template description:");
                  const body = prompt("Enter raw prompt content (use {variable} wrappers):");
                  if (title && body) {
                    promptRegistry.createTemplate({
                      name: title,
                      description: desc || "",
                      category: "General",
                      createdBy: "pavitra.taurus@gmail.com",
                      updatedBy: "pavitra.taurus@gmail.com",
                      version: "1.0.0",
                      status: "ACTIVE",
                      variables: [],
                      tags: [],
                      metadata: {}
                    }, body);
                    refreshAllData();
                    alert("Template submitted for governance approval.");
                  }
                }}
                className="bg-[#1B365D] hover:bg-[#142946] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Register Prompt Template
              </button>
            </div>

            <div className="space-y-4">
              {templates.map(tmpl => {
                const versions = promptRegistry.getVersions(tmpl.id);
                return (
                  <div key={tmpl.id} className="bg-[#FAF9F5] border border-[#EBE9E0] rounded-xl p-5 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#1B365D]">{tmpl.name}</h4>
                        <p className="text-xs text-[#706E6B]">{tmpl.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-[#1B365D]/10 text-[#1B365D] px-2.5 py-1 rounded-full text-[10px] font-bold">
                          {tmpl.category}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tmpl.approvalStatus === PromptApprovalStatus.APPROVED
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {tmpl.approvalStatus}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-[#EBE9E0] pt-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[#706E6B] font-bold text-[10px] uppercase block mb-1">Extracted Variables</span>
                        <div className="flex flex-wrap gap-1.5">
                          {tmpl.variables.map(v => (
                            <span key={v} className="bg-slate-100 border border-slate-200 font-mono text-[10px] px-1.5 py-0.5 rounded">
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-[#706E6B] font-bold text-[10px] uppercase block mb-1">Version Stack</span>
                        <div className="space-y-2">
                          {versions.map(v => (
                            <div key={v.id} className="bg-white border border-[#EBE9E0] p-2.5 rounded text-xs flex justify-between items-center">
                              <div>
                                <span className="font-bold text-[#1B365D] mr-2">v{v.version}</span>
                                <span className="text-slate-600 font-mono text-[11px] truncate max-w-md inline-block align-middle">
                                  {v.promptText.substring(0, 75)}...
                                </span>
                              </div>
                              <div className="flex gap-2">
                                {tmpl.activeVersionId === v.id ? (
                                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" /> ACTIVE
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      promptRegistry.approveVersion(tmpl.id, v.id, "pavitra.taurus@gmail.com");
                                      refreshAllData();
                                      alert("Prompt rollbacked and published.");
                                    }}
                                    className="bg-white hover:bg-[#FAF9F5] border border-[#EBE9E0] px-2.5 py-1 rounded text-[10px] font-bold text-slate-600"
                                  >
                                    Promote to Active
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Prompt Diff Viewer */}
        {activeTab === "diff" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold text-[#1B365D]">Prompt Version Comparison (Diff Viewer)</h3>
              <p className="text-xs text-[#706E6B]">Visualize differences and modification blocks before publishing new prompt payloads.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-[#706E6B] mb-1.5 uppercase">Select Prompt Template</label>
                <select
                  value={diffTemplateId}
                  onChange={e => handleDiffTemplateChange(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#706E6B] mb-1.5 uppercase">Source Version</label>
                <select
                  value={v1Id}
                  onChange={e => setV1Id(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                >
                  {diffVersions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.version} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#706E6B] mb-1.5 uppercase">Target Version</label>
                <select
                  value={v2Id}
                  onChange={e => setV2Id(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                >
                  {diffVersions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.version} ({v.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {v1Id && v2Id ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-[#EBE9E0] rounded-xl p-4 bg-red-50/20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
                      Left (v{promptRegistry.getPromptVersion(v1Id)?.version || "1.0"})
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Created by {promptRegistry.getPromptVersion(v1Id)?.createdBy}
                    </span>
                  </div>
                  <div className="bg-white border border-[#EBE9E0] p-4 rounded text-xs font-mono whitespace-pre-wrap min-h-[220px] leading-relaxed text-slate-700">
                    {promptRegistry.getPromptVersion(v1Id)?.promptText}
                  </div>
                </div>

                <div className="border border-[#EBE9E0] rounded-xl p-4 bg-green-50/20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-green-800 uppercase tracking-wider block">
                      Right (v{promptRegistry.getPromptVersion(v2Id)?.version || "1.1"})
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Created by {promptRegistry.getPromptVersion(v2Id)?.createdBy}
                    </span>
                  </div>
                  <div className="bg-white border border-[#EBE9E0] p-4 rounded text-xs font-mono whitespace-pre-wrap min-h-[220px] leading-relaxed text-slate-700">
                    {promptRegistry.getPromptVersion(v2Id)?.promptText}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#706E6B] italic">Please register additional versions to explore prompts differences.</p>
            )}
          </div>
        )}

        {/* TAB 4: Model Catalog */}
        {activeTab === "registry" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1B365D]">AI Model Catalog & Profiles</h3>
                <p className="text-xs text-[#706E6B]">Verified enterprise-ready LLMs with latencies, cost parameters, capabilities, and deprecation structures.</p>
              </div>
              <button
                onClick={() => {
                  const name = prompt("Enter model name:");
                  if (!name) return;
                  modelRegistry.registerModel({
                    name,
                    provider: AIProviderType.GEMINI,
                    endpointUrl: "https://generativelanguage.googleapis.com",
                    capabilities: { text: true, image: false, audio: false, video: false, functionCalling: true, structuredOutput: true, maxContextTokens: 128000 },
                    performanceProfile: { latencyMs: 220, accuracyScore: 82.0, avgThroughput: 60 },
                    costProfile: { costPerMillionInputTokens: 0.15, costPerMillionOutputTokens: 0.6 },
                    availabilityStatus: "ONLINE",
                    createdBy: "pavitra.taurus@gmail.com",
                    updatedBy: "pavitra.taurus@gmail.com",
                    version: "1.0.0",
                    status: ModelStatus.ACTIVE,
                    tags: [],
                    metadata: {}
                  });
                  refreshAllData();
                }}
                className="bg-[#1B365D] hover:bg-[#142946] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Register Model Endpoint
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map(model => (
                <div key={model.id} className="bg-[#FAF9F5] border border-[#EBE9E0] rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#1B365D]">{model.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Provider: {model.provider}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          model.status === ModelStatus.ACTIVE
                            ? "bg-green-100 text-green-800"
                            : model.status === ModelStatus.DEPRECATED
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {model.status}
                      </span>
                    </div>

                    <div className="space-y-2 border-t border-[#EBE9E0] pt-3 mt-3 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-[#706E6B] font-semibold">Latency Average</span>
                        <span className="font-bold text-[#1B365D]">{model.performanceProfile.latencyMs} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#706E6B] font-semibold">Cost Input (Million)</span>
                        <span className="font-bold text-slate-800">${model.costProfile.costPerMillionInputTokens.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#706E6B] font-semibold">Cost Output (Million)</span>
                        <span className="font-bold text-slate-800">${model.costProfile.costPerMillionOutputTokens.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#706E6B] font-semibold">Context Limit</span>
                        <span className="font-bold text-[#1B365D]">{model.capabilities.maxContextTokens.toLocaleString()} tokens</span>
                      </div>
                    </div>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap gap-1 mt-4">
                      {model.capabilities.text && (
                        <span className="bg-white border border-[#EBE9E0] text-[9px] px-1.5 py-0.5 rounded text-slate-600 font-bold">TEXT</span>
                      )}
                      {model.capabilities.image && (
                        <span className="bg-white border border-[#EBE9E0] text-[9px] px-1.5 py-0.5 rounded text-slate-600 font-bold">IMAGE</span>
                      )}
                      {model.capabilities.audio && (
                        <span className="bg-white border border-[#EBE9E0] text-[9px] px-1.5 py-0.5 rounded text-slate-600 font-bold">AUDIO</span>
                      )}
                      {model.capabilities.functionCalling && (
                        <span className="bg-white border border-[#EBE9E0] text-[9px] px-1.5 py-0.5 rounded text-slate-600 font-bold">FN-CALL</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1.5 mt-5 pt-3 border-t border-[#EBE9E0]">
                    {model.status === ModelStatus.ACTIVE ? (
                      <button
                        onClick={() => {
                          modelRegistry.updateModelStatus(model.id, ModelStatus.DEPRECATED, "pavitra.taurus@gmail.com");
                          refreshAllData();
                        }}
                        className="w-full bg-[#8C2D19]/10 text-[#8C2D19] hover:bg-[#8C2D19]/20 font-bold text-[10px] py-1.5 rounded transition-all uppercase tracking-wide"
                      >
                        Deprecate Model
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          modelRegistry.updateModelStatus(model.id, ModelStatus.ACTIVE, "pavitra.taurus@gmail.com");
                          refreshAllData();
                        }}
                        className="w-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-[10px] py-1.5 rounded transition-all uppercase tracking-wide"
                      >
                        Promote Active
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Governance Center */}
        {activeTab === "governance" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1B365D]">AI Safety, Budgets & Compliance Policies</h3>
                <p className="text-xs text-[#706E6B]">Centralized rules triggered before model routing. Evaluates restricted keywords, budget limits, and high-tier models access.</p>
              </div>
              <button
                onClick={() => setShowAddPolicyModal(true)}
                className="bg-[#1B365D] hover:bg-[#142946] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Safety Policy
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {policies.map(policy => (
                <div key={policy.id} className="bg-[#FAF9F5] border border-[#EBE9E0] p-5 rounded-xl hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <span className="p-2 bg-slate-200/50 rounded-lg text-[#1B365D]">
                        <ShieldCheck className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#1B365D] flex items-center gap-2">
                          {policy.name}
                          <span className="bg-[#1B365D]/10 text-[#1B365D] text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            {policy.ruleType}
                          </span>
                        </h4>
                        <p className="text-xs text-[#706E6B] mt-1">{policy.description}</p>

                        {policy.matchPattern && (
                          <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className="font-bold text-[#706E6B]">Blocked terms:</span>
                            <span className="font-mono bg-white border border-[#EBE9E0] text-red-800 px-1.5 py-0.5 rounded text-[10px]">
                              {policy.matchPattern}
                            </span>
                          </div>
                        )}

                        {policy.maxMonthlyCostLimit && (
                          <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className="font-bold text-[#706E6B]">Monthly Limit:</span>
                            <span className="font-mono bg-white border border-[#EBE9E0] text-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                              ${policy.maxMonthlyCostLimit} USD
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] text-slate-500">v{policy.version}</span>
                      <button
                        onClick={() => handleTogglePolicy(policy.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          policy.isEnforced
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {policy.isEnforced ? "Policy Enforced" : "Disabled"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Safety Policy creation Modal */}
            {showAddPolicyModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl border border-[#EBE9E0] p-6 max-w-lg w-full shadow-2xl">
                  <h4 className="font-serif font-bold text-lg text-[#1B365D] mb-4">Register Central Governance Policy</h4>
                  <form onSubmit={handleCreatePolicy} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#706E6B] mb-1 uppercase">Policy Name</label>
                      <input
                        type="text"
                        value={newPolicy.name}
                        onChange={e => setNewPolicy({ ...newPolicy, name: e.target.value })}
                        required
                        className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#706E6B] mb-1 uppercase">Description</label>
                      <textarea
                        value={newPolicy.description}
                        onChange={e => setNewPolicy({ ...newPolicy, description: e.target.value })}
                        required
                        rows={2}
                        className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#706E6B] mb-1 uppercase">Rule Type</label>
                        <select
                          value={newPolicy.ruleType}
                          onChange={e => setNewPolicy({ ...newPolicy, ruleType: e.target.value as any })}
                          className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                        >
                          <option value="SAFETY">SAFETY</option>
                          <option value="COST">COST</option>
                          <option value="RESTRICTION">RESTRICTION</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#706E6B] mb-1 uppercase">Enforcement Action</label>
                        <select
                          value={newPolicy.action}
                          onChange={e => setNewPolicy({ ...newPolicy, action: e.target.value as any })}
                          className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                        >
                          <option value="ALLOW">ALLOW & AUDIT</option>
                          <option value="DENY">DENY IMMEDIATE</option>
                          <option value="FLAG">FLAG & TRAIL</option>
                          <option value="REQUIRE_APPROVAL">HUMAN APPROVAL</option>
                        </select>
                      </div>
                    </div>
                    {newPolicy.ruleType === "SAFETY" && (
                      <div>
                        <label className="block text-xs font-bold text-[#706E6B] mb-1 uppercase">Blocked Keywords (comma-separated)</label>
                        <input
                          type="text"
                          value={newPolicy.matchPattern}
                          onChange={e => setNewPolicy({ ...newPolicy, matchPattern: e.target.value })}
                          placeholder="e.g. death, doom, ruin"
                          className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                        />
                      </div>
                    )}
                    {newPolicy.ruleType === "COST" && (
                      <div>
                        <label className="block text-xs font-bold text-[#706E6B] mb-1 uppercase">Max Monthly Cost Limit (USD)</label>
                        <input
                          type="number"
                          value={newPolicy.maxMonthlyCostLimit}
                          onChange={e => setNewPolicy({ ...newPolicy, maxMonthlyCostLimit: +e.target.value })}
                          className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddPolicyModal(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-[#2C2A29] px-4 py-2 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#1B365D] hover:bg-[#142946] text-white px-4 py-2 rounded-lg text-xs font-bold"
                      >
                        Enforce Policy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Shadow & A/B Testing */}
        {activeTab === "experiments" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold text-[#1B365D]">Shadow Testing & Traffic Split Coordinator</h3>
              <p className="text-xs text-[#706E6B]">Test new providers or larger variants in production. Shadow runs mirror production payloads in background with zero consumer impact.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {experiments.map(exp => (
                <div key={exp.id} className="bg-[#FAF9F5] border border-[#EBE9E0] p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#1B365D]">{exp.name}</h4>
                        <span className="text-[10px] bg-slate-200 border border-slate-300 px-2 py-0.5 rounded text-[#2C2A29] font-bold mt-1 inline-block">
                          {exp.type}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleExperiment(exp.id)}
                        className={`text-xs font-bold px-3 py-1 rounded transition-all ${
                          exp.active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {exp.active ? "ACTIVE" : "PAUSED"}
                      </button>
                    </div>

                    <p className="text-xs text-[#706E6B] leading-relaxed mb-4">{exp.description}</p>

                    {/* Progress visualizer for traffic split */}
                    <div className="bg-white border border-[#EBE9E0] p-4 rounded-lg mb-4 text-xs space-y-2">
                      <div className="flex justify-between font-bold text-[10px] text-[#706E6B] uppercase">
                        <span>Base model: {exp.baseModelId.replace("mdl-", "")}</span>
                        <span>Variant model: {exp.variantModelId.replace("mdl-", "")}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
                        <div
                          className="bg-slate-500 h-full"
                          style={{ width: `${100 - exp.trafficAllocation}%` }}
                        />
                        <div
                          className="bg-[#1B365D] h-full"
                          style={{ width: `${exp.trafficAllocation}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                        <span>Split: {100 - exp.trafficAllocation}%</span>
                        <span>Split: {exp.trafficAllocation}%</span>
                      </div>
                    </div>

                    {/* Metrics side-by-side */}
                    <div className="grid grid-cols-2 gap-4 bg-white border border-[#EBE9E0] p-4 rounded-lg text-xs">
                      <div>
                        <span className="font-bold text-[#1B365D] block mb-2 uppercase text-[10px]">Base Metrics</span>
                        <div className="space-y-1 text-[#706E6B]">
                          <p>Queries: <span className="font-bold text-[#2C2A29]">{exp.metrics.baseCount}</span></p>
                          <p>Latency: <span className="font-bold text-[#2C2A29]">{exp.metrics.baseLatencyAvg} ms</span></p>
                          <p>User Rating: <span className="font-bold text-green-600">{exp.metrics.baseUserRatingAvg} / 5</span></p>
                        </div>
                      </div>
                      <div className="border-l border-[#EBE9E0] pl-4">
                        <span className="font-bold text-[#1B365D] block mb-2 uppercase text-[10px]">Variant Metrics</span>
                        <div className="space-y-1 text-[#706E6B]">
                          <p>Queries: <span className="font-bold text-[#2C2A29]">{exp.metrics.variantCount}</span></p>
                          <p>Latency: <span className="font-bold text-[#2C2A29]">{exp.metrics.variantLatencyAvg} ms</span></p>
                          <p>User Rating: <span className="font-bold text-green-600">{exp.metrics.variantUserRatingAvg} / 5</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: Evaluation Suite */}
        {activeTab === "benchmarks" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold text-[#1B365D]">Automated Model Benchmarks (LLM-as-a-Judge)</h3>
              <p className="text-xs text-[#706E6B]">Evaluate custom models against standard Vedic dataset collections. Benchmarking covers factual alignment, safety parameters, and conciseness scores.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {experimentService.getBenchmarks().map(bench => (
                <div key={bench.id} className="bg-[#FAF9F5] border border-[#EBE9E0] p-5 rounded-xl">
                  <h4 className="font-serif font-bold text-base text-[#1B365D]">{bench.name}</h4>
                  <p className="text-xs text-[#706E6B] mt-1 mb-4">{bench.description}</p>
                  <div className="space-y-3">
                    {bench.results.map(res => (
                      <div key={res.modelId} className="text-xs flex justify-between items-center bg-white border border-[#EBE9E0] p-2.5 rounded">
                        <span className="font-bold text-[#1B365D]">{res.modelId.replace("mdl-", "")}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#1B365D] h-full" style={{ width: `${res.score}%` }} />
                          </div>
                          <span className="font-bold text-[#2C2A29] font-mono">{res.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="md:col-span-2 bg-[#FAF9F5] border border-[#EBE9E0] p-5 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-serif font-bold text-base text-[#1B365D]">Recent Automated Quality Evaluations</h4>
                  <button
                    onClick={() => handleRunEvaluation("mdl-gemini-3-6-flash")}
                    className="bg-[#1B365D] hover:bg-[#142946] text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Trigger Evaluation Run
                  </button>
                </div>

                <div className="space-y-4">
                  {experimentService.getEvaluations().map(evalRun => (
                    <div key={evalRun.id} className="bg-white border border-[#EBE9E0] p-4 rounded-lg text-xs">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-[#1B365D] block">
                            Target: {evalRun.targetModelId.replace("mdl-", "")}
                          </span>
                          <span className="text-[10px] text-[#706E6B]">
                            Judged by {evalRun.evaluatorModelId.replace("mdl-", "")} • Dataset size: {evalRun.datasetSize} tests
                          </span>
                        </div>
                        <span className="bg-green-100 text-green-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                          {evalRun.status}
                        </span>
                      </div>

                      {/* Scores grid */}
                      <div className="grid grid-cols-4 gap-2 my-3 text-center">
                        <div className="bg-slate-50 border border-slate-100 p-2 rounded">
                          <span className="text-[9px] text-[#706E6B] block uppercase font-bold">Relevance</span>
                          <span className="text-sm font-bold text-[#1B365D]">{Math.round(evalRun.qualityScores.relevance * 100)}%</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-2 rounded">
                          <span className="text-[9px] text-[#706E6B] block uppercase font-bold">Safety</span>
                          <span className="text-sm font-bold text-green-600">{Math.round(evalRun.qualityScores.safety * 100)}%</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-2 rounded">
                          <span className="text-[9px] text-[#706E6B] block uppercase font-bold">Conciseness</span>
                          <span className="text-sm font-bold text-[#1B365D]">{Math.round(evalRun.qualityScores.conciseness * 100)}%</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-2 rounded">
                          <span className="text-[9px] text-[#706E6B] block uppercase font-bold">Factual Vedic</span>
                          <span className="text-sm font-bold text-[#1B365D]">{Math.round(evalRun.qualityScores.factualAccuracy * 100)}%</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-[#EBE9E0] p-3 rounded">
                        <span className="text-[9px] text-[#706E6B] font-bold uppercase block mb-1">Judge Findings</span>
                        <ul className="list-disc pl-4 space-y-1 text-[#2C2A29]">
                          {evalRun.findings.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: Cost & Budgets */}
        {activeTab === "cost" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold text-[#1B365D]">Cost Intelligence & Department Budgets</h3>
              <p className="text-xs text-[#706E6B]">Trace financial impacts per provider, model, and department. Proactively alert when threshold limits are breached.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#FAF9F5] border border-[#EBE9E0] p-5 rounded-xl">
                <span className="text-[#706E6B] font-bold text-[10px] uppercase block mb-1">Total Current Month Cost</span>
                <h4 className="text-3xl font-serif font-bold text-[#8C2D19]">${totalEnterpriseCost.toFixed(4)}</h4>
                <p className="text-xs text-[#706E6B] mt-1">Accumulated across active scholarly queries.</p>
              </div>

              <div className="bg-[#FAF9F5] border border-[#EBE9E0] p-5 rounded-xl">
                <span className="text-[#706E6B] font-bold text-[10px] uppercase block mb-1">End of Month Forecast</span>
                <h4 className="text-3xl font-serif font-bold text-[#1B365D]">${currentMonthForecast.toFixed(4)}</h4>
                <p className="text-xs text-[#706E6B] mt-1">Projected run-rate based on past daily volume patterns.</p>
              </div>

              <div className="bg-[#FAF9F5] border border-[#EBE9E0] p-5 rounded-xl">
                <span className="text-[#706E6B] font-bold text-[10px] uppercase block mb-1">Active Budget Warnings</span>
                <h4 className="text-3xl font-serif font-bold text-amber-600">
                  {budgets.filter(b => b.totalCost > b.budgetLimit).length} Alert(s)
                </h4>
                <p className="text-xs text-[#706E6B] mt-1">Triggered when department quotas are breached.</p>
              </div>
            </div>

            {/* Budgets table */}
            <div className="border border-[#EBE9E0] rounded-xl overflow-hidden text-xs">
              <div className="bg-[#FAF9F5] border-b border-[#EBE9E0] p-3.5 font-bold text-[#1B365D] grid grid-cols-12 gap-2 uppercase tracking-wide">
                <span className="col-span-4">Department / Domain Scope</span>
                <span className="col-span-2 text-right">Tokens Consumed</span>
                <span className="col-span-2 text-right">Accumulated Cost</span>
                <span className="col-span-2 text-right">Budget Allocation</span>
                <span className="col-span-2 text-center">Status Flag</span>
              </div>
              <div className="divide-y divide-[#EBE9E0]">
                {budgets.map(budget => {
                  const isBreached = budget.totalCost > budget.budgetLimit;
                  const ratio = Math.min((budget.totalCost / budget.budgetLimit) * 100, 100);
                  return (
                    <div key={budget.id} className="p-3.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/50 transition-all">
                      <span className="col-span-4 font-bold text-[#1B365D]">{budget.department}</span>
                      <span className="col-span-2 text-right font-mono text-slate-600">
                        {budget.tokenCount.toLocaleString()}
                      </span>
                      <span className="col-span-2 text-right font-bold text-slate-800">
                        ${budget.totalCost.toFixed(2)}
                      </span>
                      <span className="col-span-2 text-right font-bold text-slate-500">
                        ${budget.budgetLimit.toFixed(2)}
                      </span>
                      <div className="col-span-2 flex flex-col items-center">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                            isBreached ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isBreached ? (
                            <>
                              <AlertTriangle className="w-3 h-3" /> BREACHED
                            </>
                          ) : (
                            "COMPLIANT"
                          )}
                        </span>
                        {/* Progress mini bar */}
                        <div className="w-20 bg-slate-100 h-1 rounded overflow-hidden mt-1.5">
                          <div
                            className={`h-full ${isBreached ? "bg-[#8C2D19]" : "bg-[#1B365D]"}`}
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: Provider Health */}
        {activeTab === "health" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold text-[#1B365D]">Provider Health & Gateway Distribution</h3>
              <p className="text-xs text-[#706E6B]">Continuous monitoring of upstream model endpoints. Handles automated failovers to backups during upstream disruptions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.keys(observability.getProviderStatusSummary()).map(providerKey => {
                const health = observability.getProviderStatusSummary()[providerKey];
                return (
                  <div key={providerKey} className="bg-[#FAF9F5] border border-[#EBE9E0] p-5 rounded-xl hover:shadow-sm transition-all text-xs">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-serif font-bold text-base text-[#1B365D] uppercase tracking-wide">
                        {providerKey.replace("google_", "").replace("_openai", "")}
                      </span>
                      <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[9px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> ONLINE
                      </span>
                    </div>

                    <div className="space-y-3 font-semibold text-slate-700">
                      <div className="flex justify-between border-b border-[#EBE9E0] pb-2">
                        <span>Gateway Latency</span>
                        <span className="font-bold text-[#1B365D]">{health.latencyAvg} ms</span>
                      </div>
                      <div className="flex justify-between border-b border-[#EBE9E0] pb-2">
                        <span>Success Rate</span>
                        <span className="font-bold text-green-600">{health.success}%</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span>Error Rate</span>
                        <span className="font-bold text-red-600">{health.errors}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 10: Audit Log Explorer */}
        {activeTab === "audit" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1B365D]">Enterprise AI Governance Audit Trails</h3>
                <p className="text-xs text-[#706E6B]">Traceable human approvals, model deprecations, decryptions, and safety policy violations.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  placeholder="Search actions or details..."
                  className="bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg px-3 py-1.5 text-xs text-[#2C2A29] focus:outline-none w-48"
                />

                <select
                  value={auditFilter}
                  onChange={e => setAuditFilter(e.target.value)}
                  className="bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg px-3 py-1.5 text-xs text-[#2C2A29] focus:outline-none"
                >
                  <option value="ALL">ALL SEVERITIES</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredAudits.length === 0 ? (
                <p className="text-xs text-[#706E6B] italic text-center py-8">No matching audit logs located in governance datastore.</p>
              ) : (
                filteredAudits.map(log => (
                  <div key={log.id} className="bg-[#FAF9F5] border border-[#EBE9E0] p-4 rounded-xl hover:shadow-sm transition-all text-xs">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${
                            log.severity === "CRITICAL"
                              ? "bg-red-100 text-red-800"
                              : log.severity === "WARNING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {log.severity}
                        </span>
                        <span className="font-bold text-[#1B365D] uppercase">{log.action}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-mono text-[11px] bg-white border border-[#EBE9E0] p-2.5 rounded">
                      {log.details}
                    </p>

                    <div className="flex gap-4 mt-2 text-[10px] text-[#706E6B] font-semibold">
                      <span>User: {log.userId}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      {log.justification && <span className="italic text-slate-500">Reason: {log.justification}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AIGovernanceWorkspace;
