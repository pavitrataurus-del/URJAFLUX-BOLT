import React, { useState } from "react";
import { Client, Property, ProjectReport } from "../../types/app";
import { 
  User, LayoutDashboard, Building2, FileText, Clock, Settings, ArrowLeft, Layers, Calendar, ClipboardList, HelpCircle, Globe, Sparkles
} from "lucide-react";
import { ClientProfile } from "./ClientProfile";
import { ClientProperties } from "./ClientProperties";
import { ClientTimeline } from "./ClientTimeline";
import { ClientActivity } from "./ClientActivity";
import { ClientDocuments } from "./ClientDocuments";
import { ClientReports } from "./ClientReports";
import { ClientNotes } from "./ClientNotes";
import { ConsultationDetails } from "./ConsultationDetails";
import { ClientSettings } from "./ClientSettings";
import { UniversalBirthRegistry } from "./birth/UniversalBirthRegistry";
import { UnifiedDashboard } from "../dashboard/UnifiedDashboard";
import ClientWorkflowSummaryCard from "../../components/workflow/ClientWorkflowSummaryCard";

interface ClientDashboardProps {
  client: Client;
  properties: Property[];
  reports: ProjectReport[];
  onBack: () => void;
  onUpdateClient: (updatedClient: Client) => Promise<any>;
  onAddProperty: (propertyData: Omit<Property, "id">) => Promise<Property>;
  onDeleteProperty: (id: string) => Promise<void>;
  onNavigateToReports?: (reportId: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  client,
  properties,
  reports,
  onBack,
  onUpdateClient,
  onAddProperty,
  onDeleteProperty,
  onNavigateToReports
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "birth-registry" | "properties" | "history" | "documents" | "reports" | "notes" | "settings">("overview");
  const [viewingUnified, setViewingUnified] = useState(false);

  // Filter properties and reports specifically owned by this client
  const clientProperties = properties.filter(p => p.clientId === client.id);
  const clientReports = reports.filter(r => r.clientId === client.id);

  // Derive pending tasks and upcoming appointments
  const upcomingFollowUp = client.dob ? "Scheduled Vastu Correction Review" : "No active follow-up logged";
  const preferredLanguage = client.language || "English";


  if (viewingUnified) {
    return (
      <UnifiedDashboard
        client={client}
        properties={properties}
        reports={reports}
        onBack={() => setViewingUnified(false)}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in zoom-in duration-500">
      {/* Back button & Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 sticky top-0 bg-slate-50 z-10 pt-4 -mt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-600" />
              {client.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              CLIENT ID: {client.id.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewingUnified(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-sm transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Unified Dashboard
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <span>REPORT LANGUAGE:</span>
            <span className="text-emerald-600 font-bold">{preferredLanguage.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <ClientProfile client={client} onUpdate={onUpdateClient} />
        <ClientWorkflowSummaryCard clientId={client.id} />
        <UniversalBirthRegistry client={client} properties={properties} onUpdateClient={onUpdateClient} />
        <ClientProperties client={client} properties={clientProperties} onAddProperty={onAddProperty} onDeleteProperty={onDeleteProperty} />
        <ConsultationDetails client={client} onUpdate={onUpdateClient} />
        <ClientActivity client={client} onUpdateClient={onUpdateClient} />
        <ClientDocuments client={client} onUpdateClient={onUpdateClient} />
        <ClientNotes client={client} onUpdateClient={onUpdateClient} />
      </div>
    </div>
  );
};
