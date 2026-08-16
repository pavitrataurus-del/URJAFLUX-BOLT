import { SourceLocation } from '../../knowledge_parsing/types/document.types';
import { KnowledgeEvidenceType } from '../types/knowledge.types';
import { IKnowledgeEvidenceData } from '../types/package.types';

export class KnowledgeEvidence implements IKnowledgeEvidenceData {
  public readonly evidenceId: string;
  public readonly documentId: string;
  public readonly nodeId: string;
  public readonly pageNumber?: number;
  public readonly byteOffset?: number;
  public readonly characterOffset?: number;
  public readonly lineNumber?: number;
  public readonly quotedText: string;
  public readonly sourceLocation?: SourceLocation;
  public readonly confidence: number;
  public readonly evidenceType: KnowledgeEvidenceType;
  public readonly extractedByRule?: string;
  public readonly pipelineStage?: string;

  constructor(data: IKnowledgeEvidenceData) {
    this.evidenceId = data.evidenceId;
    this.documentId = data.documentId;
    this.nodeId = data.nodeId;
    this.pageNumber = data.pageNumber;
    this.byteOffset = data.byteOffset;
    this.characterOffset = data.characterOffset;
    this.lineNumber = data.lineNumber;
    this.quotedText = data.quotedText;
    this.sourceLocation = data.sourceLocation;
    this.confidence = data.confidence;
    this.evidenceType = data.evidenceType;
    this.extractedByRule = data.extractedByRule;
    this.pipelineStage = data.pipelineStage;
  }

  public toJSON(): IKnowledgeEvidenceData {
    return {
      evidenceId: this.evidenceId,
      documentId: this.documentId,
      nodeId: this.nodeId,
      pageNumber: this.pageNumber,
      byteOffset: this.byteOffset,
      characterOffset: this.characterOffset,
      lineNumber: this.lineNumber,
      quotedText: this.quotedText,
      sourceLocation: this.sourceLocation,
      confidence: this.confidence,
      evidenceType: this.evidenceType,
      extractedByRule: this.extractedByRule,
      pipelineStage: this.pipelineStage
    };
  }

  public static fromJSON(json: IKnowledgeEvidenceData): KnowledgeEvidence {
    return new KnowledgeEvidence(json);
  }
}
