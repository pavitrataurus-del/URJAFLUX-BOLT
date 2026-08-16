import React, { createContext, useContext, useState, useEffect } from "react";
import { Client, Property, ProjectReport } from "../../types/app";
import { getClients, addClient, updateClient, deleteClient } from "../../services/clientService";
import { getProperties, addProperty, updateProperty, deleteProperty } from "../../services/propertyService";
import { ReportRepository } from "../../repositories/reportRepository";

export interface ClientContextType {
  clients: Client[];
  properties: Property[];
  reports: ProjectReport[];
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
  activeClient: Client | null;
  activeClientProperties: Property[];
  activeClientReports: ProjectReport[];
  addClient: (clientData: Omit<Client, "id" | "joinedDate">) => Promise<Client>;
  updateClient: (updatedClient: Client) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  addProperty: (propertyData: Omit<Property, "id">) => Promise<Property>;
  updateProperty: (updatedProperty: Property) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{
  children: React.ReactNode;
  initialClients?: Client[];
  initialProperties?: Property[];
  initialReports?: ProjectReport[];
  onClientsChange?: (clients: Client[]) => void;
  onPropertiesChange?: (properties: Property[]) => void;
  onReportsChange?: (reports: ProjectReport[]) => void;
}> = ({ 
  children, 
  initialClients, 
  initialProperties, 
  initialReports,
  onClientsChange,
  onPropertiesChange,
  onReportsChange
}) => {
  const [clients, setClients] = useState<Client[]>(initialClients || []);
  const [properties, setProperties] = useState<Property[]>(initialProperties || []);
  const [reports, setReports] = useState<ProjectReport[]>(initialReports || []);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const [allClients, allProperties, allReports] = await Promise.all([
        getClients(),
        getProperties(),
        ReportRepository.getReports()
      ]);
      setClients(allClients);
      setProperties(allProperties);
      setReports(allReports);
      
      if (onClientsChange) onClientsChange(allClients);
      if (onPropertiesChange) onPropertiesChange(allProperties);
      if (onReportsChange) onReportsChange(allReports);
    } catch (err) {
      console.error("[UCMS] Error refreshing data:", err);
    }
  };

  // Sync with props if they change externally
  useEffect(() => {
    if (initialClients) setClients(initialClients);
  }, [initialClients]);

  useEffect(() => {
    if (initialProperties) setProperties(initialProperties);
  }, [initialProperties]);

  useEffect(() => {
    if (initialReports) setReports(initialReports);
  }, [initialReports]);

  const handleAddClient = async (clientData: Omit<Client, "id" | "joinedDate">) => {
    const res = await addClient(clientData);
    setClients(prev => {
      const updated = [res, ...prev];
      if (onClientsChange) {
        setTimeout(() => onClientsChange(updated), 0);
      }
      return updated;
    });
    return res;
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    const res = await updateClient(updatedClient);
    setClients(prev => {
      const updated = prev.map(c => c.id === res.id ? res : c);
      if (onClientsChange) {
        setTimeout(() => onClientsChange(updated), 0);
      }
      return updated;
    });
    return res;
  };

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id);
    setClients(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (onClientsChange) {
        setTimeout(() => onClientsChange(updated), 0);
      }
      return updated;
    });
    if (activeClientId === id) {
      setActiveClientId(null);
    }
  };

  const handleAddProperty = async (propertyData: Omit<Property, "id">) => {
    const res = await addProperty(propertyData);
    setProperties(prev => {
      const updated = [res, ...prev];
      if (onPropertiesChange) {
        setTimeout(() => onPropertiesChange(updated), 0);
      }
      return updated;
    });
    return res;
  };

  const handleUpdateProperty = async (updatedProperty: Property) => {
    const res = await updateProperty(updatedProperty);
    setProperties(prev => {
      const updated = prev.map(p => p.id === res.id ? res : p);
      if (onPropertiesChange) {
        setTimeout(() => onPropertiesChange(updated), 0);
      }
      return updated;
    });
    return res;
  };

  const handleDeleteProperty = async (id: string) => {
    await deleteProperty(id);
    setProperties(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (onPropertiesChange) {
        setTimeout(() => onPropertiesChange(updated), 0);
      }
      return updated;
    });
  };

  const activeClient = clients.find(c => c.id === activeClientId) || null;
  const activeClientProperties = properties.filter(p => p.clientId === activeClientId);
  const activeClientReports = reports.filter(r => r.clientId === activeClientId);

  return (
    <ClientContext.Provider
      value={{
        clients,
        properties,
        reports,
        activeClientId,
        setActiveClientId,
        activeClient,
        activeClientProperties,
        activeClientReports,
        addClient: handleAddClient,
        updateClient: handleUpdateClient,
        deleteClient: handleDeleteClient,
        addProperty: handleAddProperty,
        updateProperty: handleUpdateProperty,
        deleteProperty: handleDeleteProperty,
        refreshData
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useUCMS = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useUCMS must be used within a ClientProvider");
  }
  return context;
};
