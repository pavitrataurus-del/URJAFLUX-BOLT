const fs = require('fs');
let content = fs.readFileSync('src/components/WorkspacePage.tsx', 'utf8');

if (!content.includes('import ReportCenterWorkspace')) {
  content = content.replace(
    'import VastuAnalysisWorkspace from "../core/knowledge/vastu/components/VastuAnalysisWorkspace";',
    'import VastuAnalysisWorkspace from "../core/knowledge/vastu/components/VastuAnalysisWorkspace";\nimport ReportCenterWorkspace from "../core/knowledge/reports/components/ReportCenterWorkspace";'
  );
}

const targetTabStr = `<button onClick={() => setActiveWorkspaceTab("Vastu Analysis")}`;
const replacementTabStr = `<button onClick={() => setActiveWorkspaceTab("Reports")} className={\`px-3 py-1 rounded text-xs font-bold transition-colors \${activeWorkspaceTab === "Reports" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"}\`}>Reports</button>
        <button onClick={() => setActiveWorkspaceTab("Vastu Analysis")}`;

if (!content.includes('Reports</button>')) {
  content = content.replace(targetTabStr, replacementTabStr);
}

const targetRenderStr = `      ) : activeWorkspaceTab === "Vastu Analysis" ? (
        <div className="flex-1 overflow-hidden">
          <VastuAnalysisWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
        </div>
      ) : (
      <div className="flex-1 overflow-hidden">`;

const replacementRenderStr = `      ) : activeWorkspaceTab === "Vastu Analysis" ? (
        <div className="flex-1 overflow-hidden">
          <VastuAnalysisWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
        </div>
      ) : activeWorkspaceTab === "Reports" ? (
        <div className="flex-1 overflow-hidden">
          <ReportCenterWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
        </div>
      ) : (
      <div className="flex-1 overflow-hidden">`;

if (!content.includes('<ReportCenterWorkspace')) {
  content = content.replace(targetRenderStr, replacementRenderStr);
}

fs.writeFileSync('src/components/WorkspacePage.tsx', content);
