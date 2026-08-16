export type UserRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "CONSULTANT" | "CLIENT_VIEWER" | "AUDITOR" | "ADMIN" | "ARCHITECT" | "ENGINEER" | "VASTU_CONSULTANT";

export interface BaseSecurityEntity {
  id: string; // UUID
  version: number;
  metadata: Record<string, any>;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DEPRECATED" | "REVOKED";
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  auditTrail: string[];
}

// Phase 1 - Identity Entities
export interface User extends BaseSecurityEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  tenantId: string;
  roles: string[]; // Role IDs
  groups: string[]; // Group IDs
  mfaEnabled: boolean;
  mfaSecret?: string;
  passwordHash: string;
  failedLoginAttempts: number;
  lockoutUntil?: string;
  passwordChangedAt: string;
  rememberedDevices: string[]; // Device IDs
}

export interface Group extends BaseSecurityEntity {
  name: string;
  description: string;
  organizationId: string;
  tenantId: string;
  roles: string[]; // Role IDs
  parentGroupId?: string;
}

export interface Organization extends BaseSecurityEntity {
  name: string;
  description: string;
  tenantId: string;
  domain: string;
}

export interface Tenant extends BaseSecurityEntity {
  name: string;
  tier: "STANDARD" | "ENTERPRISE" | "GOVERNMENT";
  allowedFeatures: string[];
  maxUsers: number;
  ipWhitelist: string[];
}

export interface Role extends BaseSecurityEntity {
  name: string;
  description: string;
  tenantId: string;
  permissions: string[]; // Permission IDs
  parentRoleId?: string; // For Role Inheritance
  isSystem: boolean;
}

export interface Permission extends BaseSecurityEntity {
  name: string; // e.g. "vastu:read", "vision:inspect"
  description: string;
  category: "REASONING" | "MONITORING" | "VISION" | "WORKFLOW" | "COLLABORATION" | "INTEGRATION" | "ANALYTICS" | "SECURITY" | "SPATIAL" | "REPORTING";
}

export interface Policy extends BaseSecurityEntity {
  name: string;
  description: string;
  effect: "ALLOW" | "DENY";
  subjects: string[]; // User IDs, Group IDs, or "*"
  resources: string[]; // Resource URI patterns e.g. "domain:011:floorplan/*"
  actions: string[]; // e.g. ["read", "write"]
  conditions: AbacCondition[];
}

export interface Session extends BaseSecurityEntity {
  userId: string;
  token: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  lastActiveAt: string;
  concurrentLimitTripped: boolean;
  isRevoked: boolean;
}

export interface Device extends BaseSecurityEntity {
  userId: string;
  fingerprint: string;
  deviceName: string;
  os: string;
  browser: string;
  isTrusted: boolean;
  lastUsedAt: string;
}

export interface ApiIdentity extends BaseSecurityEntity {
  name: string;
  apiKeyHash: string;
  clientId: string;
  tenantId: string;
  allowedIps: string[];
  rateLimitOverride?: number;
  roles: string[];
}

export interface ServiceAccount extends BaseSecurityEntity {
  name: string;
  description: string;
  clientId: string;
  clientSecretHash: string;
  tenantId: string;
  roles: string[];
}

export interface SecurityEvent extends BaseSecurityEntity {
  eventType: "LOGIN_SUCCESS" | "LOGIN_FAILURE" | "PRIVILEGE_CHANGE" | "PERMISSION_CHANGE" | "TOKEN_ABUSE" | "SECRET_ACCESS" | "MFA_VERIFY" | "SESSION_TERMINATE" | "POLICY_VIOLATION";
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  actorId: string; // User ID or ServiceAccount ID
  actorType: "USER" | "SERVICE_ACCOUNT" | "SYSTEM";
  resourceId?: string;
  ipAddress: string;
  details: string;
  userAgent?: string;
  publishedToWorkflow: boolean;
}

// Phase 3 - ABAC Conditions
export interface AbacCondition {
  attribute: "user.role" | "user.clearance" | "user.region" | "resource.owner" | "resource.classification" | "env.timeOfDay" | "env.ipAddress" | "env.location";
  operator: "EQUALS" | "CONTAINS" | "GREATER_THAN" | "LESS_THAN" | "IN_RANGE" | "MATCHES";
  value: string; // Value to compare
}

// Phase 6 - Encryption Services & Cryptography Structures
export interface CryptoKey {
  id: string;
  alias: string;
  algorithm: "AES-256-GCM" | "RSA-2048-OAEP" | "ECDSA-P256";
  version: number;
  publicKey?: string;
  privateKeyEncrypted?: string;
  symmetricKeyEncrypted?: string;
  rotatedAt: string;
  status: "ACTIVE" | "DEPRECATED" | "REVOKED";
}

// Phase 7 - Secrets Management
export interface SecretItem extends BaseSecurityEntity {
  key: string;
  value: string; // Encrypted secret string
  type: "API_SECRET" | "CONNECTOR_SECRET" | "ENCRYPTION_KEY" | "CERTIFICATE" | "ENVIRONMENT_SECRET";
  rotationIntervalDays: number;
  lastRotatedAt: string;
  nextRotationDue: string;
  accessLogs: SecretAccessLog[];
}

export interface SecretAccessLog {
  timestamp: string;
  actorId: string;
  ipAddress: string;
  purpose: string;
}

// Phase 8 - Compliance Governance
export interface ComplianceControl {
  id: string;
  framework: "ISO_27001" | "SOC_2" | "GDPR" | "HIPAA";
  code: string; // e.g. "A.12.6.1"
  name: string;
  description: string;
  status: "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT";
  evidenceCount: number;
  lastReviewedAt: string;
}

export interface EvidenceRecord extends BaseSecurityEntity {
  controlId: string;
  title: string;
  description: string;
  collectedAt: string;
  sourceSystem: string;
  digest: string; // SHA-256 hash of evidence payload
}
