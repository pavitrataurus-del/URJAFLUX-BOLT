import React, { useState } from "react";
import { AIOrchestrator } from "../../core/import_engine/AIOrchestrator";
import { HybridSearchEngine } from "../../core/import_engine/HybridSearchEngine";
import { Loader2, Send } from "lucide-react";

export function AIKnowledgeChat() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResponse(null);
    try {
      const searchEngine = HybridSearchEngine.getInstance();
      const orchestrator = new AIOrchestrator(searchEngine);
      const ans = await orchestrator.answerQuestion(query);
      setResponse(ans);
    } catch (err) {
      console.error(err);
      setResponse("An error occurred while communicating with the AI Engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-4 font-mono uppercase tracking-wider flex items-center gap-2">
        <span>AI Knowledge Retrieval & Reasoning</span>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded">Live AI Engine</span>
      </h3>
      
      <form onSubmit={handleAsk} className="flex gap-3 mb-6">
        <input 
          type="text" 
          className="flex-1 border border-slate-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono"
          placeholder="Ask a question about the imported books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-bold disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          ASK AI
        </button>
      </form>
      
      {response && (
        <div className="bg-slate-50 border border-slate-200 rounded p-5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">AI Response</h4>
          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
