import React, { useMemo, useState, useRef } from "react";
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  Briefcase, 
  Activity, 
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  Compass,
  Star,
  Pin,
  HardDrive,
  Bell,
  Play,
  Upload,
  File,
  Check,
  ChevronRight,
  ShieldCheck,
  Users,
  CreditCard,
  Database,
  TrendingUp,
  Terminal,
  Sliders,
  Cpu,
  Layers,
  Settings,
  ShieldAlert,
  ArrowRight,
  Plus
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";
import { Client, Property, Task, ProjectReport, Project } from "../types/app";
import { WorkflowRepository } from "../repositories/workflowRepository";

interface DashboardPageProps {
  projects?: Project[];
  clients: Client[];
  properties: Property[];
  reports: ProjectReport[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onNavigate: (tab: any) => void;
  activeUserRole: string;
}

// Enterprise-grade platform data for Super Admin
const MOCK_CONSULTANTS = [
  { id: "c1", name: "Dr. Devendra Shastri", company: "Cosmic Alignments Ltd.", email: "devendra@cosmicalignments.com", status: "Active", tier: "Enterprise", projects: 12, billing: "$350/mo", joined: "2025-01-15" },
  { id: "c2", name: "Acharya Rajesh Kumar", company: "Vastu Wisdom Consultations", email: "rajesh@vastuwisdom.in", status: "Active", tier: "Professional", projects: 8, billing: "$150/mo", joined: "2025-03-22" },
  { id: "c3", name: "Smt. Sharda Devi", company: "Jyotish & Urja Foundations", email: "sharda@urjafoundations.org", status: "Active", tier: "Professional", projects: 5, billing: "$150/mo", joined: "2025-05-10" },
  { id: "c4", name: "Amit Patel", company: "Aura Spatial Systems", email: "amit@auraspatial.com", status: "Pending", tier: "Starter", projects: 1, billing: "$49/mo", joined: "2026-07-20" }
];

const MOCK_REVENUE_TREND = [
  { month: "Jan", revenue: 8400, subscriptions: 45 },
  { month: "Feb", revenue: 9800, subscriptions: 52 },
  { month: "Mar", revenue: 11200, subscriptions: 60 },
  { month: "Apr", revenue: 12500, subscriptions: 68 },
  { month: "May", revenue: 13900, subscriptions: 75 },
  { month: "Jun", revenue: 14800, subscriptions: 80 },
  { month: "Jul", revenue: 16400, subscriptions: 88 }
];

export default function DashboardPage({
  projects = [],
  clients,
  properties,
  reports,
  tasks,
  onToggleTask,
  onNavigate,
  activeUserRole
}: DashboardPageProps) {
  
  const pinnedProjects = projects.filter(p => p.isPinned);
  const favoriteProjects = projects.filter(p => p.isFavorite);
  const recentProjects = [...projects].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).slice(0, 4);

  // Dynamic file upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; status: string; progress: number }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vastu Energy Harmonization Data for Chart
  const energyData = [
    { name: "Sector NE", rating: 88, cosmic: 85, geopathic: 90 },
    { name: "Sector E", rating: 75, cosmic: 80, geopathic: 70 },
    { name: "Sector SE", rating: 62, cosmic: 65, geopathic: 60 },
    { name: "Sector S", rating: 92, cosmic: 90, geopathic: 95 },
    { name: "Sector SW", rating: 45, cosmic: 50, geopathic: 40 },
    { name: "Sector W", rating: 78, cosmic: 80, geopathic: 75 },
    { name: "Sector NW", rating: 83, cosmic: 85, geopathic: 80 },
    { name: "Sector N", rating: 95, cosmic: 95, geopathic: 95 }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const fileSizeString = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      const newFile = {
        name: file.name,
        size: fileSizeString,
        status: "Ingesting Vector Map",
        progress: 10
      };

      setUploadedFiles(prev => [newFile, ...prev]);

      let prog = 10;
      const interval = setInterval(() => {
        prog += 30;
        setUploadedFiles(prev => 
          prev.map(f => f.name === file.name ? { ...f, progress: Math.min(prog, 100), status: prog >= 100 ? "Ready for Spatial Ingestion" : "Processing Vector Geometry" } : f)
        );
        if (prog >= 100) {
          clearInterval(interval);
        }
      }, 400);
    });
  };

  // Determine if we should show the Super Admin console or the Consultant business console
  const isSuperAdmin = activeUserRole === "SUPER_ADMIN" || activeUserRole === "ADMIN";

  if (isSuperAdmin) {
    // ==========================================
    // PART 3.1: SUPER ADMIN DASHBOARD (PLATFORM)
    // ==========================================
    return (
      <div className="flex-1 w-full p-6 md:p-8 overflow-y-auto bg-slate-50/50">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-[10px] font-mono font-extrabold text-indigo-700 rounded-full tracking-wider">
                PLATFORM SUPER CONTROL ACTIVE
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5 font-mono uppercase">
              SYSTEM <span className="text-indigo-600 font-bold">SUPER ADMINISTRATOR</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Global Tenant Isolation • System Health Stable • 100% Core Verification Rate
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('security')} 
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              SYSTEM SHIELD
            </button>
            <button 
              onClick={() => onNavigate('ai_governance')} 
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              INTELLIGENCE REGISTRY
            </button>
          </div>
        </div>

        {/* Super Admin KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-400 text-[10px] font-mono font-extrabold uppercase tracking-widest">Active Tenants</h3>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 font-mono">88</p>
            <span className="text-[10px] text-emerald-600 font-mono mt-1 block">Registered Consultants</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-400 text-[10px] font-mono font-extrabold uppercase tracking-widest">Global Subscriptions</h3>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 font-mono">84 <span className="text-xs text-slate-400 font-normal">Active</span></p>
            <span className="text-[10px] text-indigo-500 font-mono mt-1 block">95.4% Retention Rate</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-400 text-[10px] font-mono font-extrabold uppercase tracking-widest">Platform MRR</h3>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 font-mono">$16,400</p>
            <span className="text-[10px] text-blue-500 font-mono mt-1 block">Monthly Recurring Revenue</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-400 text-[10px] font-mono font-extrabold uppercase tracking-widest">System Health</h3>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 font-mono">99.98%</p>
            <span className="text-[10px] text-amber-600 font-mono mt-1 block">API Gateway Response Stable</span>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main super-admin column (8 wide) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Consultants Management Ledger */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200/60 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Consultants Management</h2>
                  <p className="text-[11px] text-slate-400">Manage paying enterprise accounts, view subscription statuses, and inspect activity.</p>
                </div>
                <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  PROVISION
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      <th className="py-3 px-4">Consultant / Company</th>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4">Workspaces</th>
                      <th className="py-3 px-4">Monthly Rate</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_CONSULTANTS.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.company} • {c.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{c.tier}</td>
                        <td className="py-3.5 px-4 font-mono">{c.projects} active</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{c.billing}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase tracking-wide border ${
                            c.status === "Active" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Platform Revenue & Growth Visualization */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Platform Growth Velocity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Global monthly recurring revenue and active consultant count trajectories</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100">
                  REAL-TIME STATS
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_REVENUE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Area type="monotone" dataKey="revenue" name="Platform Revenue ($)" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Right Super-Admin column (4 wide) */}
          <div className="space-y-8">
            
            {/* Global Services & Control Gates */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 font-mono uppercase tracking-wider">Super Control Center</h2>
              
              <div className="space-y-3">
                <button onClick={() => onNavigate('knowledge')} className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 transition-colors flex items-center justify-between text-left cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-xs font-mono font-bold block">KNOWLEDGE VAULT</span>
                      <span className="text-[10px] text-slate-400 block font-sans">Full access to raw shastras & ingestion</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button onClick={() => onNavigate('ai_governance')} className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 transition-colors flex items-center justify-between text-left cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Sliders className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-xs font-mono font-bold block">PLATFORM SETTINGS & SEC</span>
                      <span className="text-[10px] text-slate-400 block font-sans">Enforce SSL, AES encryption keys</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button onClick={() => onNavigate('plugins_marketplace')} className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 transition-colors flex items-center justify-between text-left cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-xs font-mono font-bold block">PLUGIN ENGINE SDK</span>
                      <span className="text-[10px] text-slate-400 block font-sans">Deploy or version extension modules</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* System Log Feed */}
            <div className="bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl p-5 relative overflow-hidden shadow-xl min-h-[300px] flex flex-col">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <Terminal className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase">PLATFORM EVENT LOG</h3>
              </div>
              
              <div className="space-y-4 font-mono text-[10px] flex-1">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">[16:11:30]</span>
                  <p className="text-slate-300">SYSTEM: Initializing multi-tenant routing pipeline.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">[16:10:45]</span>
                  <p className="text-slate-300">SECURE: AES-256 cloud container keys rotated successfully.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">[16:05:12]</span>
                  <p className="text-slate-300">KNOWLEDGE: Loaded Vedic coordinates for master Vastu Chakra (Approved).</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">[15:45:10]</span>
                  <p className="text-rose-300">SHIELD: Denied unauthorized access to Knowledge Vault from public IP.</p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-800 text-[9px] text-indigo-400 font-mono uppercase font-bold tracking-wider text-center">
                ACTIVE PORT: 3000 CONSOLE OK
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // PART 3.2: CONSULTANT DASHBOARD (BUSINESS)
  // ==========================================
  return (
    <div className="flex-1 w-full p-6 md:p-8 overflow-y-auto bg-slate-50/50">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-extrabold text-emerald-700 rounded-full tracking-wider">
              CONSULTANT WORKSPACE ENABLED
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5 font-mono uppercase">
            URJAFLUX <span className="text-emerald-600 font-bold">BUSINESS HUB</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Vedic Spatial Diagnostics OS • Connected to your exclusive white-label tenant
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('projects')} 
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-emerald-600" />
            MY PROJECTS
          </button>
          <button 
            onClick={() => onNavigate('workspace')} 
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            SPATIAL WORKSPACE
          </button>
        </div>
      </div>

      {/* METRIC CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-400 text-[10px] font-mono font-extrabold uppercase tracking-widest">My Clients</h3>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{clients.length}</p>
          <span className="text-[10px] text-emerald-600 font-mono mt-1 block">Active clients registered</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-400 text-[10px] font-mono font-extrabold uppercase tracking-widest">My Projects</h3>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{projects.length}</p>
          <span className="text-[10px] text-indigo-500 font-mono mt-1 block">Envelopes mapped</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-400 text-[10px] font-mono font-extrabold uppercase tracking-widest">Reports Compiled</h3>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <File className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            {reports.length}
          </p>
          <span className="text-[10px] text-blue-500 font-mono mt-1 block">White-label reports issued</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-400 text-[10px] font-mono font-extrabold uppercase tracking-widest">Active License</h3>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            PREMIUM
          </p>
          <span className="text-[10px] text-amber-600 font-mono mt-1 block">White-label templates unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: VISUAL CHARTS & BLUEPRINT DIRECT UPLOAD AREA */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* SPATIAL VECTORS CHART */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Spatial Energy Diagnostics</h2>
                <p className="text-xs text-slate-500 mt-0.5">Vastu grid harmonizations across standard residential & commercial directions</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-100">
                ACTIVE PROFILE
              </span>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCosmic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="rating" name="Harmonization Rating" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorRating)" />
                  <Area type="monotone" dataKey="cosmic" name="Resonance Index" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCosmic)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* INTERACTIVE BLUEPRINT UPLOAD */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Direct Blueprint & Document Ingestor</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload CAD blueprints (DWG, DXF) or floor plan layouts (PDF, JPEG) directly to process energy lines.
              </p>
            </div>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                dragActive 
                  ? "border-emerald-600 bg-emerald-50/50" 
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 hover:border-emerald-500"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.dxf,.dwg"
              />
              
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                <Upload className="w-5 h-5 animate-bounce" />
              </div>

              <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                DRAG & DROP DESIGN PLANS HERE
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                Supported: PDF, DXF, DWG, PNG, JPEG. Automated spatial parsing & sector boundary alignment triggers instantly.
              </p>
              
              <button className="mt-4 px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-mono font-bold text-[10px] rounded-lg shadow-sm">
                SELECT ARCHIVE
              </button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Ingested Workspace Pipeline ({uploadedFiles.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {uploadedFiles.map((fileObj, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-3 relative overflow-hidden">
                      <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-mono text-slate-800 truncate" title={fileObj.name}>
                          {fileObj.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Size: {fileObj.size} • status: <span className="text-emerald-600 font-semibold">{fileObj.status}</span>
                        </p>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${fileObj.progress}%` }} />
                        </div>
                      </div>
                      {fileObj.progress === 100 && (
                        <div className="bg-emerald-500 text-white rounded-full p-0.5 shrink-0 self-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CONSULTANT WORKFLOW ENGINE QUICK DESK */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Consultant Lifecycle Workflow Desk</h2>
                <p className="text-xs text-slate-500 mt-0.5">Central orchestrations for appointments, reviews, and client lifecycles</p>
              </div>
              <button 
                onClick={() => onNavigate('consultant_workflow')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 animate-spin-slow" /> LAUNCH DESK
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50/85 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Today's Sessions</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1">
                  {WorkflowRepository.getInstance().getAppointments().filter(a => a.status === "SCHEDULED" || a.status === "RESCHEDULED").length} Active
                </span>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">Meetings slotted</p>
              </div>
              <div className="bg-slate-50/85 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Checklist Backlog</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1">
                  {WorkflowRepository.getInstance().getTasks().filter(t => t.status !== "COMPLETED").length} Pending
                </span>
                <p className="text-[10px] text-amber-600 font-semibold mt-1">Prerequisite tasks</p>
              </div>
              <div className="bg-slate-50/85 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Pending Follow-Ups</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1">
                  {WorkflowRepository.getInstance().getFollowUps().filter(f => f.status === "PENDING").length} Active
                </span>
                <p className="text-[10px] text-indigo-600 font-semibold mt-1">Remedy feedback calls</p>
              </div>
            </div>
          </div>

          {/* ACTIVE PROJECTS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200/60 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Active Workspace Projects</h2>
              <button onClick={() => onNavigate('projects')} className="text-xs font-mono font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                VIEW ALL
              </button>
            </div>
            <div className="p-2">
              {recentProjects.length === 0 ? (
                 <div className="text-center py-12">
                   <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                   <h3 className="text-sm font-medium text-slate-900">No Recent Projects</h3>
                   <p className="text-xs text-slate-500 mt-1">Create a new project to get started</p>
                 </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {recentProjects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group" onClick={() => onNavigate('workspace')}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {p.projectType} • Last updated {new Date(p.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold tracking-wide uppercase px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600">
                          {p.status}
                        </span>
                        <button className="w-8 h-8 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-700 transition-colors">
                          <Play className="w-3.5 h-3.5 fill-current text-slate-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: QUICK NAVIGATOR */}
        <div className="flex flex-col gap-8">
          
          {/* QUICK TERMINALS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4 font-mono uppercase tracking-wider">Quick Terminals</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onNavigate('add_client')} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer group">
                <Users className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold">My Clients</span>
              </button>
              <button onClick={() => onNavigate('projects')} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer group">
                <Briefcase className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold">My Projects</span>
              </button>
              <button onClick={() => onNavigate('workspace')} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer group">
                <Compass className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold">Workspace</span>
              </button>
              <button onClick={() => onNavigate('brand_profile')} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer group">
                <Building2 className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold">Brand Profile</span>
              </button>
              <button onClick={() => onNavigate('reports')} className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer group">
                <File className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold">Reports</span>
              </button>
              <button onClick={() => onNavigate('settings')} className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-slate-700 transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer group">
                <Settings className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold">Settings</span>
              </button>
            </div>
          </div>

          {/* BRAND SUITE QUICK LOOK */}
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase">BRAND STATUS</h3>
              </div>
              <button onClick={() => onNavigate('brand_profile')} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono font-bold">
                EDIT
              </button>
            </div>
            
            <div className="space-y-3.5 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Corporate Name</span>
                <span className="text-slate-200 font-semibold truncate max-w-[150px]">
                  {localStorage.getItem("urjaflux_brand_profile") ? JSON.parse(localStorage.getItem("urjaflux_brand_profile")!).companyName : "Cosmic Alignments Ltd."}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Theme Engine</span>
                <span className="text-emerald-400 font-semibold">White-Label Unlocked</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Tenant</span>
                <span className="text-slate-200 font-bold uppercase">SECURE_TUNNEL</span>
              </div>
            </div>
          </div>

          {/* ACTIVE ALIGNMENTS STREAM */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200/60 flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Spatial Event Feed</h2>
            </div>
            <div className="p-5 flex-1">
               <div className="relative pl-4 border-l border-slate-200 space-y-6">
                 <div className="relative">
                   <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                   <p className="text-[10px] font-mono text-slate-400 mb-0.5">Just now</p>
                   <p className="text-xs text-slate-800 font-bold">Workspace Alignment Synced</p>
                   <p className="text-[10px] text-slate-500 leading-normal">Residential coordinate grids resolved correctly with true North offsets.</p>
                 </div>
                 <div className="relative">
                   <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                   <p className="text-[10px] font-mono text-slate-400 mb-0.5">3 hours ago</p>
                   <p className="text-xs text-slate-800 font-bold">Vastu Shastra Ingestion</p>
                   <p className="text-[10px] text-slate-500 leading-normal">Chakra sectors mapped successfully across residential blueprint bounds.</p>
                 </div>
                 <div className="relative">
                   <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                   <p className="text-[10px] font-mono text-slate-400 mb-0.5">Yesterday</p>
                   <p className="text-xs text-slate-800 font-bold">Energy Score Audited</p>
                   <p className="text-[10px] text-slate-500 leading-normal">Issued energy diagnostics recommendation card to Project P-0000.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
