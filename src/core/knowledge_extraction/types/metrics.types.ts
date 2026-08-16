export interface IKnowledgeMetricsData {
  readonly knowledgeObjectCount: number;
  readonly relationshipCount: number;
  readonly evidenceCount: number;
  readonly warningCount: number;
  readonly errorCount: number;
  readonly executionTimeMs: number;
  readonly memoryEstimateBytes: number;
  readonly pipelineVersion: string;
  readonly extractedAt: number;
}
