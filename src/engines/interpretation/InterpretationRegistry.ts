import { 
  FindingGeneratorPlugin, 
  SeverityScorerPlugin, 
  RecommendationProviderPlugin 
} from "./InterpretationTypes";

/**
 * Enterprise-grade plugin registry for managing custom, scriptural-specific
 * or domain-specific interpretation layers.
 */
export class InterpretationRegistry {
  private findingGenerators = new Map<string, FindingGeneratorPlugin>();
  private severityScorers = new Map<string, SeverityScorerPlugin>();
  private recommendationProviders = new Map<string, RecommendationProviderPlugin>();

  /**
   * Registers a Finding Generator Plugin.
   */
  public registerFindingGenerator(plugin: FindingGeneratorPlugin): void {
    if (this.findingGenerators.has(plugin.pluginId)) {
      throw new Error(`[InterpretationRegistry] Finding generator with ID "${plugin.pluginId}" is already registered.`);
    }
    this.findingGenerators.set(plugin.pluginId, plugin);
  }

  /**
   * Registers a Severity Scorer Plugin.
   */
  public registerSeverityScorer(plugin: SeverityScorerPlugin): void {
    if (this.severityScorers.has(plugin.pluginId)) {
      throw new Error(`[InterpretationRegistry] Severity scorer with ID "${plugin.pluginId}" is already registered.`);
    }
    this.severityScorers.set(plugin.pluginId, plugin);
  }

  /**
   * Registers a Recommendation Provider Plugin.
   */
  public registerRecommendationProvider(plugin: RecommendationProviderPlugin): void {
    if (this.recommendationProviders.has(plugin.pluginId)) {
      throw new Error(`[InterpretationRegistry] Recommendation provider with ID "${plugin.pluginId}" is already registered.`);
    }
    this.recommendationProviders.set(plugin.pluginId, plugin);
  }

  public getFindingGenerators(): FindingGeneratorPlugin[] {
    return Array.from(this.findingGenerators.values());
  }

  public getSeverityScorers(): SeverityScorerPlugin[] {
    return Array.from(this.severityScorers.values());
  }

  public getRecommendationProviders(): RecommendationProviderPlugin[] {
    return Array.from(this.recommendationProviders.values());
  }

  /**
   * Safe clean down.
   */
  public clear(): void {
    this.findingGenerators.clear();
    this.severityScorers.clear();
    this.recommendationProviders.clear();
  }
}
