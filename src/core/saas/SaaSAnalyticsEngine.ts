import { SaaSAnalyticsOverview } from '../../types/saas';
import { organizationService } from './OrganizationService';
import { subscriptionBillingService } from './SubscriptionBillingService';
import { aiCreditEngine } from './AiCreditEngine';

export class SaaSAnalyticsEngine {
  private static instance: SaaSAnalyticsEngine;

  private constructor() {}

  public static getInstance(): SaaSAnalyticsEngine {
    if (!SaaSAnalyticsEngine.instance) {
      SaaSAnalyticsEngine.instance = new SaaSAnalyticsEngine();
    }
    return SaaSAnalyticsEngine.instance;
  }

  public getOverview(): SaaSAnalyticsOverview {
    const orgs = organizationService.getAllOrganizations();
    const activeOrgs = orgs.filter((o) => o.isActive).length;

    let totalAiCredits = 0;
    const planDist: Record<string, number> = {
      FREE: 0,
      STARTER: 0,
      PROFESSIONAL: 0,
      BUSINESS: 0,
      ENTERPRISE: 0,
      CUSTOM: 0,
    };

    orgs.forEach((o) => {
      planDist[o.planTier] = (planDist[o.planTier] || 0) + 1;
      const wallet = aiCreditEngine.getWallet(o.id);
      totalAiCredits += wallet.usedCreditsThisMonth;
    });

    return {
      monthlyActiveUsers: 142,
      activeOrganizationsCount: activeOrgs,
      totalProjectsCreated: 384,
      totalAiCreditsConsumed: totalAiCredits,
      monthlyRecurringRevenueUsd: 28450,
      conversionRatePercent: 18.4,
      churnRatePercent: 1.2,
      topPlanDistribution: planDist as any,
    };
  }
}

export const saasAnalyticsEngine = SaaSAnalyticsEngine.getInstance();
