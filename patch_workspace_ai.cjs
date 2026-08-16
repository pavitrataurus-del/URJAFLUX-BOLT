const fs = require('fs');
let content = fs.readFileSync('src/components/WorkspacePage.tsx', 'utf8');

if (!content.includes('import AIAnalysisWorkspace')) {
  content = content.replace(
    'import KnowledgeGraphWorkspace from "../core/knowledge/graph/components/KnowledgeGraphWorkspace";',
    'import KnowledgeGraphWorkspace from "../core/knowledge/graph/components/KnowledgeGraphWorkspace";\nimport AIAnalysisWorkspace from "../core/knowledge/reasoning/components/AIAnalysisWorkspace";'
  );
}

const targetStr = `      {activeWorkspaceTab === "3D Digital Twin" ? (
        <div className="flex-1 overflow-hidden">
          <DigitalTwinWorkspace projectId={project?.id || "unknown"} floorId={"default"} />
        </div>
      ) : activeWorkspaceTab === "Knowledge Graph" ? (
        <div className="flex-1 overflow-hidden">
          <KnowledgeGraphWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
        </div>
      ) : (
      <div className="flex-1 overflow-hidden">`;

const replacementStr = `      {activeWorkspaceTab === "3D Digital Twin" ? (
        <div className="flex-1 overflow-hidden">
          <DigitalTwinWorkspace projectId={project?.id || "unknown"} floorId={"default"} />
        </div>
      ) : activeWorkspaceTab === "Knowledge Graph" ? (
        <div className="flex-1 overflow-hidden">
          <KnowledgeGraphWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
        </div>
      ) : activeWorkspaceTab === "AI Analysis" ? (
        <div className="flex-1 overflow-hidden">
          <AIAnalysisWorkspace projectId={project?.id || "unknown"} isAdmin={true} />
        </div>
      ) : (
      <div className="flex-1 overflow-hidden">`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/WorkspacePage.tsx', content);
