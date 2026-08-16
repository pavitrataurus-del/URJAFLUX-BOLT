import { TextCleaningEngine } from "./TextCleaningEngine";
import { EmbeddingClient } from "./EmbeddingClient";
import { storageService } from "../../services/EnterpriseKnowledgeStorageService";

export interface KnowledgeUnit {
  id: string;
  type: "TEXT" | "RULE" | "FORMULA" | "EVIDENCE" | "DEFINITION" | "CONCEPT" | "MEASUREMENT" | "RELATIONSHIP" | "PROCEDURE" | "WARNING" | "RECOMMENDATION";
  content: string;
  metadata?: any;
}

export class KnowledgeExtractionEngine {
  public static async processAndStore(rawText: string, bookId: string, pageNumber: number): Promise<KnowledgeUnit[]> {
    const cleanText = TextCleaningEngine.normalize(rawText);
    const units: KnowledgeUnit[] = [];
    
    // Semantic Chunker: split by paragraphs, group small ones
    const paragraphs = cleanText.split(/\n\n/);
    let currentChunk = "";
    const chunks: string[] = [];
    
    for (const p of paragraphs) {
      if (p.trim().length === 0) continue;
      if (currentChunk.length + p.length < 1500) {
         currentChunk += (currentChunk ? "\n\n" : "") + p.trim();
      } else {
         if (currentChunk) chunks.push(currentChunk);
         currentChunk = p.trim();
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    
    // Use AI to extract structured knowledge units from each chunk
    for (const chunk of chunks) {
       try {
         const extracted = await this.extractWithAI(chunk, bookId, pageNumber);
         units.push(...extracted);
       } catch (e) {
         console.error("[KnowledgeExtractionEngine] AI extraction failed, falling back to heuristic:", e);
         units.push(this.createUnit(chunk, bookId, pageNumber));
       }
    }
    
    // Generate embeddings in batch
    if (units.length > 0) {
      try {
         const texts = units.map(u => u.content);
         const embeddings = await EmbeddingClient.getEmbeddings(texts);
         
         const now = new Date().toISOString();
         for (let i = 0; i < units.length; i++) {
           const unit = units[i];
           const vec = embeddings[i];
           
           if (vec) {
             // Save to DB
             await storageService.embeddingRepo.put({
               id: unit.id,
               bookId,
               entityId: unit.id,
               provider: "google",
               model: "gemini-embedding-2",
               dimensions: vec.length,
               vector: vec,
               textChunk: unit.content,
               createdAt: now
             });
             
             await storageService.searchRepo.put({
               id: `SEARCH-${unit.id}`,
               bookId,
               token: unit.content.substring(0, 100).toLowerCase(),
               entityType: (unit.type === "RULE" || unit.type === "FORMULA" || unit.type === "EVIDENCE") ? unit.type.toLowerCase() as any : "evidence",
               entityId: unit.id,
               tfIdfScore: 1.0,
               contextSnippet: unit.content.substring(0, 200),
               createdAt: now
             });
           }
         }
      } catch (e) {
         console.error("[KnowledgeExtractionEngine] Failed to generate embeddings:", e);
      }
    }
    
    return units;
  }
  
  private static async extractWithAI(text: string, bookId: string, pageNumber: number): Promise<KnowledgeUnit[]> {
    const prompt = `Analyze the following text and extract discrete knowledge units. 
Categorize each unit into ONE of these types: "TEXT", "RULE", "FORMULA", "DEFINITION", "CONCEPT", "MEASUREMENT", "RELATIONSHIP", "PROCEDURE", "WARNING", "RECOMMENDATION".
Return a JSON array of objects. Each object must have a "type" (string) and "content" (string). Do not include markdown formatting like \`\`\`json.
Text:
${text}`;

    const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: prompt, model: "gemini-3.6-flash" }),
    });
    
    if (!response.ok) throw new Error("AI extraction failed.");
    const data = await response.json();
    
    let jsonStr = data.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```$/, '');
    }
    
    const parsed = JSON.parse(jsonStr);
    return parsed.map((item: any) => ({
      id: `UNIT-${bookId}-P${pageNumber}-${Math.random().toString(36).substring(2, 9)}`,
      type: item.type,
      content: item.content,
      metadata: { pageNumber }
    }));
  }
  
  private static createUnit(text: string, bookId: string, pageNumber: number): KnowledgeUnit {
    let type: any = "TEXT";
    if (text.toLowerCase().includes("rule:") || text.toLowerCase().includes("must")) type = "RULE";
    else if (text.includes("=") || text.includes("+") || /formula/i.test(text)) type = "FORMULA";
    return {
      id: `UNIT-${bookId}-P${pageNumber}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      content: text,
      metadata: { pageNumber }
    };
  }
}
