const fs = require('fs');

let content = fs.readFileSync('src/modules/client/birth/UniversalBirthRegistry.tsx', 'utf8');

// Insert showRecalculate state
content = content.replace(
  'const [success, setSuccess] = useState(false);',
  'const [success, setSuccess] = useState(false);\n  const [showRecalculate, setShowRecalculate] = useState(false);'
);

// Modify handleSave to check for changes
const saveLogicOriginal = `    const updatedClient: Client = {`;
const saveLogicNew = `    const birthDataChanged = client.dob !== dob || client.birthTime !== birthTime || client.birthPlace !== birthPlace;
    
    const updatedClient: Client = {`;
content = content.replace(saveLogicOriginal, saveLogicNew);

const afterUpdateOriginal = `      await onUpdateClient(updatedClient);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);`;
const afterUpdateNew = `      await onUpdateClient(updatedClient);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      if (birthDataChanged) {
        setShowRecalculate(true);
      }`;
content = content.replace(afterUpdateOriginal, afterUpdateNew);

// Add Recalculate Banner UI right above the form return
const formReturnOriginal = `    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">`;
const formReturnNew = `    <div className="space-y-6">
      {showRecalculate && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <h4 className="text-emerald-900 font-bold">Birth information has changed.</h4>
            <p className="text-emerald-700 text-sm">Numerology, Lal Kitab and generated reports may require recalculation.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowRecalculate(false)} className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-50">Later</button>
            <button onClick={() => setShowRecalculate(false)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm">Recalculate Now</button>
          </div>
        </div>
      )}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">`;
content = content.replace(formReturnOriginal, formReturnNew);
content = content.replace('      </div>\n    </div>\n  );\n};', '      </div>\n    </div>\n    </div>\n  );\n};');

fs.writeFileSync('src/modules/client/birth/UniversalBirthRegistry.tsx', content);
console.log('Patched UniversalBirthRegistry.tsx');
