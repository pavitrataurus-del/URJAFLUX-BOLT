export type KnowledgeCategory = string;

export interface KnowledgeSource {
  id: string;
  name: string;
  type: "canonical" | "user" | "marketplace" | "ai_draft" | "custom";
  version: string;
  author?: string;
  url?: string;
}

export interface KnowledgeReference {
  sourceId: string;
  section?: string;
  citationText?: string;
  externalUrl?: string;
}

export interface KnowledgeMetadata {
  tags: readonly string[];
  createdAt: string;
  updatedAt: string;
  version: string;
  [key: string]: unknown; // Extensible for future domain-specific metadata
}

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  references: readonly KnowledgeReference[];
  metadata: KnowledgeMetadata;
  properties?: Record<string, unknown>; // Extensible bucket for domain properties (Vastu, Numerology, etc.)
}

export interface KnowledgePack {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: KnowledgeCategory;
  items: readonly KnowledgeItem[];
  enabled?: boolean;
}
