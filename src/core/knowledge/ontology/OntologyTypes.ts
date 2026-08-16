export enum ConceptType {
  ROOM = "ROOM",
  OBJECT = "OBJECT",
  SPATIAL = "SPATIAL",
  RELATIONSHIP = "RELATIONSHIP",
  RULE = "RULE",
  EVIDENCE = "EVIDENCE",
  RECOMMENDATION = "RECOMMENDATION",
  ELEMENT = "ELEMENT",
  PLANET = "PLANET",
  DIRECTION = "DIRECTION",
  CONCEPT = "CONCEPT"
}

export interface MultilingualLabel {
  en: string;
  hi?: string;
  sa?: string;
  [lang: string]: string | undefined;
}

export interface IOntologyNode {
  id: string;
  canonicalName: string;
  type: ConceptType;
  parentId?: string;
  childrenIds: string[];
  aliases: string[];
  labels: MultilingualLabel;
  metadata: Record<string, any>;
  version: string;
  compatibleNamespaces: string[]; 
}
