import { WorkspaceKnowledgeModel } from "../../types/workspaceKnowledgeModel";
import { VastuRemedy } from "../../types/app";
import { ReportBuilder } from "./ReportBuilder";
import { calculateReportScores, ScoringResult, ReportScoreBreakdown, SectorAnalysis } from "./ReportScoring";

export interface ReportSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string; // Markdown formatted section content
  order: number;
}

export interface ProfessionalReport {
  id: string;
  title: string;
  generatedAt: string;
  projectId: string;
  projectName: string;
  clientName: string;
  propertyName: string;
  scores: ReportScoreBreakdown;
  sections: ReportSection[];
  sectorAnalyses: SectorAnalysis[];
  remedies: VastuRemedy[];
  citations: string[];
  isApproved: boolean;
  notes: string;
}

/**
 * Commercial Report Engine public interface.
 * Exposes methods to analyze workspace drawings and construct full professional reports.
 */
export class ReportEngine {
  /**
   * Generates a fully compiled, scored, and client-ready ProfessionalReport
   * from a WorkspaceKnowledgeModel.
   */
  public static generateReport(model: WorkspaceKnowledgeModel): ProfessionalReport {
    const builder = new ReportBuilder(model);
    return builder.build();
  }

  /**
   * Performs an evaluation pass on the spatial model to retrieve raw score breakdowns
   * and sector analyses, bypassing full document section construction.
   */
  public static evaluateWorkspace(model: WorkspaceKnowledgeModel): ScoringResult {
    return calculateReportScores(model);
  }
}
