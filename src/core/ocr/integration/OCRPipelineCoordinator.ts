import { OCRService, IOCRServiceOptions } from '../services/OCRService';
import { OCRParserBridge, IOCRParserBridgeResult } from './OCRParserBridge';
import { OCRIntegrationMetrics } from './OCRIntegrationMetrics';
import { ParsedDocument } from '../../knowledge_parsing/types/document.types';
import { StructuredDocument } from '../reconstruction/StructuredDocument';
import { OCRResult } from '../models/OCRResult';
import { OCRQualityReport } from '../validation/OCRQualityReport';
import { Logger } from '../../utils/logger';

export interface IOCRPipelineCoordinatorOptions extends IOCRServiceOptions {
  readonly enforceCompatibilityThreshold?: number;
}

export interface IOCRPipelineExecutionResult {
  readonly success: boolean;
  readonly parsedDocument: ParsedDocument;
  readonly structuredDocument: StructuredDocument;
  readonly ocrResult: OCRResult;
  readonly qualityReport: OCRQualityReport;
  readonly bridgeResult: IOCRParserBridgeResult;
  readonly metrics: OCRIntegrationMetrics;
}

export class OCRPipelineCoordinator {
  private static instance: OCRPipelineCoordinator | null = null;
  private readonly ocrService: OCRService;
  private readonly parserBridge: OCRParserBridge;

  private constructor() {
    this.ocrService = OCRService.getInstance();
    this.parserBridge = OCRParserBridge.getInstance();
  }

  public static getInstance(): OCRPipelineCoordinator {
    if (!OCRPipelineCoordinator.instance) {
      OCRPipelineCoordinator.instance = new OCRPipelineCoordinator();
    }
    return OCRPipelineCoordinator.instance;
  }

  public async executeEndToEndPipeline(
    input: Uint8Array | string,
    options?: IOCRPipelineCoordinatorOptions
  ): Promise<IOCRPipelineExecutionResult> {
    const pipelineStartTime = Date.now();
    Logger.info('[OCRPipelineCoordinator] Starting End-to-End OCR & Parser Integration Pipeline');

    // Step 1 & 2: Process OCR + Document Reconstruction + OCR Quality Validation
    const t0 = Date.now();
    const serviceResult = await this.ocrService.processAndReconstruct(input, options);
    const ocrAndReconstructTime = Date.now() - t0;

    const { structuredDocument, ocrResult, qualityReport } = serviceResult;

    // Step 3 & 4: Bridge to Parser & Validate Contract Compatibility
    const t1 = Date.now();
    const bridgeResult = await this.parserBridge.bridgeToParser(structuredDocument);
    const bridgeTimeMs = Date.now() - t1;

    const totalPipelineTimeMs = Date.now() - pipelineStartTime;

    // Step 5: Gather Integration Metrics
    const totalNodes = structuredDocument.getAllNodes().length;
    const totalPages = structuredDocument.structure.pages.length;

    const metrics = new OCRIntegrationMetrics({
      documentId: structuredDocument.documentId,
      provider: options?.provider || 'MOCK_ENTERPRISE',
      totalPipelineTimeMs,
      ocrEngineTimeMs: ocrResult.processingTimeMs,
      reconstructionTimeMs: Math.max(0, ocrAndReconstructTime - ocrResult.processingTimeMs),
      validationTimeMs: 10,
      bridgeTimeMs,
      compatibilityReport: bridgeResult.compatibilityReport,
      totalPagesProcessed: totalPages,
      totalNodesMapped: totalNodes,
      success: bridgeResult.success
    });

    Logger.info(`[OCRPipelineCoordinator] End-to-End Pipeline Completed in ${totalPipelineTimeMs}ms. Score: ${metrics.compatibilityScore}, Compatible: ${metrics.success}`);

    return Object.freeze({
      success: metrics.success,
      parsedDocument: bridgeResult.parsedDocument,
      structuredDocument,
      ocrResult,
      qualityReport,
      bridgeResult,
      metrics
    });
  }
}

export const ocrPipelineCoordinator = OCRPipelineCoordinator.getInstance();
