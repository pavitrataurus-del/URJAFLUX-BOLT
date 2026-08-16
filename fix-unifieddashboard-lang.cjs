const fs = require('fs');
let code = fs.readFileSync('src/modules/dashboard/UnifiedDashboard.tsx', 'utf8');

code = code.replace(/client\.language === "hi"/g, 'client.reportLanguage === "Hindi"');
code = code.replace(/client\.preferredLanguage === "Hindi" \|\| client\.preferredLanguage === "hi" \|\| client\.reportLanguage === "Hindi"/g, 'client.reportLanguage === "Hindi" || client.preferredLanguage === "Hindi" || client.preferredLanguage === "hi"');

fs.writeFileSync('src/modules/dashboard/UnifiedDashboard.tsx', code);
