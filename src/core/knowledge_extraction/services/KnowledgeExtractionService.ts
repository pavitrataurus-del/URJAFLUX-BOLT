import { ParsedDocument, BaseNode } from '../../knowledge_parsing/types/document.types';
import { IKnowledgeEngineConfig } from '../types/config.types';
import { createKnowledgeConfig } from '../config/knowledge.config';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { KnowledgeEvidence } from '../models/KnowledgeEvidence';
import { KnowledgeRelationship } from '../models/KnowledgeRelationship';
import { KnowledgePackage } from '../models/KnowledgePackage';
import { PipelineContext, CancellationToken } from '../pipeline/PipelineContext';
import { PipelineStage } from '../pipeline/PipelineStage';
import { ExtractorRegistry, extractorRegistry } from '../registry/ExtractorRegistry';
import { HeadingExtractor } from '../extractors/HeadingExtractor';
import { ParagraphExtractor } from '../extractors/ParagraphExtractor';
import { TableExtractor } from '../extractors/TableExtractor';
import { FootnoteExtractor } from '../extractors/FootnoteExtractor';
import { CrossReferenceExtractor } from '../extractors/CrossReferenceExtractor';
import { generatePackageId, generateExecutionId } from '../utils/pipelineHelpers';

export interface IExtractionServiceResult {
  readonly knowledgePackage: KnowledgePackage;
  readonly pipelineContext: PipelineContext;
  readonly executionTimeMs: number;
}

export class KnowledgeExtractionService {
  private static instance: KnowledgeExtractionService;
  private readonly registry: ExtractorRegistry;

  private constructor(registry: ExtractorRegistry = extractorRegistry) {
    this.registry = registry;
    this.registerDefaultExtractors();
  }

  public static getInstance(): KnowledgeExtractionService {
    if (!KnowledgeExtractionService.instance) {
      KnowledgeExtractionService.instance = new KnowledgeExtractionService();
    }
    return KnowledgeExtractionService.instance;
  }

  private registerDefaultExtractors(): void {
    if (this.registry.getAllExtractors().length === 0) {
      this.registry.registerExtractor(new HeadingExtractor());
      this.registry.registerExtractor(new ParagraphExtractor());
      this.registry.registerExtractor(new TableExtractor());
      this.registry.registerExtractor(new FootnoteExtractor());
      this.registry.registerExtractor(new CrossReferenceExtractor());
    }
  }

  public async extractKnowledge(
    document: ParsedDocument,
    partialConfig?: Partial<IKnowledgeEngineConfig>
  ): Promise<IExtractionServiceResult> {
    const startTime = Date.now();
    const config = createKnowledgeConfig(partialConfig);
    const executionId = generateExecutionId();

    let context = new PipelineContext({
      executionId,
      pipelineVersion: '1.0.0-BUILD-017C.3',
      document,
      config,
      cancellationToken: new CancellationToken(),
      createdAt: startTime,
      currentStage: PipelineStage.EXTRACTOR_DISPATCH,
      warnings: [],
      errors: [],
      intermediateObjects: [],
      intermediateRelationships: [],
      intermediateEvidence: [],
      collectedNodes: [],
      sharedContext: new Map()
    });

    // 1. Collect all nodes from document structure
    const nodes: BaseNode[] = [];
    document.structure.chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        sec.nodes.forEach((n) => nodes.push(n));
      });
    });
    document.structure.unassignedSections.forEach((sec) => {
      sec.nodes.forEach((n) => nodes.push(n));
    });

    context = context.setCollectedNodes(nodes);

    // 2. Dispatch nodes to extractors
    const allObjects: KnowledgeObject[] = [];
    const allEvidence: KnowledgeEvidence[] = [];
    const allRelationships: KnowledgeRelationship[] = [];

    for (const node of nodes) {
      context.throwIfCancelled();
      const result = await this.registry.dispatch(node, context);
      allObjects.push(...result.objects);
      allEvidence.push(...result.evidence);
      allRelationships.push(...result.relationships);

      if (result.warnings.length > 0) {
        result.warnings.forEach((w) => {
          context = context.addWarning('WARN_EXTRACTOR', w);
        });
      }

      if (result.errors.length > 0) {
        result.errors.forEach((e) => {
          context = context.addError('ERR_EXTRACTOR', e, false);
        });
      }
    }

    context = context.addObjects(allObjects);
    context = context.addEvidence(allEvidence);
    context = context.addRelationships(allRelationships);

    // 3. Build KnowledgePackage
    const packageId = generatePackageId(document.documentId);
    const executionTimeMs = Date.now() - startTime;

    const knowledgePackage = new KnowledgePackage({
      packageId,
      documentId: document.documentId,
      packageHash: document.packageHash,
      sourceFileName: document.fileName,
      version: '1.0.0-BUILD-017C.3',
      createdAt: Date.now(),
      objects: context.intermediateObjects,
      relationships: context.intermediateRelationships,
      evidenceList: context.intermediateEvidence,
      metrics: {
        knowledgeObjectCount: context.intermediateObjects.length,
        relationshipCount: context.intermediateRelationships.length,
        evidenceCount: context.intermediateEvidence.length,
        warningCount: context.warnings.length,
        errorCount: context.errors.length,
        executionTimeMs,
        memoryEstimateBytes: context.metrics.peakMemoryEstimateBytes,
        pipelineVersion: '1.0.0-BUILD-017C.3',
        extractedAt: Date.now()
      },
      metadata: {
        executionId,
        extractorsUsed: this.registry.getAllExtractors().map((e) => e.capabilities.name)
      }
    });

    return {
      knowledgePackage,
      pipelineContext: context,
      executionTimeMs
    };
  }
}

export const knowledgeExtractionService = KnowledgeExtractionService.getInstance();
