import { ExpertConsensusRecord, ConsensusActionType } from "./VerificationTypes";

export class ExpertConsensusEngine {
  private static instance: ExpertConsensusEngine;
  private consensusStore: Map<string, ExpertConsensusRecord[]> = new Map();

  public constructor() {}

  public static getInstance(): ExpertConsensusEngine {
    if (!ExpertConsensusEngine.instance) {
      ExpertConsensusEngine.instance = new ExpertConsensusEngine();
    }
    return ExpertConsensusEngine.instance;
  }

  public recordAction(
    ruleId: string,
    action: ConsensusActionType,
    expertId: string,
    expertName: string,
    comment?: string,
    voteValue?: number
  ): ExpertConsensusRecord {
    const existing = this.consensusStore.get(ruleId) || [];
    
    // Evaluate new state based on action
    let newState: ExpertConsensusRecord["consensusState"] = "PENDING_REVIEW";
    if (action === "APPROVE" || action === "CREATE_CONSENSUS") {
      newState = "APPROVED_CANONICAL";
    } else if (action === "REJECT") {
      newState = "REJECTED";
    } else if (action === "REQUEST_REVISION") {
      newState = "REVISION_REQUESTED";
    }

    const record: ExpertConsensusRecord = {
      id: `consensus-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ruleId,
      action,
      expertId,
      expertName,
      timestamp: new Date().toISOString(),
      comment,
      voteValue: voteValue ?? (action === "APPROVE" ? 1 : action === "REJECT" ? -1 : 0),
      consensusState: newState
    };

    existing.push(record);
    this.consensusStore.set(ruleId, existing);
    return record;
  }

  public getConsensusRecords(ruleId: string): ExpertConsensusRecord[] {
    return this.consensusStore.get(ruleId) || [];
  }

  public getOverallConsensusState(ruleId: string): {
    state: "APPROVED_CANONICAL" | "REJECTED" | "PENDING_REVIEW" | "REVISION_REQUESTED";
    approveVotes: number;
    rejectVotes: number;
    totalVotes: number;
  } {
    const records = this.getConsensusRecords(ruleId);
    let approveVotes = 0;
    let rejectVotes = 0;

    records.forEach(r => {
      if (r.voteValue === 1 || r.action === "APPROVE") approveVotes++;
      if (r.voteValue === -1 || r.action === "REJECT") rejectVotes++;
    });

    const totalVotes = approveVotes + rejectVotes;
    let state: "APPROVED_CANONICAL" | "REJECTED" | "PENDING_REVIEW" | "REVISION_REQUESTED" = "PENDING_REVIEW";

    if (approveVotes >= 2 && approveVotes > rejectVotes) {
      state = "APPROVED_CANONICAL";
    } else if (rejectVotes > approveVotes && rejectVotes >= 2) {
      state = "REJECTED";
    } else if (records.some(r => r.action === "REQUEST_REVISION")) {
      state = "REVISION_REQUESTED";
    }

    return { state, approveVotes, rejectVotes, totalVotes };
  }
  public submitAction(
    ruleId: string,
    action: ConsensusActionType,
    expertId: string,
    expertName: string,
    comment?: string,
    voteValue?: number
  ): ExpertConsensusRecord {
    return this.recordAction(ruleId, action, expertId, expertName, comment, voteValue);
  }

  public getRecordsForRule(ruleId: string): ExpertConsensusRecord[] {
    return this.getConsensusRecords(ruleId);
  }

  public getConsensusState(ruleId: string): "APPROVED_CANONICAL" | "REJECTED" | "PENDING_REVIEW" | "REVISION_REQUESTED" {
    return this.getOverallConsensusState(ruleId).state;
  }

  public getAllRecords(): ExpertConsensusRecord[] {
    const list: ExpertConsensusRecord[] = [];
    this.consensusStore.forEach(records => list.push(...records));
    return list;
  }
}

export const expertConsensusEngine = ExpertConsensusEngine.getInstance();
