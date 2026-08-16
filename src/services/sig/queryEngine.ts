import { ISIGQueryEngine, ISIGRepository } from "./types";
import { SIGNode, SIGQueryFilter, SIGEntityType } from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * Concrete Query Engine for matching properties and schemas within the SIG ontology.
 */
export class QueryEngine implements ISIGQueryEngine {
  
  /**
   * Filters nodes across the repository based on complex entity and key-value payload constraints.
   */
  public async search(
    filters: SIGQueryFilter[],
    tenantId: TenantID,
    repository: ISIGRepository
  ): Promise<SIGNode[]> {
    if (!filters || filters.length === 0) {
      return [];
    }

    // Determine the broadest category type we can query to minimize repository lookup size
    const primaryTypeFilter = filters.find(f => f.entityType !== undefined);
    
    let candidates: SIGNode[] = [];
    
    if (primaryTypeFilter && primaryTypeFilter.entityType) {
      candidates = await repository.findNodesByType(primaryTypeFilter.entityType, tenantId);
    } else {
      // Look up across all first-class classifications to filter manually
      const classifications = Object.values(SIGEntityType);
      for (const type of classifications) {
        const matches = await repository.findNodesByType(type, tenantId);
        candidates.push(...matches);
      }
    }

    // Apply remaining filters (AND relationship evaluation)
    const results = candidates.filter(node => {
      for (const filter of filters) {
        // 1. Verify Entity Type
        if (filter.entityType && node.type !== filter.entityType) {
          return false;
        }

        // 2. Verify Lifecycle State
        if (filter.lifecycleState && node.lifecycleState !== filter.lifecycleState) {
          return false;
        }

        // 3. Verify Key-Value Properties Matcher
        if (filter.propertyKey !== undefined) {
          const value = node.properties[filter.propertyKey];
          if (value !== filter.propertyValue) {
            return false;
          }
        }
      }
      return true;
    });

    return results;
  }
}
