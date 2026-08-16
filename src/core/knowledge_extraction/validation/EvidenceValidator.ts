import { KnowledgeEvidence } from '../models/KnowledgeEvidence';
import { KnowledgePackage } from '../models/KnowledgePackage';
import { IValidationIssue } from './ValidationRule';

export class EvidenceValidator {
  public validateEvidence(knowledgePackage: KnowledgePackage): readonly IValidationIssue[] {
    const issues: IValidationIssue[] = [];
    const evidenceList = knowledgePackage.evidenceList;
    const documentId = knowledgePackage.documentId;

    // 1. Evidence Existence
    if (!evidenceList || evidenceList.length === 0) {
      issues.push({
        code: 'WARN_NO_EVIDENCE_REGISTERED',
        message: `KnowledgePackage '${knowledgePackage.packageId}' contains no KnowledgeEvidence items`,
        severity: 'WARNING',
        ruleName: 'EvidenceValidator.Existence',
        timestamp: Date.now()
      });
    }

    for (const ev of evidenceList) {
      // 2. Document Reference Validation
      if (!ev.documentId || !ev.documentId.trim()) {
        issues.push({
          code: 'ERR_EVIDENCE_MISSING_DOC_ID',
          message: `Evidence '${ev.evidenceId}' is missing documentId`,
          severity: 'ERROR',
          targetId: ev.evidenceId,
          ruleName: 'EvidenceValidator.DocumentReference',
          timestamp: Date.now()
        });
      } else if (documentId && ev.documentId !== documentId) {
        issues.push({
          code: 'WARN_EVIDENCE_DOC_ID_MISMATCH',
          message: `Evidence '${ev.evidenceId}' documentId '${ev.documentId}' does not match package documentId '${documentId}'`,
          severity: 'WARNING',
          targetId: ev.evidenceId,
          ruleName: 'EvidenceValidator.DocumentReference',
          timestamp: Date.now()
        });
      }

      // 3. Source Mapping (nodeId presence)
      if (!ev.nodeId || !ev.nodeId.trim()) {
        issues.push({
          code: 'ERR_EVIDENCE_MISSING_NODE_ID',
          message: `Evidence '${ev.evidenceId}' is missing source nodeId`,
          severity: 'ERROR',
          targetId: ev.evidenceId,
          ruleName: 'EvidenceValidator.SourceMapping',
          timestamp: Date.now()
        });
      }

      // 4. Quoted Text Validation
      if (!ev.quotedText || !ev.quotedText.trim()) {
        issues.push({
          code: 'ERR_EVIDENCE_EMPTY_QUOTED_TEXT',
          message: `Evidence '${ev.evidenceId}' quotedText is empty`,
          severity: 'ERROR',
          targetId: ev.evidenceId,
          ruleName: 'EvidenceValidator.QuotedText',
          timestamp: Date.now()
        });
      }

      // 5. Offsets Validation
      if (typeof ev.pageNumber === 'number' && ev.pageNumber < 0) {
        issues.push({
          code: 'ERR_EVIDENCE_INVALID_PAGE_NUMBER',
          message: `Evidence '${ev.evidenceId}' pageNumber cannot be negative (${ev.pageNumber})`,
          severity: 'ERROR',
          targetId: ev.evidenceId,
          ruleName: 'EvidenceValidator.Offsets',
          timestamp: Date.now()
        });
      }

      if (typeof ev.byteOffset === 'number' && ev.byteOffset < 0) {
        issues.push({
          code: 'ERR_EVIDENCE_INVALID_BYTE_OFFSET',
          message: `Evidence '${ev.evidenceId}' byteOffset cannot be negative (${ev.byteOffset})`,
          severity: 'ERROR',
          targetId: ev.evidenceId,
          ruleName: 'EvidenceValidator.Offsets',
          timestamp: Date.now()
        });
      }

      if (typeof ev.characterOffset === 'number' && ev.characterOffset < 0) {
        issues.push({
          code: 'ERR_EVIDENCE_INVALID_CHAR_OFFSET',
          message: `Evidence '${ev.evidenceId}' characterOffset cannot be negative (${ev.characterOffset})`,
          severity: 'ERROR',
          targetId: ev.evidenceId,
          ruleName: 'EvidenceValidator.Offsets',
          timestamp: Date.now()
        });
      }

      // 6. Confidence Validation
      if (typeof ev.confidence !== 'number' || isNaN(ev.confidence) || ev.confidence < 0 || ev.confidence > 1) {
        issues.push({
          code: 'ERR_EVIDENCE_INVALID_CONFIDENCE',
          message: `Evidence '${ev.evidenceId}' confidence score must be between 0 and 1 (${ev.confidence})`,
          severity: 'ERROR',
          targetId: ev.evidenceId,
          ruleName: 'EvidenceValidator.Confidence',
          timestamp: Date.now()
        });
      }
    }

    return Object.freeze(issues);
  }
}
