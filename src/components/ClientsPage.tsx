import React from "react";
import { Client, Property, ProjectReport } from "../types/app";
import { ClientWorkspace } from "../modules/client/ClientWorkspace";

interface ClientsPageProps {
  clients: Client[];
  properties?: Property[];
  reports?: ProjectReport[];
  onClientsChange?: (clients: Client[]) => void;
  onPropertiesChange?: (properties: Property[]) => void;
  onReportsChange?: (reports: ProjectReport[]) => void;
  onNavigateToReports?: (reportId: string) => void;
  startWithAddClient?: boolean;
  clearStartWithAddClient?: () => void;
}

export default function ClientsPage({
  clients,
  properties = [],
  reports = [],
  onClientsChange,
  onPropertiesChange,
  onReportsChange,
  onNavigateToReports,
  startWithAddClient,
  clearStartWithAddClient
}: ClientsPageProps) {
  return (
    <div className="space-y-6">
      {/* UCMS Container */}
      <ClientWorkspace
        initialClients={clients}
        initialProperties={properties}
        initialReports={reports}
        onClientsChange={onClientsChange}
        onPropertiesChange={onPropertiesChange}
        onReportsChange={onReportsChange}
        onNavigateToReports={onNavigateToReports}
        startWithAddClient={startWithAddClient}
        clearStartWithAddClient={clearStartWithAddClient}
      />
    </div>
  );
}
