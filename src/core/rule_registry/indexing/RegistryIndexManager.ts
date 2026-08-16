// ============================================================================
// URJAFLUX AI OS - REGISTRY INDEX MANAGER (RRE)
// Multi-Dimensional Structural Index Engine (Object, Direction, Room, Zone, Element, Planet, Activity, Category, Domain)
// ============================================================================

import { 
  IRuleRegistryRecord, 
  IRegistryIndexQuery, 
  IRegistryIndexStats,
  KnowledgeDomain,
  VaultKnowledgeCategory
} from "../types/ruleRegistry.types";

export class RegistryIndexManager {
  private static instance: RegistryIndexManager;

  // Primary Storage Map
  private registryRecords: Map<string, IRuleRegistryRecord> = new Map();

  // Dimensional In-Memory Index Maps
  private objectIndex: Map<string, Set<string>> = new Map();
  private directionIndex: Map<string, Set<string>> = new Map();
  private roomIndex: Map<string, Set<string>> = new Map();
  private zoneIndex: Map<string, Set<string>> = new Map();
  private elementIndex: Map<string, Set<string>> = new Map();
  private planetIndex: Map<string, Set<string>> = new Map();
  private chakraIndex: Map<string, Set<string>> = new Map();
  private activityIndex: Map<string, Set<string>> = new Map();
  private categoryIndex: Map<VaultKnowledgeCategory, Set<string>> = new Map();
  private domainIndex: Map<KnowledgeDomain, Set<string>> = new Map();

  private constructor() {}

  public static getInstance(): RegistryIndexManager {
    if (!RegistryIndexManager.instance) {
      RegistryIndexManager.instance = new RegistryIndexManager();
    }
    return RegistryIndexManager.instance;
  }

  /**
   * Registers or updates a Rule Registry Record in all index maps
   */
  public indexRecord(record: IRuleRegistryRecord): void {
    const id = record.ruleId;
    this.registryRecords.set(id, record);

    // 1. Domain Indexing
    this.addToMap(this.domainIndex, record.domain, id);

    // 2. Category Indexing
    this.addToMap(this.categoryIndex, record.ruleCategory, id);

    // 3. Object Indexing
    record.objectTypes.forEach(obj => this.addToMap(this.objectIndex, obj.toLowerCase(), id));

    // 4. Direction Indexing
    record.directions.forEach(dir => this.addToMap(this.directionIndex, dir.toUpperCase(), id));

    // 5. Room Indexing
    record.rooms.forEach(rm => this.addToMap(this.roomIndex, rm.toLowerCase(), id));

    // 6. Zone Indexing
    record.zones.forEach(zn => this.addToMap(this.zoneIndex, zn.toUpperCase(), id));

    // 7. Element Indexing
    record.elements.forEach(el => this.addToMap(this.elementIndex, el.toLowerCase(), id));

    // 8. Planet Indexing
    record.planets.forEach(pl => this.addToMap(this.planetIndex, pl.toLowerCase(), id));

    // 9. Chakra Indexing
    record.chakras.forEach(chk => this.addToMap(this.chakraIndex, chk.toLowerCase(), id));

    // 10. Activity Indexing
    record.activities.forEach(act => this.addToMap(this.activityIndex, act.toLowerCase(), id));
  }

  /**
   * Queries registry record IDs matching multi-dimensional parameters
   */
  public queryRegistryIds(query: IRegistryIndexQuery): string[] {
    let resultSet: Set<string> | null = null;

    const intersect = (candidateIds: Set<string>) => {
      if (resultSet === null) {
        resultSet = new Set(candidateIds);
      } else {
        resultSet = new Set(Array.from(resultSet).filter(id => candidateIds.has(id)));
      }
    };

    if (query.domain) {
      intersect(this.domainIndex.get(query.domain) || new Set());
    }

    if (query.category) {
      intersect(this.categoryIndex.get(query.category) || new Set());
    }

    if (query.direction) {
      intersect(this.directionIndex.get(query.direction.toUpperCase()) || new Set());
    }

    if (query.zone) {
      intersect(this.zoneIndex.get(query.zone.toUpperCase()) || new Set());
    }

    if (query.room) {
      intersect(this.objectSearchMap(this.roomIndex, query.room));
    }

    if (query.objectType) {
      intersect(this.objectSearchMap(this.objectIndex, query.objectType));
    }

    if (query.element) {
      intersect(this.objectSearchMap(this.elementIndex, query.element));
    }

    if (query.planet) {
      intersect(this.objectSearchMap(this.planetIndex, query.planet));
    }

    if (query.chakra) {
      intersect(this.objectSearchMap(this.chakraIndex, query.chakra));
    }

    if (query.activity) {
      intersect(this.objectSearchMap(this.activityIndex, query.activity));
    }

    if (resultSet === null) {
      return Array.from(this.registryRecords.keys());
    }

    return Array.from(resultSet);
  }

  /**
   * Retrieves full records by IDs
   */
  public getRecordsByIds(ids: string[]): IRuleRegistryRecord[] {
    const result: IRuleRegistryRecord[] = [];
    ids.forEach(id => {
      const rec = this.registryRecords.get(id);
      if (rec) result.push(rec);
    });
    return result;
  }

  /**
   * Retrieves single record by ID
   */
  public getRecordById(ruleId: string): IRuleRegistryRecord | undefined {
    return this.registryRecords.get(ruleId);
  }

  /**
   * Returns index statistics
   */
  public getStats(): IRegistryIndexStats {
    const domainCounts: Record<string, number> = {};
    this.domainIndex.forEach((set, domain) => {
      domainCounts[domain] = set.size;
    });

    const categoryCounts: Record<string, number> = {};
    this.categoryIndex.forEach((set, cat) => {
      categoryCounts[cat] = set.size;
    });

    return {
      totalRegisteredRules: this.registryRecords.size,
      domainCounts,
      categoryCounts,
      objectIndexSize: this.objectIndex.size,
      directionIndexSize: this.directionIndex.size,
      roomIndexSize: this.roomIndex.size,
      zoneIndexSize: this.zoneIndex.size,
      elementIndexSize: this.elementIndex.size,
      planetIndexSize: this.planetIndex.size,
      chakraIndexSize: this.chakraIndex.size,
      activityIndexSize: this.activityIndex.size
    };
  }

  private addToMap<K>(map: Map<K, Set<string>>, key: K, value: string) {
    if (!map.has(key)) {
      map.set(key, new Set());
    }
    map.get(key)!.add(value);
  }

  private objectSearchMap(map: Map<string, Set<string>>, queryTerm: string): Set<string> {
    const norm = queryTerm.toLowerCase();
    const matches = new Set<string>();
    map.forEach((ids, key) => {
      if (key.includes(norm)) {
        ids.forEach(id => matches.add(id));
      }
    });
    return matches;
  }

  public clear(): void {
    this.registryRecords.clear();
    this.objectIndex.clear();
    this.directionIndex.clear();
    this.roomIndex.clear();
    this.zoneIndex.clear();
    this.elementIndex.clear();
    this.planetIndex.clear();
    this.chakraIndex.clear();
    this.activityIndex.clear();
    this.categoryIndex.clear();
    this.domainIndex.clear();
  }
}

export const registryIndexManager = RegistryIndexManager.getInstance();
