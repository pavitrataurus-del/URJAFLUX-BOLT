import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  BarChart3,
  Layers,
  Activity,
  AlertTriangle,
  Brain,
  Cpu,
  Clock,
  Plus,
  RefreshCw,
  Sliders,
  Settings,
  Database,
  Search,
  CheckCircle2,
  Lock,
  Eye,
  Download,
  Info,
  Calendar,
  Filter,
  Trash2,
  Sparkles,
  Play
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { AnalyticsEngine } from "../../core/analytics/AnalyticsEngine";
import { KPI, DashboardWidget, Insight, AnalyticsSnapshot, Dimension, BaseAnalyticsEntity } from "../../core/analytics/AnalyticsTypes";

export function AnalyticsWorkspacePage() {
  const engine = useMemo(() => new AnalyticsEngine(), []);

  // State Management
  const [activeTab, setActiveTab] = useState<
    "executive" | "builder" | "kpis" | "trends" | "forecast" | "warehouse" | "insights" | "admin"
  >("executive");

  const [kpis, setKpis] = useState<KPI[]>(() => engine.getKPIs());
  const [trends, setTrends] = useState(() => engine.getTrends());
  const [forecasts, setForecasts] = useState(() => engine.getForecasts());
  const [alerts, setAlerts] = useState(() => engine.getAlertMetrics());
  const [insights, setInsights] = useState<Insight[]>(() => engine.getInsights());
  const [datasets] = useState(() => engine.getDatasets());
  const [snapshots, setSnapshots] = useState(() => engine.getSnapshots());
  const [dashboards, setDashboards] = useState(() => engine.getDashboards());
  const [selectedDashboardId, setSelectedDashboardId] = useState("dash-exec");

  // Selection state for Drill-down / Explorers
  const [selectedDatasetId, setSelectedDatasetId] = useState("dataset-domain-013");
  const [selectedTrendId, setSelectedTrendId] = useState("trend-sla");
  const [selectedForecastId, setSelectedForecastId] = useState("fc-sla");
  
  // Create KPI form state
  const [showCreateKpi, setShowCreateKpi] = useState(false);
  const [newKpi, setNewKpi] = useState({
    name: "",
    description: "",
    groupId: "grp-ops",
    formulaCode: "",
    targetValue: 90,
    unit: "%"
  });

  // Builder state
  const [selectedWidgetToEdit, setSelectedWidgetToEdit] = useState<string | null>(null);

  // Administration Policy State
  const [retentionPolicy, setRetentionPolicy] = useState("365");
  const [refreshRate, setRefreshRate] = useState("Hourly");
  const [rolePermission, setRolePermission] = useState("Operations Lead");

  const activeDashboard = useMemo(() => {
    return dashboards.find((d) => d.id === selectedDashboardId) || dashboards[0];
  }, [dashboards, selectedDashboardId]);

  // Action Handlers
  const handleTriggerSync = () => {
    const result = engine.triggerManualSync();
    if (result.success) {
      setSnapshots(engine.getSnapshots());
      setKpis(engine.getKPIs());
      setTrends(engine.getTrends());
      setForecasts(engine.getForecasts());
      alert(`Data Warehouse sync executed successfully!\nIngested ${result.snapshotCount} time-series partitions.`);
    }
  };

  const handleCreateKPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKpi.name || !newKpi.formulaCode) return;

    const created = engine.createCustomKPI({
      name: newKpi.name,
      description: newKpi.description,
      groupId: newKpi.groupId,
      formulaCode: newKpi.formulaCode,
      currentValue: Number((Math.random() * 30 + 60).toFixed(1)),
      targetValue: newKpi.targetValue,
      unit: newKpi.unit,
      trendDirection: "UP",
      statusSeverity: "OPTIMAL",
      dimensionFilters: []
    });

    setKpis(engine.getKPIs());
    setShowCreateKpi(false);
    setNewKpi({
      name: "",
      description: "",
      groupId: "grp-ops",
      formulaCode: "",
      targetValue: 90,
      unit: "%"
    });
  };

  const handleUpdateWidgetTitle = (widgetId: string, newTitle: string) => {
    if (!activeDashboard) return;
    const updatedWidgets = activeDashboard.widgets.map((w) =>
      w.id === widgetId ? { ...w, title: newTitle } : w
    );
    engine.updateDashboardWidgets(activeDashboard.id, updatedWidgets);
    setDashboards(engine.getDashboards());
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!activeDashboard) return;
    const updatedWidgets = activeDashboard.widgets.filter((w) => w.id !== widgetId);
    engine.updateDashboardWidgets(activeDashboard.id, updatedWidgets);
    setDashboards(engine.getDashboards());
  };

  const handleAddWidget = (type: DashboardWidget["type"]) => {
    if (!activeDashboard) return;
    const newWidget: DashboardWidget = {
      id: `w-custom-${Date.now()}`,
      title: `Custom ${type} Widget`,
      type,
      chartSettings: { stroke: "#10b981", fill: "#3b82f6", grid: true },
      gridSettings: { w: 4, h: 4, x: 0, y: 0 }
    };
    const updatedWidgets = [...activeDashboard.widgets, newWidget];
    engine.updateDashboardWidgets(activeDashboard.id, updatedWidgets);
    setDashboards(engine.getDashboards());
  };

  // Color matching helpers
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "OPTIMAL":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "WARNING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CRITICAL":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "HIGH":
        return "bg-red-50 text-red-700 border-red-100";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "LOW":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  // Pre-calculated filtered states
  const filteredSnapshots = useMemo(() => {
    return snapshots.filter((s) => s.datasetId === selectedDatasetId);
  }, [snapshots, selectedDatasetId]);

  const currentTrend = useMemo(() => {
    return trends.find((t) => t.id === selectedTrendId);
  }, [trends, selectedTrendId]);

  const currentForecast = useMemo(() => {
    return forecasts.find((f) => f.id === selectedForecastId);
  }, [forecasts, selectedForecastId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Platform Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
              DOMAIN-016
            </span>
            <span className="text-xs font-medium text-slate-400">Enterprise intelligence Layer</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
            URJAFLUX BI & Decision Platform
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Unified data warehousing, metric pipelines, predictive modeling & risk indexing. 
            Consumes cross-domain state telemetry with strict read-only boundary isolation.
          </p>
        </div>
        
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={handleTriggerSync}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Sync Warehouse
          </button>
        </div>
      </div>

      {/* Primary Workspace Navigation Tabs */}
      <div className="flex overflow-x-auto gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 scrollbar-none">
        <button
          onClick={() => setActiveTab("executive")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "executive"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Executive Dashboards
        </button>
        <button
          onClick={() => setActiveTab("builder")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "builder"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Dashboard Builder
        </button>
        <button
          onClick={() => setActiveTab("kpis")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "kpis"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          KPI Explorer
        </button>
        <button
          onClick={() => setActiveTab("trends")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "trends"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trend Analysis
        </button>
        <button
          onClick={() => setActiveTab("forecast")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "forecast"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Clock className="w-4 h-4" />
          Forecast Center
        </button>
        <button
          onClick={() => setActiveTab("warehouse")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "warehouse"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Database className="w-4 h-4" />
          Dataset Explorer
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "insights"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Decision Insights
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "admin"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Settings className="w-4 h-4" />
          Administration
        </button>
      </div>

      {/* --- EXECUTIVE DASHBOARD VIEW --- */}
      {activeTab === "executive" && (
        <div className="space-y-6">
          {/* Quick Metrics Ribbons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA compliance</span>
                <h3 className="text-2xl font-bold font-mono text-slate-800 mt-0.5">94.2%</h3>
                <span className="text-xs text-rose-500 font-medium">Target: 98%</span>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vision Average Accuracy</span>
                <h3 className="text-2xl font-bold font-mono text-slate-800 mt-0.5">96.7%</h3>
                <span className="text-xs text-emerald-600 font-medium">Target: 95%</span>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Workspace Threads</span>
                <h3 className="text-2xl font-bold font-mono text-slate-800 mt-0.5">14.5</h3>
                <span className="text-xs text-slate-500 font-medium">Daily average</span>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Triggered Policy Alerts</span>
                <h3 className="text-2xl font-bold font-mono text-slate-800 mt-0.5">
                  {alerts.filter(a => a.status === "TRIGGERED").length}
                </h3>
                <span className="text-xs text-amber-600 font-medium">Requires attention</span>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Dashboard Selector */}
          <div className="flex justify-between items-center bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Active Dashboard View:</span>
              <select
                value={selectedDashboardId}
                onChange={(e) => setSelectedDashboardId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {dashboards.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-400">
              Last updated: {new Date(activeDashboard?.updatedAt).toLocaleTimeString()}
            </div>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {activeDashboard?.widgets.map((widget) => {
              // Custom metric rendering based on simulated snapshots
              let data: any[] = [];
              if (widget.id === "w-exec-1") {
                // SLA over time
                data = trends.find((t) => t.id === "trend-sla")?.historicalPoints || [];
              } else if (widget.id === "w-ops-1") {
                // Traffic/Requests over time
                data = trends.find((t) => t.id === "trend-api")?.historicalPoints || [];
              } else {
                // generic mock series
                data = [
                  { timestamp: "W1", value: 45 },
                  { timestamp: "W2", value: 62 },
                  { timestamp: "W3", value: 58 },
                  { timestamp: "W4", value: 74 },
                  { timestamp: "W5", value: 85 }
                ];
              }

              const isGauge = widget.type === "GAUGE";
              const isLine = widget.type === "LINE";
              const isBar = widget.type === "BAR";
              const isRadar = widget.type === "RADAR";

              return (
                <div
                  key={widget.id}
                  style={{ gridColumn: `span ${widget.gridSettings.w}` }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-800">{widget.title}</h4>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-semibold">
                      {widget.type}
                    </span>
                  </div>

                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      {isLine ? (
                        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={widget.chartSettings.stroke || "#10b981"}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      ) : isBar ? (
                        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip />
                          <Bar dataKey="value" fill={widget.chartSettings.fill || "#3b82f6"} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : isRadar ? (
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: "Accuracy", A: 120, B: 110, fullMark: 150 },
                          { subject: "Speed", A: 98, B: 130, fullMark: 150 },
                          { subject: "Capacity", A: 86, B: 130, fullMark: 150 },
                          { subject: "Precision", A: 99, B: 100, fullMark: 150 },
                          { subject: "Compliance", A: 85, B: 90, fullMark: 150 }
                        ]}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" fontSize={10} />
                          <PolarRadiusAxis fontSize={10} />
                          <Radar name="A" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                        </RadarChart>
                      ) : isGauge ? (
                        // Custom Pie Gauge implementation using recharts
                        <PieChart>
                          <Pie
                            data={[
                              { name: "SLA Achieved", value: 94.2 },
                              { name: "Gap", value: 5.8 }
                            ]}
                            cx="50%"
                            cy="75%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#f1f5f9" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                          Chart format not supported in this container
                        </div>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- DASHBOARD BUILDER VIEW --- */}
      {activeTab === "builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Widget Layout Builder Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="text-lg font-bold text-slate-800">
                  Layout Settings: <span className="font-mono text-emerald-600">{activeDashboard?.name}</span>
                </h3>
                <span className="text-xs text-slate-400">Locked: {activeDashboard?.isLocked ? "Yes" : "No"}</span>
              </div>

              {activeDashboard?.widgets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  No widgets configured on this layout. Drag or choose widgets on the right side.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeDashboard?.widgets.map((widget) => (
                    <div key={widget.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={widget.title}
                          onChange={(e) => handleUpdateWidgetTitle(widget.id, e.target.value)}
                          className="font-bold text-slate-800 text-sm bg-transparent border-b border-dashed border-slate-300 focus:border-slate-500 focus:outline-none w-2/3"
                        />
                        <button
                          onClick={() => handleDeleteWidget(widget.id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <div>
                          <span>Type: <strong className="font-mono">{widget.type}</strong></span>
                        </div>
                        <div className="flex gap-2">
                          <span>W: {widget.gridSettings.w}</span>
                          <span>H: {widget.gridSettings.h}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Widget Library Picker Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-md font-bold text-slate-800 border-b pb-2">Widget Library</h3>
              <p className="text-xs text-slate-500">
                Click a structural widget component below to append it onto the dashboard layout container:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAddWidget("LINE")}
                  className="p-3 text-left bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500 transition group"
                >
                  <TrendingUp className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold block text-slate-800">Time-Series Line</span>
                  <span className="text-[10px] text-slate-400">Trend distributions</span>
                </button>

                <button
                  onClick={() => handleAddWidget("BAR")}
                  className="p-3 text-left bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500 transition group"
                >
                  <BarChart3 className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold block text-slate-800">Comparison Bar</span>
                  <span className="text-[10px] text-slate-400">Volume and sizes</span>
                </button>

                <button
                  onClick={() => handleAddWidget("GAUGE")}
                  className="p-3 text-left bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500 transition group"
                >
                  <Activity className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold block text-slate-800">SLA Gauge Arc</span>
                  <span className="text-[10px] text-slate-400">Target metrics</span>
                </button>

                <button
                  onClick={() => handleAddWidget("RADAR")}
                  className="p-3 text-left bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500 transition group"
                >
                  <Layers className="w-5 h-5 text-pink-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold block text-slate-800">Radar Cluster</span>
                  <span className="text-[10px] text-slate-400">Multivariant scores</span>
                </button>
              </div>

              <div className="pt-4 border-t space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Layout Settings</h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Lock Dashboard</span>
                  <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Direct BI Stream</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono rounded">REST/v2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- KPI EXPLORER VIEW --- */}
      {activeTab === "kpis" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Configurable Key Performance Indicators</h3>
            <button
              onClick={() => setShowCreateKpi(!showCreateKpi)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Define New KPI
            </button>
          </div>

          {/* Form to define a new KPI */}
          {showCreateKpi && (
            <form onSubmit={handleCreateKPI} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
              <h4 className="text-sm font-bold text-slate-800">New Configurable Metric Formulation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">KPI Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chat Sentiment Margin"
                    value={newKpi.name}
                    onChange={(e) => setNewKpi({ ...newKpi, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Formula Equation (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUM(SENTIMENT) / COUNT(MESSAGES)"
                    value={newKpi.formulaCode}
                    onChange={(e) => setNewKpi({ ...newKpi, formulaCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">KPI Core Group</label>
                  <select
                    value={newKpi.groupId}
                    onChange={(e) => setNewKpi({ ...newKpi, groupId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="grp-exec">Executive Core (grp-exec)</option>
                    <option value="grp-ops">Operational Diagnostics (grp-ops)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Target Threshold</label>
                  <input
                    type="number"
                    value={newKpi.targetValue}
                    onChange={(e) => setNewKpi({ ...newKpi, targetValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Value Unit</label>
                  <input
                    type="text"
                    value={newKpi.unit}
                    onChange={(e) => setNewKpi({ ...newKpi, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateKpi(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Add Formula KPI
                </button>
              </div>
            </form>
          )}

          {/* KPIs Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">ID & KPI Name</th>
                    <th className="py-4 px-6">Mathematical Formula</th>
                    <th className="py-4 px-6 text-center">Value / Target</th>
                    <th className="py-4 px-6">Core Group</th>
                    <th className="py-4 px-6">Status Severity</th>
                    <th className="py-4 px-6">Last Recalculated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {kpis.map((kpi) => (
                    <tr key={kpi.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{kpi.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{kpi.description}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-emerald-600 bg-slate-50/70 border-r">
                        {kpi.formulaCode}
                      </td>
                      <td className="py-4 px-6 text-center font-mono">
                        <div className="font-bold text-slate-800">
                          {kpi.currentValue} {kpi.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Goal: {kpi.targetValue} {kpi.unit}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">{kpi.groupId}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getSeverityBadge(kpi.statusSeverity)}`}>
                          {kpi.statusSeverity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                        {new Date(kpi.updatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TREND ANALYSIS EXPLORER --- */}
      {activeTab === "trends" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Trends Sidebar list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Historical Trends</h3>
            <div className="flex flex-col gap-2">
              {trends.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrendId(t.id)}
                  className={`p-3 text-left rounded-xl border transition ${
                    selectedTrendId === t.id
                      ? "border-emerald-500 bg-emerald-50/40 text-emerald-950 font-semibold"
                      : "border-slate-100 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold truncate">{t.metricName}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Change: {t.growthPercentage}%</span>
                    <span>Anomalies: {t.anomalyIndices.length}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trend Display and Chart Analysis */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {currentTrend ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{currentTrend.metricName} Historical Run</h3>
                    <p className="text-xs text-slate-500">Evaluated across 30 sequential data warehouse snapshots</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold uppercase">GROWTH</span>
                      <span className={`text-sm font-bold font-mono ${currentTrend.growthPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {currentTrend.growthPercentage}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold uppercase">SEASONAL PATTERNS</span>
                      <span className="text-xs font-medium text-slate-700">
                        {currentTrend.seasonalityDetected ? "Detected" : "Stable Distribution"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trend Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentTrend.historicalPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pattern Recognition & Anomaly Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Acoustic & Pattern Inferences</h4>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                      {currentTrend.patterns.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Anomaly Markers ({currentTrend.anomalyIndices.length})
                    </h4>
                    {currentTrend.anomalyIndices.length === 0 ? (
                      <p className="text-xs text-slate-500">Zero statistical anomalies found in current sequence bounds.</p>
                    ) : (
                      <div className="text-xs text-slate-600 space-y-1">
                        <p>High standard deviation breaches found at historical sequence points:</p>
                        <div className="flex gap-2 mt-1.5">
                          {currentTrend.anomalyIndices.map((idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-rose-100 text-rose-800 font-mono rounded text-[10px] font-bold">
                              Index {idx} ({currentTrend.historicalPoints[idx]?.value})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400">Select a trend from the left list to visualize historical data.</div>
            )}
          </div>
        </div>
      )}

      {/* --- FORECAST CENTER --- */}
      {activeTab === "forecast" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Forecast Selector List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Forecast Models</h3>
            <div className="flex flex-col gap-2">
              {forecasts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedForecastId(f.id)}
                  className={`p-3 text-left rounded-xl border transition ${
                    selectedForecastId === f.id
                      ? "border-emerald-500 bg-emerald-50/40 text-emerald-950 font-semibold"
                      : "border-slate-100 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold truncate">{f.metricName}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Model: {f.modelType}</span>
                    <span>Confidence: {(f.accuracyConfidenceScore * 100).toFixed(0)}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Forecast Visualization and Confidence Bounds */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {currentForecast ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{currentForecast.metricName} 7-Day Forecast</h3>
                    <p className="text-xs text-slate-500">
                      Predictive simulation displaying projected values with min/max safety margin confidence bounds
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">MODEL ALGORITHM</span>
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-slate-100 px-2 py-0.5 rounded">
                        {currentForecast.modelType}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">CONFIDENCE SCORE</span>
                      <span className="text-sm font-bold font-mono text-slate-800">
                        {(currentForecast.accuracyConfidenceScore * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Forecast Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentForecast.forecastPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip />
                      {/* Confidence Interval Shading */}
                      <Area
                        type="monotone"
                        dataKey="confidenceMax"
                        stroke="none"
                        fill="#3b82f6"
                        fillOpacity={0.12}
                        activeDot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="confidenceMin"
                        stroke="none"
                        fill="#3b82f6"
                        fillOpacity={0}
                        activeDot={false}
                      />
                      {/* Center Forecast Line */}
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="flex gap-2 items-start text-xs text-slate-600">
                    <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-slate-800">Predictive Bound Interpretation:</strong> The shaded area represents the 95% confidence interval projected by the {currentForecast.modelType} algorithm. Note that error margins widen progressively toward horizon-day 7 as operational variance parameters expand.
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400">Select a forecast from the left list to view predictions.</div>
            )}
          </div>
        </div>
      )}

      {/* --- DATASET / WAREHOUSE EXPLORER --- */}
      {activeTab === "warehouse" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Datasets Sidebar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Data Partitions</h3>
            <div className="flex flex-col gap-2">
              {datasets.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDatasetId(d.id)}
                  className={`p-3 text-left rounded-xl border transition ${
                    selectedDatasetId === d.id
                      ? "border-emerald-500 bg-emerald-50/40 text-emerald-950 font-semibold"
                      : "border-slate-100 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold">{d.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Source: {d.sourceDomain}</span>
                    <span>Records: {d.recordsCount}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Records Table and Metadata */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b">
                <div>
                  <h3 className="text-md font-bold text-slate-800">Warehouse Time-Series Snapshots</h3>
                  <p className="text-xs text-slate-400">Partitioned dataset storage logs</p>
                </div>
                <div className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  Status: <strong className="text-emerald-600">AGGREGATED</strong>
                </div>
              </div>

              {/* Snapshots Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-semibold uppercase border-b">
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Snapshot ID</th>
                      <th className="py-2.5 px-4">Dimensions / Categories</th>
                      <th className="py-2.5 px-4">Measures / Metric values</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {filteredSnapshots.slice(0, 10).map((snap) => (
                      <tr key={snap.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-2.5 px-4 text-slate-400">
                          {new Date(snap.timestamp).toLocaleDateString()} {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{snap.id}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {snap.dimensions.map((dim, idx) => (
                              <span key={idx} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                                {dim.name}={dim.value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {snap.measures.map((meas, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">
                                {meas.name}={meas.value} {meas.unit}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DECISION INSIGHTS VIEW --- */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Operational & Decision Intelligence Insights</h3>
            <span className="text-xs text-slate-400 font-semibold">Factual correlation index backed by metrics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((ins) => (
              <div key={ins.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getImpactBadge(ins.impactLevel)}`}>
                      {ins.impactLevel} Impact
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      Conf: {(ins.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800">{ins.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{ins.description}</p>
                </div>

                {/* Evidence Metrics */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Metric Evidence</span>
                  <div className="space-y-1">
                    {ins.evidenceMetrics.map((ev, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-slate-500">{ev.name}</span>
                        <span className="text-slate-800 font-bold">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- POLICY / CONFIGURATION / ADMIN VIEW --- */}
      {activeTab === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-md font-bold text-slate-800 pb-2 border-b">Analytics Administration & Policies</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Partition Retention Policies</label>
                <div className="grid grid-cols-3 gap-3">
                  {["90", "365", "Indefinite"].map((days) => (
                    <button
                      key={days}
                      onClick={() => setRetentionPolicy(days)}
                      className={`p-3 text-center border text-xs font-bold rounded-xl transition ${
                        retentionPolicy === days
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {days === "Indefinite" ? "Indefinite Retention" : `${days} Days Partition`}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Automated storage clean processes clear historical time-series indexes based on partition policy standards.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Inbound Telemetry Refresh Frequencies</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Real-Time", "Hourly", "Daily"].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setRefreshRate(rate)}
                      className={`p-3 text-center border text-xs font-bold rounded-xl transition ${
                        refreshRate === rate
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {rate}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role-Based Metric Visibilities</label>
                <div className="grid grid-cols-3 gap-3">
                  {["C-Level Admin", "Operations Lead", "Partner Consultant"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setRolePermission(role)}
                      className={`p-3 text-center border text-xs font-bold rounded-xl transition ${
                        rolePermission === role
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-800 pb-2 border-b">Future BI Connector Integrations</h3>
            <p className="text-xs text-slate-500">
              Only interfaces are exposed below to hook upstream streaming data lakes or external visualization tools:
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-xl text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">Looker / Tableau Sync</span>
                  <span className="text-[10px] text-slate-400">Export URL configuration</span>
                </div>
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] rounded uppercase font-bold">
                  DRAFT
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-xl text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">Real-Time Streaming Sink</span>
                  <span className="text-[10px] text-slate-400">gRPC and MQTT bindings</span>
                </div>
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] rounded uppercase font-bold">
                  DRAFT
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-xl text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">Custom Data Lakehouse</span>
                  <span className="text-[10px] text-slate-400">Delta Lake incremental formats</span>
                </div>
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] rounded uppercase font-bold">
                  DRAFT
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
