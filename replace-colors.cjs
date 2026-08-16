const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-slate-950/g, replacement: 'bg-slate-50' },
  { regex: /bg-slate-900/g, replacement: 'bg-white' },
  { regex: /bg-slate-800/g, replacement: 'bg-slate-100' },
  { regex: /text-slate-100/g, replacement: 'text-slate-900' },
  { regex: /text-white/g, replacement: 'text-slate-900' },
  { regex: /text-slate-300/g, replacement: 'text-slate-700' },
  { regex: /text-slate-400/g, replacement: 'text-slate-500' },
  { regex: /text-slate-500/g, replacement: 'text-slate-400' },
  { regex: /border-slate-800/g, replacement: 'border-slate-200' },
  { regex: /border-slate-900/g, replacement: 'border-slate-200' },
  { regex: /bg-indigo-/g, replacement: 'bg-emerald-' },
  { regex: /text-indigo-/g, replacement: 'text-emerald-' },
  { regex: /border-indigo-/g, replacement: 'border-emerald-' },
  { regex: /from-indigo-/g, replacement: 'from-emerald-' },
  { regex: /to-indigo-/g, replacement: 'to-emerald-' },
  { regex: /via-indigo-/g, replacement: 'via-emerald-' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDirectory('./src');
console.log('Colors replaced');
