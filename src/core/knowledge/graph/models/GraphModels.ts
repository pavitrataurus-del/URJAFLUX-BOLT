export enum NodeType {
  CONCEPT = "CONCEPT",
  ONTOLOGY = "ONTOLOGY",
  RULE = "RULE",
  EVIDENCE = "EVIDENCE",
  TWIN_OBJECT = "TWIN_OBJECT",
  NAMESPACE = "NAMESPACE",
  DOCUMENT = "DOCUMENT",
  EXPERT = "EXPERT"
}

export enum EdgeType {
  IS_A = "IS_A",
  PART_OF = "PART_OF",
  CONNECTED_TO = "CONNECTED_TO",
  SUPPORTED_BY = "SUPPORTED_BY",
  DERIVED_FROM = "DERIVED_FROM",
  LOCATED_IN = "LOCATED_IN",
  REFERENCES = "REFERENCES",
  BELONGS_TO_NAMESPACE = "BELONGS_TO_NAMESPACE",
  RELATED_TO = "RELATED_TO"
}

export interface IGraphNode {
  id: string;
  type: NodeType | string;
  label: string;
  namespace: string;
  properties: Record<string, any>;
  version: number;
}

export interface IGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType | string;
  properties: Record<string, any>;
  weight?: number;
  confidence?: number;
}

export interface IEvidenceLink {
  id: string;
  edgeId: string;
  knowledgeSource: string;
  documentId: string;
  book?: string;
  edition?: string;
  pageNumber?: number;
  namespaceId: string;
  checksum: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export interface IKnowledgeGraph {
  id: string;
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  evidenceLinks: IEvidenceLink[];
  version: number;
  metadata: Record<string, any>;
}

export enum ExpertHealthStatus {
  HEALTHY = "HEALTHY",
  DEGRADED = "DEGRADED",
  OFFLINE = "OFFLINE"
}

export interface IExpertModule {
  identifier: string;
  version: string;
  capabilities: string[];
  supportedNamespaces: string[];
  healthStatus: ExpertHealthStatus;
  dependencies: string[];
}
