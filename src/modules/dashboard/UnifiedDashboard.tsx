import React, { useState, useEffect } from "react";
import { Client, Property, ProjectReport } from "../../types/app";
import { 
  ArrowLeft, FileText, Settings, Shield, RefreshCw, 
  Sparkles, CheckCircle2, AlertTriangle, Eye, EyeOff, Globe, Download, Printer 
} from "lucide-react";
import { useTranslation } from "../../localization/hooks/useTranslation";

// Sub components
import { OverallInsightsPanel } from "./OverallInsightsPanel";
import { PriorityEnginePanel, DashboardPriority } from "./PriorityEnginePanel";
import { UnifiedRecommendationsPanel, UnifiedRecommendation } from "./UnifiedRecommendationsPanel";
import { CrossModuleTimeline, TimelineEvent } from "./CrossModuleTimeline";
import { ClientHealthIndex } from "./ClientHealthIndex";
import { ActivityFeed, ActivityLogItem } from "./ActivityFeed";
import { UpcomingFollowups, UpcomingEvent } from "./UpcomingFollowups";
import { ModuleStatusPanel } from "./ModuleStatusPanel";

// Astro engines
import { calculateNumerology } from "../../components/numerology/numerologyEngine";
import { calculateLalKitab } from "../../components/lalkitab/lalkitabEngine";

interface UnifiedDashboardProps {
  client: Client;
  properties: Property[];
  reports: ProjectReport[];
  onBack: () => void;
  onUpdateClient?: (updatedClient: Client) => Promise<any>;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  client,
  properties,
  reports,
  onBack,
  onUpdateClient
}) => {
  const { language } = useTranslation();

  // 1. Role Model Simulator State
  // Allowed roles: ADMIN, END_USER
  const [activeRole, setActiveRole] = useState<"ADMIN" | "END_USER">("ADMIN");
  const [showRolePanel, setShowRolePanel] = useState(true);

  // 2. Report Creator Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLanguage, setReportLanguage] = useState<"English" | "Hindi">("English");

  useEffect(() => {
    if (client.reportLanguage === "Hindi" || client.preferredLanguage === "Hindi" || client.preferredLanguage === "hi") {
      setReportLanguage("Hindi");
    } else {
      setReportLanguage("English");
    }
  }, [client.preferredLanguage, client.language]);

  // Filter properties and reports for this client
  const clientProperties = properties.filter(p => p.clientId === client.id);
  const clientReports = reports.filter(r => r.clientId === client.id);

  // Local active states for interactive recommendation checklist
  const [remediesList, setRemediesList] = useState<UnifiedRecommendation[]>([]);
  const [priorityItems, setPriorityItems] = useState<DashboardPriority[]>([]);

  // 3. Dynamic Calculation & Data Extraction
  const numResult = calculateNumerology(client.dob, client.name);
  const lkResult = calculateLalKitab(client.dob, client.name, client.birthTime);

  const hasVastu = clientProperties.length > 0;
  const hasNumerology = !!numResult;
  const hasLalKitab = !!lkResult;

  // Deriving sub-scores
  const vastuScore = hasVastu ? 75 + (clientProperties.length * 3) : 0;
  const numerologyScore = hasNumerology ? Math.min(100, 70 + (numResult.lifePath.value * 2) + (numResult.destiny.value)) : 0;
  const lalkitabScore = hasLalKitab ? Math.min(100, 65 + (lkResult.planets.filter(p => p.strength > 5).length * 4)) : 0;

  let totalMeters = 0;
  let runningSum = 0;
  if (hasVastu) { totalMeters++; runningSum += vastuScore; }
  if (hasNumerology) { totalMeters++; runningSum += numerologyScore; }
  if (hasLalKitab) { totalMeters++; runningSum += lalkitabScore; }
  const overallScore = totalMeters > 0 ? Math.round(runningSum / totalMeters) : 50;

  // 4. Dossier Health Percentages Calculations
  const calcPersonalPct = () => {
    let score = 0;
    if (client.name) score += 40;
    if (client.gender) score += 30;
    if (client.language || client.preferredLanguage) score += 30;
    return score;
  };

  const calcBirthPct = () => {
    let score = 0;
    if (client.dob) score += 20;
    if (client.birthTime && client.birthTime !== "Unknown / Not Available") score += 20;
    if (client.birthPlace) score += 20;
    if (client.birthLatitude !== undefined) score += 20;
    if (client.birthTimezone) score += 20;
    return score;
  };

  const calcPropertiesPct = () => {
    return clientProperties.length > 0 ? 100 : 0;
  };

  const calcConsultationsPct = () => {
    const hist = client.consultationHistory || [];
    return hist.length > 0 ? Math.min(100, hist.length * 25) : 0;
  };

  const personalPct = calcPersonalPct();
  const birthPct = calcBirthPct();
  const propertiesPct = calcPropertiesPct();
  const consultationsPct = calcConsultationsPct();
  const overallPct = Math.round((personalPct + birthPct + propertiesPct + consultationsPct) / 4);

  const getLocalizedPriority = (item: DashboardPriority, lang: "English" | "Hindi") => {
    if (lang === "English") return item;

    let localized = { ...item };
    if (item.id === "sys_1") {
      localized.title = "जन्म रिकॉर्ड स्थिति: असत्यापित";
      localized.description = "सटीक खगोलीय गणना के लिए सत्यापित प्रमाण पत्र या जन्म रिकॉर्ड आवश्यक हैं। वर्तमान स्थिति 'उपयोगकर्ता द्वारा प्रविष्ट' है।";
      localized.remedy = "जन्म विवरण टैब के माध्यम से जन्म क्रेडेंशियल और समय विवरण को सत्यापित करें।";
    } else if (item.id === "num_1") {
      localized.title = "तीव्र कर्मिक अंक कंपन सक्रिय";
      localized.description = `ग्राहक का मूलांक ${numResult?.lifePath.value || ""} है, जो उच्च कर्म अनुशासन और व्यवस्थित दिनचर्या की मांग करता है।`;
      localized.remedy = "शनिवार को शनि देव की आराधना (भूमि संरेखण) करें और मयमतम शास्त्र मंत्रों का जाप करें।";
    } else if (item.id === "vas_1") {
      localized.title = "उत्तर-पूर्व (ईशान कोण) तत्व असंतुलन";
      localized.description = "मुख्य संपत्ति के नक्शे में उत्तर-पूर्व (ईशान) क्षेत्र में शौचालय या कचरा संरेखण है, जो ईशान ऊर्जाओं के प्रवाह को बाधित करता है।";
      localized.remedy = "उत्तर-पूर्व क्षेत्र में तांबे का हेलिक्स स्थापित करें, पीले रंग का बल्ब लगाएं और अत्यधिक स्वच्छता बनाए रखें।";
    } else if (item.id === "lk_1") {
      const sleepingHouse = lkResult?.houses.find(h => h.weakness && h.weakness !== "None");
      localized.title = `सुप्त कुंडली भाव #${sleepingHouse?.number || 1} विसंगति`;
      localized.description = `कुंडली का ${sleepingHouse?.number || 1}वां भाव सुप्त है, जो संबंधित जीवन क्षेत्रों में बाधा उत्पन्न कर रहा है।`;
      localized.remedy = "लाल किताब के अनुसार दान करें: निर्धारित दिनों पर विशिष्ट धातु या अनाज का दान करें।";
    }
    return localized;
  };

  const getLocalizedRecommendation = (item: UnifiedRecommendation, lang: "English" | "Hindi") => {
    if (lang === "English") return item;

    let localized = { ...item };
    if (item.id === "rec_num_1") {
      localized.title = `मूलांक ${numResult?.lifePath.value || ""} की ऊर्जा तरंगों से संरेखण`;
      localized.remedy = `दैनिक व्यवहार में अपने शुभ अंक (${numResult?.lifePath.value || ""}) को शामिल करें और अनुशंसित रत्न धारण करें।`;
      localized.expectedBenefit = "भौतिक उन्नति में आने वाली बाधाओं को कम करता है।";
    } else if (item.id === "rec_vas_1") {
      localized.title = "ईशान कोण (उत्तर-पूर्व) क्षेत्र का शुद्धिकरण";
      localized.remedy = "संपत्ति के उत्तर-पूर्व कोने में गंगाजल का कलश स्थापित करें।";
      localized.expectedBenefit = "मानसिक शांति, स्पष्टता लाता है और वैचारिक थकान को दूर करता है।";
    } else if (item.id === "rec_vas_empty") {
      localized.title = "दस्तावेज़ मानकीकृत संपत्ति संरेखण";
      localized.remedy = "संभावित दिशा असंतुलन की पहचान करने के लिए परामर्शदाता को संपत्ति का नक्शा अपलोड करना चाहिए।";
      localized.expectedBenefit = "स्थानिक ज्यामिति सुरक्षा मापदंडों को सक्रिय करता है।";
    } else if (item.id === "rec_lk_1") {
      localized.title = "ग्रह दोष निवारण कोयला दान";
      localized.remedy = "बुधवार के दिन बहते पानी में कोयला प्रवाहित करें या मंदिर में पुजारी को कच्चा कोयला दान करें।";
      localized.expectedBenefit = "सक्रिय जन्म कुंडली में राहू/केतु के नकारात्मक प्रभावों को शांत करता है।";
    }
    return localized;
  };

  // Initialize dynamic priorities and recommendations based on SSoT
  useEffect(() => {
    const recs: UnifiedRecommendation[] = [];
    const prs: DashboardPriority[] = [];

    // System Check
    if (client.birthDataStatus !== "Verified") {
      prs.push({
        id: "sys_1",
        source: "System",
        title: "Birth Record Status: Unverified",
        description: "Core celestial calculations require verified certificates or astro logs. Current accuracy status is 'User Entered'.",
        severity: "Medium",
        remedy: "Verify birth coordinates and time certificates via the Birth Registry tab.",
        status: "Pending"
      });
    }

    // Numerology Check
    if (numResult) {
      if (numResult.lifePath.value === 4 || numResult.lifePath.value === 8 || numResult.lifePath.value === 9) {
        prs.push({
          id: "num_1",
          source: "Numerology",
          title: "Intense Karmic Number Vibration Active",
          description: `The client carries a Life Path of ${numResult.lifePath.value}, which demands elevated karmic discipline and structural routines.`,
          severity: "High",
          remedy: `Perform Saturnian grounding rituals and recite Mayamatam scripture mantras on Saturdays.`,
          status: "Pending"
        });
      }

      recs.push({
        id: "rec_num_1",
        category: "Spiritual",
        module: "Numerology",
        title: `Align with Lifepath ${numResult.lifePath.value} Frequencies`,
        remedy: `Integrate lucky numbers (${numResult.lifePath.value}) into daily transactions and wear recommended gems.`,
        expectedBenefit: "Reduces systemic obstacles in material expansion.",
        complexity: "Simple",
        authority: "Brihat Samhita, Ch. 12",
        completed: false
      });
    }

    // Vastu Check
    if (clientProperties.length > 0) {
      // Create structural recommendation based on first property
      prs.push({
        id: "vas_1",
        source: "Vastu",
        title: "North-East Element Imbalance",
        description: `Primary property floor plan exhibits toilet or clutter alignment in the North-East zone, disrupting the flow of Ishan energies.`,
        severity: "Critical",
        remedy: "Perform copper helix installation, install yellow light bulbs, and maintain absolute cleanliness in the NE sector.",
        status: "Pending"
      });

      recs.push({
        id: "rec_vas_1",
        category: "Structural",
        module: "Vastu",
        title: "Ishan (North-East) Zone Purification",
        remedy: "Place holy water (Ganga Jal) container in the North-East corner of the property.",
        expectedBenefit: "Restores peace, clarity, and removes cognitive fatigue.",
        complexity: "Medium",
        authority: "Mayamatam Shastra, Verse 41",
        completed: false
      });
    } else {
      recs.push({
        id: "rec_vas_empty",
        category: "Structural",
        module: "Vastu",
        title: "Dossier Mapped Property Alignment",
        remedy: "Consultant must upload a scaled floor plan to identify potential orientation imbalances.",
        expectedBenefit: "Unlocks spatial geometry protection parameters.",
        complexity: "Complex",
        authority: "Samarangana Sutradhara",
        completed: false
      });
    }

    // Lal Kitab Check
    if (lkResult) {
      const sleepingHouse = lkResult.houses.find(h => h.weakness && h.weakness !== "None");
      if (sleepingHouse) {
        prs.push({
          id: "lk_1",
          source: "Lal Kitab",
          title: `Sleeping Kundli House #${sleepingHouse.number} Anomaly`,
          description: `The ${sleepingHouse.number}th House of the Kundli remains dormant, obstructing its respective life-domains.`,
          severity: "High",
          remedy: `Perform Lal Kitab charity donation: donate specific metals or grains on designated days.`,
          status: "Pending"
        });
      }

      recs.push({
        id: "rec_lk_1",
        category: "Behavioral",
        module: "Lal Kitab",
        title: "Planetary Charcoal Donation Remediation",
        remedy: "Donate raw coal to temple priests or submerge it in flowing river water on Wednesdays.",
        expectedBenefit: "Appeases negative impacts of Rahu / Ketu nodes in the active birth charts.",
        complexity: "Simple",
        authority: "Lal Kitab 1952 edition, Page 121",
        completed: false
      });
    }

    setPriorityItems(prs);
    setRemediesList(recs);
  }, [client, clientProperties.length, hasNumerology, hasLalKitab]);

  // Handle priority resolution trigger
  const handleResolvePriority = (id: string) => {
    setPriorityItems(prev => prev.map(p => p.id === id ? { ...p, status: "Resolved" } : p));
  };

  // Toggle recommendation checkmark
  const handleToggleRec = (id: string) => {
    setRemediesList(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  // Activity feed items
  const activityLogs: ActivityLogItem[] = [
    {
      id: "act_1",
      timestamp: new Date().toISOString(),
      action: "Synthesizer compiled",
      description: "Triggered core cross-module intelligence analysis engine.",
      user: "System Daemon"
    },
    {
      id: "act_2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: "Registry calibration",
      description: `Synchronized coordinate metadata to latitude ${client.birthLatitude || "N/A"} for Lal Kitab.`,
      user: "ADMIN"
    }
  ];

  // Schedule follow-ups list
  const upcomingEvents: UpcomingEvent[] = [
    {
      id: "ev_1",
      date: "Jul 25, 2026",
      time: "10:30 AM",
      type: "Vastu Audit",
      description: "Review North-East copper helix remediation progress",
      locationType: "Online",
      channel: "Vastu Zoom Chamber 1"
    },
    {
      id: "ev_2",
      date: "Aug 02, 2026",
      time: "02:00 PM",
      type: "Lal Kitab Review",
      description: "Recalculate planetary gochars and verify donation effect",
      locationType: "In-Person",
      channel: "Main Office Suite B"
    }
  ];

  // Timeline audit log
  const timelineLogs: TimelineEvent[] = [
    {
      id: "t_1",
      timestamp: new Date().toISOString(),
      module: "System",
      event: "Dashboard Initialized",
      details: "Created unified dashboard for Vastu, Numerology & Lal Kitab.",
      operator: "ADMIN"
    },
    {
      id: "t_2",
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      module: "Lal Kitab",
      event: "Kundli Plotted",
      details: `Astrological charts calculated on SSoT birth record: ${client.birthPlace}.`,
      operator: "ADMIN"
    }
  ];

  return (
    <div className="space-y-6" id="unified-intelligence-dashboard">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white hover:bg-slate-850 text-slate-400 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
              Unified Intelligence Dashboard
            </h2>
            <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
              CROSS-WORKSPACE SYNTHESIS REPORT FOR {client.name.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowRolePanel(!showRolePanel)}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            {showRolePanel ? "HIDE ACCESS SIMULATOR" : "SHOW ACCESS SIMULATOR"}
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-rose-600 hover:from-emerald-500 hover:to-rose-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-950/30"
          >
            <FileText className="w-3.5 h-3.5 animate-pulse" />
            GENERATE CONSULTANT REPORT
          </button>
        </div>
      </div>

      {/* 2. Role Model Simulation Dashboard */}
      {showRolePanel && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950/60 pb-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-400 animate-pulse" />
              Enterprise Security & Role Visibility Simulator
            </span>
            <span className="text-[9px] font-mono text-slate-400">PROTOTYPE ROLE DECORATORS ACTIVE</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <p className="text-xs text-slate-700 font-sans">
                Change active roles to preview how URJAFLUX OS enforces visibility constraints (ADMIN, END_USER).
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Simulated Role:</label>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-xs font-mono font-bold text-emerald-400 focus:outline-none"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="END_USER">END_USER</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Role Rule Indicator Warning */}
      {activeRole === "END_USER" && (
        <div className="p-3 bg-amber-950/20 border border-amber-900/40 text-amber-400 text-xs rounded-lg font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
          <span>
            END_USER ROLE ACTIVE: Astrological charts, scoring matrices, and priorities resolved buttons are disabled/masked on this view.
          </span>
        </div>
      )}

      {/* 3. Core Grid Panels (Simulated Access Level Filtering) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left main section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Subsystem Modules launcher status */}
          <ModuleStatusPanel
            hasVastu={hasVastu}
            hasNumerology={hasNumerology}
            hasLalKitab={hasLalKitab}
            vastuCount={clientProperties.length}
            numerologySystem={numResult ? "Pythagorean Matrix" : "None"}
            lalKitabAscendant={lkResult ? lkResult.birthDetails.ascendant : "None"}
          />

          {/* Overall progress indices (hidden for walk-in client) */}
          {activeRole !== "END_USER" && (
            <OverallInsightsPanel
              overallScore={overallScore}
              vastuScore={vastuScore}
              numerologyScore={numerologyScore}
              lalKitabScore={lalkitabScore}
              hasVastu={hasVastu}
              hasNumerology={hasNumerology}
              hasLalKitab={hasLalKitab}
            />
          )}

          {/* Priority Engine anomalies triage (hidden for receptionist / walk-in) */}
          {activeRole !== "END_USER" && (
            <PriorityEnginePanel
              priorities={priorityItems.map(p => getLocalizedPriority(p, language === "hi" ? "Hindi" : "English"))}
              onResolvePriority={handleResolvePriority}
            />
          )}

          {/* Unified recommendations task checks */}
          {activeRole !== "END_USER" && (
            <UnifiedRecommendationsPanel
              recommendations={remediesList.map(r => getLocalizedRecommendation(r, language === "hi" ? "Hindi" : "English"))}
              onToggleRecommendation={handleToggleRec}
            />
          )}
        </div>

        {/* Right sidebar section */}
        <div className="lg:col-span-4 space-y-6">
          {/* Dossier progress percentages */}
          <ClientHealthIndex
            personalPct={personalPct}
            birthPct={birthPct}
            propertiesPct={propertiesPct}
            consultationsPct={consultationsPct}
            overallPct={overallPct}
          />

          {/* Upcoming consultations */}
          <UpcomingFollowups
            events={upcomingEvents}
          />

          {/* Activity Logs feed */}
          {activeRole !== "END_USER" && (
            <ActivityFeed
              activities={activityLogs}
            />
          )}

          {/* Timeline audit logger (Admin only view) */}
          {activeRole === "ADMIN" && (
            <CrossModuleTimeline
              events={timelineLogs}
            />
          )}
        </div>
      </div>

      {/* 4. Unified Consultant Report Generator modal preview */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-rose-500 animate-spin-slow" />
                  Unified Consultant Report Builder
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">100% SCRIPTURE-ALIGNED DOSSIER EXPORT</p>
              </div>

              {/* Language selection dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase">REPORT LANGUAGE:</label>
                <select
                  value={reportLanguage}
                  onChange={(e) => setReportLanguage(e.target.value as any)}
                  className="bg-white border border-slate-200 text-xs px-2.5 py-1 text-slate-700 font-mono focus:outline-none"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi / हिन्दी</option>
                </select>

                <button
                  onClick={() => setReportModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-900 transition-colors text-lg font-bold font-mono border border-slate-200 rounded hover:bg-slate-50 ml-4 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal preview body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 text-slate-700 space-y-6 text-left selection:bg-emerald-600" id="report-print-content">
              {reportLanguage === "English" ? (
                // English script
                <div className="space-y-6 font-sans">
                  {/* Report Header logo */}
                  <div className="text-center border-b border-slate-200 pb-6 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase font-mono">
                      URJAFLUX SCRIPTURE REPORT
                    </h1>
                    <p className="text-xs text-emerald-400 font-mono tracking-widest uppercase">
                      Unified Vastu, Numerology & Lal Kitab Analysis Dossier
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SYSTEM METADATA SOURCE ID: {client.id} | COMPILED: {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  {/* 1. Executive Summary */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      1. Executive Summary
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This scripture-aligned report serves as the comprehensive cosmic blueprint for client <span className="text-slate-900 font-bold">{client.name}</span>. By integrating the spatial rules of Mayamatam, gem vibrations from Numerological calculations, and Lal Kitab planetary houses, our system calculates an overall harmony score of <span className="text-emerald-400 font-bold font-mono text-xs">{overallScore}%</span>. Direct structural and spiritual remediation practices outlined below are required to dissolve active anomalies.
                    </p>
                  </div>

                  {/* 2. Birth Profile SSoT */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      2. Birth Profile (Single Source of Truth)
                    </h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono text-[11px]">
                        <span className="text-slate-400">CLIENT FULL NAME:</span>
                        <span className="text-slate-200">{client.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono text-[11px]">
                        <span className="text-slate-400">DATE OF BIRTH:</span>
                        <span className="text-slate-200">{client.dob}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono text-[11px]">
                        <span className="text-slate-400">BIRTH ACCURACY:</span>
                        <span className="text-emerald-400 font-bold">{client.birthTimeAccuracy || "Exact"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono text-[11px]">
                        <span className="text-slate-400">BIRTH COORDINATES:</span>
                        <span className="text-slate-200">
                          {client.birthLatitude !== undefined ? `${client.birthLatitude.toFixed(4)}° N, ${client.birthLongitude?.toFixed(4)}° E` : "Not Calibrated"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Vastu Spatial Summary */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      3. Vastu Spatial Core Summary
                    </h2>
                    {hasVastu ? (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        A total of {clientProperties.length} properties are registered. Spatial calibrations show a Vastu alignment score of <span className="text-emerald-400 font-bold font-mono">{vastuScore}%</span>. Imbalances are located in the North-East Ishan zone of the structure, disrupting cognitive energy flow and financial reserves. Recalibration of coordinates via helix elements is recommended.
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No spatial property floor plans mapped for this client dossier. Run the Vastu Studio module to proceed.</p>
                    )}
                  </div>

                  {/* 4. Numerology Vibrations */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      4. Numerology Vibration Matrix
                    </h2>
                    {numResult ? (
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-400">
                          Numerological vibration calculations map a core compatibility alignment of <span className="text-amber-400 font-bold font-mono">{numerologyScore}%</span>.
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-2 bg-white border border-slate-850 rounded">
                            <span className="text-[9px] font-mono text-slate-400 block">LIFE PATH NUMBER</span>
                            <span className="text-sm font-mono font-bold text-amber-400">{numResult.lifePath.value}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-850 rounded">
                            <span className="text-[9px] font-mono text-slate-400 block">DESTINY NUMBER</span>
                            <span className="text-sm font-mono font-bold text-amber-400">{numResult.destiny.value}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-850 rounded">
                            <span className="text-[9px] font-mono text-slate-400 block">SOUL URGE NUMBER</span>
                            <span className="text-sm font-mono font-bold text-amber-400">{numResult.soulUrge.value}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No birth date or name logged to run numerology calculations.</p>
                    )}
                  </div>

                  {/* 5. Lal Kitab Planetary Kundli */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      5. Lal Kitab Planetary Kundli Map
                    </h2>
                    {lkResult ? (
                      <div className="space-y-2 text-xs text-slate-400">
                        <p>
                          Lal Kitab Tehwa charts derived from the geocentered coordinates map the ascendant as <span className="text-rose-400 font-bold">{lkResult.birthDetails.ascendant}</span> with a planetary strength quotient of <span className="text-rose-400 font-bold font-mono">{lalkitabScore}%</span>.
                        </p>
                        <div className="p-3 bg-white border border-slate-850 rounded font-mono text-[10px] grid grid-cols-3 gap-2">
                          {lkResult.planets.map(p => (
                            <div key={p.name} className="flex justify-between border-b border-slate-950/50 py-0.5">
                              <span className="text-slate-400">{p.name.toUpperCase()}:</span>
                              <span className="text-slate-200">H{p.house} ({p.state})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Birth registration details incomplete. run Lal Kitab chart to resolve celestial houses.</p>
                    )}
                  </div>

                  {/* 6. Unified Recommendations and Action Plan */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      6. Unified Remedial Action Plan
                    </h2>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                      {remediesList.map(r => getLocalizedRecommendation(r, "English")).map(r => (
                        <li key={r.id}>
                          <span className="text-slate-900 font-semibold uppercase font-mono text-[10px] mr-1">[{r.module}]</span>
                          {r.title} - Remedy: <span className="text-emerald-300">{r.remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ) : (
                // Hindi script
                <div className="space-y-6 font-sans">
                  {/* Report Header logo */}
                  <div className="text-center border-b border-slate-200 pb-6 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase font-sans">
                      उर्जाफ्लक्स शास्त्र सम्मत प्रतिवेदन
                    </h1>
                    <p className="text-xs text-emerald-400 font-mono tracking-widest uppercase">
                      एकीकृत वास्तु, अंकशास्त्र और लाल किताब विश्लेषण डोजियर
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      प्रणाली आईडी: {client.id} | संकलित तिथि: {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  {/* 1. Executive Summary */}
                  <div className="space-y-2 text-right">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 text-left">
                      1. कार्यकारी सारांश (Executive Summary)
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed text-left font-sans">
                      यह शास्त्र-सम्मत प्रतिवेदन ग्राहक <span className="text-slate-900 font-bold">{client.name}</span> के लिए संपूर्ण ब्रह्मांडीय खाका प्रदान करता है। मयमतम के नियमों, अंक ज्योतिष की तरंगों और लाल किताब की ग्रहों की दशाओं को जोड़कर समग्र सामंजस्य स्कोर <span className="text-emerald-400 font-bold font-mono text-xs">{overallScore}%</span> निर्धारित किया गया है।
                    </p>
                  </div>

                  {/* 2. Birth Profile SSoT */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      2. जन्म विवरण (Single Source of Truth)
                    </h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-left">
                      <div className="flex justify-between py-1 border-b border-slate-200/60 font-sans text-[11px]">
                        <span className="text-slate-400">पूरा नाम (Full Name):</span>
                        <span className="text-slate-200">{client.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 font-sans text-[11px]">
                        <span className="text-slate-400">जन्म तिथि (DOB):</span>
                        <span className="text-slate-200">{client.dob}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 font-sans text-[11px]">
                        <span className="text-slate-400">जन्म समय (Birth Time):</span>
                        <span className="text-slate-200">{client.birthTime}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 font-sans text-[11px]">
                        <span className="text-slate-400">जन्म स्थान (Place):</span>
                        <span className="text-slate-200">{client.birthPlace}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Vastu Spatial Summary */}
                  <div className="space-y-2 text-left">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      3. वास्तु विश्लेषण (Vastu Spatial Summary)
                    </h2>
                    {hasVastu ? (
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        कुल {clientProperties.length} संपत्ति पंजीकृत हैं। वास्तु संरेखण स्कोर <span className="text-emerald-400 font-bold font-mono">{vastuScore}%</span> है। ईशान कोण (उत्तर-पूर्व) क्षेत्र में दोष हैं, जिसके समाधान के लिए तांबे के पिरामिड स्थापना की सलाह दी जाती है।
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">इस ग्राहक के लिए कोई वास्तु संपत्ति मानचित्र उपलब्ध नहीं है।</p>
                    )}
                  </div>

                  {/* 4. Numerology Vibrations */}
                  <div className="space-y-2 text-left">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      4. अंकज्योतिष विवरण (Numerology Matrix)
                    </h2>
                    {numResult ? (
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-400 font-sans">
                          अंक ज्योतिष के अनुसार मुख्य अनुकूलता संरेखण स्कोर <span className="text-amber-400 font-bold font-mono">{numerologyScore}%</span> है।
                        </p>
                        <div className="grid grid-cols-3 gap-3 text-left">
                          <div className="p-2 bg-white border border-slate-850 rounded">
                            <span className="text-[9px] font-sans text-slate-400 block">मूलांक (Life Path)</span>
                            <span className="text-sm font-mono font-bold text-amber-400">{numResult.lifePath.value}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-850 rounded">
                            <span className="text-[9px] font-sans text-slate-400 block">भाग्यांक (Destiny)</span>
                            <span className="text-sm font-mono font-bold text-amber-400">{numResult.destiny.value}</span>
                          </div>
                          <div className="p-2 bg-white border border-slate-850 rounded">
                            <span className="text-[9px] font-sans text-slate-400 block">नामांक (Expression)</span>
                            <span className="text-sm font-mono font-bold text-amber-400">{numResult.expression.value}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">अंक ज्योतिष विश्लेषण उपलब्ध नहीं है।</p>
                    )}
                  </div>

                  {/* 5. Lal Kitab Planetary Kundli */}
                  <div className="space-y-2 text-left">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      5. लाल किताब कुंडली (Lal Kitab Kundli Map)
                    </h2>
                    {lkResult ? (
                      <div className="space-y-2 text-xs text-slate-400">
                        <p className="font-sans">
                          लाल किताब चार्ट के अनुसार लग्न <span className="text-rose-400 font-bold">{lkResult.birthDetails.ascendant}</span> है और ग्रहों की शक्ति भाग <span className="text-rose-400 font-bold font-mono">{lalkitabScore}%</span> है।
                        </p>
                        <div className="p-3 bg-white border border-slate-850 rounded font-mono text-[10px] grid grid-cols-3 gap-2">
                          {lkResult.planets.map(p => (
                            <div key={p.name} className="flex justify-between border-b border-slate-950/50 py-0.5">
                              <span className="text-slate-400">{p.name.toUpperCase()}:</span>
                              <span className="text-slate-200">H{p.house} ({p.state})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">जन्म रिकॉर्ड अपूर्ण है। लाल किताब चार्ट नहीं बनाया जा सका।</p>
                    )}
                  </div>

                  {/* 6. Action Plan */}
                  <div className="space-y-2 text-left">
                    <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                      6. एकीकृत उपाय योजना (Remedial Action Plan)
                    </h2>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 font-sans">
                      {remediesList.map(r => getLocalizedRecommendation(r, "Hindi")).map(r => (
                        <li key={r.id}>
                          <span className="text-slate-900 font-semibold font-mono text-[10px] mr-1">[{r.module}]</span>
                          {r.title} - उपाय: <span className="text-emerald-300">{r.remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-slate-850 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-400 hover:text-slate-900 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                CLOSE PREVIEW
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                PRINT / DOWNLOAD PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UnifiedDashboard;
