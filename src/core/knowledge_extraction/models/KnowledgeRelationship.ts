import { KnowledgeRelationshipType, IKnowledgeRelationshipData } from '../types/relationship.types';

export class KnowledgeRelationship implements IKnowledgeRelationshipData {
  public readonly relationshipId: string;
  public readonly sourceKnowledgeId: string;
  public readonly targetKnowledgeId: string;
  public readonly relationshipType: KnowledgeRelationshipType | string;
  public readonly confidence: number;
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt: number;
  public readonly version: string;

  constructor(data: IKnowledgeRelationshipData) {
    this.relationshipId = data.relationshipId;
    this.sourceKnowledgeId = data.sourceKnowledgeId;
    this.targetKnowledgeId = data.targetKnowledgeId;
    this.relationshipType = data.relationshipType;
    this.confidence = data.confidence;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
    this.version = data.version;
  }

  public toJSON(): IKnowledgeRelationshipData {
    return {
      relationshipId: this.relationshipId,
      sourceKnowledgeId: this.sourceKnowledgeId,
      targetKnowledgeId: this.targetKnowledgeId,
      relationshipType: this.relationshipType,
      confidence: this.confidence,
      metadata: this.metadata,
      createdAt: this.createdAt,
      version: this.version
    };
  }

  public static fromJSON(json: IKnowledgeRelationshipData): KnowledgeRelationship {
    return new KnowledgeRelationship(json);
  }
}
