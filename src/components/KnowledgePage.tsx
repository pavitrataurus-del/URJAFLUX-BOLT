import { MOCK_SCRIPTURES } from "../data/mockData";
import React, { useState, useEffect } from "react";
import EnterpriseKnowledgeWorkspace from "../core/knowledge_workspace/EnterpriseKnowledgeWorkspace";
import { 
  BookOpen, 
  Search, 
  Layers, 
  Compass, 
  FileText, 
  Filter, 
  Award,
  Sparkles,
  Award as AwardIcon,
  Calculator,
  Compass as CompassIcon,
  ShieldCheck,
  ChevronRight,
  Database,
  Cpu,
  RefreshCw,
  Radio,
  Brain,
  FolderGit2,
  Activity,
  Upload
} from "lucide-react";
import { ScriptureVerse } from "../types/app";
import { KnowledgeIngestionService } from "../services/knowledgeIngestionService";
import { IngestedBook, ExtractedRule, ExtractedFormula, KnowledgeCommit } from "../knowledge/types/knowledgeIngestion";
import { KnowledgeIngestionPage } from "../core/knowledge_ingestion";
import { KnowledgeImportWizard } from "./knowledge/KnowledgeImportWizard";
import { AIKnowledgeChat } from "./knowledge/AIKnowledgeChat";
import { KnowledgeVaultDashboardView } from "./knowledge/KnowledgeVaultDashboardView";
import { KnowledgeUploadCenter } from "./knowledge/KnowledgeUploadCenter";
import { EnterpriseAiSearchAssistant } from "./knowledge/EnterpriseAiSearchAssistant";
import { KnowledgePlatformAdminConsole } from "./knowledge/KnowledgePlatformAdminConsole";
import VastuKnowledgeLibraryWorkspace from "./knowledge/VastuKnowledgeLibraryWorkspace";
import ChakraKnowledgeLibraryWorkspace from "./knowledge/ChakraKnowledgeLibraryWorkspace";
import LalKitabKnowledgeLibraryWorkspace from "./knowledge/LalKitabKnowledgeLibraryWorkspace";
import NumerologyKnowledgeLibraryWorkspace from "./knowledge/NumerologyKnowledgeLibraryWorkspace";
import { AstrologyKnowledgeLibraryWorkspace } from "./knowledge/AstrologyKnowledgeLibraryWorkspace";
import { UnifiedReasoningWorkspace } from "./reasoning/UnifiedReasoningWorkspace";
import { ProjectExecutionWorkspace } from "./execution/ProjectExecutionWorkspace";
import { MonitoringWorkspace } from "./monitoring/MonitoringWorkspace";
import EnterpriseStorageHealthMonitor from "./admin/EnterpriseStorageHealthMonitor";

import AdminImportDashboard from "./admin/AdminImportDashboard";
import { VerificationDashboard } from "../core/knowledge/verification/components/VerificationDashboard";
import { ConsultationWorkspace } from "./consultation/ConsultationWorkspace";
import {
  canAccessKnowledgeHub,
  canAccessKnowledgeVault,
} from "../core/access/knowledgeVaultAccess";
import { KnowledgeVaultAccessGate } from "./knowledge/KnowledgeVaultAccessGate";

type KnowledgeSubModule =
  | "UploadCenter"
  | "AiSearch"
  | "AdminConsole"
  | "Consultation"
  | "Monitoring"
  | "Execution"
  | "Reasoning"
  | "Vastu"
  | "Chakra"
  | "Numerology"
  | "LalKitab"
  | "Astrology"
  | "Ingestion"
  | "Verification";

interface KnowledgePageProps {
  userRole?: "ADMIN" | "END_USER" | "SUPER_ADMIN" | "CONSULTANT" | "CLIENT" | "FOUNDER";
  initialSubModule?: KnowledgeSubModule;
  vaultOnly?: boolean;
}

export default function KnowledgePage({
  userRole = "ADMIN",
  initialSubModule,
  vaultOnly = false,
}: KnowledgePageProps) {
  const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";
  const hasVaultAccess = canAccessKnowledgeVault(userRole);
  const hasKnowledgeAccess = canAccessKnowledgeHub(userRole);
  const defaultSubModule: KnowledgeSubModule =
    vaultOnly && hasVaultAccess
      ? "UploadCenter"
      : hasVaultAccess
        ? initialSubModule || "UploadCenter"
        : initialSubModule || "Vastu";

  const [activeSubModule, setActiveSubModule] = useState<KnowledgeSubModule>(defaultSubModule);


  
  // Vastu states
  const [searchTerm, setSearchTerm] = useState("");
  const [elementFilter, setElementFilter] = useState<string>("All");

  // Numerology calculator states
  const [calcName, setCalcName] = useState("");
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [calcSteps, setCalcSteps] = useState<string>("");

  // Lal Kitab house states
  const [selectedHouse, setSelectedHouse] = useState<number>(1);

  // Knowledge Ingestion System states
  const [ingestionSubTab, setIngestionSubTab] = useState<"wizard" | "vault" | "storage" | "streaming_import" | "foundation" | "catalog" | "upload" | "rules" | "graph" | "commits">("wizard");

  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogResult, setCatalogResult] = useState(() => KnowledgeIngestionService.searchCatalog("", 1, 8));
  
  // Book Upload Form
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAuthor, setUploadAuthor] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Vastu Shastra");
  const [uploadLanguage, setUploadLanguage] = useState("English");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadSummary, setUploadSummary] = useState<any | null>(null);

  // Rules and Formulas View
  const [ruleSearch, setRuleSearch] = useState("");
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState("All");
  const [rulesAndFormulas, setRulesAndFormulas] = useState<(ExtractedRule | ExtractedFormula)[]>(() => {
    const res = KnowledgeIngestionService.queryKnowledgeItems({ limit: 40 });
    return [...res.rules, ...res.formulas];
  });
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [traceData, setTraceData] = useState<any | null>(null);

  // Knowledge Graph View
  const [graphData, setGraphData] = useState(() => KnowledgeIngestionService.getKnowledgeGraph());
  const [graphSearchNode, setGraphSearchNode] = useState("");
  const [selectedGraphNode, setSelectedGraphNode] = useState<any | null>(null);

  // Commits ledger
  const [commits, setCommits] = useState<KnowledgeCommit[]>(() => KnowledgeIngestionService.getCommits());

  const refreshIngestionState = () => {
    setCatalogResult(KnowledgeIngestionService.searchCatalog(catalogSearch, catalogPage, 8));
    const res = KnowledgeIngestionService.queryKnowledgeItems({ queryText: ruleSearch, limit: 40 });
    let items = [...res.rules, ...res.formulas];
    if (ruleCategoryFilter === "rule") {
      items = res.rules;
    } else if (ruleCategoryFilter === "formula") {
      items = res.formulas;
    }
    setRulesAndFormulas(items);
    setCommits(KnowledgeIngestionService.getCommits());
    setGraphData(KnowledgeIngestionService.getKnowledgeGraph());
  };

  useEffect(() => {
    setCatalogResult(KnowledgeIngestionService.searchCatalog(catalogSearch, catalogPage, 8));
  }, [catalogSearch, catalogPage]);

  useEffect(() => {
    const res = KnowledgeIngestionService.queryKnowledgeItems({ 
      queryText: ruleSearch, 
      limit: 40 
    });
    let items = [...res.rules, ...res.formulas];
    if (ruleCategoryFilter === "rule") {
      items = res.rules;
    } else if (ruleCategoryFilter === "formula") {
      items = res.formulas;
    }
    setRulesAndFormulas(items);
  }, [ruleSearch, ruleCategoryFilter]);

  // Handle book ingestion action
  const handleIngestBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadAuthor || !uploadContent) return;

    setUploadProgress("Segmenting document into physical pages...");
    await new Promise(r => setTimeout(r, 400));
    setUploadProgress("Running OCR layout block boundary segmentation...");
    await new Promise(r => setTimeout(r, 400));
    setUploadProgress("Executing Vastu rule extraction engine...");
    await new Promise(r => setTimeout(r, 400));
    setUploadProgress("Mapping Ayadi formulas and mathematical models...");
    await new Promise(r => setTimeout(r, 400));
    setUploadProgress("Resolving multi-shastra cross-references...");
    await new Promise(r => setTimeout(r, 300));
    
    try {
      const summary = await KnowledgeIngestionService.ingestBook({
        title: uploadTitle,
        author: uploadAuthor,
        category: uploadCategory,
        language: uploadLanguage,
        rawContent: uploadContent
      });
      setUploadSummary(summary);
      setUploadProgress(null);
      
      // Reset fields
      setUploadTitle("");
      setUploadAuthor("");
      setUploadContent("");

      // Refresh all state lists
      refreshIngestionState();
    } catch (err: any) {
      setUploadProgress(`Extraction Failed: ${err.message || err}`);
    }
  };

  const handleTraceCitation = (id: string) => {
    const data = KnowledgeIngestionService.getTraceabilityData(id);
    if (data) {
      setSelectedTraceId(id);
      setTraceData(data);
    }
  };

  // Chaldean letter values
  const chaldeanGrid: { [key: string]: number } = {
    a: 1, i: 1, j: 1, q: 1, y: 1,
    b: 2, k: 2, r: 2,
    c: 3, g: 3, l: 3, s: 3,
    d: 4, m: 4, t: 4,
    e: 5, h: 5, n: 5, x: 5,
    u: 6, v: 6, w: 6,
    o: 7, z: 7,
    f: 8, p: 8
  };

  const calculateChaldeanNumerology = (nameStr: string) => {
    if (!nameStr) {
      setCalcResult(null);
      setCalcSteps("");
      return;
    }

    const cleaned = nameStr.toLowerCase().replace(/[^a-z]/g, "");
    let sum = 0;
    const steps: string[] = [];

    for (let char of cleaned) {
      const val = chaldeanGrid[char] || 0;
      sum += val;
      steps.push(`${char.toUpperCase()}(${val})`);
    }

    // Reduce sum to single digit or compound
    let reducedSum = sum;
    while (reducedSum > 9) {
      const parts = reducedSum.toString().split("").map(Number);
      reducedSum = parts.reduce((acc, digit) => acc + digit, 0);
    }

    setCalcResult(reducedSum);
    setCalcSteps(`${steps.join(" + ")} = Total ${sum} -> Reduced to: ${reducedSum}`);
  };

  const handleCalcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateChaldeanNumerology(calcName);
  };

  // Lal Kitab House remedies seed
  const lalKitabRemedies: { [key: number]: { planet: string; defect: string; remedy: string; element: string } } = {
    1: { planet: "Sun", defect: "Sun in 1st House blocking personal confidence and vitality", remedy: "Place solid copper sphere on the East foyer console. Avoid dark basements.", element: "Fire" },
    2: { planet: "Jupiter", defect: "Jupiter in 2nd House causing financial grid stagnation", remedy: "Place dynamic yellow sandalwood plate or brass rod along North-East vectors.", element: "Wisdom" },
    3: { planet: "Mars", defect: "Mars in 3rd House triggering verbal conflicts and sibling friction", remedy: "Bury solid silver square plate under the front threshold.", element: "Earth" },
    4: { planet: "Moon", defect: "Moon in 4th House causing severe emotional geopathic sensitivity", remedy: "Never keep stagnant water in the North. Place silver coin in dynamic water bowl.", element: "Water" },
    5: { planet: "Sun & Jupiter", defect: "Sun-Jupiter in 5th House affecting academic/creative growth", remedy: "Avoid placing storage items on high shelves in East zones.", element: "Space" },
    6: { planet: "Mercury", defect: "Mercury in 6th House causing business contract blockages", remedy: "Feed birds green grain in North West balcony zone regularly.", element: "Air" },
    7: { planet: "Venus", defect: "Venus in 7th House disrupting residential relationship harmony", remedy: "Place dynamic white quartz crystal cluster in South-West master suite.", element: "Aesthetics" },
    8: { planet: "Saturn", defect: "Saturn in 8th House triggering structural and health stress", remedy: "Keep South-West boundary wall heavy. Place zinc pyramid at SW corner.", element: "Structure" },
    9: { planet: "Jupiter", defect: "Jupiter in 9th House blocking spiritual and fortune flow", remedy: "Maintain absolute cleanliness in North East quadrant. Hang brass bell.", element: "Cosmic" },
    10: { planet: "Saturn & Mars", defect: "Saturn-Mars in 10th House obstructing professional trajectory", remedy: "Place brass pyramid under office desk boundary line.", element: "Career" },
    11: { planet: "Ketu", defect: "Ketu in 11th House creating unpredictable income dips", remedy: "Avoid heavy black metal grids on main window panels.", element: "Metaphysical" },
    12: { planet: "Rahu", defect: "Rahu in 12th House triggering severe geopathic sleep blockages", remedy: "Place dynamic salt lamp or copper bowl with sea salt under headboard.", element: "Geopathic" }
  };

  // Filter Vastu scriptures
  const filteredScriptures = MOCK_SCRIPTURES.filter(sv => {
    const matchesSearch = sv.book.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sv.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sv.sanskrit.includes(searchTerm) ||
                          sv.application.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesElement = elementFilter === "All" || sv.element === elementFilter;

    return matchesSearch && matchesElement;
  });

  useEffect(() => {
    if (!hasVaultAccess && (activeSubModule === "UploadCenter" || activeSubModule === "Ingestion")) {
      setActiveSubModule("Vastu");
    }
  }, [hasVaultAccess, activeSubModule]);

  const roleKey = isSuperAdmin ? "SUPER_ADMIN" : userRole === "FOUNDER" ? "FOUNDER" : "CONSULTANT";
  const vaultOnlyTabs = new Set<KnowledgeSubModule>(["UploadCenter", "Ingestion"]);

  if (!hasKnowledgeAccess) {
    return (
      <div id="knowledge-page" className="p-4">
        <KnowledgeVaultAccessGate userRole={userRole}>
          <span />
        </KnowledgeVaultAccessGate>
      </div>
    );
  }

  return (
    <div id="knowledge-page" className="space-y-5 font-sans">
      
      {/* Page Header — simple briefing */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 px-5 py-5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
              URJAFLUX · {vaultOnly && hasVaultAccess ? "Knowledge Vault" : "Knowledge Hub"}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
              {hasVaultAccess
                ? "Books upload karein, rules banayein, reports tayyar karein"
                : "Shastra libraries aur analysis tools"}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {hasVaultAccess
                ? "Founder vault — PDF, Word, text upload, OCR, rules library aur backup. Sirf aapke paas access hai."
                : "Vastu, Lal Kitab, Numerology aur Astrology libraries — approved knowledge se client reports banate hain."}
            </p>
          </div>
          {hasVaultAccess && (
            <button
              onClick={() => setActiveSubModule("UploadCenter")}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-emerald-600/20 shrink-0 self-start"
            >
              <Upload className="w-4 h-4" />
              Vault kholo
            </button>
          )}
        </div>
      </div>

      {/* SUB-MODULE TABS */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 overflow-x-auto">
        {[
          { id: "UploadCenter", label: "Vault Home", icon: Upload, roles: ["FOUNDER"] },
          { id: "AiSearch", label: "AI Search", icon: Sparkles, roles: ["SUPER_ADMIN", "CONSULTANT", "FOUNDER"] },
          { id: "AdminConsole", label: "Admin", icon: Cpu, roles: ["SUPER_ADMIN"] },
          { id: "Consultation", label: "Consultation", icon: Brain, roles: ["SUPER_ADMIN"] },
          { id: "Monitoring", label: "Monitoring", icon: Activity, roles: ["SUPER_ADMIN"] },
          { id: "Execution", label: "Projects", icon: FolderGit2, roles: ["SUPER_ADMIN"] },
          { id: "Reasoning", label: "Reasoning", icon: Brain, roles: ["SUPER_ADMIN"] },
          { id: "Vastu", label: "Vastu Library", icon: CompassIcon, roles: ["SUPER_ADMIN", "CONSULTANT", "FOUNDER"] },
          { id: "Chakra", label: "Chakra", icon: Radio, roles: ["SUPER_ADMIN", "CONSULTANT", "FOUNDER"] },
          { id: "Numerology", label: "Numerology", icon: Calculator, roles: ["SUPER_ADMIN", "CONSULTANT", "FOUNDER"] },
          { id: "LalKitab", label: "Lal Kitab", icon: Sparkles, roles: ["SUPER_ADMIN", "CONSULTANT", "FOUNDER"] },
          { id: "Astrology", label: "Astrology", icon: BookOpen, roles: ["SUPER_ADMIN", "CONSULTANT", "FOUNDER"] },
          { id: "Ingestion", label: "Ingestion", icon: Database, roles: ["FOUNDER"] },
          { id: "Verification", label: "Verification", icon: ShieldCheck, roles: ["SUPER_ADMIN"] }
        ]
          .filter((tab) => tab.roles.includes(roleKey))
          .filter((tab) => !vaultOnly || tab.id === "UploadCenter")
          .filter((tab) => hasVaultAccess || !vaultOnlyTabs.has(tab.id as KnowledgeSubModule))
          .map(tab => {
          const Icon = tab.icon || CompassIcon;
          const isActive = activeSubModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubModule(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-white text-emerald-800 shadow-sm border border-emerald-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUB-MODULE INTERACTIVE CONTENTS */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-1 sm:p-2">
        
        {/* MODULE UPLOAD CENTER: HIGH PERFORMANCE LARGE BOOK & FOLDER UPLOAD PIPELINE */}
        {activeSubModule === "UploadCenter" && (
          <div className="w-full rounded-xl overflow-hidden">
            <KnowledgeVaultAccessGate userRole={userRole}>
              <KnowledgeVaultDashboardView />
            </KnowledgeVaultAccessGate>
          </div>
        )}
        
        {/* MODULE 14: ENTERPRISE AI SEARCH & EXPLAINABLE REASONING ASSISTANT */}
        {activeSubModule === "AiSearch" && (
          <div className="w-full rounded-xl overflow-hidden py-2">
            <EnterpriseAiSearchAssistant tenantId="tenant_org_01" />
          </div>
        )}

        {/* MODULE 15: KNOWLEDGE PLATFORM ADMIN CONSOLE */}
        {activeSubModule === "AdminConsole" && (
          <div className="w-full rounded-xl overflow-hidden py-2">
            <KnowledgePlatformAdminConsole tenantId="tenant_org_01" />
          </div>
        )}
        
        {/* MODULE 0.9: ENTERPRISE AI CONSULTATION & CONVERSATION ENGINE (DOMAIN-009) */}
        {activeSubModule === "Consultation" && (
          <div className="w-full rounded-xl overflow-hidden">
            <ConsultationWorkspace
              initialUserRole={isSuperAdmin ? "ADMIN" : "END_USER"}
              onNavigateToModule={(mod) => setActiveSubModule(mod as any)}
            />
          </div>
        )}

        {/* MODULE 0.8: MONITORING & DIGITAL TWIN INTELLIGENCE ENGINE (DOMAIN-008) */}
        {activeSubModule === "Monitoring" && (
          <div className="w-full rounded-xl overflow-hidden">
            <MonitoringWorkspace />
          </div>
        )}

        {/* MODULE 0.7: PROJECT EXECUTION & WORKFLOW ENGINE (DOMAIN-007) */}
        {activeSubModule === "Execution" && (
          <div className="w-full rounded-xl overflow-hidden">
            <ProjectExecutionWorkspace />
          </div>
        )}

        {/* MODULE 0: UNIFIED REASONING & RECOMMENDATION ENGINE (DOMAIN-006) */}
        {activeSubModule === "Reasoning" && (
          <div className="w-full rounded-xl overflow-hidden">
            <UnifiedReasoningWorkspace />
          </div>
        )}

        {/* MODULE A: VASTU MASTER KNOWLEDGE LIBRARY */}
        {activeSubModule === "Vastu" && (
          <div className="h-[750px] w-full rounded-xl overflow-hidden border border-slate-800">
            <VastuKnowledgeLibraryWorkspace userRole={isSuperAdmin ? "ADMIN" : "END_USER"} />
          </div>
        )}

        {/* MODULE B: CHAKRA INTELLIGENCE LIBRARY (DOMAIN-002) */}
        {activeSubModule === "Chakra" && (
          <div className="h-[800px] w-full rounded-xl overflow-hidden border border-slate-800">
            <ChakraKnowledgeLibraryWorkspace userRole={isSuperAdmin ? "Admin" : "EndUser"} />
          </div>
        )}

        {/* MODULE B: NUMEROLOGY INTELLIGENCE LIBRARY (DOMAIN-004) */}
        {activeSubModule === "Numerology" && (
          <NumerologyKnowledgeLibraryWorkspace userRole={isSuperAdmin ? "Admin" : "EndUser"} />
        )}

        {/* MODULE C: LAL KITAB ASTRO-REMEDIES & KNOWLEDGE LIBRARY */}
        {activeSubModule === "LalKitab" && (
          <LalKitabKnowledgeLibraryWorkspace userRole={isSuperAdmin ? "Admin" : "EndUser"} />
        )}

        {/* MODULE D: ASTROLOGY INTELLIGENCE LIBRARY (DOMAIN-005) */}
        {activeSubModule === "Astrology" && (
          <AstrologyKnowledgeLibraryWorkspace userRole={isSuperAdmin ? "Admin" : "EndUser"} />
        )}

        {/* MODULE E: KNOWLEDGE INGESTION PIPELINE */}
        {activeSubModule === "Ingestion" && (
          <KnowledgeVaultAccessGate userRole={userRole}>
            <div className="h-[800px] rounded-xl overflow-hidden border border-slate-200">
              <EnterpriseKnowledgeWorkspace userRole="ADMIN" />
            </div>
          </KnowledgeVaultAccessGate>
        )}

        {/* MODULE F: ENTERPRISE KNOWLEDGE VERIFICATION & TRUTH ENGINE */}
        {activeSubModule === "Verification" && (
          <div className="h-[800px] rounded-xl overflow-hidden border border-slate-200">
            <VerificationDashboard userRole={isSuperAdmin ? "ADMIN" : "END_USER"} />
          </div>
        )}

      </div>


    </div>
  );
}
