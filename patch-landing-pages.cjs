const fs = require('fs');

function patchFile(file, requiredInputsHtml) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('Required Inputs')) {
    // find Workflow or Supported Analysis Engines to insert before
    const parts = code.split('        <div>\n          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">');
    if (parts.length === 2) {
       code = parts[0] + requiredInputsHtml + '\n        <div>\n          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">' + parts[1];
       fs.writeFileSync(file, code);
       console.log('Patched ' + file);
    } else {
       console.log('Could not patch ' + file);
    }
  } else {
    console.log('Already patched ' + file);
  }
}

const vastuInputs = `
        {/* Required Inputs */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Required Inputs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-emerald-400 mb-2">1. Floor Plan</h3>
              <p className="text-slate-300 text-sm">A PDF, PNG, or JPG of the architectural floor plan to scale.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-emerald-400 mb-2">2. Compass Alignment</h3>
              <p className="text-slate-300 text-sm">Accurate magnetic North orientation and exact degree deviations.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-emerald-400 mb-2">3. Property Dimensions</h3>
              <p className="text-slate-300 text-sm">Overall plot and built-up area to calculate accurate spatial grids.</p>
            </div>
          </div>
        </div>
`;

const numInputs = `
        {/* Required Inputs */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Required Inputs</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-indigo-400 mb-2">1. Date of Birth</h3>
              <p className="text-slate-300 text-sm">Used to calculate Psychic, Destiny, and Personal Year numbers.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-indigo-400 mb-2">2. Full Legal Name</h3>
              <p className="text-slate-300 text-sm">Analyzed via Chaldean or Pythagorean grids for name vibration.</p>
            </div>
          </div>
        </div>
`;

const lalInputs = `
        {/* Required Inputs */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Required Inputs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-orange-400 mb-2">1. Date of Birth</h3>
              <p className="text-slate-300 text-sm">Exact Gregorian calendar date of birth.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-orange-400 mb-2">2. Exact Time of Birth</h3>
              <p className="text-slate-300 text-sm">Accurate birth time to determine the exact Ascendant and house cusps.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-orange-400 mb-2">3. Place of Birth</h3>
              <p className="text-slate-300 text-sm">City or coordinates to adjust for timezone and latitude/longitude.</p>
            </div>
          </div>
        </div>
`;

patchFile('src/components/landing/VastuLandingPage.tsx', vastuInputs);
patchFile('src/components/landing/NumerologyLandingPage.tsx', numInputs);
patchFile('src/components/landing/LalKitabLandingPage.tsx', lalInputs);

