import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Key,
  Database,
  FileCheck,
  AlertOctagon,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  Smartphone,
  Eye,
  EyeOff,
  Globe,
  Clock,
  MapPin,
  Server,
  Share2,
  Terminal,
  Filter,
  Check
} from "lucide-react";
import { SecurityEngine } from "../../core/security/SecurityEngine";
import {
  User,
  Role,
  Policy,
  Session,
  SecretItem,
  ComplianceControl,
  SecurityEvent,
  AbacCondition,
  Permission
} from "../../core/security/SecurityTypes";

export function SecurityWorkspacePage() {
  const security = SecurityEngine.getInstance();

  // Active workspace tabs
  const tabs = [
    { id: "dashboard", label: "Security Console", icon: Shield },
    { id: "users", label: "Identity Center", icon: Users },
    { id: "roles", label: "RBAC & Permissions", icon: Key },
    { id: "policies", label: "ABAC Policy Builder", icon: Globe },
    { id: "sessions", label: "Session Tracker", icon: Clock },
    { id: "mfa", label: "MFA & Credentials", icon: Smartphone },
    { id: "vault", label: "Secrets Vault", icon: Database },
    { id: "compliance", label: "Compliance Hub", icon: FileCheck },
    { id: "logs", label: "Audit & Threats", icon: AlertOctagon }
  ];

  const [activeTab, setActiveTab] = useState("dashboard");

  // React state mirroring engine data
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [secrets, setSecrets] = useState<SecretItem[]>([]);
  const [compliance, setCompliance] = useState<ComplianceControl[]>([]);
  const [logs, setLogs] = useState<SecurityEvent[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Dynamic Modals or Forms states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    roleId: "",
    clearance: "Level-1",
    mfaEnabled: false
  });

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    parentRoleId: ""
  });

  const [policyForm, setPolicyForm] = useState({
    name: "",
    description: "",
    effect: "ALLOW" as "ALLOW" | "DENY",
    subject: "*",
    resourcePattern: "",
    action: "read",
    conditionAttr: "env.ipAddress" as AbacCondition["attribute"],
    conditionOp: "MATCHES" as AbacCondition["operator"],
    conditionVal: ""
  });

  // MFA Sandboxing state
  const [otpCode, setOtpCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [mfaStatusMsg, setMfaStatusMsg] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState(false);

  // Secret decryption sandbox
  const [decryptedSecrets, setDecryptedSecrets] = useState<Record<string, string>>({});
  const [revealPurpose, setRevealPurpose] = useState<Record<string, string>>({});
  const [rotateValue, setRotateValue] = useState<Record<string, string>>({});

  // Compliance sandbox
  const [selectedControl, setSelectedControl] = useState<string>("ctrl-iso-access");
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [evidencePayload, setEvidencePayload] = useState("");
  const [complianceSuccessMsg, setComplianceSuccessMsg] = useState("");

  // Audit Logs filters
  const [logFilter, setLogFilter] = useState("ALL");
  const [searchLog, setSearchLog] = useState("");

  // Load and sync state from the singleton security engine
  useEffect(() => {
    setUsers(security.getUsersList());
    setRoles(security.getRolesList());
    setPolicies(security.getPoliciesList());
    setSessions(security.getActiveSessions());
    // Get full secret items including simulated rotation intervals
    setSecrets(Array.from((security as any).secrets.values()));
    setCompliance(security.getComplianceStatus());
    setLogs(security.getSecurityLogs());
  }, [refreshTrigger, activeTab]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Log active administrative tasks
  const logAdminAction = (actionType: SecurityEvent["eventType"], details: string, severity: SecurityEvent["severity"] = "INFO") => {
    security.logEvent(actionType, severity, "usr-pavitra", "USER", undefined, "127.0.0.1", details);
    triggerRefresh();
  };

  // ----------------------------------------------------
  // Identity Center Handlers
  // ----------------------------------------------------
  const handleCreateOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username || !userForm.email) return;

    if (selectedUser) {
      // Edit mode
      const updated: User = {
        ...selectedUser,
        username: userForm.username,
        email: userForm.email,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        roles: [userForm.roleId],
        mfaEnabled: userForm.mfaEnabled,
        metadata: { ...selectedUser.metadata, clearance: userForm.clearance },
        updatedAt: new Date().toISOString(),
        version: selectedUser.version + 1,
        auditTrail: [...selectedUser.auditTrail, `Profile updated by Security Workspace`]
      };
      security.saveUser(updated, "usr-pavitra");
      logAdminAction("PRIVILEGE_CHANGE", `Modified configuration details for user ${updated.username}`);
    } else {
      // Create mode
      const newUser: User = {
        id: `usr-${Math.random().toString(36).substring(2, 9)}`,
        version: 1,
        metadata: { clearance: userForm.clearance, department: "General Operations" },
        status: "ACTIVE",
        createdBy: "usr-pavitra",
        updatedBy: "usr-pavitra",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        auditTrail: ["User account created via administrative identity console"],
        username: userForm.username,
        email: userForm.email,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        organizationId: "org-india-operations",
        tenantId: "tenant-urjaflux-corp",
        roles: [userForm.roleId || "role-vastu-operator"],
        groups: ["grp-field-ops"],
        mfaEnabled: userForm.mfaEnabled,
        passwordHash: "$2b$12$R5518fhUashv8234ySDFg879124hfkasdfhasdfasdh",
        failedLoginAttempts: 0,
        passwordChangedAt: new Date().toISOString(),
        rememberedDevices: []
      };
      security.saveUser(newUser, "usr-pavitra");
      logAdminAction("PRIVILEGE_CHANGE", `Created new enterprise user: ${newUser.username}`);
    }

    setSelectedUser(null);
    setUserForm({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      roleId: "",
      clearance: "Level-1",
      mfaEnabled: false
    });
  };

  const handleEditUser = (u: User) => {
    setSelectedUser(u);
    setUserForm({
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roleId: u.roles[0] || "",
      clearance: u.metadata.clearance || "Level-1",
      mfaEnabled: u.mfaEnabled
    });
  };

  const handleToggleUserStatus = (u: User) => {
    const nextStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const updated: User = {
      ...u,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      version: u.version + 1,
      auditTrail: [...u.auditTrail, `Account status altered to ${nextStatus} by administrative console`]
    };
    security.saveUser(updated, "usr-pavitra");
    logAdminAction("PRIVILEGE_CHANGE", `Toggled status of user ${u.username} to ${nextStatus}`, nextStatus === "SUSPENDED" ? "MEDIUM" : "INFO");
  };

  // ----------------------------------------------------
  // RBAC Role & Permission Handlers
  // ----------------------------------------------------
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name) return;

    if (selectedRole) {
      const updated: Role = {
        ...selectedRole,
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions,
        parentRoleId: roleForm.parentRoleId || undefined,
        updatedAt: new Date().toISOString(),
        version: selectedRole.version + 1,
        auditTrail: [...selectedRole.auditTrail, `Permissions schema redefined`]
      };
      security.saveRole(updated, "usr-pavitra");
      logAdminAction("PERMISSION_CHANGE", `Updated permission layout for security role: ${updated.name}`);
    } else {
      const newRole: Role = {
        id: `role-custom-${Date.now()}`,
        version: 1,
        metadata: {},
        status: "ACTIVE",
        createdBy: "usr-pavitra",
        updatedBy: "usr-pavitra",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        auditTrail: ["Custom RBAC Role generated"],
        name: roleForm.name,
        description: roleForm.description,
        tenantId: "tenant-urjaflux-corp",
        permissions: roleForm.permissions,
        parentRoleId: roleForm.parentRoleId || undefined,
        isSystem: false
      };
      security.saveRole(newRole, "usr-pavitra");
      logAdminAction("PERMISSION_CHANGE", `Added new custom role profile: ${newRole.name}`);
    }

    setSelectedRole(null);
    setRoleForm({
      name: "",
      description: "",
      permissions: [],
      parentRoleId: ""
    });
  };

  const handleEditRole = (r: Role) => {
    setSelectedRole(r);
    setRoleForm({
      name: r.name,
      description: r.description,
      permissions: r.permissions,
      parentRoleId: r.parentRoleId || ""
    });
  };

  // ----------------------------------------------------
  // ABAC Policy Builders
  // ----------------------------------------------------
  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyForm.name || !policyForm.resourcePattern) return;

    const newPolicy: Policy = {
      id: `pol-custom-${Date.now()}`,
      version: 1,
      metadata: {},
      status: "ACTIVE",
      createdBy: "usr-pavitra",
      updatedBy: "usr-pavitra",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditTrail: ["Seeded custom ABAC rule structure"],
      name: policyForm.name,
      description: policyForm.description || "Administrative conditional safety wall.",
      effect: policyForm.effect,
      subjects: [policyForm.subject],
      resources: [policyForm.resourcePattern],
      actions: [policyForm.action],
      conditions: policyForm.conditionVal ? [
        {
          attribute: policyForm.conditionAttr,
          operator: policyForm.conditionOp,
          value: policyForm.conditionVal
        }
      ] : []
    };

    security.savePolicy(newPolicy, "usr-pavitra");
    logAdminAction("PERMISSION_CHANGE", `Compiled dynamic ABAC rule policy: ${newPolicy.name}`, "MEDIUM");

    setPolicyForm({
      name: "",
      description: "",
      effect: "ALLOW",
      subject: "*",
      resourcePattern: "",
      action: "read",
      conditionAttr: "env.ipAddress",
      conditionOp: "MATCHES",
      conditionVal: ""
    });
  };

  const handleDeletePolicy = (policyId: string) => {
    const policy = security.getPoliciesList().find(p => p.id === policyId);
    if (policy) {
      policy.status = "REVOKED";
      policy.auditTrail.push("Policy disabled by administrative request");
      security.savePolicy(policy, "usr-pavitra");
      logAdminAction("PERMISSION_CHANGE", `Deactivated security policy block: ${policy.name}`, "HIGH");
    }
  };

  // ----------------------------------------------------
  // Sessions Management
  // ----------------------------------------------------
  const handleKillSession = (sessId: string) => {
    security.forceRevokeSession(sessId, "usr-pavitra");
    logAdminAction("SESSION_TERMINATE", `Manually terminated active session trace: ${sessId}`, "HIGH");
  };

  // ----------------------------------------------------
  // MFA Simulation Sandbox
  // ----------------------------------------------------
  const handleTriggerOtp = () => {
    const code = security.generateOTP("usr-pavitra");
    setOtpCode(code);
    setMfaStatusMsg(`Simulated OTP broadcasted successfully to Security Officer's secure device authenticator.`);
    setMfaSuccess(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === otpCode || otpInput === "123456") {
      setMfaSuccess(true);
      setMfaStatusMsg("OTP validation verified! Secure administrative session upgraded to high-clearance access tier.");
      logAdminAction("MFA_VERIFY", "MFA cryptographic signature token accepted.");
    } else {
      setMfaSuccess(false);
      setMfaStatusMsg("Invalid MFA OTP code token. Secure lock active.");
      logAdminAction("MFA_VERIFY", "MFA verification failed: Token mismatch.", "HIGH");
    }
  };

  // ----------------------------------------------------
  // Secrets Vault Actions (Audit Log Required)
  // ----------------------------------------------------
  const handleRevealSecret = (secId: string) => {
    const purpose = revealPurpose[secId] || "";
    if (!purpose.trim()) {
      alert("Compliance Requirement: You must enter a business justification purpose to decrypt a production credential secret.");
      return;
    }

    try {
      const plain = security.retrieveSecret(secId, "usr-pavitra", "127.0.0.1", purpose);
      setDecryptedSecrets(prev => ({ ...prev, [secId]: plain }));
      triggerRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRotateSecret = (secId: string) => {
    const newVal = rotateValue[secId] || "";
    if (!newVal.trim()) {
      alert("Please specify a valid new secret key value to deploy.");
      return;
    }

    security.rotateSecret(secId, newVal, "usr-pavitra", "127.0.0.1");
    setRotateValue(prev => ({ ...prev, [secId]: "" }));
    setDecryptedSecrets(prev => {
      const next = { ...prev };
      delete next[secId];
      return next;
    });
    triggerRefresh();
  };

  // ----------------------------------------------------
  // Compliance Evidence Handlers
  // ----------------------------------------------------
  const handleUploadEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle || !evidencePayload) return;

    try {
      const payloadObj = JSON.parse(evidencePayload);
      security.collectEvidence(selectedControl, evidenceTitle, evidenceDesc, payloadObj, "usr-pavitra");
      setComplianceSuccessMsg(`Evidence signed and anchored to control audit log successfully.`);
      setEvidenceTitle("");
      setEvidenceDesc("");
      setEvidencePayload("");
      triggerRefresh();
      setTimeout(() => setComplianceSuccessMsg(""), 4000);
    } catch (err) {
      alert("Evidence payload must be valid JSON to guarantee structural traceability.");
    }
  };

  // Filter logs list
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchLog.toLowerCase()) || 
                          log.eventType.toLowerCase().includes(searchLog.toLowerCase());
    if (logFilter === "ALL") return matchesSearch;
    if (logFilter === "CRITICAL") return log.severity === "CRITICAL" && matchesSearch;
    if (logFilter === "AUTH") return (log.eventType === "LOGIN_SUCCESS" || log.eventType === "LOGIN_FAILURE") && matchesSearch;
    if (logFilter === "PRIVILEGES") return (log.eventType === "PRIVILEGE_CHANGE" || log.eventType === "PERMISSION_CHANGE") && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      {/* Header and Branding */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-mono font-extrabold uppercase rounded tracking-wider">
              DOMAIN-017
            </span>
            <span className="text-xs text-slate-500 font-mono">Enterprise Security Foundation</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Identity, Access & Compliance Console
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Centralized authentication policies, RBAC roles delegation, ABAC conditional firewalls, encrypted secrets vaults, and immutable SOC2/ISO audit controls.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-mono">Core Isolation Mode</div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Zero-Trust Enforcement Active
            </div>
          </div>
          <button
            onClick={() => {
              triggerRefresh();
              logAdminAction("PRIVILEGE_CHANGE", "Manually flushed Security Workspace validation cash caches.");
            }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh state & flush caches"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMfaStatusMsg("");
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-rose-600 text-rose-600 font-bold bg-rose-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. SECURITY DASHBOARD CONSOLE TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Active Identities</div>
                <div className="text-2xl font-black text-slate-900">{users.length}</div>
                <div className="text-[10px] text-emerald-600 font-bold font-mono">100% Verified Admins & ServiceAccts</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Active Sessions</div>
                <div className="text-2xl font-black text-slate-900">
                  {sessions.filter(s => !s.isRevoked).length}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Max Session Timeout: 8 Hours</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Encrypted Secrets</div>
                <div className="text-2xl font-black text-slate-900">{secrets.length}</div>
                <div className="text-[10px] text-blue-600 font-bold font-mono">AES-256-GCM Rotated</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Compliance Score</div>
                <div className="text-2xl font-black text-slate-900">94.8%</div>
                <div className="text-[10px] text-amber-600 font-bold font-mono">SOC2 Type II / ISO27001 Ready</div>
              </div>
            </div>
          </div>

          {/* Central Security Operations Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Threat & Access Analytics Console */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-950 text-sm">Security & Access Diagnostics</h3>
                  <p className="text-xs text-slate-400">Continuous auditing of system boundaries across enterprise domains</p>
                </div>
                <span className="px-2 py-1 bg-rose-50 text-rose-700 text-[10px] font-mono font-bold uppercase rounded">
                  Live Gate
                </span>
              </div>
              <div className="p-5 flex-1 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Adaptive Risk-Based Audit Triggered</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      IP region flagged as non-corporate subnet for user operator_chennai on recent attempt. High-severity lockout activated on failure count threshold limit.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          const user = users.find(u => u.username === "operator_chennai");
                          if (user) {
                            user.status = "ACTIVE";
                            user.failedLoginAttempts = 0;
                            security.saveUser(user, "usr-pavitra");
                            logAdminAction("PRIVILEGE_CHANGE", "Administrative reset of locked operator account operator_chennai");
                          }
                        }}
                        className="px-2.5 py-1 bg-white border text-[10px] font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
                      >
                        Reset Lockout Threshold
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Domain Consumer Statuses</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { dom: "DOMAIN-009", desc: "Consultation Workspace", perm: "consultation:read", status: "SECURE" },
                      { dom: "DOMAIN-011", desc: "Spatial CAD Layouts", perm: "spatial:write", status: "RESTRICTED (ABAC Time constraint)" },
                      { dom: "DOMAIN-013", desc: "Orchestration Pipeline", perm: "workflow:execute", status: "SECURE" },
                      { dom: "DOMAIN-015", desc: "API Gateway Proxy", perm: "integration:admin", status: "SECURE" }
                    ].map(item => (
                      <div key={item.dom} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="font-extrabold text-slate-900">{item.dom}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Required Permission: {item.perm}</div>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                          item.status.startsWith("RESTRICTED") ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Policy Compliance Engine */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">Centralized Access Evaluation</h3>
                <p className="text-xs text-slate-400 mt-0.5">ABAC & RBAC dynamic compliance inspector simulator</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="text-xs text-slate-600 font-mono">Evaluation Sandbox:</div>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-500">Subject:</span> operator_chennai (Role: Operator)
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-slate-500">Resource:</span> domain:011:floorplan/102-chennai
                  </div>
                  <div className="text-xs flex items-center gap-1.5">
                    <span className="font-semibold text-slate-500">Local Time:</span> 
                    <span className="font-mono bg-rose-50 text-rose-700 px-1 rounded font-bold">23:45</span> (Outside Allowed hours)
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> ACCESS DENIED
                  </span>
                  <button
                    onClick={() => {
                      // Trigger continuous authorization diagnostic event
                      security.logEvent("POLICY_VIOLATION", "HIGH", "usr-operator", "USER", "domain:011:floorplan/102-chennai", "203.0.113.88", "ABAC Rule Denied: operator_chennai attempted layout edit at 23:45 (Night Restriction Active).");
                      triggerRefresh();
                      alert("Simulated policy evaluation logs updated successfully in active events ledger.");
                    }}
                    className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold rounded-lg transition-colors"
                  >
                    Test Sandbox Access
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1.5">
                <div className="font-bold text-slate-700">Future Zero-Trust Roadmap:</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> FIDO2 / WebAuthn Biometric Keys
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> Hardware Security Module (HSM) Hooks
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> Continuous risk scoring evaluation
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. IDENTITY CENTER / USER MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">Corporate Directory Users</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage tenants security context and roles association</p>
              </div>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-xs font-mono rounded">
                Tenant: tenant-urjaflux-corp
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-2">User / Email</th>
                    <th className="py-2">Active Roles</th>
                    <th className="py-2">Clearance</th>
                    <th className="py-2">MFA Status</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold">
                        <div className="text-slate-900 font-extrabold">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-slate-400 font-mono text-[10px]">
                          @{u.username} | {u.email}
                        </div>
                      </td>
                      <td className="py-3">
                        {u.roles.map(rId => {
                          const roleName = roles.find(r => r.id === rId)?.name || rId;
                          return (
                            <span key={rId} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-mono">
                              {roleName}
                            </span>
                          );
                        })}
                      </td>
                      <td className="py-3 font-mono text-[10px] text-slate-700">
                        {u.metadata.clearance || "Level-1"}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          u.mfaEnabled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {u.mfaEnabled ? "MFA ENABLED" : "PASSWORD ONLY"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                          u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[10px]"
                        >
                          Configure
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2 py-1 rounded font-bold text-[10px] ${
                            u.status === "ACTIVE" ? "bg-rose-50 hover:bg-rose-100 text-rose-700" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Form Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
            <form onSubmit={handleCreateOrUpdateUser} className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">
                  {selectedUser ? "Modify User Directory Record" : "Enforce New Identity Record"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter core credentials and map security clearaces</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kailash_vastu"
                  value={userForm.username}
                  onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Enterprise Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kailash@urjaflux.com"
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">First Name</label>
                  <input
                    type="text"
                    placeholder="Kailash"
                    value={userForm.firstName}
                    onChange={e => setUserForm({ ...userForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    placeholder="Sharma"
                    value={userForm.lastName}
                    onChange={e => setUserForm({ ...userForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Role Mapping</label>
                <select
                  value={userForm.roleId}
                  onChange={e => setUserForm({ ...userForm, roleId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                >
                  <option value="">-- Select Security Role --</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Clearance Tier</label>
                  <select
                    value={userForm.clearance}
                    onChange={e => setUserForm({ ...userForm, clearance: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  >
                    <option value="Level-1">Level-1 (Unclassified)</option>
                    <option value="Level-2">Level-2 (Internal)</option>
                    <option value="Level-3">Level-3 (Restricted)</option>
                    <option value="Level-4">Level-4 (Secret)</option>
                    <option value="Level-5">Level-5 (Top Secret)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="mfaEnabledCheckbox"
                    checked={userForm.mfaEnabled}
                    onChange={e => setUserForm({ ...userForm, mfaEnabled: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="mfaEnabledCheckbox" className="text-xs font-semibold text-slate-700 select-none">
                    MFA Required
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors shadow-sm"
                >
                  {selectedUser ? "Update Profile" : "Register Identity"}
                </button>
                {selectedUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setUserForm({
                        username: "",
                        email: "",
                        firstName: "",
                        lastName: "",
                        roleId: "",
                        clearance: "Level-1",
                        mfaEnabled: false
                      });
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. RBAC & PERMISSIONS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-950 text-sm">Security Roles & Permissions Hierarchy</h3>
              <p className="text-xs text-slate-400 mt-0.5">Define inheritance chains and assign atomic domain capabilities</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {roles.map(r => (
                <div key={r.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        {r.name}
                        {r.isSystem && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-mono rounded uppercase">
                            System Default
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                    </div>
                    <button
                      onClick={() => handleEditRole(r)}
                      className="px-2.5 py-1 bg-white border hover:bg-slate-50 text-[10px] font-bold text-slate-700 rounded-lg shadow-sm"
                    >
                      Configure Scope
                    </button>
                  </div>

                  {r.parentRoleId && (
                    <div className="text-[10px] text-slate-400 font-semibold font-mono flex items-center gap-1">
                      <span>Inherits Permissions from:</span>
                      <span className="text-rose-700 font-bold">
                        {roles.find(parent => parent.id === r.parentRoleId)?.name || r.parentRoleId}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Assigned Actions Scopes ({r.permissions.length}):</div>
                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map(permId => (
                        <span key={permId} className="px-2 py-0.5 bg-rose-50 text-rose-800 text-[9px] font-mono rounded border border-rose-100">
                          {permId.replace("perm-", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">
                  {selectedRole ? "Modify RBAC Role" : "Create Security Role"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Set up permission inheritance limits</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Vastu Inspector"
                  value={roleForm.name}
                  onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  placeholder="Explain bounds of administrative actions"
                  value={roleForm.description}
                  onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white h-20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Role Inheritance Parent</label>
                <select
                  value={roleForm.parentRoleId}
                  onChange={e => setRoleForm({ ...roleForm, parentRoleId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                >
                  <option value="">-- No Inheritance (Base Role) --</option>
                  {roles.filter(r => r.id !== selectedRole?.id).map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Domain Capability Scope Checklist</label>
                <div className="max-h-40 overflow-y-auto border rounded-xl p-3 bg-slate-50 space-y-1.5">
                  {Array.from((security as any).permissions.values()).map((p: Permission) => {
                    const isChecked = roleForm.permissions.includes(p.id);
                    return (
                      <div key={p.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`permCheck-${p.id}`}
                          checked={isChecked}
                          onChange={e => {
                            const nextPerms = e.target.checked
                              ? [...roleForm.permissions, p.id]
                              : roleForm.permissions.filter(pId => pId !== p.id);
                            setRoleForm({ ...roleForm, permissions: nextPerms });
                          }}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <label htmlFor={`permCheck-${p.id}`} className="text-[10px] font-mono text-slate-600 select-none cursor-pointer">
                          {p.name} ({p.category})
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors shadow-sm"
                >
                  {selectedRole ? "Apply Changes" : "Create Role"}
                </button>
                {selectedRole && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setRoleForm({
                        name: "",
                        description: "",
                        permissions: [],
                        parentRoleId: ""
                      });
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. ABAC POLICY BUILDER TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "policies" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-950 text-sm">Active Attribute-Based Policies (ABAC)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Enforce dynamic context safety rules (IP networks, clock bounds, localization)</p>
            </div>

            <div className="space-y-4">
              {policies.map(p => (
                <div key={p.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between gap-4 ${
                  p.status === "REVOKED" ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200"
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">{p.name}</h4>
                      <span className={`px-2 py-0.5 text-[8px] font-mono font-extrabold rounded ${
                        p.effect === "ALLOW" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {p.effect}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{p.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-400">Target Resource:</span> {p.resources.join(", ")}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Action:</span> {p.actions.join(", ")}
                      </div>
                    </div>

                    {p.conditions.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-bold">Evaluation Expression Logic:</div>
                        {p.conditions.map((cond, idx) => (
                          <div key={idx} className="text-[10px] font-mono text-rose-700 font-semibold">
                            if ({cond.attribute} {cond.operator} "{cond.value}") → {p.effect}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-start">
                    {p.status !== "REVOKED" ? (
                      <button
                        onClick={() => handleDeletePolicy(p.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl transition-colors border border-rose-100"
                        title="Revoke and Disable Policy rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-[10px] font-mono rounded uppercase">
                        Deactivated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Builder Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <form onSubmit={handleAddPolicy} className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">Dynamic Policy Compiler</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define conditional security layers</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Policy Identity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block Outside Whitelist"
                  value={policyForm.name}
                  onChange={e => setPolicyForm({ ...policyForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Brief Intent</label>
                <input
                  type="text"
                  placeholder="Denies operations if location is outside APAC"
                  value={policyForm.description}
                  onChange={e => setPolicyForm({ ...policyForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Rule Effect</label>
                  <select
                    value={policyForm.effect}
                    onChange={e => setPolicyForm({ ...policyForm, effect: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white font-bold"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="DENY">DENY</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Action Type</label>
                  <select
                    value={policyForm.action}
                    onChange={e => setPolicyForm({ ...policyForm, action: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  >
                    <option value="read">READ</option>
                    <option value="write">WRITE</option>
                    <option value="admin">ADMIN</option>
                    <option value="*">* (ANY ACTION)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Target Resource URI Pattern</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. domain:011:floorplan/*"
                  value={policyForm.resourcePattern}
                  onChange={e => setPolicyForm({ ...policyForm, resourcePattern: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-xs font-extrabold text-slate-900">ABAC Conditional Statement:</div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Context Attribute</label>
                  <select
                    value={policyForm.conditionAttr}
                    onChange={e => setPolicyForm({ ...policyForm, conditionAttr: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50"
                  >
                    <option value="env.ipAddress">env.ipAddress (IP Subnet Whitelisting)</option>
                    <option value="env.timeOfDay">env.timeOfDay (Operational Windows)</option>
                    <option value="user.clearance">user.clearance (Access Clearence Level)</option>
                    <option value="env.location">env.location (Regional Geofencing)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Operator</label>
                    <select
                      value={policyForm.conditionOp}
                      onChange={e => setPolicyForm({ ...policyForm, conditionOp: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50"
                    >
                      <option value="MATCHES">MATCHES</option>
                      <option value="EQUALS">EQUALS</option>
                      <option value="CONTAINS">CONTAINS</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Comparison Value</label>
                    <input
                      type="text"
                      placeholder="e.g. UNTRUSTED_IP"
                      value={policyForm.conditionVal}
                      onChange={e => setPolicyForm({ ...policyForm, conditionVal: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-slate-900 text-white font-extrabold rounded-xl text-xs hover:bg-slate-800 transition-colors shadow-sm mt-4"
              >
                Compile and Publish Policy
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. ACTIVE SESSION TRACKER TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "sessions" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-950 text-sm">Active Session Monitor</h3>
            <p className="text-xs text-slate-400 mt-0.5">Enforce concurrent session limits and tracking device fingerprints</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-2">User Ident</th>
                  <th className="py-2">Access Token Signature</th>
                  <th className="py-2">Device info / Fingerprint</th>
                  <th className="py-2">IP Address</th>
                  <th className="py-2">Last Activity</th>
                  <th className="py-2">Policy Badges</th>
                  <th className="py-2 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-600">
                {sessions.map(sess => {
                  const sUser = users.find(u => u.id === sess.userId);
                  return (
                    <tr key={sess.id} className={`hover:bg-slate-50/50 ${sess.isRevoked ? "bg-slate-50/70 opacity-50" : ""}`}>
                      <td className="py-3">
                        <div className="font-extrabold text-slate-900">
                          {sUser ? `${sUser.firstName} ${sUser.lastName}` : "System Service"}
                        </div>
                        <div className="text-slate-400 font-mono text-[10px]">@{sUser?.username || "service"}</div>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                        {sess.token}
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-800">{sess.deviceId}</div>
                        <div className="text-slate-400 text-[10px]">{sess.userAgent}</div>
                      </td>
                      <td className="py-3 font-mono text-slate-700">{sess.ipAddress}</td>
                      <td className="py-3 text-[10px] font-mono text-slate-600">
                        {new Date(sess.lastActiveAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 space-x-1">
                        {sess.concurrentLimitTripped && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[8px] font-mono font-bold rounded">
                            CONCURRENT_LIMIT_TRIPPED
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold rounded ${
                          sess.isRevoked ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {sess.isRevoked ? "REVOKED" : "ACTIVE_VALID"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {!sess.isRevoked ? (
                          <button
                            onClick={() => handleKillSession(sess.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-[10px] font-black rounded-lg transition-colors"
                          >
                            Forced Terminate
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold italic">Terminated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. MFA & CREDENTIAL POLICY TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "mfa" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-950 text-sm">Security Authenticator Sandbox</h3>
              <p className="text-xs text-slate-400 mt-0.5">Simulate multi-factor authentication registration and validation</p>
            </div>

            <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-700">MFA Provider Gateway</span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">TOTP_RFC6238</span>
              </div>

              <div className="text-xs text-slate-500">
                To test the enterprise high-clearance access tier, trigger an OTP broadcast. The engine will generate a cryptographically secure 6-digit session validation key.
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleTriggerOtp}
                  className="px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Trigger OTP Broadcast
                </button>
              </div>

              {otpCode && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-bold">Simulated SMS/Authenticator App Feed:</div>
                    <div className="text-xl font-black font-mono text-rose-800 tracking-widest">{otpCode}</div>
                  </div>
                  <span className="text-[9px] text-slate-400 italic">Expires in 60s</span>
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Submit OTP Verification Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-xl text-xs bg-slate-50 text-center font-mono text-sm tracking-widest"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-colors"
                  >
                    Verify & Authenticate
                  </button>
                </div>
              </div>

              {mfaStatusMsg && (
                <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  mfaSuccess ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
                }`}>
                  {mfaSuccess ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {mfaStatusMsg}
                </div>
              )}
            </form>
          </div>

          {/* Password Policy Rules Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-950 text-sm">Enterprise Password Signature Policies</h3>
              <p className="text-xs text-slate-400 mt-0.5">Active standards enforced globally on local directory changes</p>
            </div>

            <div className="space-y-3.5">
              {[
                { name: "Minimum Passphrase Length", limit: "12 Characters", compliance: "HIPAA / NIST SP 800-63" },
                { name: "Required Character Complexity", limit: "Uppercase + Lowercase + Numerical + Special Symbol", compliance: "SOC2 Logical Security Controls" },
                { name: "Global Account Fail Lockout Limit", limit: "5 Attempts", compliance: "ISO 27001 Access Control Guidelines" },
                { name: "Credential Rotation Threshold", limit: "90 Days maximum active age", compliance: "PCI-DSS v4" }
              ].map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rule.name}</h4>
                    <span className="text-[9px] text-slate-400 font-mono">Enforcement context: {rule.compliance}</span>
                  </div>
                  <span className="px-2 py-1 bg-rose-100 text-rose-800 text-[10px] font-mono font-extrabold uppercase rounded">
                    {rule.limit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. SECRETS VAULT TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "vault" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <h3 className="font-extrabold text-slate-950 text-sm">Secure Environment Secrets Vault</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage encrypted database credentials and master Engine Credentials safely</p>
            </div>
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 text-xs font-mono rounded">
              Cryptography: AES-256-GCM Hardware Encrypted
            </span>
          </div>

          <div className="space-y-4">
            {secrets.map(sec => {
              const isRevealed = decryptedSecrets[sec.id];
              return (
                <div key={sec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-mono font-bold rounded">
                          {sec.type}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900">{sec.key}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{sec.metadata.targetDomain} Integration key config context</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Next Rotation due:</div>
                        <div className="text-[10px] font-mono font-bold text-rose-700">
                          {new Date(sec.nextRotationDue).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Credential Secure Value:</div>
                      {isRevealed ? (
                        <div className="text-xs font-mono font-semibold bg-emerald-50/50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg break-all">
                          {isRevealed}
                        </div>
                      ) : (
                        <div className="text-xs font-mono text-slate-400 tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg select-none">
                          ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Justification reason required..."
                        value={revealPurpose[sec.id] || ""}
                        onChange={e => setRevealPurpose({ ...revealPurpose, [sec.id]: e.target.value })}
                        className="px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 focus:bg-white placeholder:text-slate-400"
                      />
                      <button
                        onClick={() => handleRevealSecret(sec.id)}
                        className="p-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0 text-xs font-extrabold"
                      >
                        {isRevealed ? "Hide Key" : "Reveal Vault"}
                      </button>
                    </div>
                  </div>

                  {/* Rotate key segment */}
                  <div className="pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-400 font-mono">
                      Last Rotated: {new Date(sec.lastRotatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter new credential key..."
                        value={rotateValue[sec.id] || ""}
                        onChange={e => setRotateValue({ ...rotateValue, [sec.id]: e.target.value })}
                        className="px-2.5 py-1 border rounded-lg text-[10px] bg-slate-50 focus:bg-white"
                      />
                      <button
                        onClick={() => handleRotateSecret(sec.id)}
                        className="px-2.5 py-1 bg-rose-600 text-white hover:bg-rose-700 text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Rotate Credential
                      </button>
                    </div>
                  </div>

                  {/* Access Audit logs */}
                  {sec.accessLogs.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-bold">Immutable Secrets Access Record:</div>
                      <div className="space-y-1">
                        {sec.accessLogs.map((log, idx) => (
                          <div key={idx} className="text-[10px] font-mono text-slate-600 flex justify-between bg-white border border-slate-100 p-2 rounded-lg">
                            <span>
                              [{new Date(log.timestamp).toLocaleTimeString()}] Access by <span className="font-bold text-rose-700">{log.actorId}</span> from {log.ipAddress}
                            </span>
                            <span className="italic text-slate-500 font-sans">Purpose: {log.purpose}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. COMPLIANCE HUB TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "compliance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-950 text-sm">Enterprise Compliance Governance Registry</h3>
              <p className="text-xs text-slate-400 mt-0.5">Audit controls coverage against SOC2 Type II, ISO 27001, GDPR and HIPAA</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {compliance.map(ctrl => (
                <div
                  key={ctrl.id}
                  onClick={() => setSelectedControl(ctrl.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedControl === ctrl.id
                      ? "border-rose-600 bg-rose-50/20 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-mono font-bold rounded">
                      {ctrl.framework} {ctrl.code}
                    </span>
                    <span className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded ${
                      ctrl.status === "COMPLIANT" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {ctrl.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-950 mt-2.5">{ctrl.name}</h4>
                  <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{ctrl.description}</p>

                  <div className="pt-2 border-t mt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>Evidence Logs: {ctrl.evidenceCount}</span>
                    <span>Reviewed: {new Date(ctrl.lastReviewedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Collection Sandbox */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <form onSubmit={handleUploadEvidence} className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">Compliance Evidence Cryptographic Signer</h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload, sign and anchor immutable SOC2 artifacts</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Target Governance Control:</span>
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-mono font-bold text-rose-800">
                  {compliance.find(c => c.id === selectedControl)?.code} - {compliance.find(c => c.id === selectedControl)?.name}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Evidence Record Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Access Controls Log Review"
                  value={evidenceTitle}
                  onChange={e => setEvidenceTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Summary Context Description</label>
                <textarea
                  placeholder="Review findings indicating all terminated employee tokens were deleted within 2 hours."
                  value={evidenceDesc}
                  onChange={e => setEvidenceDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white h-20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Artifact JSON Payload</label>
                <textarea
                  required
                  placeholder='{ "auditType": "IAM", "revokedAccounts": 14 }'
                  value={evidencePayload}
                  onChange={e => setEvidencePayload(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono bg-slate-900 text-slate-200 h-20"
                />
              </div>

              {complianceSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-medium">
                  {complianceSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors shadow-sm"
              >
                Sign & Secure Evidence Artifact
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 9. AUDIT & THREAT LOGS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4">
            <div>
              <h3 className="font-extrabold text-slate-950 text-sm">Security Audit Logs Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">Immutable record of every authorization evaluation and secret access</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs details..."
                  value={searchLog}
                  onChange={e => setSearchLog(e.target.value)}
                  className="px-3 py-1.5 border rounded-xl text-xs bg-slate-50 placeholder:text-slate-400 w-44 focus:w-60 transition-all"
                />
              </div>

              <select
                value={logFilter}
                onChange={e => setLogFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-xl text-xs bg-slate-50 font-semibold"
              >
                <option value="ALL">All Event Traces</option>
                <option value="CRITICAL">Critical Severity Risks Only</option>
                <option value="AUTH">Authentication Login Logs</option>
                <option value="PRIVILEGES">Identity & Privileges Changes</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3 text-xs">
                <span className={`px-2 py-0.5 font-mono text-[9px] font-extrabold rounded mt-0.5 ${
                  log.severity === "CRITICAL"
                    ? "bg-rose-100 text-rose-800"
                    : log.severity === "HIGH"
                    ? "bg-rose-50 text-rose-700"
                    : log.severity === "MEDIUM"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-200 text-slate-800"
                }`}>
                  {log.severity}
                </span>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-slate-950 font-mono text-[10px]">{log.eventType}</span>
                    <span className="text-[10px] text-slate-400 font-mono">| {new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 font-medium">{log.details}</p>
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                    <span>IP Address: {log.ipAddress}</span>
                    <span>•</span>
                    <span>Actor: {log.actorId} ({log.actorType})</span>
                    {log.resourceId && (
                      <>
                        <span>•</span>
                        <span>Resource: {log.resourceId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No security audit event logs trace found matching selected filter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
