import {
  Organization,
  Workspace,
  TeamMember,
  MemberInvitation,
  UserRole,
  PermissionCode,
  SaaSPlanTier,
  PlanLimits,
} from '../../types/saas';
import { structuredLogger } from '../telemetry/StructuredLogger';

export const DEFAULT_PLAN_LIMITS: Record<SaaSPlanTier, PlanLimits> = {
  FREE: {
    maxProjects: 3,
    maxStorageGb: 1,
    maxUsers: 1,
    aiCreditsPerMonth: 100,
    customBrandingAllowed: false,
    apiAccessAllowed: false,
    advancedReportsAllowed: false,
    pluginFrameworkAllowed: false,
    customRulePacksAllowed: false,
  },
  STARTER: {
    maxProjects: 15,
    maxStorageGb: 10,
    maxUsers: 5,
    aiCreditsPerMonth: 1000,
    customBrandingAllowed: false,
    apiAccessAllowed: false,
    advancedReportsAllowed: true,
    pluginFrameworkAllowed: false,
    customRulePacksAllowed: false,
  },
  PROFESSIONAL: {
    maxProjects: 50,
    maxStorageGb: 50,
    maxUsers: 20,
    aiCreditsPerMonth: 5000,
    customBrandingAllowed: true,
    apiAccessAllowed: true,
    advancedReportsAllowed: true,
    pluginFrameworkAllowed: true,
    customRulePacksAllowed: false,
  },
  BUSINESS: {
    maxProjects: 200,
    maxStorageGb: 250,
    maxUsers: 100,
    aiCreditsPerMonth: 25000,
    customBrandingAllowed: true,
    apiAccessAllowed: true,
    advancedReportsAllowed: true,
    pluginFrameworkAllowed: true,
    customRulePacksAllowed: true,
  },
  ENTERPRISE: {
    maxProjects: 10000,
    maxStorageGb: 5000,
    maxUsers: 1000,
    aiCreditsPerMonth: 250000,
    customBrandingAllowed: true,
    apiAccessAllowed: true,
    advancedReportsAllowed: true,
    pluginFrameworkAllowed: true,
    customRulePacksAllowed: true,
  },
  CUSTOM: {
    maxProjects: 99999,
    maxStorageGb: 99999,
    maxUsers: 99999,
    aiCreditsPerMonth: 1000000,
    customBrandingAllowed: true,
    apiAccessAllowed: true,
    advancedReportsAllowed: true,
    pluginFrameworkAllowed: true,
    customRulePacksAllowed: true,
  },
};

export const ROLE_PERMISSION_MAP: Record<UserRole, PermissionCode[]> = {
  OWNER: [
    'ORG_READ',
    'ORG_WRITE',
    'ORG_MANAGE_MEMBERS',
    'ORG_MANAGE_BILLING',
    'PROJECT_READ',
    'PROJECT_WRITE',
    'PROJECT_DELETE',
    'PROJECT_EXPORT',
    'AI_EXECUTE_BASIC',
    'AI_EXECUTE_ADVANCED',
    'KNOWLEDGE_READ',
    'KNOWLEDGE_WRITE',
    'RULE_PACK_MANAGE',
    'API_KEY_MANAGE',
    'AUDIT_LOG_READ',
  ],
  SUPER_ADMIN: [
    'ORG_READ',
    'ORG_WRITE',
    'ORG_MANAGE_MEMBERS',
    'ORG_MANAGE_BILLING',
    'PROJECT_READ',
    'PROJECT_WRITE',
    'PROJECT_DELETE',
    'PROJECT_EXPORT',
    'AI_EXECUTE_BASIC',
    'AI_EXECUTE_ADVANCED',
    'KNOWLEDGE_READ',
    'KNOWLEDGE_WRITE',
    'RULE_PACK_MANAGE',
    'API_KEY_MANAGE',
    'AUDIT_LOG_READ',
  ],
  ADMIN: [
    'ORG_READ',
    'ORG_WRITE',
    'ORG_MANAGE_MEMBERS',
    'PROJECT_READ',
    'PROJECT_WRITE',
    'PROJECT_DELETE',
    'PROJECT_EXPORT',
    'AI_EXECUTE_BASIC',
    'AI_EXECUTE_ADVANCED',
    'KNOWLEDGE_READ',
    'KNOWLEDGE_WRITE',
    'RULE_PACK_MANAGE',
    'API_KEY_MANAGE',
    'AUDIT_LOG_READ',
  ],
  MANAGER: [
    'ORG_READ',
    'PROJECT_READ',
    'PROJECT_WRITE',
    'PROJECT_EXPORT',
    'AI_EXECUTE_BASIC',
    'AI_EXECUTE_ADVANCED',
    'KNOWLEDGE_READ',
    'KNOWLEDGE_WRITE',
  ],
  CONSULTANT: [
    'ORG_READ',
    'PROJECT_READ',
    'PROJECT_WRITE',
    'PROJECT_EXPORT',
    'AI_EXECUTE_BASIC',
    'AI_EXECUTE_ADVANCED',
    'KNOWLEDGE_READ',
  ],
  REVIEWER: [
    'ORG_READ',
    'PROJECT_READ',
    'PROJECT_EXPORT',
    'AI_EXECUTE_BASIC',
    'KNOWLEDGE_READ',
  ],
  VIEWER: ['ORG_READ', 'PROJECT_READ', 'KNOWLEDGE_READ'],
  GUEST: ['PROJECT_READ'],
};

export class OrganizationService {
  private static instance: OrganizationService;
  private organizations: Map<string, Organization> = new Map();
  private workspaces: Map<string, Workspace> = new Map();
  private members: Map<string, TeamMember[]> = new Map(); // orgId -> TeamMember[]
  private invitations: MemberInvitation[] = [];

  private constructor() {
    this.seedDefaultOrganization();
  }

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  public createOrganization(name: string, ownerUserId: string, planTier: SaaSPlanTier = 'ENTERPRISE', billingEmail?: string): Organization {
    const id = `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const org: Organization = {
      id,
      name,
      slug,
      ownerUserId,
      planTier,
      branding: {
        primaryColor: '#059669',
        secondaryColor: '#0284c7',
        reportHeaderFooter: `${name} Confidential Enterprise Vastu Report`,
      },
      workspacesCount: 1,
      membersCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      billingEmail: billingEmail || `billing@${slug}.com`,
    };

    this.organizations.set(id, org);

    // Default primary workspace
    const primaryWs: Workspace = {
      id: `ws_${Date.now()}_1`,
      organizationId: id,
      name: 'Primary HQ Workspace',
      department: 'Architectural & Spatial Advisory',
      createdAt: new Date().toISOString(),
    };
    this.workspaces.set(primaryWs.id, primaryWs);

    // Add Owner member
    const ownerMember: TeamMember = {
      userId: ownerUserId,
      email: billingEmail || 'owner@urjaflux.com',
      displayName: 'Enterprise Tenant Admin',
      organizationId: id,
      workspaceIds: [primaryWs.id],
      role: 'OWNER',
      joinedAt: new Date().toISOString(),
      status: 'ACTIVE',
      lastActiveAt: new Date().toISOString(),
    };
    this.members.set(id, [ownerMember]);

    structuredLogger.info('OrganizationService', `Created tenant organization '${name}' (${id}) on ${planTier} plan.`, { orgId: id, ownerUserId });
    return org;
  }

  public getOrganization(orgId: string): Organization | undefined {
    return this.organizations.get(orgId);
  }

  public getAllOrganizations(): Organization[] {
    return Array.from(this.organizations.values());
  }

  public updateBranding(orgId: string, branding: Partial<Organization['branding']>): Organization {
    const org = this.organizations.get(orgId);
    if (!org) throw new Error(`Organization ${orgId} not found`);

    const limits = DEFAULT_PLAN_LIMITS[org.planTier];
    if (!limits.customBrandingAllowed) {
      throw new Error(`Plan tier ${org.planTier} does not permit custom branding.`);
    }

    org.branding = { ...org.branding, ...branding };
    org.updatedAt = new Date().toISOString();
    this.organizations.set(orgId, org);

    structuredLogger.info('OrganizationService', `Updated branding for tenant ${orgId}`);
    return org;
  }

  public inviteMember(orgId: string, email: string, role: UserRole, invitedByUserId: string): MemberInvitation {
    const org = this.organizations.get(orgId);
    if (!org) throw new Error(`Organization ${orgId} not found`);

    const limits = DEFAULT_PLAN_LIMITS[org.planTier];
    const currentMembers = (this.members.get(orgId) || []).length;
    if (currentMembers >= limits.maxUsers) {
      throw new Error(`Organization seat limit reached (${limits.maxUsers} users). Upgrade plan.`);
    }

    const invite: MemberInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      email,
      role,
      invitedByUserId,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      status: 'PENDING',
      inviteToken: `tok_${Math.random().toString(36).substring(2, 12)}`,
    };

    this.invitations.push(invite);
    structuredLogger.info('OrganizationService', `Created invitation for ${email} as ${role} in ${orgId}`, { inviteId: invite.id });
    return invite;
  }

  public acceptInvitation(inviteToken: string, userId: string, displayName: string): TeamMember {
    const invite = this.invitations.find((i) => i.inviteToken === inviteToken && i.status === 'PENDING');
    if (!invite) throw new Error('Invalid or expired invitation token');

    invite.status = 'ACCEPTED';

    const newMember: TeamMember = {
      userId,
      email: invite.email,
      displayName,
      organizationId: invite.organizationId,
      workspaceIds: [],
      role: invite.role,
      joinedAt: new Date().toISOString(),
      status: 'ACTIVE',
      lastActiveAt: new Date().toISOString(),
    };

    const members = this.members.get(invite.organizationId) || [];
    members.push(newMember);
    this.members.set(invite.organizationId, members);

    const org = this.organizations.get(invite.organizationId);
    if (org) {
      org.membersCount = members.length;
    }

    structuredLogger.info('OrganizationService', `User ${userId} accepted invitation to tenant ${invite.organizationId}`);
    return newMember;
  }

  public getMembers(orgId: string): TeamMember[] {
    return this.members.get(orgId) || [];
  }

  public hasPermission(role: UserRole, permission: PermissionCode): boolean {
    const allowed = ROLE_PERMISSION_MAP[role] || [];
    return allowed.includes(permission);
  }

  public validateTenantAccess(requestOrgId: string, resourceOrgId: string): boolean {
    if (requestOrgId !== resourceOrgId) {
      structuredLogger.warn('OrganizationService', `Cross-tenant access attempt blocked! RequestOrg: ${requestOrgId}, ResourceOrg: ${resourceOrgId}`);
      return false;
    }
    return true;
  }

  private seedDefaultOrganization() {
    this.createOrganization('URJAFLUX Global HQ', 'user_master_owner', 'ENTERPRISE', 'billing@urjaflux.ai');
  }
}

export const organizationService = OrganizationService.getInstance();
