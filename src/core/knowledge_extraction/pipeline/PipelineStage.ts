export enum PipelineStage {
  INITIALIZED = 'INITIALIZED',
  DOCUMENT_VALIDATION = 'DOCUMENT_VALIDATION',
  DOCUMENT_PREPARATION = 'DOCUMENT_PREPARATION',
  NODE_COLLECTION = 'NODE_COLLECTION',
  NORMALIZATION = 'NORMALIZATION',
  EXTRACTOR_DISPATCH = 'EXTRACTOR_DISPATCH',
  KNOWLEDGE_COLLECTION = 'KNOWLEDGE_COLLECTION',
  VALIDATION = 'VALIDATION',
  PACKAGE_BUILD = 'PACKAGE_BUILD',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface IPipelineStageInfo {
  readonly stage: PipelineStage;
  readonly description: string;
  readonly isTerminal: boolean;
  readonly orderIndex: number;
}

export const PIPELINE_STAGE_METADATA: Record<PipelineStage, IPipelineStageInfo> = {
  [PipelineStage.INITIALIZED]: {
    stage: PipelineStage.INITIALIZED,
    description: 'Pipeline context and configuration initialized',
    isTerminal: false,
    orderIndex: 0
  },
  [PipelineStage.DOCUMENT_VALIDATION]: {
    stage: PipelineStage.DOCUMENT_VALIDATION,
    description: 'Validating source document integrity and metadata',
    isTerminal: false,
    orderIndex: 1
  },
  [PipelineStage.DOCUMENT_PREPARATION]: {
    stage: PipelineStage.DOCUMENT_PREPARATION,
    description: 'Preparing document structure and hierarchy trees',
    isTerminal: false,
    orderIndex: 2
  },
  [PipelineStage.NODE_COLLECTION]: {
    stage: PipelineStage.NODE_COLLECTION,
    description: 'Collecting and filtering target nodes from document structure',
    isTerminal: false,
    orderIndex: 3
  },
  [PipelineStage.NORMALIZATION]: {
    stage: PipelineStage.NORMALIZATION,
    description: 'Normalizing text, units, and source locations',
    isTerminal: false,
    orderIndex: 4
  },
  [PipelineStage.EXTRACTOR_DISPATCH]: {
    stage: PipelineStage.EXTRACTOR_DISPATCH,
    description: 'Dispatching extractors to candidate document nodes',
    isTerminal: false,
    orderIndex: 5
  },
  [PipelineStage.KNOWLEDGE_COLLECTION]: {
    stage: PipelineStage.KNOWLEDGE_COLLECTION,
    description: 'Collecting extracted knowledge objects, evidence, and relationships',
    isTerminal: false,
    orderIndex: 6
  },
  [PipelineStage.VALIDATION]: {
    stage: PipelineStage.VALIDATION,
    description: 'Validating extracted knowledge, evidence traceability, and relationships',
    isTerminal: false,
    orderIndex: 7
  },
  [PipelineStage.PACKAGE_BUILD]: {
    stage: PipelineStage.PACKAGE_BUILD,
    description: 'Building immutable KnowledgePackage artifact',
    isTerminal: false,
    orderIndex: 8
  },
  [PipelineStage.COMPLETED]: {
    stage: PipelineStage.COMPLETED,
    description: 'Pipeline execution successfully completed',
    isTerminal: true,
    orderIndex: 9
  },
  [PipelineStage.FAILED]: {
    stage: PipelineStage.FAILED,
    description: 'Pipeline execution failed with fatal error',
    isTerminal: true,
    orderIndex: 10
  },
  [PipelineStage.CANCELLED]: {
    stage: PipelineStage.CANCELLED,
    description: 'Pipeline execution cancelled by user or system request',
    isTerminal: true,
    orderIndex: 11
  }
};
