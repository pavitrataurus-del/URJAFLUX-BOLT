const fs = require('fs');

const filesToUpdate = [
  'src/services/clientService.ts',
  'src/services/propertyService.ts',
  'src/services/reportService.ts',
  'src/services/projectService.ts'
];

filesToUpdate.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove import
  code = code.replace(/import \{ MOCK_.*?\} from "\.\.\/data\/mockData";\n/g, '');
  
  // Replace MOCK_... with []
  code = code.replace(/localStorage\.setItem\(LOCAL_STORAGE_KEY, JSON\.stringify\(MOCK_.*?\)\);/g, 'localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));');
  code = code.replace(/return MOCK_.*?;/g, 'return [];');

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
});

