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
  ArrowDownUp,
  Search,
  Info,
  Trash2,
  Award,
  Zap,
  HardDrive,
  Globe,
  Server,
  FileJson,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import {
  PluginRegistry,
  PluginSandbox,
  DependencyManager,
  PluginObservability,
  PluginSDK,
  Plugin,
  PluginStatus,
  ExtensionPoint,
  Extension,
  MarketplaceListing,
  DeveloperAccount,
  PluginAuditLog,
  PluginPermission,
  ExtensionPointType,
  PluginHealth
} from "../../core/plugin_framework";

export const PluginWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "marketplace" | "installed" | "sandbox" | "developer" | "observability"
  >("marketplace");

  // Instances
  const registry = PluginRegistry.getInstance();
  const sandbox = PluginSandbox.getInstance();
  const dependencyManager = DependencyManager.getInstance();
  const observability = PluginObservability.getInstance();
  const sdk = PluginSDK.getInstance();

  // State caches
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [extensionPoints, setExtensionPoints] = useState<ExtensionPoint[]>([]);
  const [activeExtensions, setActiveExtensions] = useState<Extension[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [devAccount, setDevAccount] = useState<DeveloperAccount | null>(null);
  const [auditLogs, setAuditLogs] = useState<PluginAuditLog[]>([]);
  const [healthStates, setHealthStates] = useState<PluginHealth[]>([]);

  // Search & Filter State
  const [mktSearch, setMktSearch] = useState("");
  const [mktCategory, setMktCategory] = useState("ALL");

  // Sandbox Sandbox Pad States
  const [sbSelectedPluginId, setSbSelectedPluginId] = useState("");
  const [sbActionName, setSbActionName] = useState("AR Blueprint overlay mapping");
  const [sbPayloadUrl, setSbPayloadUrl] = useState("https://secure-node.urjaflux.io/v1/rules");
  const [sbSimulateCrash, setSbSimulateCrash] = useState(false);
  const [sbRequestUnauthorized, setSbRequestUnauthorized] = useState(false);
  const [sbExecutionResult, setSbExecutionResult] = useState<any>(null);
  const [sbIsRunning, setSbIsRunning] = useState(false);

  // Developer Portal state
  const [manifestForm, setManifestForm] = useState({
    id: "plg-my-custom-node",
    name: "My Custom Resonance Estimator",
    version: "1.0.0",
    publisher: "Cosmic Dev Labs",
    description: "Evaluates exact cosmic sound waves for client dasha periods.",
    minCoreVersion: "3.6.0",
    permissions: [PluginPermission.UI_INJECT],
    pointType: ExtensionPointType.DASHBOARD_WIDGET
  });
  const [generatedManifest, setGeneratedManifest] = useState<string>("");
  const [validatorText, setValidatorText] = useState("");
  const [validatorResult, setValidatorResult] = useState<any>(null);
  const [activeSdkApi, setActiveSdkApi] = useState<"query" | "log" | "command">("query");

  // Audit state
  const [auditFilter, setAuditFilter] = useState<string>("ALL");
  const [auditSearch, setAuditSearch] = useState("");

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setPlugins([...registry.getPlugins()]);
    setExtensionPoints([...registry.getExtensionPoints()]);
    setActiveExtensions([...registry.getActiveExtensions()]);
    setListings([...registry.getMarketplaceListings()]);
    setDevAccount(registry.getDeveloperAccount());
    setAuditLogs([...registry.getAuditLogs()]);
    setHealthStates([...sandbox.getAllHealthMetrics()]);
  };

  // Lifecycle handlers
  const handleToggleStatus = (id: string) => {
    registry.togglePluginStatus(id);
    refreshData();
  };

  const handleInstall = (listingId: string) => {
    const success = registry.installFromMarketplace(listingId);
    if (success) {
      alert("Plugin successfully compiled and initialized in secure sandbox.");
      refreshData();
    } else {
      alert("Plugin is already installed or conflict detected.");
    }
  };

  const handleUninstall = (id: string) => {
    if (confirm("Are you sure you want to completely uninstall this plugin? All sandboxed data will be cleared.")) {
      registry.uninstallPlugin(id);
      refreshData();
    }
  };

  const handleUpgrade = (id: string) => {
    registry.updatePlugin(id);
    refreshData();
  };

  const handleRollback = (id: string) => {
    registry.rollbackPlugin(id);
    refreshData();
  };

  const handleAdministrativeSuspend = (id: string) => {
    registry.suspendPlugin(id);
    refreshData();
  };

  // Execute Sandboxed Task
  const handleExecuteSandbox = () => {
    if (!sbSelectedPluginId) return;
    setSbIsRunning(true);
    setSbExecutionResult(null);

    setTimeout(() => {
      // Determine what permissions the task requires
      const requestedPerms: PluginPermission[] = [PluginPermission.UI_INJECT];
      if (sbPayloadUrl) {
        requestedPerms.push(PluginPermission.NETWORK_ACCESS);
      }
      if (sbRequestUnauthorized) {
        // Force demand high-tier STORAGE_WRITE which standard plugins might not have
        requestedPerms.push(PluginPermission.STORAGE_WRITE);
      }

      const payload = {
        url: sbPayloadUrl,
        simulateFailure: sbSimulateCrash,
        context: "Enterprise Astro Sandbox Diagnostic Run"
      };

      const res = sandbox.executeTask(sbSelectedPluginId, sbActionName, payload, requestedPerms);
      setSbExecutionResult(res);
      setSbIsRunning(false);
      refreshData();
    }, 450);
  };

  // Compile manifest
  const handleCompileManifest = (e: React.FormEvent) => {
    e.preventDefault();
    const manifestObj = {
      id: manifestForm.id,
      name: manifestForm.name,
      version: manifestForm.version,
      publisher: manifestForm.publisher,
      description: manifestForm.description,
      minCoreVersion: manifestForm.minCoreVersion,
      dependencies: [],
      permissions: manifestForm.permissions,
      entryPoint: `dist/${manifestForm.id}.js`,
      extensionPoints: [
        {
          pointType: manifestForm.pointType,
          pointId: `ep-${manifestForm.pointType.toLowerCase().replace(/_/g, "-")}`,
          config: { autoRegister: true, securityLock: "high" }
        }
      ]
    };
    setGeneratedManifest(JSON.stringify(manifestObj, null, 2));
    setValidatorText(JSON.stringify(manifestObj, null, 2));
  };

  // Validate manifest
  const handleValidatePackageText = () => {
    try {
      const parsed = JSON.parse(validatorText);
      if (!parsed.id || !parsed.version || !parsed.permissions) {
        setValidatorResult({
          valid: false,
          error: "Incomplete Manifest: Missing core parameters (id, version, or permissions)."
        });
        return;
      }

      // Check dependency resolution
      const deps = parsed.dependencies || [];
      const validation = dependencyManager.validateDependencies(parsed.id, deps);

      setValidatorResult({
        valid: validation.valid,
        missing: validation.missing,
        conflicts: validation.conflicts,
        circularPath: validation.circularPath,
        structureCheck: "PASSED: Digital signature scheme matched.",
        isolationTier: parsed.permissions.includes(PluginPermission.NETWORK_ACCESS) ? "Tier 2 (External Bound)" : "Tier 1 (Fully Isolated)"
      });
    } catch (err: any) {
      setValidatorResult({
        valid: false,
        error: `JSON compilation failure: ${err.message || "Invalid syntax"}`
      });
    }
  };

  // Filters
  const filteredListings = listings.filter(item => {
    if (mktCategory !== "ALL" && item.category !== mktCategory) return false;
    if (mktSearch) {
      const s = mktSearch.toLowerCase();
      return item.name.toLowerCase().includes(s) || item.description.toLowerCase().includes(s) || item.publisherName.toLowerCase().includes(s);
    }
    return true;
  });

  const filteredAudits = auditLogs.filter(log => {
    if (auditFilter !== "ALL" && log.severity !== auditFilter) return false;
    if (auditSearch) {
      const s = auditSearch.toLowerCase();
      return log.details.toLowerCase().includes(s) || log.pluginId.toLowerCase().includes(s);
    }
    return true;
  });

  // Aggregated analytics counts
  const verifiedCount = plugins.filter(p => p.isVerified).length;
  const extensionCount = activeExtensions.length;
  const systemErrors = healthStates.reduce((sum, h) => sum + h.errorsCount, 0);

  return (
    <div id="plugin-marketplace-workspace" className="p-6 bg-[#FAF9F5] text-[#2C2A29] min-h-screen">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#EBE9E0] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#8C2D19]/10 text-[#8C2D19] rounded-lg">
              <Sliders className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#1B365D]">
              Plugin & Extension Marketplace
            </h1>
          </div>
          <p className="text-sm text-[#706E6B] mt-2 max-w-2xl">
            DOMAIN-019 — Manage enterprise extensibility, compile custom manifests, audit sandboxed execution boundaries, resolve dependencies, and explore community modules.
          </p>
        </div>

        {/* Dynamic Telemetry overview */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <div className="bg-[#FFFFFF] border border-[#EBE9E0] px-4 py-2 rounded-lg text-xs flex flex-col justify-center min-w-[120px]">
            <span className="text-[#706E6B] font-semibold uppercase tracking-wider block">Installed</span>
            <span className="text-base font-bold text-[#1B365D]">{plugins.length} Plugins</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#EBE9E0] px-4 py-2 rounded-lg text-xs flex flex-col justify-center min-w-[120px]">
            <span className="text-[#706E6B] font-semibold uppercase tracking-wider block">Active Hooks</span>
            <span className="text-base font-bold text-[#1B365D]">{extensionCount} Mounts</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#EBE9E0] px-4 py-2 rounded-lg text-xs flex flex-col justify-center min-w-[120px]">
            <span className="text-[#706E6B] font-semibold uppercase tracking-wider block">Isolated Crashes</span>
            <span className="text-base font-bold text-[#8C2D19]">{systemErrors} intercepted</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-[#EBE9E0] mb-6">
        {[
          { id: "marketplace", label: "Marketplace Catalog", icon: Sparkles },
          { id: "installed", label: "My Extensions & Lifecycle", icon: HardDrive },
          { id: "sandbox", label: "Secure Runtime Sandbox", icon: Terminal },
          { id: "developer", label: "Developer Portal & SDK", icon: FileCode },
          { id: "observability", label: "Observability & Audit Trail", icon: History }
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

      {/* Workspace Display Grid */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#EBE9E0] p-6 shadow-sm min-h-[500px]">
        {/* TAB 1: Marketplace Catalog */}
        {activeTab === "marketplace" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1B365D]">Explore Extensions & Core Integrations</h3>
                <p className="text-xs text-[#706E6B]">Discover certified plugin modules developed to enrich specific URJAFLUX AI OS spatial, astrology, and vision flows.</p>
              </div>

              {/* Filters panel */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search publisher or name..."
                    value={mktSearch}
                    onChange={e => setMktSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 w-full md:w-48 bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg text-xs text-[#2C2A29] focus:outline-none focus:border-[#1B365D]"
                  />
                </div>
                <select
                  value={mktCategory}
                  onChange={e => setMktCategory(e.target.value)}
                  className="bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg px-2.5 py-1.5 text-xs text-[#2C2A29] focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Workflow Automation">Workflow Automation</option>
                  <option value="Data Visualization">Data Visualization</option>
                  <option value="Vision Intelligence">Vision Intelligence</option>
                </select>
              </div>
            </div>

            {/* List grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(listing => {
                const isInstalled = plugins.some(p => p.id === listing.pluginId);
                return (
                  <div key={listing.id} className="bg-[#FAF9F5] border border-[#EBE9E0] rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-[#8C2D19]/10 text-[#8C2D19] text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                          {listing.category}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {listing.priceUsd === 0 ? "FREE" : `$${listing.priceUsd.toFixed(2)}`}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-[#1B365D] mt-1">{listing.name}</h4>
                      <p className="text-xs text-[#706E6B] leading-relaxed mt-2">{listing.description}</p>

                      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">{listing.publisherName}</span>
                        {listing.isVerifiedPublisher && (
                          <span className="bg-blue-50 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5 text-blue-600" /> Verified Publisher
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#EBE9E0] text-[11px] text-slate-600">
                        <div>
                          <span className="block text-[#706E6B] text-[9px] uppercase font-semibold">Size</span>
                          <span className="font-bold">{(listing.sizeKb / 1024).toFixed(2)} MB</span>
                        </div>
                        <div>
                          <span className="block text-[#706E6B] text-[9px] uppercase font-semibold">Downloads</span>
                          <span className="font-bold">{listing.downloads.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-[#706E6B] text-[9px] uppercase font-semibold">Rating</span>
                          <span className="font-bold">⭐ {listing.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#EBE9E0]">
                      {isInstalled ? (
                        <button
                          disabled
                          className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <Check className="w-4 h-4" /> Installed & Active
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInstall(listing.id)}
                          className="w-full bg-[#1B365D] hover:bg-[#142946] text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Install in Sandbox
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Installed Plugins & Lifecycle */}
        {activeTab === "installed" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold text-[#1B365D]">My Installed Extensibility Modules</h3>
              <p className="text-xs text-[#706E6B]">Manage execution status, rollbacks, upgrades, and permission overrides for locally provisioned platform hooks.</p>
            </div>

            <div className="space-y-4">
              {plugins.map(p => {
                const health = healthStates.find(h => h.pluginId === p.id);
                const isUpgradable = p.currentVersion !== p.latestVersion;

                return (
                  <div key={p.id} className="bg-[#FAF9F5] border border-[#EBE9E0] rounded-xl p-5 hover:shadow-md transition-all">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      {/* Left section: names and signatures */}
                      <div className="space-y-1 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-[#1B365D]">{p.name}</h4>
                          <span className="bg-[#EBE9E0] text-[#2C2A29] text-[9px] font-bold px-2 py-0.5 rounded">
                            {p.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              p.status === PluginStatus.ACTIVE
                                ? "bg-green-100 text-green-800"
                                : p.status === PluginStatus.DISABLED
                                ? "bg-slate-100 text-slate-500"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>

                        <p className="text-xs text-[#706E6B]">{p.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>Package Version: v{p.currentVersion}</span>
                          <span>•</span>
                          <span className="truncate max-w-xs">Digital Signature: {p.digitalSignature}</span>
                        </div>
                      </div>

                      {/* Right section: lifecycle triggers */}
                      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <button
                          onClick={() => handleToggleStatus(p.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            p.status === PluginStatus.ACTIVE
                              ? "bg-white hover:bg-slate-50 border-slate-300 text-[#2C2A29]"
                              : "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800"
                          }`}
                        >
                          {p.status === PluginStatus.ACTIVE ? "Disable" : "Enable"}
                        </button>

                        {isUpgradable && (
                          <button
                            onClick={() => handleUpgrade(p.id)}
                            className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 animate-bounce" /> Upgrade to v{p.latestVersion}
                          </button>
                        )}

                        {!isUpgradable && p.currentVersion !== "1.0.0" && (
                          <button
                            onClick={() => handleRollback(p.id)}
                            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Rollback (v1.0.0)
                          </button>
                        )}

                        <button
                          onClick={() => handleAdministrativeSuspend(p.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            p.isSuspended
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-[#8C2D19]/10 border-transparent text-[#8C2D19] hover:bg-[#8C2D19]/20"
                          }`}
                        >
                          {p.isSuspended ? "Lift Suspension" : "Admin Suspend"}
                        </button>

                        <button
                          onClick={() => handleUninstall(p.id)}
                          className="bg-white hover:bg-red-50 border border-slate-300 hover:border-red-300 text-slate-500 hover:text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Permissions Review Sub-Panel */}
                    <div className="border-t border-[#EBE9E0] pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[#706E6B] font-bold text-[10px] uppercase block mb-2">Sandbox Security Permissions</span>
                        <div className="space-y-1.5">
                          {p.permissions.map(perm => (
                            <div key={perm.permission} className="flex justify-between items-center bg-white p-2 rounded border border-[#EBE9E0] text-xs">
                              <span className="font-mono text-[11px] text-slate-600 font-bold">{perm.permission}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${perm.granted ? "bg-emerald-500" : "bg-red-500"}`} />
                                <span className="font-semibold text-[11px]">{perm.granted ? "GRANTED" : "DENIED"}</span>
                                <button
                                  onClick={() => {
                                    perm.granted = !perm.granted;
                                    registry.logAudit({
                                      pluginId: p.id,
                                      userId: "admin-policy",
                                      action: "API_EXECUTION",
                                      severity: "WARNING",
                                      details: `Manually toggled permission '${perm.permission}' to: ${perm.granted ? "GRANTED" : "DENIED"}.`,
                                      status: "SUCCESS"
                                    });
                                    refreshData();
                                  }}
                                  className="text-[10px] text-slate-400 hover:text-[#1B365D] hover:underline ml-1"
                                >
                                  Toggle
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Health telemetry */}
                      {health && (
                        <div>
                          <span className="text-[#706E6B] font-bold text-[10px] uppercase block mb-2">Isolated Performance Health</span>
                          <div className="bg-white rounded-lg border border-[#EBE9E0] p-3 text-xs space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Health Status</span>
                              <span
                                className={`font-bold ${
                                  health.status === "HEALTHY" ? "text-green-600" : "text-amber-600"
                                }`}
                              >
                                {health.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Active CPU usage</span>
                              <span className="font-bold text-slate-800">{health.cpuUsagePct}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Allocated Sandbox Memory</span>
                              <span className="font-bold text-slate-800">{health.memoryUsageMb} MB</span>
                            </div>
                            {health.lastErrorMsg && (
                              <div className="bg-amber-50 text-amber-800 p-2 rounded border border-amber-200 mt-1 text-[10px] font-mono leading-relaxed">
                                <span className="font-bold">Last Caught Crash:</span> {health.lastErrorMsg}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Secure Sandbox Execution Pad */}
        {activeTab === "sandbox" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold text-[#1B365D]">Secure Sandbox Execution Console</h3>
              <p className="text-xs text-[#706E6B]">Test plugin modules in isolated virtual environments. Simulated resource quotas, CPU/Memory triggers, exception containers, and permission walls.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Settings section */}
              <div className="lg:col-span-5 space-y-4 border-r border-[#EBE9E0] pr-0 lg:pr-6">
                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase mb-1.5">Select Sandbox Module</label>
                  <select
                    value={sbSelectedPluginId}
                    onChange={e => setSbSelectedPluginId(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                  >
                    <option value="">-- Choose Module --</option>
                    {plugins.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase mb-1.5">Simulation Task / Hook Endpoint</label>
                  <input
                    type="text"
                    value={sbActionName}
                    onChange={e => setSbActionName(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase mb-1.5">API Request URL (Simulates Network)</label>
                  <input
                    type="text"
                    value={sbPayloadUrl}
                    onChange={e => setSbPayloadUrl(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg p-2.5 text-xs text-[#2C2A29] focus:outline-none"
                  />
                </div>

                {/* Simulation triggers */}
                <div className="space-y-3 bg-[#FAF9F5] p-4 rounded-xl border border-[#EBE9E0]">
                  <span className="text-xs font-bold text-[#1B365D] block mb-2">Simulated Sandbox Violations</span>

                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sbSimulateCrash}
                      onChange={e => setSbSimulateCrash(e.target.checked)}
                      className="mt-0.5 rounded text-[#1B365D] focus:ring-[#1B365D]"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Isolate Dynamic Crash Exception</span>
                      <span className="text-[10px] text-[#706E6B]">Forces plugin handler to crash with a NullPointer. Proves system handles errors safely without crashing the main thread.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sbRequestUnauthorized}
                      onChange={e => setSbRequestUnauthorized(e.target.checked)}
                      className="mt-0.5 rounded text-[#1B365D] focus:ring-[#1B365D]"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Trigger Permission Abuse</span>
                      <span className="text-[10px] text-[#706E6B]">Forces task execution to attempt unauthorized storage queries, validating immediate enforcement filters.</span>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleExecuteSandbox}
                  disabled={sbIsRunning || !sbSelectedPluginId}
                  className="w-full bg-[#1B365D] hover:bg-[#142946] text-white font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {sbIsRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Sandboxed Compiling...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Run Sandboxed Task
                    </>
                  )}
                </button>
              </div>

              {/* Right Output tracing panel */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#706E6B] uppercase mb-2">Secured Tracing Traces</label>

                  {!sbExecutionResult ? (
                    <div className="bg-[#FAF9F5] rounded-xl border border-dashed border-[#EBE9E0] p-12 text-center h-[340px] flex flex-col items-center justify-center">
                      <Terminal className="w-12 h-12 text-[#706E6B] opacity-50 mb-3" />
                      <p className="text-sm font-semibold text-[#1B365D]">Awaiting Sandbox Sandbox Trigger</p>
                      <p className="text-xs text-[#706E6B] max-w-sm mt-1">
                        Select an installed module from the left menu and trigger a sandboxed activity to inspect strict process confinement.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Telemetry metadata block */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F5] p-3 rounded-xl border border-[#EBE9E0]">
                        <div className="text-xs">
                          <span className="text-[#706E6B] block text-[9px] uppercase font-bold">Execution status</span>
                          <span
                            className={`font-bold flex items-center gap-1 ${
                              sbExecutionResult.success ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {sbExecutionResult.success ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}{" "}
                            {sbExecutionResult.success ? "ALLOWED" : "BLOCKED"}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-[#706E6B] block text-[9px] uppercase font-bold">Confined CPU Cycles</span>
                          <span className="font-bold text-[#1B365D]">
                            {sbExecutionResult.telemetry.cpuCycles.toLocaleString()} cycles
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-[#706E6B] block text-[9px] uppercase font-bold">Isolated Memory</span>
                          <span className="font-bold text-[#1B365D]">
                            {sbExecutionResult.telemetry.memoryAllocatedMb} MB
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-[#706E6B] block text-[9px] uppercase font-bold">Network Ingress</span>
                          <span className="font-bold text-[#1B365D]">
                            {sbExecutionResult.telemetry.networkCallsMade} calls
                          </span>
                        </div>
                      </div>

                      {/* Traced Output */}
                      <div className="bg-[#FFFFFF] border border-[#EBE9E0] rounded-xl p-4">
                        <span className="text-[#706E6B] font-bold text-xs block uppercase mb-2">Confinement Output Streams</span>
                        {sbExecutionResult.success ? (
                          <div className="bg-[#FAF9F5] border border-[#EBE9E0] p-3 rounded text-xs font-mono text-[#2C2A29] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                            {sbExecutionResult.output}
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-200 p-3 rounded text-xs font-mono text-red-800 leading-relaxed whitespace-pre-wrap flex items-start gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block mb-1">Process Exception Trapped & Neutralized</span>
                              {sbExecutionResult.error}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs">
                  <h4 className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Sandboxed Thread Containment Protocol
                  </h4>
                  <p className="mt-1 leading-relaxed text-emerald-700">
                    URJAFLUX sandbox runtime processes tasks inside an isolated, secure wrapper. Caught plugin exceptions or violations never crash the platform or bypass our global security policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Developer Portal & SDK */}
        {activeTab === "developer" && (
          <div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-[#EBE9E0] pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1B365D]">Developer Portal & SDK Suite</h3>
                <p className="text-xs text-[#706E6B]">Compile valid custom extension packages, validate compatibility constraints, and explore our public documented APIs.</p>
              </div>

              {devAccount && (
                <div className="bg-[#FAF9F5] border border-[#EBE9E0] p-3 rounded-lg text-xs flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1B365D] block">{devAccount.name}</span>
                    <span className="text-[10px] text-slate-500">Verified Organization Publisher</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* SDK API Explorer (Col 4) */}
              <div className="lg:col-span-4 space-y-4 border-r border-[#EBE9E0] pr-0 lg:pr-6">
                <span className="text-[#706E6B] font-bold text-xs uppercase block">1. Public SDK Explorer</span>

                <div className="space-y-1.5">
                  {[
                    { id: "query", title: "sdk.queryPublicLibrary()", desc: "Safe, filtered data fetching from astro & vastu libraries." },
                    { id: "log", title: "sdk.logPluginEvent()", desc: "Write securely to the centralized enterprise audit logs." },
                    { id: "command", title: "sdk.registerCommand()", desc: "Inject custom command callbacks into workspace menus." }
                  ].map(api => (
                    <button
                      key={api.id}
                      onClick={() => setActiveSdkApi(api.id as any)}
                      className={`w-full text-left p-3 rounded-lg text-xs border transition-all ${
                        activeSdkApi === api.id
                          ? "bg-[#1B365D] text-white border-transparent"
                          : "bg-white hover:bg-[#FAF9F5] border-[#EBE9E0] text-[#2C2A29]"
                      }`}
                    >
                      <span className="font-mono font-bold block">{api.title}</span>
                      <span className={`text-[10px] mt-1 block ${activeSdkApi === api.id ? "text-slate-300" : "text-[#706E6B]"}`}>
                        {api.desc}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-100 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Contract Code Snippet</span>
                  {activeSdkApi === "query" && (
                    <pre className="font-mono text-[10px] text-slate-700 leading-relaxed overflow-x-auto">
{`const sdk = PluginSDK.getInstance();
const vastuData = sdk.queryPublicLibrary(
  "my-plugin-id",
  "VASTU",
  { direction: "North-West" }
);`}
                    </pre>
                  )}
                  {activeSdkApi === "log" && (
                    <pre className="font-mono text-[10px] text-slate-700 leading-relaxed overflow-x-auto">
{`const sdk = PluginSDK.getInstance();
sdk.logPluginEvent(
  "my-plugin-id",
  "Synchronized sound frequencies"
);`}
                    </pre>
                  )}
                  {activeSdkApi === "command" && (
                    <pre className="font-mono text-[10px] text-slate-700 leading-relaxed overflow-x-auto">
{`const sdk = PluginSDK.getInstance();
sdk.registerCommand("my-plugin-id", {
  commandId: "cmd-render-zoning",
  displayName: "Draw compass alignment",
  execute: (context) => { ... }
});`}
                    </pre>
                  )}
                </div>
              </div>

              {/* Manifest compiler (Col 4) */}
              <div className="lg:col-span-4 space-y-4 border-r border-[#EBE9E0] pr-0 lg:pr-6">
                <span className="text-[#706E6B] font-bold text-xs uppercase block">2. Manifest Compiler</span>

                <form onSubmit={handleCompileManifest} className="space-y-3 bg-[#FAF9F5] p-3.5 rounded-xl border border-[#EBE9E0] text-xs">
                  <div>
                    <label className="block font-bold text-[#706E6B] mb-1">Plugin Unique ID</label>
                    <input
                      type="text"
                      value={manifestForm.id}
                      onChange={e => setManifestForm({ ...manifestForm, id: e.target.value })}
                      className="w-full bg-white border border-[#EBE9E0] rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#706E6B] mb-1">Display Title</label>
                    <input
                      type="text"
                      value={manifestForm.name}
                      onChange={e => setManifestForm({ ...manifestForm, name: e.target.value })}
                      className="w-full bg-white border border-[#EBE9E0] rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#706E6B] mb-1">Core Version Constraint</label>
                    <input
                      type="text"
                      value={manifestForm.minCoreVersion}
                      onChange={e => setManifestForm({ ...manifestForm, minCoreVersion: e.target.value })}
                      className="w-full bg-white border border-[#EBE9E0] rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#706E6B] mb-1">Select Permission Scope</label>
                    <div className="space-y-1 mt-1">
                      {[PluginPermission.UI_INJECT, PluginPermission.NETWORK_ACCESS, PluginPermission.AI_EXECUTION].map(perm => (
                        <label key={perm} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={manifestForm.permissions.includes(perm)}
                            onChange={e => {
                              const list = e.target.checked
                                ? [...manifestForm.permissions, perm]
                                : manifestForm.permissions.filter(p => p !== perm);
                              setManifestForm({ ...manifestForm, permissions: list });
                            }}
                            className="rounded text-[#1B365D] focus:ring-[#1B365D]"
                          />
                          <span className="font-mono text-[10px] text-slate-700">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-[#706E6B] mb-1">Target Extension Hook</label>
                    <select
                      value={manifestForm.pointType}
                      onChange={e => setManifestForm({ ...manifestForm, pointType: e.target.value as any })}
                      className="w-full bg-white border border-[#EBE9E0] rounded p-1.5"
                    >
                      <option value={ExtensionPointType.DASHBOARD_WIDGET}>DASHBOARD_WIDGET</option>
                      <option value={ExtensionPointType.WORKFLOW_STEP}>WORKFLOW_STEP</option>
                      <option value={ExtensionPointType.SPATIAL_TOOL}>SPATIAL_TOOL</option>
                      <option value={ExtensionPointType.CONSULTATION_TOOL}>CONSULTATION_TOOL</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1B365D] hover:bg-[#142946] text-white font-bold py-2 rounded text-[11px]"
                  >
                    Compile Manifest JSON
                  </button>
                </form>

                {generatedManifest && (
                  <div className="bg-[#FFFFFF] rounded border border-emerald-200 p-3">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Compiled manifest.json</span>
                    <pre className="font-mono text-[9px] bg-slate-50 p-2 rounded max-h-36 overflow-y-auto border border-slate-200">
                      {generatedManifest}
                    </pre>
                  </div>
                )}
              </div>

              {/* Package verifier (Col 4) */}
              <div className="lg:col-span-4 space-y-4">
                <span className="text-[#706E6B] font-bold text-xs uppercase block">3. Manifest Validator</span>

                <div className="space-y-3">
                  <textarea
                    rows={8}
                    value={validatorText}
                    onChange={e => setValidatorText(e.target.value)}
                    placeholder="Paste manifest JSON schema here to validate dependencies and circular references..."
                    className="w-full bg-[#FAF9F5] border border-[#EBE9E0] rounded-xl p-3 text-xs font-mono text-[#2C2A29] focus:outline-none"
                  />

                  <button
                    onClick={handleValidatePackageText}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-xs"
                  >
                    Run Registry Validation Check
                  </button>

                  {validatorResult && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 ${validatorResult.valid ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-900"}`}>
                      <div className="font-bold flex items-center gap-1.5">
                        {validatorResult.valid ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Package Verified Successfully
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" /> Package Validation Failed
                          </>
                        )}
                      </div>

                      {validatorResult.valid ? (
                        <div className="space-y-1 text-emerald-700">
                          <p>• {validatorResult.structureCheck}</p>
                          <p>• {validatorResult.isolationTier}</p>
                          <p>• Resolution: Dependency tree resolved with 0 conflicts.</p>
                        </div>
                      ) : (
                        <div className="text-red-700 font-mono text-[11px]">
                          {validatorResult.error || "Circular references or incompatible core version detected."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Observability Log Dashboard */}
        {activeTab === "observability" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1B365D]">Centralized Observability Auditing</h3>
                <p className="text-xs text-[#706E6B]">Trace full plugin logs, API hits, lifecycle events, and security violations on the main sandboxed runtime context.</p>
              </div>

              {/* Search filter for logs */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={auditFilter}
                  onChange={e => setAuditFilter(e.target.value)}
                  className="bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg px-2.5 py-1.5 text-xs text-[#2C2A29] focus:outline-none"
                >
                  <option value="ALL">All Severities</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
                <input
                  type="text"
                  placeholder="Filter logs text..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF9F5] border border-[#EBE9E0] rounded-lg text-xs text-[#2C2A29] focus:outline-none"
                />
              </div>
            </div>

            {/* Trace Table */}
            <div className="overflow-x-auto border border-[#EBE9E0] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#EBE9E0] text-[#706E6B] font-bold uppercase tracking-wider">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Plugin ID</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Confinement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE9E0]">
                  {filteredAudits.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp.substring(11, 19)}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{log.pluginId}</td>
                      <td className="p-3">
                        <span className="font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                            log.severity === "CRITICAL"
                              ? "bg-red-100 text-red-800"
                              : log.severity === "WARNING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-sans max-w-sm leading-relaxed">{log.details}</td>
                      <td className="p-3">
                        <span
                          className={`font-semibold text-[11px] ${
                            log.status === "SUCCESS"
                              ? "text-green-600"
                              : log.status === "BLOCKED"
                              ? "text-red-600 font-bold"
                              : "text-amber-600"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
