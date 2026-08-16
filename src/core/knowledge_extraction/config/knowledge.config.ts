import { IKnowledgeEngineConfig } from '../types/config.types';

export const DEFAULT_KNOWLEDGE_CONFIG: IKnowledgeEngineConfig = {
  extraction: {
    minConfidenceThreshold: 0.6,
    extractRules: true,
    extractDefinitions: true,
    extractMeasurements: true,
    extractTables: true,
    maxNodeDepth: 10
  },
  relationship: {
    detectHierarchies: true,
    detectSpatialRelationships: true,
    detectProhibitions: true,
    minRelationshipConfidence: 0.5
  },
  validation: {
    strictCategoryCheck: true,
    checkDuplicateKnowledge: true,
    checkCircularRelationships: true,
    requireEvidence: true,
    requireSourceLocation: false
  },
  normalization: {
    trimWhitespace: true,
    toLowerCaseEntityKeys: false,
    standardizeUnits: true,
    sanitizeSpecialCharacters: true
  },
  performance: {
    maxBatchSize: 500,
    maxMemoryThresholdMB: 512,
    timeoutMs: 30000,
    enableWorkerThreads: false
  },
  streaming: {
    chunkSize: 64 * 1024,
    highWaterMarkMB: 64,
    enableIncrementalFlush: true
  }
};

export function createKnowledgeConfig(
  partialConfig?: Partial<IKnowledgeEngineConfig>
): IKnowledgeEngineConfig {
  if (!partialConfig) {
    return DEFAULT_KNOWLEDGE_CONFIG;
  }

  return {
    extraction: { ...DEFAULT_KNOWLEDGE_CONFIG.extraction, ...partialConfig.extraction },
    relationship: { ...DEFAULT_KNOWLEDGE_CONFIG.relationship, ...partialConfig.relationship },
    validation: { ...DEFAULT_KNOWLEDGE_CONFIG.validation, ...partialConfig.validation },
    normalization: { ...DEFAULT_KNOWLEDGE_CONFIG.normalization, ...partialConfig.normalization },
    performance: { ...DEFAULT_KNOWLEDGE_CONFIG.performance, ...partialConfig.performance },
    streaming: { ...DEFAULT_KNOWLEDGE_CONFIG.streaming, ...partialConfig.streaming }
  };
}
