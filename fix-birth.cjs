const fs = require('fs');
let content = fs.readFileSync('src/modules/client/birth/UniversalBirthRegistry.tsx', 'utf8');

// Remove the extra </div>
content = content.replace('      </div>\n    </div>\n    </div>\n  );\n};', '      </div>\n    </div>\n  );\n};');

// Inject the banner right before Main Double Grid
const mainGridOriginal = `      {/* Main Double Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">`;

const mainGridNew = `      {showRecalculate && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4 mb-6">
          <div>
            <h4 className="text-amber-900 font-bold text-sm">Birth information has changed.</h4>
            <p className="text-amber-700 text-xs mt-1">Numerology, Lal Kitab and generated reports may require recalculation.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setShowRecalculate(false)} className="px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-50 transition-colors">Later</button>
            <button onClick={() => setShowRecalculate(false)} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 shadow-sm transition-colors">Recalculate Now</button>
          </div>
        </div>
      )}

      {/* Main Double Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">`;

content = content.replace(mainGridOriginal, mainGridNew);
fs.writeFileSync('src/modules/client/birth/UniversalBirthRegistry.tsx', content);
