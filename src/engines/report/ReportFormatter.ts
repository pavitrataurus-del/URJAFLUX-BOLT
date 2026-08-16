import { ReportScoreBreakdown, SectorAnalysis } from "./ReportScoring";
import { VastuRemedy } from "../../types/app";
import { WorkspaceKnowledgeModel } from "../../types/workspaceKnowledgeModel";

/**
 * Generates an executive, client-ready summary paragraph based on the calculated scores and objects.
 */
export function generateExecutiveSummary(
  scores: ReportScoreBreakdown,
  sectorAnalyses: SectorAnalysis[],
  model: WorkspaceKnowledgeModel
): string {
  const clientName = model.client?.name || "Valued Client";
  const propertyName = model.property?.name || "Subject Property";
  const overall = scores.overallScore;

  let description = `This Spatial Intelligence Report has been prepared for **${clientName}** to evaluate the geometric, directional, and energetic compliance of **${propertyName}**.\n\n`;

  if (overall >= 90) {
    description += `An exhaustive analysis of the spatial environment indicates a **highly optimized structural configuration** with an overall compliance index of **${overall}/100**. The majority of spatial objects, openings, and structural boundaries align perfectly with classical spatial intelligence parameters. Energetic flow channels are unobstructed, and structural balance is excellent. Only minor, non-invasive vibrational adjustments are recommended to further elevate the environment.`;
  } else if (overall >= 75) {
    description += `The spatial environment exhibits a **sound, balanced foundation** with an overall compliance index of **${overall}/100**. While the core orientation matches standard zoning guidelines, certain sectors present mild element conflicts (e.g. fire/water overlaps) or load-bearing imbalances. Implementing the specified minor remedies will stabilize the local micro-environment and raise compliance close to optimal levels.`;
  } else if (overall >= 50) {
    description += `The spatial environment displays **moderate structural imbalances** with an overall compliance index of **${overall}/100**. Critical sectors, specifically in the orientation of essential zones like the kitchen or master bed space, show high misalignment with natural cardinal elements. Corrective virtual shielding, boundary stabilization, and elemental dampers are strongly advised to alleviate physical and vibrational tension in these zones.`;
  } else {
    description += `The spatial environment presents **significant directional and structural conflicts** with an overall compliance index of **${overall}/100**. Key functional areas exhibit severe spatial overlapping or element clashes (such as drainage placements in sacred quadrants). To restore balance, immediate non-invasive structural remediations, boundary pinning, and energetic neutralizing grids are recommended for the affected sectors.`;
  }

  // Add notes if present
  if (model.notes && model.notes.trim()) {
    description += `\n\n### Consultant Practitioner Field Notes\n> *"${model.notes.trim()}"*`;
  }

  return description;
}

/**
 * Generates a detailed Markdown table and explanation of the 8 directions plus center sector.
 */
export function generateSectorBreakdownMarkdown(sectorAnalyses: SectorAnalysis[]): string {
  let md = `Below is a complete topological audit of the 9 primary spatial zones in the Spatial Intelligence Graph (SIG):\n\n`;

  md += `| Spatial Sector | Elemental Domain | Status | Compliance Score | Key Findings |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  sectorAnalyses.forEach(sec => {
    const statusEmoji = sec.status === "Optimized" ? "🟢" : sec.status === "Balanced" ? "🟡" : sec.status === "Imbalanced" ? "🟠" : "🔴";
    const findingsSummary = sec.findings.length > 0 ? sec.findings.join("; ") : "No spatial objects registered in this sector.";
    md += `| **${sec.sector}** | ${sec.element} | ${statusEmoji} ${sec.status} | **${sec.score}/100** | ${findingsSummary} |\n`;
  });

  md += `\n\n### Sector Specific Insights and Guidance:\n`;
  sectorAnalyses.forEach(sec => {
    if (sec.findings.length > 0 || sec.remediesProposed.length > 0) {
      md += `\n#### 📍 ${sec.sector}\n`;
      if (sec.findings.length > 0) {
        md += `* **Observations:**\n`;
        sec.findings.forEach(f => md += `  - ${f}\n`);
      }
      if (sec.remediesProposed.length > 0) {
        md += `* **Remedial Directives:**\n`;
        sec.remediesProposed.forEach(r => md += `  - *${r}*\n`);
      }
    }
  });

  return md;
}

/**
 * Generates a Markdown table of proposed remedies and physical adjustments.
 */
export function generateRemediesMarkdown(remedies: VastuRemedy[]): string {
  if (remedies.length === 0) {
    return `No active remediation modifications are required at this time. The current spatial layout is compliant with default standards.`;
  }

  let md = `The following high-priority remedies have been generated to counter the identified defects. Implementation of these remedies will restore elemental and vibrational balance:\n\n`;

  md += `| Severity | Identified Defect | Prescribed Correction / Remedy | Traditional Scripture Authority | Status |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  remedies.forEach(rem => {
    const badge = rem.severity === "High" ? "🚨 **High**" : rem.severity === "Medium" ? "⚠️ Medium" : "🟢 Low";
    const statusLabel = rem.status === "Verified" ? "✅ Verified" : rem.status === "Implemented" ? "⚙️ Implemented" : "⏳ Identified";
    md += `| ${badge} | ${rem.defect} | ${rem.remedy} | *${rem.scriptureCitation}* | ${statusLabel} |\n`;
  });

  return md;
}

/**
 * Generates a structured citations section.
 */
export function generateCitationsMarkdown(citations: string[]): string {
  let md = `All spatial recommendations and rules executed by the URJAFLUX AI OS are backed by authentic traditional literature, municipal zoning standards, and environmental studies:\n\n`;

  citations.forEach((cit, idx) => {
    md += `${idx + 1}. **${cit}** - Standard structural and alignment reference.\n`;
  });

  return md;
}

/**
 * Formats a clean structural breakdown of the geometric inputs.
 */
export function generateTechnicalDiagnosticsMarkdown(model: WorkspaceKnowledgeModel): string {
  const objects = model.objects || [];
  const measurements = model.measurements || [];
  const annotations = model.annotations || [];

  let md = `### Spatial Data Graph Summary\n`;
  md += `* **Total Active Polygons/Objects:** ${objects.length}\n`;
  md += `* **Total Linear Measurements:** ${measurements.length}\n`;
  md += `* **Total Design Annotations:** ${annotations.length}\n`;

  if (model.compass) {
    md += `* **Calibrated Magnetic North Angle:** ${model.compass.northAngle}°\n`;
    if (model.compass.northType) {
      md += `* **North Reference Type:** ${model.compass.northType}\n`;
    }
  }

  if (model.scale) {
    md += `* **Floor Scale Calibration:** ${model.scale.scale || "Not Defined"}\n`;
    md += `* **Scale Calibration Status:** ${model.scale.isScaleLocked ? "Locked" : "Unlocked"}\n`;
  }

  return md;
}
