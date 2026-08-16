import { WorkspaceKnowledgeModel } from "../../types/workspaceKnowledgeModel";
import { ProfessionalReport, ReportSection } from "./ReportEngine";
import { calculateReportScores } from "./ReportScoring";
import { 
  generateExecutiveSummary, 
  generateSectorBreakdownMarkdown, 
  generateRemediesMarkdown, 
  generateCitationsMarkdown,
  generateTechnicalDiagnosticsMarkdown
} from "./ReportFormatter";

/**
 * Builder class for constructing a ProfessionalReport.
 * Collects, scores, and formats the spatial information.
 */
export class ReportBuilder {
  private model: WorkspaceKnowledgeModel;
  private reportId: string;
  private generatedAt: string;
  private title: string;

  constructor(model: WorkspaceKnowledgeModel) {
    this.model = model;
    this.reportId = `REP-${model.project?.id || "RAW"}-${Math.floor(Math.random() * 100000)}`;
    this.generatedAt = new Date().toISOString();
    this.title = `URJAFLUX Spatial Intelligence Audit Report`;
  }

  /**
   * Builds the comprehensive, fully-scored ProfessionalReport object.
   */
  public build(): ProfessionalReport {
    // 1. Calculate scores and gather findings
    const scoringResult = calculateReportScores(this.model);

    // 2. Format components into markdown sections
    const executiveSummary = generateExecutiveSummary(scoringResult.scores, scoringResult.sectorAnalyses, this.model);
    const sectorAnalysisMarkdown = generateSectorBreakdownMarkdown(scoringResult.sectorAnalyses);
    const remediesMarkdown = generateRemediesMarkdown(scoringResult.detectedRemedies);
    const citationsMarkdown = generateCitationsMarkdown(scoringResult.citations);
    const technicalDiagnosticsMarkdown = generateTechnicalDiagnosticsMarkdown(this.model);

    // 3. Assemble sections
    const sections: ReportSection[] = [
      {
        id: "sec_exec_summary",
        title: "1. Executive Summary & Core Compliance",
        subtitle: "Spatial Orientation Evaluation",
        content: executiveSummary,
        order: 1
      },
      {
        id: "sec_sector_breakdown",
        title: "2. Topological Sector Analysis",
        subtitle: "9-Quadrant Compass Alignment Grid",
        content: sectorAnalysisMarkdown,
        order: 2
      },
      {
        id: "sec_remedial_measures",
        title: "3. Prescribed Remedial Modifications",
        subtitle: "Non-Invasive Vibrational Remedies",
        content: remediesMarkdown,
        order: 3
      },
      {
        id: "sec_scripture_authority",
        title: "4. Traditional & Scientific Scripture Authority",
        subtitle: "Evidence-Based Citation Matrix",
        content: citationsMarkdown,
        order: 4
      },
      {
        id: "sec_technical_diagnostics",
        title: "5. Technical Engineering Diagnostics",
        subtitle: "Spatial Geometry Topology Logs",
        content: technicalDiagnosticsMarkdown,
        order: 5
      }
    ];

    // 4. Return assembled ProfessionalReport
    return {
      id: this.reportId,
      title: `${this.title} - ${this.model.project?.name || "Draft Blueprint"}`,
      generatedAt: this.generatedAt,
      projectId: this.model.project?.id || "RAW",
      projectName: this.model.project?.name || "Calibrated Drawing",
      clientName: this.model.client?.name || "Unassigned Client",
      propertyName: this.model.property?.name || "Default Canvas Zone",
      scores: scoringResult.scores,
      sections,
      sectorAnalyses: scoringResult.sectorAnalyses,
      remedies: scoringResult.detectedRemedies,
      citations: scoringResult.citations,
      isApproved: false,
      notes: this.model.notes || ""
    };
  }
}
