import { KnowledgeSource } from '../models/KnowledgeSource';
import { ApprovalStatus } from './ApprovalStatus';
import { ApprovalPolicy } from './ApprovalPolicy';

export interface IApprovalTransitionResultData {
  readonly success: boolean;
  readonly previousStatus: ApprovalStatus;
  readonly newStatus: ApprovalStatus;
  readonly source: KnowledgeSource;
  readonly errors: readonly string[];
  readonly timestamp: number;
}

export class ApprovalWorkflow {
  private readonly policy: ApprovalPolicy;

  constructor(policy?: ApprovalPolicy) {
    this.policy = policy || ApprovalPolicy.defaultPolicy();
  }

  public submitForReview(source: KnowledgeSource, submitter: string): IApprovalTransitionResultData {
    if (source.status !== 'DRAFT' && source.status !== 'REJECTED') {
      return this.buildFailureResult(
        source,
        `Cannot submit for review from status '${source.status}'. Source must be in 'DRAFT' or 'REJECTED' status.`
      );
    }

    const updated = source.withStatus('PENDING_REVIEW', submitter, 'Submitted for formal review');
    return this.buildSuccessResult(source.status, 'PENDING_REVIEW', updated);
  }

  public approve(
    source: KnowledgeSource,
    reviewer: string,
    notes = 'Approved by review workflow'
  ): IApprovalTransitionResultData {
    if (source.status !== 'UNDER_REVIEW' && source.status !== 'PENDING_REVIEW' && source.status !== 'DRAFT') {
      return this.buildFailureResult(
        source,
        `Cannot approve source in status '${source.status}'. Source must be 'PENDING_REVIEW', 'UNDER_REVIEW', or 'DRAFT'.`
      );
    }

    const evalResult = this.policy.evaluateSource(source);
    if (!evalResult.eligible) {
      return this.buildFailureResult(
        source,
        `Policy check failed: ${evalResult.reasons.join('; ')}`
      );
    }

    const updated = source.withStatus('APPROVED', reviewer, notes);
    return this.buildSuccessResult(source.status, 'APPROVED', updated);
  }

  public reject(
    source: KnowledgeSource,
    reviewer: string,
    reason: string
  ): IApprovalTransitionResultData {
    if (source.status !== 'UNDER_REVIEW' && source.status !== 'PENDING_REVIEW' && source.status !== 'DRAFT') {
      return this.buildFailureResult(
        source,
        `Cannot reject source in status '${source.status}'.`
      );
    }

    const updated = source.withStatus('REJECTED', reviewer, reason);
    return this.buildSuccessResult(source.status, 'REJECTED', updated);
  }

  public archive(
    source: KnowledgeSource,
    operator: string,
    notes = 'Archived source'
  ): IApprovalTransitionResultData {
    const updated = source.withStatus('ARCHIVED', operator, notes);
    return this.buildSuccessResult(source.status, 'ARCHIVED', updated);
  }

  public suspend(
    source: KnowledgeSource,
    operator: string,
    reason: string
  ): IApprovalTransitionResultData {
    const updated = source.withStatus('SUSPENDED', operator, reason);
    return this.buildSuccessResult(source.status, 'SUSPENDED', updated);
  }

  private buildSuccessResult(
    previousStatus: ApprovalStatus,
    newStatus: ApprovalStatus,
    source: KnowledgeSource
  ): IApprovalTransitionResultData {
    return Object.freeze({
      success: true,
      previousStatus,
      newStatus,
      source,
      errors: Object.freeze([]),
      timestamp: Date.now()
    });
  }

  private buildFailureResult(
    source: KnowledgeSource,
    errorMsg: string
  ): IApprovalTransitionResultData {
    return Object.freeze({
      success: false,
      previousStatus: source.status,
      newStatus: source.status,
      source,
      errors: Object.freeze([errorMsg]),
      timestamp: Date.now()
    });
  }
}
