const fs = require('fs');
let file = 'src/components/AnalysisHubPage.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'interface AnalysisHubPageProps {\n  clients: Client[];\n}',
  'interface AnalysisHubPageProps {\n  clients: Client[];\n  onNavigate?: (view: string) => void;\n}'
);

code = code.replace(
  'export default function AnalysisHubPage({ clients }: AnalysisHubPageProps) {',
  'export default function AnalysisHubPage({ clients, onNavigate }: AnalysisHubPageProps) {'
);

code = code.replace(
  'onViewReports={() => setActiveModule("hub")}',
  'onViewReports={() => { if (onNavigate) onNavigate("reports"); else setActiveModule("hub"); }}'
);
code = code.replace(
  'onViewReports={() => setActiveModule("hub")}',
  'onViewReports={() => { if (onNavigate) onNavigate("reports"); else setActiveModule("hub"); }}'
);

fs.writeFileSync(file, code);
console.log('Patched AnalysisHubPage.tsx');

let appFile = 'src/App.tsx';
let appCode = fs.readFileSync(appFile, 'utf8');
appCode = appCode.replace(
  '<AnalysisHubPage clients={clients} />',
  '<AnalysisHubPage clients={clients} onNavigate={setActiveView} />'
);
fs.writeFileSync(appFile, appCode);
console.log('Patched App.tsx');

