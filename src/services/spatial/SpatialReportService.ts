import { SpatialIntelligenceAnalysis } from "../../types/spatialIntelligence";

/**
 * ============================================================================
 *               URJAFLUX AI OS — SPATIAL REPORT INTELLIGENCE
 * ============================================================================
 * 
 * Formats, aggregates, and renders comprehensive spatial intelligence reports,
 * room inventories, area distribution charts, connectivity matrices, and validation audits.
 */

export class SpatialReportService {

  public static generateFullReport(analysis: SpatialIntelligenceAnalysis) {
    const { elements, statistics, validationReport, orientation, spatialGraph } = analysis;

    const rooms = elements.filter(e => e.type === "ROOM" || e.type === "CORRIDOR" || e.type === "BALCONY");
    const unclassified = elements.filter(e => e.category === "UNCLASSIFIED" || e.confidence < 0.5);

    // Area distribution by category
    const categoryAreaMap: Record<string, number> = {};
    rooms.forEach(r => {
      const cat = r.category || "UNCLASSIFIED";
      const area = r.properties.areaMeters || 0;
      categoryAreaMap[cat] = (categoryAreaMap[cat] || 0) + area;
    });

    return {
      title: "URJAFLUX Spatial Intelligence Executive Report",
      generatedAt: new Date().toISOString(),
      projectId: analysis.projectId,
      
      summary: {
        totalAreaM2: statistics.totalBuildingAreaM2.toFixed(2),
        totalPerimeterMeters: statistics.totalPerimeterMeters.toFixed(2),
        roomCount: statistics.roomCount,
        wallCount: statistics.wallCount,
        doorCount: statistics.doorCount,
        windowCount: statistics.windowCount,
        columnCount: statistics.columnCount,
        integrityScore: `${validationReport.integrityScore}/100`,
        overallConfidence: `${(statistics.overallConfidenceScore * 100).toFixed(1)}%`
      },

      orientation: {
        northSource: orientation.northSource,
        northAngleDegrees: `${orientation.northAngleDegrees}°`,
        roomCountAnalyzed: orientation.roomOrientations.length
      },

      roomInventory: rooms.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        areaM2: (r.properties.areaMeters || 0).toFixed(2),
        perimeterMeters: (r.properties.perimeterMeters || 0).toFixed(2),
        origin: r.origin,
        confidence: `${((r.confidence || 0) * 100).toFixed(0)}%`
      })),

      areaDistribution: Object.entries(categoryAreaMap).map(([category, areaM2]) => ({
        category,
        areaM2: areaM2.toFixed(2),
        percentage: ((areaM2 / (statistics.totalBuildingAreaM2 || 1)) * 100).toFixed(1) + "%"
      })),

      connectivity: {
        totalAdjacencies: spatialGraph.adjacencies.length,
        totalDoorConnections: spatialGraph.doorConnectivities.length,
        totalTravelPaths: spatialGraph.travelPaths.length
      },

      validation: {
        isValid: validationReport.isValid,
        integrityScore: validationReport.integrityScore,
        criticalCount: validationReport.criticalCount,
        warningCount: validationReport.warningCount,
        issues: validationReport.issues
      },

      unclassifiedObjects: unclassified.map(u => ({
        id: u.id,
        name: u.name,
        type: u.type,
        confidence: u.confidence,
        reason: "Low confidence or ambiguous boundary vector"
      }))
    };
  }
}
