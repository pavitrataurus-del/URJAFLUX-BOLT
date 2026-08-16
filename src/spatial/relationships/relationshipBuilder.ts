import { SpatialModel } from "../types/spatialModel";
import { analyzeAdjacencies } from "./adjacencyAnalyzer";
import { analyzeOrientations } from "./orientationAnalyzer";
import { analyzeConnectivity } from "./connectivityAnalyzer";
import { SpatialRelationshipModel } from "./relationshipTypes";

/**
 * Builds the complete semantic spatial relationship model from raw spatial geometry.
 */
export function buildRelationships(spatialModel: SpatialModel): SpatialRelationshipModel {

  // 1. Analyze room adjacency and shared wall boundaries
  const adjacencyRels = analyzeAdjacencies(spatialModel);

  // 2. Analyze compass orientation, facings, and zone mappings
  const { 
    relationships: orientationRels, 
    zoneMappings, 
    globalCentroid 
  } = analyzeOrientations(spatialModel);

  // 3. Analyze portals and direct room paths
  const connectivityRels = analyzeConnectivity(spatialModel);

  // Combine all established semantic facts
  const relationships = [
    ...adjacencyRels,
    ...orientationRels,
    ...connectivityRels
  ];

  return {
    relationships,
    zoneMappings,
    globalCentroid
  };
}
