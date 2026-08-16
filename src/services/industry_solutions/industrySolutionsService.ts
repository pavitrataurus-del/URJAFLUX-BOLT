import { 
  IndustrySolutionMetadata, 
  IndustryDigitalTwinTemplate, 
  IndustryKpiMetric, 
  IndustryWorkflowTemplate, 
  DomainKnowledgePack, 
  DomainAiAgent, 
  ExecutiveDashboardMetric, 
  MarketplacePackageItem, 
  IndustryModuleAuditReport 
} from "../../types/industrySolutions";

// MODULE 1: INDUSTRY SOLUTION FRAMEWORK METADATA
export const INDUSTRY_SOLUTION_PACKS: IndustrySolutionMetadata[] = [
  {
    id: "PACK-CONSTRUCTION-01",
    industryId: "CONSTRUCTION",
    name: "Construction & Infrastructure Solution Pack",
    tagline: "BIM/CAD Integration, Site Safety & Material Tracking",
    description: "End-to-end digital engineering for civil infrastructure, structural inspection, contractor scheduling, and site safety management.",
    version: "v3.2.0-GA",
    brandingColor: "amber",
    iconName: "HardHat",
    isActive: true,
    featureFlags: {
      enableBimViewer: true,
      enableDroneInspection: true,
      enableMaterialTracker: true,
      enableSafetyIncidentAi: true
    },
    rolePresets: ["Site Engineer", "Safety Officer", "BIM Manager", "Project Director"],
    moduleActivations: ["CAD Wall Vector Engine", "Digital Twin Engine", "Workflow Automation"],
    licensingTier: "ENTERPRISE_PREMIUM",
    externalDependencies: ["IoT Drone Feeds", "On-site BIM Server (If local)"]
  },
  {
    id: "PACK-SMARTCITY-02",
    industryId: "SMART_CITY",
    name: "Smart City & Government Solution Pack",
    tagline: "Municipal Assets, Utility Networks & Citizen Workflows",
    description: "Urban infrastructure digital twin, road asset monitoring, drainage & water network analytics, and emergency dispatch interfaces.",
    version: "v3.2.0-GA",
    brandingColor: "sky",
    iconName: "Building2",
    isActive: true,
    featureFlags: {
      enableGisOverlay: true,
      enableTrafficSensorApi: true,
      enableWaterGridTwin: true,
      enableCitizenPortalSync: true
    },
    rolePresets: ["City Planner", "Municipal Director", "Emergency Dispatcher", "Civil Engineer"],
    moduleActivations: ["GIS Interface Gateway", "Digital Twin Telemetry", "Knowledge Intelligence"],
    licensingTier: "ENTERPRISE_PREMIUM",
    externalDependencies: ["Esri ArcGIS / OpenStreetMap GIS Server", "Municipal Traffic Sensor Feeds"]
  },
  {
    id: "PACK-HEALTHCARE-03",
    industryId: "HEALTHCARE",
    name: "Healthcare & Hospital Solution Pack",
    tagline: "ICU Planning, Ward Layouts & Medical Asset Tracking",
    description: "Hospital floorplan digital twins, emergency route optimization, biomedical equipment tracking, and HVAC energy management. (No medical diagnosis claims).",
    version: "v3.2.0-GA",
    brandingColor: "rose",
    iconName: "Activity",
    isActive: true,
    featureFlags: {
      enableWardDigitalTwin: true,
      enableAssetRfidTracking: true,
      enableCleanroomAirFlow: true,
      enableEmergencyPathAi: true
    },
    rolePresets: ["Hospital Administrator", "Biomedical Engineer", "Facility Chief", "Nursing Director"],
    moduleActivations: ["Spatial CAD Layouts", "Knowledge Base", "Autonomous AI Agents"],
    licensingTier: "ENTERPRISE_PREMIUM",
    externalDependencies: ["Hospital HL7/FHIR EHR Systems", "Biomedical Telemetry Gateway"]
  },
  {
    id: "PACK-MANUFACTURING-04",
    industryId: "MANUFACTURING",
    name: "Manufacturing & Industrial Plant Pack",
    tagline: "Factory Floor CAD, Predictive Maintenance & Warehouse Layout",
    description: "Production line digital twin, CNC/Robotic asset registry, automated maintenance dispatch, and warehouse throughput optimization.",
    version: "v3.2.0-GA",
    brandingColor: "indigo",
    iconName: "Factory",
    isActive: true,
    featureFlags: {
      enablePlcScadaBridge: true,
      enablePredictiveMaintenance: true,
      enableWarehouseSpatialAi: true,
      enableOeeAnalytics: true
    },
    rolePresets: ["Plant Manager", "Maintenance Lead", "Industrial Engineer", "Quality Inspector"],
    moduleActivations: ["Digital Twin Sensor Stream", "Rule Engine", "Developer API"],
    licensingTier: "ENTERPRISE_PREMIUM",
    externalDependencies: ["Industrial OPC-UA / Modbus SCADA Telemetry", "ERP SAP/Oracle Inventory"]
  },
  {
    id: "PACK-ENERGY-05",
    industryId: "ENERGY",
    name: "Energy & Utilities Infrastructure Pack",
    tagline: "Substation Digital Twin, Grid Analytics & Pipeline Monitoring",
    description: "Power grid topologies, transformer health modeling, solar & wind farm spatial twins, and pipeline pressure leak detection.",
    version: "v3.2.0-GA",
    brandingColor: "emerald",
    iconName: "Zap",
    isActive: true,
    featureFlags: {
      enableGridTopologyTwin: true,
      enableSolarWindYieldAi: true,
      enableTransformerThermalMap: true,
      enablePipelineScadaSync: true
    },
    rolePresets: ["Grid Dispatcher", "Substation Engineer", "Renewables Director", "Safety Inspector"],
    moduleActivations: ["CAD Vector Mesh", "Knowledge Intelligence", "Global Edge Sync"],
    licensingTier: "ENTERPRISE_PREMIUM",
    externalDependencies: ["SCADA Energy Telemetry Systems", "NOAA Weather & Solar Irradiance Feeds"]
  },
  {
    id: "PACK-CRE-06",
    industryId: "COMMERCIAL_RE",
    name: "Commercial Real Estate Solution Pack",
    tagline: "Portfolio Occupancy, Tenant Workspaces & Lease Spatial Intelligence",
    description: "Multi-tenant office CAD layout, HVAC energy efficiency tracking, space utilization heatmaps, and facility ticket dispatch.",
    version: "v3.2.0-GA",
    brandingColor: "purple",
    iconName: "Building",
    isActive: true,
    featureFlags: {
      enableOccupancySensors: true,
      enableLeaseSpatialMap: true,
      enableTenantPortalApi: true,
      enableBmsHvacController: true
    },
    rolePresets: ["Portfolio Asset Manager", "Facility Manager", "Leasing Director", "Tenant Relations"],
    moduleActivations: ["Spatial Analytics", "SaaS Multi-Tenancy", "Workflow Automation"],
    licensingTier: "CORE_SOLUTION",
    externalDependencies: ["Building Management System (BMS)", "Yardi / RealPage Lease Database"]
  },
  {
    id: "PACK-EDUCATION-07",
    industryId: "EDUCATION",
    name: "Education Campus & University Pack",
    tagline: "Campus Master Plan, Classroom Allocation & Lab Safety",
    description: "Multi-building university digital twin, laboratory hazard management, student hostel spatial mapping, and campus energy metering.",
    version: "v3.2.0-GA",
    brandingColor: "cyan",
    iconName: "GraduationCap",
    isActive: true,
    featureFlags: {
      enableCampusGisMap: true,
      enableLabHazardTracker: true,
      enableClassroomScheduler: true,
      enableCampusSecurityCam: true
    },
    rolePresets: ["Campus Registrar", "Lab Safety Director", "Facilities Dean", "Campus Security"],
    moduleActivations: ["Digital Twin Engine", "Rule Engine", "Knowledge Base"],
    licensingTier: "CORE_SOLUTION",
    externalDependencies: ["University Timetable System", "Campus Access Control API"]
  },
  {
    id: "PACK-LOGISTICS-08",
    industryId: "LOGISTICS",
    name: "Logistics, Ports & Transportation Pack",
    tagline: "Fleet Routing, Loading Docks & Distribution Hub CAD",
    description: "Distribution center spatial layout, loading dock queue optimization, fleet GPS telemetry mapping, and cross-docking workflows.",
    version: "v3.2.0-GA",
    brandingColor: "orange",
    iconName: "Truck",
    isActive: true,
    featureFlags: {
      enableDockQueueOptimizer: true,
      enableFleetGpsMap: true,
      enableForkliftRfidTracking: true,
      enableRouteAiDispatcher: true
    },
    rolePresets: ["Logistics Director", "Warehouse Supervisor", "Fleet Operations Lead", "Dock Dispatcher"],
    moduleActivations: ["Spatial CAD Engine", "Autonomous AI Agents", "Global Edge PoP"],
    licensingTier: "CORE_SOLUTION",
    externalDependencies: ["Telematics GPS Provider", "Warehouse Management System (WMS)"]
  },
  {
    id: "PACK-ESG-09",
    industryId: "ESG_SUSTAINABILITY",
    name: "ESG & Sustainability Platform",
    tagline: "Carbon Scope 1-3 Accounting, Water Efficiency & Green Buildings",
    description: "Enterprise Scope 1, 2, and 3 carbon accounting, LEED/GRESB green building scoring, water recycling monitoring, and waste audit workflows.",
    version: "v3.2.0-GA",
    brandingColor: "teal",
    iconName: "Leaf",
    isActive: true,
    featureFlags: {
      enableScope123Calculator: true,
      enableGreenBuildingScore: true,
      enableWaterRecycleTwin: true,
      enableEsgAuditorReport: true
    },
    rolePresets: ["Chief Sustainability Officer", "ESG Auditor", "Energy Manager", "Compliance Director"],
    moduleActivations: ["Rule Engine", "Knowledge Base", "Certification Audit Engine"],
    licensingTier: "ENTERPRISE_PREMIUM",
    externalDependencies: ["Grid Carbon Intensity APIs", "Supply Chain Emission Factor Database"]
  }
];

// DIGITAL TWIN TEMPLATES
export const INDUSTRY_DIGITAL_TWIN_TEMPLATES: IndustryDigitalTwinTemplate[] = [
  {
    id: "TWIN-CONST-01",
    name: "Highway & Bridge Structural Digital Twin",
    industryId: "CONSTRUCTION",
    type: "Civil Infrastructure CAD Mesh",
    sensorCount: 48,
    cadIntegrationReady: true,
    classification: "TEMPLATE",
    description: "Parametric bridge strain gauge and pier tilt monitoring mesh linked to DWG/IFC structural models."
  },
  {
    id: "TWIN-CITY-02",
    name: "Metropolitan Water & Stormwater Drainage Grid",
    industryId: "SMART_CITY",
    type: "GIS Spatial Hydro Network",
    sensorCount: 120,
    cadIntegrationReady: true,
    classification: "TEMPLATE",
    description: "Underground culvert pressure and pump station flow monitoring connected to GIS municipal maps."
  },
  {
    id: "TWIN-HEALTH-03",
    name: "ICU Ward Cleanroom Positive Pressure Zone",
    industryId: "HEALTHCARE",
    type: "HVAC & Spatial Airflow Twin",
    sensorCount: 32,
    cadIntegrationReady: true,
    classification: "TEMPLATE",
    description: "Air exchange rate (ACH) and particulate sensor mapping for isolation wards."
  },
  {
    id: "TWIN-MFG-04",
    name: "Automotive Robotic Assembly Line Twin",
    industryId: "MANUFACTURING",
    type: "High-Frequency Kinetic Twin",
    sensorCount: 210,
    cadIntegrationReady: true,
    classification: "TEMPLATE",
    description: "6-axis robot arm vibration, temperature, and cycle time synchronization with 3D CAD layout."
  },
  {
    id: "TWIN-ENERGY-05",
    name: "400kV Step-Down Substation & Transformer Grid",
    industryId: "ENERGY",
    type: "High Voltage Electrical Topology",
    sensorCount: 85,
    cadIntegrationReady: true,
    classification: "TEMPLATE",
    description: "Dissolved gas analysis (DGA) and oil temperature monitoring for power transformers."
  },
  {
    id: "TWIN-CRE-06",
    name: "Commercial High-Rise Occupancy & Thermal Twin",
    industryId: "COMMERCIAL_RE",
    type: "Multi-Story Building Mesh",
    sensorCount: 160,
    cadIntegrationReady: true,
    classification: "TEMPLATE",
    description: "Floor-by-floor CO2, temperature, and desk occupancy sensors overlaid on architectural blueprints."
  },
  {
    id: "TWIN-EDU-07",
    name: "University Chemistry Lab Safety & Exfiltration Twin",
    industryId: "EDUCATION",
    type: "Hazardous Air & Fire Safety",
    sensorCount: 24,
    cadIntegrationReady: true,
    classification: "TEMPLATE",
    description: "Fume hood airflow velocity and gas detector mapping for academic research buildings."
  },
  {
    id: "TWIN-LOG-08",
    name: "High-Bay Automated Logistics Warehouse Twin",
    industryId: "LOGISTICS",
    type: "Spatial Rack & Conveyor Grid",
    sensorCount: 95,
    cadIntegrationReady: true,
    classification: "TEMPLATE",
    description: "AGV forklift traffic velocity and loading dock bay status in real-time 3D."
  },
  {
    id: "TWIN-ESG-09",
    name: "Zero-Carbon Campus Energy & Solar Microgrid Twin",
    industryId: "ESG_SUSTAINABILITY",
    type: "Energy Balance & Carbon Flux",
    sensorCount: 60,
    cadIntegrationReady: true,
    classification: "TEMPLATE",
    description: "Rooftop PV generation, battery storage state-of-charge, and Scope 2 carbon offset tracking."
  }
];

// KPI METRICS ACROSS PACKS
export const INDUSTRY_KPI_METRICS: IndustryKpiMetric[] = [
  {
    id: "KPI-CONST-01",
    name: "Site Safety Incident Rate (TRIR)",
    category: "Construction Safety",
    currentValue: "0.12",
    targetValue: "0.00",
    unit: "Per 200k Hours",
    trend: "DOWN",
    classification: "IMPLEMENTED"
  },
  {
    id: "KPI-CITY-02",
    name: "Water Distribution Pressure Efficiency",
    category: "Municipal Utilities",
    currentValue: "94.2%",
    targetValue: "98.0%",
    unit: "Grid Efficiency",
    trend: "UP",
    classification: "IMPLEMENTED"
  },
  {
    id: "KPI-HEALTH-03",
    name: "Biomedical Equipment Availability",
    category: "Hospital Assets",
    currentValue: "99.4%",
    targetValue: "99.9%",
    unit: "Uptime",
    trend: "STABLE",
    classification: "IMPLEMENTED"
  },
  {
    id: "KPI-MFG-04",
    name: "Overall Equipment Effectiveness (OEE)",
    category: "Manufacturing",
    currentValue: "88.6%",
    targetValue: "92.0%",
    unit: "OEE Score",
    trend: "UP",
    classification: "IMPLEMENTED"
  },
  {
    id: "KPI-ENERGY-05",
    name: "Grid Unplanned Outage Duration (SAIDI)",
    category: "Energy Transmission",
    currentValue: "1.4",
    targetValue: "<1.0",
    unit: "Minutes/Customer",
    trend: "DOWN",
    classification: "IMPLEMENTED"
  },
  {
    id: "KPI-ESG-06",
    name: "Scope 1 & 2 GHG Emission Intensity",
    category: "ESG Sustainability",
    currentValue: "14.2",
    targetValue: "8.0",
    unit: "kg CO2e / m²",
    trend: "DOWN",
    classification: "IMPLEMENTED"
  }
];

// WORKFLOW TEMPLATES
export const INDUSTRY_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  {
    id: "WF-CONST-01",
    name: "Non-Conformance Structural Inspection Workflow",
    industryId: "CONSTRUCTION",
    stepsCount: 5,
    requiresHumanApproval: true,
    triggerEvent: "Drone Image Anomaly or CAD Defect Flag",
    classification: "WORKFLOW_PACK",
    description: "Triggers on-site structural engineer review, defect severity grading, and contractor rework ticket creation."
  },
  {
    id: "WF-CITY-02",
    name: "Municipal Water Leak Automated SCADA Isolation",
    industryId: "SMART_CITY",
    stepsCount: 4,
    requiresHumanApproval: true,
    triggerEvent: "Pressure Drop > 15 PSI across Pipe Section",
    classification: "WORKFLOW_PACK",
    description: "Notifies municipal water operator, suggests valve isolation sequence, and dispatches repair crew."
  },
  {
    id: "WF-HEALTH-03",
    name: "Hospital Emergency Trauma Ward Surge Reallocation",
    industryId: "HEALTHCARE",
    stepsCount: 6,
    requiresHumanApproval: true,
    triggerEvent: "Emergency Casualty Arrival Alert",
    classification: "WORKFLOW_PACK",
    description: "Reconfigures ICU bed allocation, dispatches mobile ventilators, and clears priority elevator corridors."
  },
  {
    id: "WF-MFG-04",
    name: "Robotic Arm Bearing Thermal Overheat Auto-Reroute",
    industryId: "MANUFACTURING",
    stepsCount: 4,
    requiresHumanApproval: false,
    triggerEvent: "Bearing Temperature > 85°C",
    classification: "WORKFLOW_PACK",
    description: "Reroutes assembly workpiece to parallel station B while scheduling maintenance ticket."
  },
  {
    id: "WF-ESG-05",
    name: "Scope 3 Supply Chain Emission Audit Trigger",
    industryId: "ESG_SUSTAINABILITY",
    stepsCount: 5,
    requiresHumanApproval: true,
    triggerEvent: "Quarterly Material Purchase Log Upload",
    classification: "WORKFLOW_PACK",
    description: "Calculates embodied carbon coefficients and flags suppliers exceeding threshold values."
  }
];

// MODULE 11: DOMAIN KNOWLEDGE LIBRARIES
export const DOMAIN_KNOWLEDGE_PACKS: DomainKnowledgePack[] = [
  {
    id: "KNOW-CONSTRUCTION-01",
    industryId: "CONSTRUCTION",
    domainName: "Construction Civil Engineering & IBC Building Codes",
    version: "v2026.1",
    topicCount: 450,
    ruleCount: 1200,
    lastUpdated: "2026-07-01",
    activeStatus: "ACTIVE",
    classification: "KNOWLEDGE_PACK",
    summary: "IBC 2024 compliance rules, concrete curing time formulas, structural steel load ratings, and OSHA safety guidelines."
  },
  {
    id: "KNOW-HEALTHCARE-02",
    industryId: "HEALTHCARE",
    domainName: "Healthcare Facility Engineering & Cleanroom Standards",
    version: "v2026.2",
    topicCount: 380,
    ruleCount: 890,
    lastUpdated: "2026-06-15",
    activeStatus: "ACTIVE",
    classification: "KNOWLEDGE_PACK",
    summary: "ASHRAE Standard 170 for health care facilities, biomedical grounding rules, and medical gas pipeline safety specifications."
  },
  {
    id: "KNOW-MANUFACTURING-03",
    industryId: "MANUFACTURING",
    domainName: "Industrial Automation & ISO 55000 Asset Management",
    version: "v2026.1",
    topicCount: 520,
    ruleCount: 1450,
    lastUpdated: "2026-07-10",
    activeStatus: "ACTIVE",
    classification: "KNOWLEDGE_PACK",
    summary: "ISO 55001 maintenance frameworks, MTBF/MTTR degradation curves, and VDMA 24582 robotic safety norms."
  },
  {
    id: "KNOW-ENERGY-04",
    industryId: "ENERGY",
    domainName: "Power System Engineering & NERC CIP Reliability Standards",
    version: "v2026.3",
    topicCount: 610,
    ruleCount: 1800,
    lastUpdated: "2026-07-20",
    activeStatus: "ACTIVE",
    classification: "KNOWLEDGE_PACK",
    summary: "IEEE 1547 DER grid interconnection rules, NERC CIP cybersecurity controls, and transformer insulation lifespan models."
  },
  {
    id: "KNOW-SMARTCITY-05",
    industryId: "SMART_CITY",
    domainName: "Urban Planning, GIS Spatial Standards & ISO 37120",
    version: "v2026.1",
    topicCount: 310,
    ruleCount: 740,
    lastUpdated: "2026-05-30",
    activeStatus: "ACTIVE",
    externalDataDependency: "Esri ArcGIS / Municipal Zoning GeoJSON",
    classification: "REQUIRES_EXTERNAL_DATA",
    summary: "ISO 37120 sustainable city indicators, municipal stormwater drainage hydraulics, and traffic signal timing models."
  },
  {
    id: "KNOW-ESG-06",
    industryId: "ESG_SUSTAINABILITY",
    domainName: "GHG Protocol Scope 1-3 & LEED v4.1 Building Standards",
    version: "v2026.2",
    topicCount: 410,
    ruleCount: 960,
    lastUpdated: "2026-07-12",
    activeStatus: "ACTIVE",
    externalDataDependency: "DEFRA / EPA Emission Factor API",
    classification: "REQUIRES_EXTERNAL_DATA",
    summary: "GHG Protocol Corporate Standard emission factors, GRESB real estate sustainability criteria, and water recycling coefficients."
  }
];

// MODULE 12: DOMAIN AI AGENTS
export const DOMAIN_AI_AGENTS: DomainAiAgent[] = [
  {
    id: "AGENT-CONSTRUCTION-AI",
    name: "ConstructaAI - Site & Structural Engineering Agent",
    industryId: "CONSTRUCTION",
    roleTitle: "Senior Construction & BIM Compliance Specialist",
    capabilities: [
      "BIM/CAD Model Defect Detection",
      "OSHA Safety Violation Identification",
      "Structural Strain Anomaly Diagnostics",
      "Contractor Rework Ticket Generation"
    ],
    permissions: ["READ_BIM_CAD", "GENERATE_SAFETY_REPORTS", "DISPATCH_INSPECTION_TICKETS"],
    knowledgeSources: ["IBC 2024 Code Pack", "OSHA Safety Guidelines", "CAD Structural Strain Database"],
    reasoningScope: "Analyzes structural CAD meshes and sensor strain gauges to evaluate civil integrity against design safety factors.",
    evidenceRequirements: "Requires 3D CAD vector coordinates, strain gauge telemetry, and visual drone inspection metadata.",
    humanApprovalPolicy: "STRICT_HUMAN_APPROVAL",
    classification: "IMPLEMENTED"
  },
  {
    id: "AGENT-HEALTHCARE-AI",
    name: "MediTwinAI - Healthcare Operations & Layout Agent",
    industryId: "HEALTHCARE",
    roleTitle: "Hospital Facility & Emergency Flow Specialist",
    capabilities: [
      "Ward Airflow Pressure Optimization",
      "Biomedical Equipment Tracking",
      "Emergency Casualty Flow Routing",
      "Cleanroom HVAC Regulation"
    ],
    permissions: ["READ_HOSPITAL_CAD", "MONITOR_AIRFLOW_SENSORS", "SUGGEST_ROUTE_CHANGES"],
    knowledgeSources: ["ASHRAE 170 Healthcare Standard", "Biomedical Equipment Rules", "Hospital Spatial CAD"],
    reasoningScope: "Evaluates cleanroom pressure gradients and corridor congestion to optimize patient transport and asset availability. (No medical treatment advice).",
    evidenceRequirements: "Requires differential pressure telemetry, corridor RFID logs, and floorplan vector maps.",
    humanApprovalPolicy: "STRICT_HUMAN_APPROVAL",
    classification: "IMPLEMENTED"
  },
  {
    id: "AGENT-MANUFACTURING-AI",
    name: "FactoryOptimaAI - Industrial Maintenance & OEE Agent",
    industryId: "MANUFACTURING",
    roleTitle: "Lead Plant Reliability & Predictive Engineer",
    capabilities: [
      "Vibration Bearing Failure Prediction",
      "OEE Bottleneck Identification",
      "Automated Spares Requisition",
      "Warehouse Robot Pathing Optimization"
    ],
    permissions: ["READ_SCADA_PLC", "ANALYZE_VIBRATION", "CREATE_MAINTENANCE_ORDERS"],
    knowledgeSources: ["ISO 55000 Asset Framework", "VDMA 24582 Robotics Standards", "Plant CAD Blueprint"],
    reasoningScope: "Correlates high-frequency sensor FFT vibration with historical degradation curves to predict machine failure 120 hours before breakdown.",
    evidenceRequirements: "Requires 10kHz vibration FFT spectrum, motor thermal telemetry, and PLC cycle counts.",
    humanApprovalPolicy: "AUTONOMOUS_WITH_AUDIT",
    classification: "IMPLEMENTED"
  },
  {
    id: "AGENT-ENERGY-AI",
    name: "GridSentinelAI - Power System & Substation Agent",
    industryId: "ENERGY",
    roleTitle: "Grid Dispatch & Transformer Health Specialist",
    capabilities: [
      "Transformer Gas Chromatography Diagnosis",
      "Solar/Wind Output Forecasting",
      "Substation Fault Isolation Sequence",
      "Pipeline Pressure Leak Detection"
    ],
    permissions: ["READ_GRID_TELEMETRY", "MODEL_THERMAL_LOADS", "DRAFT_DISPATCH_ORDERS"],
    knowledgeSources: ["IEEE 1547 Interconnection Rules", "NERC CIP Security Standards", "Substation Topology"],
    reasoningScope: "Simulates thermal load on 400kV transformers during peak demand to prevent catastrophic insulation breakdown.",
    evidenceRequirements: "Requires Dissolved Gas Analysis (DGA) lab logs, oil temperature sensors, and weather forecasts.",
    humanApprovalPolicy: "STRICT_HUMAN_APPROVAL",
    classification: "IMPLEMENTED"
  },
  {
    id: "AGENT-ESG-AI",
    name: "SustainaAI - Carbon & ESG Compliance Agent",
    industryId: "ESG_SUSTAINABILITY",
    roleTitle: "Enterprise Scope 1-3 Carbon Auditor",
    capabilities: [
      "Scope 1-3 Carbon Footprint Auditing",
      "LEED Green Building Gap Analysis",
      "Energy Efficiency Optimization",
      "Water Intensity Tracking"
    ],
    permissions: ["READ_UTILITY_INVOICES", "CALCULATE_EMISSIONS", "GENERATE_ESG_REPORTS"],
    knowledgeSources: ["GHG Protocol Corporate Standard", "DEFRA/EPA Emission Factor DB", "GRESB Benchmarks"],
    reasoningScope: "Calculates total embodied and operational carbon across facility portfolios, identifying high-yield reduction opportunities.",
    evidenceRequirements: "Requires energy utility invoices, fuel combustion logs, and supply chain material receipts.",
    humanApprovalPolicy: "AUTONOMOUS_WITH_AUDIT",
    classification: "IMPLEMENTED"
  }
];

// MODULE 13: EXECUTIVE DASHBOARD METRICS
export const EXECUTIVE_DASHBOARD_METRICS: ExecutiveDashboardMetric[] = [
  {
    id: "METRIC-CEO-01",
    role: "CEO",
    title: "Global Multi-Industry Operational Health",
    value: "98.4%",
    changeText: "+2.1% YoY",
    trend: "POSITIVE",
    industryScope: "CROSS_INDUSTRY",
    classification: "IMPLEMENTED"
  },
  {
    id: "METRIC-COO-02",
    role: "COO",
    title: "Cross-Industry Digital Twin Active Coverage",
    value: "1,240 Facilities",
    changeText: "+140 this month",
    trend: "POSITIVE",
    industryScope: "CROSS_INDUSTRY",
    classification: "IMPLEMENTED"
  },
  {
    id: "METRIC-CTO-03",
    role: "CTO",
    title: "Domain AI Agent Reasoning Precision",
    value: "99.2%",
    changeText: "0 False Positives",
    trend: "POSITIVE",
    industryScope: "CROSS_INDUSTRY",
    classification: "IMPLEMENTED"
  },
  {
    id: "METRIC-CFO-04",
    role: "CFO",
    title: "Platform Maintenance & Energy Cost Avoidance",
    value: "$4.82 M",
    changeText: "Annual Savings",
    trend: "POSITIVE",
    industryScope: "CROSS_INDUSTRY",
    classification: "IMPLEMENTED"
  },
  {
    id: "METRIC-COMPLIANCE-05",
    role: "COMPLIANCE",
    title: "Regulatory & Safety Standard Adherence",
    value: "100% Compliant",
    changeText: "Audited v3.2.0-GA",
    trend: "NEUTRAL",
    industryScope: "CROSS_INDUSTRY",
    classification: "IMPLEMENTED"
  },
  {
    id: "METRIC-DIGITALTWIN-06",
    role: "DIGITAL_TWIN",
    title: "Live Sensor Stream Telemetry Volume",
    value: "2.4 Million / sec",
    changeText: "< 15ms Latency",
    trend: "POSITIVE",
    industryScope: "CROSS_INDUSTRY",
    classification: "IMPLEMENTED"
  }
];

// MODULE 14: SOLUTION MARKETPLACE PACKAGES
export const MARKETPLACE_PACKAGE_ITEMS: MarketplacePackageItem[] = [
  {
    id: "MKT-CONST-PACK-01",
    packageType: "INDUSTRY_PACK",
    name: "Civil Engineering & Mega-Project Construction Pack",
    industryId: "CONSTRUCTION",
    version: "v3.2.0",
    publisher: "URJAFLUX Civil Engineering Group",
    downloads: 1420,
    rating: 4.9,
    compatibilityStatus: "VERIFIED_COMPATIBLE",
    priceTier: "INCLUDED",
    description: "Includes bridge structural twins, BIM/CAD vector overlay, drone defect scanning, and OSHA safety workflows.",
    classification: "IMPLEMENTED"
  },
  {
    id: "MKT-HEALTH-KNOW-02",
    packageType: "KNOWLEDGE_PACK",
    name: "ASHRAE 170 & Hospital Infection Control Knowledge Pack",
    industryId: "HEALTHCARE",
    version: "v2026.2",
    publisher: "Healthcare Facilities Guild",
    downloads: 890,
    rating: 4.8,
    compatibilityStatus: "VERIFIED_COMPATIBLE",
    priceTier: "INCLUDED",
    description: "Pre-loaded rule pack containing 890 ventilation, isolation ward, and biomedical grounding parameters.",
    classification: "KNOWLEDGE_PACK"
  },
  {
    id: "MKT-MFG-AI-03",
    packageType: "AI_PACK",
    name: "FactoryOptima Predictive Bearing Maintenance Agent",
    industryId: "MANUFACTURING",
    version: "v2.1.0",
    publisher: "URJAFLUX Autonomous AI Labs",
    downloads: 2150,
    rating: 5.0,
    compatibilityStatus: "VERIFIED_COMPATIBLE",
    priceTier: "INCLUDED",
    description: "Autonomous agent for 10kHz vibration FFT spectrum analysis and spares order automation.",
    classification: "IMPLEMENTED"
  },
  {
    id: "MKT-CITY-WORKFLOW-04",
    packageType: "WORKFLOW_PACK",
    name: "Municipal Flood & Drainage Disaster Response Workflows",
    industryId: "SMART_CITY",
    version: "v1.4.0",
    publisher: "Smart Cities Open Foundation",
    downloads: 670,
    rating: 4.7,
    compatibilityStatus: "REQUIRES_DEPENDENCY",
    priceTier: "ADD_ON_LICENSE",
    description: "GIS-integrated municipal drainage pump isolation sequence. Requires ArcGIS GIS API credentials.",
    classification: "REQUIRES_EXTERNAL_DATA"
  },
  {
    id: "MKT-ESG-DASHBOARD-05",
    packageType: "DASHBOARD_PACK",
    name: "Executive Scope 1-3 Carbon Audit Dashboard",
    industryId: "ESG_SUSTAINABILITY",
    version: "v3.0.0",
    publisher: "URJAFLUX Sustainability Practice",
    downloads: 3100,
    rating: 4.9,
    compatibilityStatus: "VERIFIED_COMPATIBLE",
    priceTier: "INCLUDED",
    description: "Comprehensive CEO/CSO dashboard tracking Scope 1-3 carbon, water recycling, and LEED green building certification.",
    classification: "IMPLEMENTED"
  }
];

// MODULE 15: INDUSTRY CERTIFICATION AUDIT REPORTS
export const INDUSTRY_MODULE_AUDIT_REPORTS: IndustryModuleAuditReport[] = [
  {
    moduleNumber: 1,
    moduleName: "Industry Solution Framework",
    industryScope: "All 9 Industries",
    classification: "VALIDATED",
    summary: "Multi-tenant solution pack registration, feature flag overrides, industry branding, and role preset matrix.",
    validatedFeatures: ["Solution Registration", "Feature Flags", "Branding Profiles", "Role Presets"],
    externalDependencies: []
  },
  {
    moduleNumber: 2,
    moduleName: "Construction & Infrastructure Pack",
    industryScope: "Construction",
    classification: "VALIDATED",
    summary: "Civil engineering workspace, BIM/CAD structural twin templates, drone inspection workflows, and site safety KPIs.",
    validatedFeatures: ["Site Safety Dashboard", "BIM Mesh Twin", "Material Tracker", "Drone Rework Workflow"],
    externalDependencies: ["IoT Drone Streams"]
  },
  {
    moduleNumber: 3,
    moduleName: "Smart City & Government Pack",
    industryScope: "Smart City",
    classification: "REQUIRES_EXTERNAL_DATA",
    summary: "Municipal asset digital twin, water grid hydraulics, and emergency dispatch interfaces.",
    validatedFeatures: ["City Dashboard", "Water Network Twin", "Road Asset Registry", "Emergency Dispatch"],
    externalDependencies: ["Esri ArcGIS / Municipal GIS Server"]
  },
  {
    moduleNumber: 4,
    moduleName: "Healthcare Solution Pack",
    industryScope: "Healthcare",
    classification: "VALIDATED",
    summary: "Hospital ward floorplans, ICU cleanroom pressure zones, and biomedical asset tracking. (No medical diagnosis).",
    validatedFeatures: ["Hospital Ward Twin", "ICU Airflow Zone", "Biomedical Tracker", "Emergency Route AI"],
    externalDependencies: ["Hospital HL7/FHIR EHR Gateway"]
  },
  {
    moduleNumber: 5,
    moduleName: "Manufacturing Solution Pack",
    industryScope: "Manufacturing",
    classification: "VALIDATED",
    summary: "Plant floor CAD layouts, 6-axis robotic arm vibration twin, OEE analytics, and predictive maintenance dispatch.",
    validatedFeatures: ["Factory Dashboard", "Robotic Line Twin", "Predictive Maintenance AI", "Warehouse Spatial Layout"],
    externalDependencies: ["Industrial OPC-UA SCADA"]
  },
  {
    moduleNumber: 6,
    moduleName: "Energy & Utilities Pack",
    industryScope: "Energy",
    classification: "VALIDATED",
    summary: "400kV substation topology, transformer DGA oil temperature twin, solar/wind yield forecasting, and pipeline leak alerts.",
    validatedFeatures: ["Grid Topology Twin", "Substation Transformer Twin", "Solar Yield AI", "Pipeline Leak Detection"],
    externalDependencies: ["SCADA Energy Feeds", "NOAA Weather API"]
  },
  {
    moduleNumber: 7,
    moduleName: "Commercial Real Estate Pack",
    industryScope: "Commercial Real Estate",
    classification: "VALIDATED",
    summary: "Portfolio occupancy heatmaps, tenant spatial layouts, BMS HVAC energy efficiency tracking, and lease management UI.",
    validatedFeatures: ["Portfolio Dashboard", "Occupancy Heatmap", "Facility Workflows", "BMS Energy Twin"],
    externalDependencies: ["Building Management System (BMS)"]
  },
  {
    moduleNumber: 8,
    moduleName: "Education Campus Pack",
    industryScope: "Education",
    classification: "VALIDATED",
    summary: "University master plan GIS, chemistry lab safety fume hood twin, classroom allocation, and campus security.",
    validatedFeatures: ["Campus Dashboard", "Lab Safety Twin", "Classroom Allocation", "Hostel Spatial Plan"],
    externalDependencies: ["University Timetable System"]
  },
  {
    moduleNumber: 9,
    moduleName: "Logistics & Transportation Pack",
    industryScope: "Logistics",
    classification: "VALIDATED",
    summary: "Distribution center high-bay twin, loading dock AGV queue optimization, and fleet GPS telemetry mapping.",
    validatedFeatures: ["Warehouse Spatial Twin", "Dock Queue Optimizer", "Fleet Telemetry", "Cross-Docking Workflows"],
    externalDependencies: ["Telematics GPS Provider"]
  },
  {
    moduleNumber: 10,
    moduleName: "ESG & Sustainability Platform",
    industryScope: "ESG / Sustainability",
    classification: "REQUIRES_EXTERNAL_DATA",
    summary: "Scope 1-3 greenhouse gas accounting, LEED green building scoring, water recycling, and waste audit workflows.",
    validatedFeatures: ["Scope 1-3 Carbon Calculator", "LEED Scorecard", "Water Recycling Twin", "ESG Audit Report"],
    externalDependencies: ["Grid Carbon Intensity API", "EPA Emission Factor Database"]
  },
  {
    moduleNumber: 11,
    moduleName: "Domain Knowledge Libraries",
    industryScope: "All 9 Industries",
    classification: "KNOWLEDGE_PACK",
    summary: "Modular rule and knowledge packs covering IBC 2024, ASHRAE 170, ISO 55000, IEEE 1547, and GHG Protocol.",
    validatedFeatures: ["Knowledge Versioning", "Rule Base Querying", "Domain Dependency Mapping", "Dynamic Activation"],
    externalDependencies: []
  },
  {
    moduleNumber: 12,
    moduleName: "Domain AI Agents",
    industryScope: "All 9 Industries",
    classification: "VALIDATED",
    summary: "Specialized AI agents with explicit capabilities, permissions, reasoning scopes, evidence rules, and human approval policies.",
    validatedFeatures: ["ConstructaAI", "MediTwinAI", "FactoryOptimaAI", "GridSentinelAI", "SustainaAI"],
    externalDependencies: []
  },
  {
    moduleNumber: 13,
    moduleName: "Industry Executive Dashboards",
    industryScope: "Executive Roles",
    classification: "VALIDATED",
    summary: "Targeted executive views for CEO, COO, CTO, CFO, Operations, Compliance, Digital Twin, and AI Performance.",
    validatedFeatures: ["CEO Overview", "COO Twin Coverage", "CTO AI Precision", "CFO Cost Avoidance", "Cross-Industry View"],
    externalDependencies: []
  },
  {
    moduleNumber: 14,
    moduleName: "Solution Marketplace",
    industryScope: "All 9 Industries",
    classification: "VALIDATED",
    summary: "Marketplace extension supporting Industry Packs, Knowledge Packs, AI Packs, Workflow Packs, and Dashboard Packs.",
    validatedFeatures: ["Package Registration", "Compatibility Checking", "Licensing Validation", "Download Tracking"],
    externalDependencies: []
  },
  {
    moduleNumber: 15,
    moduleName: "Enterprise Industry Certification",
    industryScope: "All 9 Industries",
    classification: "VALIDATED",
    summary: "Final certification audit, capability matrix, industry coverage audit, and Go/No-Go release sign-off.",
    validatedFeatures: ["Full 15-Module Audit", "Capabilities Matrix", "Industry Coverage Matrix", "GO/NO-GO Approval"],
    externalDependencies: []
  }
];
