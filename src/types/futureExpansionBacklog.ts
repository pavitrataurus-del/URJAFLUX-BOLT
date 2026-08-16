export type BacklogStatus = "Backlog" | "Planned" | "Future Vision";
export type PriorityLevel = "High" | "Medium" | "Low";

export interface RoadmapItem {
  id: string;
  moduleName: string;
  purpose: string;
  priority: PriorityLevel;
  estimatedFuturePhase: string;
  dependencies: string[];
  currentStatus: BacklogStatus;
  reasonDeferred: string;
}

export const FUTURE_EXPANSION_BACKLOG_ITEMS: RoadmapItem[] = [
  {
    id: "BACKLOG-01",
    moduleName: "Industry Solution Packs Framework",
    purpose: "Multi-tenant solution registration, industry metadata, feature flags, role presets, and module licensing.",
    priority: "Medium",
    estimatedFuturePhase: "Phase 4 - Industry Ecosystem",
    dependencies: ["Core SaaS Engine", "Tenant Identity Engine"],
    currentStatus: "Planned",
    reasonDeferred: "Prioritizing core platform CAD vector engine and multi-tenant performance optimization."
  },
  {
    id: "BACKLOG-02",
    moduleName: "Construction Edition",
    purpose: "Civil engineering site planning, BIM/CAD structural twins, drone inspection workflows, contractor schedules, and OSHA safety compliance.",
    priority: "High",
    estimatedFuturePhase: "Phase 4 - Vertical Solutions",
    dependencies: ["CAD Wall Vector Engine", "Digital Twin Telemetry"],
    currentStatus: "Backlog",
    reasonDeferred: "Deferred to maintain core focus on general CAD digital twin streaming before vertical domain deployment."
  },
  {
    id: "BACKLOG-03",
    moduleName: "Smart City Edition",
    purpose: "Municipal infrastructure digital twins, road asset monitoring, stormwater drainage grids, and emergency response dispatch interfaces.",
    priority: "Medium",
    estimatedFuturePhase: "Phase 5 - Municipal Scale",
    dependencies: ["Esri ArcGIS / Municipal GIS External Gateway", "Global Edge Cloud"],
    currentStatus: "Future Vision",
    reasonDeferred: "Requires external municipal GIS server credentials and live IoT sensor streaming contracts."
  },
  {
    id: "BACKLOG-04",
    moduleName: "Government Edition",
    purpose: "Public utility oversight, municipal asset registration, citizen service dispatch workflows, and compliance reporting.",
    priority: "Low",
    estimatedFuturePhase: "Phase 5 - Public Sector",
    dependencies: ["Smart City GIS", "Identity & Access Control"],
    currentStatus: "Future Vision",
    reasonDeferred: "Awaiting government agency API standardization and public sector security clearance protocols."
  },
  {
    id: "BACKLOG-05",
    moduleName: "Healthcare Edition",
    purpose: "Hospital ward floorplans, ICU cleanroom air pressure zone modeling, biomedical equipment tracking, and emergency route optimization.",
    priority: "Medium",
    estimatedFuturePhase: "Phase 4 - Specialized Facilities",
    dependencies: ["Spatial CAD Engine", "HL7 / FHIR Gateway"],
    currentStatus: "Backlog",
    reasonDeferred: "Deferred until health system HL7/FHIR EHR integration interfaces are provisioned by enterprise customers."
  },
  {
    id: "BACKLOG-06",
    moduleName: "Manufacturing Edition",
    purpose: "Industrial plant floor CAD layouts, robotic assembly line vibration digital twins, OEE analytics, and predictive maintenance dispatch.",
    priority: "High",
    estimatedFuturePhase: "Phase 4 - Industrial OS",
    dependencies: ["Industrial OPC-UA / Modbus SCADA Telemetry", "Autonomous AI OS"],
    currentStatus: "Planned",
    reasonDeferred: "Industrial SCADA hardware connector integration scheduled for post-GA platform sprint."
  },
  {
    id: "BACKLOG-07",
    moduleName: "Energy & Utilities Edition",
    purpose: "400kV substation topology twins, transformer DGA oil temperature modeling, solar/wind yield forecasting, and pipeline leak alerts.",
    priority: "High",
    estimatedFuturePhase: "Phase 4 - Energy Grid",
    dependencies: ["High Voltage SCADA Stream", "NOAA Weather API"],
    currentStatus: "Planned",
    reasonDeferred: "High-voltage grid telemetry testing queued for enterprise pilot phase."
  },
  {
    id: "BACKLOG-08",
    moduleName: "Commercial Real Estate Edition",
    purpose: "Multi-tenant office occupancy heatmaps, BMS HVAC energy efficiency monitoring, and spatial lease management UI.",
    priority: "Medium",
    estimatedFuturePhase: "Phase 4 - CRE Management",
    dependencies: ["Building Management System (BMS)", "Spatial CAD"],
    currentStatus: "Backlog",
    reasonDeferred: "Awaiting integration with commercial BMS and lease database providers (Yardi/RealPage)."
  },
  {
    id: "BACKLOG-09",
    moduleName: "Education Campus Edition",
    purpose: "University master plan digital twins, chemistry lab safety fume hood airflow modeling, and hostel space allocation.",
    priority: "Low",
    estimatedFuturePhase: "Phase 5 - Campus OS",
    dependencies: ["University Timetable System API", "Digital Twin Engine"],
    currentStatus: "Future Vision",
    reasonDeferred: "Deferred to prioritize commercial and industrial high-volume enterprise verticals."
  },
  {
    id: "BACKLOG-10",
    moduleName: "Logistics & Transportation Edition",
    purpose: "Distribution center high-bay spatial twins, loading dock queue optimization, and fleet GPS telematics mapping.",
    priority: "Medium",
    estimatedFuturePhase: "Phase 4 - Supply Chain",
    dependencies: ["Telematics GPS Gateway", "Warehouse Management System"],
    currentStatus: "Backlog",
    reasonDeferred: "Warehouse spatial layout mapping deferred until WMS integration protocol is finalized."
  },
  {
    id: "BACKLOG-11",
    moduleName: "ESG & Sustainability Edition",
    purpose: "Enterprise Scope 1-3 greenhouse gas accounting, LEED/GRESB green building scoring, water recycling, and waste audit workflows.",
    priority: "High",
    estimatedFuturePhase: "Phase 4 - ESG Compliance",
    dependencies: ["EPA eGRID / DEFRA Emission Factor APIs", "Rule Engine"],
    currentStatus: "Planned",
    reasonDeferred: "Requires live environmental emission factor provider API keys for automated carbon calculation."
  }
];
