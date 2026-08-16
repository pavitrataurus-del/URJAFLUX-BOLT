import React from "react";
import { Client, Property, ProjectReport } from "../../types/app";
import { 
  Users, Mail, Phone, Calendar, ArrowRight, Trash2, Check, X, Edit2, 
  Building2, FileText, Briefcase, Award, Languages, ShieldAlert
} from "lucide-react";
import { useTranslation } from "../../localization/hooks/useTranslation";

interface ClientListProps {
  clients: Client[];
  properties: Property[];
  reports: ProjectReport[];
  onSelectClient: (id: string) => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onOpenAddModal: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  properties,
  reports,
  onSelectClient,
  onEditClient,
  onDeleteClient,
  onOpenAddModal
}) => {
  const { t } = useTranslation();
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const getClientPropertiesCount = (clientId: string) => {
    return properties.filter(p => p.clientId === clientId).length;
  };

  const getClientReportsCount = (clientId: string) => {
    return reports.filter(r => r.clientId === clientId).length;
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            {t("client.title") || "CLIENT PROFILE DIRECTORY"} ({clients.length})
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {t("client.subtitle") || "Manage consultant client records, native languages, astro-charts, and dossier assignments."}
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-950/40"
        >
          <span>REGISTER NEW CLIENT</span>
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-white/10">
          <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-medium">No clients match your filter parameters.</p>
          <button
            onClick={onOpenAddModal}
            className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] mt-2 underline"
          >
            Register a new client record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const propCount = getClientPropertiesCount(client.id);
            const reportCount = getClientReportsCount(client.id);
            const firstLetter = client.name ? client.name.charAt(0).toUpperCase() : "?";

            return (
              <div 
                key={client.id}
                className="group p-5 bg-white/45 hover:bg-white border border-slate-200 hover:border-slate-200 rounded-xl transition-all flex flex-col justify-between gap-4 hover:shadow-lg hover:shadow-indigo-950/10"
              >
                {/* Client Avatar, Name & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-900/50 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                      {client.avatarUrl ? (
                        <img 
                          src={client.avatarUrl} 
                          alt={client.name} 
                          className="w-full h-full rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{firstLetter}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                        {client.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                        {client.company || client.occupation || "Independent Client"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                    client.status === "Active" 
                      ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/30"
                      : client.status === "Pending"
                      ? "bg-amber-950/30 text-amber-400 border border-amber-900/30"
                      : "bg-slate-50/30 text-slate-400 border border-slate-200/30"
                  }`}>
                    {client.status}
                  </span>
                </div>

                {/* Body: Contact details & quick descriptors */}
                <div className="space-y-1.5 text-[11px] text-slate-700 border-t border-slate-950 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  {client.language && (
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Languages className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Prefers: {client.language}</span>
                    </div>
                  )}
                </div>

                {/* Stats Portfolio Indicators */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/40 p-2.5 rounded-lg border border-slate-950">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Properties: <strong>{propCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Reports: <strong>{reportCount}</strong></span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-slate-950 pt-3.5 mt-1">
                  {deleteConfirmId === client.id ? (
                    <div className="flex items-center gap-2 px-2 bg-rose-50 border border-rose-200 rounded-lg">
                      <span className="text-[10px] font-bold text-rose-600">CONFIRM?</span>
                      <button onClick={() => { onDeleteClient(client.id); setDeleteConfirmId(null); }} className="p-1 hover:bg-rose-200 rounded text-rose-700">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(null)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectClient(client.id)}
                        title="Edit Profile"
                        className="p-1.5 bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-200 border border-slate-850 rounded cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(client.id)}
                        title="Delete Client"
                        className="p-1.5 bg-slate-50 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-850 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onSelectClient(client.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900/40 text-[10.5px] font-mono font-bold text-emerald-300 hover:text-emerald-200 rounded-lg transition-all cursor-pointer"
                  >
                    <span>OPEN DOSSIER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ClientList;
