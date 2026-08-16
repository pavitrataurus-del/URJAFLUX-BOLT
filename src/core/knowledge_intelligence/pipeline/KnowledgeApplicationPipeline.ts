// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE APPLICATION PIPELINE (KIE)
// Core Pipeline that applies Founder-Approved Knowledge Vault Records to Client & Spatial Context
// ============================================================================

import { 
  IClientContextProfile, 
  ISpatialContextData, 
  IApplicableRuleMatch, 
  IApplicableKnowledgePackage, 
  IKieEvaluationSession,
  KnowledgeDomain,
  IIssueCluster,
  IObjectCluster,
  IDirectionCluster,
  IElementCluster,
  IPlanetCluster,
  IRoomCluster,
  IActivityCluster,
  IDomainCluster,
  ICrossDomainPackage,
  IRemedyCandidateItem
} from "../types/kie.types";
import { ClientContextEvaluator } from "../context/ClientContextEvaluator";
import { SpatialContextEvaluator } from "../context/SpatialContextEvaluator";
import { IKqeQueryResultPackage } from "../../knowledge_query/types/kqe.types";
import { KnowledgeCorrelationEngine } from "../../knowledge_correlation/engine/KnowledgeCorrelationEngine";
import { KnowledgeVaultStore } from "../../knowledge_vault/store/KnowledgeVaultStore";
import { RuleRegistryEngine } from "../../rule_registry/engine/RuleRegistryEngine";
import { IVaultKnowledgeRecord, IVaultCitation, IVaultEvidence } from "../../knowledge_vault/types/vaultRecord.types";

export class KnowledgeApplicationPipeline {
  private clientEvaluator = new ClientContextEvaluator();
  private spatialEvaluator = new SpatialContextEvaluator();
  private correlationEngine = KnowledgeCorrelationEngine.getInstance();
  private vaultStore = KnowledgeVaultStore.getInstance();
  private registryEngine = RuleRegistryEngine.getInstance();

  private static KIE_VERSION = "1.0.0-CANONICAL";

  /**
   * Applies Founder-approved Knowledge Vault records to client and spatial context
   * and builds complete contextual intelligence clusters, cross-domain packages, and remedy collections.
   */
  public executeApplicationPipeline(
    clientContext: IClientContextProfile,
    spatialContext: ISpatialContextData,
    queryPackage: IKqeQueryResultPackage,
    session?: IKieEvaluationSession
  ): IApplicableKnowledgePackage {
    const startTimeMs = Date.now();
    const packageId = `KIE-PKG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const sessionId = session?.sessionId || `SESS-${Date.now()}`;

    // 1. Evaluate Client & Spatial Contexts
    const clientEval = this.clientEvaluator.evaluateClientContext(clientContext);
    const spatialEval = this.spatialEvaluator.evaluateSpatialContext(spatialContext);

    // 2. Gather candidate Knowledge Vault Records from Query Package & Vault Store
    const evaluatedRecordsMap = new Map<string, IVaultKnowledgeRecord>();

    // From Query Package
    queryPackage.matchingKnowledgeRecordIds.forEach(id => {
      const rec = this.vaultStore.getRecordById(id);
      if (rec) evaluatedRecordsMap.set(rec.recordId, rec);
    });

    // Supplementary dimensional retrieval from Vault Store
    const spatialVaultRecs = this.vaultStore.queryVault({
      zone: spatialEval.normalizedDirection || spatialEval.normalizedZone || undefined,
      planet: spatialEval.normalizedPlanet || undefined
    });
    spatialVaultRecs.forEach(rec => evaluatedRecordsMap.set(rec.recordId, rec));

    const allEvaluatedRecords = Array.from(evaluatedRecordsMap.values());

    // 3. Process records to discover Applicable Knowledge & build Intelligence Collections
    const applicableRuleMatches: IApplicableRuleMatch[] = [];
    const applicableKnowledgeIdsSet = new Set<string>();
    const applicableConditionsSet = new Set<string>();
    const applicableExceptionsSet = new Set<string>();
    const applicablePositiveFindingsSet = new Set<string>();
    const applicableDoshasSet = new Set<string>();
    const applicableRemediesSet = new Set<string>();
    const applicableAltRemediesSet = new Set<string>();

    const citationsMap = new Map<string, IVaultCitation>();
    const evidenceMap = new Map<string, IVaultEvidence>();
    const crossDomainRelsList: Array<{
      sourceDomain: KnowledgeDomain;
      targetDomain: KnowledgeDomain;
      relationshipType: string;
      sourceRecordId: string;
      targetRecordId: string;
    }> = [];

    const remedyCandidateItems: IRemedyCandidateItem[] = [];
    const allRelationshipChains: string[] = [];
    const allTriggerChains: string[] = [];

    const ruleTriggerMetadata: Array<{
      ruleId: string;
      triggerConditions: string[];
      triggerDomain: KnowledgeDomain;
    }> = [];

    // Grouping maps for Clusters
    const issueClusterMap = new Map<string, IIssueCluster>();
    const objectClusterMap = new Map<string, IObjectCluster>();
    const directionClusterMap = new Map<string, IDirectionCluster>();
    const zoneClusterMap = new Map<string, IDirectionCluster>();
    const elementClusterMap = new Map<string, IElementCluster>();
    const planetClusterMap = new Map<string, IPlanetCluster>();
    const roomClusterMap = new Map<string, IRoomCluster>();
    const activityClusterMap = new Map<string, IActivityCluster>();
    const domainClusterMap = new Map<KnowledgeDomain, IDomainCluster>();

    allEvaluatedRecords.forEach(vaultRec => {
      const p = vaultRec.knowledgePayload;
      const ruleId = `REG-${vaultRec.recordId}`;

      // Check if rule applies spatially or contextually
      const dirMatch = spatialEval.normalizedDirection && p.targetZones.some(z => z.toUpperCase().includes(spatialEval.normalizedDirection));
      const roomMatch = spatialEval.normalizedRoom && p.targetZones.some(z => z.toLowerCase().includes(spatialEval.normalizedRoom));
      const objMatch = spatialEval.normalizedObject && p.targetZones.some(z => z.toLowerCase().includes(spatialEval.normalizedObject));
      const elemMatch = spatialEval.normalizedElement && p.targetElements.some(e => e.toLowerCase().includes(spatialEval.normalizedElement));

      const isApplicable = dirMatch || roomMatch || objMatch || elemMatch || allEvaluatedRecords.length <= 10;

      if (isApplicable) {
        applicableKnowledgeIdsSet.add(vaultRec.recordId);

        // Collect Payload Content
        p.conditions.forEach(c => c && applicableConditionsSet.add(c));
        p.exceptions.forEach(e => e && applicableExceptionsSet.add(e));
        p.remedies.forEach(r => r && applicableRemediesSet.add(r));
        p.alternativeRemedies.forEach(ar => ar && applicableAltRemediesSet.add(ar));

        if (p.dosha) applicableDoshasSet.add(p.dosha);
        if (p.cause) applicableDoshasSet.add(p.cause);
        if (p.effect) applicablePositiveFindingsSet.add(p.effect);
        if (p.positiveFinding) applicablePositiveFindingsSet.add(p.positiveFinding);

        // Citations & Evidence
        const citId = vaultRec.citation?.citationId || `CIT-${vaultRec.recordId}`;
        const evHash = vaultRec.immutableHash;
        if (vaultRec.citation && vaultRec.citation.citationId) {
          citationsMap.set(vaultRec.citation.citationId, vaultRec.citation);
        }
        if (vaultRec.evidence && vaultRec.immutableHash) {
          evidenceMap.set(vaultRec.immutableHash, vaultRec.evidence);
        }

        // Traceability & Relationship Chain from Knowledge Correlation Engine (KCoE)
        const nodeRels = this.correlationEngine.getNodeWithRelationships(vaultRec.recordId);
        const relChain = nodeRels.outgoingRelationships.map(edge => `${edge.relationshipType}->${edge.targetId}`);
        allRelationshipChains.push(...relChain);

        nodeRels.outgoingRelationships.forEach(edge => {
          if (edge.metadata.sourceDomain !== edge.metadata.targetDomain) {
            crossDomainRelsList.push({
              sourceDomain: edge.metadata.sourceDomain,
              targetDomain: edge.metadata.targetDomain,
              relationshipType: edge.relationshipType,
              sourceRecordId: edge.sourceId,
              targetRecordId: edge.targetId
            });
          }
        });

        const triggerReasons: string[] = [];
        if (dirMatch) triggerReasons.push(`Direction:${spatialEval.normalizedDirection}`);
        if (roomMatch) triggerReasons.push(`Room:${spatialEval.normalizedRoom}`);
        if (objMatch) triggerReasons.push(`Object:${spatialEval.normalizedObject}`);
        if (elemMatch) triggerReasons.push(`Element:${spatialEval.normalizedElement}`);
        if (triggerReasons.length === 0) triggerReasons.push('QUERY_MATCH');

        allTriggerChains.push(`${ruleId}: [${triggerReasons.join(', ')}]`);

        // Prepare Remedy Candidates (complete, unfiltered)
        p.remedies.forEach((remText, idx) => {
          if (remText) {
            remedyCandidateItems.push({
              remedyCandidateId: `REM-CAND-${vaultRec.recordId}-${idx}`,
              primaryRemedyText: remText,
              alternativeRemedies: p.alternativeRemedies || [],
              originatingRecordId: vaultRec.recordId,
              originatingRuleId: ruleId,
              applicableDomains: [vaultRec.sourceMetadata.domain],
              conditions: p.conditions || [],
              exceptions: p.exceptions || [],
              relationshipChain: relChain,
              evidenceReferences: [evHash],
              citationReferences: [citId]
            });
          }
        });

        const founderApprovalRef = `FOUNDER-GOV-REF-${vaultRec.sourceMetadata.bookTitle || 'CANONICAL'}`;

        const explainabilityObj = {
          triggerSource: triggerReasons[0] || 'QUERY_MATCH',
          matchedObjects: objMatch ? [spatialEval.normalizedObject] : [],
          matchedDirection: spatialEval.normalizedDirection,
          matchedZone: spatialEval.normalizedZone,
          matchedConditions: p.conditions || [],
          matchedClientContext: clientEval.activeGoalCategories,
          matchedSpatialContext: spatialEval.spatialDimensionsList,
          relationshipPath: relChain,
          knowledgeRecordId: vaultRec.recordId,
          evidenceHash: evHash,
          citationId: citId,
          founderApprovalReference: founderApprovalRef
        };

        applicableRuleMatches.push({
          ruleId,
          knowledgeRecordId: vaultRec.recordId,
          domain: vaultRec.sourceMetadata.domain,
          category: vaultRec.category,
          matchTriggerReason: triggerReasons.join('; '),
          matchedDimensions: {
            matchedDirections: dirMatch ? [spatialEval.normalizedDirection] : [],
            matchedZones: [spatialEval.normalizedZone],
            matchedElements: elemMatch ? [spatialEval.normalizedElement] : [],
            matchedPlanets: spatialEval.normalizedPlanet ? [spatialEval.normalizedPlanet] : [],
            matchedRooms: roomMatch ? [spatialEval.normalizedRoom] : [],
            matchedObjects: objMatch ? [spatialEval.normalizedObject] : []
          },
          trace: {
            knowledgeRecordId: vaultRec.recordId,
            citationId: citId,
            evidenceHash: evHash,
            sourceHash: evHash,
            relationshipChain: relChain,
            version: vaultRec.versionInfo.version,
            founderApprovalReference: founderApprovalRef,
            explainability: explainabilityObj
          }
        });

        ruleTriggerMetadata.push({
          ruleId,
          triggerConditions: triggerReasons,
          triggerDomain: vaultRec.sourceMetadata.domain
        });

        // Populate Issue Cluster
        const issueName = p.dosha || p.cause || p.effect || `Issue-${vaultRec.recordId}`;
        let issueCluster = issueClusterMap.get(issueName);
        if (!issueCluster) {
          issueCluster = {
            clusterId: `ISSUE-CLUSTER-${issueName.replace(/\s+/g, '_')}`,
            issueName,
            domain: vaultRec.sourceMetadata.domain,
            relatedRecordIds: [],
            conditions: [],
            exceptions: [],
            remedyCandidateIds: []
          };
          issueClusterMap.set(issueName, issueCluster);
        }
        issueCluster.relatedRecordIds.push(vaultRec.recordId);
        issueCluster.conditions.push(...(p.conditions || []));
        issueCluster.exceptions.push(...(p.exceptions || []));
        issueCluster.remedyCandidateIds.push(...p.remedies.map((_, i) => `REM-CAND-${vaultRec.recordId}-${i}`));

        // Populate Object Cluster
        if (spatialEval.normalizedObject) {
          let objCluster = objectClusterMap.get(spatialEval.normalizedObject);
          if (!objCluster) {
            objCluster = {
              clusterId: `OBJ-CLUSTER-${spatialEval.normalizedObject}`,
              objectType: spatialEval.normalizedObject,
              triggeredRuleIds: [],
              conditions: [],
              exceptions: [],
              doshas: [],
              remedyCandidateIds: []
            };
            objectClusterMap.set(spatialEval.normalizedObject, objCluster);
          }
          objCluster.triggeredRuleIds.push(ruleId);
          objCluster.conditions.push(...(p.conditions || []));
          objCluster.exceptions.push(...(p.exceptions || []));
          if (p.dosha) objCluster.doshas.push(p.dosha);
          objCluster.remedyCandidateIds.push(...p.remedies.map((_, i) => `REM-CAND-${vaultRec.recordId}-${i}`));
        }

        // Populate Direction/Zone Clusters
        p.targetZones.forEach(z => {
          const key = z.toUpperCase();
          let dirCluster = directionClusterMap.get(key);
          if (!dirCluster) {
            dirCluster = {
              clusterId: `DIR-CLUSTER-${key}`,
              directionOrZone: key,
              triggeredRuleIds: [],
              doshas: [],
              remedies: [],
              domains: []
            };
            directionClusterMap.set(key, dirCluster);
            zoneClusterMap.set(key, dirCluster);
          }
          dirCluster.triggeredRuleIds.push(ruleId);
          if (p.dosha) dirCluster.doshas.push(p.dosha);
          dirCluster.remedies.push(...p.remedies);
          if (!dirCluster.domains.includes(vaultRec.sourceMetadata.domain)) {
            dirCluster.domains.push(vaultRec.sourceMetadata.domain);
          }
        });

        // Populate Element Cluster
        p.targetElements.forEach(elem => {
          const key = elem.toUpperCase();
          let elemCluster = elementClusterMap.get(key);
          if (!elemCluster) {
            elemCluster = {
              clusterId: `ELEM-CLUSTER-${key}`,
              elementName: key,
              triggeredRuleIds: [],
              remedies: []
            };
            elementClusterMap.set(key, elemCluster);
          }
          elemCluster.triggeredRuleIds.push(ruleId);
          elemCluster.remedies.push(...p.remedies);
        });

        // Populate Planet Cluster
        p.targetPlanets.forEach(pl => {
          const key = pl.toUpperCase();
          let planetCluster = planetClusterMap.get(key);
          if (!planetCluster) {
            planetCluster = {
              clusterId: `PLANET-CLUSTER-${key}`,
              planetName: key,
              triggeredRuleIds: [],
              remedies: []
            };
            planetClusterMap.set(key, planetCluster);
          }
          planetCluster.triggeredRuleIds.push(ruleId);
          planetCluster.remedies.push(...p.remedies);
        });

        // Populate Domain Cluster
        const domainKey = vaultRec.sourceMetadata.domain;
        let domCluster = domainClusterMap.get(domainKey);
        if (!domCluster) {
          domCluster = {
            domain: domainKey,
            ruleIds: [],
            recordIds: [],
            doshas: [],
            remedies: []
          };
          domainClusterMap.set(domainKey, domCluster);
        }
        domCluster.ruleIds.push(ruleId);
        domCluster.recordIds.push(vaultRec.recordId);
        if (p.dosha) domCluster.doshas.push(p.dosha);
        domCluster.remedies.push(...p.remedies);
      }
    });

    // Construct Cross-Domain Package
    const crossDomainPackages: ICrossDomainPackage[] = [{
      packageId: `XDOM-PKG-${packageId}`,
      spatialScope: {
        direction: spatialEval.normalizedDirection || undefined,
        zone: spatialEval.normalizedZone || undefined,
        room: spatialEval.normalizedRoom || undefined,
        object: spatialEval.normalizedObject || undefined
      },
      involvedDomains: Array.from(domainClusterMap.keys()),
      domainKnowledgeRecords: allEvaluatedRecords.map(r => ({
        domain: r.sourceMetadata.domain,
        recordId: r.recordId,
        dosha: r.knowledgePayload.dosha,
        remedy: r.knowledgePayload.remedies[0]
      })),
      interDomainRelationships: crossDomainRelsList.map(r => ({
        sourceDomain: r.sourceDomain,
        targetDomain: r.targetDomain,
        relType: r.relationshipType
      }))
    }];

    const executionDurationMs = Math.max(0, Date.now() - startTimeMs);

    return {
      packageId,
      timestamp: new Date().toISOString(),
      evaluationSessionId: sessionId,
      clientContextSummary: clientContext,
      spatialContextSummary: spatialContext,

      applicableRules: applicableRuleMatches,
      applicableKnowledgeIds: Array.from(applicableKnowledgeIdsSet),
      applicableConditions: Array.from(applicableConditionsSet),
      applicableExceptions: Array.from(applicableExceptionsSet),
      applicablePositiveFindings: Array.from(applicablePositiveFindingsSet),
      applicableDoshas: Array.from(applicableDoshasSet),
      applicableRemedies: Array.from(applicableRemediesSet),
      applicableAlternativeRemedies: Array.from(applicableAltRemediesSet),

      // Logical Intelligence Clusters
      issueClusters: Array.from(issueClusterMap.values()),
      objectClusters: Array.from(objectClusterMap.values()),
      directionClusters: Array.from(directionClusterMap.values()),
      zoneClusters: Array.from(zoneClusterMap.values()),
      elementClusters: Array.from(elementClusterMap.values()),
      planetClusters: Array.from(planetClusterMap.values()),
      roomClusters: Array.from(roomClusterMap.values()),
      activityClusters: Array.from(activityClusterMap.values()),
      domainClusters: Array.from(domainClusterMap.values()),

      // Cross-Domain & Remedy Candidates
      crossDomainPackages,
      remedyCandidateCollections: remedyCandidateItems,

      applicableEvidence: Array.from(evidenceMap.values()),
      applicableCitations: Array.from(citationsMap.values()),
      applicableCrossDomainRelationships: crossDomainRelsList,
      relationshipChains: allRelationshipChains,
      triggerChains: allTriggerChains,

      executionMetadata: {
        totalEvaluatedRecords: allEvaluatedRecords.length,
        applicableRulesCount: applicableRuleMatches.length,
        executionDurationMs,
        engineVersion: KnowledgeApplicationPipeline.KIE_VERSION
      },
      ruleTriggerMetadata,
      contextMetadata: {
        evaluatedDomains: session?.activeDomains || ['Vastu', 'LalKitab', 'Numerology', 'Astrology'],
        activePropertyType: clientEval.normalizedPropertyType
      }
    };
  }
}
