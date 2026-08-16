import { 
  InterpretationContext, 
  InterpretationFinding, 
  FindingGeneratorPlugin,
  InterpretationSeverity 
} from "./InterpretationTypes";

function mapRuleSeverity(severity: "CATASTROPHIC" | "MAJOR" | "MODERATE" | "MINOR"): InterpretationSeverity {
  switch (severity) {
    case "CATASTROPHIC": return "CRITICAL";
    case "MAJOR": return "HIGH";
    case "MODERATE": return "MEDIUM";
    case "MINOR": return "LOW";
    default: return "INFORMATIONAL";
  }
}

/**
 * Standard finding generator executing default built-in heuristics
 * for Vastu orientation, spatial and numerology imbalances.
 */
export class StandardFindingGenerator implements FindingGeneratorPlugin {
  public readonly pluginId = "built_in_findings";
  public readonly name = "Core Spatial and Vedic Finding Generator";

  public generateFindings(context: InterpretationContext): InterpretationFinding[] {
    const findings: InterpretationFinding[] = [];

    // Heuristic 1: Detect Vastu Directional / Spatial Quadrant mismatches from Triggered Rules
    context.triggeredRules.forEach(rule => {
      if (rule.matched) {
        // Construct detailed spatial/Vastu finding
        const evidenceRefs = context.knowledgeReferences.filter(r => 
          rule.formulaIds?.some(f => f.includes(r.bookId)) || r.bookId === "core_vastu"
        );

        findings.push({
          id: `FIND-${rule.pluginId.toUpperCase()}-${rule.ruleId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: `Vastu Alignment Defect: ${rule.ruleId.replace("RULE-", "").replace(/_/g, " ")}`,
          description: `Vedic spatial auditing detected a layout mismatch triggering strict rule: ${rule.ruleId}.`,
          category: "VASTU_DEFECT",
          severity: mapRuleSeverity(rule.severity),
          confidence: context.compass.confidence,
          evidence: evidenceRefs.length > 0 ? evidenceRefs : [
            {
              bookId: "Mayamatam",
              bookTitle: "Mayamatam Treatise of Vedic Architecture",
              chapter: "Chapter III: Orientation & Site",
              verse: "III.14",
              citationText: "Alignments of entrances and rooms must correspond strictly with directional energies."
            }
          ],
          relatedRules: [rule.ruleId],
          relatedCalculations: rule.formulaIds || [],
          affectedArea: rule.ruleId.includes("NE") ? "North-East" : rule.ruleId.includes("SW") ? "South-West" : "General Plot",
          pluginSource: this.pluginId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Heuristic 2: Evaluate Ayadi Numerological Incompatibilities from Calculation Engine
    const ayadiYoni = context.calculationResults["ayadiYoniValue"];
    const plotRatio = context.calculationResults["plotAspectRatio"];

    if (ayadiYoni !== undefined && (ayadiYoni === 0 || ayadiYoni === 6)) {
      findings.push({
        id: `FIND-AYADI-YONI-CONFLICT-${Date.now()}`,
        title: "Inauspicious Ayadi Yoni Calculation",
        description: `Ayadi calculation returned Yoni value of ${ayadiYoni}. In traditional Vastu science, Yoni indices representing 0 (non-directional) or 6 (destructive) result in continuous energy depletion of the property inhabitants.`,
        category: "NUMEROLOGY_MISMATCH",
        severity: "HIGH",
        confidence: 0.95,
        evidence: [
          {
            bookId: "Manasara",
            bookTitle: "Manasara Vastushastra",
            chapter: "Chapter IX: Ayadi Formulae",
            verse: "IX.42-45",
            citationText: "Yoni represents the breath of the structure; an inauspicious Yoni drains vital prana from the foundation."
          }
        ],
        relatedRules: [],
        relatedCalculations: ["ayadiYoniValue"],
        affectedArea: "Plot Foundation Dimensions",
        pluginSource: this.pluginId,
        timestamp: new Date().toISOString()
      });
    }

    if (plotRatio !== undefined && plotRatio > 2.0) {
      findings.push({
        id: `FIND-PROPORTION-RATIO-WARPED-${Date.now()}`,
        title: "Warped Plot Aspect Ratio Proportions",
        description: `The plot aspect ratio of ${plotRatio.toFixed(2)}:1 deviates significantly from auspicious ratios (ideally less than 2:1). Hyper-elongated structures disrupt the flow of prana, causing energetic dispersion.`,
        category: "SPATIAL_IMBALANCE",
        severity: "MEDIUM",
        confidence: 1.0,
        evidence: [
          {
            bookId: "Samarangana-Sutradhara",
            bookTitle: "Samarangana Sutradhara of King Bhoja",
            chapter: "Chapter XI: Plot Dimensions",
            verse: "XI.8",
            citationText: "A plot exceeding twice its width in length creates an unequal distribution of cosmic force lines."
          }
        ],
        relatedRules: [],
        relatedCalculations: ["plotAspectRatio"],
        affectedArea: "Entire Boundary Contour",
        pluginSource: this.pluginId,
        timestamp: new Date().toISOString()
      });
    }

    return findings;
  }
}

/**
 * Finding Generator Pipeline coordinator.
 * Runs both built-in generators and custom registered generators sequentially.
 */
export class FindingGenerator {
  private plugins: FindingGeneratorPlugin[] = [];

  constructor() {
    this.registerPlugin(new StandardFindingGenerator());
  }

  /**
   * Registers a finding generator plugin.
   */
  public registerPlugin(plugin: FindingGeneratorPlugin): void {
    const exists = this.plugins.some(p => p.pluginId === plugin.pluginId);
    if (exists) {
      throw new Error(`[FindingGenerator] Plugin with ID "${plugin.pluginId}" is already registered.`);
    }
    this.plugins.push(plugin);
  }

  /**
   * Executes all registered generators to yield a combined finding list.
   */
  public generate(context: InterpretationContext): InterpretationFinding[] {
    const allFindings: InterpretationFinding[] = [];
    
    this.plugins.forEach(plugin => {
      try {
        const result = plugin.generateFindings(context);
        allFindings.push(...result);
      } catch (err: unknown) {
        console.error(
          `[FindingGenerator] Plugin "${plugin.pluginId}" failed to compile findings: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    });

    return allFindings;
  }
}
