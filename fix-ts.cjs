const fs = require('fs');
let wp = 'src/components/WorkspacePage.tsx';
let wpCode = fs.readFileSync(wp, 'utf8');

wpCode = wpCode.replace(
  'if (mockMatched) {',
  'if (false) {'
);
wpCode = wpCode.replace(
  'setActiveProject(mockMatched);',
  ''
);

fs.writeFileSync(wp, wpCode);

let cd = 'src/modules/client/ClientDashboard.tsx';
let cdCode = fs.readFileSync(cd, 'utf8');
if (!cdCode.includes('LayoutDashboard')) {
  cdCode = cdCode.replace('import { User', 'import { User, LayoutDashboard');
  fs.writeFileSync(cd, cdCode);
}
