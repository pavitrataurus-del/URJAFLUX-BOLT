const fs = require('fs');
let code = fs.readFileSync('src/modules/client/ConsultationDetails.tsx', 'utf8');

// Change `name="language"` to `name="reportLanguage"` and value to `formData.reportLanguage`
code = code.replace(/name="language"/, 'name="reportLanguage"');
code = code.replace(/value=\{formData.language \|\| "English"\}/, 'value={formData.reportLanguage || "English"}');

// Display 
code = code.replace(/\{client\.language \|\| "English"\}/g, '{client.reportLanguage || "English"}');

fs.writeFileSync('src/modules/client/ConsultationDetails.tsx', code);
