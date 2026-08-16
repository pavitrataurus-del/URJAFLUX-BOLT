import React, { useState } from "react";
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  FileText, 
  Layers, 
  Key, 
  Shield 
} from "lucide-react";
import { ExecutionPolicy, RiskLevel } from "../../types/autonomousAi";
import { INITIAL_EXECUTION_POLICIES } from "../../services/autonomous_ai/autonomousAiService";

export const PolicyAndSecurityManager: React.FC = () => {
  const [policies, setPolicies] = useState<ExecutionPolicy[]>(INITIAL_EXECUTION_POLICIES);
  const [isAdding, setIsAdding] = useState(false);
  const [newPolicyName, setNewPolicyName] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newRiskLevel, setNewRiskLevel] = useState<RiskLevel>("HIGH");

  const handleTogglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, active: !p.active };
      }
      return p;
    }));
  };

  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyName || !newCondition) return;

    const pol: ExecutionPolicy = {
      id: `POL-${Math.floor(100 + Math.random() * 900)}`,
      tenantId: "TENANT-URJA-CORP",
      name: newPolicyName,
      category: "RISK",
      riskLevel: newRiskLevel,
      condition: newCondition,
      actionRequired: newRiskLevel === "CRITICAL" || newRiskLevel === "HIGH" ? "REQUIRE_APPROVAL" : "ALLOW",
      approvalTimeoutMinutes: 30,
      autoEscalateOnTimeout: true,
      active: true
    };

    setPolicies(prev => [pol, ...prev]);
    setIsAdding(false);
    setNewPolicyName("");
    setNewCondition("");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Lock className="w-4 h-4" />
            <span>MODULE 6 & 13 • POLICY ENGINE & TENANT SECURITY</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Autonomous Execution Policies & Safety Limits</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure risk thresholds, action restrictions, automated approval escalation, and tenant isolation policies.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Safety Policy</span>
        </button>
      </div>

      {/* Add Policy Form */}
      {isAdding && (
        <form onSubmit={handleAddPolicy} className="bg-slate-950 border border-emerald-500/50 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <span>Create Execution Policy Rule</span>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">Policy Name</label>
              <input
                type="text"
                value={newPolicyName}
                onChange={e => setNewPolicyName(e.target.value)}
                placeholder="e.g. Block Bulk User Data Export"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Risk Level Classification</label>
              <select
                value={newRiskLevel}
                onChange={e => setNewRiskLevel(e.target.value as RiskLevel)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="LOW">LOW (Auto-Execution Allowed)</option>
                <option value="MEDIUM">MEDIUM (Logged & Audited)</option>
                <option value="HIGH">HIGH (Requires Role Approval)</option>
                <option value="CRITICAL">CRITICAL (Requires Super Admin Approval)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Trigger Condition Specification</label>
            <input
              type="text"
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
              placeholder="e.g. Action triggers export of >1000 records"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Save Policy Rule
            </button>
          </div>
        </form>
      )}

      {/* Policy Rules List */}
      <div className="space-y-3">
        {policies.map(pol => (
          <div key={pol.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-300 font-bold">{pol.id}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  pol.riskLevel === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                  pol.riskLevel === "HIGH" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                  "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  RISK: {pol.riskLevel}
                </span>
                <span className="text-slate-500 text-[10px]">• Action: {pol.actionRequired}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{pol.name}</h4>
              <p className="text-xs text-slate-400 font-sans">{pol.condition}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-400 font-bold">
                {pol.active ? "ACTIVE RULE" : "DISABLED"}
              </span>
              <button
                onClick={() => handleTogglePolicy(pol.id)}
                className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                  pol.active ? "bg-emerald-600" : "bg-slate-800"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                  pol.active ? "left-6" : "left-0.5"
                }`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
