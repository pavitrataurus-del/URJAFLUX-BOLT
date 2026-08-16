const fs = require('fs');
let content = fs.readFileSync('src/core/knowledge/reasoning/components/AIAnalysisWorkspace.tsx', 'utf8');

const target = `<div className="flex items-center gap-4">
          <button`;

const replacement = `<div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search experts, decisions..." 
              className="pl-8 pr-3 py-1 bg-[#05080f] border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-64"
            />
          </div>
          <button`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/core/knowledge/reasoning/components/AIAnalysisWorkspace.tsx', content);
}
