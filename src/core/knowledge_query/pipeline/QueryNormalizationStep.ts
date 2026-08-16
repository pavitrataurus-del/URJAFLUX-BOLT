// ============================================================================
// URJAFLUX AI OS - KQE QUERY NORMALIZATION STEP
// Pipeline Step 2: Normalizes dimensional fields and canonicalizes directional terms
// ============================================================================

import { IKqeStructuredQuery, IKqeNormalizedQuery, KqeQueryType } from "../types/kqe.types";

export class QueryNormalizationStep {

  private directionSynonyms: Record<string, string> = {
    "NORTH": "NORTH",
    "N": "NORTH",
    "UTTAR": "NORTH",
    "SOUTH": "SOUTH",
    "S": "SOUTH",
    "DAKSHIN": "SOUTH",
    "EAST": "EAST",
    "E": "EAST",
    "PURVA": "EAST",
    "WEST": "WEST",
    "W": "WEST",
    "PASCHIM": "WEST",
    "NORTHEAST": "NORTHEAST",
    "NORTH-EAST": "NORTHEAST",
    "NE": "NORTHEAST",
    "ISHAN": "NORTHEAST",
    "ISHANYA": "NORTHEAST",
    "NORTHWEST": "NORTHWEST",
    "NORTH-WEST": "NORTHWEST",
    "NW": "NORTHWEST",
    "VAYAVYA": "NORTHWEST",
    "SOUTHEAST": "SOUTHEAST",
    "SOUTH-EAST": "SOUTHEAST",
    "SE": "SOUTHEAST",
    "AGNEY": "SOUTHEAST",
    "AGNEYA": "SOUTHEAST",
    "SOUTHWEST": "SOUTHWEST",
    "SOUTH-WEST": "SOUTHWEST",
    "SW": "SOUTHWEST",
    "NAIRUTYA": "SOUTHWEST",
    "NIRRUTI": "SOUTHWEST",
    "BRAHMASTHAN": "CENTER",
    "CENTER": "CENTER"
  };

  public normalize(query: IKqeStructuredQuery): IKqeNormalizedQuery {
    const queryId = query.queryId || `KQE-QRY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const timestamp = new Date().toISOString();

    const normalizedDirection = query.direction 
      ? this.normalizeDirection(query.direction) 
      : "";

    const normalizedZone = query.zone 
      ? query.zone.trim().toUpperCase() 
      : (normalizedDirection || "");

    const normalizedRoom = query.room ? query.room.trim().toLowerCase() : "";
    const normalizedObject = query.objectType ? query.objectType.trim().toLowerCase() : "";
    const normalizedElement = query.element ? query.element.trim().toLowerCase() : "";
    const normalizedPlanet = query.planet ? query.planet.trim().toLowerCase() : "";
    const normalizedChakra = query.chakra ? query.chakra.trim().toLowerCase() : "";
    const normalizedActivity = query.activity ? query.activity.trim().toLowerCase() : "";

    const inferredQueryType: KqeQueryType = query.queryType || this.inferQueryType(query);

    return {
      queryId,
      normalizedTimestamp: timestamp,
      domain: query.domain || "Vastu",
      queryType: inferredQueryType,
      objectType: normalizedObject,
      room: normalizedRoom,
      direction: normalizedDirection,
      zone: normalizedZone,
      element: normalizedElement,
      planet: normalizedPlanet,
      chakra: normalizedChakra,
      activity: normalizedActivity,
      spaceUsageType: query.spaceUsageType || "RESIDENTIAL",
      category: query.category || "" as any,
      ruleId: query.ruleId || "",
      knowledgeRecordId: query.knowledgeRecordId || "",
      citationId: query.citationId || "",
      expandRelationships: query.expandRelationships !== false,
      maxExpansionDepth: query.maxExpansionDepth || 1
    };
  }

  private normalizeDirection(dirStr: string): string {
    const cleaned = dirStr.trim().toUpperCase().replace(/[\s_]+/g, "-");
    if (this.directionSynonyms[cleaned]) {
      return this.directionSynonyms[cleaned];
    }
    const noHyphen = cleaned.replace(/-/g, "");
    if (this.directionSynonyms[noHyphen]) {
      return this.directionSynonyms[noHyphen];
    }
    return cleaned;
  }

  private inferQueryType(q: IKqeStructuredQuery): KqeQueryType {
    if (q.ruleId) return 'RULE';
    if (q.knowledgeRecordId) return 'KNOWLEDGE_RECORD';
    if (q.citationId) return 'CITATION';

    let count = 0;
    if (q.objectType) count++;
    if (q.room) count++;
    if (q.direction) count++;
    if (q.element) count++;
    if (q.planet) count++;
    if (q.activity) count++;

    if (count > 1) return 'COMPOUND_MULTI_FIELD';
    if (q.objectType) return 'OBJECT';
    if (q.room) return 'ROOM';
    if (q.direction) return 'DIRECTION';
    if (q.element) return 'ELEMENT';
    if (q.planet) return 'PLANET';
    if (q.chakra) return 'CHAKRA';
    if (q.activity) return 'ACTIVITY';

    return 'COMPOUND_MULTI_FIELD';
  }
}
