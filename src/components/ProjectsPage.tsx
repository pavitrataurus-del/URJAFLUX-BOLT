import React, { useState, useMemo } from "react";
import { Activity, 
  Briefcase, Plus, Search, Filter, Calendar, Clock, ArrowLeft, Trash2, 
  Save, AlertTriangle, Check, ChevronRight, Upload, MapPin, 
  File, Image, CheckCircle2, ListTodo, Star, Pin, MoreVertical, Edit, Copy, Archive
} from "lucide-react";
import { Project, Client, Property } from "../types/app";

interface ProjectsPageProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  clients: Client[];
  properties: Property[];
  onNavigateToWorkspace?: (prop: Property) => void;
}

export default function ProjectsPage({ 
  projects, 
  setProjects, 
  clients, 
  properties,
  onNavigateToWorkspace 
}: ProjectsPageProps) {
  
  const [viewState, setViewState] = useState<"list" | "create" | "detail">("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: "", description: "", owner: "", projectType: "Commercial", 
    timezone: "UTC", northOrientation: 0, measurementSystem: "Metric",
    status: "Draft", priority: "Medium",
    tags: [], categories: []
  });

  // List filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "All" || p.projectType === filterType;
      return matchesSearch && matchesType;
    });
  }, [projects, searchQuery, filterType]);

  const handleCreateProject = () => {
    const proj: Project = {
      name: newProject.name || "Untitled", ...newProject,
      id: "PROJ-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      code: "P-" + Math.floor(1000 + Math.random() * 9000),
      propertyId: "", propertyName: "", clientId: "", clientName: "",
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      assignedConsultant: newProject.owner || "Unassigned",
      versions: [], timeline: [],
      notes: { privateNotes: "", clientQuestions: "", siteVisitNotes: "", pendingInformation: "" },
      followUp: { nextMeeting: "", reminder: "", pendingTasks: [], status: "Pending" },
      files: [],
      projectType: newProject.projectType as any,
      status: "Draft",
      priority: newProject.priority as any
    };
    setProjects([...projects, proj]);
    setViewState("list");
    setWizardStep(1);
    setNewProject({ name: "", description: "", owner: "", projectType: "Commercial", timezone: "UTC", northOrientation: 0, measurementSystem: "Metric" });
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(projects.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(projects.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const deleteProject = (id: string) => {
    if(confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter(p => p.id !== id));
      if(selectedProjectId === id) setViewState("list");
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-slate-50 flex flex-col">
      {viewState === "list" && (
        <div className="p-6 md:p-8 flex-1 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Project Management</h1>
              <p className="text-sm text-slate-500">Manage all enterprise projects and workspaces</p>
            </div>
            <button 
              onClick={() => setViewState("create")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="w-48 relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select 
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
              >
                <option value="All">All Types</option>
                <option value="Commercial">Commercial</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl">
              <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
              <p className="text-sm text-slate-500 max-w-md text-center mt-2">Create a new project or adjust your filters.</p>
              <button onClick={() => setViewState("create")} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">Create Project</button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Project Name</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Last Updated</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedProjectId(p.id); setViewState("detail"); }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">{p.name.charAt(0)}</div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              {p.name}
                              {p.isPinned && <Pin className="w-3 h-3 text-rose-500" />}
                              {p.isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                            </div>
                            <div className="text-xs text-slate-500">{p.code} • {p.owner}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{p.projectType}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded">{p.status}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(p.lastUpdated).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => togglePin(p.id, e)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700" title="Pin">
                            <Pin className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => toggleFavorite(p.id, e)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700" title="Favorite">
                            <Star className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewState === "create" && (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
          <div className="mb-6 flex items-center gap-4">
            <button onClick={() => setViewState("list")} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create New Project</h1>
              <p className="text-sm text-slate-500">Step {wizardStep} of 4</p>
            </div>
          </div>

          <div className="max-w-2xl w-full mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex border-b border-slate-100 bg-slate-50 px-6 py-4 gap-2">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex-1 flex items-center">
                  <div className={"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 " + (wizardStep >= step ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500")}>
                    {wizardStep > step ? <Check className="w-3 h-3" /> : step}
                  </div>
                  {step < 4 && <div className={"h-0.5 w-full mx-2 " + (wizardStep > step ? "bg-emerald-600" : "bg-slate-200")} />}
                </div>
              ))}
            </div>
            <div className="p-8 flex-1">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900">Project Information</h2>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="E.g., Alpha Tower" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                    <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg h-24 resize-none" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Optional details..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Owner</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg" value={newProject.owner} onChange={e => setNewProject({...newProject, owner: e.target.value})} placeholder="Project Lead" />
                  </div>
                </div>
              )}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900">Project Type</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {["House", "Apartment", "Commercial", "Office", "Industrial", "Temple", "Other"].map(type => (
                      <div 
                        key={type} 
                        onClick={() => setNewProject({...newProject, projectType: type as any})}
                        className={"p-4 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 " + (newProject.projectType === type ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-slate-200 hover:bg-slate-50")}
                      >
                        <div className={"w-4 h-4 rounded-full border flex items-center justify-center " + (newProject.projectType === type ? "border-emerald-600" : "border-slate-300")}>
                          {newProject.projectType === type && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                        </div>
                        <span className="font-medium text-sm">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900">Location & Settings</h2>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Timezone</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg" value={newProject.timezone} onChange={e => setNewProject({...newProject, timezone: e.target.value})}>
                      <option value="UTC">UTC (Global)</option>
                      <option value="IST">India Standard Time (IST)</option>
                      <option value="EST">Eastern Time (EST)</option>
                      <option value="PST">Pacific Time (PST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">North Orientation (Degrees)</label>
                    <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg" value={newProject.northOrientation} onChange={e => setNewProject({...newProject, northOrientation: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Measurement System</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg" value={newProject.measurementSystem} onChange={e => setNewProject({...newProject, measurementSystem: e.target.value as any})}>
                      <option value="Metric">Metric (m, cm)</option>
                      <option value="Imperial">Imperial (ft, in)</option>
                    </select>
                  </div>
                </div>
              )}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-900">Review & Confirm</h2>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 font-medium">Name</p>
                      <p className="font-bold text-slate-900">{newProject.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Type</p>
                      <p className="font-bold text-slate-900">{newProject.projectType}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Owner</p>
                      <p className="font-bold text-slate-900">{newProject.owner || "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Measurements</p>
                      <p className="font-bold text-slate-900">{newProject.measurementSystem}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
              <button 
                onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setViewState("list")} 
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-white bg-slate-50"
              >
                {wizardStep > 1 ? "Back" : "Cancel"}
              </button>
              <button 
                onClick={() => {
                  if (wizardStep < 4) setWizardStep(wizardStep + 1);
                  else handleCreateProject();
                }} 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm"
                disabled={wizardStep === 1 && !newProject.name}
              >
                {wizardStep < 4 ? "Next Step" : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewState === "detail" && (
        <ProjectDetailView 
          project={projects.find(p => p.id === selectedProjectId)!} 
          onBack={() => setViewState("list")} 
          onNavigateToWorkspace={onNavigateToWorkspace}
        />
      )}
    </div>
  );
}

function ProjectDetailView({ project, onBack, onNavigateToWorkspace }: { project: Project, onBack: () => void, onNavigateToWorkspace?: (prop: Property) => void }) {
  if (!project) return null;
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col shrink-0">
        <button onClick={onBack} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 w-fit mb-3">
          <ArrowLeft className="w-3 h-3" /> Back to Projects
        </button>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded">{project.status}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{project.code} • {project.projectType} • Last updated {new Date(project.lastUpdated).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 text-slate-700">
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => onNavigateToWorkspace && onNavigateToWorkspace({id: project.id} as any)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Open Workspace
            </button>
          </div>
        </div>
        
        <div className="flex gap-6 mt-6 border-b border-slate-200 translate-y-4">
          {["overview", "files"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={"pb-3 text-sm font-semibold capitalize border-b-2 transition-colors " + (activeTab === tab ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700")}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{project.description || "No description provided."}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Background Processing</h3>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">Idle</span>
                </div>
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No active AI tasks running.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Metadata</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Owner</span>
                    <span className="font-semibold text-slate-900">{project.owner || "Unassigned"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">System</span>
                    <span className="font-semibold text-slate-900">{project.measurementSystem}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Timezone</span>
                    <span className="font-semibold text-slate-900">{project.timezone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created</span>
                    <span className="font-semibold text-slate-900">{new Date(project.createdDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "files" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full min-h-[400px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Project File Manager & Upload Center</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-xs font-bold flex items-center gap-2">
                  <Upload className="w-3 h-3" /> Upload Files
                </button>
              </div>
            </div>
            
            {/* Empty State for Files */}
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-base font-bold text-slate-900">No files uploaded yet</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">Drag and drop floor plans, DWG, PDF, or image files here, or click to browse.</p>
              <div className="mt-6 flex gap-4 text-xs font-semibold text-slate-400">
                <span>PDF</span> • <span>PNG/JPG</span> • <span>DWG</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
