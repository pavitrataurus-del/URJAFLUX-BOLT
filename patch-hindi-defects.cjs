const fs = require('fs');

let content = fs.readFileSync('src/components/ReportsPage.tsx', 'utf8');

content = content.replace('विद्युत सर्वर रैक (जल क्षेत्र में अग्नि दोष)', 'विद्युत सर्वर रैक - जल क्षेत्र में अग्नि दोष');
content = content.replace('मुख्य निदेशक केबिन का कोना कटा हुआ है (पृथ्वी तत्व की कमी)', 'मुख्य निदेशक केबिन का कोना कटा हुआ है - पृथ्वी तत्व की कमी');
content = content.replace('उत्तर-पूर्व (NE)', 'उत्तर-पूर्व');
content = content.replace('दक्षिण-पश्चिम (SW)', 'दक्षिण-पश्चिम');
content = content.replace('पश्चिम (W)', 'पश्चिम');

fs.writeFileSync('src/components/ReportsPage.tsx', content);
console.log('Patched Defect strings in ReportsPage.tsx');
