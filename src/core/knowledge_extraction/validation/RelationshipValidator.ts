import { KnowledgeRelationship } from '../models/KnowledgeRelationship';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { IValidationIssue } from './ValidationRule';

export class RelationshipValidator {
  private static readonly KNOWN_RELATIONSHIP_TYPES = new Set([
    'CONTAINS',
    'REFERENCES',
    'DEPENDS_ON',
    'DERIVED_FROM',
    'ASSOCIATED_WITH',
    'SUPPLEMENTS',
    'CONFLICTS_WITH',
    'OVERRIDES',
    'EXTENDS'
  ]);

  public validateRelationships(
    relationships: readonly KnowledgeRelationship[],
    objects: readonly KnowledgeObject[]
  ): readonly IValidationIssue[] {
    const issues: IValidationIssue[] = [];
    const validObjectIds = new Set(objects.map((o) => o.knowledgeId));

    // Graph adjacency representation for cycle detection
    const adj = new Map<string, Set<string>>();

    for (const rel of relationships) {
      // 1. Missing / Empty Source & Target
      const hasSource = Boolean(rel.sourceKnowledgeId && rel.sourceKnowledgeId.trim());
      const hasTarget = Boolean(rel.targetKnowledgeId && rel.targetKnowledgeId.trim());

      if (!hasSource) {
        issues.push({
          code: 'ERR_REL_MISSING_SOURCE',
          message: `Relationship '${rel.relationshipId}' has missing or empty sourceKnowledgeId`,
          severity: 'ERROR',
          targetId: rel.relationshipId,
          ruleName: 'RelationshipValidator.MissingSource',
          timestamp: Date.now()
        });
      }

      if (!hasTarget) {
        issues.push({
          code: 'ERR_REL_MISSING_TARGET',
          message: `Relationship '${rel.relationshipId}' has missing or empty targetKnowledgeId`,
          severity: 'ERROR',
          targetId: rel.relationshipId,
          ruleName: 'RelationshipValidator.MissingTarget',
          timestamp: Date.now()
        });
      }

      // 2. Self Reference Check
      if (hasSource && hasTarget && rel.sourceKnowledgeId === rel.targetKnowledgeId) {
        issues.push({
          code: 'ERR_REL_SELF_REFERENCE',
          message: `Relationship '${rel.relationshipId}' references itself (source === target '${rel.sourceKnowledgeId}')`,
          severity: 'ERROR',
          targetId: rel.relationshipId,
          ruleName: 'RelationshipValidator.SelfReference',
          timestamp: Date.now()
        });
      }

      // 3. Broken References
      if (hasSource && !validObjectIds.has(rel.sourceKnowledgeId)) {
        issues.push({
          code: 'WARN_REL_BROKEN_SOURCE_REF',
          message: `Relationship '${rel.relationshipId}' sourceKnowledgeId '${rel.sourceKnowledgeId}' does not exist in objects list`,
          severity: 'WARNING',
          targetId: rel.relationshipId,
          ruleName: 'RelationshipValidator.BrokenReference',
          timestamp: Date.now()
        });
      }

      if (hasTarget && !validObjectIds.has(rel.targetKnowledgeId)) {
        issues.push({
          code: 'WARN_REL_BROKEN_TARGET_REF',
          message: `Relationship '${rel.relationshipId}' targetKnowledgeId '${rel.targetKnowledgeId}' does not exist in objects list`,
          severity: 'WARNING',
          targetId: rel.relationshipId,
          ruleName: 'RelationshipValidator.BrokenReference',
          timestamp: Date.now()
        });
      }

      // 4. Invalid Relationship Type
      const relTypeStr = String(rel.relationshipType).toUpperCase();
      if (!RelationshipValidator.KNOWN_RELATIONSHIP_TYPES.has(relTypeStr)) {
        issues.push({
          code: 'WARN_REL_UNRECOGNIZED_TYPE',
          message: `Relationship '${rel.relationshipId}' has non-standard type '${rel.relationshipType}'`,
          severity: 'WARNING',
          targetId: rel.relationshipId,
          ruleName: 'RelationshipValidator.InvalidType',
          timestamp: Date.now()
        });
      }

      // Populate adjacency graph for cycle detection
      if (hasSource && hasTarget) {
        if (!adj.has(rel.sourceKnowledgeId)) {
          adj.set(rel.sourceKnowledgeId, new Set());
        }
        adj.get(rel.sourceKnowledgeId)!.add(rel.targetKnowledgeId);
      }
    }

    // 5. Circular References Detection using DFS
    const cycles = this.detectCycles(adj);
    for (const cycle of cycles) {
      issues.push({
        code: 'ERR_REL_CIRCULAR_REFERENCE',
        message: `Detected circular reference relationship chain: ${cycle.join(' -> ')}`,
        severity: 'ERROR',
        ruleName: 'RelationshipValidator.CircularReference',
        timestamp: Date.now(),
        details: { cycle }
      });
    }

    return Object.freeze(issues);
  }

  private detectCycles(adj: Map<string, Set<string>>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string, path: string[]) => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = adj.get(node);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            dfs(neighbor, [...path]);
          } else if (recStack.has(neighbor)) {
            const cycleStartIndex = path.indexOf(neighbor);
            if (cycleStartIndex !== -1) {
              const cyclePath = [...path.slice(cycleStartIndex), neighbor];
              cycles.push(cyclePath);
            }
          }
        }
      }

      recStack.delete(node);
    };

    for (const node of adj.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }
}
