import { RuleDefinition, SeverityType } from "../../types/ruleEngine";

export interface RuleSearchParams {
  id?: string;
  pluginId?: string;
  tag?: string;
  category?: string; // Wait, let's see, category can be passed in tags or custom fields, let's look for tags or search description
  severity?: SeverityType;
}

/**
 * Central registry for managing and searching rules across all loaded plugins
 */
export class RuleRegistry {
  private rules = new Map<string, RuleDefinition>();

  /**
   * Registers a single rule definition
   */
  public register(rule: RuleDefinition): void {
    if (!rule.id) {
      throw new Error("[URJAFLUX AI OS] Cannot register rule with empty or missing ID.");
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Registers multiple rules in bulk
   */
  public registerBulk(rules: RuleDefinition[]): void {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  /**
   * Retrieves a rule by its ID
   */
  public get(id: string): RuleDefinition | undefined {
    return this.rules.get(id);
  }

  /**
   * Retrieves all registered rules
   */
  public getAll(): RuleDefinition[] {
    return Array.from(this.rules.values());
  }

  /**
   * Searches the registry based on query parameters
   */
  public search(params: RuleSearchParams): RuleDefinition[] {
    return this.getAll().filter(rule => {
      if (params.id && rule.id !== params.id) {
        return false;
      }
      if (params.pluginId && rule.pluginId !== params.pluginId) {
        return false;
      }
      if (params.severity && rule.severity !== params.severity) {
        return false;
      }
      if (params.tag && !rule.tags.includes(params.tag)) {
        return false;
      }
      if (params.category) {
        // Since category can be part of the tags, check if tags include it or if name/desc contains it
        const lowerCat = params.category.toLowerCase();
        const matchesTag = rule.tags.some(t => t.toLowerCase() === lowerCat);
        const matchesDesc = rule.description.toLowerCase().includes(lowerCat) || rule.name.toLowerCase().includes(lowerCat);
        if (!matchesTag && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Clears the rule registry
   */
  public clear(): void {
    this.rules.clear();
  }
}
