import React, { useState } from "react";
import { Client } from "../../types/app";
import { PlusCircle, ShieldCheck } from "lucide-react";

interface ClientActivityProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => Promise<any>;
}

export const ClientActivity: React.FC<ClientActivityProps> = ({ client, onUpdateClient }) => {
  const [type, setType] = useState("Phone Consultation");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Completed");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setLoading(true);
    try {
      const newEvent = {
        id: `evt_${Date.now()}`,
        date,
        type: type as any,
        notes,
        status
      };

      const existingHistory = client.consultationHistory || [];
      const updatedClient: Client = {
        ...client,
        consultationHistory: [newEvent, ...existingHistory]
      };

      await onUpdateClient(updatedClient);
      setNotes("");
    } catch (err) {
      console.error("Error logging consultation activity:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white/35 border border-slate-200 rounded-xl space-y-4">
      <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-950 pb-2">
        <PlusCircle className="w-4 h-4 text-emerald-400" />
        Log Consultation or Client Touchpoint
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Interaction Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
            >
              <option value="Phone Consultation">Phone Consultation</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Vastu Analysis">Vastu Analysis</option>
              <option value="Numerology Analysis">Numerology Analysis</option>
              <option value="Lal Kitab Consultation">Lal Kitab Consultation</option>
              <option value="Report Generated">Report Generated</option>
              <option value="Invoice Created">Invoice Created</option>
              <option value="Follow-up Completed">Follow-up Completed</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
            >
              <option value="Completed">Completed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Notes & Findings</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Document interaction takeaways, spiritual prescriptions, or specific follow-up directions..."
            className="w-full bg-slate-50 text-xs text-slate-200 p-3 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 resize-none font-sans"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {loading ? "RECORDING..." : "LOG CONSULTATION RECORD"}
          </button>
        </div>
      </form>
    </div>
  );
};
export default ClientActivity;
