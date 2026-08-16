import React from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { canAccessKnowledgeVault } from "../../core/access/knowledgeVaultAccess";

interface KnowledgeVaultAccessGateProps {
  userRole?: string | null;
  children: React.ReactNode;
}

export const KnowledgeVaultAccessGate: React.FC<KnowledgeVaultAccessGateProps> = ({
  userRole,
  children,
}) => {
  if (canAccessKnowledgeVault(userRole)) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-4 shadow-sm">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
        <Lock className="w-7 h-7 text-amber-700" />
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center justify-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          Knowledge Vault — Founder only
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Yeh section sirf platform founder ke liye hai — book upload, OCR, shastra libraries,
          rules vault aur ingestion. Paid members ko yahan access nahi milega.
        </p>
      </div>
    </div>
  );
};
