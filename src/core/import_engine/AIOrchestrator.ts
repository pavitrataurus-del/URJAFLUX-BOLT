import { HybridSearchEngine } from "./HybridSearchEngine";

export class AIOrchestrator {
  private searchEngine: HybridSearchEngine;
  
  constructor(searchEngine: HybridSearchEngine) {
    this.searchEngine = searchEngine;
  }
  
  public async answerQuestion(query: string): Promise<string> {
    // 1. Intent Analysis & Search
    // Get more units initially for pruning
    let contextUnits = await this.searchEngine.search(query, 20);
    
    // Duplicate Removal & Confidence Ordering
    const uniqueContexts = new Map<string, typeof contextUnits[0]>();
    for (const unit of contextUnits) {
       // A simple deduplication by content hash / exact match
       if (!uniqueContexts.has(unit.content)) {
          uniqueContexts.set(unit.content, unit);
       }
    }
    
    contextUnits = Array.from(uniqueContexts.values())
      .sort((a, b) => b.score - a.score);
      
    // Maximum token budget (~8000 chars roughly to fit in context window comfortably)
    let contextStr = "";
    let currentLength = 0;
    const MAX_LENGTH = 15000; 
    let addedCount = 0;
    
    for (let i = 0; i < contextUnits.length; i++) {
       const u = contextUnits[i];
       const block = `[Evidence ${i+1}, Confidence Score: ${u.score.toFixed(2)}]: ${u.content}\n\n`;
       if (currentLength + block.length > MAX_LENGTH) {
          break;
       }
       contextStr += block;
       currentLength += block.length;
       addedCount++;
    }
    
    if (addedCount === 0) {
      return "This information is not available in the approved Knowledge Base.";
    }
    
    // 3. AI Reasoning (Conflict resolution & fact grounding)
    const prompt = `Based strictly on the following highly-ranked evidence from our imported enterprise knowledge base, answer the user's question. 

INSTRUCTIONS:
1. You MUST NEVER hallucinate or invent facts. 
2. If the answer is not in the context, reply exactly with: "This information is not available in the approved Knowledge Base."
3. If multiple pieces of evidence disagree (Knowledge Conflict Engine), detect the conflict, rank the evidence based on the Confidence Score, and prefer the higher-quality evidence while noting the discrepancy.
4. Provide a synthesized, single verified answer.
    
CONTEXT EVIDENCE:
${contextStr}
    
USER QUESTION: ${query}`;
    
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: prompt, model: "gemini-3.6-flash" }),
      });
      if (!response.ok) {
        throw new Error("Failed to communicate with AI endpoint.");
      }
      const data = await response.json();
      return data.text;
    } catch (e) {
      console.error("[AIOrchestrator] Failed to fetch AI response:", e);
      return "An error occurred while generating the AI response.";
    }
  }
}
