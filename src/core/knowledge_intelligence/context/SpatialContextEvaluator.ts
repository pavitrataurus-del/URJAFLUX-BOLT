// ============================================================================
// URJAFLUX AI OS - SPATIAL CONTEXT EVALUATOR (KIE)
// Normalizes Spatial Features, Directions, Elements, Objects & Adjacencies
// ============================================================================

import { ISpatialContextData } from "../types/kie.types";

export interface ISpatialContextEvaluationResult {
  normalizedDirection: string;
  normalizedZone: string;
  normalizedRoom: string;
  normalizedObject: string;
  normalizedElement: string;
  normalizedPlanet: string;
  normalizedChakra: string;
  spatialDimensionsList: string[];
  adjacencyPairs: Array<{ roomOrObject: string; adjacentTo: string }>;
}

export class SpatialContextEvaluator {

  public evaluateSpatialContext(spatial: ISpatialContextData): ISpatialContextEvaluationResult {
    const dir = (spatial.direction || "").toUpperCase().trim();
    const zone = (spatial.zone || dir).toUpperCase().trim();
    const room = (spatial.roomType || "").toLowerCase().trim();
    const obj = (spatial.objectType || "").toLowerCase().trim();
    const element = (spatial.element || "").toLowerCase().trim();
    const planet = (spatial.planet || "").toLowerCase().trim();
    const chakra = (spatial.chakra || "").toLowerCase().trim();

    const dimensionsList: string[] = [];
    if (dir) dimensionsList.push(`DIR:${dir}`);
    if (zone && zone !== dir) dimensionsList.push(`ZONE:${zone}`);
    if (room) dimensionsList.push(`ROOM:${room}`);
    if (obj) dimensionsList.push(`OBJ:${obj}`);
    if (element) dimensionsList.push(`ELEM:${element}`);
    if (planet) dimensionsList.push(`PLANET:${planet}`);
    if (chakra) dimensionsList.push(`CHAKRA:${chakra}`);

    const adjacencyPairs: Array<{ roomOrObject: string; adjacentTo: string }> = [];
    (spatial.adjacency || []).forEach(adj => {
      adjacencyPairs.push({
        roomOrObject: room || obj || "subject",
        adjacentTo: adj.toLowerCase().trim()
      });
    });

    (spatial.blueprintObjectRelationships || []).forEach(rel => {
      adjacencyPairs.push({
        roomOrObject: rel.objectId,
        adjacentTo: rel.relatedObjectId
      });
    });

    return {
      normalizedDirection: dir,
      normalizedZone: zone,
      normalizedRoom: room,
      normalizedObject: obj,
      normalizedElement: element,
      normalizedPlanet: planet,
      normalizedChakra: chakra,
      spatialDimensionsList: dimensionsList,
      adjacencyPairs
    };
  }
}
