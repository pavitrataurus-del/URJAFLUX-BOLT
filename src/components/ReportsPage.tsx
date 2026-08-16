import React, { useState } from "react";
import { ReportWorkspace } from "./reports/ReportWorkspace";
import { IntegratedClientReportHub } from "./reports/IntegratedClientReportHub";
import { FileText, Layers } from "lucide-react";

interface ReportsPageProps {
  reports?: any[];
  properties?: any[];
  clients?: any[];
  onAddReport?: (report: any) => void;
  onDeleteReport?: (id: string) => void;
  onUpdateReportStatus?: (id: string, status: any) => void;
}

export default function ReportsPage(_props: ReportsPageProps) {
  const [tab, setTab] = useState<"INTEGRATED" | "LEGACY">("INTEGRATED");

  return (
    <div className="space-y-4">
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("INTEGRATED")}
          className={`text-xs font-mono font-bold flex items-center gap-2 pb-2 border-b-2 ${
            tab === "INTEGRATED" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500"
          }`}
        >
          <Layers className="w-4 h-4" />
          Integrated Client Reports
        </button>
        <button
          type="button"
          onClick={() => setTab("LEGACY")}
          className={`text-xs font-mono font-bold flex items-center gap-2 pb-2 border-b-2 ${
            tab === "LEGACY" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500"
          }`}
        >
          <FileText className="w-4 h-4" />
          Report Workspace
        </button>
      </div>

      {tab === "INTEGRATED" ? <IntegratedClientReportHub /> : <ReportWorkspace />}
    </div>
  );
}
