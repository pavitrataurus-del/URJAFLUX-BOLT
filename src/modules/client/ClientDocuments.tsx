import React, { useState, useRef } from "react";
import { Client } from "../../types/app";
import { 
  FileText, UploadCloud, Trash2, Calendar, File, Download, Layers, ShieldCheck, ClipboardList
} from "lucide-react";

interface ClientDocumentsProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => Promise<any>;
}

export const ClientDocuments: React.FC<ClientDocumentsProps> = ({ client, onUpdateClient }) => {
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState<any>("FloorPlan");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = client.documents || [];

  const handleAddDocument = async (name: string, type: string, url: string) => {
    setLoading(true);
    try {
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: name || "Unnamed Document",
        type: type as any,
        url: url || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&fit=crop",
        date: new Date().toISOString().split("T")[0]
      };

      const updatedClient: Client = {
        ...client,
        documents: [...documents, newDoc]
      };

      await onUpdateClient(updatedClient);
      setDocName("");
    } catch (err) {
      console.error("Error saving document record:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const updatedClient: Client = {
        ...client,
        documents: documents.filter(d => d.id !== docId)
      };
      await onUpdateClient(updatedClient);
    } catch (err) {
      console.error("Error deleting document record:", err);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    // Read name or set fallback
    const computedName = docName.trim() || file.name.split(".")[0];
    const dummyUrl = URL.createObjectURL(file) || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&fit=crop";
    handleAddDocument(computedName, docType, dummyUrl);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Document Vault & Blueprint Records
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            DURABLE REPOSITORY FOR ARCHITECT FILES, CONTRACTS, AND INVOICES
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Document upload form (Left Column) */}
        <div className="p-5 bg-white/40 border border-slate-200 rounded-xl space-y-4 md:col-span-1">
          <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-950 pb-2">
            Ingest Document
          </h4>
          
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Document Title</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g., Ground Floor Blueprint"
              className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Category Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
            >
              <option value="FloorPlan">Floor Plan Blueprint</option>
              <option value="Blueprint">Site Blueprint (Veda Grid)</option>
              <option value="Contract">Consultation Contract</option>
              <option value="Invoice">Payment Invoice</option>
              <option value="Report">Historic PDF Report</option>
              <option value="Notes">Clerical / Survey Notes</option>
            </select>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`py-8 px-4 border border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              isDragging 
                ? "border-emerald-500 bg-emerald-950/20 text-emerald-300" 
                : "border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-700 text-slate-400"
            }`}
          >
            <UploadCloud className="w-8 h-8 text-emerald-400 mb-2 shrink-0" />
            <p className="text-xs font-medium text-slate-200">Drag & drop document here</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Or click to select local file</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Document list (Right Column) */}
        <div className="p-5 bg-white/20 border border-slate-200 rounded-xl md:col-span-2 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-950 pb-2">
            Archived Files ({documents.length})
          </h4>

          {documents.length === 0 ? (
            <div className="text-center py-10">
              <File className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-400 text-xs font-mono">Vault is empty. Register files in the sidebar.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">{doc.name}</h5>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                        <span className="text-emerald-400 uppercase tracking-wider">{doc.type}</span>
                        <span>•</span>
                        <span>{doc.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={doc.url}
                      download={doc.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download Document"
                      className="p-1.5 bg-white hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-850 rounded cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      title="Delete File"
                      className="p-1.5 bg-white hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-850 rounded cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ClientDocuments;
