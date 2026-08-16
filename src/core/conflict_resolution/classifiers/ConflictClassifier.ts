// ============================================================================
// URJAFLUX AI OS - CONFLICT CLASSIFIER (CRE)
// Classifies Conflicts into Groups, Matrices, and Preserved Alternative Paths
// ============================================================================

import { 
  IConflictRecord, 
  IConflictGroup, 
  IConflictMatrixCell, 
  IAlternativeKnowledgePath,
  ConflictScope 
} from "../types/cre.types";
import { IApplicableKnowledgePackage } from "../../knowledge_intelligence/types/kie.types";
import { IConfidenceEvaluationPackage } from "../../knowledge_confidence/types/kce.types";

export class ConflictClassifier {

  /**
   * Classifies detected conflicts into Conflict Groups
   */
  public buildConflictGroups(conflicts: IConflictRecord[]): IConflictGroup[] {
    const groupsMap = new Map<string, IConflictRecord[]>();

    conflicts.forEach(c => {
      const scopeKey = c.affectedDirections[0] || c.affectedObjects[0] || c.affectedDomains[0] || 'GENERAL_SCOPE';
      if (!groupsMap.has(scopeKey)) {
        groupsMap.set(scopeKey, []);
      }
      groupsMap.get(scopeKey)!.push(c);
    });

    const groups: IConflictGroup[] = [];
    let groupIdx = 1;

    groupsMap.forEach((conflictList, scopeKey) => {
      const domainsSet = new Set<string>();
      conflictList.forEach(c => c.affectedDomains.forEach(d => domainsSet.add(d)));

      groups.push({
        groupId: `CRE-GROUP-${groupIdx++}`,
        groupTitle: `Conflict Cluster for Scope: ${scopeKey}`,
        scope: conflictList[0].scope,
        conflicts: conflictList,
        primaryDomain: (Array.from(domainsSet)[0] as any) || 'VASTU',
        involvedDomains: Array.from(domainsSet) as any[]
      });
    });

    return groups;
  }

  /**
   * Constructs Conflict Matrix Cells comparing paired rules/remedies
   */
  public buildConflictMatrix(conflicts: IConflictRecord[]): IConflictMatrixCell[] {
    const matrix: IConflictMatrixCell[] = [];
    let cellIdx = 1;

    conflicts.forEach(c => {
      if (c.affectedRuleIds.length >= 2) {
        matrix.push({
          cellId: `MATRIX-CELL-${cellIdx++}`,
          sourceId: c.affectedRuleIds[0],
          targetId: c.affectedRuleIds[1],
          conflictType: c.conflictType,
          severity: c.severity,
          divergenceSummary: c.explainability.reasonWhyConflictExists,
          isDirectContradiction: c.severity === 'DIRECT_CONTRADICTION'
        });
      }

      if (c.affectedRemedyCandidateIds.length >= 2) {
        matrix.push({
          cellId: `MATRIX-CELL-${cellIdx++}`,
          sourceId: c.affectedRemedyCandidateIds[0],
          targetId: c.affectedRemedyCandidateIds[1],
          conflictType: c.conflictType,
          severity: c.severity,
          divergenceSummary: c.explainability.reasonWhyConflictExists,
          isDirectContradiction: c.severity === 'DIRECT_CONTRADICTION'
        });
      }
    });

    return matrix;
  }

  /**
   * Constructs Preserved Alternative Knowledge Paths representing different classical schools or authors
   */
  public buildAlternativeKnowledgePaths(
    kiePkg: IApplicableKnowledgePackage,
    kcePkg: IConfidenceEvaluationPackage,
    conflicts: IConflictRecord[]
  ): IAlternativeKnowledgePath[] {
    const paths: IAlternativeKnowledgePath[] = [];

    // Group rules by domain / book reference to build distinct classical paths
    const bookPathsMap = new Map<string, { rules: string[]; remedies: string[]; domain: any; citations: any[] }>();

    kiePkg.applicableRules.forEach(rule => {
      const bookRef = rule.trace.founderApprovalReference || 'Canonical Reference';
      if (!bookPathsMap.has(bookRef)) {
        bookPathsMap.set(bookRef, {
          rules: [],
          remedies: [],
          domain: rule.domain,
          citations: []
        });
      }

      const entry = bookPathsMap.get(bookRef)!;
      entry.rules.push(rule.ruleId);
      
      const cit = kiePkg.applicableCitations.find(c => c.citationId === rule.trace.citationId);
      if (cit) entry.citations.push(cit);
    });

    kiePkg.remedyCandidateCollections.forEach(rem => {
      const rule = kiePkg.applicableRules.find(r => r.ruleId === rem.originatingRuleId);
      const bookRef = rule?.trace.founderApprovalReference || 'Canonical Reference';
      
      if (bookPathsMap.has(bookRef)) {
        bookPathsMap.get(bookRef)!.remedies.push(rem.primaryRemedyText);
      }
    });

    let pathIdx = 1;
    bookPathsMap.forEach((entry, bookRef) => {
      paths.push({
        pathId: `CRE-PATH-${pathIdx++}`,
        pathTitle: `Classical Knowledge Path: ${bookRef}`,
        classicalSchoolOrAuthor: `Classical School - ${bookRef.replace('FOUNDER-GOV-REF-', '')}`,
        sourceBookTitle: bookRef,
        primaryDomain: entry.domain,
        recommendedRules: Array.from(new Set(entry.rules)),
        recommendedRemedies: Array.from(new Set(entry.remedies)),
        associatedConfidence: 0.85,
        reasoningAndContext: `Preserved alternative classical approach based on ${bookRef}. Complete intellectual honesty maintained without suppression.`,
        citations: entry.citations
      });
    });

    return paths;
  }
}
