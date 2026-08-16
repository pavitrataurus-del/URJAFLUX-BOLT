const fs = require('fs');

let file = 'src/components/WorkspacePage.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'onUpdatePropertyOffset: (id: string, offset: number) => void;',
  'onUpdatePropertyOffset: (id: string, offset: number) => void;\n  onNavigate?: (view: string) => void;'
);

code = code.replace(
  'export default function WorkspacePage({ properties, clients, activeProperty, onSetActiveProperty, onUpdatePropertyOffset }: WorkspacePageProps) {',
  'export default function WorkspacePage({ properties, clients, activeProperty, onSetActiveProperty, onUpdatePropertyOffset, onNavigate }: WorkspacePageProps) {'
);

code = code.replace(
  'onViewProjects={() => {\n          setShowLanding(false);\n          // Do something to view projects\n        }}',
  'onViewProjects={() => {\n          setShowLanding(false);\n          if (onNavigate) onNavigate("reports");\n        }}'
);

fs.writeFileSync(file, code);
console.log('Patched WorkspacePage.tsx');

let appFile = 'src/App.tsx';
let appCode = fs.readFileSync(appFile, 'utf8');
appCode = appCode.replace(
  'onUpdatePropertyOffset={handleUpdatePropertyOffset}',
  'onUpdatePropertyOffset={handleUpdatePropertyOffset}\n            onNavigate={setActiveView}'
);
fs.writeFileSync(appFile, appCode);
console.log('Patched App.tsx');
