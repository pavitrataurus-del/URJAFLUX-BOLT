import { IVastuKnowledgeConflict, ExpertReviewStatus } from "./VastuKnowledgeTypes";

export class VastuConflictEngine {
  private static instance: VastuConflictEngine;
  private conflicts: Map<string, IVastuKnowledgeConflict> = new Map();

  private constructor() {
    this.seedSampleConflicts();
  }

  public static getInstance(): VastuConflictEngine {
    if (!VastuConflictEngine.instance) {
      VastuConflictEngine.instance = new VastuConflictEngine();
    }
    return VastuConflictEngine.instance;
  }

  private seedSampleConflicts(): void {
    const sampleConflicts: IVastuKnowledgeConflict[] = [
      {
        id: "cnf-001",
        entityIdOrTopic: "Kitchen North-West",
        topicName: "Kitchen Placement in North-West (Vayu Zone)",
        sourceAId: "src-book-01",
        sourceATitle: "Mayamatam Treatise Vol I",
        statementA: "Kitchen in North-West is permissible as a secondary location when South-East is unavailable, provided cooking stove faces East.",
        sourceBId: "src-book-02",
        sourceBTitle: "Modern Vastu Science Handbook",
        statementB: "Kitchen in North-West causes uncontrollable expenditures and digestive issues; strictly prohibited unless neutralized with Copper & Brass strips.",
        conflictType: "Direct Contradiction",
        reviewStatus: "Pending",
        expertNotes: "Awaiting review by Senior Vastu Scholar on Mayamatam verse interpretations.",
        detectedAt: "2026-07-25"
      },
      {
        id: "cnf-002",
        entityIdOrTopic: "Master Bedroom South-East",
        topicName: "Master Bedroom in South-East (Agni Zone)",
        sourceAId: "src-book-03",
        sourceATitle: "Samarangana Sutradhara Digest",
        statementA: "Master Bedroom in South-East causes marital conflicts due to excess Agni energy.",
        sourceBId: "src-book-04",
        sourceBTitle: "Practical Vastu Remedies",
        statementB: "Master Bedroom in South-East can be neutralized using Rose Quartz crystals and Off-White wall palette.",
        conflictType: "Remedy Discrepancy",
        reviewStatus: "Reviewed",
        expertNotes: "Reviewed: Remedy is acceptable for secondary occupants, but SW remains gold standard.",
        reviewedBy: "Dr. K. Sharma (Vastu SME)",
        detectedAt: "2026-07-25"
      }
    ];

    sampleConflicts.forEach(c => this.conflicts.set(c.id, c));
  }

  public getConflicts(statusFilter?: ExpertReviewStatus): IVastuKnowledgeConflict[] {
    const list = Array.from(this.conflicts.values());
    if (statusFilter) {
      return list.filter(c => c.reviewStatus === statusFilter);
    }
    return list;
  }

  public updateConflictStatus(conflictId: string, status: ExpertReviewStatus, reviewer: string, notes?: string): IVastuKnowledgeConflict | null {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return null;

    const updated: IVastuKnowledgeConflict = {
      ...conflict,
      reviewStatus: status,
      reviewedBy: reviewer,
      expertNotes: notes || conflict.expertNotes
    };

    this.conflicts.set(conflictId, updated);
    return updated;
  }

  public detectConflictBetweenSources(
    topicName: string,
    sourceAId: string,
    sourceATitle: string,
    statementA: string,
    sourceBId: string,
    sourceBTitle: string,
    statementB: string
  ): IVastuKnowledgeConflict {
    const id = `cnf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const conflict: IVastuKnowledgeConflict = {
      id,
      entityIdOrTopic: topicName,
      topicName,
      sourceAId,
      sourceATitle,
      statementA,
      sourceBId,
      sourceBTitle,
      statementB,
      conflictType: "Direct Contradiction",
      reviewStatus: "Pending",
      detectedAt: new Date().toISOString().split("T")[0]
    };

    this.conflicts.set(id, conflict);
    return conflict;
  }
}
