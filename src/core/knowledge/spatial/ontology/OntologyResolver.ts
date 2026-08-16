export interface IOntologyMapping {
  canonicalType: string;
  aliases: string[];
  namespaceId: string;
}

export interface IOntologyResolutionResult {
  canonicalType: string;
  confidence: number;
  ontologyReference: string;
}

export class OntologyResolver {
  private static instance: OntologyResolver;
  private mappings: Map<string, IOntologyMapping[]> = new Map();

  private constructor() {}

  public static getInstance(): OntologyResolver {
    if (!OntologyResolver.instance) {
      OntologyResolver.instance = new OntologyResolver();
    }
    return OntologyResolver.instance;
  }

  public registerMapping(mapping: IOntologyMapping): void {
    if (!this.mappings.has(mapping.namespaceId)) {
      this.mappings.set(mapping.namespaceId, []);
    }
    this.mappings.get(mapping.namespaceId)!.push(mapping);
  }

  public resolve(text: string, namespaceId: string): IOntologyResolutionResult {
    const normalizedText = text.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    
    if (this.mappings.has(namespaceId)) {
      const namespaceMappings = this.mappings.get(namespaceId)!;
      for (const mapping of namespaceMappings) {
        if (mapping.canonicalType.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedText) {
          return {
            canonicalType: mapping.canonicalType,
            confidence: 1.0,
            ontologyReference: `urn:ontology:${namespaceId}:${mapping.canonicalType}`
          };
        }
        for (const alias of mapping.aliases) {
          if (alias.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedText) {
            return {
              canonicalType: mapping.canonicalType,
              confidence: 0.9,
              ontologyReference: `urn:ontology:${namespaceId}:${mapping.canonicalType}`
            };
          }
        }
      }
    }
    
    // Fallback if not found perfectly
    return {
      canonicalType: text.trim().toUpperCase(),
      confidence: 0.5,
      ontologyReference: `urn:ontology:${namespaceId}:UNKNOWN`
    };
  }
  
  public clear(): void {
    this.mappings.clear();
  }
}
