// ============================================================================
// URJAFLUX AI OS - KEE RELATIONSHIP PRESERVATION ENGINE
// Automatically links co-extracted Knowledge Items from the same text passage
// ============================================================================

import { 
  IKeeExtractedItem, 
  IKeeExtractedRelationship 
} from "../types/kee.types";

export class RelationshipPreservationEngine {

  /**
   * Automatically establishes structural relationships among co-extracted items from a common text passage
   */
  public preserveRelationships(items: IKeeExtractedItem[]): IKeeExtractedRelationship[] {
    const relationships: IKeeExtractedRelationship[] = [];

    const ruleItems = items.filter(i => i.category === 'RULE' || i.category === 'PRINCIPLE');
    const conditionItems = items.filter(i => i.category === 'CONDITION');
    const exceptionItems = items.filter(i => i.category === 'EXCEPTION');
    const remedyItems = items.filter(i => i.category === 'REMEDY' || i.category === 'ALTERNATIVE_REMEDY');
    const causeItems = items.filter(i => i.category === 'CAUSE' || i.category === 'DOSHA');
    const effectItems = items.filter(i => i.category === 'EFFECT');
    const positiveItems = items.filter(i => i.category === 'POSITIVE_FINDING');
    const illustrationItems = items.filter(i => i.category === 'ILLUSTRATION_REFERENCE');
    const citationItems = items.filter(i => i.category === 'REFERENCE' || i.category === 'CROSS_REFERENCE');

    ruleItems.forEach(rule => {
      // 1. Rule -> Condition
      conditionItems.forEach(cond => {
        const rel = this.createRel(rule.itemId, cond.itemId, 'RULE_TO_CONDITION', 0.95, "Co-extracted condition clause");
        relationships.push(rel);
        rule.relationships.push(rel);
      });

      // 2. Rule -> Exception
      exceptionItems.forEach(exc => {
        const rel = this.createRel(rule.itemId, exc.itemId, 'RULE_TO_EXCEPTION', 0.98, "Co-extracted exception clause");
        relationships.push(rel);
        rule.relationships.push(rel);
      });

      // 3. Rule -> Remedy
      remedyItems.forEach(rem => {
        const rel = this.createRel(rule.itemId, rem.itemId, 'RULE_TO_REMEDY', 0.90, "Co-extracted remedy clause");
        relationships.push(rel);
        rule.relationships.push(rel);
      });

      // 4. Rule -> Cause / Dosha
      causeItems.forEach(cause => {
        const rel = this.createRel(rule.itemId, cause.itemId, 'RULE_TO_CAUSE', 0.92, "Co-extracted cause/defect clause");
        relationships.push(rel);
        rule.relationships.push(rel);
      });

      // 5. Rule -> Effect
      effectItems.forEach(eff => {
        const rel = this.createRel(rule.itemId, eff.itemId, 'RULE_TO_EFFECT', 0.90, "Co-extracted effect clause");
        relationships.push(rel);
        rule.relationships.push(rel);
      });

      // 6. Rule -> Positive Finding
      positiveItems.forEach(pos => {
        const rel = this.createRel(rule.itemId, pos.itemId, 'RULE_TO_POSITIVE_FINDING', 0.95, "Co-extracted positive finding clause");
        relationships.push(rel);
        rule.relationships.push(rel);
      });

      // 7. Rule -> Citation / Reference
      citationItems.forEach(cit => {
        const rel = this.createRel(rule.itemId, cit.itemId, 'RULE_TO_CITATION', 1.0, "Co-extracted source citation reference");
        relationships.push(rel);
        rule.relationships.push(rel);
      });

      // 8. Rule -> Illustration Reference
      illustrationItems.forEach(ill => {
        const rel = this.createRel(rule.itemId, ill.itemId, 'RULE_TO_ILLUSTRATION_REFERENCE', 0.95, "Co-extracted figure/diagram reference");
        relationships.push(rel);
        rule.relationships.push(rel);
      });
    });

    return relationships;
  }

  private createRel(
    sourceItemId: string,
    targetItemId: string,
    relationshipType: string,
    weight: number,
    contextNote: string
  ): IKeeExtractedRelationship {
    return {
      relationshipId: `KEE-REL-${sourceItemId}-${relationshipType}-${targetItemId}`,
      sourceItemId,
      targetItemId,
      relationshipType,
      weight,
      contextNote
    };
  }
}
