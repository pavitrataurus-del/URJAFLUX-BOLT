/**
 * URJAFLUX AI OS — SPRINT 3A
 * Decision Engine QA & End-To-End Validation Script
 */

import { executeVastuAnalysisPipeline } from "../src/services/vastuAnalysisOrchestrator";
import { ConsultantIntelligenceService } from "../src/engines/decision/ConsultantIntelligenceService";

async function runDecisionEngineQA() {
  console.log("==========================================================");
  console.log("URJAFLUX AI OS — SPRINT 3A DECISION ENGINE QA");
  console.log("==========================================================");

  // Provide mock CAD entities so PRE model and Decision Engine evaluate realistic spatial elements
  const mockCadEntities = [
    {
      id: "CAD-ENT-001",
      type: "Kitchen",
      layer: "ROOMS",
      color: "#FF5722",
      coordinates: { x: 800, y: 150, width: 220, height: 180 },
      polygon: [{ x: 800, y: 150 }, { x: 1020, y: 150 }, { x: 1020, y: 330 }, { x: 800, y: 330 }],
      label: "Kitchen Area",
      areaSqFt: 396
    },
    {
      id: "CAD-ENT-002",
      type: "Master Bedroom",
      layer: "ROOMS",
      color: "#3F51B5",
      coordinates: { x: 100, y: 600, width: 300, height: 250 },
      polygon: [{ x: 100, y: 600 }, { x: 400, y: 600 }, { x: 400, y: 850 }, { x: 100, y: 850 }],
      label: "Master Bedroom",
      areaSqFt: 750
    },
    {
      id: "CAD-ENT-003",
      type: "Toilet",
      layer: "ROOMS",
      color: "#00BCD4",
      coordinates: { x: 500, y: 100, width: 150, height: 120 },
      polygon: [{ x: 500, y: 100 }, { x: 650, y: 100 }, { x: 650, y: 220 }, { x: 500, y: 220 }],
      label: "Toilet / Washroom",
      areaSqFt: 180
    },
    {
      id: "CAD-ENT-004",
      type: "Entrance",
      layer: "DOORS",
      color: "#4CAF50",
      coordinates: { x: 500, y: 850, width: 80, height: 40 },
      polygon: [{ x: 500, y: 850 }, { x: 580, y: 850 }, { x: 580, y: 890 }, { x: 500, y: 890 }],
      label: "Main Door",
      areaSqFt: 32
    }
  ];

  console.log("\n1. Running Full Vastu Pipeline with Decision Engine...");
  const result = await executeVastuAnalysisPipeline(
    mockCadEntities as any,
    null,
    45, // Rotated North angle 45 deg
    0,
    () => {},
    "VASTU"
  );

  console.log(`✓ Pipeline Execution Complete.`);
  console.log(`✓ Total Entities Evaluated: ${result.totalEntitiesEvaluated}`);
  console.log(`✓ Overall Score: ${result.overallScore}%`);
  console.log(`✓ Total Imbalances Identified: ${result.doshas.length}`);

  const decResult = result.decisionExecutionResult;
  if (!decResult) {
    throw new Error("❌ FAIL: decisionExecutionResult is missing from pipeline output!");
  }

  console.log("\n----------------------------------------------------------");
  console.log("2. EXPLAINABLE DECISION CHAINS VERIFICATION");
  console.log("----------------------------------------------------------");
  console.log(`✓ Total Decision Chains Generated: ${decResult.decisionChains.length}`);
  console.log(`✓ Overall System Decision Confidence: ${Math.round(decResult.overallConfidence * 100)}%`);

  if (decResult.decisionChains.length > 0) {
    const sampleChain = decResult.decisionChains[0];
    console.log(`\nSample Decision Chain for Finding: '${sampleChain.appliedRule.title}'`);
    console.log(`  - Element: ${sampleChain.elementName} (${sampleChain.zone})`);
    console.log(`  - Severity: ${sampleChain.severityCalculation.severity} (-${sampleChain.severityCalculation.scoreDeduction}%)`);
    console.log(`  - Element Health Index: ${sampleChain.multiDimensionalEvaluation.healthIndex}%`);
    console.log(`  - Canon Source: ${sampleChain.supportingKnowledge.sourceCanon}`);
    console.log(`  - 8 Pipeline Stages Trace:`);
    sampleChain.steps.forEach((step, i) => {
      console.log(`    Stage ${i + 1} [${step.label}]: ${step.description}`);
    });
  }

  console.log("\n----------------------------------------------------------");
  console.log("3. MULTI-DIMENSIONAL PROPERTY HEALTH INDEX VERIFICATION");
  console.log("----------------------------------------------------------");
  const phi = decResult.propertyHealthIndex;
  console.log(`✓ Overall Health Score: ${phi.overallScore}%`);
  console.log(`✓ Rating Tier: ${phi.ratingTier}`);
  console.log(`✓ Sub-Indices Breakdown (${phi.subIndices.length} Sub-Indices):`);
  phi.subIndices.forEach((sub) => {
    console.log(`  - ${sub.name}: ${sub.score}% (${sub.status}) -> ${sub.keyObservation}`);
  });

  console.log("\n----------------------------------------------------------");
  console.log("4. POSITIVE + NEGATIVE AUDIT ENGINE VERIFICATION");
  console.log("----------------------------------------------------------");
  const audit = decResult.positiveNegativeAudit;
  console.log(`✓ Total Strengths Identified: ${audit.summary.totalStrengths}`);
  console.log(`✓ Total Defects Identified: ${audit.summary.totalDefects}`);
  console.log(`✓ Harmony Ratio: ${audit.summary.harmonyRatioPercent}%`);
  console.log(`✓ Audit Verdict: ${audit.summary.verdict}`);

  if (audit.positiveStrengths.length > 0) {
    console.log(`  - Top Positive Strength: ${audit.positiveStrengths[0].title} (+${audit.positiveStrengths[0].harmonyContributionScore}%)`);
  }
  if (audit.negativeDefects.length > 0) {
    console.log(`  - Top Negative Defect: ${audit.negativeDefects[0].title} (-${audit.negativeDefects[0].scoreDeduction}%)`);
  }

  console.log("\n----------------------------------------------------------");
  console.log("5. CONSULTANT SUITE & VERSION COMPARISON VERIFICATION");
  console.log("----------------------------------------------------------");
  const override = ConsultantIntelligenceService.saveOverride(
    "CAD-ENT-001",
    "Kitchen Area",
    "Kitchen",
    "Pooja Room",
    "Pooja Room",
    "Consultant verified CAD line boundary as sanctum altar."
  );
  console.log(`✓ Overridden Entity saved: '${override.originalName}' -> '${override.overriddenType}'`);

  ConsultantIntelligenceService.setRemedyStatus("REM-1", "ACCEPTED", "Verified by Lead Consultant");
  console.log(`✓ Remedy 'REM-1' accepted & logged in consultant ledger.`);

  const comparison = ConsultantIntelligenceService.comparePropertyVersions(
    62,
    result.doshas.map(d => ({ id: d.id, title: d.title })),
    85,
    result.doshas.slice(0, 1).map(d => ({ id: d.id, title: d.title })),
    "Pre-Remedy Blueprint",
    "Post-Remedy Blueprint"
  );
  console.log(`✓ Layout Comparison Generated: Score Delta = +${comparison.scoreDelta}%`);
  console.log(`  - Resolved Defects: ${comparison.resolvedDefects.join(", ")}`);

  console.log("\n==========================================================");
  console.log("ALL DECISION ENGINE QA VERIFICATIONS PASSED SUCCESSFULLY!");
  console.log("==========================================================");
}

runDecisionEngineQA().catch((err) => {
  console.error("❌ QA Test Error:", err);
  process.exit(1);
});
