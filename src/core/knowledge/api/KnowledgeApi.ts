import { UniversalOntologyEngine } from "../ontology/UniversalOntologyEngine";
import { KnowledgeNamespaceEngine } from "../namespace/KnowledgeNamespaceEngine";
import { IOntologyNode } from "../ontology/OntologyTypes";
import { INamespace } from "../namespace/NamespaceTypes";

export class KnowledgeApi {
  private static instance: KnowledgeApi;

  private constructor() {}

  public static getInstance(): KnowledgeApi {
    if (!KnowledgeApi.instance) {
      KnowledgeApi.instance = new KnowledgeApi();
    }
    return KnowledgeApi.instance;
  }

  // Ontology APIs
  public registerOntology(node: IOntologyNode): void {
    UniversalOntologyEngine.getInstance().registerConcept(node);
  }

  public updateOntology(node: IOntologyNode): void {
    UniversalOntologyEngine.getInstance().updateConcept(node);
  }

  public getConcept(id: string): IOntologyNode | undefined {
    return UniversalOntologyEngine.getInstance().getConcept(id);
  }

  public resolveAlias(alias: string): IOntologyNode | undefined {
    return UniversalOntologyEngine.getInstance().resolveAlias(alias);
  }

  public searchConcept(query: string): IOntologyNode[] {
    return UniversalOntologyEngine.getInstance().searchConcept(query);
  }

  // Namespace APIs
  public registerNamespace(ns: INamespace): void {
    KnowledgeNamespaceEngine.getInstance().registerNamespace(ns);
  }

  public loadNamespace(id: string): INamespace | undefined {
    return KnowledgeNamespaceEngine.getInstance().getNamespace(id);
  }

  public listNamespaces(activeOnly = false): INamespace[] {
    return KnowledgeNamespaceEngine.getInstance().listNamespaces(activeOnly);
  }

  public validateNamespace(id: string): boolean {
    const ns = KnowledgeNamespaceEngine.getInstance().getNamespace(id);
    return !!ns; // Future: add deeper validation logic if needed
  }
}
