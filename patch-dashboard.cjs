const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

// Replace Vastu Calibration Pipeline with Recent Clients & Pending Reports

const recentClientsHTML = `
          {/* Recent Clients Tracking Panel */}
          {!isPremiumMember && (
            <div className="p-5 rounded-xl bg-white/30 border border-slate-200 space-y-4 mt-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Recent Clients</h3>
                </div>
                <button
                  onClick={() => onNavigate("clients")}
                  className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Full List</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {clients.slice(0, 3).map(c => (
                  <div key={c.id} className="p-3.5 rounded-lg bg-white/60 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{c.name}</span>
                        <span className="text-[10px] font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-400">{c.occupation || "Client"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{c.email}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-mono block">STATUS</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-50 text-slate-400 border border-slate-200">{c.status || "Active"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Reports Tracking Panel */}
          {!isPremiumMember && (
            <div className="p-5 rounded-xl bg-white/30 border border-slate-200 space-y-4 mt-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Pending Reports</h3>
                </div>
                <button
                  onClick={() => onNavigate("reports")}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {reports.filter(r => r.status === "Draft" || r.status === "Pending").slice(0, 3).map(r => (
                  <div key={r.id} className="p-3.5 rounded-lg bg-white/60 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{r.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>Client: {r.clientName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-mono block">STATUS</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-500 border border-amber-200">{r.status}</span>
                    </div>
                  </div>
                ))}
                {reports.filter(r => r.status === "Draft" || r.status === "Pending").length === 0 && (
                  <p className="text-xs text-slate-400">No pending reports at this time.</p>
                )}
              </div>
            </div>
          )}
`;

code = code.replace(/\{\/\* Active Properties Tracking Panel \*\/\}(.|\n)*?\{\/\* Scripture study widget for Premium Members \*\/\}/, recentClientsHTML + '\n          {/* Scripture study widget for Premium Members */}');

// Quick Actions

const quickActionsHTML = `
          {/* Quick Actions Panel */}
          {!isPremiumMember && (
            <div className="p-5 rounded-xl bg-white/30 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate("add_client")}
                  className="py-2.5 bg-slate-50 hover:bg-white text-slate-700 font-mono text-[10px] font-bold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-emerald-500" />
                  <span>NEW CLIENT</span>
                </button>
                <button
                  onClick={() => onNavigate("add_property")}
                  className="py-2.5 bg-slate-50 hover:bg-white text-slate-700 font-mono text-[10px] font-bold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span>ADD PROPERTY</span>
                </button>
                <button
                  onClick={() => onNavigate("workspace")}
                  className="py-2.5 bg-slate-50 hover:bg-white text-slate-700 font-mono text-[10px] font-bold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col items-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-rose-500" />
                  <span>VASTU STUDIO</span>
                </button>
                <button
                  onClick={() => onNavigate("reports")}
                  className="py-2.5 bg-slate-50 hover:bg-white text-slate-700 font-mono text-[10px] font-bold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>ALL REPORTS</span>
                </button>
              </div>
            </div>
          )}
`;

code = code.replace(/\{\/\* Quick Stats Widget & Core Vastu Principle citations \*\/\}/, quickActionsHTML + '\n          {/* Quick Stats Widget & Core Vastu Principle citations */}');

fs.writeFileSync('src/components/DashboardPage.tsx', code);
