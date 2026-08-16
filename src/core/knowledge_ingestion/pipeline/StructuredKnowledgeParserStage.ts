import { 
  IStructuredKnowledgeItem, 
  KnowledgeDomain, 
  KnowledgeItemType, 
  EvidencePriority,
  IKnowledgeSourceRegistration,
  ILineDetail 
} from "../types/knowledgePipeline.types";

export class StructuredKnowledgeParserStage {
  public static readonly STAGE_NAME = "STRUCTURED_KNOWLEDGE_PARSING";

  public execute(
    source: IKnowledgeSourceRegistration,
    lines: ILineDetail[],
    cleanText: string
  ): IStructuredKnowledgeItem[] {
    const items: IStructuredKnowledgeItem[] = [];
    const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 10);

    let currentChapter = "General Shastra Principles";

    paragraphs.forEach((pText, pIdx) => {
      const trimmed = pText.trim();
      
      // Update chapter/section if line looks like heading
      if (/^#|^Chapter|^Sutra|^Section|^Topic/i.test(trimmed)) {
        currentChapter = trimmed.replace(/^#+\s*/, "").slice(0, 80);
        return;
      }

      // Find matching line index and page number
      const matchingLine = lines.find(l => l.cleanText.includes(trimmed.slice(0, 30)));
      const pageNumber = matchingLine ? matchingLine.pageNumber : Math.min(1, Math.ceil((pIdx + 1) / 3));
      const lineStart = matchingLine ? matchingLine.lineIndex : (pIdx * 5) + 1;
      const lineEnd = lineStart + Math.ceil(trimmed.length / 60);

      // Extract Item Type
      const itemType = this.classifyItemType(trimmed);

      // Extract target zones, planets, chakras
      const targetZones = this.extractZones(trimmed);
      const targetPlanets = this.extractPlanets(trimmed);
      const targetChakras = this.extractChakras(trimmed);

      // Extract conditions, exceptions, remedies
      const conditions = this.extractConditions(trimmed);
      const exceptions = this.extractExceptions(trimmed);
      const remedies = this.extractRemedies(trimmed);

      // Evidence Priority
      const evidencePriority: EvidencePriority = 
        source.domain === "Vastu" || source.domain === "LalKitab" ? "HIGH" : "MEDIUM";

      const itemId = `KITEM-${source.sourceId}-${pIdx + 1}`;

      const citationId = `CIT-${itemId}`;
      const traceabilityHash = this.computeTraceabilityHash(source.sourceId, pageNumber, lineStart, trimmed);

      items.push({
        id: itemId,
        sourceId: source.sourceId,
        itemType,
        title: `${source.domain} ${itemType}: ${trimmed.slice(0, 50)}...`,
        content: trimmed,
        rawQuote: trimmed,
        domain: source.domain,
        targetZones,
        targetPlanets,
        targetChakras,
        conditions,
        exceptions,
        remedies,
        evidencePriority,
        confidenceScore: Math.min(0.99, Math.max(0.85, matchingLine ? matchingLine.confidence / 100 : 0.90)),
        pageNumber,
        lineStart,
        lineEnd,
        chapterSection: currentChapter,
        citation: {
          citationId,
          sourceId: source.sourceId,
          sourceTitle: source.title,
          author: source.author,
          edition: source.edition || "Canonical Edition",
          pageNumber,
          lineStart,
          lineEnd,
          paragraphRef: pIdx + 1,
          chapterSection: currentChapter,
          exactEvidenceQuote: trimmed,
          traceabilityHash
        }
      });
    });

    return items;
  }

  private classifyItemType(text: string): KnowledgeItemType {
    const lower = text.toLowerCase();
    if (lower.includes("remedy") || lower.includes("rectification") || lower.includes("strip") || lower.includes("helix") || lower.includes("totka")) {
      return "REMEDY";
    }
    if (lower.includes("dosha") || lower.includes("defect") || lower.includes("affliction") || lower.includes("vitiation") || lower.includes("bad placement")) {
      return "DOSHA";
    }
    if (lower.includes("shall") || lower.includes("must be") || lower.includes("rule") || lower.includes("principle")) {
      return "RULE";
    }
    if (lower.includes("if") || lower.includes("provided that") || lower.includes("when placed")) {
      return "CONDITION";
    }
    if (lower.includes("except") || lower.includes("unless") || lower.includes("however")) {
      return "EXCEPTION";
    }
    if (lower.includes("brings") || lower.includes("promotes") || lower.includes("fosters") || lower.includes("prosperity") || lower.includes("wisdom")) {
      return "POSITIVE_FINDING";
    }
    return "DEFINITION";
  }

  private extractZones(text: string): string[] {
    const zones: string[] = [];
    const zoneRegex = /(North-East|North-West|South-East|South-West|North|South|East|West|Ishan|Agni|Nairrutya|Vayavya|Brahmasthan|NE|SE|SW|NW)/gi;
    const matches = text.match(zoneRegex);
    if (matches) {
      matches.forEach(m => {
        const normalized = m.toUpperCase();
        if (!zones.includes(normalized)) zones.push(normalized);
      });
    }
    return zones;
  }

  private extractPlanets(text: string): string[] {
    const planets: string[] = [];
    const planetRegex = /(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|Surya|Chandra|Mangal|Budh|Guru|Shukra|Shani)/gi;
    const matches = text.match(planetRegex);
    if (matches) {
      matches.forEach(m => {
        if (!planets.includes(m)) planets.push(m);
      });
    }
    return planets;
  }

  private extractChakras(text: string): string[] {
    const chakras: string[] = [];
    const chakraRegex = /(Muladhara|Svadhisthana|Manipura|Anahata|Vishuddha|Ajna|Sahasrara|Root|Sacral|Solar Plexus|Heart|Throat|Third Eye|Crown)/gi;
    const matches = text.match(chakraRegex);
    if (matches) {
      matches.forEach(m => {
        if (!chakras.includes(m)) chakras.push(m);
      });
    }
    return chakras;
  }

  private extractConditions(text: string): string[] {
    const conditions: string[] = [];
    const parts = text.split(/\.|\;/);
    parts.forEach(part => {
      if (/if |when |provided |case /i.test(part)) {
        conditions.push(part.trim());
      }
    });
    return conditions;
  }

  private extractExceptions(text: string): string[] {
    const exceptions: string[] = [];
    const parts = text.split(/\.|\;/);
    parts.forEach(part => {
      if (/except|unless|however|not applicable/i.test(part)) {
        exceptions.push(part.trim());
      }
    });
    return exceptions;
  }

  private extractRemedies(text: string): string[] {
    const remedies: string[] = [];
    const parts = text.split(/\.|\;/);
    parts.forEach(part => {
      if (/remedy|remedied|rectif|strip|helix|pyramid|totka|remedial/i.test(part)) {
        remedies.push(part.trim());
      }
    });
    return remedies;
  }

  private computeTraceabilityHash(sourceId: string, page: number, line: number, text: string): string {
    let hash = 0;
    const str = `${sourceId}-${page}-${line}-${text.slice(0, 40)}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `HASH-${Math.abs(hash).toString(16).toUpperCase()}`;
  }
}
