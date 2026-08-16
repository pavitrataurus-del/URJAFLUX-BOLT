import React, { useState } from "react";
import { User, Phone, Mail, MapPin, Building, Briefcase, Edit2, Check } from "lucide-react";
import { Client } from "../../types/app";

interface ClientInformationPanelProps {
  client: Client | null;
  clientsList?: Client[];
  onClientChange?: (updated: Client) => void;
  onSelectClient?: (clientId: string) => void;
}

export default function ClientInformationPanel({
  client,
  clientsList = [],
  onClientChange,
  onSelectClient
}: ClientInformationPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(client);

  React.useEffect(() => {
    setEditedClient(client);
  }, [client]);

  if (!editedClient) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
        <User className="w-10 h-10 text-slate-600 mb-2" />
        <p className="text-xs text-slate-400">No client context active.</p>
        {clientsList.length > 0 && onSelectClient && (
          <div className="mt-3 w-full">
            <select
              onChange={(e) => onSelectClient(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Select Client --</option>
              {clientsList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  const handleSave = () => {
    if (editedClient && onClientChange) {
      onClientChange(editedClient);
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Client, value: string) => {
    if (editedClient) {
      setEditedClient({
        ...editedClient,
        [field]: value
      });
    }
  };

  return (
    <div className="bg-white/60 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full space-y-3 shadow-lg hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Client Intake</h3>
            <p className="text-[10px] text-slate-400 font-mono">Dossier CRM Context</p>
          </div>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="p-1 bg-slate-50 border border-slate-200 hover:border-emerald-500/40 hover:bg-white rounded text-slate-400 hover:text-emerald-400 transition-all"
        >
          {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {clientsList.length > 1 && onSelectClient && !isEditing && (
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono text-slate-400 uppercase">Switch Dossier Client</label>
          <select
            value={editedClient.id}
            onChange={(e) => onSelectClient(e.target.value)}
            className="w-full bg-slate-50 border border-slate-850 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            {clientsList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2.5 pt-1 overflow-y-auto max-h-[300px]">
        {/* Name */}
        <div>
          <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editedClient.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50/40 px-2.5 py-1.5 rounded border border-slate-850/60 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{editedClient.name}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Phone Number</label>
          {isEditing ? (
            <input
              type="text"
              value={editedClient.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50/40 px-2.5 py-1.5 rounded border border-slate-850/60">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{editedClient.phone || "N/A"}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Email Address</label>
          {isEditing ? (
            <input
              type="email"
              value={editedClient.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50/40 px-2.5 py-1.5 rounded border border-slate-850/60 break-all">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{editedClient.email || "N/A"}</span>
            </div>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Intake Address</label>
          {isEditing ? (
            <textarea
              value={editedClient.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
            />
          ) : (
            <div className="flex gap-2 text-xs text-slate-700 bg-slate-50/40 px-2.5 py-1.5 rounded border border-slate-850/60 items-start">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{editedClient.address || "N/A"}</span>
            </div>
          )}
        </div>

        {/* Double Row: Property Type & Consultation Type */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Property Type</label>
            {isEditing ? (
              <select
                value={editedClient.occupation || "Villa"}
                onChange={(e) => handleInputChange("occupation", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Office">Office</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50/40 px-2.5 py-1.5 rounded border border-slate-850/60">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{editedClient.occupation || "Villa"}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Consult Type</label>
            {isEditing ? (
              <select
                value={editedClient.language || "Vastu"}
                onChange={(e) => handleInputChange("language", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Vastu">Vastu Audit</option>
                <option value="Astro-Vastu">Astro-Vastu</option>
                <option value="Numerology">Numerology</option>
                <option value="Comprehensive">Comprehensive</option>
              </select>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50/40 px-2.5 py-1.5 rounded border border-slate-850/60">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{editedClient.language || "Vastu Audit"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
