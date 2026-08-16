// ============================================================================
// URJAFLUX AI OS - STRUCTURAL CORRELATOR (KCoE)
// Deterministic Relationship Discovery Engine for Vault & Registry Records
// ============================================================================

import { 
  IKCoERelationshipEdge, 
  KCoERelationshipType, 
  KnowledgeDomain 
} from "../types/kcoe.types";
import { IVaultKnowledgeRecord } from "../../knowledge_vault/types/vaultRecord.types";
import { IRuleRegistryRecord } from "../../rule_registry/types/ruleRegistry.types";
import { IKqeQueryResultPackage } from "../../knowledge_query/types/kqe.types";

export class StructuralCorrelator {

  /**
   * Discovers and constructs relationship edges for a given Vault Knowledge Record
   */
  public correlateVaultRecord(vaultRecord: IVaultKnowledgeRecord): IKCoERelationshipEdge[] {
    const edges: IKCoERelationshipEdge[] = [];
    const sourceId = vaultRecord.recordId;
    const timestamp = new Date().toISOString();
    const sourceDomain = vaultRecord.sourceMetadata.domain;

    // 1. Explicit relationships stored in vault record
    vaultRecord.relationships.forEach(rel => {
      let mappedType: KCoERelationshipType = 'RULE_TO_RELATED_RULE';
      
      if (rel.relationshipType === 'RULE_TO_EXCEPTION') mappedType = 'RULE_TO_EXCEPTION';
      else if (rel.relationshipType === 'RULE_TO_REMEDY') mappedType = 'RULE_TO_REMEDY';
      else if (rel.relationshipType === 'RULE_TO_POSITIVE_FINDING') mappedType = 'RULE_TO_POSITIVE_FINDING';
      else if (rel.relationshipType === 'RULE_TO_RELATED_RULE') mappedType = 'RULE_TO_RELATED_RULE';

      edges.push({
        relationshipId: `EDGE-VAULT-${sourceId}-${rel.targetRecordId}-${mappedType}`,
        sourceId,
        targetId: rel.targetRecordId,
        relationshipType: mappedType,
        structuralStrength: 1.0,
        metadata: {
          sourceDomain,
          targetDomain: sourceDomain,
          establishedAt: timestamp,
          correlationRuleOrigin: 'VAULT_EXPLICIT_LINK'
        },
        version: vaultRecord.versionInfo.version
      });
    });

    // 2. Cross reference links
    vaultRecord.crossReferences.forEach(xref => {
      edges.push({
        relationshipId: `EDGE-XREF-${sourceId}-${xref}`,
        sourceId,
        targetId: xref,
        relationshipType: 'RULE_TO_CROSS_REFERENCE',
        structuralStrength: 0.9,
        metadata: {
          sourceDomain,
          targetDomain: sourceDomain,
          establishedAt: timestamp,
          correlationRuleOrigin: 'VAULT_CROSS_REFERENCE'
        },
        version: vaultRecord.versionInfo.version
      });
    });

    // 3. Related Domain links
    vaultRecord.relatedDomains.forEach(targetDomain => {
      if (targetDomain !== sourceDomain) {
        edges.push({
          relationshipId: `EDGE-DOMAIN-${sourceId}-${targetDomain}`,
          sourceId,
          targetId: `DOMAIN-REF-${targetDomain}`,
          relationshipType: 'RULE_TO_RELATED_DOMAIN',
          structuralStrength: 0.8,
          metadata: {
            sourceDomain,
            targetDomain,
            establishedAt: timestamp,
            correlationRuleOrigin: 'CROSS_DOMAIN_METADATA_LINK'
          },
          version: vaultRecord.versionInfo.version
        });
      }
    });

    // 4. Same Book / Same Author / Same Chapter links
    if (vaultRecord.sourceMetadata.bookTitle) {
      edges.push({
        relationshipId: `EDGE-BOOK-${sourceId}-${encodeURIComponent(vaultRecord.sourceMetadata.bookTitle)}`,
        sourceId,
        targetId: `BOOK-${vaultRecord.sourceMetadata.bookTitle}`,
        relationshipType: 'RULE_TO_SAME_BOOK',
        structuralStrength: 0.7,
        metadata: {
          sourceDomain,
          targetDomain: sourceDomain,
          establishedAt: timestamp,
          correlationRuleOrigin: 'BIBLIOGRAPHIC_BOOK_LINK',
          bookTitle: vaultRecord.sourceMetadata.bookTitle,
          authorName: vaultRecord.sourceMetadata.authorInfo?.authorName
        },
        version: vaultRecord.versionInfo.version
      });
    }

    if (vaultRecord.sourceMetadata.authorInfo?.authorName) {
      const author = vaultRecord.sourceMetadata.authorInfo.authorName;
      edges.push({
        relationshipId: `EDGE-AUTHOR-${sourceId}-${encodeURIComponent(author)}`,
        sourceId,
        targetId: `AUTHOR-${author}`,
        relationshipType: 'RULE_TO_SAME_AUTHOR',
        structuralStrength: 0.7,
        metadata: {
          sourceDomain,
          targetDomain: sourceDomain,
          establishedAt: timestamp,
          correlationRuleOrigin: 'BIBLIOGRAPHIC_AUTHOR_LINK',
          authorName: author
        },
        version: vaultRecord.versionInfo.version
      });
    }

    return edges;
  }

  /**
   * Discovers and constructs relationship edges for a Rule Registry Record
   */
  public correlateRegistryRecord(registryRecord: IRuleRegistryRecord): IKCoERelationshipEdge[] {
    const edges: IKCoERelationshipEdge[] = [];
    const sourceId = registryRecord.ruleId;
    const timestamp = new Date().toISOString();
    const sourceDomain = registryRecord.domain;

    const buildEdges = (targetIds: string[], relType: KCoERelationshipType) => {
      targetIds.forEach(targetId => {
        edges.push({
          relationshipId: `EDGE-REG-${sourceId}-${targetId}-${relType}`,
          sourceId,
          targetId,
          relationshipType: relType,
          structuralStrength: 1.0,
          metadata: {
            sourceDomain,
            targetDomain: sourceDomain,
            establishedAt: timestamp,
            correlationRuleOrigin: 'REGISTRY_LINKED_ASSET'
          },
          version: registryRecord.version
        });
      });
    };

    buildEdges(registryRecord.conditionIds, 'RULE_TO_CONDITION');
    buildEdges(registryRecord.exceptionIds, 'RULE_TO_EXCEPTION');
    buildEdges(registryRecord.causeIds, 'RULE_TO_CAUSE');
    buildEdges(registryRecord.effectIds, 'RULE_TO_EFFECT');
    buildEdges(registryRecord.positiveFindingIds, 'RULE_TO_POSITIVE_FINDING');
    buildEdges(registryRecord.doshaIds, 'RULE_TO_DOSHA');
    buildEdges(registryRecord.remedyIds, 'RULE_TO_REMEDY');
    buildEdges(registryRecord.alternativeRemedyIds, 'RULE_TO_ALTERNATIVE_REMEDY');
    buildEdges(registryRecord.contraindicationIds, 'RULE_TO_CONTRAINDICATION');
    buildEdges(registryRecord.relatedRuleIds, 'RULE_TO_RELATED_RULE');

    // Dimensional concept links
    registryRecord.directions.forEach(dir => {
      edges.push({
        relationshipId: `EDGE-DIR-${sourceId}-${dir}`,
        sourceId,
        targetId: `CONCEPT-DIRECTION-${dir.toUpperCase()}`,
        relationshipType: 'RULE_TO_DIRECTION',
        structuralStrength: 0.9,
        metadata: { sourceDomain, targetDomain: sourceDomain, establishedAt: timestamp, correlationRuleOrigin: 'DIMENSIONAL_DIRECTION_LINK' },
        version: registryRecord.version
      });
    });

    registryRecord.elements.forEach(elem => {
      edges.push({
        relationshipId: `EDGE-ELEM-${sourceId}-${elem}`,
        sourceId,
        targetId: `CONCEPT-ELEMENT-${elem.toUpperCase()}`,
        relationshipType: 'RULE_TO_ELEMENT',
        structuralStrength: 0.9,
        metadata: { sourceDomain, targetDomain: sourceDomain, establishedAt: timestamp, correlationRuleOrigin: 'DIMENSIONAL_ELEMENT_LINK' },
        version: registryRecord.version
      });
    });

    registryRecord.planets.forEach(planet => {
      edges.push({
        relationshipId: `EDGE-PLANET-${sourceId}-${planet}`,
        sourceId,
        targetId: `CONCEPT-PLANET-${planet.toUpperCase()}`,
        relationshipType: 'RULE_TO_PLANET',
        structuralStrength: 0.9,
        metadata: { sourceDomain, targetDomain: sourceDomain, establishedAt: timestamp, correlationRuleOrigin: 'DIMENSIONAL_PLANET_LINK' },
        version: registryRecord.version
      });
    });

    registryRecord.rooms.forEach(room => {
      edges.push({
        relationshipId: `EDGE-ROOM-${sourceId}-${room}`,
        sourceId,
        targetId: `CONCEPT-ROOM-${room.toUpperCase()}`,
        relationshipType: 'RULE_TO_ROOM',
        structuralStrength: 0.9,
        metadata: { sourceDomain, targetDomain: sourceDomain, establishedAt: timestamp, correlationRuleOrigin: 'DIMENSIONAL_ROOM_LINK' },
        version: registryRecord.version
      });
    });

    return edges;
  }

  /**
   * Discovers structural correlations across an assembled Knowledge Query Package
   */
  public correlateQueryPackage(queryPackage: IKqeQueryResultPackage): IKCoERelationshipEdge[] {
    const edges: IKCoERelationshipEdge[] = [];
    const timestamp = new Date().toISOString();
    const domain = (queryPackage.originalQuery.domain || "Vastu") as KnowledgeDomain;

    const ruleIds = queryPackage.matchingRuleIds;
    const recordIds = queryPackage.matchingKnowledgeRecordIds;

    // Cross link query matching items as "Same Topic" or "Same Query Correlation"
    for (let i = 0; i < recordIds.length; i++) {
      for (let j = i + 1; j < recordIds.length; j++) {
        edges.push({
          relationshipId: `EDGE-QPACK-${recordIds[i]}-${recordIds[j]}-SAME_TOPIC`,
          sourceId: recordIds[i],
          targetId: recordIds[j],
          relationshipType: 'RULE_TO_SAME_TOPIC',
          structuralStrength: 0.85,
          metadata: {
            sourceDomain: domain,
            targetDomain: domain,
            establishedAt: timestamp,
            correlationRuleOrigin: 'QUERY_PACKAGE_CO_OCCURRENCE',
            queryId: queryPackage.queryId
          },
          version: "1.0.0"
        });
      }
    }

    return edges;
  }
}
