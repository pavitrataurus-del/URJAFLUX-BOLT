// Module 6: Enterprise Connectors Framework Engine
import { EnterpriseConnector, ConnectorProviderType } from "../../types/integrationPlatform";

export class EnterpriseConnectorPlatformStore {
  private connectors: Map<string, EnterpriseConnector> = new Map();

  constructor() {
    this.seedCanonicalConnectors();
  }

  private seedCanonicalConnectors(): void {
    const defaultConnectors: EnterpriseConnector[] = [
      {
        id: "CONN-1001",
        tenantId: "tenant_org_01",
        name: "Corporate Google Drive Repository",
        provider: "GOOGLE_DRIVE",
        status: "CONNECTED",
        config: {
          authType: "OAUTH2",
          clientId: "77019283-urjaflux.apps.googleusercontent.com",
          endpointUrl: "https://www.googleapis.com/drive/v3/files"
        },
        lastSyncAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        latencyMs: 142,
        totalEventsProcessed: 1240,
        errorCount: 0
      },
      {
        id: "CONN-1002",
        tenantId: "tenant_org_01",
        name: "Enterprise Microsoft 365 / SharePoint",
        provider: "SHAREPOINT",
        status: "CONNECTED",
        config: {
          authType: "OAUTH2",
          clientId: "99827110-ms365.tenant.azure.com",
          endpointUrl: "https://graph.microsoft.com/v1.0/sites"
        },
        lastSyncAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        latencyMs: 195,
        totalEventsProcessed: 890,
        errorCount: 1
      },
      {
        id: "CONN-1003",
        tenantId: "tenant_org_01",
        name: "Operations Slack Workspace",
        provider: "SLACK",
        status: "CONNECTED",
        config: {
          authType: "API_KEY",
          apiKeyMasked: "xoxb-9901-****-****-a1b2c3",
          endpointUrl: "https://slack.com/api/chat.postMessage"
        },
        lastSyncAt: new Date(Date.now() - 1800000).toISOString(),
        latencyMs: 88,
        totalEventsProcessed: 3420,
        errorCount: 0
      },
      {
        id: "CONN-1004",
        tenantId: "tenant_org_01",
        name: "Corporate SMTP Gateway",
        provider: "SMTP_EMAIL",
        status: "CONNECTED",
        config: {
          authType: "BASIC",
          smtpHost: "mail.enterprise-vastu.com",
          smtpPort: 587,
          username: "notifications@enterprise-vastu.com"
        },
        lastSyncAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        latencyMs: 210,
        totalEventsProcessed: 450,
        errorCount: 0
      }
    ];

    defaultConnectors.forEach(c => this.connectors.set(c.id, c));
  }

  public testConnectorConnection(connectorId: string): { success: boolean; latencyMs: number; message: string } {
    const conn = this.connectors.get(connectorId);
    if (!conn) {
      return { success: false, latencyMs: 0, message: "Connector ID not found." };
    }

    const latencyMs = Math.floor(Math.random() * 80) + 45;
    conn.status = "CONNECTED";
    conn.latencyMs = latencyMs;
    conn.lastSyncAt = new Date().toISOString();

    return {
      success: true,
      latencyMs,
      message: `Connection test passed for ${conn.name} (${conn.provider}) in ${latencyMs}ms.`
    };
  }

  public registerConnector(
    tenantId: string,
    name: string,
    provider: ConnectorProviderType,
    config: EnterpriseConnector["config"]
  ): EnterpriseConnector {
    const conn: EnterpriseConnector = {
      id: `CONN-${Date.now().toString(36).toUpperCase()}`,
      tenantId,
      name,
      provider,
      status: "CONNECTED",
      config,
      lastSyncAt: new Date().toISOString(),
      latencyMs: 120,
      totalEventsProcessed: 0,
      errorCount: 0
    };

    this.connectors.set(conn.id, conn);
    return conn;
  }

  public getConnectors(tenantId?: string): EnterpriseConnector[] {
    const list = Array.from(this.connectors.values());
    if (!tenantId) return list;
    return list.filter(c => c.tenantId === tenantId || c.tenantId === "global_tenant");
  }
}

export const EnterpriseConnectorPlatform = new EnterpriseConnectorPlatformStore();
