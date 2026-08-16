import { IReportSectionData, IReportBlock } from './ReportTypes';
import { IAnalysisContract } from './AnalysisContract';

export interface ISourceTraceMetadata {
  sourceModule: string;
  sourceVersion: string;
  generatedTimestamp: string;
  knowledgeSources?: string[];
  referenceIds?: string[];
  evidenceIds?: string[];
}

export class SourceTraceService {
  private static instance: SourceTraceService;
  // Audit log of active documents in session
  private auditRegistry = new Map<string, ISourceTraceMetadata>();

  private constructor() {}

  public static getInstance(): SourceTraceService {
    if (!SourceTraceService.instance) {
      SourceTraceService.instance = new SourceTraceService();
    }
    return SourceTraceService.instance;
  }

  /**
   * Generates tracing metadata from an incoming analysis contract.
   */
  public generateTrace(contract: IAnalysisContract): ISourceTraceMetadata {
    return {
      sourceModule: contract.sourceModule || contract.moduleId,
      sourceVersion: contract.version,
      generatedTimestamp: contract.generatedTimestamp,
      knowledgeSources: contract.references?.map(r => r.sourceBook) || [],
      referenceIds: contract.references?.map(r => r.id) || [],
      evidenceIds: contract.attachments?.map(a => a.id) || []
    };
  }

  /**
   * Stamps a section with tracing metadata.
   */
  public stampSection(section: IReportSectionData, trace: ISourceTraceMetadata): IReportSectionData {
    const stamped = {
      ...section,
      structuredData: {
        ...(section.structuredData || {}),
        traceability: trace
      }
    };

    // Stamping child blocks as well (if present)
    if (stamped.blocks) {
      stamped.blocks = stamped.blocks.map(block => this.stampBlock(block, trace));
    }

    // Register in audit logger for compliance queries
    this.auditRegistry.set(section.sectionId, trace);

    return stamped;
  }

  /**
   * Stamps a block with tracing metadata.
   */
  public stampBlock(block: IReportBlock, trace: ISourceTraceMetadata): IReportBlock {
    const blockTraceKey = `block-${block.blockId}`;
    this.auditRegistry.set(blockTraceKey, trace);

    return {
      ...block,
      content: typeof block.content === 'object' && block.content !== null
        ? { ...block.content, traceability: trace }
        : { text: block.content, traceability: trace }
    };
  }

  /**
   * Queries the source tracing trail for any block or section.
   */
  public getTrace(id: string): ISourceTraceMetadata | undefined {
    return this.auditRegistry.get(id) || this.auditRegistry.get(`block-${id}`);
  }

  /**
   * Retrieves the comprehensive traceability audit log.
   */
  public getAuditLog(): Record<string, ISourceTraceMetadata> {
    const log: Record<string, ISourceTraceMetadata> = {};
    this.auditRegistry.forEach((value, key) => {
      log[key] = value;
    });
    return log;
  }
}
export const SourceTrace = SourceTraceService.getInstance();
