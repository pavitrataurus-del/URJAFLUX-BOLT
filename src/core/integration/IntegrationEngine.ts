import {
  ApiDefinition,
  ApiVersion,
  ApiConsumer,
  ApiCredential,
  Connector,
  ConnectorConfiguration,
  ConnectorExecution,
  IntegrationProfile,
  WebhookSubscription,
  WebhookDelivery,
  ImportJob,
  ExportJob
} from "./IntegrationTypes";

export interface RequestLog {
  id: string;
  timestamp: string;
  consumerName: string;
  authType: 'API_KEY' | 'OAUTH2' | 'BASIC' | 'NONE';
  method: string;
  endpoint: string;
  protocol: 'REST' | 'GRAPHQL';
  statusCode: number;
  latencyMs: number;
  payloadSizeKb: number;
  errorMessage?: string;
}

export class IntegrationEngine {
  private static instance: IntegrationEngine | null = null;

  private apiDefinitions: ApiDefinition[] = [];
  private apiConsumers: ApiConsumer[] = [];
  private connectors: Connector[] = [];
  private webhookSubscriptions: WebhookSubscription[] = [];
  private webhookDeliveries: WebhookDelivery[] = [];
  private connectorExecutions: ConnectorExecution[] = [];
  private importJobs: ImportJob[] = [];
  private exportJobs: ExportJob[] = [];
  private requestLogs: RequestLog[] = [];
  private rateLimits: Record<string, { requestsThisMinute: number; windowStart: number }> = {};

  private constructor() {
    this.loadFromStorage();
    if (this.apiDefinitions.length === 0) {
      this.seedInitialData();
    }
  }

  public static getInstance(): IntegrationEngine {
    if (!this.instance) {
      this.instance = new IntegrationEngine();
    }
    return this.instance;
  }

  private loadFromStorage() {
    try {
      const apiDefs = localStorage.getItem("urjaflux_api_definitions");
      const consumers = localStorage.getItem("urjaflux_api_consumers");
      const conns = localStorage.getItem("urjaflux_api_connectors");
      const subs = localStorage.getItem("urjaflux_webhook_subs");
      const deliveries = localStorage.getItem("urjaflux_webhook_deliveries");
      const connExecs = localStorage.getItem("urjaflux_connector_executions");
      const imports = localStorage.getItem("urjaflux_import_jobs");
      const exportsList = localStorage.getItem("urjaflux_export_jobs");
      const logs = localStorage.getItem("urjaflux_api_request_logs");

      if (apiDefs) this.apiDefinitions = JSON.parse(apiDefs);
      if (consumers) this.apiConsumers = JSON.parse(consumers);
      if (conns) this.connectors = JSON.parse(conns);
      if (subs) this.webhookSubscriptions = JSON.parse(subs);
      if (deliveries) this.webhookDeliveries = JSON.parse(deliveries);
      if (connExecs) this.connectorExecutions = JSON.parse(connExecs);
      if (imports) this.importJobs = JSON.parse(imports);
      if (exportsList) this.exportJobs = JSON.parse(exportsList);
      if (logs) this.requestLogs = JSON.parse(logs);
    } catch (e) {
      console.error("Error loading Integration data from storage", e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("urjaflux_api_definitions", JSON.stringify(this.apiDefinitions));
      localStorage.setItem("urjaflux_api_consumers", JSON.stringify(this.apiConsumers));
      localStorage.setItem("urjaflux_api_connectors", JSON.stringify(this.connectors));
      localStorage.setItem("urjaflux_webhook_subs", JSON.stringify(this.webhookSubscriptions));
      localStorage.setItem("urjaflux_webhook_deliveries", JSON.stringify(this.webhookDeliveries));
      localStorage.setItem("urjaflux_connector_executions", JSON.stringify(this.connectorExecutions));
      localStorage.setItem("urjaflux_import_jobs", JSON.stringify(this.importJobs));
      localStorage.setItem("urjaflux_export_jobs", JSON.stringify(this.exportJobs));
      localStorage.setItem("urjaflux_api_request_logs", JSON.stringify(this.requestLogs));
    } catch (e) {
      console.error("Error saving Integration data to storage", e);
    }
  }

  private seedInitialData() {
    this.apiDefinitions = [
      {
        id: "api_vastu_core",
        version: 1,
        status: "ACTIVE",
        owner: "api_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { category: "core" },
        name: "URJAFLUX Core REST API Gateway",
        description: "Exposes secure public REST endpoints for Consultations, Spatial CAD pin integrations, and Vision AI Inspections.",
        basePath: "/api/v1",
        type: "REST",
        rateLimitTier: "PREMIUM",
        versions: [
          { id: "v_v1", versionString: "v1.0.0", status: "CURRENT", releasedAt: new Date().toISOString(), endpointsCount: 12 },
          { id: "v_v2", versionString: "v2.0.0-rc1", status: "CURRENT", releasedAt: new Date().toISOString(), endpointsCount: 15 }
        ]
      },
      {
        id: "api_vastu_graphql",
        version: 1,
        status: "ACTIVE",
        owner: "api_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { category: "core" },
        name: "URJAFLUX GraphQL Gateway",
        description: "Unified graph interface for deep querying across Consultations, Reports, and CAD Floor Plan attributes with field-level role filtering.",
        basePath: "/graphql",
        type: "GRAPHQL",
        rateLimitTier: "ENTERPRISE",
        versions: [
          { id: "v_gql_v1", versionString: "v1", status: "CURRENT", releasedAt: new Date().toISOString(), endpointsCount: 1 }
        ]
      }
    ];

    this.apiConsumers = [
      {
        id: "consumer_astrovastu_inc",
        version: 1,
        status: "ACTIVE",
        owner: "api_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { tier: "Enterprise" },
        name: "AstroVastu Solutions Inc.",
        email: "dev@astrovastu.com",
        company: "AstroVastu Solutions Inc.",
        tier: "ENTERPRISE",
        credentials: [
          {
            id: "cred_1",
            name: "Production API Key",
            apiKeyHex: "uj_live_7d9e2b10a5f3bc814e6d",
            clientId: "client_astrovastu_prod",
            clientSecretHex: "sh_prod_902f837da2c8b",
            status: "ACTIVE",
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: "consumer_delhi_builders",
        version: 1,
        status: "ACTIVE",
        owner: "api_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { tier: "Premium" },
        name: "Delhi Smart Builders Association",
        email: "integrations@delhibuilders.org",
        company: "Delhi Smart Builders Association",
        tier: "PREMIUM",
        credentials: [
          {
            id: "cred_2",
            name: "Sandbox Key",
            apiKeyHex: "uj_test_239dfa189cb7e6d1c81a",
            clientId: "client_delhibuilders_sandbox",
            status: "ACTIVE",
            createdAt: new Date().toISOString()
          }
        ]
      }
    ];

    this.connectors = [
      {
        id: "conn_sap_erp",
        version: 1,
        status: "ACTIVE",
        owner: "connector_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { vendor: "SAP" },
        name: "SAP S/4HANA ERP Connector",
        provider: "ERP_SAP",
        type: "BIDIRECTIONAL",
        connectionStatus: "CONNECTED",
        lastSyncAt: new Date().toISOString(),
        configuration: {
          endpointUrl: "https://sap-api-gateway.urjaflux-internal.net/odata/v2",
          authType: "OAUTH2",
          timeoutMs: 8000,
          retryCount: 3,
          syncIntervalCron: "0 */2 * * *"
        }
      },
      {
        id: "conn_salesforce_crm",
        version: 1,
        status: "ACTIVE",
        owner: "connector_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { vendor: "Salesforce" },
        name: "Salesforce CRM Lead Pipeline",
        provider: "CRM_SALESFORCE",
        type: "INBOUND",
        connectionStatus: "CONNECTED",
        lastSyncAt: new Date().toISOString(),
        configuration: {
          endpointUrl: "https://urjaflux.my.salesforce.com/services/data/v58.0",
          authType: "OAUTH2",
          timeoutMs: 5000,
          retryCount: 2,
          syncIntervalCron: "*/30 * * * *"
        }
      },
      {
        id: "conn_arcgis",
        version: 1,
        status: "ACTIVE",
        owner: "connector_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { vendor: "Esri" },
        name: "ArcGIS Spatial Mapping Adapter",
        provider: "GIS_ARCGIS",
        type: "OUTBOUND",
        connectionStatus: "CONNECTED",
        lastSyncAt: new Date().toISOString(),
        configuration: {
          endpointUrl: "https://gis.urjaflux.com/arcgis/rest/services",
          authType: "API_KEY",
          timeoutMs: 10000,
          retryCount: 4,
          syncIntervalCron: "0 0 * * *"
        }
      },
      {
        id: "conn_slack_alerts",
        version: 1,
        status: "ACTIVE",
        owner: "connector_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { vendor: "Slack" },
        name: "Slack Workflow Communications",
        provider: "MESSAGING_SLACK",
        type: "OUTBOUND",
        connectionStatus: "CONNECTED",
        lastSyncAt: new Date().toISOString(),
        configuration: {
          endpointUrl: "https://hooks.slack.com/services/T0123/B4567/W9988",
          authType: "API_KEY",
          timeoutMs: 3000,
          retryCount: 1
        }
      }
    ];

    this.webhookSubscriptions = [
      {
        id: "sub_1",
        version: 1,
        status: "ACTIVE",
        owner: "consumer_astrovastu_inc",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        url: "https://api.astrovastu.com/urjaflux-webhook-listener",
        secretToken: "whsec_9d3e8b27cf105da18cb",
        events: ["DOMAIN-012.DEFECT_DETECTED", "DOMAIN-013.WORKFLOW_SLA_BREACHED"],
        retryPolicy: {
          maxRetries: 5,
          backoffMultiplier: 2
        }
      },
      {
        id: "sub_2",
        version: 1,
        status: "ACTIVE",
        owner: "consumer_delhi_builders",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        url: "https://integrations.delhibuilders.org/webhooks/receive",
        secretToken: "whsec_2a18fb7e03cd451d8b2",
        events: ["DOMAIN-013.WORKFLOW_COMPLETED", "DOMAIN-014.COMMENT_POSTED"],
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 1.5
        }
      }
    ];

    this.webhookDeliveries = [
      {
        id: "del_1",
        subscriptionId: "sub_1",
        eventId: "evt_def_102",
        eventName: "DOMAIN-012.DEFECT_DETECTED",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        payloadPreview: '{"defectId":"def_002","severity":"HIGH","location":"Northeast Corner","confidence":0.98}',
        deliveryStatus: "SUCCESS",
        responseCode: 200,
        latencyMs: 145,
        attemptNumber: 1
      },
      {
        id: "del_2",
        subscriptionId: "sub_1",
        eventId: "evt_sla_992",
        eventName: "DOMAIN-013.WORKFLOW_SLA_BREACHED",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        payloadPreview: '{"workflowId":"wf_dwarka_block_a","taskId":"task_remediation_approval","delayHours":4}',
        deliveryStatus: "SUCCESS",
        responseCode: 200,
        latencyMs: 310,
        attemptNumber: 2
      }
    ];

    this.connectorExecutions = [
      {
        id: "exec_sap_1",
        connectorId: "conn_sap_erp",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: "SUCCESS",
        recordsProcessed: 14,
        recordsFailed: 0,
        payloadSizeKb: 148,
        latencyMs: 1240
      },
      {
        id: "exec_salesforce_1",
        connectorId: "conn_salesforce_crm",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: "SUCCESS",
        recordsProcessed: 5,
        recordsFailed: 1,
        errorMessage: "Record row 4 missing validation phone number structure",
        payloadSizeKb: 24,
        latencyMs: 650
      }
    ];

    this.requestLogs = [
      {
        id: "log_req_1",
        timestamp: new Date(Date.now() - 900000).toISOString(),
        consumerName: "AstroVastu Solutions Inc.",
        authType: "API_KEY",
        method: "GET",
        endpoint: "/api/v1/consultations?limit=10&offset=0",
        protocol: "REST",
        statusCode: 200,
        latencyMs: 42,
        payloadSizeKb: 12.4
      },
      {
        id: "log_req_2",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        consumerName: "Delhi Smart Builders Association",
        authType: "API_KEY",
        method: "POST",
        endpoint: "/api/v1/spatial/pins",
        protocol: "REST",
        statusCode: 201,
        latencyMs: 112,
        payloadSizeKb: 1.8
      },
      {
        id: "log_req_3",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        consumerName: "AstroVastu Solutions Inc.",
        authType: "API_KEY",
        method: "POST",
        endpoint: "/graphql",
        protocol: "GRAPHQL",
        statusCode: 200,
        latencyMs: 88,
        payloadSizeKb: 3.5
      }
    ];

    this.importJobs = [
      {
        id: "imp_job_1",
        version: 1,
        status: "COMPLETED",
        owner: "user_pavitra",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        metadata: { size: "45KB" },
        fileName: "dwarka_sector_12_inspections.csv",
        fileType: "CSV",
        targetDomain: "DOMAIN-012",
        recordsCount: 150,
        successCount: 148,
        failedCount: 2,
        errorLog: "Row 12: Column 'coordinateX' must be a valid float.\nRow 88: Column 'defectType' exceeds character limit."
      }
    ];

    this.exportJobs = [
      {
        id: "exp_job_1",
        version: 1,
        status: "COMPLETED",
        owner: "user_pavitra",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        metadata: {},
        jobType: "JSON",
        sourceDomain: "DOMAIN-011",
        queryCriteria: "workspaceId = 'ws_site_audit_delhi' AND severity = 'CRITICAL'",
        recordsCount: 42,
        downloadUrl: "#"
      }
    ];

    this.saveToStorage();
  }

  // --- API DEFINITIONS ---
  public getApiDefinitions(): ApiDefinition[] {
    return this.apiDefinitions;
  }

  // --- CONSUMERS & CREDENTIALS ---
  public getConsumers(): ApiConsumer[] {
    return this.apiConsumers;
  }

  public createConsumer(name: string, email: string, company: string, tier: 'STANDARD' | 'PREMIUM' | 'ENTERPRISE'): ApiConsumer {
    const newConsumer: ApiConsumer = {
      id: "consumer_" + Math.random().toString(36).substring(2, 11),
      version: 1,
      status: "ACTIVE",
      owner: "api_admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      name,
      email,
      company,
      tier,
      credentials: []
    };
    this.apiConsumers.push(newConsumer);
    this.saveToStorage();
    return newConsumer;
  }

  public generateApiKey(consumerId: string, name: string): ApiCredential {
    const consumerIndex = this.apiConsumers.findIndex(c => c.id === consumerId);
    if (consumerIndex === -1) {
      throw new Error(`Consumer with ID ${consumerId} not found`);
    }

    const keyPrefix = this.apiConsumers[consumerIndex].tier === 'ENTERPRISE' ? 'uj_live_ent_' : 'uj_live_';
    const randHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const apiKeyHex = `${keyPrefix}${randHex}`;
    const clientId = `client_${consumerId.substring(9)}_${Math.floor(Math.random() * 1000)}`;

    const newCred: ApiCredential = {
      id: "cred_" + Math.random().toString(36).substring(2, 9),
      name,
      apiKeyHex,
      clientId,
      clientSecretHex: "sh_secret_" + Math.random().toString(36).substring(2, 11),
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };

    this.apiConsumers[consumerIndex].credentials.push(newCred);
    this.apiConsumers[consumerIndex].updatedAt = new Date().toISOString();
    this.saveToStorage();
    return newCred;
  }

  public revokeCredential(consumerId: string, credentialId: string): void {
    const consumerIndex = this.apiConsumers.findIndex(c => c.id === consumerId);
    if (consumerIndex === -1) return;

    const creds = this.apiConsumers[consumerIndex].credentials;
    const credIndex = creds.findIndex(cr => cr.id === credentialId);
    if (credIndex === -1) return;

    creds[credIndex].status = 'REVOKED';
    this.apiConsumers[consumerIndex].updatedAt = new Date().toISOString();
    this.saveToStorage();
  }

  // --- CONNECTORS ---
  public getConnectors(): Connector[] {
    return this.connectors;
  }

  public createConnector(name: string, provider: Connector['provider'], type: Connector['type'], config: ConnectorConfiguration): Connector {
    const newConnector: Connector = {
      id: "conn_" + Math.random().toString(36).substring(2, 11),
      version: 1,
      status: "ACTIVE",
      owner: "connector_admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      name,
      provider,
      type,
      connectionStatus: "CONNECTED",
      configuration: config
    };
    this.connectors.push(newConnector);
    this.saveToStorage();
    return newConnector;
  }

  public updateConnectorStatus(id: string, status: Connector['connectionStatus']): void {
    const idx = this.connectors.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.connectors[idx].connectionStatus = status;
      this.connectors[idx].updatedAt = new Date().toISOString();
      this.saveToStorage();
    }
  }

  public triggerConnectorSync(id: string): ConnectorExecution {
    const connector = this.connectors.find(c => c.id === id);
    if (!connector) throw new Error("Connector not found");

    const latencyMs = Math.floor(Math.random() * 1200) + 150;
    const success = Math.random() > 0.15;
    const records = Math.floor(Math.random() * 50) + 1;
    const failed = success ? 0 : Math.floor(Math.random() * 4) + 1;

    const execution: ConnectorExecution = {
      id: "exec_" + Math.random().toString(36).substring(2, 11),
      connectorId: id,
      timestamp: new Date().toISOString(),
      status: success ? "SUCCESS" : failed > 0 && records > failed ? "PARTIAL" : "FAILED",
      recordsProcessed: records,
      recordsFailed: failed,
      errorMessage: success ? undefined : "Connection timeout / API signature validation failure on external gateway endpoint",
      payloadSizeKb: Math.floor(Math.random() * 200) + 10,
      latencyMs
    };

    connector.lastSyncAt = new Date().toISOString();
    connector.connectionStatus = success ? "CONNECTED" : "ERROR";
    this.connectorExecutions.unshift(execution);

    // Keep execution logs bounded
    if (this.connectorExecutions.length > 50) {
      this.connectorExecutions.pop();
    }

    this.saveToStorage();
    return execution;
  }

  public getConnectorExecutions(): ConnectorExecution[] {
    return this.connectorExecutions;
  }

  // --- WEBHOOKS ---
  public getWebhookSubscriptions(): WebhookSubscription[] {
    return this.webhookSubscriptions;
  }

  public createWebhookSubscription(url: string, events: string[], secretToken: string): WebhookSubscription {
    const sub: WebhookSubscription = {
      id: "sub_" + Math.random().toString(36).substring(2, 11),
      version: 1,
      status: "ACTIVE",
      owner: "api_admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      url,
      secretToken: secretToken || "whsec_" + Math.random().toString(36).substring(2, 11),
      events,
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2
      }
    };
    this.webhookSubscriptions.push(sub);
    this.saveToStorage();
    return sub;
  }

  public deleteWebhookSubscription(id: string): void {
    this.webhookSubscriptions = this.webhookSubscriptions.filter(s => s.id !== id);
    this.saveToStorage();
  }

  public getWebhookDeliveries(): WebhookDelivery[] {
    return this.webhookDeliveries;
  }

  // Webhook Dispatch simulation (consumed from cross-domain triggers)
  public triggerWebhookEvent(eventName: string, payload: Record<string, any>): void {
    const activeSubs = this.webhookSubscriptions.filter(sub => sub.status === "ACTIVE" && sub.events.includes(eventName));

    activeSubs.forEach(sub => {
      const latencyMs = Math.floor(Math.random() * 400) + 50;
      const deliverySuccess = Math.random() > 0.1;
      const responseCode = deliverySuccess ? 200 : [500, 502, 504, 404][Math.floor(Math.random() * 4)];

      const delivery: WebhookDelivery = {
        id: "del_" + Math.random().toString(36).substring(2, 11),
        subscriptionId: sub.id,
        eventId: "evt_" + Math.random().toString(36).substring(2, 11),
        eventName,
        timestamp: new Date().toISOString(),
        payloadPreview: JSON.stringify(payload),
        deliveryStatus: deliverySuccess ? "SUCCESS" : "FAILED",
        responseCode,
        latencyMs,
        attemptNumber: 1
      };

      this.webhookDeliveries.unshift(delivery);

      // Webhook Retries Engine simulation if failed
      if (!deliverySuccess && sub.retryPolicy.maxRetries > 0) {
        // Queue simulation of a retry attempt
        setTimeout(() => {
          const secondSuccess = Math.random() > 0.4;
          const retryDelivery: WebhookDelivery = {
            id: "del_retry_" + Math.random().toString(36).substring(2, 11),
            subscriptionId: sub.id,
            eventId: delivery.eventId,
            eventName,
            timestamp: new Date().toISOString(),
            payloadPreview: JSON.stringify(payload),
            deliveryStatus: secondSuccess ? "SUCCESS" : "FAILED",
            responseCode: secondSuccess ? 200 : 503,
            latencyMs: Math.floor(Math.random() * 500) + 100,
            attemptNumber: 2
          };
          this.webhookDeliveries.unshift(retryDelivery);
          this.saveToStorage();
        }, 1500);
      }
    });

    if (this.webhookDeliveries.length > 50) {
      this.webhookDeliveries.splice(50);
    }
    this.saveToStorage();
  }

  // --- IMPORT / EXPORT PIPELINE ---
  public getImportJobs(): ImportJob[] {
    return this.importJobs;
  }

  public getExportJobs(): ExportJob[] {
    return this.exportJobs;
  }

  public submitImportJob(fileName: string, fileType: ImportJob['fileType'], content: string, targetDomain: ImportJob['targetDomain']): ImportJob {
    // Perform simulated mapping transformations and validation checks
    const lines = content.split("\n").filter(l => l.trim().length > 0);
    const recordsCount = lines.length ? lines.length - 1 : 0; // assuming header line

    let successCount = recordsCount;
    let failedCount = 0;
    let errorLog = "";

    if (recordsCount > 0) {
      // Simulate validation / transformation failures
      if (fileType === "CSV") {
        failedCount = Math.floor(recordsCount * 0.04);
        successCount = recordsCount - failedCount;
        if (failedCount > 0) {
          errorLog = `Validation pipeline report for ${fileName}:\n`;
          for (let i = 0; i < failedCount; i++) {
            errorLog += `[Row ${Math.floor(Math.random() * recordsCount) + 2}]: Invalid direction string or coordinate mapping out of range boundaries.\n`;
          }
        }
      }
    }

    const job: ImportJob = {
      id: "imp_" + Math.random().toString(36).substring(2, 11),
      version: 1,
      status: failedCount === recordsCount ? "FAILED" : "COMPLETED",
      owner: "user_pavitra",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { columnsDetected: ["id", "title", "remediation", "energy_offset", "creation_date"] },
      fileName,
      fileType,
      targetDomain,
      recordsCount,
      successCount,
      failedCount,
      errorLog: errorLog || undefined
    };

    this.importJobs.unshift(job);
    this.saveToStorage();
    return job;
  }

  public submitExportJob(jobType: ExportJob['jobType'], sourceDomain: ExportJob['sourceDomain'], queryCriteria: string): ExportJob {
    const job: ExportJob = {
      id: "exp_" + Math.random().toString(36).substring(2, 11),
      version: 1,
      status: "COMPLETED",
      owner: "user_pavitra",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      jobType,
      sourceDomain,
      queryCriteria,
      recordsCount: Math.floor(Math.random() * 80) + 12,
      downloadUrl: "#download-simulated"
    };

    this.exportJobs.unshift(job);
    this.saveToStorage();
    return job;
  }

  // --- RATE LIMITING & ROUTING SIMULATION ---
  public getRequestLogs(): RequestLog[] {
    return this.requestLogs;
  }

  public simulateApiCall(
    apiKey: string,
    protocol: 'REST' | 'GRAPHQL',
    method: string,
    endpoint: string,
    payloadSizeKb: number = 2.5
  ): { status: number; body: any; headers: Record<string, string> } {
    const timestamp = new Date().toISOString();
    const consumer = this.apiConsumers.find(c => c.credentials.some(cr => cr.apiKeyHex === apiKey && cr.status === "ACTIVE"));

    // Rate Limiting Logic Check
    const nowSecs = Math.floor(Date.now() / 1000);
    const minuteBucket = Math.floor(nowSecs / 60);
    const limitKey = consumer ? consumer.id : "anonymous";
    const bucket = this.rateLimits[limitKey] || { requestsThisMinute: 0, windowStart: minuteBucket };

    if (bucket.windowStart !== minuteBucket) {
      bucket.requestsThisMinute = 0;
      bucket.windowStart = minuteBucket;
    }

    const maxAllowed = consumer ? (consumer.tier === 'ENTERPRISE' ? 100 : 50) : 5;
    bucket.requestsThisMinute += 1;
    this.rateLimits[limitKey] = bucket;

    const rateLimited = bucket.requestsThisMinute > maxAllowed;
    const isGql = protocol === "GRAPHQL";
    const consumerName = consumer ? consumer.name : "Anonymous Consumer";

    if (!consumer && apiKey !== "dev_portal") {
      const errorResponse = {
        error: {
          code: "UNAUTHORIZED",
          message: "API Key is missing or revoked. Provide a valid 'X-Urjaflux-API-Key' header value.",
          timestamp
        }
      };
      this.logRequest(consumerName, 'NONE', method, endpoint, protocol, 401, 12, 0.4, "Invalid API Credential");
      return { status: 401, body: errorResponse, headers: { "X-Urjaflux-Response": "gateway-blocked" } };
    }

    if (rateLimited) {
      const errorResponse = {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too Many Requests. Rate limit of ${maxAllowed} req/min exceeded for client tier ${consumer?.tier || 'ANONYMOUS'}.`,
          retryAfterSeconds: 60 - (nowSecs % 60)
        }
      };
      this.logRequest(consumerName, 'API_KEY', method, endpoint, protocol, 429, 5, 0.3, "Rate Limit Exceeded");
      return { status: 429, body: errorResponse, headers: { "Retry-After": String(60 - (nowSecs % 60)) } };
    }

    // Process simulation responses cleanly for actual domains
    const latencyMs = Math.floor(Math.random() * 95) + 8;
    let status = 200;
    let responseBody: any = {};

    if (isGql) {
      // GraphQL query dispatcher mock
      responseBody = this.executeMockGraphQL(endpoint); // endpoint passes GraphQL Query
    } else {
      // REST routes validation & paging simulation
      const cleanUrl = endpoint.split("?")[0];
      if (cleanUrl.includes("/consultations")) {
        responseBody = {
          data: [
            { id: "c_9012", clientName: "Dwarka Sector 12", astrologer: "Dr. Sharma", energyChakrasScore: 82, lastSession: "2026-07-24" },
            { id: "c_3345", clientName: "Pavitra Residence", astrologer: "System Engine", energyChakrasScore: 91, lastSession: "2026-07-25" }
          ],
          pagination: { limit: 10, offset: 0, total: 2, hasMore: false },
          version: "v1.0.0"
        };
      } else if (cleanUrl.includes("/spatial/pins")) {
        status = 201;
        responseBody = {
          success: true,
          pinId: "pin_" + Math.random().toString(36).substring(2, 9),
          message: "Spatial remediation coordinates-pin successfully indexed in DOMAIN-011 layout mapping records.",
          coordinates: [45.8, 12.4]
        };
      } else if (cleanUrl.includes("/reports")) {
        responseBody = {
          reportId: "rep_392f",
          clientName: "Dwarka Office Complex",
          scores: { elementalBalance: 88, spatialScore: 74, overall: 81 },
          certifiedAt: new Date().toISOString()
        };
      } else if (cleanUrl.includes("/vision/crack-analysis")) {
        responseBody = {
          analysisId: "vis_crack_98f",
          severity: "MEDIUM",
          crackWidthMm: 2.4,
          confidence: 0.94,
          remediationSuggested: "Cement grouting + energized copper spiral pin overlay at Northeast perimeter wall"
        };
      } else if (cleanUrl.includes("/workflows")) {
        responseBody = {
          activeWorkflows: [
            { id: "wf_dwarka_block_a", name: "SLA Remediation", progressPercentage: 65, activeTask: "Approval" }
          ]
        };
      } else {
        status = 404;
        responseBody = {
          error: {
            code: "ROUTE_NOT_FOUND",
            message: `The endpoint ${endpoint} is not mapped in the API Gateway. Refer to the interactive schema documentation.`
          }
        };
      }
    }

    this.logRequest(consumerName, 'API_KEY', method, endpoint, protocol, status, latencyMs, payloadSizeKb);
    return {
      status,
      body: responseBody,
      headers: {
        "X-RateLimit-Limit": String(maxAllowed),
        "X-RateLimit-Remaining": String(Math.max(0, maxAllowed - bucket.requestsThisMinute)),
        "X-Urjaflux-Signature-Verified": "true"
      }
    };
  }

  private executeMockGraphQL(query: string): any {
    // Basic parser for interactive playground
    const lowercaseQuery = query.toLowerCase();
    if (lowercaseQuery.includes("consultationthreads")) {
      return {
        data: {
          consultationThreads: [
            { id: "c_9012", clientName: "Dwarka Sector 12", sessionType: "ASTRO_VASTU", status: "COMPLETED" },
            { id: "c_3345", clientName: "Pavitra Residence", sessionType: "CHAKRA_GRID", status: "ACTIVE" }
          ]
        }
      };
    }
    if (lowercaseQuery.includes("spatialpins")) {
      return {
        data: {
          spatialPins: [
            { id: "pin_81a", coordinates: [12.5, 45.9], element: "WATER", status: "RESOLVED" },
            { id: "pin_23b", coordinates: [88.0, 11.2], element: "FIRE", status: "PENDING" }
          ]
        }
      };
    }
    if (lowercaseQuery.includes("integrationhealth")) {
      return {
        data: {
          integrationHealth: {
            apiGatewayStatus: "HEALTHY",
            uptimeSeconds: 125840,
            activeConsumersCount: this.apiConsumers.length,
            activeWebhooksCount: this.webhookSubscriptions.length
          }
        }
      };
    }

    return {
      data: {
        genericMessage: "GraphQL Query successfully mapped & executed.",
        schemaVersion: "2026.07.A"
      }
    };
  }

  private logRequest(
    consumerName: string,
    authType: RequestLog['authType'],
    method: string,
    endpoint: string,
    protocol: 'REST' | 'GRAPHQL',
    statusCode: number,
    latencyMs: number,
    payloadSizeKb: number,
    errorMessage?: string
  ) {
    const newLog: RequestLog = {
      id: "log_" + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      consumerName,
      authType,
      method,
      endpoint,
      protocol,
      statusCode,
      latencyMs,
      payloadSizeKb,
      errorMessage
    };

    this.requestLogs.unshift(newLog);
    if (this.requestLogs.length > 100) {
      this.requestLogs.pop();
    }
    this.saveToStorage();
  }

  // --- API METRICS FOR HEALTH DASHBOARD ---
  public getMetrics() {
    const totalRequests = this.requestLogs.length;
    const successRequests = this.requestLogs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
    const errorRequests = this.requestLogs.filter(l => l.statusCode >= 400).length;
    const avgLatency = totalRequests ? Math.round(this.requestLogs.reduce((acc, l) => acc + l.latencyMs, 0) / totalRequests) : 0;

    const rateLimitsTriggered = this.requestLogs.filter(l => l.statusCode === 429).length;

    // Webhook metrics
    const totalWebhooks = this.webhookDeliveries.length;
    const successWebhooks = this.webhookDeliveries.filter(d => d.deliveryStatus === "SUCCESS").length;

    // Connector metrics
    const totalConnectorRuns = this.connectorExecutions.length;
    const failedConnectorRuns = this.connectorExecutions.filter(e => e.status === "FAILED").length;

    return {
      totalRequests,
      successRate: totalRequests ? Math.round((successRequests / totalRequests) * 100) : 100,
      errorRate: totalRequests ? Math.round((errorRequests / totalRequests) * 100) : 0,
      avgLatencyMs: avgLatency || 32,
      rateLimitsTriggered,
      totalWebhooks,
      webhookSuccessRate: totalWebhooks ? Math.round((successWebhooks / totalWebhooks) * 100) : 100,
      totalConnectorRuns,
      connectorFailureCount: failedConnectorRuns
    };
  }
}
