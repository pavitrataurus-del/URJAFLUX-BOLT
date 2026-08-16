// Module 2: Document Ingestion Pipeline
import { DocumentChunk, ChunkType, IngestionJob } from "../../types/knowledgeIntelligence";

class DocumentIngestionPipelineStore {
  private jobs: Map<string, IngestionJob> = new Map();

  // PII Scrubbing Rules
  private piiPatterns = [
    { name: "EMAIL", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "[REDACTED_EMAIL]" },
    { name: "PHONE", regex: /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, replacement: "[REDACTED_PHONE]" },
    { name: "SSN_TAX", regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[REDACTED_TAX_ID]" },
    { name: "CARD", regex: /\b(?:\d[ -]*?){13,16}\b/g, replacement: "[REDACTED_CARD]" }
  ];

  public scrubPII(text: string): { cleanText: string; redactedCount: number } {
    let cleanText = text;
    let redactedCount = 0;

    this.piiPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern.regex);
      if (matches) {
        redactedCount += matches.length;
        cleanText = cleanText.replace(pattern.regex, pattern.replacement);
      }
    });

    return { cleanText, redactedCount };
  }

  public processIngestion(
    documentId: string,
    documentTitle: string,
    rawContent: string,
    tenantId: string,
    sourceType: "MARKDOWN" | "TXT" | "PDF" | "JSON" | "WEBHOOK" | "OCR_SCAN" = "MARKDOWN"
  ): { chunks: DocumentChunk[]; job: IngestionJob } {
    const jobId = `JOB-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    const job: IngestionJob = {
      id: jobId,
      tenantId,
      documentTitle,
      sourceType,
      status: "PROCESSING",
      progressPercentage: 10,
      extractedChunksCount: 0,
      piiRedactedCount: 0,
      startedAt: now
    };

    this.jobs.set(jobId, job);

    // 1. Scrub PII
    const { cleanText, redactedCount } = this.scrubPII(rawContent);
    job.piiRedactedCount = redactedCount;
    job.progressPercentage = 30;

    // 2. Perform Structural Chunking
    const chunks: DocumentChunk[] = [];
    const lines = cleanText.split("\n");

    let currentHeadingPath: string[] = [documentTitle];
    let currentBlock: string[] = [];
    let pageNumber = 1;
    let chunkIndex = 0;

    const flushChunk = (type: ChunkType, verseNumber?: string) => {
      if (currentBlock.length === 0) return;
      const contentStr = currentBlock.join("\n").trim();
      if (!contentStr) return;

      const words = contentStr.split(/\s+/).filter(Boolean);
      const chunkId = `CHUNK-${documentId}-${chunkIndex}`;

      chunks.push({
        id: chunkId,
        documentId,
        tenantId,
        chunkIndex,
        content: contentStr,
        type,
        headingPath: [...currentHeadingPath],
        pageNumber,
        verseNumber,
        metadata: {
          wordCount: words.length,
          headingContext: currentHeadingPath.join(" > ")
        },
        tokenCount: Math.ceil(words.length * 1.3),
        createdAt: new Date().toISOString()
      });

      chunkIndex++;
      currentBlock = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Page marker
      if (line.match(/^Page\s+(\d+)/i) || line.match(/^--- Page \d+ ---/i)) {
        const match = line.match(/\d+/);
        if (match) pageNumber = parseInt(match[0], 10);
        continue;
      }

      // Heading detection
      if (line.startsWith("#")) {
        flushChunk("PARAGRAPH");
        const level = line.match(/^#+/)?.[0].length || 1;
        const headingText = line.replace(/^#+\s*/, "").trim();

        if (level === 1) currentHeadingPath = [documentTitle, headingText];
        else if (level === 2) currentHeadingPath = [currentHeadingPath[0] || documentTitle, headingText];
        else currentHeadingPath.push(headingText);

        currentBlock.push(line);
        flushChunk("HEADING");
        continue;
      }

      // Formula or Verse detection
      if (line.toLowerCase().startsWith("formula:") || line.toLowerCase().startsWith("verse:")) {
        flushChunk("PARAGRAPH");
        const verseMatch = line.match(/Verse\s+([IVX0-9.]+)/i);
        currentBlock.push(line);
        flushChunk(line.toLowerCase().startsWith("formula:") ? "FORMULA" : "VERSE", verseMatch ? verseMatch[1] : undefined);
        continue;
      }

      if (line === "") {
        if (currentBlock.length > 0) {
          flushChunk("PARAGRAPH");
        }
      } else {
        currentBlock.push(line);
      }
    }

    // Flush any trailing block
    flushChunk("PARAGRAPH");

    job.status = "COMPLETED";
    job.progressPercentage = 100;
    job.extractedChunksCount = chunks.length;
    job.completedAt = new Date().toISOString();

    this.jobs.set(jobId, job);

    return { chunks, job };
  }

  public getJobs(tenantId: string): IngestionJob[] {
    return Array.from(this.jobs.values()).filter(j => j.tenantId === tenantId);
  }
}

export const DocumentIngestionPipeline = new DocumentIngestionPipelineStore();
