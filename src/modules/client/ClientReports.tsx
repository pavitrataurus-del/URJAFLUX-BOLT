import React from "react";
import { ProjectReport } from "../../types/app";
import { FileSpreadsheet, Eye, Award, Clock } from "lucide-react";

interface ClientReportsProps {
  reports: ProjectReport[];
  onNavigateToReports?: (reportId: string) => void;
}

export const ClientReports: React.FC<ClientReportsProps> = ({ reports, onNavigateToReports }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Astro-Spatial Dossiers & Reports
        </h3>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          RECONCILED SCRIPTRUAL REPORTS GENERATED FOR THE REAL ESTATE PORTFOLIO
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-white/10">
          <FileSpreadsheet className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-400 text-xs font-mono">No reports found for this client portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="p-4 bg-white/35 border border-slate-200 rounded-xl flex flex-col justify-between gap-3 hover:border-slate-850 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{report.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    DIAGNOSTIC ID: UF-2026-{report.id.toUpperCase()}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 text-[8.5px] font-mono font-bold rounded uppercase ${
                    report.status === "Approved" || report.status === "Sent"
                      ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30"
                      : "bg-amber-950/20 text-amber-400 border border-amber-900/30"
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>

              {/* Physical specs / Vastu parameters */}
              <div className="p-2.5 bg-slate-50/40 rounded-lg text-xs font-mono space-y-1.5 border border-slate-950 text-slate-700">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">PROPERTY ASSET:</span>
                  <span className="font-bold text-slate-200">{report.propertyName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">DATE GENERATED:</span>
                  <span className="font-bold text-slate-200">{report.dateCreated}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">REMEDIES RECORDED:</span>
                  <span className="font-bold text-emerald-400">{report.remedies?.length || 0} COORDINATES</span>
                </div>
              </div>

              {/* Rating score badge & Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-950 mt-1">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold bg-emerald-950/20 px-2 py-1 rounded">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>Vibe Rating: {report.summaryRating}%</span>
                </div>

                {onNavigateToReports && (
                  <button
                    onClick={() => onNavigateToReports(report.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900/40 text-[9.5px] font-mono font-bold text-emerald-300 hover:text-emerald-200 rounded cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>PREVIEW DOSSIER</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ClientReports;
