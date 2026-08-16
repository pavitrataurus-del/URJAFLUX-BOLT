import { useState, useEffect } from 'react';
import {
  Building2,
  DollarSign,
  Users,
  Activity,
  Award,
  Zap,
  Shield,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  Lock
} from 'lucide-react';
import { saasAnalyticsEngine } from '../../core/saas/SaaSAnalyticsEngine';
import { organizationService } from '../../core/saas/OrganizationService';
import { subscriptionBillingService } from '../../core/saas/SubscriptionBillingService';
import { aiCreditEngine } from '../../core/saas/AiCreditEngine';
import { SaaSAnalyticsOverview, Organization, SaaSPlanTier } from '../../types/saas';

export const SaaSAdminConsole: React.FC = () => {
  const [overview, setOverview] = useState<SaaSAnalyticsOverview>(saasAnalyticsEngine.getOverview());
  const [organizations, setOrganizations] = useState<Organization[]>(organizationService.getAllOrganizations());
  const [activeTab, setActiveTab] = useState<'kpis' | 'tenants' | 'billing' | 'licenses' | 'credits'>('kpis');

  // Form for New Org
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgOwner, setNewOrgOwner] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState<SaaSPlanTier>('ENTERPRISE');

  const refreshData = () => {
    setOverview(saasAnalyticsEngine.getOverview());
    setOrganizations(organizationService.getAllOrganizations());
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgOwner) return;
    organizationService.createOrganization(newOrgName, newOrgOwner, newOrgPlan);
    setNewOrgName('');
    setNewOrgOwner('');
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">URJAFLUX SaaS Admin Console</h1>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                  MASTER PLATFORM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Global Multi-Tenant Commercial Operations, Revenue Analytics & AI Credit Management
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={refreshData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh KPIs
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 text-sm font-medium overflow-x-auto">
        {[
          { id: 'kpis', label: 'Commercial KPIs & Revenue', icon: DollarSign },
          { id: 'tenants', label: 'Organization Directory', icon: Building2, count: organizations.length },
          { id: 'billing', label: 'Global Billing & Subscriptions', icon: Activity },
          { id: 'licenses', label: 'License Control Center', icon: Award },
          { id: 'credits', label: 'AI Credit Wallets', icon: Zap }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition text-xs font-semibold whitespace-nowrap ${
                isActive
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Commercial KPIs */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs font-mono uppercase text-slate-400">Monthly Recurring Revenue (MRR)</span>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                ${overview.monthlyRecurringRevenueUsd.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">+14.2% MoM growth rate</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs font-mono uppercase text-slate-400">Active Organizations</span>
              <div className="text-3xl font-bold font-mono text-white mt-1">
                {overview.activeOrganizationsCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Isolated enterprise tenants</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs font-mono uppercase text-slate-400">Monthly Active Users (MAU)</span>
              <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">
                {overview.monthlyActiveUsers}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Active architect sessions</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs font-mono uppercase text-slate-400">AI Tokens Consumed</span>
              <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
                {overview.totalAiCreditsConsumed.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Gemini reasoning API calls</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white font-mono uppercase mb-4">Plan Distribution Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {Object.entries(overview.topPlanDistribution).map(([plan, count]) => (
                <div key={plan} className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">{plan}</span>
                  <div className="text-xl font-bold text-white mt-1">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Organizations Directory */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          {/* Create Org */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white font-mono uppercase mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Provision New Tenant Organization
            </h3>
            <form onSubmit={handleCreateOrg} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Organization Name (e.g. Acme Architecture Corp)"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                required
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <input
                type="text"
                placeholder="Owner User ID / Email"
                value={newOrgOwner}
                onChange={(e) => setNewOrgOwner(e.target.value)}
                required
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <select
                value={newOrgPlan}
                onChange={(e) => setNewOrgPlan(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="FREE">FREE</option>
                <option value="STARTER">STARTER</option>
                <option value="PROFESSIONAL">PROFESSIONAL</option>
                <option value="BUSINESS">BUSINESS</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition"
              >
                Provision Tenant
              </button>
            </form>
          </div>

          {/* Org List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white font-mono uppercase mb-4">Active Tenant Organizations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Plan Tier</th>
                    <th className="py-2.5 px-3">Members</th>
                    <th className="py-2.5 px-3">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-900">
                      <td className="py-2.5 px-3 font-semibold text-white">{org.name}</td>
                      <td className="py-2.5 px-3 font-bold text-cyan-400">{org.planTier}</td>
                      <td className="py-2.5 px-3 text-slate-300">{org.membersCount} Seats</td>
                      <td className="py-2.5 px-3 text-slate-400">{new Date(org.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Subscriptions */}
      {activeTab === 'billing' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white font-mono uppercase mb-4">Global Payment Gateways & Revenue Stream</h3>
          <p className="text-xs text-slate-400 mb-4">
            Payment Processor Status: Pluggable Abstraction Adapter <span className="text-emerald-400 font-bold font-mono">GENERIC_ENTERPRISE_GATEWAY</span> active.
          </p>
        </div>
      )}

      {/* Tab 4: Licenses */}
      {activeTab === 'licenses' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white font-mono uppercase mb-4">Enterprise Cryptographic License Key Registry</h3>
          <p className="text-xs text-slate-400 mb-4">
            Generates SHA-256 signed offline license tokens for enterprise customer air-gapped deployments.
          </p>
        </div>
      )}

      {/* Tab 5: AI Credit Wallets */}
      {activeTab === 'credits' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white font-mono uppercase mb-4">Tenant AI Credit Wallets & Gemini API Cost Allocation</h3>
          <p className="text-xs text-slate-400">
            Real-time credit metering per tenant workspace across Gemini 3.6 Flash, Gemini 2.5 Pro, and Vision models.
          </p>
        </div>
      )}
    </div>
  );
};
