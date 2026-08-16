const fs = require('fs');

let kp = 'src/components/KnowledgePage.tsx';
let kpCode = fs.readFileSync(kp, 'utf8');
kpCode = 'import { MOCK_SCRIPTURES } from "../data/mockData";\n' + kpCode;
kpCode = kpCode.replace(
  '// Filter Vastu scriptures\n    const matchesSearch = sv.book.toLowerCase().includes',
  '// Filter Vastu scriptures\n  const filteredScriptures = MOCK_SCRIPTURES.filter(sv => {\n    const matchesSearch = sv.book.toLowerCase().includes'
);
fs.writeFileSync(kp, kpCode);

let wp = 'src/components/WorkspacePage.tsx';
let wpCode = fs.readFileSync(wp, 'utf8');
wpCode = 'import { MOCK_PROJECTS } from "../data/mockData";\n' + wpCode;
wpCode = wpCode.replace(
  'const mockMatched = p.propertyId === activeProperty.id;',
  'const mockMatched = MOCK_PROJECTS.find(p => p.propertyId === activeProperty.id);'
);
// wait, let's see what I deleted in WorkspacePage
