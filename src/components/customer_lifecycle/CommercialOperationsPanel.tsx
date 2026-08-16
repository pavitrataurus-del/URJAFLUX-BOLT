import React, { useState } from "react";
import { 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Zap, 
  DollarSign, 
  Lock, 
  Layers, 
  Users 
} from "lucide-react";
import { CommercialSubscription, PrivacyTelemetrySettings } from "../../types/customerLifecycle";
import { INITIAL_SUBSCRIPTION, INITIAL_TELEMETRY_SETTINGS } from "../../services/customer_lifecycle/customerLifecycleService";

export const CommercialOperationsPanel: React.FC = () => {
  const [sub, setSub] = useState<CommercialSubscription>(INITIAL_SUBSCRIPTION);
  const [telemetry, setTelemetry] = useState<PrivacyTelemetrySettings>(INITIAL_TELEMETRY_SETTINGS);
  const [activeTab, setActiveTab] = useState<"COMMERCIAL_OPS" | "PRIVACY_TELEMETRY">("COMMERCIAL_OPS");

  // Upgrade / Expansion state
  const [expandSeatsCount, setExpandSeatsCount] = useState(25);
  const [seatExpansionRequested, setSeatExpansionRequested] = useState(false);

  const handleExpandSeats = () => {
    setSub(prev => ({
      ...prev,
      seatsPurchased: prev.seatsPurchased + expandSeatsCount,
      mrrAmountUsd: prev.mrrAmountUsd + (expandSeatsCount * 80)
    }));
    setSeatExpansionRequested(true);
    setTimeout(() => setSeatExpansionRequested(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("COMMERCIAL_OPS")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "COMMERCIAL_OPS"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Commercial Operations & Billing</span>
          </button>
          <button
            onClick={() => setActiveTab("PRIVACY_TELEMETRY")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "PRIVACY_TELEMETRY"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy-Aware Telemetry Controls</span>
          </button>
        </div>

        <div className="text-xs font-mono text-emerald-400 flex items-center gap-2 pr-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ISO 27001 & GDPR Compliant Data Governance</span>
        </div>
      </div>

      {/* COMMERCIAL OPERATIONS VIEW */}
      {activeTab === "COMMERCIAL_OPS" && (
        <div className="space-y-6">
          {/* External Billing Dependency Note */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs font-mono text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase">DEPLOYMENT DEPENDENCY CLASSIFICATION: EXTERNAL BILLING PROVIDER</span>
              <p className="mt-1">
                {sub.externalBillingProviderNote}
              </p>
            </div>
          </div>

          {/* Subscription KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400">Current Plan Tier</span>
              <div className="text-lg font-bold text-emerald-400">{sub.planName}</div>
              <div className="text-[11px] text-slate-500">Billing Cycle: {sub.billingCycle}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400">Monthly Recurring Revenue (MRR)</span>
              <div className="text-2xl font-bold text-white">${sub.mrrAmountUsd.toLocaleString()} / mo</div>
              <div className="text-[11px] text-slate-500">ARR Run-Rate: ${(sub.mrrAmountUsd * 12).toLocaleString()}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400">Purchased Workstation Seats</span>
              <div className="text-2xl font-bold text-amber-300">{sub.seatsPurchased} Seats</div>
              <div className="text-[11px] text-slate-500">112 Currently Active</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400">Next Renewal Date</span>
              <div className="text-lg font-bold text-white">{sub.nextRenewalDate}</div>
              <div className="text-[11px] text-emerald-400">Auto-Renewal Active</div>
            </div>
          </div>

          {/* Seat Expansion Workflow */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Seat Expansion & License Upgrade Workflow</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Instantly add workstation seats to your enterprise license agreement.</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={expandSeatsCount}
                  onChange={e => setExpandSeatsCount(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-center font-bold"
                />
                <button
                  onClick={handleExpandSeats}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{seatExpansionRequested ? "Seats Added!" : "Add +25 Seats"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Invoice History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Invoice History & Enterprise Receipts</span>
            </h3>

            <div className="divide-y divide-slate-800">
              {sub.invoices.map(inv => (
                <div key={inv.id} className="py-3 flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{inv.id}</span>
                    <span className="text-slate-500">{inv.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-white">${inv.amountUsd.toLocaleString()} USD</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY TELEMETRY VIEW */}
      {activeTab === "PRIVACY_TELEMETRY" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <span>Privacy-Aware Telemetry & Data Collection Controls</span>
            </h2>
            <p className="text-slate-400 mt-1">
              Configure strict privacy guarantees, anonymization salts, and opt-in telemetry toggles for compliance.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-slate-300 mb-1">Telemetry Mode Level</label>
              <select
                value={telemetry.telemetryMode}
                onChange={e => setTelemetry({ ...telemetry, telemetryMode: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ANONYMOUS_MINIMAL">ANONYMOUS MINIMAL (Strict Minimum)</option>
                <option value="STANDARD_PRODUCT_IMPROVEMENT">STANDARD PRODUCT IMPROVEMENT (Recommended)</option>
                <option value="FULL_DIAGNOSTIC">FULL DIAGNOSTIC (Proactive Support)</option>
                <option value="OPT_OUT_AIRGAPPED">OPT-OUT AIRGAPPED (Zero Network Payload)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Data Anonymization Hash Salt</label>
              <input
                type="text"
                value={telemetry.anonymizationSalt}
                onChange={e => setTelemetry({ ...telemetry, anonymizationSalt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {[
                { key: "optInFeatureAdoption", label: "Opt-In Feature Adoption Heatmaps" },
                { key: "optInCrashReporting", label: "Opt-In Automated Crash Reports" },
                { key: "optInPerformanceMetrics", label: "Opt-In 3D Twin FPS & Rendering Performance Metrics" },
                { key: "optInTwinUsageStats", label: "Opt-In Spatial Object Count Telemetry" }
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={(telemetry as any)[opt.key]}
                    onChange={e => setTelemetry({ ...telemetry, [opt.key]: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
