const fs = require('fs');

let file = 'src/modules/client/ClientDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('setViewingUnified(true)')) {
  let target = `<div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
          <span>REPORT LANGUAGE:</span>
          <span className="text-emerald-600 font-bold">{preferredLanguage.toUpperCase()}</span>
        </div>`;

  let replace = `<div className="flex items-center gap-2">
          <button onClick={() => setViewingUnified(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-sm transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Unified Dashboard
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <span>REPORT LANGUAGE:</span>
            <span className="text-emerald-600 font-bold">{preferredLanguage.toUpperCase()}</span>
          </div>
        </div>`;

  code = code.replace(target, replace);
  
  if (!code.includes('LayoutDashboard')) {
      code = code.replace('import { User,', 'import { User, LayoutDashboard,');
  }

  fs.writeFileSync(file, code);
  console.log('Patched ClientDashboard.tsx');
} else {
  console.log('Already patched.');
}
