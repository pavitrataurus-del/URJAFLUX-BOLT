import React, { useState } from "react";
import { 
  Sparkles, 
  Building2, 
  Key, 
  RefreshCw, 
  Activity, 
  GraduationCap, 
  LifeBuoy, 
  Palette, 
  Server, 
  CreditCard, 
  Award, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";
import { OnboardingWizardPanel } from "./OnboardingWizardPanel";
import { LicenseAndDesktopPanel } from "./LicenseAndDesktopPanel";
import { UpdateAndReleaseCenterPanel } from "./UpdateAndReleaseCenterPanel";
import { CustomerSuccessDashboard } from "./CustomerSuccessDashboard";
import { InAppTrainingCenter } from "./InAppTrainingCenter";
import { SupportAndDiagnosticsPanel } from "./SupportAndDiagnosticsPanel";
import { WhiteLabelAndBrandingPanel } from "./WhiteLabelAndBrandingPanel";
import { DeploymentCenterPanel } from "./DeploymentCenterPanel";
import { CommercialOperationsPanel } from "./CommercialOperationsPanel";
import { GaLifecycleCertificationReportView } from "./GaLifecycleCertificationReportView";

export const CustomerLifecycleWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "ONBOARDING" | "LICENSE_DESKTOP" | "UPDATES_RELEASE" | "CUSTOMER_SUCCESS" | "TRAINING" | "SUPPORT" | "WHITE_LABEL" | "DEPLOYMENT" | "COMMERCIAL_OPS" | "CERTIFICATION"
  >("ONBOARDING");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <LifeBuoy className="w-4 h-4" />
            <span>URJAFLUX AI OS • CUSTOMER LIFECYCLE & COMMERCIAL DISTRIBUTION</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
            Customer Lifecycle Operations OS
          </h1>
          <p className="text-xs font-sans text-slate-400 mt-1">
            End-to-End Enterprise Customer Lifecycle: Onboarding, Tenant Provisioning, Licenses, Desktop Distribution, Customer Success, Diagnostics & Commercial Ops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>COMMERCIAL GA v2.5.0 READY</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {[
          { id: "ONBOARDING", label: "1 & 2. Onboarding & Tenants", icon: Building2 },
          { id: "LICENSE_DESKTOP", label: "3 & 4. Licenses & Desktop", icon: Key },
          { id: "UPDATES_RELEASE", label: "5 & 15. Updates & Releases", icon: RefreshCw },
          { id: "CUSTOMER_SUCCESS", label: "6 & 14. Customer Success", icon: Activity },
          { id: "TRAINING", label: "7. In-App Training", icon: GraduationCap },
          { id: "SUPPORT", label: "8 & 10. Support & Feedback", icon: LifeBuoy },
          { id: "WHITE_LABEL", label: "11. White Label Branding", icon: Palette },
          { id: "DEPLOYMENT", label: "12. Deployment Center", icon: Server },
          { id: "COMMERCIAL_OPS", label: "13 & 9. Commercial & Privacy", icon: CreditCard },
          { id: "CERTIFICATION", label: "GA Lifecycle Certification", icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Panel View */}
      <div className="pt-2">
        {activeTab === "ONBOARDING" && <OnboardingWizardPanel />}
        {activeTab === "LICENSE_DESKTOP" && <LicenseAndDesktopPanel />}
        {activeTab === "UPDATES_RELEASE" && <UpdateAndReleaseCenterPanel />}
        {activeTab === "CUSTOMER_SUCCESS" && <CustomerSuccessDashboard />}
        {activeTab === "TRAINING" && <InAppTrainingCenter />}
        {activeTab === "SUPPORT" && <SupportAndDiagnosticsPanel />}
        {activeTab === "WHITE_LABEL" && <WhiteLabelAndBrandingPanel />}
        {activeTab === "DEPLOYMENT" && <DeploymentCenterPanel />}
        {activeTab === "COMMERCIAL_OPS" && <CommercialOperationsPanel />}
        {activeTab === "CERTIFICATION" && <GaLifecycleCertificationReportView />}
      </div>
    </div>
  );
};
