// Module 8: Webhook Platform Engine
import { WebhookEndpointSubscription, WebhookDeliveryLog } from "../../types/integrationPlatform";

export class WebhookPlatformServiceStore {
  private subscriptions: Map<string, WebhookEndpointSubscription> = new Map();
  private deliveryLogs: WebhookDeliveryLog[] = [];

  constructor() {
    this.seedCanonicalWebhooks();
  }

  private seedCanonicalWebhooks(): void {
    const defaultSubs: WebhookEndpointSubscription[] = [
      {
        id: "WH-1001",
        tenantId: "tenant_org_01",
        targetUrl: "https://api.corporate-dms.com/v1/urjaflux-webhooks",
        secretKeyMasked: "whsec_99018827****",
        subscribedEvents: ["project.imported", "analysis.finished", "report.generated"],
        status: "ACTIVE",
        deliverySuccessCount: 1420,
        deliveryFailureCount: 2,
        lastDeliveryAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "WH-1002",
        tenantId: "tenant_org_01",
        targetUrl: "https://hooks.slack.com/services/T00/B00/XXXX",
        secretKeyMasked: "whsec_77102938****",
        subscribedEvents: ["analysis.finished", "knowledge.updated"],
        status: "ACTIVE",
        deliverySuccessCount: 890,
        deliveryFailureCount: 0,
        lastDeliveryAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    defaultSubs.forEach(s => this.subscriptions.set(s.id, s));

    // Seed delivery logs
    this.deliveryLogs.push({
      id: "WHLOG-9001",
      webhookId: "WH-1001",
      eventTopic: "analysis.finished",
      payload: { projectId: "PRJ-CAD-8801", complianceScore: 94.5 },
      responseCode: 200,
      durationMs: 145,
      status: "SUCCESS",
      retryCount: 0,
      signatureHeader: "t=1753650000,v1=sha256_8a912b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    });
  }

  public registerWebhook(
    tenantId: string,
    targetUrl: string,
    subscribedEvents: string[]
  ): { subscription: WebhookEndpointSubscription; rawSecret: string } {
    const rawSecret = `whsec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const subscription: WebhookEndpointSubscription = {
      id: `WH-${Date.now().toString(36).toUpperCase()}`,
      tenantId,
      targetUrl,
      secretKeyMasked: `${rawSecret.substring(0, 10)}****`,
      subscribedEvents,
      status: "ACTIVE",
      deliverySuccessCount: 0,
      deliveryFailureCount: 0
    };

    this.subscriptions.set(subscription.id, subscription);
    return { subscription, rawSecret };
  }

  public rotateSecretKey(webhookId: string): string | null {
    const sub = this.subscriptions.get(webhookId);
    if (!sub) return null;
    const newSecret = `whsec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    sub.secretKeyMasked = `${newSecret.substring(0, 10)}****`;
    return newSecret;
  }

  public dispatchWebhookEvent(
    eventTopic: string,
    payload: Record<string, unknown>,
    tenantId: string = "tenant_org_01"
  ): WebhookDeliveryLog[] {
    const logs: WebhookDeliveryLog[] = [];

    this.subscriptions.forEach(sub => {
      if (sub.status === "ACTIVE" && (sub.tenantId === tenantId || sub.tenantId === "global_tenant")) {
        if (sub.subscribedEvents.includes(eventTopic) || sub.subscribedEvents.includes("*")) {
          const log: WebhookDeliveryLog = {
            id: `WHLOG-${Date.now().toString(36).toUpperCase()}`,
            webhookId: sub.id,
            eventTopic,
            payload,
            responseCode: 200,
            durationMs: Math.floor(Math.random() * 90) + 30,
            status: "SUCCESS",
            retryCount: 0,
            signatureHeader: `t=${Math.floor(Date.now() / 1000)},v1=sha256_${Math.random().toString(36).substring(2, 15)}`,
            timestamp: new Date().toISOString()
          };

          sub.deliverySuccessCount += 1;
          sub.lastDeliveryAt = new Date().toISOString();
          this.deliveryLogs.unshift(log);
          logs.push(log);
        }
      }
    });

    return logs;
  }

  public getSubscriptions(tenantId?: string): WebhookEndpointSubscription[] {
    const list = Array.from(this.subscriptions.values());
    if (!tenantId) return list;
    return list.filter(s => s.tenantId === tenantId || s.tenantId === "global_tenant");
  }

  public getDeliveryLogs(tenantId?: string): WebhookDeliveryLog[] {
    return this.deliveryLogs;
  }
}

export const WebhookPlatformService = new WebhookPlatformServiceStore();
