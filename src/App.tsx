import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Users, 
  Building2, 
  FileText, 
  BookOpen, 
  Settings, 
  LogOut, 
  Activity,
  CheckCircle, 
  Layers, 
  Network, 
  Brain, 
  BrainCircuit,
  ShieldAlert, 
  TrendingUp, 
  Workflow, 
  Briefcase, 
  Database, 
  Terminal, 
  Cpu,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Camera,
  MessageSquare,
  Sliders,
  Menu,
  UserCheck,
  LayoutGrid,
  Boxes,
  LifeBuoy,
  Bot,
  Code,
  Cloud,
  Calendar,
  Archive,
  Lock,
  Maximize2,
  Upload
} from "lucide-react";

// Import custom pages/components
import LandingPage from "./components/LandingPage";
import DesignSystemPage from "./components/DesignSystemPage";
import LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import ClientsPage from "./components/ClientsPage";
import PropertiesPage from "./components/PropertiesPage";
import WorkspacePage from "./components/WorkspacePage";
import CadBlueprintWorkspace from "./components/CadBlueprintWorkspace";
import ReportsPage from "./components/ReportsPage";
import KnowledgePage from "./components/KnowledgePage";
import {
  buildSubscriberScope,
  canAccessAppView,
  canAccessKnowledgeHub,
  deriveUserIdFromEmail,
  getDefaultViewForRole,
  isFounderRole,
  isPaidSubscriber,
  normalizeStoredPlatformRole,
  resolvePlatformLoginRole,
} from "./core/access/knowledgeVaultAccess";
import { authService } from "./services/authService";
import SettingsPage from "./components/SettingsPage";
import BrandProfilePage from "./components/BrandProfilePage";
import ProjectsPage from "./components/ProjectsPage";
import AnalysisHubPage from "./components/AnalysisHubPage";
import IdentityWorkspace from "./components/IdentityWorkspace";
import { ClientContextProfileView } from "./components/context/ClientContextProfileView";
import LalKitabWorkspace from "./components/lalkitab/LalKitabWorkspace";
import { SpatialCadWorkspace } from "./components/spatial/SpatialCadWorkspace";
import { VisionWorkspacePage } from "./components/vision/VisionWorkspacePage";
import { WorkflowWorkspacePage } from "./components/workflow/WorkflowWorkspacePage";
import EnterpriseConsultantWorkflow from "./components/workflow/EnterpriseConsultantWorkflow";
import { CollaborationWorkspacePage } from "./components/collaboration/CollaborationWorkspacePage";
import { IntegrationWorkspacePage } from "./components/integration/IntegrationWorkspacePage";
import { SecurityWorkspacePage } from "./components/security/SecurityWorkspacePage";
import { AIGovernanceWorkspace } from "./components/ai_governance/AIGovernanceWorkspace";
import { PluginWorkspace } from "./components/plugin_framework/PluginWorkspace";
import { CustomerPortal } from "./components/saas/CustomerPortal";
import { SaaSAdminConsole } from "./components/saas/SaaSAdminConsole";
import { DigitalTwinWorkspace } from "./components/digital_twin/DigitalTwinWorkspace";
import { EnterpriseGaWorkspace } from "./components/enterprise_ga/EnterpriseGaWorkspace";
import { CustomerLifecycleWorkspace } from "./components/customer_lifecycle/CustomerLifecycleWorkspace";
import { AutonomousAiWorkspace } from "./components/autonomous_ai/AutonomousAiWorkspace";
import { DeveloperPlatformWorkspace } from "./components/developer_platform/DeveloperPlatformWorkspace";
import { GlobalCloudPlatformWorkspace } from "./components/global_cloud/GlobalCloudPlatformWorkspace";
import { IndustrySolutionsWorkspace } from "./components/industry_solutions/IndustrySolutionsWorkspace";
import { FutureExpansionBacklogWorkspace } from "./components/industry_solutions/FutureExpansionBacklogWorkspace";
import { SpatialIntelligenceWorkspace } from "./components/spatial/SpatialIntelligenceWorkspace";
import { ProductVisionLockWorkspace } from "./components/vision/ProductVisionLockWorkspace";
import { UKAWorkspace } from "./components/assistant/UKAWorkspace";
import { getActiveTransportMode } from "./spatial/VisionRuntime";
import { useTranslation } from "./localization/hooks/useTranslation";
import LanguageSelector from "./localization/LanguageSelector";

// Import original specification components for backwards compatibility / specs viewer

// Initial mock data seeds
import { 
} from "./data/mockData";
import { Client, Property, Task, ProjectReport, Project } from "./types/app";
import { getClients, addClient, updateClient, deleteClient } from "./services/clientService";
import { getProperties, addProperty, updateProperty, deleteProperty } from "./services/propertyService";
import { getProjects } from "./services/projectService";
import { ReportRepository } from "./repositories/reportRepository";
import { KnowledgeIngestionService } from "./services/knowledgeIngestionService";
import ProjectImportSystem from "./components/ProjectImportSystem";

import { ApplicationEngine } from "./core/engines/ApplicationEngine";
import { engineAdapter } from "./core/adapters/EngineAdapter";

export default function App() {
  useEffect(() => {
    const initEngine = async () => {
      try {
        const engine = new ApplicationEngine();
        await engine.initialize();
        await engineAdapter.initialize(engine);
        console.log("Core Engine & Adapter successfully initialized.");
      } catch (err) {
        console.error("Failed to initialize Engine:", err);
      }
    };
    initEngine();
    return () => {
      engineAdapter.shutdown();
    };
  }, []);

  const { t } = useTranslation();

  // Session Security State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem("urjaflux_user_email") || "architect@urjaflux.com";
  });
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);

  // Collapsible Left Sidebar (default state: collapsed)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    return localStorage.getItem("urjaflux_sidebar_expanded") === "true";
  });

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const next = !prev;
      localStorage.setItem("urjaflux_sidebar_expanded", String(next));
      return next;
    });
  };

  // Primary Navigation Routing
  // CAD Workspace is default startup view
  const [activeView, setActiveView] = useState<string>("workspace");

  // Enterprise User Role and Access Control State
  const [activeUserRole, setActiveUserRole] = useState<"FOUNDER" | "SUPER_ADMIN" | "CONSULTANT" | "CLIENT">(() => {
    const normalized = normalizeStoredPlatformRole(localStorage.getItem("urjaflux_user_role"));
    if (normalized === "FOUNDER") return "FOUNDER";
    if (normalized === "SUPER_ADMIN") return "SUPER_ADMIN";
    if (normalized === "CLIENT") return "CLIENT";
    return "CONSULTANT";
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    const stored = localStorage.getItem("urjaflux_user_id");
    if (stored) return stored;
    const email = localStorage.getItem("urjaflux_user_email") || "";
    return deriveUserIdFromEmail(email);
  });

  const [activeOrgId, setActiveOrgId] = useState<string>(() => {
    return localStorage.getItem("urjaflux_org_id") || localStorage.getItem("urjaflux_user_id") || deriveUserIdFromEmail(localStorage.getItem("urjaflux_user_email") || "");
  });

  const subscriberScope = buildSubscriberScope(activeUserId, activeOrgId, userEmail);

  useEffect(() => {
    localStorage.setItem("urjaflux_user_role", activeUserRole);
    localStorage.setItem("urjaflux_user_id", activeUserId);
    localStorage.setItem("urjaflux_org_id", activeOrgId);
    if (!canAccessAppView(activeUserRole, activeView)) {
      setActiveView(getDefaultViewForRole(activeUserRole));
    }
  }, [activeUserRole, activeView, activeUserId, activeOrgId]);

  // Specifications Tab (Active subtab inside the Specs Sandbox)
  const [specTab, setSpecTab] = useState<string>("architecture");

  // Global In-Memory Reactive Databases
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProperty, setActiveProperty] = useState<Property | null>(() => {
    const stored = localStorage.getItem("urjaflux_active_property");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Sync active view to local storage on change
  useEffect(() => {
    localStorage.setItem("urjaflux_active_view", activeView);
  }, [activeView]);

  // Sync active property to local storage on change
  useEffect(() => {
    if (activeProperty) {
      localStorage.setItem("urjaflux_active_property", JSON.stringify(activeProperty));
    } else {
      localStorage.removeItem("urjaflux_active_property");
    }
  }, [activeProperty]);

  // Trigger Client Registration Wizard directly from Dashboard
  const [startWithAddClient, setStartWithAddClient] = useState(false);

  // Load clients, properties, and reports from Firestore or LocalStorage on mount
  useEffect(() => {
    async function loadClientsPropertiesAndReports() {
      const scope = isPaidSubscriber(activeUserRole) ? subscriberScope : undefined;

      try {
        const loadedClients = isFounderRole(activeUserRole)
          ? await getClients()
          : await getClients(scope);
        setClients(loadedClients);
      } catch (err) {
        console.error("Failed to load clients:", err);
      }

      try {
        const loadedProps = isFounderRole(activeUserRole)
          ? await getProperties()
          : await getProperties(scope);
        setProperties(loadedProps);
        if (loadedProps.length > 0 && !localStorage.getItem("urjaflux_active_property")) {
          setActiveProperty(loadedProps[0]);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      }

      try {
        const loadedReports = isFounderRole(activeUserRole)
          ? await ReportRepository.getReports()
          : await ReportRepository.getReports(scope);
        setReports(loadedReports);
      } catch (err) {
        console.error("Failed to load reports:", err);
      }

      try {
        const loadedProjects = await getProjects();
        setProjects(loadedProjects);
      } catch (err) {
        console.error("Failed to load projects:", err);
      }

      try {
        await KnowledgeIngestionService.initializePipeline();
      } catch (err) {
        console.error("Failed to initialize Knowledge Ingestion Pipeline:", err);
      }
    }
    loadClientsPropertiesAndReports();
  }, [activeUserRole, activeUserId, activeOrgId]);

  // Session login trigger
  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setShowLandingPage(false);
    localStorage.setItem("urjaflux_logged_in", "true");
    localStorage.setItem("urjaflux_user_email", email);

    const authUser = authService.getUser();
    const role = resolvePlatformLoginRole(email, authUser?.role as string | undefined);
    const userId = authUser?.id ?? deriveUserIdFromEmail(email);
    const orgId = isPaidSubscriber(role) ? userId : authUser?.organizationId ?? userId;

    setActiveUserRole(role);
    setActiveUserId(userId);
    setActiveOrgId(orgId);
    localStorage.setItem("urjaflux_user_role", role);
    localStorage.setItem("urjaflux_user_id", userId);
    localStorage.setItem("urjaflux_org_id", orgId);

    const savedView = localStorage.getItem("urjaflux_active_view");
    const fallbackView = getDefaultViewForRole(role);
    setActiveView(savedView && canAccessAppView(role, savedView) ? savedView : fallbackView);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setShowLandingPage(true);
    setUserEmail("");
    localStorage.removeItem("urjaflux_logged_in");
    localStorage.removeItem("urjaflux_user_email");
    localStorage.removeItem("urjaflux_active_view");
    localStorage.removeItem("urjaflux_active_property");
  };

  // --- CLIENT ACTIONS (CRUD) ---
  const handleAddClient = async (newClientData: Omit<Client, "id" | "joinedDate">) => {
    try {
      const ownership = isPaidSubscriber(activeUserRole) ? subscriberScope : undefined;
      const newClient = await addClient(newClientData, ownership);
      setClients(prev => [newClient, ...prev]);
    } catch (err) {
      console.error("Error adding client to database:", err);
    }
  };

  const handleEditClient = async (updatedClient: Client) => {
    try {
      const savedClient = await updateClient(updatedClient);
      setClients(prev => prev.map(c => c.id === savedClient.id ? savedClient : c));
      // Denormalize ownerName in properties
      setProperties(prev => prev.map(p => p.clientId === savedClient.id ? { ...p, ownerName: savedClient.name } : p));
    } catch (err) {
      console.error("Error updating client in database:", err);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
      // Set orphan properties ownerName to Unknown
      setProperties(prev => prev.map(p => p.clientId === id ? { ...p, ownerName: "Unknown Owner" } : p));
    } catch (err) {
      console.error("Error deleting client from database:", err);
    }
  };

  // --- PROPERTY ACTIONS (CRUD) ---
  const handleAddProperty = async (newPropertyData: Omit<Property, "id">) => {
    try {
      const ownership = isPaidSubscriber(activeUserRole) ? subscriberScope : undefined;
      const newProp = await addProperty(newPropertyData, ownership);
      setProperties(prev => [newProp, ...prev]);
      setActiveProperty(newProp);
    } catch (err) {
      console.error("Error adding property to database:", err);
    }
  };

  const handleEditProperty = async (updatedProperty: Property) => {
    try {
      const savedProp = await updateProperty(updatedProperty);
      setProperties(prev => prev.map(p => p.id === savedProp.id ? savedProp : p));
      if (activeProperty?.id === savedProp.id) {
        setActiveProperty(savedProp);
      }
    } catch (err) {
      console.error("Error updating property in database:", err);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await deleteProperty(id);
      setProperties(prev => {
        const filtered = prev.filter(p => p.id !== id);
        if (activeProperty?.id === id) {
          setActiveProperty(filtered[0] || null);
        }
        return filtered;
      });
    } catch (err) {
      console.error("Error deleting property from database:", err);
    }
  };

  // --- REPORT ACTIONS (CRUD) ---
  const handleAddReport = async (newReportData: Omit<ProjectReport, "id" | "dateCreated">) => {
    try {
      const ownership = isPaidSubscriber(activeUserRole) ? subscriberScope : undefined;
      const savedReport = await ReportRepository.addReport(newReportData, ownership);
      setReports(prev => [savedReport, ...prev]);
    } catch (err) {
      console.error("Error adding report to database:", err);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await ReportRepository.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error deleting report from database:", err);
    }
  };

  const handleUpdateReportStatus = async (id: string, status: ProjectReport["status"]) => {
    try {
      const existingReport = reports.find(r => r.id === id);
      if (existingReport) {
        const updatedReport = { ...existingReport, status };
        const savedReport = await ReportRepository.updateReport(updatedReport);
        setReports(prev => prev.map(r => r.id === id ? savedReport : r));
      }
    } catch (err) {
      console.error("Error updating report status in database:", err);
    }
  };

  // --- TASK ACTIONS ---
  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === "Pending" ? "Completed" : "Pending" } : t));
  };

  // --- WORKSPACE CALIBRATION ASSIGNMENT ---
  const handleSelectPropertyToCalibrate = (prop: Property) => {
    setActiveProperty(prop);
    setActiveView("workspace");
  };

  const handleUpdatePropertyOffset = (id: string, offset: number) => {
    setProperties(properties.map(p => p.id === id ? { ...p, directionsOffset: offset } : p));
    if (activeProperty?.id === id) {
      setActiveProperty(prev => prev ? { ...prev, directionsOffset: offset } : null);
    }
  };


  // If showLandingPage is active, render the public landing website first
  if (showLandingPage) {
    return (
      <LandingPage
        isLoggedIn={isLoggedIn}
        onLoginClick={() => {
          setIsLoggedIn(false);
          setShowLandingPage(false);
        }}
        onGoToDashboard={() => {
          setShowLandingPage(false);
        }}
      />
    );
  }

  // Otherwise, handle the login portal
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} onBackToHome={() => setShowLandingPage(true)} />;
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard & Apps", icon: LayoutGrid, roles: ["SUPER_ADMIN"] },
    { id: "ccie_context", label: "Client Context (CCIE)", icon: BrainCircuit, roles: ["SUPER_ADMIN"] },
    { id: "uka_assistant", label: "UKA Assistant", icon: Sparkles, roles: ["SUPER_ADMIN"] },
    { id: "workspace", label: "CAD Workspace", icon: Compass, roles: ["SUPER_ADMIN", "CONSULTANT", "FOUNDER"] },
    { id: "spatial_intelligence", label: "Spatial Intelligence OS", icon: Maximize2, roles: ["SUPER_ADMIN"] },
    { id: "product_vision_lock", label: "Product Vision Lock", icon: Lock, roles: ["SUPER_ADMIN"] },
    { id: "global_cloud", label: "Global Cloud Platform", icon: Cloud, roles: ["SUPER_ADMIN"] },
    { id: "devex_platform", label: "Developer Platform", icon: Code, roles: ["SUPER_ADMIN"] },
    { id: "autonomous_ai", label: "Autonomous AI OS", icon: Bot, roles: ["SUPER_ADMIN"] },
    { id: "customer_lifecycle", label: "Customer Lifecycle OS", icon: LifeBuoy, roles: ["SUPER_ADMIN"] },
    { id: "enterprise_ga", label: "Enterprise GA Ops", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
    { id: "digital_twin", label: "Digital Twin OS", icon: Boxes, roles: ["SUPER_ADMIN"] },
    { id: "future_expansion_backlog", label: "Future Expansion Backlog", icon: Calendar, roles: ["SUPER_ADMIN"] },
    { id: "clients", label: "My Clients", icon: Users, roles: ["CONSULTANT", "FOUNDER"] },
    { id: "identity", label: "Identity Engine", icon: UserCheck, roles: ["SUPER_ADMIN"] },
    { id: "consultant_workflow", label: "Workflow Engine", icon: Workflow, roles: ["SUPER_ADMIN"] },
    { id: "reports", label: "Reports", icon: FileText, roles: ["CONSULTANT", "FOUNDER"] },
    { id: "brand_profile", label: "Brand Profile", icon: Building2, roles: ["CONSULTANT", "FOUNDER"] },
    { id: "knowledge_vault", label: "Knowledge Vault", icon: Lock, roles: ["FOUNDER"] },
    { id: "knowledge", label: "Knowledge & Libraries", icon: BookOpen, roles: ["FOUNDER"] },
    { id: "saas_portal", label: "SaaS Tenant Portal", icon: Building2, roles: ["SUPER_ADMIN"] },
    { id: "saas_admin", label: "SaaS Admin Operations", icon: Cpu, roles: ["SUPER_ADMIN", "FOUNDER"] },
    { id: "security", label: "Security Gateway", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
    { id: "ai_governance", label: "Intelligence Control", icon: Sliders, roles: ["SUPER_ADMIN"] },
    { id: "plugins_marketplace", label: "Plugin SDK", icon: Layers, roles: ["SUPER_ADMIN"] },
    { id: "design_system", label: "Design System", icon: LayoutGrid, roles: ["SUPER_ADMIN"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN", "CONSULTANT", "FOUNDER"] }
  ];

  const allowedSidebarItems = sidebarItems.filter(item => {
    return item.roles.includes(activeUserRole);
  });

  if (activeView === "workspace") {
    return (
      <div className="w-screen h-screen overflow-hidden bg-slate-100 dark:bg-[#04060a]">
        <CadBlueprintWorkspace onNavigate={setActiveView} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white flex flex-row overflow-hidden">
      
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      <aside className={`h-screen sticky top-0 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50 shadow-lg ${
        activeView === "workspace"
          ? "bg-[#090e18] border-r border-slate-800 text-slate-100"
          : "bg-slate-900 border-r border-slate-800 text-slate-200"
      } ${
        isSidebarExpanded ? "w-64" : "w-16"
      }`}>
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 overflow-hidden">
          {isSidebarExpanded ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-[11px] font-bold font-mono tracking-widest text-slate-100 leading-none">URJAFLUX</h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[7px] font-mono text-emerald-400 font-bold tracking-widest inline-block">AI OS</span>
                  <span className="text-[7px] font-mono px-1 bg-amber-950 text-amber-300 border border-amber-800/80 rounded font-bold">
                    TRANSPORT: {getActiveTransportMode()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
            </div>
          )}

          {/* Toggle Button */}
          {isSidebarExpanded && (
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto no-scrollbar px-2">
          {/* If collapsed, render menu icon at the top to expand */}
          {!isSidebarExpanded && (
            <div className="flex justify-center mb-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-slate-850 text-emerald-400 hover:text-emerald-350 border border-slate-700/40 hover:bg-slate-800 cursor-pointer"
                title="Expand Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          )}

          {allowedSidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  localStorage.setItem("urjaflux_active_view", item.id);
                }}
                className={`w-full rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-3 cursor-pointer py-3 ${
                  isSidebarExpanded ? "px-4 justify-start" : "px-0 justify-center"
                } ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
                title={item.label}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {isSidebarExpanded && (
                  <span className="whitespace-nowrap font-semibold uppercase">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-2 border-t border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-3 cursor-pointer py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 ${
              isSidebarExpanded ? "px-4 justify-start" : "px-0 justify-center"
            }`}
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {isSidebarExpanded && (
              <span className="font-semibold uppercase">LOGOUT</span>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Right of sidebar) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Dynamic Top Header */}
        <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 transition-colors z-30 ${
          activeView === "workspace"
            ? "bg-slate-950 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}>
          {/* Breadcrumb Path & Collapsible Toggle if Expanded */}
          <div className="flex items-center gap-3">
            {isSidebarExpanded && (
              <button 
                onClick={toggleSidebar}
                className="hidden md:flex p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {!isSidebarExpanded && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mr-2 cursor-pointer"
                title="Expand Sidebar"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            )}
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-slate-400">
              <span className="font-bold text-slate-500 hidden sm:inline">URJAFLUX AI OS</span>
              <span className="hidden sm:inline">/</span>
              <span className={activeView === "workspace" ? "text-emerald-400 font-bold" : "text-slate-800 dark:text-slate-200 font-bold"}>
                {activeView === "workspace" ? "WORKSPACE & CHAKRA STUDIO" : activeView.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* User Role Pill */}
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider uppercase font-bold border ${
              activeView === "workspace"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span>ROLE: {activeUserRole}</span>
            </div>

            <LanguageSelector onOpenSettings={() => setActiveView("settings")} />
          </div>
        </header>

        {/* Dynamic Inner Main Content with responsive canvas area */}
        <main className={activeView === "workspace" || activeView === "design_system"
          ? "flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col bg-[#04060b]" 
          : "flex-1 w-full overflow-y-auto bg-slate-50 p-4 md:p-8"
        }>
          {/* 1. DASHBOARD VIEW */}
          {activeView === "dashboard" && (
            <DashboardPage
              projects={projects}
              clients={clients}
              properties={properties}
              reports={reports}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onNavigate={(view) => {
                if (view === "add_client") {
                  setStartWithAddClient(true);
                  setActiveView("clients");
                } else if (view === "add_property") {
                  setActiveView("properties");
                } else {
                  setActiveView(view);
                }
              }}
              activeUserRole={activeUserRole}
            />
          )}

          {/* 2. CLIENTS DIRECTORY VIEW */}
          {activeView === "clients" && (
            <ClientsPage
              clients={clients}
              properties={properties}
              reports={reports}
              onClientsChange={setClients}
              onPropertiesChange={setProperties}
              onReportsChange={setReports}
              onNavigateToReports={(reportId) => {
                setActiveView("reports");
              }}
              startWithAddClient={startWithAddClient}
              clearStartWithAddClient={() => setStartWithAddClient(false)}
            />
          )}

          {/* 3. PROPERTIES VIEW */}
          {activeView === "properties" && (
            <PropertiesPage
              properties={properties}
              clients={clients}
              onAddProperty={handleAddProperty}
              onEditProperty={handleEditProperty}
              onDeleteProperty={handleDeleteProperty}
              onSelectPropertyToCalibrate={handleSelectPropertyToCalibrate}
            />
          )}

          {/* CENTRAL IDENTITY ENGINE & LEAD INTELLIGENCE VIEW */}
          {activeView === "identity" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <IdentityWorkspace />
            </div>
          )}

          {/* ENTERPRISE CONSULTANT WORKFLOW ENGINE */}
          {activeView === "consultant_workflow" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <EnterpriseConsultantWorkflow />
            </div>
          )}

          {/* PROJECTS ENGINE VIEW */}
          {activeView === "projects" && (
            <ProjectsPage
              projects={projects}
              setProjects={setProjects}
              clients={clients}
              properties={properties}
              onNavigateToWorkspace={(prop) => {
                setActiveProperty(prop);
                setActiveView("workspace");
              }}
            />
          )}

          {/* CLIENT CONTEXT INTELLIGENCE ENGINE (CCIE) VIEW */}
          {activeView === "ccie_context" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <ClientContextProfileView />
            </div>
          )}

          {/* URJAFLUX KNOWLEDGE ASSISTANT (UKA) WORKSPACE */}
          {activeView === "uka_assistant" && (
            <UKAWorkspace />
          )}

          {/* SPATIAL INTELLIGENCE OS WORKSPACE */}
          {activeView === "spatial_intelligence" && (
            <SpatialIntelligenceWorkspace />
          )}

          {/* PRODUCT VISION LOCK WORKSPACE */}
          {activeView === "product_vision_lock" && (
            <ProductVisionLockWorkspace />
          )}

          {/* DIGITAL TWIN ENTERPRISE OS VIEW */}
          {activeView === "digital_twin" && (
            <DigitalTwinWorkspace />
          )}

          {/* ENTERPRISE GA KERNEL WORKSPACE */}
          {activeView === "enterprise_ga" && (
            <EnterpriseGaWorkspace />
          )}

          {/* FUTURE EXPANSION BACKLOG WORKSPACE (DEFERRED ROADMAP) */}
          {(activeView === "future_expansion_backlog" || activeView === "industry_solutions") && (
            <FutureExpansionBacklogWorkspace />
          )}

          {/* GLOBAL ENTERPRISE CLOUD PLATFORM WORKSPACE */}
          {activeView === "global_cloud" && (
            <GlobalCloudPlatformWorkspace />
          )}

          {/* DEVELOPER PLATFORM WORKSPACE */}
          {activeView === "devex_platform" && (
            <DeveloperPlatformWorkspace />
          )}

          {/* AUTONOMOUS AI OS WORKSPACE */}
          {activeView === "autonomous_ai" && (
            <AutonomousAiWorkspace />
          )}

          {/* CUSTOMER LIFECYCLE OS WORKSPACE */}
          {activeView === "customer_lifecycle" && (
            <CustomerLifecycleWorkspace />
          )}

          {/* 4. WORKSPACE / SRE VIEW (Architecture & Vastu Studio) */}
          {activeView === "workspace" && (
            <WorkspacePage
              properties={properties}
              clients={clients}
              activeProperty={activeProperty}
              onSetActiveProperty={setActiveProperty}
              onUpdatePropertyOffset={handleUpdatePropertyOffset}
              onNavigate={setActiveView}
              projects={projects}
              setProjects={setProjects}
            />
          )}

          {/* SPATIAL CAD ENGINE VIEW (DOMAIN-011) */}
          {activeView === "cad" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <SpatialCadWorkspace />
            </div>
          )}

          {/* VISION WORKSPACE VIEW (DOMAIN-012) */}
          {activeView === "vision" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <VisionWorkspacePage />
            </div>
          )}

          {/* WORKFLOW ORCHESTRATION VIEW (DOMAIN-013) */}
          {activeView === "workflow" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <WorkflowWorkspacePage />
            </div>
          )}

          {/* COLLABORATION HUB VIEW (DOMAIN-014) */}
          {activeView === "collaboration" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <CollaborationWorkspacePage />
            </div>
          )}

          {/* INTEGRATION PLATFORM VIEW (DOMAIN-015) */}
          {activeView === "integration" && (
            <IntegrationWorkspacePage />
          )}

          {/* ANALYSIS HUB VIEW */}
          {activeView === "analysis" && (
            <AnalysisHubPage clients={clients} onNavigate={setActiveView} />
          )}

          {/* DOCUMENTS VIEW (PROJECT VAULT & IMPORT ENGINE) */}
          {activeView === "documents" && (
            <ProjectImportSystem
              projects={projects}
              setProjects={setProjects}
              clients={clients}
              properties={properties}
              onNavigateToWorkspace={(prop) => {
                setActiveProperty(prop);
                setActiveView("workspace");
              }}
              onNavigateView={setActiveView}
            />
          )}

          {/* 6. REPORTS PREVIEW VIEW */}
          {activeView === "reports" && (
            <ReportsPage
              reports={reports}
              properties={properties}
              clients={clients}
              onAddReport={handleAddReport}
              onDeleteReport={handleDeleteReport}
              onUpdateReportStatus={handleUpdateReportStatus}
            />
          )}

          {/* KNOWLEDGE BASE & IMPORT ENGINE VIEW */}
          {canAccessKnowledgeHub(activeUserRole) && activeView === "knowledge_vault" && (
            <KnowledgePage userRole={activeUserRole} vaultOnly initialSubModule="UploadCenter" />
          )}

          {canAccessKnowledgeHub(activeUserRole) && activeView === "knowledge" && (
            <KnowledgePage userRole={activeUserRole} />
          )}

          {/* ENTERPRISE SAAS CUSTOMER PORTAL */}
          {activeView === "saas_portal" && (
            <div className="w-full font-sans">
              <CustomerPortal />
            </div>
          )}

          {/* ENTERPRISE SAAS MASTER ADMIN CONSOLE */}
          {activeView === "saas_admin" && (
            <div className="w-full font-sans">
              <SaaSAdminConsole />
            </div>
          )}

          {/* ENTERPRISE SECURITY, IDENTITY & COMPLIANCE (DOMAIN-017) */}
          {activeView === "security" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
              <SecurityWorkspacePage />
            </div>
          )}

          {/* ENTERPRISE AI MODEL MANAGEMENT, PROMPTOPS & AI GOVERNANCE (DOMAIN-018) */}
          {activeView === "ai_governance" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
              <AIGovernanceWorkspace />
            </div>
          )}

          {/* ENTERPRISE PLUGIN, EXTENSION & MARKETPLACE FRAMEWORK (DOMAIN-019) */}
          {activeView === "plugins_marketplace" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
              <PluginWorkspace />
            </div>
          )}

          {/* BRAND PROFILE VIEW (White-label settings) */}
          {activeView === "brand_profile" && (
            <BrandProfilePage />
          )}

          {/* 7. SETTINGS CONFIG VIEW */}
          {activeView === "settings" && (
            <SettingsPage />
          )}

          {/* OFFICIAL URJAFLUX DESIGN SYSTEM VIEW */}
          {activeView === "design_system" && (
            <DesignSystemPage />
          )}
        </main>
      </div>
    </div>
  );
}
