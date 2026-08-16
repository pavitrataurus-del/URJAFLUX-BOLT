import React, { useState } from "react";
import { Client } from "../../../types/app";
import { ShieldCheck, HelpCircle, AlertTriangle, PenTool } from "lucide-react";

interface BirthVerificationPanelProps {
  client: Client;
  onUpdate: (updatedFields: Partial<Client>, auditMessage: string) => Promise<void>;
}

export const BirthVerificationPanel: React.FC<BirthVerificationPanelProps> = ({ client, onUpdate }) => {
  const [accuracy, setAccuracy] = useState<"Exact" | "Approximate" | "Unknown">(
    client.birthTimeAccuracy || "Unknown"
  );
  const [status, setStatus] = useState<"Verified" | "User Entered" | "Incomplete">(
    client.birthDataStatus || "Incomplete"
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const msg = `Updated Birth Accuracy to "${accuracy}" and Verification Status to "${status}"`;
      await onUpdate({
        birthTimeAccuracy: accuracy,
        birthDataStatus: status
      }, msg);
    } catch (err) {
      console.error("Error updating birth verification settings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="birth-verification-panel" className="bg-white/35 border border-slate-200 rounded-xl p-5 space-y-4">
      <div>
        <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
          Registry Verification Control
        </h4>
        <p className="text-[10px] text-slate-400 font-mono">AUTHENTICATE BIRTH RECORD INTEGRITY</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Birth Time Accuracy Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            Birth Time Accuracy
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded border border-slate-850">
            {(["Exact", "Approximate", "Unknown"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAccuracy(opt)}
                className={`py-1.5 text-[10.5px] font-mono font-bold rounded transition-all cursor-pointer ${
                  accuracy === opt
                    ? "bg-emerald-600 text-slate-900"
                    : "text-slate-400 hover:text-slate-700 hover:bg-white/45"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Birth Data Status Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            Birth Data Status
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded border border-slate-850">
            {(["Verified", "User Entered", "Incomplete"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setStatus(opt)}
                className={`py-1.5 text-[10.5px] font-mono font-bold rounded transition-all cursor-pointer ${
                  status === opt
                    ? "bg-rose-500 text-slate-900"
                    : "text-slate-400 hover:text-slate-700 hover:bg-white/45"
                }`}
              >
                {opt.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Warning/Helper Text */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-[10px] font-mono text-slate-400 space-y-1 leading-relaxed">
          <p className="text-slate-700 font-bold">REGISTRY POLICY:</p>
          <p>
            Marking birth records as <span className="text-emerald-400 font-bold">"Verified"</span> implies that the birth certificate or an astronomical ledger check has been completed. Only Verified records can be used for final predictive Lal Kitab printouts.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono font-bold text-[11px] rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{loading ? "COMMITTING..." : "SAVE VERIFICATION STATUS"}</span>
        </button>
      </div>
    </div>
  );
};
