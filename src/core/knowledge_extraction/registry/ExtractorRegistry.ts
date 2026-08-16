import { BaseNode } from '../../knowledge_parsing/types/document.types';
import { PipelineContext } from '../pipeline/PipelineContext';
import {
  BaseKnowledgeExtractor,
  IExtractionResult,
  IExtractorMetrics
} from '../extractors/BaseKnowledgeExtractor';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { KnowledgeEvidence } from '../models/KnowledgeEvidence';
import { KnowledgeRelationship } from '../models/KnowledgeRelationship';

export class ExtractorRegistry {
  private static instance: ExtractorRegistry;
  private readonly extractorsMap: Map<string, BaseKnowledgeExtractor> = new Map();

  private constructor() {}

  public static getInstance(): ExtractorRegistry {
    if (!ExtractorRegistry.instance) {
      ExtractorRegistry.instance = new ExtractorRegistry();
    }
    return ExtractorRegistry.instance;
  }

  public registerExtractor(extractor: BaseKnowledgeExtractor): void {
    const name = extractor.capabilities.name;
    this.extractorsMap.set(name, extractor);
  }

  public unregisterExtractor(extractorName: string): boolean {
    return this.extractorsMap.delete(extractorName);
  }

  public getExtractor(extractorName: string): BaseKnowledgeExtractor | undefined {
    return this.extractorsMap.get(extractorName);
  }

  public getAllExtractors(): readonly BaseKnowledgeExtractor[] {
    return Array.from(this.extractorsMap.values());
  }

  public findExtractorsForNode(node: BaseNode): readonly BaseKnowledgeExtractor[] {
    return Array.from(this.extractorsMap.values())
      .filter((ext) => ext.canExtract(node))
      .sort((a, b) => b.capabilities.priority - a.capabilities.priority);
  }

  public async dispatch(
    node: BaseNode,
    context: PipelineContext
  ): Promise<IExtractionResult> {
    const startTime = Date.now();
    const compatibleExtractors = this.findExtractorsForNode(node);

    if (compatibleExtractors.length === 0) {
      const emptyMetrics: IExtractorMetrics = {
        executionTimeMs: Date.now() - startTime,
        objectsProduced: 0,
        evidenceProduced: 0,
        relationshipsProduced: 0,
        nodesVisited: 1,
        warnings: 1,
        skippedNodes: 1,
        errors: 0
      };
      return {
        objects: [],
        evidence: [],
        relationships: [],
        metrics: emptyMetrics,
        warnings: [`No compatible extractor found for node type '${node.type}' (id: ${node.id})`],
        errors: []
      };
    }

    const aggregatedObjects: KnowledgeObject[] = [];
    const aggregatedEvidence: KnowledgeEvidence[] = [];
    const aggregatedRelationships: KnowledgeRelationship[] = [];
    const aggregatedWarnings: string[] = [];
    const aggregatedErrors: string[] = [];

    let totalObjects = 0;
    let totalEvidence = 0;
    let totalRelationships = 0;
    let totalWarnings = 0;
    let totalErrors = 0;
    let totalSkipped = 0;

    for (const extractor of compatibleExtractors) {
      try {
        const result = await extractor.extract(node, context);
        aggregatedObjects.push(...result.objects);
        aggregatedEvidence.push(...result.evidence);
        aggregatedRelationships.push(...result.relationships);
        aggregatedWarnings.push(...result.warnings);
        aggregatedErrors.push(...result.errors);

        totalObjects += result.metrics.objectsProduced;
        totalEvidence += result.metrics.evidenceProduced;
        totalRelationships += result.metrics.relationshipsProduced;
        totalWarnings += result.metrics.warnings;
        totalErrors += result.metrics.errors;
        totalSkipped += result.metrics.skippedNodes;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        aggregatedErrors.push(`Extractor '${extractor.capabilities.name}' failed on node ${node.id}: ${errMsg}`);
        totalErrors++;
      }
    }

    const aggregatedMetrics: IExtractorMetrics = {
      executionTimeMs: Date.now() - startTime,
      objectsProduced: totalObjects,
      evidenceProduced: totalEvidence,
      relationshipsProduced: totalRelationships,
      nodesVisited: 1,
      warnings: totalWarnings,
      skippedNodes: totalSkipped,
      errors: totalErrors
    };

    return {
      objects: aggregatedObjects,
      evidence: aggregatedEvidence,
      relationships: aggregatedRelationships,
      metrics: aggregatedMetrics,
      warnings: aggregatedWarnings,
      errors: aggregatedErrors
    };
  }

  public clear(): void {
    this.extractorsMap.clear();
  }
}

export const extractorRegistry = ExtractorRegistry.getInstance();
