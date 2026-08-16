export interface ExtractionConfig {
  readonly minConfidenceThreshold: number;
  readonly extractRules: boolean;
  readonly extractDefinitions: boolean;
  readonly extractMeasurements: boolean;
  readonly extractTables: boolean;
  readonly maxNodeDepth: number;
}

export interface RelationshipConfig {
  readonly detectHierarchies: boolean;
  readonly detectSpatialRelationships: boolean;
  readonly detectProhibitions: boolean;
  readonly minRelationshipConfidence: number;
}

export interface ValidationConfig {
  readonly strictCategoryCheck: boolean;
  readonly checkDuplicateKnowledge: boolean;
  readonly checkCircularRelationships: boolean;
  readonly requireEvidence: boolean;
  readonly requireSourceLocation: boolean;
}

export interface NormalizationConfig {
  readonly trimWhitespace: boolean;
  readonly toLowerCaseEntityKeys: boolean;
  readonly standardizeUnits: boolean;
  readonly sanitizeSpecialCharacters: boolean;
}

export interface PerformanceConfig {
  readonly maxBatchSize: number;
  readonly maxMemoryThresholdMB: number;
  readonly timeoutMs: number;
  readonly enableWorkerThreads: boolean;
}

export interface StreamingConfig {
  readonly chunkSize: number;
  readonly highWaterMarkMB: number;
  readonly enableIncrementalFlush: boolean;
}

export interface IKnowledgeEngineConfig {
  readonly extraction: ExtractionConfig;
  readonly relationship: RelationshipConfig;
  readonly validation: ValidationConfig;
  readonly normalization: NormalizationConfig;
  readonly performance: PerformanceConfig;
  readonly streaming: StreamingConfig;
}
