import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Key,
  Shield,
  Zap,
  Award,
  Plus,
  Mail,
  Copy,
  CheckCircle2,
  Download,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Lock,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { organizationService } from '../../core/saas/OrganizationService';
import { subscriptionBillingService } from '../../core/saas/SubscriptionBillingService';
import { aiCreditEngine } from '../../core/saas/AiCreditEngine';
import { publicApiPlatform } from '../../core/saas/PublicApiPlatform';
import { Organization, TeamMember, BillingAccount, InvoiceRecord, LicenseKeyRecord, AiCreditWallet, ApiKeyRecord, WebhookEndpointRecord } from '../../types/saas';

export const CustomerPortal: React.FC = () => {
  const [currentOrg, setCurrentOrg] = useState<Organization | undefined>(organizationService.getAllOrganizations()[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'billing' | 'license' | 'credits' | 'apikeys' | 'branding'>('overview');

  // State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [billingAccount, setBillingAccount] = useState<BillingAccount | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [license, setLicense] = useState<LicenseKeyRecord | null>(null);
  const [wallet, setWallet] = useState<AiCreditWallet | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpointRecord[]>([]);

  // Forms
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<any>('CONSULTANT');
  const [newKeyName, setNewKeyName] = useState('');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  useEffect(() => {
    if (currentOrg) {
      refreshOrgData(currentOrg.id);
    }
  }, [currentOrg]);

  const refreshOrgData = (orgId: string) => {
    setMembers(organizationService.getMembers(orgId));
    setBillingAccount(subscriptionBillingService.getBillingAccount(orgId));
    setInvoices(subscriptionBillingService.getInvoices(orgId));
    setLicense(subscriptionBillingService.getLicenseKey(orgId));
    setWallet(aiCreditEngine.getWallet(orgId));
    setApiKeys(publicApiPlatform.getApiKeys(orgId));
    setWebhooks(publicApiPlatform.getWebhooks(orgId));
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !inviteEmail) return;
    organizationService.inviteMember(currentOrg.id, inviteEmail, inviteRole, 'user_current');
    setInviteEmail('');
    refreshOrgData(currentOrg.id);
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !newKeyName) return;
    const { rawSecretKey } = publicApiPlatform.createApiKey(currentOrg.id, newKeyName, ['ORG_READ', 'PROJECT_READ', 'PROJECT_WRITE', 'AI_EXECUTE_BASIC']);
    setCreatedSecret(rawSecretKey);
    setNewKeyName('');
    refreshOrgData(currentOrg.id);
  };

  const handleRegisterWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !newWebhookUrl) return;
    publicApiPlatform.registerWebhook(currentOrg.id, newWebhookUrl, ['project.created', 'report.generated', 'vastu.analyzed']);
    setNewWebhookUrl('');
    refreshOrgData(currentOrg.id);
  };

  const handleUpgradeTier = async (newPlan: any) => {
    if (!currentOrg) return;
    await subscriptionBillingService.upgradePlan(currentOrg.id, newPlan);
    refreshOrgData(currentOrg.id);
  };

  if (!currentOrg) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{currentOrg.name}</h1>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full uppercase">
                  {currentOrg.planTier} PLAN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enterprise Tenant Self-Service Portal & Organizational Control Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tenant Isolation: ENFORCED</span>
          </div>

          <button
            onClick={() => refreshOrgData(currentOrg.id)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 text-sm font-medium overflow-x-auto">
        {[
          { id: 'overview', label: 'Dashboard & Limits', icon: Activity },
          { id: 'team', label: 'Team & Members', icon: Users, count: members.length },
          { id: 'billing', label: 'Subscription & Invoices', icon: CreditCard },
          { id: 'license', label: 'License Center', icon: Award },
          { id: 'credits', label: 'AI Credit Wallet', icon: Zap },
          { id: 'apikeys', label: 'Developer API Keys', icon: Key },
          { id: 'branding', label: 'Tenant Branding', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition text-xs font-semibold whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
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

      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs font-mono uppercase text-slate-400">Total Members</span>
              <div className="text-3xl font-bold font-mono text-white mt-1">{members.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">Active seat allocation</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs font-mono uppercase text-slate-400">Remaining AI Credits</span>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">{wallet?.remainingCredits}</div>
              <p className="text-[11px] text-slate-400 mt-1">Out of {wallet?.monthlyCreditLimit} monthly limit</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs font-mono uppercase text-slate-400">Active API Keys</span>
              <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">{apiKeys.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">Developer integration keys</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs font-mono uppercase text-slate-400">License Status</span>
              <div className="text-3xl font-bold font-mono text-amber-400 mt-1">{license?.status}</div>
              <p className="text-[11px] text-slate-400 mt-1">Expires: {new Date(license?.expiresAt || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Team & Members */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Invite Form */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              Invite Team Member
            </h3>
            <form onSubmit={handleSendInvite} className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="CONSULTANT">CONSULTANT</option>
                <option value="REVIEWER">REVIEWER</option>
                <option value="VIEWER">VIEWER</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Send Invitation
              </button>
            </form>
          </div>

          {/* Members Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-4">Current Team Directory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map((m) => (
                    <tr key={m.userId} className="hover:bg-slate-900">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{m.displayName}</div>
                        <div className="text-[11px] text-slate-400">{m.email}</div>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{m.role}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{new Date(m.joinedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Subscription & Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-4">Subscription Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].map((tier) => (
                <div
                  key={tier}
                  className={`border rounded-xl p-5 flex flex-col justify-between ${
                    currentOrg.planTier === tier
                      ? 'bg-emerald-500/10 border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-mono uppercase text-emerald-400">{tier}</span>
                    <h4 className="text-xl font-bold text-white mt-1">
                      {tier === 'STARTER' ? '$49/mo' : tier === 'PROFESSIONAL' ? '$199/mo' : '$2,499/yr'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2">
                      {tier === 'ENTERPRISE' ? 'Unlimited scale & dedicated compliance' : 'High volume team workspace'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpgradeTier(tier as any)}
                    disabled={currentOrg.planTier === tier}
                    className={`mt-4 w-full py-2 rounded-lg text-xs font-bold transition ${
                      currentOrg.planTier === tier
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {currentOrg.planTier === tier ? 'CURRENT PLAN' : `Upgrade to ${tier}`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-4">Billing History & Invoices</h3>
            <div className="space-y-2">
              {invoices.length === 0 ? (
                <div className="text-xs text-slate-400 font-mono py-4">No billing invoices generated yet.</div>
              ) : (
                invoices.map((inv) => (
                  <div key={inv.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-xs font-mono">
                    <div>
                      <div className="font-bold text-slate-200">{inv.invoiceNumber}</div>
                      <div className="text-slate-400 text-[11px]">Issued: {new Date(inv.issuedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">${inv.amountPaid}</div>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px]">{inv.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: License Center */}
      {activeTab === 'license' && license && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Active Enterprise License Key
            </h3>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">License Key:</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/30">
                  {license.licenseKey}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Max Seat Allocation:</span>
                <span className="text-white font-bold">{license.maxSeats} Seats</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cryptographic Signature:</span>
                <span className="text-slate-500 text-[10px]">{license.signature}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: AI Credit Wallet */}
      {activeTab === 'credits' && wallet && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              AI Tokens & Credit Metering
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 font-mono">Credits Remaining</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{wallet.remainingCredits}</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 font-mono">Used This Month</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">{wallet.usedCreditsThisMonth}</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 font-mono">Estimated Gemini API Cost</span>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">${wallet.estimatedCostUsd.toFixed(4)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Developer API Keys */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Generate Developer API Key
            </h3>
            <form onSubmit={handleCreateApiKey} className="flex gap-3">
              <input
                type="text"
                placeholder="Key Description (e.g. Production Ingestion Service)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
              >
                Create API Key
              </button>
            </form>

            {createdSecret && (
              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-lg font-mono text-xs">
                <span className="text-emerald-400 font-bold block mb-1">Generated API Secret Key (Copy now - will not be displayed again):</span>
                <div className="p-2 bg-slate-950 text-emerald-300 rounded border border-slate-800 select-all font-mono break-all">
                  {createdSecret}
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase font-mono mb-4">Active API Keys</h3>
            <div className="space-y-2">
              {apiKeys.map((k) => (
                <div key={k.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-xs font-mono">
                  <div>
                    <div className="font-bold text-slate-200">{k.name}</div>
                    <div className="text-slate-400 text-[11px]">Prefix: {k.keyPrefix}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px]">{k.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Branding */}
      {activeTab === 'branding' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white uppercase font-mono mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Tenant Custom Branding & Report Header Customization
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Customize report watermarks, header text, and primary brand accent colors for export PDFs.
          </p>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Report Header & Footer Text</label>
              <input
                type="text"
                defaultValue={currentOrg.branding.reportHeaderFooter}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Primary Color Accent</label>
              <input
                type="color"
                defaultValue={currentOrg.branding.primaryColor || '#059669'}
                className="h-10 w-20 bg-slate-950 border border-slate-800 rounded p-1 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
