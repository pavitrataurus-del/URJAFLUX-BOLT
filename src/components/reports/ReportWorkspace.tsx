import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  History,
  Palette,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  Building2,
  Lock,
  UserCheck
} from 'lucide-react';

import {
  IReport,
  ReportStatus,
  ReportType,
  ExportFormat,
  UserRole
} from '../../core/reports/ReportTypes';
import { ReportRegistry } from '../../core/reports/ReportRegistry';
import { ReportExportEngine } from '../../core/reports/ReportExportEngine';
import { ReportPreviewModal } from './ReportPreviewModal';
import { ReportBuilderWorkspace } from './ReportBuilderWorkspace';
import { ReportTemplateLibrary } from './ReportTemplateLibrary';
import { ReportAuditLogView } from './ReportAuditLogView';

export const ReportWorkspace: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'BUILDER' | 'TEMPLATES' | 'AUDIT'>('DASHBOARD');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<IReport | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const registry = ReportRegistry.getInstance();
  const reports = registry.getAllReports(userRole);

  const activeReport = selectedReportId ? registry.getReport(selectedReportId, userRole) : reports[0];

  const filteredReports = reports.filter(r => {
    const matchesSearch =
      r.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.metadata.propertyName && r.metadata.propertyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'ALL' || r.metadata.reportType === filterType;
    return matchesSearch && matchesType;
  });

  const handleExport = async (report: IReport, format: ExportFormat) => {
    try {
      const job = await ReportExportEngine.getInstance().exportReport(report, format, 'Lead Specialist');
      if (job.generatedFileUrl) {
        const a = document.createElement('a');
        a.href = job.generatedFileUrl;
        a.download = `${report.reportNumber}_${report.metadata.reportType}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleOpenPreview = (report: IReport) => {
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Workspace Header & Role Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              DOMAIN-010 Document Intelligence
            </span>
            <span className="text-xs text-slate-400">• Multi-Format Export & Truth Traceability</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Enterprise Report Generation Engine
          </h1>
        </div>

        {/* Role Switcher Pill */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Role:
          </span>
          {(['ADMIN', 'PROJECT_MANAGER', 'FIELD_ENGINEER', 'END_USER'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => setUserRole(role)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                userRole === role
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navigation Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
              activeTab === 'DASHBOARD'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Reports Dashboard ({reports.length})</span>
          </button>

          {userRole !== 'END_USER' && (
            <button
              onClick={() => {
                if (activeReport) setSelectedReportId(activeReport.id);
                setActiveTab('BUILDER');
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                activeTab === 'BUILDER'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Interactive Builder</span>
            </button>
          )}

          {userRole !== 'END_USER' && (
            <button
              onClick={() => setActiveTab('TEMPLATES')}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                activeTab === 'TEMPLATES'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Template Library</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
              activeTab === 'AUDIT'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>

        {userRole !== 'END_USER' && (
          <button
            onClick={() => {
              const newRep = registry.createReport('EXECUTIVE_SUMMARY', 'en', undefined, 'PROP-001', 'UF-PRJ-2026-081', 'Specialist', userRole);
              setSelectedReportId(newRep.id);
              setActiveTab('BUILDER');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Report Draft</span>
          </button>
        )}
      </div>

      {/* Main Tab Views */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Total Reports</span>
                <h3 className="text-2xl font-bold text-white mt-1">{reports.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Approved Reports</span>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                  {reports.filter(r => r.status === 'APPROVED').length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">In Review / Draft</span>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">
                  {reports.filter(r => r.status === 'DRAFT' || r.status === 'REVIEW').length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400">Supported Formats</span>
                <h3 className="text-2xl font-bold text-sky-400 mt-1">5 Formats</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Download className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search report title, ID, property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Report Types</option>
                <option value="EXECUTIVE_SUMMARY">Executive Summary</option>
                <option value="TECHNICAL_ANALYSIS">Technical Analysis</option>
                <option value="SITE_INSPECTION">Site Inspection</option>
                <option value="DIGITAL_TWIN">Digital Twin Telemetry</option>
                <option value="COMPLIANCE_CERTIFICATE">Compliance Certificate</option>
              </select>
            </div>
          </div>

          {/* Report Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Report Number</th>
                    <th className="p-4">Title & Type</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Version</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredReports.map(report => (
                    <tr key={report.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        {report.reportNumber}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{report.metadata.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {report.metadata.reportType}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">
                        {report.metadata.propertyName || 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          report.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        v{report.version}.0
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenPreview(report)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                            title="Preview Report"
                          >
                            <Eye className="w-4 h-4 text-emerald-400" />
                          </button>

                          {userRole !== 'END_USER' && (
                            <button
                              onClick={() => {
                                setSelectedReportId(report.id);
                                setActiveTab('BUILDER');
                              }}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                              title="Edit Section Content"
                            >
                              <Layers className="w-4 h-4 text-sky-400" />
                            </button>
                          )}

                          <button
                            onClick={() => handleExport(report, 'PDF')}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'BUILDER' && activeReport && (
        <ReportBuilderWorkspace
          report={activeReport}
          userRole={userRole}
          onReportUpdated={(updated) => setSelectedReportId(updated.id)}
          onOpenPreview={() => handleOpenPreview(activeReport)}
        />
      )}

      {activeTab === 'TEMPLATES' && (
        <ReportTemplateLibrary
          userRole={userRole}
          onReportCreated={(newId) => {
            setSelectedReportId(newId);
            setActiveTab('BUILDER');
          }}
        />
      )}

      {activeTab === 'AUDIT' && <ReportAuditLogView />}

      {/* Report Live Interactive Preview Modal */}
      <ReportPreviewModal
        report={previewReport}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onExport={(fmt) => previewReport && handleExport(previewReport, fmt)}
      />
    </div>
  );
};
