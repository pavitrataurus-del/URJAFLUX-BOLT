// =================================================================
// URJAFLUX ENTERPRISE AI OS - COMMERCIAL SAAS LAYER DATA MODEL
// =================================================================

export type UserRole =
  | 'OWNER'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'CONSULTANT'
  | 'REVIEWER'
  | 'VIEWER'
  | 'GUEST';

export type SaaSPlanTier =
  | 'FREE'
  | 'STARTER'
  | 'PROFESSIONAL'
  | 'BUSINESS'
  | 'ENTERPRISE'
  | 'CUSTOM';

export interface PlanLimits {
  maxProjects: number;
  maxStorageGb: number;
  maxUsers: number;
  aiCreditsPerMonth: number;
  customBrandingAllowed: boolean;
  apiAccessAllowed: boolean;
  advancedReportsAllowed: boolean;
  pluginFrameworkAllowed: boolean;
  customRulePacksAllowed: boolean;
}

export type PermissionCode =
  | 'ORG_READ'
  | 'ORG_WRITE'
  | 'ORG_MANAGE_MEMBERS'
  | 'ORG_MANAGE_BILLING'
  | 'PROJECT_READ'
  | 'PROJECT_WRITE'
  | 'PROJECT_DELETE'
  | 'PROJECT_EXPORT'
  | 'AI_EXECUTE_BASIC'
  | 'AI_EXECUTE_ADVANCED'
  | 'KNOWLEDGE_READ'
  | 'KNOWLEDGE_WRITE'
  | 'RULE_PACK_MANAGE'
  | 'API_KEY_MANAGE'
  | 'AUDIT_LOG_READ';

export interface OrganizationBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  reportHeaderFooter?: string;
  watermarkText?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerUserId: string;
  planTier: SaaSPlanTier;
  branding: OrganizationBranding;
  workspacesCount: number;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  billingEmail: string;
  taxId?: string;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  department?: string;
  description?: string;
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  email: string;
  displayName: string;
  organizationId: string;
  workspaceIds: string[];
  role: UserRole;
  joinedAt: string;
  status: 'ACTIVE' | 'INVITED' | 'DEACTIVATED';
  lastActiveAt: string;
}

export interface MemberInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  invitedByUserId: string;
  invitedAt: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  inviteToken: string;
}

export interface BillingAccount {
  id: string;
  organizationId: string;
  customerName: string;
  billingEmail: string;
  paymentMethodStatus: 'ACTIVE' | 'EXPIRED' | 'MISSING';
  currency: 'USD' | 'EUR' | 'INR';
  currentBalance: number;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  nextBillingDate: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: 'PAID' | 'OPEN' | 'VOID' | 'UNCOLLECTIBLE';
  issuedAt: string;
  dueDate: string;
  pdfDownloadUrl: string;
  lineItems: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

export interface LicenseKeyRecord {
  id: string;
  licenseKey: string;
  organizationId: string;
  planTier: SaaSPlanTier;
  maxSeats: number;
  assignedSeats: number;
  registeredDevices: Array<{
    deviceId: string;
    deviceName: string;
    registeredAt: string;
  }>;
  issuedAt: string;
  expiresAt: string;
  signature: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface AiCreditWallet {
  organizationId: string;
  monthlyCreditLimit: number;
  remainingCredits: number;
  usedCreditsThisMonth: number;
  totalTokensConsumedMonth: number;
  estimatedCostUsd: number;
  lastResetAt: string;
  topupCreditsBonus: number;
}

export interface AiCreditTransaction {
  id: string;
  organizationId: string;
  userId: string;
  modelAlias: string;
  operationType: 'SPATIAL_ANALYSIS' | 'VASTU_RULE_EXECUTION' | 'REPORT_GENERATION' | 'VISION_PROCESSING';
  promptTokens: number;
  completionTokens: number;
  creditsDeducted: number;
  timestamp: string;
}

export interface ApiKeyRecord {
  id: string;
  organizationId: string;
  name: string;
  keyPrefix: string;
  hashedSecret: string;
  scopes: PermissionCode[];
  rateLimitPerMinute: number;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface WebhookEndpointRecord {
  id: string;
  organizationId: string;
  url: string;
  secret: string;
  events: string[];
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface SaaSNotification {
  id: string;
  userId: string;
  organizationId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'BILLING' | 'LICENSE' | 'SECURITY';
  read: boolean;
  createdAt: string;
}

export interface SaaSAnalyticsOverview {
  monthlyActiveUsers: number;
  activeOrganizationsCount: number;
  totalProjectsCreated: number;
  totalAiCreditsConsumed: number;
  monthlyRecurringRevenueUsd: number;
  conversionRatePercent: number;
  churnRatePercent: number;
  topPlanDistribution: Record<SaaSPlanTier, number>;
}
