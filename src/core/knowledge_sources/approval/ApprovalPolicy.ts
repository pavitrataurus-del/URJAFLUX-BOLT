import { TrustLevel, TRUST_LEVEL_WEIGHTS } from './TrustLevel';
import { KnowledgeSource } from '../models/KnowledgeSource';

export interface IApprovalPolicyConfig {
  readonly minimumTrustLevelRequired: TrustLevel;
  readonly requireIsbnOrDoi: boolean;
  readonly requireDescription: boolean;
  readonly allowAutoApproval: boolean;
}

export class ApprovalPolicy implements IApprovalPolicyConfig {
  public readonly minimumTrustLevelRequired: TrustLevel;
  public readonly requireIsbnOrDoi: boolean;
  public readonly requireDescription: boolean;
  public readonly allowAutoApproval: boolean;

  constructor(config?: Partial<IApprovalPolicyConfig>) {
    this.minimumTrustLevelRequired = config?.minimumTrustLevelRequired || 'LOW';
    this.requireIsbnOrDoi = config?.requireIsbnOrDoi ?? false;
    this.requireDescription = config?.requireDescription ?? false;
    this.allowAutoApproval = config?.allowAutoApproval ?? false;
    Object.freeze(this);
  }

  public static defaultPolicy(): ApprovalPolicy {
    return new ApprovalPolicy();
  }

  public static strictPolicy(): ApprovalPolicy {
    return new ApprovalPolicy({
      minimumTrustLevelRequired: 'VERIFIED',
      requireIsbnOrDoi: true,
      requireDescription: true,
      allowAutoApproval: false
    });
  }

  public evaluateSource(source: KnowledgeSource): {
    readonly eligible: boolean;
    readonly reasons: readonly string[];
  } {
    const reasons: string[] = [];

    const sourceWeight = TRUST_LEVEL_WEIGHTS[source.trustLevel];
    const minWeight = TRUST_LEVEL_WEIGHTS[this.minimumTrustLevelRequired];

    if (sourceWeight < minWeight) {
      reasons.push(
        `Source trust level '${source.trustLevel}' is lower than required '${this.minimumTrustLevelRequired}'`
      );
    }

    if (this.requireIsbnOrDoi && !source.isbn && !source.doi) {
      reasons.push('Source missing mandatory ISBN or DOI requirement');
    }

    if (this.requireDescription && (!source.description || source.description.trim().length === 0)) {
      reasons.push('Source missing mandatory description requirement');
    }

    return Object.freeze({
      eligible: reasons.length === 0,
      reasons: Object.freeze(reasons)
    });
  }
}
