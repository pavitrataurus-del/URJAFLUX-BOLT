import React, { useState } from "react";
import { 
  Building2, 
  UserPlus, 
  FolderPlus, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Key, 
  Layers, 
  Database, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Server
} from "lucide-react";
import { OrganizationProfile, TenantProvisioningRecord } from "../../types/customerLifecycle";
import { INITIAL_ORGS, INITIAL_TENANTS } from "../../services/customer_lifecycle/customerLifecycleService";

export const OnboardingWizardPanel: React.FC = () => {
  const [orgs, setOrgs] = useState<OrganizationProfile[]>(INITIAL_ORGS);
  const [tenants, setTenants] = useState<TenantProvisioningRecord[]>(INITIAL_TENANTS);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [formCompany, setFormCompany] = useState("");
  const [formIndustry, setFormIndustry] = useState("Renewables & Energy");
  const [formSize, setFormSize] = useState("500 - 1,000 Employees");
  const [formAdminName, setFormAdminName] = useState("");
  const [formAdminEmail, setFormAdminEmail] = useState("");
  const [formWorkspaceName, setFormWorkspaceName] = useState("");
  const [formTemplate, setFormTemplate] = useState<OrganizationProfile["sampleProjectTemplate"]>("SMART_BUILDING");
  const [formPolicy, setFormPolicy] = useState<OrganizationProfile["defaultSecurityPolicy"]>("STRICT_RBAC");
  const [formStorageGb, setFormStorageGb] = useState<number>(500);
  const [formIsolation, setFormIsolation] = useState<TenantProvisioningRecord["databaseIsolationType"]>("SCHEMA_ISOLATED");

  const [isProvisioning, setIsProvisioning] = useState(false);
  const [activeTab, setActiveTab] = useState<"WIZARD" | "ORGS_LIST" | "TENANTS_LIST">("WIZARD");

  const handleCreateOrganizationAndProvision = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      const newOrgId = `org-${Date.now().toString(36)}`;
      const newTenantId = `tenant-prod-${Math.floor(Math.random() * 900 + 100)}`;
      const newApiKey = `uf_live_sec_${Math.random().toString(36).substring(2, 18)}${Date.now()}`;

      const newOrg: OrganizationProfile = {
        id: newOrgId,
        companyName: formCompany || "Enterprise Client Corp",
        industry: formIndustry,
        size: formSize,
        primaryAdminEmail: formAdminEmail || "admin@enterprise.com",
        primaryAdminName: formAdminName || "Enterprise Admin",
        country: "Global",
        defaultTimezone: "UTC",
        initialWorkspaceName: formWorkspaceName || "HQ Digital Twin",
        sampleProjectTemplate: formTemplate,
        defaultSecurityPolicy: formPolicy,
        createdAt: new Date().toISOString(),
        status: "PROVISIONED"
      };

      const newTenant: TenantProvisioningRecord = {
        tenantId: newTenantId,
        orgId: newOrgId,
        storageQuotaGb: formStorageGb,
        allocatedStorageGb: 15, // initial sample projects
        databaseIsolationType: formIsolation,
        roleTemplates: ["SUPER_ADMIN", "ENGINEER", "ANALYST"],
        defaultPermissions: ["READ_TWIN", "WRITE_CAD", "SIMULATE_VASTU"],
        apiKey: newApiKey,
        billingStatus: "ACTIVE",
        provisionedAt: new Date().toISOString()
      };

      setOrgs(prev => [newOrg, ...prev]);
      setTenants(prev => [newTenant, ...prev]);
      setIsProvisioning(false);
      setWizardStep(4); // Success step
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("WIZARD")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "WIZARD"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Onboarding Setup Wizard</span>
          </button>
          <button
            onClick={() => setActiveTab("ORGS_LIST")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "ORGS_LIST"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Provisioned Organizations ({orgs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("TENANTS_LIST")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "TENANTS_LIST"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Isolated Tenant Storage ({tenants.length})</span>
          </button>
        </div>

        <div className="text-xs font-mono text-emerald-400 flex items-center gap-2 pr-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero Touch Automated Provisioning</span>
        </div>
      </div>

      {/* WIZARD VIEW */}
      {activeTab === "WIZARD" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {/* Wizard Progress Header */}
          <div className="grid grid-cols-4 gap-2 border-b border-slate-800 pb-6">
            {[
              { num: 1, label: "Company Profile", icon: Building2 },
              { num: 2, label: "Admin & Security", icon: UserPlus },
              { num: 3, label: "Twin & Storage Setup", icon: Database },
              { num: 4, label: "Provisioning Complete", icon: CheckCircle2 }
            ].map(step => {
              const Icon = step.icon;
              const isCurrent = wizardStep === step.num;
              const isDone = wizardStep > step.num;
              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    isCurrent
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold"
                      : isDone
                      ? "bg-slate-800/80 border-slate-700 text-slate-300"
                      : "bg-slate-950 border-slate-850 text-slate-500"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                      isCurrent
                        ? "bg-emerald-500 text-slate-950"
                        : isDone
                        ? "bg-emerald-600/30 text-emerald-300"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isDone ? "✓" : step.num}
                  </div>
                  <div>
                    <div className="text-xs font-mono">{step.label}</div>
                    <div className="text-[10px] text-slate-400">
                      {isCurrent ? "In Progress" : isDone ? "Validated" : "Pending"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* STEP 1: COMPANY PROFILE */}
          {wizardStep === 1 && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span>Step 1: Enterprise Organization Details</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter primary organization identity for multi-tenant isolation and domain mapping.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Company / Organization Name</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={e => setFormCompany(e.target.value)}
                    placeholder="e.g., Siemens Energy Infrastructure"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Industry Sector</label>
                  <select
                    value={formIndustry}
                    onChange={e => setFormIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Renewables & Energy">Renewables & Energy</option>
                    <option value="Smart Buildings & Commercial Estate">Smart Buildings & Real Estate</option>
                    <option value="Industrial Process & Plant Twin">Industrial Process & Plant Twin</option>
                    <option value="Smart Cities & Urban Infrastructure">Smart Cities & Urban Infrastructure</option>
                    <option value="Defense & Aerospace">Defense & Aerospace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Organization Size</label>
                  <select
                    value={formSize}
                    onChange={e => setFormSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="100 - 500 Employees">100 - 500 Employees</option>
                    <option value="500 - 1,000 Employees">500 - 1,000 Employees</option>
                    <option value="1,000 - 5,000 Employees">1,000 - 5,000 Employees</option>
                    <option value="5,000+ Enterprise">5,000+ Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Initial Workspace Title</label>
                  <input
                    type="text"
                    value={formWorkspaceName}
                    onChange={e => setFormWorkspaceName(e.target.value)}
                    placeholder="e.g., Global Plant Digital Twin OS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
                >
                  <span>Next: Admin & Security</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ADMIN & SECURITY */}
          {wizardStep === 2 && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <span>Step 2: Admin Account & Default Security Policies</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure root enterprise super admin credentials and strict governance rules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Primary Admin Full Name</label>
                  <input
                    type="text"
                    value={formAdminName}
                    onChange={e => setFormAdminName(e.target.value)}
                    placeholder="e.g., Dr. Ananya Varma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Primary Admin Corporate Email</label>
                  <input
                    type="email"
                    value={formAdminEmail}
                    onChange={e => setFormAdminEmail(e.target.value)}
                    placeholder="e.g., admin@siemens-energy.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-mono text-slate-300 mb-1">Default Security Policy</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "STRICT_RBAC", label: "Strict RBAC + SSO Enforced", desc: "Requires SAML 2.0 / OAuth2 with granular resource tags" },
                      { id: "ENTERPRISE_LTS", label: "Enterprise LTS Compliance", desc: "Long-Term Support with audited change logs" },
                      { id: "FEDRAMP_COMPLIANT", label: "FedRAMP High Isolation", desc: "FIPS 140-3 cryptography & zero public endpoints" },
                      { id: "AIRGAPPED", label: "Air-gapped On-Premises", desc: "Zero outbound network connections required" }
                    ].map(p => (
                      <div
                        key={p.id}
                        onClick={() => setFormPolicy(p.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          formPolicy === p.id
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-200"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="font-mono text-xs font-bold text-white">{p.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
                >
                  <span>Next: Twin & Storage Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TWIN & STORAGE PROVISIONING */}
          {wizardStep === 3 && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span>Step 3: Digital Twin & Tenant Storage Allocation</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Allocate encrypted NVMe storage quota, select initial project templates, and seed database schemas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Storage Allocation Quota</label>
                  <select
                    value={formStorageGb}
                    onChange={e => setFormStorageGb(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={250}>250 GB Encrypted SSD</option>
                    <option value={500}>500 GB High IOPS NVMe</option>
                    <option value={1000}>1,000 GB (1 TB) Enterprise Twin Volume</option>
                    <option value={5000}>5,000 GB (5 TB) Multi-Region Distributed Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Database Isolation Type</label>
                  <select
                    value={formIsolation}
                    onChange={e => setFormIsolation(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SCHEMA_ISOLATED">Schema-Level Multi-Tenant Isolation</option>
                    <option value="DEDICATED_INSTANCE">Dedicated Database Instance</option>
                    <option value="AIRGAPPED_NODE">Air-Gapped Sovereign Node</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-mono text-slate-300 mb-1">Sample Project Seed Template</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "INDUSTRIAL_PLANT", name: "Industrial Power Plant", icon: Cpu },
                      { id: "SMART_BUILDING", name: "Smart Commercial Tower", icon: Building2 },
                      { id: "URBAN_INFRA", name: "Urban Smart District", icon: Layers }
                    ].map(t => {
                      const Icon = t.icon;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setFormTemplate(t.id as any)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                            formTemplate === t.id
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-200"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <Icon className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span className="font-mono text-xs font-bold text-white">{t.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={isProvisioning}
                  onClick={handleCreateOrganizationAndProvision}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProvisioning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Provisioning Tenant Resources...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Execute Onboarding & Provision Tenant</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROVISIONING COMPLETE SUCCESS */}
          {wizardStep === 4 && (
            <div className="space-y-6 text-center py-8 max-w-xl mx-auto">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white font-mono">Enterprise Tenant Provisioned Successfully!</h2>
                <p className="text-xs text-slate-300 mt-2">
                  Organization <span className="text-emerald-400 font-mono font-bold">{formCompany || "Enterprise Client"}</span> is initialized with sample Digital Twin assets, knowledge vectors, and security policies.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                  <span>Provisioned Tenant ID:</span>
                  <span className="text-emerald-400 font-bold">{tenants[0]?.tenantId}</span>
                </div>
                <div className="flex justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                  <span>Generated Enterprise API Key:</span>
                  <span className="text-amber-300 font-bold">{tenants[0]?.apiKey.substring(0, 16)}...</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Storage Volume Quota:</span>
                  <span className="text-white font-bold">{formStorageGb} GB NVMe</span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setFormCompany("");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold cursor-pointer"
                >
                  Onboard Another Customer
                </button>
                <button
                  onClick={() => setActiveTab("TENANTS_LIST")}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer"
                >
                  View Tenant Operations
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORGANIZATIONS LIST VIEW */}
      {activeTab === "ORGS_LIST" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgs.map(org => (
              <div key={org.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                      {org.status}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5 font-mono">{org.companyName}</h3>
                    <p className="text-xs text-slate-400">{org.industry} • {org.size}</p>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-400">
                    <div>{org.country}</div>
                    <div className="text-emerald-400">{org.defaultTimezone}</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Super Admin:</span>
                    <span className="text-slate-200 font-bold">{org.primaryAdminName} ({org.primaryAdminEmail})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Initial Workspace:</span>
                    <span className="text-emerald-400">{org.initialWorkspaceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security Policy:</span>
                    <span className="text-amber-300">{org.defaultSecurityPolicy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TENANTS LIST VIEW */}
      {activeTab === "TENANTS_LIST" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map(ten => (
              <div key={ten.tenantId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-mono text-emerald-400 font-bold">{ten.tenantId}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Isolated Schema DB • {ten.databaseIsolationType}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                    {ten.billingStatus}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Storage Usage ({ten.allocatedStorageGb} / {ten.storageQuotaGb} GB):</span>
                    <span className="text-white font-bold">{Math.round((ten.allocatedStorageGb / ten.storageQuotaGb) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(ten.allocatedStorageGb / ten.storageQuotaGb) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      API Key:
                    </span>
                    <span className="text-amber-300 font-bold">{ten.apiKey.substring(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800/60">
                    <span>Role Templates:</span>
                    <span className="text-slate-200">{ten.roleTemplates.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
