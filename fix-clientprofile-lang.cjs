const fs = require('fs');
let code = fs.readFileSync('src/modules/client/ClientProfile.tsx', 'utf8');

// Add Report Language to Edit Form
const languageEditBlock = `            {/* Preferred Language */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Preferred Language</label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage || "English"}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi / हिन्दी</option>
                <option value="Spanish">Spanish / Español</option>
                <option value="Sanskrit">Sanskrit / संस्कृतम्</option>
              </select>
            </div>

            {/* Report Language */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Report Language</label>
              <select
                name="reportLanguage"
                value={formData.reportLanguage || "English"}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi / हिन्दी</option>
              </select>
            </div>`;

code = code.replace(/\{\/\* Preferred Language \*\/\}[\s\S]*?<\/select>\s*<\/div>/, languageEditBlock);

// Add Report Language to Display
const languageDisplayBlock = `<p className="flex justify-between">
                  <span className="text-slate-400">LANG PREFERENCE:</span>
                  <span className="text-emerald-300 font-medium">{client.preferredLanguage || "English"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">REPORT LANG:</span>
                  <span className="text-emerald-300 font-medium">{client.reportLanguage || "English"}</span>
                </p>`;

code = code.replace(/<p className="flex justify-between">\s*<span className="text-slate-400">LANG PREFERENCE:<\/span>\s*<span className="text-emerald-300 font-medium">\{client\.preferredLanguage \|\| "English"\}<\/span>\s*<\/p>/, languageDisplayBlock);

fs.writeFileSync('src/modules/client/ClientProfile.tsx', code);
