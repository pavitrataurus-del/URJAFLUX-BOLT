import { ParsedDocument } from './document.types';
import { ParserConfig, ParsingMetrics } from './parser.types';
import { DocumentValidationReport } from './validation.types';

export enum ParsingPipelineStage {
  PACKAGE_VALIDATION = 'PACKAGE_VALIDATION',
  PARSER_SELECTION = 'PARSER_SELECTION',
  METADATA_EXTRACTION = 'METADATA_EXTRACTION',
  STRUCTURE_EXTRACTION = 'STRUCTURE_EXTRACTION',
  CONTENT_SEGMENTATION = 'CONTENT_SEGMENTATION',
  DOCUMENT_ASSEMBLY = 'DOCUMENT_ASSEMBLY',
  DOCUMENT_VALIDATION = 'DOCUMENT_VALIDATION',
  COMPLETED = 'COMPLETED'
}

export interface ParsingPipelineContext {
  readonly file: File | Uint8Array;
  readonly fileName: string;
  readonly packageHash: string;
  readonly extension: string;
  readonly config: ParserConfig;
  readonly stageTimings: Map<ParsingPipelineStage, number>;
  selectedParserId?: string;
  partiallyParsedDocument?: Partial<ParsedDocument>;
}

export interface ParsingStageResult<T = unknown> {
  readonly stage: ParsingPipelineStage;
  readonly success: boolean;
  readonly data?: T;
  readonly errorMessage?: string;
  readonly durationMs: number;
}

export interface ParsingPipelineResult {
  readonly success: boolean;
  readonly document?: ParsedDocument;
  readonly metrics?: ParsingMetrics;
  readonly validationReport?: DocumentValidationReport;
  readonly stageResults: readonly ParsingStageResult[];
  readonly totalDurationMs: number;
  readonly errorMessage?: string;
}
