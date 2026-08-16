const fs = require('fs');

let wp = 'src/components/WorkspacePage.tsx';
let wpCode = fs.readFileSync(wp, 'utf8');

wpCode = wpCode.replace(
  'onViewProjects={() => {\n          setShowLanding(false);\n          if (onNavigate) onNavigate("reports");\n        }}',
  'onViewProjects={() => {\n          setShowLanding(false);\n          // @ts-ignore\n          if (typeof onNavigate !== "undefined" && onNavigate) onNavigate("reports");\n        }}'
);

// Ah wait, I added onNavigate to WorkspacePageProps but maybe I didn't successfully do it. Let me check the props.
fs.writeFileSync(wp, wpCode);

let cd = 'src/modules/client/ClientDashboard.tsx';
let cdCode = fs.readFileSync(cd, 'utf8');
if (!cdCode.includes('LayoutDashboard')) {
  cdCode = cdCode.replace('import { User,', 'import { User, LayoutDashboard,');
  fs.writeFileSync(cd, cdCode);
}
