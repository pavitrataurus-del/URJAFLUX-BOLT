export type AnalysisSectionType =
  | 'Summary'
  | 'Metrics'
  | 'Observations'
  | 'Recommendations'
  | 'Remedies'
  | 'Warnings'
  | 'Images'
  | 'Floor Plans'
  | 'Tables'
  | 'Charts'
  | 'References'
  | 'Metadata';

export interface IAnalysisSection {
  id: string;
  type: AnalysisSectionType;
  title: string;
  content: any; // Structured JSON only. No JSX or HTML components.
}

export interface IAnalysisRecommendation {
  id: string;
  text: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  remedy?: string;
  zone?: string;
  evidence?: string;
}

export interface IAnalysisAttachment {
  id: string;
  type: string;
  title: string;
  url: string;
  caption?: string;
  sourceDomain: string;
  timestamp?: string;
}

export interface IAnalysisReference {
  id: string;
  sourceBook: string;
  chapterVerse?: string;
  excerptText?: string;
  author?: string;
  reliabilityScore?: number;
}

/**
 * Standard Analysis Contract (Part 2)
 * Every compliant analysis engine publishes this exact schema.
 */
export interface IAnalysisContract {
  moduleId: string;
  moduleName: string;
  version: string;
  generatedTimestamp: string;
  confidence: number; // Value from 0 to 100 representing confidence rating
  dataSections: IAnalysisSection[];
  warnings: string[];
  recommendations: IAnalysisRecommendation[];
  attachments: IAnalysisAttachment[];
  references: IAnalysisReference[];
  sourceModule: string;
  executionTimeMs: number;
}
