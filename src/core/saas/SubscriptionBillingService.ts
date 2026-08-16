import {
  BillingAccount,
  InvoiceRecord,
  LicenseKeyRecord,
  SaaSPlanTier,
} from '../../types/saas';
import { DEFAULT_PLAN_LIMITS, organizationService } from './OrganizationService';
import { structuredLogger } from '../telemetry/StructuredLogger';

// Abstract Payment Provider Interface for Stripe, Razorpay, etc.
export interface IPaymentProcessor {
  providerName: string;
  createCustomer(orgId: string, email: string): Promise<string>;
  createSubscription(customerId: string, planTier: SaaSPlanTier): Promise<{ subscriptionId: string; status: string }>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  generateInvoice(customerId: string, amount: number, items: Array<{ description: string; amount: number }>): Promise<InvoiceRecord>;
}

// Default Pluggable Provider Implementation (Simulated Processor)
export class GenericPaymentProcessorAdapter implements IPaymentProcessor {
  public providerName = 'GENERIC_ENTERPRISE_GATEWAY';

  public async createCustomer(orgId: string, email: string): Promise<string> {
    return `cus_${orgId}_${Date.now()}`;
  }

  public async createSubscription(customerId: string, planTier: SaaSPlanTier) {
    return {
      subscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'ACTIVE',
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return true;
  }

  public async generateInvoice(customerId: string, amount: number, items: Array<{ description: string; amount: number }>): Promise<InvoiceRecord> {
    const invId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      id: invId,
      invoiceNumber: `UF-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      organizationId: customerId.replace('cus_', '').split('_')[0],
      amountDue: amount,
      amountPaid: amount,
      currency: 'USD',
      status: 'PAID',
      issuedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      pdfDownloadUrl: `/api/saas/billing/invoices/${invId}/pdf`,
      lineItems: items.map((i) => ({ ...i, quantity: 1 })),
    };
  }
}

export class SubscriptionBillingService {
  private static instance: SubscriptionBillingService;
  private paymentProcessor: IPaymentProcessor;
  private billingAccounts: Map<string, BillingAccount> = new Map();
  private invoices: Map<string, InvoiceRecord[]> = new Map();
  private licenses: Map<string, LicenseKeyRecord> = new Map();

  private constructor() {
    this.paymentProcessor = new GenericPaymentProcessorAdapter();
  }

  public static getInstance(): SubscriptionBillingService {
    if (!SubscriptionBillingService.instance) {
      SubscriptionBillingService.instance = new SubscriptionBillingService();
    }
    return SubscriptionBillingService.instance;
  }

  public setPaymentProcessor(processor: IPaymentProcessor) {
    this.paymentProcessor = processor;
    structuredLogger.info('SubscriptionBillingService', `Switched Payment Processor to ${processor.providerName}`);
  }

  public getBillingAccount(orgId: string): BillingAccount {
    let account = this.billingAccounts.get(orgId);
    if (!account) {
      account = {
        id: `bill_${orgId}`,
        organizationId: orgId,
        customerName: `Tenant Account ${orgId}`,
        billingEmail: `billing@org-${orgId}.com`,
        paymentMethodStatus: 'ACTIVE',
        currency: 'USD',
        currentBalance: 0,
        billingCycle: 'ANNUAL',
        nextBillingDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      };
      this.billingAccounts.set(orgId, account);
    }
    return account;
  }

  public generateLicenseKey(orgId: string, planTier: SaaSPlanTier = 'ENTERPRISE', maxSeats = 100): LicenseKeyRecord {
    const key = `UF-LIC-${planTier}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;
    const record: LicenseKeyRecord = {
      id: `lic_${Date.now()}`,
      licenseKey: key,
      organizationId: orgId,
      planTier,
      maxSeats,
      assignedSeats: 1,
      registeredDevices: [],
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      signature: `sig_sha256_${Math.random().toString(36).substring(2, 16)}`,
      status: 'ACTIVE',
    };

    this.licenses.set(orgId, record);

    // Local Storage Offline Cache for license key verification
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`URJAFLUX_OFFLINE_LICENSE_${orgId}`, JSON.stringify(record));
      } catch (e) {
        // Ignore storage errors
      }
    }

    structuredLogger.info('SubscriptionBillingService', `Generated Enterprise License for org ${orgId}: ${key}`);
    return record;
  }

  public getLicenseKey(orgId: string): LicenseKeyRecord {
    let record = this.licenses.get(orgId);
    if (!record) {
      record = this.generateLicenseKey(orgId, 'ENTERPRISE', 100);
    }
    return record;
  }

  public registerDevice(orgId: string, deviceId: string, deviceName: string): boolean {
    const license = this.getLicenseKey(orgId);
    if (license.status !== 'ACTIVE') throw new Error('License is not active.');

    const exists = license.registeredDevices.some((d) => d.deviceId === deviceId);
    if (!exists) {
      license.registeredDevices.push({
        deviceId,
        deviceName,
        registeredAt: new Date().toISOString(),
      });
      this.licenses.set(orgId, license);
    }
    return true;
  }

  public async upgradePlan(orgId: string, newPlan: SaaSPlanTier): Promise<BillingAccount> {
    const org = organizationService.getOrganization(orgId);
    if (!org) throw new Error(`Organization ${orgId} not found`);

    org.planTier = newPlan;
    const account = this.getBillingAccount(orgId);

    // Generate invoice
    const pricingMap: Record<SaaSPlanTier, number> = {
      FREE: 0,
      STARTER: 49,
      PROFESSIONAL: 199,
      BUSINESS: 499,
      ENTERPRISE: 2499,
      CUSTOM: 9999,
    };

    const invoice = await this.paymentProcessor.generateInvoice(`cus_${orgId}`, pricingMap[newPlan], [
      { description: `URJAFLUX AI OS Tier Upgrade: ${newPlan}`, amount: pricingMap[newPlan] },
    ]);

    const orgInvoices = this.invoices.get(orgId) || [];
    orgInvoices.push(invoice);
    this.invoices.set(orgId, orgInvoices);

    structuredLogger.info('SubscriptionBillingService', `Upgraded Org ${orgId} to plan ${newPlan}. Generated invoice ${invoice.invoiceNumber}`);
    return account;
  }

  public getInvoices(orgId: string): InvoiceRecord[] {
    return this.invoices.get(orgId) || [];
  }
}

export const subscriptionBillingService = SubscriptionBillingService.getInstance();
