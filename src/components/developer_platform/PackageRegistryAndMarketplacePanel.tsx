import React, { useState } from "react";
import { 
  ShoppingBag, 
  ShieldCheck, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  PackageCheck, 
  Lock, 
  Search 
} from "lucide-react";
import { RegisteredPackage, MarketplaceSubmission } from "../../types/developerPlatform";
import { 
  INITIAL_REGISTERED_PACKAGES, 
  INITIAL_MARKETPLACE_SUBMISSIONS 
} from "../../services/developer_platform/developerPlatformService";

export const PackageRegistryAndMarketplacePanel: React.FC = () => {
  const [packages, setPackages] = useState<RegisteredPackage[]>(INITIAL_REGISTERED_PACKAGES);
  const [submissions, setSubmissions] = useState<MarketplaceSubmission[]>(INITIAL_MARKETPLACE_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState<"REGISTRY" | "SUBMISSIONS">("REGISTRY");
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeMsg, setNoticeMsg] = useState("");

  const handleApproveSubmission = (id: string) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          approvalState: "APPROVED",
          validationStatus: "PASSED"
        };
      }
      return s;
    }));
    setNoticeMsg(`Marketplace submission ${id} approved and published to STABLE release channel.`);
    setTimeout(() => setNoticeMsg(""), 3000);
  };

  const filteredPackages = packages.filter(p => 
    p.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.authorPublisher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <ShoppingBag className="w-4 h-4" />
            <span>MODULE 7 & 8 • PACKAGE REGISTRY & MARKETPLACE PUBLISHING</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">UrjaFlux Package Registry & Marketplace Review Queue</h2>
          <p className="text-xs text-slate-400 mt-1">
            Package signing verification, dependency graph analysis, automated SAST security scanning, and release channel management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("REGISTRY")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === "REGISTRY" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            Package Registry ({packages.length})
          </button>

          <button
            onClick={() => setActiveTab("SUBMISSIONS")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === "SUBMISSIONS" ? "bg-emerald-600 text-white" : "bg-slate-950 text-slate-400"
            }`}
          >
            Review Queue ({submissions.length})
          </button>
        </div>
      </div>

      {noticeMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{noticeMsg}</span>
        </div>
      )}

      {/* REGISTRY TAB */}
      {activeTab === "REGISTRY" && (
        <div className="space-y-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search package name, publisher..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredPackages.map(pkg => (
              <div key={pkg.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-300 font-bold uppercase">{pkg.packageType}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                    v{pkg.version}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white break-all">{pkg.packageName}</h4>

                <div className="text-[10px] text-slate-400 space-y-1 border-t border-slate-850 pt-2">
                  <div>Publisher: <span className="text-slate-200">{pkg.authorPublisher}</span></div>
                  <div>Signature: <strong className="text-emerald-400">{pkg.signatureVerified ? "RSA SHA256 VERIFIED" : "UNSIGNED"}</strong></div>
                  <div>Downloads: <span className="text-amber-300">{pkg.downloadCount.toLocaleString()}</span></div>
                </div>

                <div className="pt-2 border-t border-slate-850">
                  <span className="text-[10px] text-slate-500 block mb-1">Declared Dependencies:</span>
                  <div className="flex flex-wrap gap-1">
                    {pkg.dependencies.length > 0 ? (
                      pkg.dependencies.map(d => (
                        <span key={d} className="px-1.5 py-0.5 rounded bg-slate-900 text-[9px] text-slate-400">
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-slate-600">Zero External Dependencies</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMISSIONS REVIEW QUEUE TAB */}
      {activeTab === "SUBMISSIONS" && (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <span>{sub.id}</span>
                    <span>•</span>
                    <span>Publisher: {sub.publisherName}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">{sub.packageName} (v{sub.version})</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    sub.approvalState === "APPROVED" 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {sub.approvalState}
                  </span>

                  {sub.approvalState === "PENDING_APPROVAL" && (
                    <button
                      onClick={() => handleApproveSubmission(sub.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Approve & Publish
                    </button>
                  )}
                </div>
              </div>

              {/* Security Scan Details */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Security & SAST Scan Results</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Scanner Engine: {sub.securityScanResult.scannerToolName}</span>
                </div>

                <p className="text-slate-300 text-xs font-sans">{sub.securityScanResult.details}</p>

                {sub.securityScanResult.requiresExternalScanner && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-[10px] text-amber-200">
                    ⚠️ Note: Production SAST and dependency vulnerability scans execute on external CI runners (Snyk / SonarQube).
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
