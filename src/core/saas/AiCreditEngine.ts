import { AiCreditWallet, AiCreditTransaction } from '../../types/saas';
import { DEFAULT_PLAN_LIMITS, organizationService } from './OrganizationService';
import { structuredLogger } from '../telemetry/StructuredLogger';
import { metricsCollector } from '../telemetry/MetricsCollector';

// Gemini Cost Rates per 1M Tokens (Estimated API Costs)
export const MODEL_COST_RATES: Record<string, { promptPer1M: number; completionPer1M: number; creditsPer1kTokens: number }> = {
  'gemini-3.6-flash': { promptPer1M: 0.15, completionPer1M: 0.60, creditsPer1kTokens: 1 },
  'gemini-2.5-pro': { promptPer1M: 1.25, completionPer1M: 5.00, creditsPer1kTokens: 5 },
  'gemini-vision-2.5': { promptPer1M: 2.00, completionPer1M: 8.00, creditsPer1kTokens: 10 },
  'default': { promptPer1M: 0.50, completionPer1M: 2.00, creditsPer1kTokens: 2 },
};

export class AiCreditEngine {
  private static instance: AiCreditEngine;
  private wallets: Map<string, AiCreditWallet> = new Map();
  private transactions: Map<string, AiCreditTransaction[]> = new Map();

  private constructor() {}

  public static getInstance(): AiCreditEngine {
    if (!AiCreditEngine.instance) {
      AiCreditEngine.instance = new AiCreditEngine();
    }
    return AiCreditEngine.instance;
  }

  public getWallet(orgId: string): AiCreditWallet {
    let wallet = this.wallets.get(orgId);
    if (!wallet) {
      const org = organizationService.getOrganization(orgId);
      const planTier = org?.planTier || 'ENTERPRISE';
      const limits = DEFAULT_PLAN_LIMITS[planTier];

      wallet = {
        organizationId: orgId,
        monthlyCreditLimit: limits.aiCreditsPerMonth,
        remainingCredits: limits.aiCreditsPerMonth,
        usedCreditsThisMonth: 0,
        totalTokensConsumedMonth: 0,
        estimatedCostUsd: 0,
        lastResetAt: new Date().toISOString(),
        topupCreditsBonus: 0,
      };
      this.wallets.set(orgId, wallet);
    }
    return wallet;
  }

  public checkAndDeductCredits(
    orgId: string,
    userId: string,
    modelAlias: string,
    operationType: AiCreditTransaction['operationType'],
    promptTokens: number,
    completionTokens: number
  ): { success: boolean; remainingCredits: number; deductedCredits: number } {
    const wallet = this.getWallet(orgId);
    const rateInfo = MODEL_COST_RATES[modelAlias] || MODEL_COST_RATES['default'];

    const totalTokens = promptTokens + completionTokens;
    const creditsDeducted = Math.max(1, Math.ceil((totalTokens / 1000) * rateInfo.creditsPer1kTokens));

    if (wallet.remainingCredits < creditsDeducted) {
      structuredLogger.warn('AiCreditEngine', `AI Credit exhaustion for Org ${orgId}. Required: ${creditsDeducted}, Remaining: ${wallet.remainingCredits}`);
      return { success: false, remainingCredits: wallet.remainingCredits, deductedCredits: 0 };
    }

    wallet.remainingCredits -= creditsDeducted;
    wallet.usedCreditsThisMonth += creditsDeducted;
    wallet.totalTokensConsumedMonth += totalTokens;

    // Estimate Cost USD
    const promptCost = (promptTokens / 1_000_000) * rateInfo.promptPer1M;
    const completionCost = (completionTokens / 1_000_000) * rateInfo.completionPer1M;
    wallet.estimatedCostUsd += promptCost + completionCost;

    this.wallets.set(orgId, wallet);

    // Record Transaction
    const tx: AiCreditTransaction = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      userId,
      modelAlias,
      operationType,
      promptTokens,
      completionTokens,
      creditsDeducted,
      timestamp: new Date().toISOString(),
    };

    const txList = this.transactions.get(orgId) || [];
    txList.push(tx);
    this.transactions.set(orgId, txList);

    metricsCollector.recordMetric(`AiCreditDeduction:${modelAlias}`, 'GEMINI_AI', creditsDeducted, 'SUCCESS', {
      orgId,
      totalTokens,
    });

    return { success: true, remainingCredits: wallet.remainingCredits, deductedCredits: creditsDeducted };
  }

  public addTopupCredits(orgId: string, bonusCredits: number) {
    const wallet = this.getWallet(orgId);
    wallet.remainingCredits += bonusCredits;
    wallet.topupCreditsBonus += bonusCredits;
    this.wallets.set(orgId, wallet);
    structuredLogger.info('AiCreditEngine', `Added ${bonusCredits} bonus AI credits to Org ${orgId}`);
  }

  public getTransactions(orgId: string): AiCreditTransaction[] {
    return this.transactions.get(orgId) || [];
  }
}

export const aiCreditEngine = AiCreditEngine.getInstance();
