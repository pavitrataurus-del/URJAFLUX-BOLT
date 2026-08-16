import React, { useState } from "react";
import { Client } from "../../types/app";
import { ClipboardList } from "lucide-react";

interface ConsultationDetailsProps {
  client: Client;
  onUpdate: (client: Client) => Promise<any>;
}

export const ConsultationDetails: React.FC<ConsultationDetailsProps> = ({ client, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Client>({ ...client });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setFormData({ ...client });
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving consultation details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 p-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Consultation Details
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Status, priority, assigned consultant, and communication language.
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-semibold text-emerald-700 rounded-lg transition-colors cursor-pointer"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Consultant</label>
              <input
                type="text"
                name="assignedConsultant"
                value={formData.assignedConsultant || ""}
                onChange={handleChange}
                placeholder="e.g. Master Vastu Consultant"
                className="w-full bg-slate-50 text-sm text-slate-900 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleChange}
                className="w-full bg-slate-50 text-sm text-slate-900 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Priority</label>
              <select
                name="priority"
                value={formData.priority || "Medium"}
                onChange={handleChange}
                className="w-full bg-slate-50 text-sm text-slate-900 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Report Language</label>
              <select
                name="reportLanguage"
                value={formData.reportLanguage || "English"}
                onChange={handleChange}
                className="w-full bg-slate-50 text-sm text-slate-900 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi / हिन्दी</option>
                <option value="Sanskrit">Sanskrit / संस्कृतम्</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Consultant</p>
            <p className="text-sm text-slate-900 font-medium">{client.assignedConsultant || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
            <p className="text-sm font-medium">
              <span className={`px-2 py-0.5 rounded text-xs ${
                client.status === "Active" ? "bg-emerald-100 text-emerald-800" :
                client.status === "Pending" ? "bg-amber-100 text-amber-800" :
                "bg-slate-100 text-slate-800"
              }`}>
                {client.status || "Active"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</p>
            <p className="text-sm font-medium">
              <span className={`px-2 py-0.5 rounded text-xs ${
                client.priority === "High" ? "bg-rose-100 text-rose-800" :
                client.priority === "Medium" ? "bg-amber-100 text-amber-800" :
                "bg-slate-100 text-slate-800"
              }`}>
                {client.priority || "Medium"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Report Language</p>
            <p className="text-sm text-slate-900 font-medium">{client.reportLanguage || "English"}</p>
          </div>
        </div>
      )}
    </div>
  );
};
