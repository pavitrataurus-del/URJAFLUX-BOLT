import {
  IReport,
  IReportMetadata,
  IReportAuditLog,
  ReportStatus,
  ReportType,
  UserRole,
  LanguageCode
} from './ReportTypes';

import { ReportDataOrchestrator } from './ReportDataOrchestrator';
import { ReportBrandingEngine } from './ReportBrandingEngine';
import { ReportTemplateEngine } from './ReportTemplateEngine';

export class ReportRegistry {
  private static instance: ReportRegistry;
  private reports: Map<string, IReport> = new Map();
  private auditLogs: IReportAuditLog[] = [];

  private constructor() {
    this.seedInitialReports();
  }

  public static getInstance(): ReportRegistry {
    if (!ReportRegistry.instance) {
      ReportRegistry.instance = new ReportRegistry();
    }
    return ReportRegistry.instance;
  }

  private seedInitialReports(): void {
    const defaultBranding = ReportBrandingEngine.getInstance().getDefaultBranding();
    const orchestrated = ReportDataOrchestrator.getInstance().orchestrateReportData('EXECUTIVE_SUMMARY', 'en');

    const sampleReport: IReport = {
      id: 'rep-001',
      uuid: 'f2d8e40a-912b-423f-843c-391d149021e1',
      version: 1,
      reportNumber: 'URF-REP-2026-001',
      status: 'APPROVED',
      ownerId: 'usr-admin-001',
      createdBy: 'Technical Lead',
      updatedBy: 'Technical Lead',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      metadata: orchestrated.metadata,
      branding: defaultBranding,
      sections: orchestrated.sections,
      attachments: orchestrated.attachments,
      allCitations: orchestrated.citations,
      exportJobsCount: 2,
      approvedBy: 'Dr. Rajesh Sharma (Lead Architect)',
      approvedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      identityId: 'id-001',
      propertyId: 'prop-001',
      consultantId: 'cons-001',
      reportVersion: '1.0.0',
      reportStatus: 'APPROVED',
      createdDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedDate: new Date(Date.now() - 3600000 * 4).toISOString(),
      archiveStatus: false
    };

    this.reports.set(sampleReport.id, sampleReport);
    this.logAudit(sampleReport.id, 'CREATED', 'System', 'ADMIN', 'Initialized default executive report snapshot.');
    this.logAudit(sampleReport.id, 'APPROVED', 'Dr. Rajesh Sharma', 'ADMIN', 'Approved report for client presentation.');
  }

  public createReport(
    reportType: ReportType,
    lang: LanguageCode = 'en',
    templateId?: string,
    propertyId?: string,
    projectId?: string,
    creatorName: string = 'Enterprise Specialist',
    userRole: UserRole = 'ADMIN'
  ): IReport {
    const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const uuid = crypto.randomUUID ? crypto.randomUUID() : `uuid-${Date.now()}`;
    const reportNum = `URF-REP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const template = templateId ? ReportTemplateEngine.getInstance().getTemplate(templateId) : undefined;
    const branding = template ? template.defaultBranding : ReportBrandingEngine.getInstance().getDefaultBranding();
    const orchestrated = ReportDataOrchestrator.getInstance().orchestrateReportData(reportType, lang, propertyId, projectId);

    const newReport: IReport = {
      id,
      uuid,
      version: 1,
      reportNumber: reportNum,
      status: 'DRAFT',
      ownerId: 'usr-current-user',
      createdBy: creatorName,
      updatedBy: creatorName,
      createdAt: now,
      updatedAt: now,
      metadata: {
        ...orchestrated.metadata,
        authorName: creatorName,
        authorRole: userRole
      },
      branding,
      sections: orchestrated.sections,
      attachments: orchestrated.attachments,
      allCitations: orchestrated.citations,
      exportJobsCount: 0,
      identityId: 'id-current',
      propertyId: propertyId || 'prop-default',
      consultantId: 'cons-current',
      reportVersion: '1.0.0',
      reportStatus: 'DRAFT',
      createdDate: now,
      updatedDate: now,
      archiveStatus: false
    };

    this.reports.set(id, newReport);
    this.logAudit(id, 'CREATED', creatorName, userRole, `Created new ${reportType} report draft.`);
    return newReport;
  }

  public getReport(reportId: string, role: UserRole = 'ADMIN'): IReport | undefined {
    const rep = this.reports.get(reportId);
    if (!rep) return undefined;

    // RBAC: END_USER can only view APPROVED reports
    if (role === 'END_USER' && rep.status !== 'APPROVED') {
      return undefined;
    }
    return rep;
  }

  public getAllReports(role: UserRole = 'ADMIN'): IReport[] {
    const all = Array.from(this.reports.values());
    if (role === 'END_USER') {
      return all.filter(r => r.status === 'APPROVED');
    }
    return all;
  }

  public updateReportStatus(
    reportId: string,
    newStatus: ReportStatus,
    performedBy: string,
    userRole: UserRole
  ): IReport {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    report.status = newStatus;
    report.version += 1;
    report.updatedBy = performedBy;
    report.updatedAt = new Date().toISOString();

    if (newStatus === 'APPROVED') {
      report.approvedBy = performedBy;
      report.approvedAt = new Date().toISOString();
    }

    this.reports.set(reportId, report);
    this.logAudit(reportId, 'STATUS_CHANGED', performedBy, userRole, `Updated status to ${newStatus}. Version incremented to v${report.version}.`);
    return report;
  }

  public updateReportSections(
    reportId: string,
    updatedSections: IReport['sections'],
    performedBy: string,
    userRole: UserRole
  ): IReport {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    report.sections = updatedSections;
    report.updatedBy = performedBy;
    report.updatedAt = new Date().toISOString();

    this.reports.set(reportId, report);
    this.logAudit(reportId, 'UPDATED', performedBy, userRole, 'Modified report sections markdown content.');
    return report;
  }

  public updateReportBranding(
    reportId: string,
    updatedBranding: IReport['branding'],
    performedBy: string,
    userRole: UserRole
  ): IReport {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    report.branding = updatedBranding;
    report.updatedBy = performedBy;
    report.updatedAt = new Date().toISOString();

    this.reports.set(reportId, report);
    this.logAudit(reportId, 'UPDATED', performedBy, userRole, 'Updated custom report branding, theme colors, or logo URL.');
    return report;
  }

  public logAudit(
    reportId: string,
    action: IReportAuditLog['action'],
    performedBy: string,
    userRole: UserRole,
    details: string
  ): void {
    const log: IReportAuditLog = {
      auditId: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reportId,
      action,
      performedBy,
      userRole,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
  }

  public getAuditLogsForReport(reportId: string): IReportAuditLog[] {
    return this.auditLogs.filter(l => l.reportId === reportId);
  }

  public getAllAuditLogs(): IReportAuditLog[] {
    return [...this.auditLogs];
  }
}
