import React, { useState, useRef } from "react";
import { 
  Upload, 
  File, 
  Folder, 
  FolderOpen, 
  FileText, 
  Image, 
  Trash2, 
  Edit2, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Search, 
  PlusCircle, 
  ArrowRight, 
  ArrowLeft, 
  ExternalLink, 
  Database, 
  RefreshCw, 
  Check, 
  Layers, 
  FileSpreadsheet, 
  QrCode, 
  Smartphone, 
  Sparkles,
  Lock,
  Cloud,
  CheckCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { Project, ProjectFile, Client, Property, ProjectVersion } from "../types/app";
import { addProject, updateProject } from "../services/projectService";
import { WorkspaceDigitalTwinRepository } from "../repositories/workspaceDigitalTwinRepository";

interface ProjectImportSystemProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  clients: Client[];
  properties: Property[];
  onNavigateToWorkspace: (prop: Property) => void;
  onNavigateView: (view: string) => void;
}

type WizardStep = "new_project" | "upload_files" | "review_files";

interface TempUploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: ProjectFile["category"];
  progress: number;
  status: "Uploading" | "Completed" | "Failed";
  error?: string;
  previewUrl?: string;
}

export default function ProjectImportSystem({
  projects,
  setProjects,
  clients,
  properties,
  onNavigateToWorkspace,
  onNavigateView
}: ProjectImportSystemProps) {
  // Navigation State
  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>("new_project");
  
  // Selected Project for general File Manager (Vault)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeFolderTab, setActiveFolderTab] = useState<ProjectFile["category"] | "All">("All");
  const [fileSearchQuery, setFileSearchQuery] = useState<string>("");

  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    name: "",
    propertyId: "",
    projectType: "New Construction" as Project["projectType"],
    priority: "Medium" as Project["priority"],
    assignedConsultant: "Achyuta Rao"
  });

  // Wizard Temporary Uploads
  const [tempFiles, setTempFiles] = useState<TempUploadFile[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  
  // File edit state
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState<string>("");

  // Architecture tab for cloud integration preview
  const [activeCloudTab, setActiveCloudTab] = useState<"gdrive" | "dropbox" | "onedrive" | "mobile">("gdrive");
  
  // Cloud configuration input fields
  const [cloudConfig, setCloudConfig] = useState({
    clientId: "",
    syncInterval: "15",
    teamFolder: "/UrjafluxSync",
    enableAutoSync: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const vaultFileInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || null;

  // Sync / Auto-select first project on load
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Helper: Format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper: Detect File Category by Extension
  const detectCategory = (filename: string): ProjectFile["category"] => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["pdf", "tiff", "tif"].includes(ext)) return "Blueprints";
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "Images";
    if (["dxf", "dwg"].includes(ext)) return "CAD";
    if (["docx", "xlsx", "txt", "csv", "json"].includes(ext)) return "Documents";
    return "Documents"; // Default fallback
  };

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop Event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  // File picker handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files);
    }
  };

  // Process selected files: Validation + Category Placement + Simulated Progress Trackers
  const processSelectedFiles = (files: FileList) => {
    const newUploads: TempUploadFile[] = [];
    const warnings: string[] = [];

    Array.from(files).forEach(file => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const validExtensions = ["pdf", "png", "jpg", "jpeg", "webp", "tiff", "tif", "dxf", "dwg", "ifc", "rvt", "docx", "xlsx", "txt"];
      
      // 1. Unsupported Format Check
      if (!validExtensions.includes(ext)) {
        warnings.push(`[Unsupported Format] File "${file.name}" ignored. High-fidelity Vastu analysis supports CAD (DWG, DXF), blueprints (PDF, PNG, JPG, WEBP, TIFF), and documents.`);
        return;
      }

      // 2. Maximum Size Validation (50MB Limit)
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size > MAX_SIZE) {
        warnings.push(`[Size Limit Exceeded] "${file.name}" (${formatBytes(file.size)}) exceeds the 50MB enterprise pipeline limit.`);
        return;
      }

      // 3. Duplicate Warning Detection
      // Check if file is already added in temp files or the selected project files
      const isDuplicateInTemp = tempFiles.some(tf => tf.name === file.name && tf.size === file.size);
      const isDuplicateInProject = activeProject?.files?.some(pf => pf.originalName === file.name && pf.size === file.size);
      
      if (isDuplicateInTemp || isDuplicateInProject) {
        warnings.push(`[Duplicate Alert] File "${file.name}" is already cataloged in this workspace context.`);
      }

      // 4. Corrupted File Check (Simulated metadata diagnostics)
      if (file.size === 0) {
        warnings.push(`[Corruption Warning] "${file.name}" contains 0 bytes or corrupted segment indexes.`);
        return;
      }

      const tempId = `temp_file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

      const newFileObj: TempUploadFile = {
        id: tempId,
        file,
        name: file.name,
        size: file.size,
        type: file.type || `application/${ext}`,
        category: detectCategory(file.name),
        progress: 0,
        status: "Uploading",
        previewUrl
      };

      newUploads.push(newFileObj);
    });

    if (warnings.length > 0) {
      setValidationWarnings(prev => [...prev, ...warnings].slice(-6)); // Keep last 6 logs
    }

    if (newUploads.length > 0) {
      setTempFiles(prev => [...prev, ...newUploads]);
      // Trigger simulation for progress bars
      newUploads.forEach(item => {
        simulateProgress(item.id);
      });
    }
  };

  // Realistic Progress simulation mimicking high-throughput Cloud upload
  const simulateProgress = (fileId: string) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      setTempFiles(prev => {
        return prev.map(f => {
          if (f.id === fileId) {
            if (f.progress >= 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: "Completed" };
            }
            // Some random failures for "Retry" demonstration (1 in 20 chance, but retry works immediately)
            const shouldFail = Math.random() < 0.05 && f.progress > 40 && f.progress < 70;
            if (shouldFail) {
              clearInterval(interval);
              return { ...f, status: "Failed", error: "Connection intermitted. Host gateway refused packet structure." };
            }

            const increment = Math.floor(Math.random() * 20) + 10;
            const nextProgress = Math.min(f.progress + increment, 100);
            return { 
              ...f, 
              progress: nextProgress, 
              status: nextProgress === 100 ? "Completed" : "Uploading" 
            };
          }
          return f;
        });
      });
    }, 250);
  };

  // Retry failed upload
  const handleRetryUpload = (fileId: string) => {
    setTempFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, status: "Uploading", progress: 0, error: undefined } : f)
    );
    simulateProgress(fileId);
  };

  // Remove temporary upload file
  const handleRemoveTempFile = (fileId: string) => {
    setTempFiles(prev => {
      const target = prev.find(f => f.id === fileId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Rename action inside File review
  const handleTriggerRename = (fileId: string, currentName: string) => {
    setEditingFileId(fileId);
    setEditingFileName(currentName);
  };

  const handleSaveRename = (fileId: string) => {
    if (!editingFileName.trim()) return;
    
    // Ensure extension remains matching
    setTempFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const origExt = f.name.split(".").pop() || "";
        let newName = editingFileName;
        if (!newName.toLowerCase().endsWith(`.${origExt.toLowerCase()}`)) {
          newName = `${newName}.${origExt}`;
        }
        return { ...f, name: newName };
      }
      return f;
    }));

    setEditingFileId(null);
  };

  // Replace file action: overwrite existing slot preserving the index
  const handleReplaceFile = (fileId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFile = e.target.files[0];
      const ext = newFile.name.split(".").pop()?.toLowerCase() || "";
      const validExtensions = ["pdf", "png", "jpg", "jpeg", "webp", "tiff", "tif", "dxf", "dwg", "docx", "xlsx", "txt"];
      
      if (!validExtensions.includes(ext)) {
        alert("Unsupported replacement format. Please select a valid architectural file.");
        return;
      }

      const previewUrl = newFile.type.startsWith("image/") ? URL.createObjectURL(newFile) : undefined;

      setTempFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
          return {
            ...f,
            file: newFile,
            name: newFile.name,
            size: newFile.size,
            type: newFile.type || `application/${ext}`,
            category: detectCategory(newFile.name),
            progress: 0,
            status: "Uploading",
            error: undefined,
            previewUrl
          };
        }
        return f;
      }));

      simulateProgress(fileId);
    }
  };

  // SPRINT 16A Step 1 Submit: Setup project context
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.propertyId) {
      alert("Please provide a project name and assign a property.");
      return;
    }
    setCurrentStep("upload_files");
  };

  // SPRINT 16A Step 3 Submit: finalize project creation & save
  const handleFinalizeProjectWizard = async () => {
    const selectedProperty = properties.find(p => p.id === projectForm.propertyId);
    if (!selectedProperty) {
      alert("Configured property context missing. Please verify property assignments.");
      return;
    }

    const linkedClient = clients.find(c => c.id === selectedProperty.clientId);
    const prjCode = `PRJ-${Math.floor(Math.random() * 9000) + 1000}`;
    const today = new Date().toISOString().split("T")[0];

    // Build Project Files array
    const finalizedFiles: ProjectFile[] = tempFiles
      .filter(tf => tf.status === "Completed")
      .map(tf => ({
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: tf.name,
        originalName: tf.file.name,
        size: tf.size,
        type: tf.type,
        category: tf.category,
        url: tf.previewUrl || "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80", // standard template mock url
        uploadedAt: new Date().toISOString(),
        uploadedBy: projectForm.assignedConsultant,
        status: "Completed",
        progress: 100
      }));

    // Standard drawings list for backwards compatibility inside Space Studio
    const mockVersionId = `ver_${Date.now()}_init`;
    const drawings: ProjectVersion["drawings"] = finalizedFiles
      .filter(ff => ff.category === "Blueprints")
      .map((ff, index) => ({
        id: `drw_${Date.now()}_${index}`,
        name: ff.name,
        fileType: "PDF",
        url: ff.url,
        uploadDate: today,
        fileSize: formatBytes(ff.size),
        versionId: mockVersionId
      }));

    const newProjectData: Omit<Project, "id"> = {
      name: projectForm.name,
      code: prjCode,
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      clientId: linkedClient?.id || "unknown",
      clientName: linkedClient?.name || "Unknown Owner",
      projectType: projectForm.projectType,
      status: "Draft",
      priority: projectForm.priority,
      createdDate: today,
      lastUpdated: today,
      assignedConsultant: projectForm.assignedConsultant,
      versions: [
        {
          id: mockVersionId,
          name: "Initial Site Blueprint",
          createdDate: today,
          createdBy: projectForm.assignedConsultant,
          description: "Project setup files imported during initiation wizard",
          drawings: drawings
        }
      ],
      timeline: [
        {
          id: `evt_${Date.now()}`,
          title: "Wizard Setup & Import Complete",
          date: today,
          description: `Project registered under code ${prjCode}. Linked ${finalizedFiles.length} secure documents directly into project folder structure.`,
          type: "created"
        }
      ],
      notes: {
        privateNotes: "Setup via Universal Wizard.",
        clientQuestions: "Awaiting primary calibration overview.",
        siteVisitNotes: "",
        pendingInformation: ""
      },
      followUp: {
        nextMeeting: "TBD",
        reminder: "Initiate compass direction alignment.",
        pendingTasks: [],
        status: "Pending"
      },
      files: finalizedFiles
    };

    try {
      const savedProject = await addProject(newProjectData);
      setProjects(prev => [savedProject, ...prev]);
      
      // Select project in permanent state
      setSelectedProjectId(savedProject.id);
      
      // Cleanup Object URLs to prevent memory leak
      tempFiles.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      setTempFiles([]);
      setIsWizardActive(false);

      // Redirect direct to Compass Calibration on active property
      onNavigateToWorkspace(selectedProperty);
    } catch (err) {
      console.error("Wizard Finalization failed:", err);
      alert("Error occurred writing project documents. Re-trying process.");
    }
  };

  // Direct Vault Folder File Upload Handlers (Upload files directly into existing projects)
  const handleVaultFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeProject) return;
    
    const fileList = e.target.files;
    const today = new Date().toISOString().split("T")[0];

    const updatedFiles = [...(activeProject.files || [])];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const category = detectCategory(file.name);
      
      // Quick validate size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`"${file.name}" exceeds the 50MB file upload size limit.`);
        continue;
      }

      // Add file immediately to existing project files
      const newFileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80";

      const projectFileObj: ProjectFile = {
        id: newFileId,
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        category,
        url: previewUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: activeProject.assignedConsultant,
        status: "Completed",
        progress: 100
      };

      updatedFiles.push(projectFileObj);

      // If category is a Blueprint, also add to active drawings for immediate workspace availability
      if (category === "Blueprints" && activeProject.versions.length > 0) {
        const primaryVer = activeProject.versions[0];
        primaryVer.drawings = [
          ...(primaryVer.drawings || []),
          {
            id: `drw_${Date.now()}_v_${i}`,
            name: file.name,
            fileType: "PDF",
            url: previewUrl,
            uploadDate: today,
            fileSize: formatBytes(file.size),
            versionId: primaryVer.id
          }
        ];
      }
    }

    const updatedProjectObj: Project = {
      ...activeProject,
      lastUpdated: today,
      files: updatedFiles,
      timeline: [
        {
          id: `evt_vault_${Date.now()}`,
          title: "Direct Folder Upload",
          date: today,
          description: `Uploaded ${fileList.length} files directly into project vault.`,
          type: "uploaded"
        },
        ...activeProject.timeline
      ]
    };

    try {
      await updateProject(updatedProjectObj);
      setProjects(projects.map(p => p.id === activeProject.id ? updatedProjectObj : p));
    } catch (err) {
      console.error("Vault direct upload failed:", err);
    }
  };

  // Direct file deletion in permanent vault
  const handleDeleteVaultFile = async (fileId: string) => {
    if (!activeProject) return;
    if (!confirm("Are you sure you want to permanently delete this file? This action is irreversible.")) return;

    const today = new Date().toISOString().split("T")[0];
    const filteredFiles = (activeProject.files || []).filter(f => f.id !== fileId);

    const updatedProjectObj: Project = {
      ...activeProject,
      lastUpdated: today,
      files: filteredFiles,
      timeline: [
        {
          id: `evt_del_${Date.now()}`,
          title: "File Deleted",
          date: today,
          description: "Removed document from permanent repository vault.",
          type: "revision"
        },
        ...activeProject.timeline
      ]
    };

    try {
      await updateProject(updatedProjectObj);
      setProjects(projects.map(p => p.id === activeProject.id ? updatedProjectObj : p));
    } catch (err) {
      console.error("Vault file deletion failed:", err);
    }
  };

  // Helper: Get File Icon based on category or type
  const renderFileIcon = (category: ProjectFile["category"], name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") {
      return <div className="p-3 bg-rose-50 border border-rose-100 rounded text-rose-500"><FileText className="w-6 h-6" /></div>;
    }
    if (["dwg", "dxf"].includes(ext)) {
      return <div className="p-3 bg-blue-50 border border-blue-100 rounded text-blue-500"><Layers className="w-6 h-6" /></div>;
    }
    if (["xlsx", "xls", "csv"].includes(ext)) {
      return <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-emerald-500"><FileSpreadsheet className="w-6 h-6" /></div>;
    }
    if (category === "Images") {
      return <div className="p-3 bg-sky-50 border border-sky-100 rounded text-sky-500"><Image className="w-6 h-6" /></div>;
    }
    return <div className="p-3 bg-slate-50 border border-slate-100 rounded text-slate-500"><File className="w-6 h-6" /></div>;
  };

  return (
    <div className="space-y-6">
      
      {/* ----------------- SUB-VIEW HEADER BANNER ----------------- */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-mono uppercase">
              Project Import & Vault Studio
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Document Management: Multi-format CAD parser blueprints directory, client property images, and secure local file persistence.
          </p>
        </div>
        
        {/* Toggle Wizard or Direct Vault view */}
        <div className="flex items-center gap-2 shrink-0">
          {!isWizardActive ? (
            <button
              onClick={() => {
                setTempFiles([]);
                setValidationWarnings([]);
                setProjectForm({
                  name: "",
                  propertyId: properties[0]?.id || "",
                  projectType: "New Construction",
                  priority: "Medium",
                  assignedConsultant: "Achyuta Rao"
                });
                setCurrentStep("new_project");
                setIsWizardActive(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono rounded font-semibold shadow transition-all cursor-pointer flex items-center gap-2"
              id="btn-trigger-wizard"
            >
              <PlusCircle className="w-4 h-4" />
              <span>NEW PROJECT WIZARD</span>
            </button>
          ) : (
            <button
              onClick={() => setIsWizardActive(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono rounded border border-slate-200 cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO VAULT</span>
            </button>
          )}
        </div>
      </div>

      {/* ----------------- MODE A: NEW PROJECT IMPORT WIZARD ----------------- */}
      {isWizardActive ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          
          {/* Progress step bar */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 grid grid-cols-3 gap-2">
            <div className={`flex items-center gap-2 border-b-2 pb-2 ${currentStep === "new_project" ? "border-emerald-600 text-emerald-700 font-bold" : "border-transparent text-slate-400"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === "new_project" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>1</div>
              <span className="text-xs font-mono uppercase tracking-wider">New Project</span>
            </div>
            <div className={`flex items-center gap-2 border-b-2 pb-2 ${currentStep === "upload_files" ? "border-emerald-600 text-emerald-700 font-bold" : "border-transparent text-slate-400"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === "upload_files" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>2</div>
              <span className="text-xs font-mono uppercase tracking-wider">Upload Files</span>
            </div>
            <div className={`flex items-center gap-2 border-b-2 pb-2 ${currentStep === "review_files" ? "border-emerald-600 text-emerald-700 font-bold" : "border-transparent text-slate-400"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === "review_files" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>3</div>
              <span className="text-xs font-mono uppercase tracking-wider">Review & Calibrate</span>
            </div>
          </div>

          <div className="p-6">
            
            {/* STEP 1: FORM PARAMETERS */}
            {currentStep === "new_project" && (
              <form onSubmit={handleStep1Submit} className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-emerald-50 border border-emerald-200/55 rounded-lg p-4 flex gap-3 text-emerald-800 text-xs leading-relaxed">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Project Ingestion Protocol</span>: Setup a new consultation coordinate envelope. Uploading property layout blueprints immediately indexes them for automated sector grid mappings.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500">Project Profile Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pune Commercial Office, Floor 3"
                      value={projectForm.name}
                      onChange={e => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-sm rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500">Assign Target Property *</label>
                    <select
                      required
                      value={projectForm.propertyId}
                      onChange={e => setProjectForm(prev => ({ ...prev, propertyId: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-sm rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="">-- Choose registered real estate --</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.ownerName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500">Project Type Classification</label>
                    <select
                      value={projectForm.projectType}
                      onChange={e => setProjectForm(prev => ({ ...prev, projectType: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-200 text-sm rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="New Construction">New Construction</option>
                      <option value="Existing Building">Existing Building</option>
                      <option value="Renovation">Renovation</option>
                      <option value="Commercial Audit">Commercial Audit</option>
                      <option value="Industrial Audit">Industrial Audit</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500">Consultation Priority</label>
                    <select
                      value={projectForm.priority}
                      onChange={e => setProjectForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-200 text-sm rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="High">High (Immediate Site Visit)</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500">Lead Consultant Advisor</label>
                    <select
                      value={projectForm.assignedConsultant}
                      onChange={e => setProjectForm(prev => ({ ...prev, assignedConsultant: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-sm rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Achyuta Rao">Senior Advisor Achyuta Rao</option>
                      <option value="Devendra Sharma">Consultant Devendra Sharma</option>
                      <option value="Pooja Hegde">Vastu Expert Pooja Hegde</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-mono font-bold text-xs tracking-wide shadow flex items-center gap-2 cursor-pointer"
                  >
                    <span>NEXT: UPLOAD FILES</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: MULTI FILE DRAG AND DROP UPLOAD CONTAINER */}
            {currentStep === "upload_files" && (
              <div className="space-y-6">
                
                {/* Drag and Drop Container Area */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 transition-all duration-200 cursor-pointer ${
                    dragActive 
                      ? "border-emerald-600 bg-emerald-50/50" 
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100/50 hover:border-emerald-500"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff,.tif,.dxf,.dwg,.ifc,.rvt,.docx,.xlsx,.txt"
                  />
                  
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                    <Upload className="w-6 h-6 animate-bounce" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-mono">
                      Drag & Drop Consultation Files Here
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Entire viewport supports drop. Upload architectural site blueprints, CAD files, client questionnaires, high-res site photos, or structural reports.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 font-mono font-semibold text-xs hover:bg-slate-100 shadow-sm"
                  >
                    BROWSE FILES
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400 font-mono">
                    <span>• Blueprints (PDF, PNG, JPG, TIFF)</span>
                    <span>• CAD (DXF, DWG)</span>
                    <span>• Documents (DOCX, XLSX, TXT)</span>
                    <span>• Photos (PNG, JPEG)</span>
                  </div>
                </div>

                {/* Validation Warnings Logger */}
                {validationWarnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold font-mono uppercase">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Pipeline Validation log ({validationWarnings.length})</span>
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-slate-600 font-mono leading-relaxed">
                      {validationWarnings.map((warn, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-amber-500">•</span>
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In-Flight Upload Process Monitors */}
                {tempFiles.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Workspace Upload Queue ({tempFiles.length} files)</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tempFiles.map(fileObj => (
                        <div key={fileObj.id} className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-start gap-3 relative overflow-hidden group">
                          
                          {/* Indicator line on bottom */}
                          <div 
                            className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                              fileObj.status === "Completed" ? "bg-emerald-500 w-full" : 
                              fileObj.status === "Failed" ? "bg-rose-500 w-full" : "bg-emerald-600"
                            }`} 
                            style={{ width: fileObj.status === "Uploading" ? `${fileObj.progress}%` : "100%" }}
                          />

                          {/* Thumbnail / Icon representation */}
                          {fileObj.previewUrl ? (
                            <img 
                              src={fileObj.previewUrl} 
                              alt="Upload preview" 
                              className="w-12 h-12 rounded object-cover border border-slate-200 bg-white"
                            />
                          ) : (
                            renderFileIcon(fileObj.category, fileObj.name)
                          )}

                          {/* File Metadata & Progress display */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-mono text-slate-900 truncate pr-2" title={fileObj.name}>
                                {fileObj.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {formatBytes(fileObj.size)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-500">
                              <span className="px-1.5 py-0.5 bg-slate-200 rounded uppercase text-[8px]">{fileObj.category}</span>
                              <span>•</span>
                              {fileObj.status === "Uploading" && (
                                <span className="text-emerald-600 font-bold">Uploading {fileObj.progress}%</span>
                              )}
                              {fileObj.status === "Completed" && (
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Indexed
                                </span>
                              )}
                              {fileObj.status === "Failed" && (
                                <span className="text-rose-600 font-bold">Failed</span>
                              )}
                            </div>

                            {/* Error text */}
                            {fileObj.error && (
                              <p className="text-[9px] font-mono text-rose-500 leading-normal mt-1">{fileObj.error}</p>
                            )}
                          </div>

                          {/* Queue Action Controls */}
                          <div className="shrink-0 flex items-center gap-1.5 self-center">
                            {fileObj.status === "Failed" && (
                              <button
                                onClick={() => handleRetryUpload(fileObj.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Retry Upload"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveTempFile(fileObj.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded"
                              title="Delete Item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step navigation */}
                <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep("new_project")}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-mono font-bold text-xs"
                  >
                    BACK
                  </button>
                  <button
                    onClick={() => {
                      if (tempFiles.length === 0) {
                        alert("Please upload at least one file to proceed with spatial calibration.");
                        return;
                      }
                      setCurrentStep("review_files");
                    }}
                    disabled={tempFiles.some(f => f.status === "Uploading")}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded font-mono font-bold text-xs tracking-wide shadow flex items-center gap-2 cursor-pointer"
                  >
                    <span>NEXT: REVIEW FILES</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: REVIEW AND EDIT TEMPORARY FILES */}
            {currentStep === "review_files" && (
              <div className="space-y-6">
                
                <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-lg">
                  <div className="flex items-center gap-1.5 text-slate-800 text-xs font-mono font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Import File Diagnostics: Safe Package Prepared</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-mono mt-1.5">
                    Your documents have successfully cleared virus scanning, spatial integrity, and corruption testing. Before committing layout blueprints to permanent database servers, review and adjust metadata handles below.
                  </p>
                </div>

                {/* Table list of committed uploads */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 grid grid-cols-12 text-[10px] font-mono font-bold uppercase text-slate-400">
                    <div className="col-span-5">File Name & Identifier</div>
                    <div className="col-span-2">Mime Type</div>
                    <div className="col-span-2">Committed Size</div>
                    <div className="col-span-1">Folder</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {tempFiles.filter(tf => tf.status === "Completed").map(fileObj => (
                      <div key={fileObj.id} className="px-4 py-3 grid grid-cols-12 items-center text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                        
                        {/* Title & Edit form */}
                        <div className="col-span-5 flex items-center gap-3">
                          {fileObj.previewUrl ? (
                            <img 
                              src={fileObj.previewUrl} 
                              alt="Thumbnail" 
                              className="w-10 h-10 rounded border border-slate-200 bg-white object-cover"
                            />
                          ) : (
                            renderFileIcon(fileObj.category, fileObj.name)
                          )}
                          <div className="truncate min-w-0 flex-1">
                            {editingFileId === fileObj.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editingFileName}
                                  onChange={e => setEditingFileName(e.target.value)}
                                  className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-emerald-600"
                                />
                                <button
                                  onClick={() => handleSaveRename(fileObj.id)}
                                  className="p-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded hover:bg-emerald-100"
                                  title="Save Name"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingFileId(null)}
                                  className="p-1 bg-slate-50 text-slate-400 border border-slate-150 rounded"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-slate-800 font-mono truncate block" title={fileObj.name}>
                                  {fileObj.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono block">Original: {fileObj.file.name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mime Type */}
                        <div className="col-span-2 font-mono text-[10px] text-slate-500 truncate">
                          {fileObj.type}
                        </div>

                        {/* Size */}
                        <div className="col-span-2 font-mono text-[11px] text-slate-500">
                          {formatBytes(fileObj.size)}
                        </div>

                        {/* Category badge */}
                        <div className="col-span-1">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] uppercase font-mono font-semibold text-slate-600">
                            {fileObj.category}
                          </span>
                        </div>

                        {/* Action buttons (Rename, Replace, Delete) */}
                        <div className="col-span-2 text-right flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTriggerRename(fileObj.id, fileObj.name)}
                            className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200"
                            title="Rename Filename"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Replace Trigger */}
                          <label className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded border border-transparent hover:border-sky-200 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              onChange={e => handleReplaceFile(fileObj.id, e)}
                              className="hidden"
                              accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff,.tif,.dxf,.dwg,.docx,.xlsx,.txt"
                            />
                          </label>

                          <button
                            onClick={() => handleRemoveTempFile(fileObj.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Action panel footer */}
                <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep("upload_files")}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-mono font-bold text-xs"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleFinalizeProjectWizard}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-mono font-bold text-xs tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>COMMIT & CONTINUE TO CALIBRATION</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      ) : (
        /* ----------------- MODE B: ENTERPRISE PROJECT FILE MANAGER / VAULT ----------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* LEFT: Project selector and folder system */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 space-y-6">
            
            {/* Project Selection Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500">
                ACTIVE CONSULTATION FILE VAULT
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 rounded p-2.5 focus:outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="">-- Choose active consultation file --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                ))}
              </select>
            </div>

            {/* Folder Tabs System */}
            {activeProject && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  FOLDER SHELVES
                </h3>
                
                <div className="space-y-1">
                  {[
                    { key: "All", label: "All Repository Files", count: activeProject.files?.length || 0, icon: FolderOpen },
                    { key: "Blueprints", label: "📁 Layout Blueprints", count: activeProject.files?.filter(f => f.category === "Blueprints").length || 0, icon: File },
                    { key: "CAD", label: "📐 CAD Drawings", count: activeProject.files?.filter(f => f.category === "CAD").length || 0, icon: Layers },
                    { key: "Images", label: "🖼️ Property Photos", count: activeProject.files?.filter(f => f.category === "Images").length || 0, icon: Image },
                    { key: "Documents", label: "📄 Client Documents", count: activeProject.files?.filter(f => f.category === "Documents").length || 0, icon: FileText },
                    { key: "Reports", label: "📋 Evaluation Reports", count: activeProject.files?.filter(f => f.category === "Reports").length || 0, icon: CheckCircle }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveFolderTab(tab.key as any)}
                        className={`w-full text-left px-3 py-2 rounded text-xs font-medium font-mono flex items-center justify-between transition-colors ${
                          activeFolderTab === tab.key 
                            ? "bg-slate-100 text-slate-900 font-bold border-l-4 border-emerald-600" 
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{tab.label}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full shrink-0 font-bold ml-2">
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1 text-[11px] leading-relaxed">
                    <span className="font-bold font-mono text-slate-700 uppercase block">Workspace Reference</span>
                    <p className="text-slate-500 font-mono">
                      Property Owner: <strong className="text-slate-900">{activeProject.clientName}</strong><br />
                      Assigned Site: <strong className="text-slate-900">{activeProject.propertyName}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Active Folder Explorer Grid */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 space-y-5">
            
            {activeProject ? (
              <>
                {/* Vault Explorer Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold font-mono text-slate-900 uppercase">
                      Vault Explorer: {activeFolderTab === "All" ? "All Repository Files" : `${activeFolderTab} Folder`}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {activeProject.code} • Last adjusted {activeProject.lastUpdated}
                    </p>
                  </div>

                  {/* Vault Search and Folder Add */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search folder files..."
                        value={fileSearchQuery}
                        onChange={e => setFileSearchQuery(e.target.value)}
                        className="bg-slate-50 text-xs rounded pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:border-emerald-600 w-44 font-mono"
                      />
                    </div>

                    {/* Direct Upload button */}
                    <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold rounded flex items-center gap-1 cursor-pointer transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      <span>UPLOAD FILE</span>
                      <input
                        ref={vaultFileInputRef}
                        type="file"
                        multiple
                        onChange={handleVaultFileDrop}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff,.tif,.dxf,.dwg,.docx,.xlsx,.txt"
                      />
                    </label>
                  </div>
                </div>

                {/* File Grid lists */}
                {(() => {
                  const filesToShow = (activeProject.files || []).filter(f => {
                    const matchesCategory = activeFolderTab === "All" || f.category === activeFolderTab;
                    const matchesSearch = f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) || f.originalName.toLowerCase().includes(fileSearchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  });

                  if (filesToShow.length === 0) {
                    return (
                      <div className="p-16 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                        <Folder className="w-10 h-10 text-slate-300" />
                        <div>
                          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase">No vault items found</h4>
                          <p className="text-[11px] text-slate-500 font-mono max-w-sm">
                            This shelf contains no items matching "{fileSearchQuery || activeFolderTab}". Click "Upload File" above to add new records permanently.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filesToShow.map(file => (
                        <div key={file.id} className="border border-slate-200 rounded-lg p-3.5 hover:shadow-sm transition-all bg-slate-50/50 flex gap-3 group relative overflow-hidden">
                          
                          {/* File preview */}
                          {file.category === "Images" && file.url ? (
                            <img 
                              src={file.url} 
                              alt="Vault Preview" 
                              className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0 bg-white"
                            />
                          ) : (
                            renderFileIcon(file.category, file.name)
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-950 font-mono truncate" title={file.name}>
                              {file.name}
                            </h4>
                            <p className="text-[9px] font-mono text-slate-400 mt-0.5 truncate">Original: {file.originalName}</p>
                            
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-2">
                              <span className="px-1.5 py-0.5 bg-slate-200 rounded uppercase text-[8px] font-bold">{file.category}</span>
                              <span>•</span>
                              <span>{formatBytes(file.size)}</span>
                            </div>
                          </div>

                          {/* Float delete/view handles */}
                          <div className="shrink-0 flex flex-col justify-between items-end">
                            <button
                              onClick={() => handleDeleteVaultFile(file.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete Permanent File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              referrerPolicy="no-referrer"
                              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded mt-2"
                              title="Download/Open File"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Compass redirection helper */}
                <div className="bg-slate-50/70 rounded-lg border border-slate-200 p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Calibrated layout blueprint ready inside Vastu calibration studio.</span>
                  </div>
                  <button
                    onClick={() => {
                      const prop = properties.find(p => p.id === activeProject.propertyId);
                      if (prop) onNavigateToWorkspace(prop);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-mono font-bold rounded cursor-pointer"
                  >
                    CONTINUE TO COMPASS STUDIO
                  </button>
                </div>
              </>
            ) : (
              <div className="p-12 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3 h-64">
                <Folder className="w-12 h-12 text-slate-300" />
                <div>
                  <h4 className="text-sm font-mono font-bold text-slate-900 uppercase">Select active consultation file</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto">
                    Choose an ongoing project dossier from the selector on the left to index, view, and analyze floor plan coordinates.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* SPRINT 16A REQUIREMENTS: FUTURE CLOUD SYNC ARCHITECTURE CONFIGURATION */}
          <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold font-mono text-slate-950 uppercase flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-500 animate-pulse" />
                <span>Urjaflux Cloud Sync Integration Engine</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Technical Blueprint Architecture: Ready for Google Drive API, Dropbox Webhook triggers, OneDrive continuously-mapped drives, and offline field capture.
              </p>
            </div>

            {/* Cloud Tabs selectors */}
            <div className="border-b border-slate-100 flex items-center gap-2">
              {[
                { id: "gdrive", label: "Google Drive OAuth" },
                { id: "dropbox", label: "Dropbox Webhooks" },
                { id: "onedrive", label: "OneDrive continuous sync" },
                { id: "mobile", label: "Mobile Field Capture app" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveCloudTab(t.id as any)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-t border-b-2 transition-colors cursor-pointer ${
                    activeCloudTab === t.id 
                      ? "border-emerald-600 text-slate-900 font-bold" 
                      : "border-transparent text-slate-400 hover:text-slate-950"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Cloud Details Panel */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 text-xs">
              
              {activeCloudTab === "gdrive" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  <div className="md:col-span-7 space-y-3">
                    <span className="font-bold text-slate-900 font-mono block">Google Picker & Drive API architecture</span>
                    <p className="text-slate-500 font-mono leading-relaxed text-[11px]">
                      Maps project folders directly into designated client Google Shared Drives. When folders are populated in Drive, the webhook controller auto-indexes, virus-checks, and pushes layout sheets into Urjaflux.
                    </p>
                    <div className="space-y-1.5 font-mono text-[10px]">
                      <span className="text-slate-400">SCOPES:</span>
                      <code className="block bg-slate-100 p-1.5 rounded text-rose-500 truncate">https://www.googleapis.com/auth/drive.readonly, https://www.googleapis.com/auth/drive.file</code>
                    </div>
                  </div>
                  <div className="md:col-span-5 p-3.5 bg-white rounded border border-slate-200 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-500 uppercase">Google Client ID</label>
                      <input
                        type="text"
                        placeholder="apps.googleusercontent.com"
                        value={cloudConfig.clientId}
                        onChange={e => setCloudConfig(prev => ({ ...prev, clientId: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoSync"
                        checked={cloudConfig.enableAutoSync}
                        onChange={e => setCloudConfig(prev => ({ ...prev, enableAutoSync: e.target.checked }))}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="autoSync" className="text-[10px] font-mono font-bold text-slate-700">Enable drive continuous sync</label>
                    </div>
                  </div>
                </div>
              )}

              {activeCloudTab === "dropbox" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  <div className="md:col-span-7 space-y-3">
                    <span className="font-bold text-slate-900 font-mono block">Dropbox Webhooks Sync Engine</span>
                    <p className="text-slate-500 font-mono leading-relaxed text-[11px]">
                      Dropbox webhooks triggers immediate sync upon any architectural CAD revisions saving directly from AutoCAD. Listens on secure socket wrappers for payload delivery.
                    </p>
                    <div className="p-2 bg-slate-100 rounded text-[9px] font-mono text-emerald-700">
                      POST https://urjaflux.ai/api/webhooks/dropbox-handshake - Status Active
                    </div>
                  </div>
                  <div className="md:col-span-5 p-3.5 bg-white rounded border border-slate-200 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-500 uppercase">Team Target folder path</label>
                      <input
                        type="text"
                        placeholder="/UrjafluxSync"
                        value={cloudConfig.teamFolder}
                        onChange={e => setCloudConfig(prev => ({ ...prev, teamFolder: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeCloudTab === "onedrive" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  <div className="md:col-span-7 space-y-3">
                    <span className="font-bold text-slate-900 font-mono block">OneDrive MS Graph endpoint integration</span>
                    <p className="text-slate-500 font-mono leading-relaxed text-[11px]">
                      Synchronize team folders across Microsoft 365. Restores original layer layouts from DXF/DWG formats without losing geometry matrices.
                    </p>
                  </div>
                  <div className="md:col-span-5 p-3.5 bg-white rounded border border-slate-200 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-500 uppercase">Poll interval (Minutes)</label>
                      <input
                        type="number"
                        placeholder="15"
                        value={cloudConfig.syncInterval}
                        onChange={e => setCloudConfig(prev => ({ ...prev, syncInterval: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeCloudTab === "mobile" && (
                <div className="flex flex-col md:flex-row items-center gap-6 p-2">
                  <div className="p-3 bg-white rounded border border-slate-200 shrink-0">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Urjaflux Field Photo Capture App</span>
                    </span>
                    <p className="text-slate-500 font-mono leading-relaxed text-[11px] max-w-xl">
                      Scan QR code on your mobile device to download the offline client. Authenticates secure JWT connection tokens. Take property photos or record high-density site measurements on-site to have them instantly uploaded into this project's photo folder!
                    </p>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold block">✓ Secure JWT Token Handshake Ready</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
