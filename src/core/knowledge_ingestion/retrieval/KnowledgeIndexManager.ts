// ============================================================================
// KNOWLEDGE INDEX MANAGER (PHASE 2D)
// Manages auto-updating indexes for Concepts, Rules, Exceptions, Formulas, Tables, Citations, Relationships, Documents
// ============================================================================

import { StructuredDocumentModel } from "../../../types/documentStructure";
import { SemanticDocumentModel, SemanticRule, SemanticFormula, SemanticTable, SemanticRelationship, DynamicLearnedConcept } from "../../../types/semanticKnowledge";
import { IndexStats } from "../../../types/knowledgeRetrieval";

export class KnowledgeIndexManager {
  private static documentIndex: Map<string, StructuredDocumentModel> = new Map();
  private static semanticModelIndex: Map<string, SemanticDocumentModel> = new Map();
  private static conceptIndex: Map<string, Set<string>> = new Map(); // Concept Keyword/Canonical -> Set of docIds
  private static ruleIndex: Map<string, SemanticRule[]> = new Map(); // docId -> rules
  private static exceptionIndex: Map<string, SemanticRule[]> = new Map(); // docId -> exceptions
  private static formulaIndex: Map<string, SemanticFormula[]> = new Map(); // docId -> formulas
  private static tableIndex: Map<string, SemanticTable[]> = new Map(); // docId -> tables
  private static relationshipIndex: Map<string, SemanticRelationship[]> = new Map(); // concept/subject -> relationships
  private static citationIndex: Map<string, Set<string>> = new Map(); // Citation string -> Set of docIds

  private static totalCitationsCount = 0;
  private static lastUpdatedISO: string = new Date().toISOString();

  /**
   * Automatically updates all 8 indexes whenever a document is ingested or re-parsed.
   */
  public static indexDocument(
    structuredModel: StructuredDocumentModel,
    semanticModel: SemanticDocumentModel
  ): void {
    const docId = structuredModel.documentId;

    this.documentIndex.set(docId, structuredModel);
    this.semanticModelIndex.set(docId, semanticModel);

    // 1. Concept Indexing
    for (const concept of semanticModel.concepts) {
      const canonical = concept.canonicalName.toUpperCase();
      if (!this.conceptIndex.has(canonical)) {
        this.conceptIndex.set(canonical, new Set());
      }
      this.conceptIndex.get(canonical)!.add(docId);

      for (const syn of concept.synonyms) {
        const normSyn = syn.trim().toUpperCase();
        if (!this.conceptIndex.has(normSyn)) {
          this.conceptIndex.set(normSyn, new Set());
        }
        this.conceptIndex.get(normSyn)!.add(docId);
      }
    }

    // 2. Rule & Exception Indexing
    const docRules: SemanticRule[] = [];
    const docExceptions: SemanticRule[] = [];

    for (const rule of semanticModel.rules) {
      if (rule.isException) {
        docExceptions.push(rule);
      } else {
        docRules.push(rule);
      }
    }
    this.ruleIndex.set(docId, docRules);
    this.exceptionIndex.set(docId, docExceptions);

    // 3. Formula Indexing
    this.formulaIndex.set(docId, semanticModel.formulae);

    // 4. Table Indexing
    this.tableIndex.set(docId, semanticModel.tables);

    // 5. Relationship Indexing
    for (const rel of semanticModel.relationships) {
      const subjKey = rel.subjectId.toUpperCase();
      const objKey = rel.objectId.toUpperCase();

      if (!this.relationshipIndex.has(subjKey)) {
        this.relationshipIndex.set(subjKey, []);
      }
      this.relationshipIndex.get(subjKey)!.push(rel);

      if (!this.relationshipIndex.has(objKey)) {
        this.relationshipIndex.set(objKey, []);
      }
      this.relationshipIndex.get(objKey)!.push(rel);
    }

    // 6. Citation Indexing
    for (const rule of semanticModel.rules) {
      const citKey = rule.citation.formattedCitation;
      if (!this.citationIndex.has(citKey)) {
        this.citationIndex.set(citKey, new Set());
      }
      this.citationIndex.get(citKey)!.add(docId);
      this.totalCitationsCount++;
    }

    this.lastUpdatedISO = new Date().toISOString();
  }

  /**
   * Retrieves stats for Administrator analytics.
   */
  public static getIndexStats(): IndexStats {
    let totalRules = 0;
    let totalExceptions = 0;
    let totalFormulae = 0;
    let totalTables = 0;
    let totalRelationships = 0;

    this.ruleIndex.forEach(list => totalRules += list.length);
    this.exceptionIndex.forEach(list => totalExceptions += list.length);
    this.formulaIndex.forEach(list => totalFormulae += list.length);
    this.tableIndex.forEach(list => totalTables += list.length);
    this.relationshipIndex.forEach(list => totalRelationships += list.length);

    return {
      totalDocumentsIndexed: this.documentIndex.size,
      totalConceptsIndexed: this.conceptIndex.size,
      totalRulesIndexed: totalRules,
      totalExceptionsIndexed: totalExceptions,
      totalFormulaeIndexed: totalFormulae,
      totalTablesIndexed: totalTables,
      totalRelationshipsIndexed: totalRelationships,
      totalCitationsIndexed: this.totalCitationsCount,
      lastUpdated: this.lastUpdatedISO
    };
  }

  // Accessors
  public static getDocument(docId: string): StructuredDocumentModel | undefined {
    return this.documentIndex.get(docId);
  }

  public static getSemanticModel(docId: string): SemanticDocumentModel | undefined {
    return this.semanticModelIndex.get(docId);
  }

  public static getAllSemanticModels(): SemanticDocumentModel[] {
    return Array.from(this.semanticModelIndex.values());
  }

  public static getAllDocuments(): StructuredDocumentModel[] {
    return Array.from(this.documentIndex.values());
  }

  /**
   * Transactionally removes all indexed artifacts for a document.
   */
  public static removeDocument(docId: string): void {
    this.documentIndex.delete(docId);
    this.semanticModelIndex.delete(docId);

    // Remove from conceptIndex
    this.conceptIndex.forEach((docSet, concept) => {
      docSet.delete(docId);
      if (docSet.size === 0) {
        this.conceptIndex.delete(concept);
      }
    });

    // Remove from ruleIndex & exceptionIndex
    this.ruleIndex.delete(docId);
    this.exceptionIndex.delete(docId);

    // Remove from formulaIndex & tableIndex
    this.formulaIndex.delete(docId);
    this.tableIndex.delete(docId);

    // Remove from citationIndex
    this.citationIndex.forEach((docSet, citation) => {
      docSet.delete(docId);
      if (docSet.size === 0) {
        this.citationIndex.delete(citation);
      }
    });

    this.lastUpdatedISO = new Date().toISOString();
  }

  public static clearAll(): void {
    this.documentIndex.clear();
    this.semanticModelIndex.clear();
    this.conceptIndex.clear();
    this.ruleIndex.clear();
    this.exceptionIndex.clear();
    this.formulaIndex.clear();
    this.tableIndex.clear();
    this.citationIndex.clear();
    this.lastUpdatedISO = new Date().toISOString();
  }

  public static getDocIdsForConcept(conceptKeyword: string): string[] {
    const norm = conceptKeyword.trim().toUpperCase();
    const set = this.conceptIndex.get(norm);
    return set ? Array.from(set) : [];
  }
}
