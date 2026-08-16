export enum KnowledgeRelationshipType {
  LOCATED_IN = 'LOCATED_IN',
  SHOULD_NOT_BE = 'SHOULD_NOT_BE',
  CONNECTED_TO = 'CONNECTED_TO',
  REQUIRES = 'REQUIRES',
  DEPENDS_ON = 'DEPENDS_ON',
  APPLIES_TO = 'APPLIES_TO',
  EXCLUDES = 'EXCLUDES',
  DEFINES = 'DEFINES',
  REFERENCES = 'REFERENCES',
  SUPERSEDES = 'SUPERSEDES',
  INHERITS_FROM = 'INHERITS_FROM',
  CONTRADICTS = 'CONTRADICTS'
}

export interface IKnowledgeRelationshipData {
  readonly relationshipId: string;
  readonly sourceKnowledgeId: string;
  readonly targetKnowledgeId: string;
  readonly relationshipType: KnowledgeRelationshipType | string;
  readonly confidence: number;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: number;
  readonly version: string;
}
