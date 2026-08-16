const fs = require('fs');
let code = fs.readFileSync('src/modules/client/ClientList.tsx', 'utf8');

// replace the buttons
code = code.replace(
  /<div className="flex items-center gap-1\.5">\s*<button[\s\S]*?<\/button>\s*<\/div>/,
  `{deleteConfirmId === client.id ? (
                    <div className="flex items-center gap-2 px-2 bg-rose-50 border border-rose-200 rounded-lg">
                      <span className="text-[10px] font-bold text-rose-600">CONFIRM?</span>
                      <button onClick={() => { onDeleteClient(client.id); setDeleteConfirmId(null); }} className="p-1 hover:bg-rose-200 rounded text-rose-700">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(null)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectClient(client.id)}
                        title="Edit Profile"
                        className="p-1.5 bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-200 border border-slate-850 rounded cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(client.id)}
                        title="Delete Client"
                        className="p-1.5 bg-slate-50 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-850 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}`
);

// Add Check and X to lucide-react imports if not there
if (!code.includes('Check,')) {
  code = code.replace('Trash2', 'Trash2, Check, X');
}

// add useState hook
if (!code.includes('const [deleteConfirmId')) {
  code = code.replace('const { t } = useTranslation();', 'const { t } = useTranslation();\n  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);');
}

fs.writeFileSync('src/modules/client/ClientList.tsx', code);
