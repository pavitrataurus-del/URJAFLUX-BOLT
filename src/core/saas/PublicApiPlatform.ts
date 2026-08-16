import { ApiKeyRecord, WebhookEndpointRecord, PermissionCode } from '../../types/saas';
import { structuredLogger } from '../telemetry/StructuredLogger';

export class PublicApiPlatform {
  private static instance: PublicApiPlatform;
  private apiKeys: Map<string, ApiKeyRecord> = new Map(); // keyId -> ApiKeyRecord
  private webhooks: Map<string, WebhookEndpointRecord[]> = new Map(); // orgId -> WebhookEndpointRecord[]

  private constructor() {
    this.seedDefaultApiKey();
  }

  public static getInstance(): PublicApiPlatform {
    if (!PublicApiPlatform.instance) {
      PublicApiPlatform.instance = new PublicApiPlatform();
    }
    return PublicApiPlatform.instance;
  }

  public createApiKey(
    organizationId: string,
    name: string,
    scopes: PermissionCode[],
    rateLimitPerMinute: number = 600
  ): { keyRecord: ApiKeyRecord; rawSecretKey: string } {
    const id = `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const prefix = `uf_live_${Math.random().toString(36).substring(2, 8)}`;
    const secretPart = Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);
    const rawSecretKey = `${prefix}_${secretPart}`;

    // Simple hash simulation
    const hashedSecret = `sha256_${rawSecretKey.split('').reverse().join('')}`;

    const keyRecord: ApiKeyRecord = {
      id,
      organizationId,
      name,
      keyPrefix: prefix,
      hashedSecret,
      scopes,
      rateLimitPerMinute,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
    };

    this.apiKeys.set(id, keyRecord);
    structuredLogger.info('PublicApiPlatform', `Generated API Key '${name}' for Org ${organizationId}`);

    return { keyRecord, rawSecretKey };
  }

  public getApiKeys(organizationId: string): ApiKeyRecord[] {
    return Array.from(this.apiKeys.values()).filter((k) => k.organizationId === organizationId && k.status === 'ACTIVE');
  }

  public revokeApiKey(keyId: string): boolean {
    const key = this.apiKeys.get(keyId);
    if (!key) return false;
    key.status = 'REVOKED';
    this.apiKeys.set(keyId, key);
    structuredLogger.info('PublicApiPlatform', `Revoked API Key ${keyId}`);
    return true;
  }

  public registerWebhook(organizationId: string, url: string, events: string[]): WebhookEndpointRecord {
    const record: WebhookEndpointRecord = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      url,
      secret: `whsec_${Math.random().toString(36).substring(2, 16)}`,
      events,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const list = this.webhooks.get(organizationId) || [];
    list.push(record);
    this.webhooks.set(organizationId, list);

    structuredLogger.info('PublicApiPlatform', `Registered Webhook Endpoint ${url} for Org ${organizationId}`);
    return record;
  }

  public getWebhooks(organizationId: string): WebhookEndpointRecord[] {
    return this.webhooks.get(organizationId) || [];
  }

  public generateOpenApiSpec(): object {
    return {
      openapi: '3.0.3',
      info: {
        title: 'URJAFLUX AI OS Enterprise Public REST API',
        version: '1.0.0-RC2',
        description: 'Commercial Public API for Spatial Vectorization, Vastu Engine Execution, and Report Exports.',
      },
      servers: [{ url: 'https://ais-dev-2t6kjtqhf26twrlmmpb7mu-334836357599.asia-southeast1.run.app/api/v1' }],
      paths: {
        '/projects': {
          get: { summary: 'List organization projects', responses: { '200': { description: 'Success' } } },
          post: { summary: 'Create new spatial project', responses: { '201': { description: 'Created' } } },
        },
        '/cad/analyze': {
          post: { summary: 'Submit DXF blueprint for spatial engine analysis', responses: { '200': { description: 'Analysis complete' } } },
        },
        '/reports/generate': {
          post: { summary: 'Generate PDF report', responses: { '200': { description: 'Report PDF ready' } } },
        },
      },
    };
  }

  private seedDefaultApiKey() {
    this.createApiKey('org_default', 'Primary Production API Key', ['ORG_READ', 'PROJECT_READ', 'PROJECT_WRITE', 'AI_EXECUTE_BASIC']);
  }
}

export const publicApiPlatform = PublicApiPlatform.getInstance();
