const fs = require('fs');
let content = fs.readFileSync('src/components/WorkspacePage.tsx', 'utf8');

if (!content.includes('import VastuAnalysisWorkspace')) {
  content = content.replace(
    'import AIAnalysisWorkspace from "../core/knowledge/reasoning/components/AIAnalysisWorkspace";',
    'import AIAnalysisWorkspace from "../core/knowledge/reasoning/components/AIAnalysisWorkspace";\nimport VastuAnalysisWorkspace from "../core/knowledge/vastu/components/VastuAnalysisWorkspace";'
  );
}

const targetTabStr = `<button onClick={() => setActiveWorkspaceTab("AI Analysis")}`;
const replacementTabStr = `<button onClick={() => setActiveWorkspaceTab("Vastu Analysis")} className={\`px-3 py-1 rounded text-xs font-bold transition-colors \${activeWorkspaceTab === "Vastu Analysis" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"}\`}>Vastu Analysis</button>
        <button onClick={() => setActiveWorkspaceTab("AI Analysis")}`;

if (!content.includes('Vastu Analysis</button>')) {
  content = content.replace(targetTabStr, replacementTabStr);
}

const targetRenderStr = `      ) : activeWorkspaceTab === "AI Analysis" ? (
        <div className="flex-1 overflow-hidden">
          <AIAnalysisWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
        </div>
      ) : (
      <div className="flex-1 overflow-hidden">`;

const replacementRenderStr = `      ) : activeWorkspaceTab === "AI Analysis" ? (
        <div className="flex-1 overflow-hidden">
          <AIAnalysisWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
        </div>
      ) : activeWorkspaceTab === "Vastu Analysis" ? (
        <div className="flex-1 overflow-hidden">
          <VastuAnalysisWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
        </div>
      ) : (
      <div className="flex-1 overflow-hidden">`;

if (!content.includes('<VastuAnalysisWorkspace')) {
  content = content.replace(targetRenderStr, replacementRenderStr);
}

fs.writeFileSync('src/components/WorkspacePage.tsx', content);
