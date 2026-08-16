import { SpatialRelationshipModel } from "../../spatial/relationships/relationshipTypes";
import { RuleResult } from "../../vastu/types/vastuTypes";
import { KnowledgePack, KnowledgeItem } from "../../knowledge/types/knowledgeTypes";
import { Finding, FindingSeverity, FindingStatus, FindingSource, FindingEvidence } from "../types/findingTypes";
import { FindingBuilder } from "../builders/findingBuilder";

/**
 * Helper to map rule results to FindingSeverity based on severity patterns in IDs/messages.
 */
function mapSeverity(result: RuleResult): FindingSeverity {
  if (result.passed) {
    return FindingSeverity.NEUTRAL;
  }
  const idLower = (result.ruleId || "").toLowerCase();
  const msgLower = (result.message || "").toLowerCase();

  if (idLower.includes("critical") || msgLower.includes("critical") || msgLower.includes("catastrophic")) {
    return FindingSeverity.CRITICAL;
  }
  if (idLower.includes("major") || msgLower.includes("major") || msgLower.includes("defect") || msgLower.includes("violation")) {
    return FindingSeverity.MAJOR;
  }
  if (idLower.includes("minor") || msgLower.includes("minor") || idLower.includes("warning") || msgLower.includes("warning")) {
    return FindingSeverity.MINOR;
  }
  return FindingSeverity.MAJOR; // Default failure severity
}

/**
 * Evaluates Spatial Relationships, Rule Results, and Knowledge Packs to generate
 * a consolidated array of immutable findings.
 */
export function generateFindings(
  spatialModel: SpatialRelationshipModel,
  ruleResults: RuleResult[],
  knowledgePacks: KnowledgePack[]
): readonly Readonly<Finding>[] {
  const findings: Finding[] = [];

  for (const result of ruleResults) {
    const builder = new FindingBuilder();
    const severity = mapSeverity(result);

    // Setup basic fields
    builder.setId(`finding_${result.ruleId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
      .setTitle(`Assessment Finding: ${result.ruleId}`)
      .setDescription(result.message)
      .setSeverity(severity)
      .setStatus(FindingStatus.ACTIVE)
      .setSource(FindingSource.RULE_ENGINE);

    // Add elements affected by this finding
    if (result.affectedElements) {
      for (const element of result.affectedElements) {
        builder.addAffectedElement(element);
      }
    }

    // 1. Combine Evidence: Rule Result details
    const resultEvidence: FindingEvidence = {
      id: `ev_rule_${result.ruleId}`,
      type: "rule_result",
      description: `Rule '${result.ruleId}' evaluated to ${result.passed ? "PASSED" : "VIOLATED"}. Message: ${result.message}`,
      metadata: {
        ruleId: result.ruleId,
        passed: result.passed,
        score: result.score
      }
    };
    builder.addEvidence(resultEvidence);

    // 2. Combine Evidence: Relevant Spatial Relationships based on affected elements
    const matchedRelationships = spatialModel.relationships.filter(rel =>
      result.affectedElements.includes(rel.sourceId) || result.affectedElements.includes(rel.targetId)
    );

    for (const rel of matchedRelationships) {
      builder.addEvidence({
        id: `ev_spatial_${rel.id}`,
        type: "spatial_relationship",
        description: `Spatial relation '${rel.type}' detected between '${rel.sourceId}' and '${rel.targetId}' with confidence ${rel.confidence}.`,
        metadata: {
          relationshipId: rel.id,
          type: rel.type,
          sourceId: rel.sourceId,
          targetId: rel.targetId,
          confidence: rel.confidence,
          meta: rel.meta
        }
      });
    }

    // 3. Link Knowledge References and Grounding Items
    const matchedItems: KnowledgeItem[] = [];
    for (const pack of knowledgePacks) {
      if (!pack.items) continue;
      for (const item of pack.items) {
        const itemIdLower = (item.id || "").toLowerCase();
        const ruleIdLower = (result.ruleId || "").toLowerCase();
        const msgLower = (result.message || "").toLowerCase();

        const isIdMatch = itemIdLower === ruleIdLower ||
                          (ruleIdLower.length > 0 && ruleIdLower.includes(itemIdLower)) ||
                          (itemIdLower.length > 0 && itemIdLower.includes(ruleIdLower));

        const isTagMatch = item.metadata?.tags?.some(tag => {
          const tLower = (tag || "").toLowerCase();
          return (ruleIdLower.length > 0 && ruleIdLower.includes(tLower)) ||
                 (msgLower.length > 0 && msgLower.includes(tLower));
        });

        if (isIdMatch || isTagMatch) {
          matchedItems.push(item);
        }
      }
    }

    for (const item of matchedItems) {
      builder.addEvidence({
        id: `ev_knowledge_${item.id}`,
        type: "knowledge_item",
        description: `Correlated with system knowledge: "${item.title}" (${item.category}).`,
        metadata: {
          itemId: item.id,
          category: item.category,
          title: item.title,
          content: item.content
        }
      });

      if (item.references) {
        for (const ref of item.references) {
          builder.addReference({
            sourceId: ref.sourceId,
            section: ref.section,
            citationText: ref.citationText,
            externalUrl: ref.externalUrl
          });
        }
      }
    }

    // 4. Calculate Placeholder Confidence
    // Base confidence starts at average spatial relation confidence, fallback to default
    let confidenceSum = 0;
    let confidenceCount = 0;
    for (const rel of matchedRelationships) {
      confidenceSum += rel.confidence;
      confidenceCount++;
    }

    let baseConfidence = confidenceCount > 0 ? (confidenceSum / confidenceCount) : 0.85;

    // Slight boost if grounded by structural knowledge packs
    if (matchedItems.length > 0) {
      baseConfidence = Math.min(1.0, baseConfidence + 0.1);
    }

    // Lower confidence if rule failed and spatial data was missing
    if (!result.passed && confidenceCount === 0) {
      baseConfidence = Math.max(0.1, baseConfidence - 0.15);
    }

    builder.setConfidence(Number(baseConfidence.toFixed(4)));

    // Return the built, frozen, immutable finding
    findings.push(builder.build());
  }

  return Object.freeze(findings);
}

export const ReasoningEngine = {
  generateFindings
};
