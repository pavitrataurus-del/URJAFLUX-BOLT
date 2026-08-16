import {
  AnalyticsDataset,
  AnalyticsSnapshot,
  KPI,
  KPIGroup,
  Dashboard,
  DashboardWidget,
  Metric,
  Trend,
  Forecast,
  AlertMetric,
  Insight,
  Dimension,
  Measure,
  BaseAnalyticsEntity
} from "./AnalyticsTypes";

export class AnalyticsEngine {
  private datasets: Map<string, AnalyticsDataset> = new Map();
  private snapshots: AnalyticsSnapshot[] = [];
  private kpis: Map<string, KPI> = new Map();
  private kpiGroups: Map<string, KPIGroup> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private trends: Map<string, Trend> = new Map();
  private forecasts: Map<string, Forecast> = new Map();
  private alertMetrics: Map<string, AlertMetric> = new Map();
  private insights: Insight[] = [];

  constructor() {
    this.initializeEngine();
  }

  private initializeEngine() {
    // Phase 1-2: Setup Warehousing & Dataset Structures
    this.seedDatasets();
    this.seedKpis();
    this.seedDashboards();
    this.generateHistoricalSnapshots();
    this.calculateKPIValues();
    this.performTrendAnalysis();
    this.generateForecasts();
    this.generateAlerts();
    this.generateDecisionInsights();
  }

  private seedDatasets() {
    const domains = [
      { id: "DOMAIN-006", name: "AI Reasoning", measures: ["inferenceTimeMs", "confidenceScore", "recommendationCount"], dims: ["model", "type"] },
      { id: "DOMAIN-007", name: "Project Execution", measures: ["taskCompletionRate", "projectLagDays", "activeProjects"], dims: ["phase", "region"] },
      { id: "DOMAIN-008", name: "Digital Twin", measures: ["sensorValue", "vibrationG", "driftRatio"], dims: ["sensorId", "machineId"] },
      { id: "DOMAIN-009", name: "AI Consultation", measures: ["messageCount", "responseLatencyMs", "sentimentScore"], dims: ["consultant", "clientType"] },
      { id: "DOMAIN-010", name: "Document Intelligence", measures: ["pagesProcessed", "ocrConfidence", "generationTimeMs"], dims: ["docType", "format"] },
      { id: "DOMAIN-011", name: "Spatial CAD", measures: ["pinsCount", "processingTimeMs", "defectRatio"], dims: ["drawingType", "zone"] },
      { id: "DOMAIN-012", name: "Vision AI", measures: ["scanCount", "defectsFound", "modelConfidence"], dims: ["cameraChannel", "resolution"] },
      { id: "DOMAIN-013", name: "Workflow Orchestration", measures: ["workflowRuns", "slaBreaches", "automatedSteps"], dims: ["workflowId", "triggerType"] },
      { id: "DOMAIN-014", name: "Collaboration Hub", measures: ["activeUsers", "chatsExchanged", "reactionsCount"], dims: ["channel", "deviceType"] },
      { id: "DOMAIN-015", name: "API Gateway", measures: ["apiRequests", "rateLimitTrips", "syncTimeMs"], dims: ["consumer", "endpoint"] }
    ];

    domains.forEach((d, idx) => {
      const dataset: AnalyticsDataset = {
        id: `dataset-${d.id.toLowerCase()}`,
        version: 1,
        status: "ACTIVE",
        owner: "Enterprise Admin",
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { domain: d.id },
        tags: ["core", d.id.toLowerCase()],
        name: `${d.name} Analytical Dataset`,
        description: `Time-series and dimensional warehouse dataset for ${d.name} module.`,
        sourceDomain: d.id,
        dimensions: d.dims,
        measures: d.measures,
        recordsCount: 0,
        lastIngestedAt: new Date().toISOString()
      };
      this.datasets.set(dataset.id, dataset);
    });
  }

  private seedKpis() {
    // KPI Groups
    const executiveGroup: KPIGroup = {
      id: "grp-exec",
      version: 1,
      status: "ACTIVE",
      owner: "Executive CFO",
      createdBy: "SYSTEM",
      updatedBy: "SYSTEM",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      tags: ["executive"],
      name: "Executive Performance Core",
      description: "Primary enterprise-wide key performance metrics"
    };
    this.kpiGroups.set(executiveGroup.id, executiveGroup);

    const operationalGroup: KPIGroup = {
      id: "grp-ops",
      version: 1,
      status: "ACTIVE",
      owner: "Operations COO",
      createdBy: "SYSTEM",
      updatedBy: "SYSTEM",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      tags: ["operational"],
      name: "Operational Efficiency Core",
      description: "Sub-system diagnostic and performance key metrics"
    };
    this.kpiGroups.set(operationalGroup.id, operationalGroup);

    // Initial Configurable KPIs
    const initialKpis: Omit<KPI, "version" | "updatedAt" | "status" | "createdAt" | "createdBy" | "updatedBy" | "tags" | "metadata" | "owner">[] = [
      {
        id: "kpi-sla",
        groupId: "grp-exec",
        name: "SLA Compliance Rate",
        description: "Percentage of workflows completed within set SLAs (DOMAIN-013)",
        formulaCode: "(TOTAL_RUNS - BREACHED_RUNS) / TOTAL_RUNS * 100",
        currentValue: 94.2,
        targetValue: 98.0,
        unit: "%",
        trendDirection: "UP",
        statusSeverity: "WARNING",
        dimensionFilters: []
      },
      {
        id: "kpi-vision",
        groupId: "grp-ops",
        name: "Vision Inspection Accuracy",
        description: "Average precision level of neural defect classifiers (DOMAIN-012)",
        formulaCode: "SUM(ACCURACY) / COUNT(SCANS)",
        currentValue: 96.7,
        targetValue: 95.0,
        unit: "%",
        trendDirection: "UP",
        statusSeverity: "OPTIMAL",
        dimensionFilters: []
      },
      {
        id: "kpi-api-health",
        groupId: "grp-ops",
        name: "API Gateway Availability",
        description: "Proportion of requests returning successful status codes (DOMAIN-015)",
        formulaCode: "SUCCESS_REQUESTS / TOTAL_REQUESTS * 100",
        currentValue: 99.98,
        targetValue: 99.9,
        unit: "%",
        trendDirection: "STABLE",
        statusSeverity: "OPTIMAL",
        dimensionFilters: []
      },
      {
        id: "kpi-user-prod",
        groupId: "grp-exec",
        name: "Consultant Workspace Productivity",
        description: "Average number of complete recommendations generated daily per thread (DOMAIN-009)",
        formulaCode: "RECS_CREATED / ACTIVE_THREADS",
        currentValue: 14.5,
        targetValue: 12.0,
        unit: "recs/day",
        trendDirection: "UP",
        statusSeverity: "OPTIMAL",
        dimensionFilters: []
      },
      {
        id: "kpi-spatial-defect",
        groupId: "grp-ops",
        name: "Spatial Layout Defect Densities",
        description: "Vastu coordinate pin warning ratio in current active floor plans (DOMAIN-011)",
        formulaCode: "WARNING_PINS / TOTAL_PINS * 100",
        currentValue: 18.3,
        targetValue: 10.0,
        unit: "%",
        trendDirection: "DOWN",
        statusSeverity: "WARNING",
        dimensionFilters: []
      },
      {
        id: "kpi-collab-velocity",
        groupId: "grp-ops",
        name: "Collaboration Velocity",
        description: "Average speed of thread replies inside active client hub (DOMAIN-014)",
        formulaCode: "SUM(REPLY_TIME) / COUNT(REPLIES)",
        currentValue: 3.2,
        targetValue: 5.0,
        unit: "mins",
        trendDirection: "DOWN", // Down is good here (faster replies)
        statusSeverity: "OPTIMAL",
        dimensionFilters: []
      }
    ];

    initialKpis.forEach((k) => {
      const kpi: KPI = {
        ...k,
        version: 1,
        status: "ACTIVE",
        owner: k.groupId === "grp-exec" ? "Executive Board" : "System Operations",
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        tags: [k.groupId]
      } as KPI;
      this.kpis.set(kpi.id, kpi);
    });
  }

  private seedDashboards() {
    const dashboardTypes: { id: string; name: string; cat: Dashboard["category"] }[] = [
      { id: "dash-exec", name: "Executive Business Intelligence", cat: "EXECUTIVE" },
      { id: "dash-project", name: "Project Portfolio Health", cat: "PROJECT" },
      { id: "dash-ops", name: "Operational Diagnostic Center", cat: "OPERATIONS" },
      { id: "dash-ai", name: "AI Inference & Reasoning Metrics", cat: "AI" },
      { id: "dash-vision", name: "Vision AI Defect Analytics", cat: "VISION" },
      { id: "dash-workflow", name: "Workflow Automations Engine Dashboard", cat: "WORKFLOW" },
      { id: "dash-spatial", name: "CAD Floor Plan Analysis Dashboard", cat: "SPATIAL" },
      { id: "dash-integration", name: "API Gateway & Connector Logs Hub", cat: "INTEGRATION" },
      { id: "dash-collab", name: "Collaboration Engagement Dashboard", cat: "COLLABORATION" }
    ];

    dashboardTypes.forEach((d) => {
      const dashboard: Dashboard = {
        id: d.id,
        version: 1,
        status: "ACTIVE",
        owner: "Enterprise Lead",
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        tags: [d.cat.toLowerCase(), "dashboard"],
        name: d.name,
        description: `Unified operational analytical dashboard presenting ${d.name} views.`,
        category: d.cat,
        widgets: this.getWidgetsForCategory(d.cat),
        isLocked: false
      };
      this.dashboards.set(dashboard.id, dashboard);
    });
  }

  private getWidgetsForCategory(cat: Dashboard["category"]): DashboardWidget[] {
    switch (cat) {
      case "EXECUTIVE":
        return [
          {
            id: "w-exec-1",
            title: "SLA Compliance Over Time",
            type: "LINE",
            kpiId: "kpi-sla",
            chartSettings: { stroke: "#3b82f6", grid: true },
            gridSettings: { w: 6, h: 4, x: 0, y: 0 }
          },
          {
            id: "w-exec-2",
            title: "Executive Priority KPI Statuses",
            type: "GAUGE",
            kpiId: "kpi-sla",
            chartSettings: { innerRadius: 60, outerRadius: 80 },
            gridSettings: { w: 6, h: 4, x: 6, y: 0 }
          },
          {
            id: "w-exec-3",
            title: "Enterprise Process Cost Indicators",
            type: "BAR",
            chartSettings: { fill: "#10b981" },
            gridSettings: { w: 12, h: 4, x: 0, y: 4 }
          }
        ];
      case "OPERATIONS":
        return [
          {
            id: "w-ops-1",
            title: "API Gateway Health Dynamics",
            type: "LINE",
            kpiId: "kpi-api-health",
            chartSettings: { stroke: "#10b981", grid: true },
            gridSettings: { w: 8, h: 4, x: 0, y: 0 }
          },
          {
            id: "w-ops-2",
            title: "Subsystem Status Latencies",
            type: "RADAR",
            chartSettings: { fill: "#8b5cf6" },
            gridSettings: { w: 4, h: 4, x: 8, y: 0 }
          }
        ];
      default:
        // generic layout widgets
        return [
          {
            id: `w-${cat.toLowerCase()}-1`,
            title: `${cat} Core Performance Trends`,
            type: "BAR",
            chartSettings: { fill: "#f59e0b", grid: true },
            gridSettings: { w: 8, h: 4, x: 0, y: 0 }
          },
          {
            id: `w-${cat.toLowerCase()}-2`,
            title: `Capacity & Saturation Ratio`,
            type: "PIE",
            chartSettings: { innerRadius: 40, outerRadius: 70 },
            gridSettings: { w: 4, h: 4, x: 8, y: 0 }
          }
        ];
    }
  }

  private generateHistoricalSnapshots() {
    const snapshotDays = 30;
    const now = new Date();

    // Create 30 days of data for each dataset
    this.datasets.forEach((dataset) => {
      let runCount = 0;
      for (let i = snapshotDays; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
        
        // Setup random but logical measures & dimensions based on domain
        const dims: Dimension[] = dataset.dimensions.map((d) => ({
          name: d,
          value: this.getRandomDimValue(dataset.sourceDomain, d)
        }));

        const measures: Measure[] = dataset.measures.map((m) => ({
          name: m,
          value: this.getRandomMeasureValue(dataset.sourceDomain, m, i),
          unit: this.getMeasureUnit(m)
        }));

        const snapshot: AnalyticsSnapshot = {
          id: `snap-${dataset.sourceDomain.toLowerCase()}-${runCount++}`,
          version: 1,
          status: "ACTIVE",
          owner: "SYSTEM",
          createdBy: "SYSTEM",
          updatedBy: "SYSTEM",
          createdAt: timestamp,
          updatedAt: timestamp,
          metadata: {},
          tags: [dataset.sourceDomain.toLowerCase()],
          datasetId: dataset.id,
          timestamp,
          dimensions: dims,
          measures
        };
        this.snapshots.push(snapshot);
      }
      dataset.recordsCount = runCount;
      dataset.lastIngestedAt = now.toISOString();
    });
  }

  private getRandomDimValue(domain: string, dim: string): string {
    const dicts: Record<string, string[]> = {
      model: ["gemini-3.6-flash", "gemini-3.1-pro-preview", "custom-vaste-fine-tune"],
      type: ["VASTU_ADVICE", "CHAKRA_HEALING", "ASTRO_LALKITAB"],
      phase: ["RECONNAISSANCE", "REMEDIATION_DRAFTING", "CERTIFIED_AUDIT", "COMPLETED"],
      region: ["NORTH_HQ", "EAST_OFFICE", "SOUTH_ZONE", "WEST_DISTRICT"],
      sensorId: ["vibr-node-01", "temp-node-04", "humidity-sensor-09"],
      machineId: ["digital-twin-01", "floor-3-model"],
      consultant: ["Astro_expert_pavitra", "Vastu_shastri_deepak", "Chakra_healer_neha"],
      clientType: ["ENTERPRISE_CORP", "RESIDENTIAL_VIP", "RETAIL_SME"],
      docType: ["VASTU_CAD_AUDIT", "CHAKRA_ANALYSIS_PDF", "ASTROLOGY_CHART_DUMP"],
      format: ["PDF", "JSON", "DOCX"],
      drawingType: ["INDUSTRIAL_WAREHOUSE", "HIGHRISE_RESIDENTIAL", "COMMERCIAL_RETAIL"],
      zone: ["BRAHMSTHAN", "KUBERA_NORTH", "AGNI_SOUTHEAST"],
      cameraChannel: ["DOME_CAM_01", "PAN_TILT_ENTRANCE", "DRONE_SCAN_SWEEP"],
      resolution: ["1080P", "4K_ULTRA"],
      workflowId: ["flow-certified-audit", "flow-real-time-remedy", "flow-daily-report-push"],
      triggerType: ["TIMED_CRON", "WEBHOOK_EVENT", "MANUAL_ACTION"],
      channel: ["#vastu-board", "#remediation-team", "#client-vip-lounge"],
      deviceType: ["DESKTOP_WEB", "MOBILE_IOS", "TABLET_APP"],
      consumer: ["Salesforce_prod", "ArcGIS_sync", "SAP_financial_bridge"],
      endpoint: ["/api/v1/spatial/pins", "/api/v1/vision/crack-analysis", "/graphql"]
    };
    const list = dicts[dim] || ["default-dim"];
    return list[Math.floor(Math.random() * list.length)];
  }

  private getRandomMeasureValue(domain: string, measure: string, dayOffset: number): number {
    // Generate trending values based on dayOffset (to show positive/negative trends)
    const baseProgress = (30 - dayOffset) / 30; // goes from 0 to 1
    
    switch (measure) {
      case "inferenceTimeMs":
        return 180 + Math.random() * 50 - baseProgress * 20; // faster over time
      case "confidenceScore":
        return 0.88 + baseProgress * 0.08 + Math.random() * 0.03; // higher accuracy
      case "recommendationCount":
        return Math.floor(40 + baseProgress * 30 + Math.random() * 10);
      case "taskCompletionRate":
        return 82 + baseProgress * 12 + Math.random() * 4;
      case "projectLagDays":
        return Math.max(1, 12 - baseProgress * 8 - Math.random() * 2);
      case "activeProjects":
        return Math.floor(15 + baseProgress * 10 + Math.sin(dayOffset / 5) * 4);
      case "sensorValue":
        return 22 + Math.random() * 3 + Math.sin(dayOffset / 3);
      case "vibrationG":
        return 0.08 + Math.random() * 0.04 + (dayOffset === 3 ? 0.25 : 0); // spike on dayOffset 3 (anomaly)
      case "driftRatio":
        return 0.01 + Math.random() * 0.005;
      case "messageCount":
        return Math.floor(120 + baseProgress * 150 + Math.random() * 30);
      case "responseLatencyMs":
        return 450 + Math.random() * 100 - baseProgress * 80;
      case "sentimentScore":
        return 0.74 + baseProgress * 0.15 + Math.random() * 0.05;
      case "pagesProcessed":
        return Math.floor(200 + baseProgress * 100 + Math.sin(dayOffset / 2) * 50);
      case "ocrConfidence":
        return 0.93 + baseProgress * 0.04 + Math.random() * 0.01;
      case "generationTimeMs":
        return 1200 + Math.random() * 300 - baseProgress * 400;
      case "pinsCount":
        return Math.floor(80 + baseProgress * 60 + Math.random() * 20);
      case "processingTimeMs":
        return 850 + Math.random() * 150 - baseProgress * 200;
      case "defectRatio":
        return 22 - baseProgress * 8 + Math.random() * 3;
      case "scanCount":
        return Math.floor(30 + baseProgress * 25 + Math.random() * 5);
      case "defectsFound":
        return Math.floor(5 + Math.random() * 8);
      case "modelConfidence":
        return 0.89 + baseProgress * 0.07 + Math.random() * 0.02;
      case "workflowRuns":
        return Math.floor(500 + baseProgress * 300 + Math.random() * 50);
      case "slaBreaches":
        return Math.max(0, Math.floor(18 - baseProgress * 14 - Math.random() * 4));
      case "automatedSteps":
        return Math.floor(1200 + baseProgress * 800 + Math.random() * 100);
      case "activeUsers":
        return Math.floor(45 + baseProgress * 20 + Math.sin(dayOffset / 7) * 5);
      case "chatsExchanged":
        return Math.floor(800 + baseProgress * 600 + Math.random() * 100);
      case "reactionsCount":
        return Math.floor(120 + baseProgress * 200 + Math.random() * 30);
      case "apiRequests":
        return Math.floor(8000 + baseProgress * 12000 + Math.sin(dayOffset) * 2000);
      case "rateLimitTrips":
        return Math.floor(Math.max(0, 15 - baseProgress * 12 + Math.random() * 3));
      case "syncTimeMs":
        return 340 + Math.random() * 80 - baseProgress * 60;
      default:
        return 50 + Math.random() * 50;
    }
  }

  private getMeasureUnit(m: string): string {
    if (m.endsWith("Ms")) return "ms";
    if (m.endsWith("Rate") || m.endsWith("Ratio") || m.endsWith("Score") || m.endsWith("Confidence")) return "%";
    if (m.endsWith("Count") || m.endsWith("Runs") || m.endsWith("Trips") || m.endsWith("Steps")) return "units";
    if (m === "vibrationG") return "G";
    return "";
  }

  private calculateKPIValues() {
    // Under static setup, we fetch calculations dynamically based on warehouse averages
    this.kpis.forEach((kpi) => {
      if (kpi.id === "kpi-sla") {
        const snaps = this.snapshots.filter((s) => s.datasetId === "dataset-domain-013");
        const totalRuns = snaps.reduce((acc, s) => acc + (s.measures.find((m) => m.name === "workflowRuns")?.value || 0), 0);
        const breached = snaps.reduce((acc, s) => acc + (s.measures.find((m) => m.name === "slaBreaches")?.value || 0), 0);
        kpi.currentValue = Number(((totalRuns - breached) / totalRuns * 100).toFixed(2));
        kpi.trendDirection = "UP";
        kpi.statusSeverity = kpi.currentValue >= kpi.targetValue ? "OPTIMAL" : "WARNING";
      } else if (kpi.id === "kpi-vision") {
        const snaps = this.snapshots.filter((s) => s.datasetId === "dataset-domain-012");
        const sumConfidence = snaps.reduce((acc, s) => acc + (s.measures.find((m) => m.name === "modelConfidence")?.value || 0), 0);
        kpi.currentValue = Number(((sumConfidence / snaps.length) * 100).toFixed(2));
        kpi.trendDirection = "UP";
        kpi.statusSeverity = "OPTIMAL";
      } else if (kpi.id === "kpi-api-health") {
        const snaps = this.snapshots.filter((s) => s.datasetId === "dataset-domain-015");
        const limitTrips = snaps.reduce((acc, s) => acc + (s.measures.find((m) => m.name === "rateLimitTrips")?.value || 0), 0);
        const totalRequests = snaps.reduce((acc, s) => acc + (s.measures.find((m) => m.name === "apiRequests")?.value || 0), 0);
        kpi.currentValue = Number(((totalRequests - limitTrips) / totalRequests * 100).toFixed(3));
        kpi.statusSeverity = "OPTIMAL";
      } else if (kpi.id === "kpi-spatial-defect") {
        const snaps = this.snapshots.filter((s) => s.datasetId === "dataset-domain-011");
        const total = snaps.reduce((acc, s) => acc + (s.measures.find((m) => m.name === "pinsCount")?.value || 0), 0);
        const defectRatio = snaps.reduce((acc, s) => acc + (s.measures.find((m) => m.name === "defectRatio")?.value || 0), 0);
        kpi.currentValue = Number((defectRatio / snaps.length).toFixed(1));
        kpi.statusSeverity = kpi.currentValue <= kpi.targetValue ? "OPTIMAL" : "WARNING";
      }
    });
  }

  private performTrendAnalysis() {
    const analyzedMetrics = [
      { id: "trend-sla", name: "slaBreaches", domain: "dataset-domain-013", label: "SLA Workflow Breaches" },
      { id: "trend-accuracy", name: "modelConfidence", domain: "dataset-domain-012", label: "Vision Defect Neural Confidence" },
      { id: "trend-vibrations", name: "vibrationG", domain: "dataset-domain-008", label: "Digital Twin Shaft Vibrations" },
      { id: "trend-api", name: "apiRequests", domain: "dataset-domain-015", label: "Gateway Traffic Flow" }
    ];

    analyzedMetrics.forEach((m) => {
      const snaps = this.snapshots
        .filter((s) => s.datasetId === m.domain)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const points = snaps.map((s) => ({
        timestamp: s.timestamp.substring(5, 10), // simplify date display e.g. "07-26"
        value: s.measures.find((meas) => meas.name === m.name)?.value || 0
      }));

      // Calculate simple trends & anomaly indices using basic standard deviations
      const values = points.map((p) => p.value);
      const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length);

      const anomalies: number[] = [];
      points.forEach((p, index) => {
        if (Math.abs(p.value - avg) > 1.8 * stdDev) {
          anomalies.push(index);
        }
      });

      const firstVal = values[0] || 1;
      const lastVal = values[values.length - 1] || 1;
      const growthPercentage = Number((((lastVal - firstVal) / firstVal) * 100).toFixed(1));

      const trendObj: Trend = {
        id: m.id,
        version: 1,
        status: "ACTIVE",
        owner: "AI Core Analyst",
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { measureName: m.name },
        tags: ["trend", m.name],
        metricName: m.label,
        historicalPoints: points,
        growthPercentage,
        seasonalityDetected: m.name === "apiRequests" || m.name === "slaBreaches",
        patterns: [
          m.name === "apiRequests" ? "Slight weekday traffic load elevation of ~25%" : "Weekly periodic behavior detected",
          m.name === "vibrationG" ? "Transient micro-spikes observed during shift changes" : "Stable distribution"
        ],
        anomalyIndices: anomalies
      };
      this.trends.set(trendObj.id, trendObj);
    });
  }

  private generateForecasts() {
    const forecastedMetrics = [
      { id: "fc-sla", name: "slaBreaches", domain: "dataset-domain-013", label: "SLA Workflow Breaches", base: 1.5, dir: -0.05 },
      { id: "fc-traffic", name: "apiRequests", domain: "dataset-domain-015", label: "Gateway Traffic Flow", base: 18000, dir: 150 },
      { id: "fc-pins", name: "pinsCount", domain: "dataset-domain-011", label: "CAD Zone Coordinates", base: 130, dir: 1.2 }
    ];

    forecastedMetrics.forEach((m) => {
      const forecastPoints: { timestamp: string; value: number; confidenceMin: number; confidenceMax: number }[] = [];
      const now = new Date();

      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const projectionValue = Math.max(0, m.base + m.dir * i + (Math.sin(i) * (m.base * 0.05)));
        const confidenceBand = projectionValue * 0.08 * i; // error expands into the future

        forecastPoints.push({
          timestamp: nextDate.toISOString().substring(5, 10),
          value: Number(projectionValue.toFixed(1)),
          confidenceMin: Number((projectionValue - confidenceBand).toFixed(1)),
          confidenceMax: Number((projectionValue + confidenceBand).toFixed(1))
        });
      }

      const forecastObj: Forecast = {
        id: m.id,
        version: 1,
        status: "ACTIVE",
        owner: "Predictive Analytics Agent",
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        tags: ["forecast", m.name],
        metricName: m.label,
        forecastPoints,
        modelType: "EXPONENTIAL_SMOOTHING",
        horizonDays: 7,
        accuracyConfidenceScore: Number((0.87 + Math.random() * 0.08).toFixed(2))
      };
      this.forecasts.set(forecastObj.id, forecastObj);
    });
  }

  private generateAlerts() {
    const alertConfigs = [
      { id: "al-1", name: "vibrationG", val: 0.28, thresh: 0.20, cond: "THRESHOLD_GREATER" as const, msg: "Industrial Shaft vibration exceeded safety threshold of 0.20G!" },
      { id: "al-2", name: "slaBreaches", val: 12, thresh: 10, cond: "THRESHOLD_GREATER" as const, msg: "SLA Breaches reached peak critical limit of 10 within an hour." },
      { id: "al-3", name: "ocrConfidence", val: 89.2, thresh: 90.0, cond: "THRESHOLD_LESS" as const, msg: "OCR Document confidence dropped below operational standard of 90%." }
    ];

    alertConfigs.forEach((cfg) => {
      const alert: AlertMetric = {
        id: cfg.id,
        version: 1,
        status: "TRIGGERED",
        owner: "Unified Incident Gatekeeper",
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        tags: ["alert", cfg.name],
        metricName: cfg.name,
        conditionType: cfg.cond,
        thresholdValue: cfg.thresh,
        currentValue: cfg.val,
        message: cfg.msg,
        workflowTriggered: true
      };
      this.alertMetrics.set(alert.id, alert);
    });
  }

  private generateDecisionInsights() {
    const sampleInsights: Insight[] = [
      {
        id: "ins-1",
        version: 1,
        status: "ACTIVE",
        owner: "Decision Analytics",
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        tags: ["decision", "risk"],
        title: "SLA Operational Bottleneck Risk Detected",
        description: "Correlation tracking indicates that high SLA breaches are strongly aligned with residential client peaks between 14:00 and 17:00. Allocating additional backup reasoning workers during these slots reduces latencies by 28%.",
        type: "RISK",
        confidenceScore: 0.91,
        impactLevel: "HIGH",
        relatedKpiIds: ["kpi-sla"],
        evidenceMetrics: [
          { name: "SLA Breach Rate", value: 5.8, timestamp: new Date().toISOString() },
          { name: "Active Threads", value: 34, timestamp: new Date().toISOString() }
        ]
      },
      {
        id: "ins-2",
        version: 1,
        status: "ACTIVE",
        owner: "Decision Analytics",
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        tags: ["decision", "opportunity"],
        title: "Optimize Space Ingest Processing",
        description: "Spatial drawing processing durations have improved by 18% over the past 3 weeks due to caching of foundational zone elements inside Kubera quadrant blocks. There is an opportunity to expand this cache to secondary Agni layouts.",
        type: "OPPORTUNITY",
        confidenceScore: 0.85,
        impactLevel: "MEDIUM",
        relatedKpiIds: ["kpi-spatial-defect"],
        evidenceMetrics: [
          { name: "CAD Ingestion Duration", value: 650, timestamp: new Date().toISOString() },
          { name: "Cached Zone hits", value: 72, timestamp: new Date().toISOString() }
        ]
      },
      {
        id: "ins-3",
        version: 1,
        status: "ACTIVE",
        owner: "Decision Analytics",
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        tags: ["decision", "cost"],
        title: "API Ingestion Capacity Buffer Excess",
        description: "API consumer pipelines operate under a peak request volume that utilizes only 42% of allocated rate limits. Consolidating standard tier connection clusters reduces server overhead with no impact to transactional latencies.",
        type: "COST",
        confidenceScore: 0.94,
        impactLevel: "LOW",
        relatedKpiIds: ["kpi-api-health"],
        evidenceMetrics: [
          { name: "Average Rate limit Utilization", value: 42, timestamp: new Date().toISOString() },
          { name: "Active Consumer Keys", value: 12, timestamp: new Date().toISOString() }
        ]
      }
    ];
    this.insights = sampleInsights;
  }

  // --- Public Read-Only Interface & Queries ---
  public getDatasets(): AnalyticsDataset[] {
    return Array.from(this.datasets.values());
  }

  public getSnapshots(datasetId?: string): AnalyticsSnapshot[] {
    if (datasetId) {
      return this.snapshots.filter((s) => s.datasetId === datasetId);
    }
    return this.snapshots;
  }

  public getKPIs(): KPI[] {
    return Array.from(this.kpis.values());
  }

  public getKPIGroups(): KPIGroup[] {
    return Array.from(this.kpiGroups.values());
  }

  public getDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  public getTrends(): Trend[] {
    return Array.from(this.trends.values());
  }

  public getForecasts(): Forecast[] {
    return Array.from(this.forecasts.values());
  }

  public getAlertMetrics(): AlertMetric[] {
    return Array.from(this.alertMetrics.values());
  }

  public getInsights(): Insight[] {
    return this.insights;
  }

  // Configuration updates for widgets or custom KPIs (Analytics must never modify core system/domain files, just local layout metadata)
  public createCustomKPI(kpiData: Omit<KPI, "id" | "createdAt" | "updatedAt" | "version" | "status" | "createdBy" | "updatedBy" | "tags" | "metadata" | "owner">): KPI {
    const kpi: KPI = {
      ...kpiData,
      id: `kpi-custom-${Date.now()}`,
      version: 1,
      status: "ACTIVE",
      owner: "Custom Analyst",
      createdBy: "ANALYST_USER",
      updatedBy: "ANALYST_USER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      tags: ["custom"]
    };
    this.kpis.set(kpi.id, kpi);
    return kpi;
  }

  public updateDashboardWidgets(dashboardId: string, widgets: DashboardWidget[]): boolean {
    const dash = this.dashboards.get(dashboardId);
    if (dash && !dash.isLocked) {
      dash.widgets = widgets;
      dash.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public triggerManualSync(): { success: boolean; snapshotCount: number; timestamp: string } {
    // Force rebuild of operational points (simulating background data aggregation)
    this.snapshots = [];
    this.generateHistoricalSnapshots();
    this.calculateKPIValues();
    this.performTrendAnalysis();
    this.generateForecasts();
    return {
      success: true,
      snapshotCount: this.snapshots.length,
      timestamp: new Date().toISOString()
    };
  }
}
