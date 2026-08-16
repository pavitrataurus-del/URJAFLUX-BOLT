import { 
  getReports as serviceGetReports, 
  addReport as serviceAddReport, 
  updateReport as serviceUpdateReport, 
  deleteReport as serviceDeleteReport 
} from "../services/reportService";
import { ProjectReport } from "../types/app";
import type { SubscriberScope } from "../core/access/knowledgeVaultAccess";

export async function getReports(scope?: SubscriberScope): Promise<ProjectReport[]> {
  return serviceGetReports(scope);
}

export async function addReport(
  report: Omit<ProjectReport, "id" | "dateCreated">,
  ownership?: SubscriberScope
): Promise<ProjectReport> {
  return serviceAddReport(report, ownership);
}

export async function updateReport(report: ProjectReport): Promise<ProjectReport> {
  return serviceUpdateReport(report);
}

export async function deleteReport(id: string): Promise<void> {
  return serviceDeleteReport(id);
}

export const ReportRepository = {
  getReports,
  addReport,
  updateReport,
  deleteReport
};
