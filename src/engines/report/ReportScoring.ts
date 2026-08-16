import { WorkspaceKnowledgeModel, WorkspaceObject, WorkspaceAnnotation, WorkspaceMeasurement } from "../../types/workspaceKnowledgeModel";
import { VastuRemedy } from "../../types/app";
import { defaultZoneEngine } from "../../core/spatial/zoneEngine";
import { roomTaxonomyService } from "../../recognition/RoomTaxonomyService";

export interface ReportScoreBreakdown {
  overallScore: number;
  directionalBalanceScore: number;
  elementBalanceScore: number;
  structuralSafetyScore: number;
  remedyMitigationFactor: number;
}

export interface SectorAnalysis {
  sector: string;
  element: string;
  status: "Optimized" | "Balanced" | "Imbalanced" | "Critical";
  score: number;
  findings: string[];
  remediesProposed: string[];
}

export interface ScoringResult {
  scores: ReportScoreBreakdown;
  sectorAnalyses: SectorAnalysis[];
  detectedRemedies: VastuRemedy[];
  citations: string[];
}

/**
 * Scoring and Analytics engine for URJAFLUX spatial drawings.
 * Computes sector geometry relative to compass offsets and compiles compliance scores.
 */
export function calculateReportScores(model: WorkspaceKnowledgeModel): ScoringResult {
  const objects = model.objects || [];
  const annotations = model.annotations || [];
  const measurements = model.measurements || [];
  const compassAngle = model.compass?.northAngle ?? 0;

  // Initialize scores
  let directionalScoreSum = 100;
  let elementScoreSum = 100;
  let structuralScoreSum = 100;
  let remedyScoreSum = 0;

  const sectorAnalysesMap: Record<string, SectorAnalysis> = {
    "Northeast (Ishanya)": { sector: "Northeast (Ishanya)", element: "Water", status: "Optimized", score: 100, findings: [], remediesProposed: [] },
    "Southeast (Agneya)": { sector: "Southeast (Agneya)", element: "Fire", status: "Optimized", score: 100, findings: [], remediesProposed: [] },
    "Southwest (Nairutya)": { sector: "Southwest (Nairutya)", element: "Earth", status: "Optimized", score: 100, findings: [], remediesProposed: [] },
    "Northwest (Vayu)": { sector: "Northwest (Vayu)", element: "Air", status: "Optimized", score: 100, findings: [], remediesProposed: [] },
    "North (Kubera)": { sector: "North (Kubera)", element: "Water", status: "Optimized", score: 100, findings: [], remediesProposed: [] },
    "East (Aditya)": { sector: "East (Aditya)", element: "Air/Light", status: "Optimized", score: 100, findings: [], remediesProposed: [] },
    "South (Yama)": { sector: "South (Yama)", element: "Fire/Earth", status: "Optimized", score: 100, findings: [], remediesProposed: [] },
    "West (Varuna)": { sector: "West (Varuna)", element: "Space/Water", status: "Optimized", score: 100, findings: [], remediesProposed: [] },
    "Center (Brahmasthan)": { sector: "Center (Brahmasthan)", element: "Space", status: "Optimized", score: 100, findings: [], remediesProposed: [] }
  };

  const detectedRemedies: VastuRemedy[] = [];
  const citationsSet = new Set<string>();

  // Determine center of mass / geometry center
  let cx = 400;
  let cy = 300;
  if (objects.length > 0) {
    let sumX = 0;
    let sumY = 0;
    objects.forEach(obj => {
      sumX += obj.x;
      sumY += obj.y;
    });
    cx = sumX / objects.length;
    cy = sumY / objects.length;
  }

  // Sector classification helper taking compass offset into account
  const getSectorAndElement = (x: number, y: number): { sectorName: string; element: string } => {
    defaultZoneEngine.setNorth(compassAngle);
    defaultZoneEngine.setOrigin({ x: cx, y: cy });
    const zone = defaultZoneEngine.getZone({ x, y }, 40);
    
    // Map ZoneEngine IDs back to the expected strings here so we don't break the report logic
    const mapping: Record<string, string> = {
      "Center": "Center (Brahmasthan)",
      "N": "North (Kubera)",
      "NNW": "North (Kubera)",
      "NNE": "Northeast (Ishanya)",
      "NE": "Northeast (Ishanya)",
      "ENE": "Northeast (Ishanya)",
      "E": "East (Aditya)",
      "ESE": "Southeast (Agneya)",
      "SE": "Southeast (Agneya)",
      "SSE": "Southeast (Agneya)",
      "S": "South (Yama)",
      "SSW": "Southwest (Nairutya)",
      "SW": "Southwest (Nairutya)",
      "WSW": "Southwest (Nairutya)",
      "W": "West (Varuna)",
      "WNW": "Northwest (Vayu)",
      "NW": "Northwest (Vayu)"
    };
    
    const mappedSector = mapping[zone.id] || "Center (Brahmasthan)";
    return { 
      sectorName: mappedSector, 
      element: zone.element 
    };
  };

  // Analyze each WorkspaceObject
  objects.forEach(obj => {
    const { sectorName, element } = getSectorAndElement(obj.x, obj.y);
    const analysis = sectorAnalysesMap[sectorName] || sectorAnalysesMap["Center (Brahmasthan)"];
    const displayName = obj.name || "";
    const canonicalType = roomTaxonomyService.resolveCanonicalTypeFromEntity(undefined, displayName);
    const utilityCategory = roomTaxonomyService.inferStructuralUtilityCategory(displayName);

    // Default object analysis
    analysis.findings.push(`Detected spatial object: "${displayName}" in ${sectorName}.`);

    // Kitchen / fire element analysis
    if (canonicalType === "KITCHEN" || utilityCategory === "FIRE_APPLIANCE") {
      if (sectorName === "Southeast (Agneya)") {
        analysis.score = Math.min(analysis.score, 100);
        analysis.findings.push(`Optimal: Fire element placement matches Agni quadrant.`);
        elementScoreSum += 5;
      } else {
        analysis.score = Math.max(0, analysis.score - 20);
        analysis.status = "Imbalanced";
        elementScoreSum -= 15;
        const defectText = `Fire element ("${displayName}") placed in ${sectorName} (${element} zone).`;
        const remedyText = `Install a copper wire boundary, place a zinc or brass plate under heating sources, or position a dynamic amber LED light in the Southeast zone.`;
        const citation = `Mayamatam, Chapter 12, Verse 15`;
        
        analysis.findings.push(`Conflict: ${defectText}`);
        analysis.remediesProposed.push(remedyText);
        detectedRemedies.push({
          id: `rem-${obj.id || Math.random().toString(36).substr(2, 9)}-fire`,
          zone: sectorName,
          defect: defectText,
          remedy: remedyText,
          scriptureCitation: citation,
          severity: "Medium",
          status: "Identified"
        });
        citationsSet.add(citation);
      }
    }

    // Toilet / Drainage impurity analysis
    if (canonicalType === "TOILET" || utilityCategory === "SEPTIC_UTILITY") {
      if (sectorName === "Northeast (Ishanya)") {
        analysis.score = Math.max(0, analysis.score - 50);
        analysis.status = "Critical";
        directionalScoreSum -= 25;
        const defectText = `Toilet or drainage impurity placed in sacred Northeast (Ishanya) water sector.`;
        const remedyText = `Relocate toilet if possible. Alternatively, mount virtual brass energetic pyramids on toilet ceiling, place sea salt in a bronze container, and keep doors permanently closed.`;
        const citation = `Brihat Samhita, Ch. 53, Verse 48`;

        analysis.findings.push(`Severe Violation: ${defectText}`);
        analysis.remediesProposed.push(remedyText);
        detectedRemedies.push({
          id: `rem-${obj.id || Math.random().toString(36).substr(2, 9)}-toilet-ne`,
          zone: sectorName,
          defect: defectText,
          remedy: remedyText,
          scriptureCitation: citation,
          severity: "High",
          status: "Identified"
        });
        citationsSet.add(citation);
      } else if (sectorName === "Southwest (Nairutya)") {
        analysis.score = Math.max(0, analysis.score - 30);
        analysis.status = "Critical";
        directionalScoreSum -= 15;
        const defectText = `Toilet placed in Southwest stability sector, draining family or financial prosperity.`;
        const remedyText = `Insert virtual lead metal strips into the floor borders of the bathroom, install yellow-spectrum lights, and place a heavy brass wind chime.`;
        const citation = `Samarangana Sutradhara, Ch. 18, Verse 82`;

        analysis.findings.push(`Violation: ${defectText}`);
        analysis.remediesProposed.push(remedyText);
        detectedRemedies.push({
          id: `rem-${obj.id || Math.random().toString(36).substr(2, 9)}-toilet-sw`,
          zone: sectorName,
          defect: defectText,
          remedy: remedyText,
          scriptureCitation: citation,
          severity: "High",
          status: "Identified"
        });
        citationsSet.add(citation);
      } else {
        analysis.score = Math.max(0, analysis.score - 15);
        if (analysis.status === "Optimized") analysis.status = "Balanced";
        elementScoreSum -= 5;
      }
    }

    // Water storage/elements analysis
    if (utilityCategory === "WATER_UTILITY") {
      if (sectorName === "Northeast (Ishanya)" || sectorName === "North (Kubera)") {
        analysis.score = Math.min(analysis.score, 100);
        analysis.findings.push(`Optimal: Water source aligns with Northern water quadrants.`);
        elementScoreSum += 10;
      } else if (sectorName === "Southeast (Agneya)") {
        analysis.score = Math.max(0, analysis.score - 30);
        analysis.status = "Critical";
        elementScoreSum -= 20;
        const defectText = `Water element placed in Southeast (Agneya) fire quadrant, creating a severe element conflict.`;
        const remedyText = `Separate the water fixture with copper wire energetic blocking, and place small green Aventurine crystals in the room.`;
        const citation = `Vishvakarma Prakash, Ch. 2, Verse 33`;

        analysis.findings.push(`Conflict: ${defectText}`);
        analysis.remediesProposed.push(remedyText);
        detectedRemedies.push({
          id: `rem-${obj.id || Math.random().toString(36).substr(2, 9)}-water-se`,
          zone: sectorName,
          defect: defectText,
          remedy: remedyText,
          scriptureCitation: citation,
          severity: "High",
          status: "Identified"
        });
        citationsSet.add(citation);
      } else if (sectorName === "Southwest (Nairutya)") {
        analysis.score = Math.max(0, analysis.score - 30);
        analysis.status = "Critical";
        directionalScoreSum -= 15;
        const defectText = `Water source placed in Southwest stability quadrant, weakening structural grounding.`;
        const remedyText = `Seal the zone or install virtual lead/brass boundary pins. Keep Southwest heavy with yellow quartz crystals.`;
        const citation = `Brihat Samhita, Ch. 53, Verse 52`;

        analysis.findings.push(`Conflict: ${defectText}`);
        analysis.remediesProposed.push(remedyText);
        detectedRemedies.push({
          id: `rem-${obj.id || Math.random().toString(36).substr(2, 9)}-water-sw`,
          zone: sectorName,
          defect: defectText,
          remedy: remedyText,
          scriptureCitation: citation,
          severity: "High",
          status: "Identified"
        });
        citationsSet.add(citation);
      }
    }

    // Bedroom / heavy storage analysis
    if (canonicalType === "BEDROOM" || canonicalType === "STORE") {
      if (sectorName === "Southwest (Nairutya)") {
        analysis.score = Math.min(analysis.score, 100);
        analysis.findings.push(`Optimal: Heavy grounding element/bedroom matches Southwest Nairutya sector.`);
        directionalScoreSum += 10;
      } else if (sectorName === "Northeast (Ishanya)") {
        analysis.score = Math.max(0, analysis.score - 20);
        analysis.status = "Imbalanced";
        directionalScoreSum -= 10;
        const defectText = `Heavy storage or master bedroom in Northeast, blocking magnetic/cosmic flow.`;
        const remedyText = `Keep Northeast strictly clean and light. Install small mirror on North wall, and utilize light blue decor.`;
        const citation = `Mayamatam, Ch. 12, Verse 9`;

        analysis.findings.push(`Imbalance: ${defectText}`);
        analysis.remediesProposed.push(remedyText);
        detectedRemedies.push({
          id: `rem-${obj.id || Math.random().toString(36).substr(2, 9)}-bed-ne`,
          zone: sectorName,
          defect: defectText,
          remedy: remedyText,
          scriptureCitation: citation,
          severity: "Medium",
          status: "Identified"
        });
        citationsSet.add(citation);
      }
    }

    // Sacred / Prayer Room
    if (canonicalType === "POOJA") {
      if (sectorName === "Northeast (Ishanya)") {
        analysis.score = Math.min(analysis.score, 100);
        analysis.findings.push(`Optimal: Sacred meditation space located in divine Ishanya quadrant.`);
        directionalScoreSum += 15;
      } else if (sectorName === "Southwest (Nairutya)" || sectorName === "South (Yama)") {
        analysis.score = Math.max(0, analysis.score - 20);
        analysis.status = "Imbalanced";
        const defectText = `Pooja room or meditation temple located in heavy Southern or Southwest sectors.`;
        const remedyText = `Reorient idols to face North/East. Burn sandalwood incense, and use warm white/yellow lights to purify.`;
        const citation = `Samarangana Sutradhara, Ch. 18, Verse 45`;

        analysis.findings.push(`Imbalance: ${defectText}`);
        analysis.remediesProposed.push(remedyText);
        detectedRemedies.push({
          id: `rem-${obj.id || Math.random().toString(36).substr(2, 9)}-sacred-sw`,
          zone: sectorName,
          defect: defectText,
          remedy: remedyText,
          scriptureCitation: citation,
          severity: "Medium",
          status: "Identified"
        });
        citationsSet.add(citation);
      }
    }
  });

  // Evaluate measurements and annotations for structural/safety
  measurements.forEach(m => {
    if (m.isLocked) {
      remedyScoreSum += 5;
    }
    // Check if distance exists
    if (!m.distance) {
      structuralScoreSum -= 5;
    }
  });

  annotations.forEach(ann => {
    if (ann.type === "violation" || ann.type === "defect" || ann.type === "issue") {
      structuralScoreSum -= 10;
    }
  });

  // Scale locking bonus
  if (model.scale?.isScaleLocked) {
    remedyScoreSum += 10;
  }

  // Bound scores within [0, 100]
  const directionalBalanceScore = Math.max(10, Math.min(100, directionalScoreSum));
  const elementBalanceScore = Math.max(10, Math.min(100, elementScoreSum));
  const structuralSafetyScore = Math.max(15, Math.min(100, structuralScoreSum));
  const remedyMitigationFactor = Math.max(0, Math.min(100, remedyScoreSum));

  // Overall score is weighted combination of indices
  const baseScore = (directionalBalanceScore * 0.40) + (elementBalanceScore * 0.35) + (structuralSafetyScore * 0.25);
  // Mitigate penalty using the remedy index
  const finalOverallScore = Math.min(100, Math.round(baseScore + (remedyMitigationFactor * 0.15)));

  // Sync statuses of sector analyses based on scores
  const sectorAnalyses = Object.values(sectorAnalysesMap).map(analysis => {
    if (analysis.score < 50) {
      analysis.status = "Critical";
    } else if (analysis.score < 80) {
      analysis.status = "Imbalanced";
    } else if (analysis.score < 95) {
      analysis.status = "Balanced";
    } else {
      analysis.status = "Optimized";
    }
    return analysis;
  });

  // Fallback default citations if none added
  if (citationsSet.size === 0) {
    citationsSet.add("Mayamatam Vastu Shastra, Chapter 12");
    citationsSet.add("Brihat Samhita of Varahamihira, Chapter 53");
    citationsSet.add("Samarangana Sutradhara of King Bhoja, Chapter 18");
  }

  return {
    scores: {
      overallScore: finalOverallScore,
      directionalBalanceScore,
      elementBalanceScore,
      structuralSafetyScore,
      remedyMitigationFactor
    },
    sectorAnalyses,
    detectedRemedies,
    citations: Array.from(citationsSet)
  };
}
