const fs = require('fs');
let ws = fs.readFileSync('src/components/WorkspacePage.tsx', 'utf8');

// Replace the invalid react-resizable-panels imports with the older version's named exports
ws = ws.replace(
  'import { Panel, PanelGroup as OriginalPanelGroup, PanelResizeHandle as OriginalPanelResizeHandle } from "react-resizable-panels";\n\n// Provide missing types internally to bypass strict type errors for the older react-resizable-panels version\nconst PanelGroup = OriginalPanelGroup as any;\nconst PanelResizeHandle = OriginalPanelResizeHandle as any;',
  'import { Panel, Group, Separator } from "react-resizable-panels";\n\n// Alias the exports for internal use\nconst PanelGroup = Group as any;\nconst PanelResizeHandle = Separator as any;'
);

fs.writeFileSync('src/components/WorkspacePage.tsx', ws);
