// Module 13: Knowledge Base Auto-Sync & Webhook Ingestion Engine
import { AutoSyncSourceConfig } from "../../types/knowledgeIntelligence";

class KnowledgeAutoSyncServiceStore {
  private syncConfigs: AutoSyncSourceConfig[] = [];

  constructor() {
    this.seedInitialConfigs();
  }

  private seedInitialConfigs(): void {
    this.syncConfigs.push(
      {
        id: "SYNC-1001",
        tenantId: "tenant_org_01",
        sourceName: "Corporate S3 Architecture Repository",
        type: "S3_BUCKET",
        endpointUrl: "https://s3.us-west-2.amazonaws.com/urjaflux-corp-kb",
        syncFrequencyMinutes: 60,
        lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
        nextSyncAt: new Date(Date.now() + 3600000).toISOString(),
        status: "ACTIVE",
        documentsIngested: 12,
        createdAt: new Date().toISOString()
      },
      {
        id: "SYNC-1002",
        tenantId: "tenant_org_01",
        sourceName: "Enterprise Google Drive Policy Folder",
        type: "GOOGLE_DRIVE",
        endpointUrl: "https://www.googleapis.com/drive/v3/files?q=vastu_policies",
        syncFrequencyMinutes: 120,
        lastSyncAt: new Date(Date.now() - 7200000).toISOString(),
        nextSyncAt: new Date(Date.now() + 7200000).toISOString(),
        status: "ACTIVE",
        documentsIngested: 8,
        createdAt: new Date().toISOString()
      }
    );
  }

  public getSyncConfigs(tenantId: string): AutoSyncSourceConfig[] {
    return this.syncConfigs.filter(
      s => s.tenantId === tenantId || s.tenantId === "global_tenant"
    );
  }

  public triggerManualSync(configId: string): boolean {
    const config = this.syncConfigs.find(s => s.id === configId);
    if (!config) return false;
    config.lastSyncAt = new Date().toISOString();
    config.nextSyncAt = new Date(Date.now() + config.syncFrequencyMinutes * 60000).toISOString();
    config.documentsIngested += 1;
    return true;
  }

  public addSyncConfig(
    tenantId: string,
    sourceName: string,
    type: AutoSyncSourceConfig["type"],
    endpointUrl: string,
    syncFrequencyMinutes: number = 60
  ): AutoSyncSourceConfig {
    const config: AutoSyncSourceConfig = {
      id: `SYNC-${Date.now().toString(36).toUpperCase()}`,
      tenantId,
      sourceName,
      type,
      endpointUrl,
      syncFrequencyMinutes,
      status: "ACTIVE",
      documentsIngested: 0,
      createdAt: new Date().toISOString()
    };

    this.syncConfigs.unshift(config);
    return config;
  }
}

export const KnowledgeAutoSyncService = new KnowledgeAutoSyncServiceStore();
