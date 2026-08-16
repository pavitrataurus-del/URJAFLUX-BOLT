// Module 7: Public API Platform V2 Engine
import { ApiV2Endpoint, ApiKeyCredentialV2 } from "../../types/integrationPlatform";

export class PublicApiPlatformV2Store {
  private apiKeys: Map<string, ApiKeyCredentialV2> = new Map();
  private endpoints: ApiV2Endpoint[] = [
    { path: "/api/v2/cad/projects", method: "GET", version: "v2", summary: "List enterprise CAD architectural projects", requiredScope: "read:projects", rateLimitPerMinute: 300 },
    { path: "/api/v2/cad/analyze", method: "POST", version: "v2", summary: "Execute AI & Vastu analysis on uploaded floorplan", requiredScope: "write:analysis", rateLimitPerMinute: 60 },
    { path: "/api/v2/knowledge/query", method: "POST", version: "v2", summary: "Query RAG knowledge intelligence repository with inline citations", requiredScope: "read:knowledge", rateLimitPerMinute: 120 },
    { path: "/api/v2/plugins/execute", method: "POST", version: "v2", summary: "Execute custom plugin extension handler", requiredScope: "execute:plugins", rateLimitPerMinute: 180 },
    { path: "/api/v2/webhooks/subscribe", method: "POST", version: "v2", summary: "Register outgoing event webhook subscription", requiredScope: "write:webhooks", rateLimitPerMinute: 60 }
  ];

  constructor() {
    this.seedApiKeys();
  }

  private seedApiKeys(): void {
    const defaultKeys: ApiKeyCredentialV2[] = [
      {
        id: "KEY-1001",
        tenantId: "tenant_org_01",
        keyName: "Production CAD Pipeline Ingestion Key",
        keyPrefix: "urja_live_9a8f4211...",
        scopes: ["read:projects", "write:analysis", "read:knowledge", "execute:plugins"],
        rateLimitTier: "ENTERPRISE",
        createdDate: new Date(Date.now() - 86400000 * 30).toISOString(),
        lastUsedDate: new Date().toISOString(),
        status: "ACTIVE"
      },
      {
        id: "KEY-1002",
        tenantId: "tenant_org_01",
        keyName: "Partner Developer Sandbox Key",
        keyPrefix: "urja_test_3b118802...",
        scopes: ["read:projects", "read:knowledge"],
        rateLimitTier: "STANDARD",
        createdDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastUsedDate: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: "ACTIVE"
      }
    ];

    defaultKeys.forEach(k => this.apiKeys.set(k.id, k));
  }

  public createApiKey(
    tenantId: string,
    keyName: string,
    scopes: string[],
    tier: "STANDARD" | "PREMIUM" | "ENTERPRISE" = "ENTERPRISE"
  ): { keyCredential: ApiKeyCredentialV2; secretKey: string } {
    const rawSecret = `urja_${tier.toLowerCase()}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const keyCredential: ApiKeyCredentialV2 = {
      id: `KEY-${Date.now().toString(36).toUpperCase()}`,
      tenantId,
      keyName,
      keyPrefix: `${rawSecret.substring(0, 15)}...`,
      scopes,
      rateLimitTier: tier,
      createdDate: new Date().toISOString(),
      status: "ACTIVE"
    };

    this.apiKeys.set(keyCredential.id, keyCredential);
    return { keyCredential, secretKey: rawSecret };
  }

  public getEndpoints(): ApiV2Endpoint[] {
    return this.endpoints;
  }

  public getApiKeys(tenantId?: string): ApiKeyCredentialV2[] {
    const list = Array.from(this.apiKeys.values());
    if (!tenantId) return list;
    return list.filter(k => k.tenantId === tenantId || k.tenantId === "global_tenant");
  }

  public generateOpenApiSpec(): Record<string, unknown> {
    return {
      openapi: "3.0.3",
      info: {
        title: "URJAFLUX AI OS Enterprise Public API V2",
        version: "2.0.0",
        description: "OpenAPI specification for URJAFLUX integration platform APIs."
      },
      paths: this.endpoints.reduce((acc, ep) => {
        acc[ep.path] = {
          [ep.method.toLowerCase()]: {
            summary: ep.summary,
            security: [{ ApiKeyAuth: [] }],
            responses: {
              "200": { description: "Successful response" },
              "401": { description: "Invalid or missing API Key" },
              "429": { description: "Rate limit exceeded" }
            }
          }
        };
        return acc;
      }, {} as Record<string, unknown>)
    };
  }
}

export const PublicApiPlatformV2 = new PublicApiPlatformV2Store();
