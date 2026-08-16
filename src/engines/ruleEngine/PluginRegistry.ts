import { IKnowledgePlugin } from "../../types/ruleEngine";

/**
 * Registry for knowledge plugins (e.g. Vastu, Lal Kitab, Numerology)
 */
export class PluginRegistry {
  private plugins = new Map<string, IKnowledgePlugin>();

  /**
   * Registers a knowledge plugin
   */
  public register(plugin: IKnowledgePlugin): void {
    if (!plugin.metadata || !plugin.metadata.id) {
      throw new Error("[URJAFLUX AI OS] Invalid plugin registration: Missing plugin ID.");
    }
    if (this.plugins.has(plugin.metadata.id)) {
      throw new Error(`[URJAFLUX AI OS] Plugin with ID "${plugin.metadata.id}" is already registered.`);
    }
    
    this.plugins.set(plugin.metadata.id, plugin);

  }

  /**
   * Retrieves a registered plugin by ID
   */
  public get(id: string): IKnowledgePlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Returns all registered plugins
   */
  public getAll(): IKnowledgePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Clears all registered plugins (primarily for hot reloads or test scenarios)
   */
  public clear(): void {
    this.plugins.clear();
  }
}
