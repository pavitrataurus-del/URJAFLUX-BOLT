const fs = require('fs');

let content = fs.readFileSync('src/components/ReportsPage.tsx', 'utf8');

// Replace the mixed string
content = content.replace(
  '{activeReportLanguage === "hi" ? \`वास्तु लेखापरीक्षा रिपोर्ट (Vastu Audit Report) - \${selectedReport.id.toUpperCase()}\` : selectedReport.title}',
  '{activeReportLanguage === "hi" ? \`वास्तु लेखापरीक्षा रिपोर्ट - \${selectedReport.id.toUpperCase()}\` : selectedReport.title}'
);

fs.writeFileSync('src/components/ReportsPage.tsx', content);
console.log('Patched ReportsPage.tsx for pure Hindi.');
