// ============================================================================
// URJAFLUX AI OS - CONFLICT DETECTOR (CRE)
// Deterministic Multi-Domain Conflict & Divergence Detection Engine
// ============================================================================

import { 
  ConflictType, 
  ConflictSeverity, 
  ConflictScope, 
  IConflictRecord, 
  IConflictExplainability 
} from "../types/cre.types";
import { IApplicableKnowledgePackage, IApplicableRuleMatch, IRemedyCandidateItem } from "../../knowledge_intelligence/types/kie.types";
import { IConfidenceEvaluationPackage, IEvaluatedRuleConfidence, IEvaluatedRemedyConfidence } from "../../knowledge_confidence/types/kce.types";

export class ConflictDetector {

  /**
   * Identifies all conflicts across Rules, Remedies, Spatial Zones, and Cross-Domain Packages
   */
  public detectConflicts(
    kiePkg: IApplicableKnowledgePackage,
    kcePkg: IConfidenceEvaluationPackage
  ): IConflictRecord[] {
    const conflicts: IConflictRecord[] = [];

    const ruleConfMap = new Map<string, IEvaluatedRuleConfidence>();
    kcePkg.evaluatedRuleConfidences.forEach(rc => ruleConfMap.set(rc.ruleId, rc));

    const remedyConfMap = new Map<string, IEvaluatedRemedyConfidence>();
    kcePkg.evaluatedRemedyConfidences.forEach(remC => remedyConfMap.set(remC.remedyCandidateId, remC));

    // 1. Detect Remedy Conflicts (Differing materials or methods for same zone/object)
    const remedyConflicts = this.detectRemedyConflicts(kiePkg, remedyConfMap, ruleConfMap);
    conflicts.push(...remedyConflicts);

    // 2. Detect Rule & Spatial Conflicts (Differing classical rules for same spatial scope)
    const spatialConflicts = this.detectSpatialRuleConflicts(kiePkg, ruleConfMap);
    conflicts.push(...spatialConflicts);

    // 3. Detect Cross-Domain Conflicts (Vastu vs Astrology vs LalKitab differences)
    const crossDomainConflicts = this.detectCrossDomainConflicts(kiePkg, ruleConfMap);
    conflicts.push(...crossDomainConflicts);

    // 4. Detect Condition & Exception Divergences
    const conditionConflicts = this.detectConditionConflicts(kiePkg, ruleConfMap);
    conflicts.push(...conditionConflicts);

    return conflicts;
  }

  /**
   * Detects remedy conflicts (e.g., Copper Strip vs Brass Strip vs Green Marble)
   */
  private detectRemedyConflicts(
    kiePkg: IApplicableKnowledgePackage,
    remedyConfMap: Map<string, IEvaluatedRemedyConfidence>,
    ruleConfMap: Map<string, IEvaluatedRuleConfidence>
  ): IConflictRecord[] {
    const conflicts: IConflictRecord[] = [];
    const remedyList = kiePkg.remedyCandidateCollections;

    if (remedyList.length < 2) return conflicts;

    // Group remedies by originating record or spatial zone
    const zoneRemedyGroups = new Map<string, IRemedyCandidateItem[]>();

    remedyList.forEach(rem => {
      const parentRule = kiePkg.applicableRules.find(r => r.ruleId === rem.originatingRuleId);
      const zoneKey = parentRule?.matchedDimensions.matchedDirections[0] || 
                      parentRule?.matchedDimensions.matchedObjects[0] || 
                      'GENERAL_ZONE';

      if (!zoneRemedyGroups.has(zoneKey)) {
        zoneRemedyGroups.set(zoneKey, []);
      }
      zoneRemedyGroups.get(zoneKey)!.push(rem);
    });

    let conflictIdx = 1;
    zoneRemedyGroups.forEach((remedies, zoneKey) => {
      if (remedies.length > 1) {
        // Compare remedies for divergence
        for (let i = 0; i < remedies.length; i++) {
          for (let j = i + 1; j < remedies.length; j++) {
            const r1 = remedies[i];
            const r2 = remedies[j];

            if (r1.primaryRemedyText !== r2.primaryRemedyText) {
              const rule1Conf = ruleConfMap.get(r1.originatingRuleId);
              const rule2Conf = ruleConfMap.get(r2.originatingRuleId);
              const rem1Conf = remedyConfMap.get(r1.remedyCandidateId);
              const rem2Conf = remedyConfMap.get(r2.remedyCandidateId);

              const isDirectContradiction = 
                (r1.primaryRemedyText.toLowerCase().includes("copper") && r2.primaryRemedyText.toLowerCase().includes("brass")) ||
                (r1.primaryRemedyText.toLowerCase().includes("metal") && r2.primaryRemedyText.toLowerCase().includes("marble"));

              const severity: ConflictSeverity = isDirectContradiction ? 'DIRECT_CONTRADICTION' : 'PARTIAL_DIVERGENCE';

              const explainability: IConflictExplainability = {
                reasonWhyConflictExists: `Alternative remedy recommendations exist for ${zoneKey}: "${r1.primaryRemedyText}" vs "${r2.primaryRemedyText}"`,
                participatingKnowledgeRecordIds: [r1.originatingRecordId, r2.originatingRecordId],
                contributingBookTitles: [
                  rule1Conf?.trace.founderApprovalReference || 'Canonical Book A',
                  rule2Conf?.trace.founderApprovalReference || 'Canonical Book B'
                ],
                contributingCitations: [
                  ...r1.citationReferences,
                  ...r2.citationReferences
                ],
                differingConditions: [...r1.conditions, ...r2.conditions],
                differingExceptions: [...r1.exceptions, ...r2.exceptions],
                differingSpatialContexts: [zoneKey],
                differingClientContexts: []
              };

              conflicts.push({
                conflictId: `CRE-CONF-REM-${conflictIdx++}`,
                conflictType: 'REMEDY_CONFLICT',
                severity,
                scope: 'ZONE_SPECIFIC',
                conflictTitle: `Remedy Alternative in ${zoneKey}: ${r1.primaryRemedyText} vs ${r2.primaryRemedyText}`,
                affectedDomains: Array.from(new Set([...r1.applicableDomains, ...r2.applicableDomains])),
                affectedRuleIds: [r1.originatingRuleId, r2.originatingRuleId],
                affectedRemedyCandidateIds: [r1.remedyCandidateId, r2.remedyCandidateId],
                affectedKnowledgeRecordIds: [r1.originatingRecordId, r2.originatingRecordId],
                affectedObjects: [],
                affectedDirections: [zoneKey],
                affectedZones: [zoneKey],
                affectedElements: [],
                affectedPlanets: [],
                explainability,
                participatingRuleConfidences: [rule1Conf, rule2Conf].filter(Boolean) as IEvaluatedRuleConfidence[],
                participatingRemedyConfidences: [rem1Conf, rem2Conf].filter(Boolean) as IEvaluatedRemedyConfidence[],
                evidenceHashes: Array.from(new Set([...r1.evidenceReferences, ...r2.evidenceReferences])),
                citationIds: Array.from(new Set([...r1.citationReferences, ...r2.citationReferences])),
                relationshipChains: [...r1.relationshipChain, ...r2.relationshipChain],
                founderApprovalReferences: [
                  rule1Conf?.trace.founderApprovalReference || 'FOUNDER-GOV-REF-A',
                  rule2Conf?.trace.founderApprovalReference || 'FOUNDER-GOV-REF-B'
                ]
              });
            }
          }
        }
      }
    });

    return conflicts;
  }

  /**
   * Detects rule conflicts across spatial directions/zones
   */
  private detectSpatialRuleConflicts(
    kiePkg: IApplicableKnowledgePackage,
    ruleConfMap: Map<string, IEvaluatedRuleConfidence>
  ): IConflictRecord[] {
    const conflicts: IConflictRecord[] = [];
    const rules = kiePkg.applicableRules;

    let idx = 1;
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const r1 = rules[i];
        const r2 = rules[j];

        const sameZone = r1.matchedDimensions.matchedDirections.some(d => r2.matchedDimensions.matchedDirections.includes(d));
        
        if (sameZone && r1.knowledgeRecordId !== r2.knowledgeRecordId) {
          const rule1Conf = ruleConfMap.get(r1.ruleId);
          const rule2Conf = ruleConfMap.get(r2.ruleId);

          conflicts.push({
            conflictId: `CRE-CONF-SPAT-${idx++}`,
            conflictType: 'SPATIAL_CONFLICT',
            severity: 'SCHOOL_DIFFERENCE',
            scope: 'ZONE_SPECIFIC',
            conflictTitle: `Spatial Rule Interpretation for Zone ${r1.matchedDimensions.matchedDirections.join(', ')}`,
            affectedDomains: Array.from(new Set([r1.domain, r2.domain])),
            affectedRuleIds: [r1.ruleId, r2.ruleId],
            affectedRemedyCandidateIds: [],
            affectedKnowledgeRecordIds: [r1.knowledgeRecordId, r2.knowledgeRecordId],
            affectedObjects: r1.matchedDimensions.matchedObjects,
            affectedDirections: r1.matchedDimensions.matchedDirections,
            affectedZones: r1.matchedDimensions.matchedDirections,
            affectedElements: [],
            affectedPlanets: [],
            explainability: {
              reasonWhyConflictExists: `Multiple classical rules apply to direction ${r1.matchedDimensions.matchedDirections.join(', ')}`,
              participatingKnowledgeRecordIds: [r1.knowledgeRecordId, r2.knowledgeRecordId],
              contributingBookTitles: [
                rule1Conf?.trace.founderApprovalReference || 'Book A',
                rule2Conf?.trace.founderApprovalReference || 'Book B'
              ],
              contributingCitations: [r1.trace.citationId, r2.trace.citationId],
              differingConditions: [],
              differingExceptions: [],
              differingSpatialContexts: r1.matchedDimensions.matchedDirections,
              differingClientContexts: []
            },
            participatingRuleConfidences: [rule1Conf, rule2Conf].filter(Boolean) as IEvaluatedRuleConfidence[],
            participatingRemedyConfidences: [],
            evidenceHashes: [r1.trace.evidenceHash, r2.trace.evidenceHash],
            citationIds: [r1.trace.citationId, r2.trace.citationId],
            relationshipChains: [...r1.trace.relationshipChain, ...r2.trace.relationshipChain],
            founderApprovalReferences: [
              rule1Conf?.trace.founderApprovalReference || 'FOUNDER-GOV-REF-1',
              rule2Conf?.trace.founderApprovalReference || 'FOUNDER-GOV-REF-2'
            ]
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detects cross-domain conflicts between Vastu, Astrology, LalKitab, Ayurveda, etc.
   */
  private detectCrossDomainConflicts(
    kiePkg: IApplicableKnowledgePackage,
    ruleConfMap: Map<string, IEvaluatedRuleConfidence>
  ): IConflictRecord[] {
    const conflicts: IConflictRecord[] = [];
    const crossRels = kiePkg.applicableCrossDomainRelationships;

    let idx = 1;
    crossRels.forEach(rel => {
      const srcRule = kiePkg.applicableRules.find(r => r.knowledgeRecordId === rel.sourceRecordId);
      const tgtRule = kiePkg.applicableRules.find(r => r.knowledgeRecordId === rel.targetRecordId);

      if (srcRule && tgtRule && rel.sourceDomain !== rel.targetDomain) {
        const srcConf = ruleConfMap.get(srcRule.ruleId);
        const tgtConf = ruleConfMap.get(tgtRule.ruleId);

        conflicts.push({
          conflictId: `CRE-CONF-XDOM-${idx++}`,
          conflictType: 'CROSS_DOMAIN_CONFLICT',
          severity: 'CROSS_DOMAIN_VARIANCE',
          scope: 'PROPERTY_WIDE',
          conflictTitle: `Cross-Domain Variance: ${rel.sourceDomain} vs ${rel.targetDomain}`,
          affectedDomains: [rel.sourceDomain, rel.targetDomain],
          affectedRuleIds: [srcRule.ruleId, tgtRule.ruleId],
          affectedRemedyCandidateIds: [],
          affectedKnowledgeRecordIds: [rel.sourceRecordId, rel.targetRecordId],
          affectedObjects: [],
          affectedDirections: srcRule.matchedDimensions.matchedDirections,
          affectedZones: [],
          affectedElements: [],
          affectedPlanets: [],
          explainability: {
            reasonWhyConflictExists: `Inter-domain relationship link (${rel.relationshipType}) connects ${rel.sourceDomain} and ${rel.targetDomain} with distinct classical perspectives.`,
            participatingKnowledgeRecordIds: [rel.sourceRecordId, rel.targetRecordId],
            contributingBookTitles: [
              srcConf?.trace.founderApprovalReference || 'Source Book',
              tgtConf?.trace.founderApprovalReference || 'Target Book'
            ],
            contributingCitations: [srcRule.trace.citationId, tgtRule.trace.citationId],
            differingConditions: [],
            differingExceptions: [],
            differingSpatialContexts: srcRule.matchedDimensions.matchedDirections,
            differingClientContexts: []
          },
          participatingRuleConfidences: [srcConf, tgtConf].filter(Boolean) as IEvaluatedRuleConfidence[],
          participatingRemedyConfidences: [],
          evidenceHashes: [srcRule.trace.evidenceHash, tgtRule.trace.evidenceHash],
          citationIds: [srcRule.trace.citationId, tgtRule.trace.citationId],
          relationshipChains: [...srcRule.trace.relationshipChain, ...tgtRule.trace.relationshipChain],
          founderApprovalReferences: [
            srcConf?.trace.founderApprovalReference || 'FOUNDER-REF-SRC',
            tgtConf?.trace.founderApprovalReference || 'FOUNDER-REF-TGT'
          ]
        });
      }
    });

    return conflicts;
  }

  /**
   * Detects condition and exception divergences
   */
  private detectConditionConflicts(
    kiePkg: IApplicableKnowledgePackage,
    ruleConfMap: Map<string, IEvaluatedRuleConfidence>
  ): IConflictRecord[] {
    const conflicts: IConflictRecord[] = [];
    const rules = kiePkg.applicableRules;

    let idx = 1;
    rules.forEach(rule => {
      if (rule.trace.explainability.matchedConditions.length > 0 && rule.trace.explainability.matchedObjects.length > 0) {
        const conf = ruleConfMap.get(rule.ruleId);

        conflicts.push({
          conflictId: `CRE-CONF-COND-${idx++}`,
          conflictType: 'CONDITION_CONFLICT',
          severity: 'INFORMATIONAL_ALTERNATIVE',
          scope: 'OBJECT_SPECIFIC',
          conflictTitle: `Condition Specificity for Rule ${rule.ruleId} (${rule.matchedDimensions.matchedObjects.join(', ')})`,
          affectedDomains: [rule.domain],
          affectedRuleIds: [rule.ruleId],
          affectedRemedyCandidateIds: [],
          affectedKnowledgeRecordIds: [rule.knowledgeRecordId],
          affectedObjects: rule.matchedDimensions.matchedObjects,
          affectedDirections: rule.matchedDimensions.matchedDirections,
          affectedZones: [],
          affectedElements: [],
          affectedPlanets: [],
          explainability: {
            reasonWhyConflictExists: `Rule carries conditional constraints: [${rule.trace.explainability.matchedConditions.join(', ')}]`,
            participatingKnowledgeRecordIds: [rule.knowledgeRecordId],
            contributingBookTitles: [conf?.trace.founderApprovalReference || 'Canonical Book'],
            contributingCitations: [rule.trace.citationId],
            differingConditions: rule.trace.explainability.matchedConditions,
            differingExceptions: [],
            differingSpatialContexts: rule.matchedDimensions.matchedDirections,
            differingClientContexts: rule.trace.explainability.matchedClientContext
          },
          participatingRuleConfidences: [conf].filter(Boolean) as IEvaluatedRuleConfidence[],
          participatingRemedyConfidences: [],
          evidenceHashes: [rule.trace.evidenceHash],
          citationIds: [rule.trace.citationId],
          relationshipChains: rule.trace.relationshipChain,
          founderApprovalReferences: [conf?.trace.founderApprovalReference || 'FOUNDER-GOV-REF']
        });
      }
    });

    return conflicts;
  }
}
