// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE CORRELATION ENGINE (KCoE)
// Central Single-Source Interconnected Structural Knowledge Network Engine
// ============================================================================

import { 
  IKCoEGraphNode, 
  IKCoERelationshipEdge, 
  IKCoETraversalQuery, 
  IKCoETraversalPath, 
  IKCoEGraphSnapshot,
  KnowledgeDomain 
} from "../types/kcoe.types";
import { KnowledgeCorrelationGraph } from "../graph/KnowledgeCorrelationGraph";
import { StructuralCorrelator } from "../correlators/StructuralCorrelator";
import { KnowledgeVaultStore } from "../../knowledge_vault/store/KnowledgeVaultStore";
import { RuleRegistryEngine } from "../../rule_registry/engine/RuleRegistryEngine";
import { IKqeQueryResultPackage } from "../../knowledge_query/types/kqe.types";
import { IVaultKnowledgeRecord } from "../../knowledge_vault/types/vaultRecord.types";
import { IRuleRegistryRecord } from "../../rule_registry/types/ruleRegistry.types";

export class KnowledgeCorrelationEngine {
  private static instance: KnowledgeCorrelationEngine;
  
  private graph = KnowledgeCorrelationGraph.getInstance();
  private correlator = new StructuralCorrelator();
  private vaultStore = KnowledgeVaultStore.getInstance();
  private registryEngine = RuleRegistryEngine.getInstance();

  private constructor() {}

  public static getInstance(): KnowledgeCorrelationEngine {
    if (!KnowledgeCorrelationEngine.instance) {
      KnowledgeCorrelationEngine.instance = new KnowledgeCorrelationEngine();
    }
    return KnowledgeCorrelationEngine.instance;
  }

  /**
   * Ingests and correlates all records from Knowledge Vault Store
   */
  public syncFromVault(): number {
    const records = this.vaultStore.getAllRecords();
    let edgeCount = 0;

    records.forEach(rec => {
      this.registerVaultRecordNode(rec);
      const edges = this.correlator.correlateVaultRecord(rec);
      edges.forEach(edge => {
        this.graph.addEdge(edge);
        edgeCount++;
      });
    });

    return edgeCount;
  }

  /**
   * Ingests and correlates all records from Rule Registry Engine
   */
  public syncFromRegistry(): number {
    const stats = this.registryEngine.getRegistryStats();
    let edgeCount = 0;

    // Fetch matching rules for available domains
    const domains: KnowledgeDomain[] = ['Vastu', 'LalKitab', 'Numerology', 'Astrology'];
    domains.forEach(domain => {
      const records = this.registryEngine.discoverRules({ domain });
      records.forEach(regRec => {
        this.registerRegistryRecordNode(regRec);
        const edges = this.correlator.correlateRegistryRecord(regRec);
        edges.forEach(edge => {
          this.graph.addEdge(edge);
          edgeCount++;
        });
      });
    });

    return edgeCount;
  }

  /**
   * Correlates items in a Knowledge Query Result Package
   */
  public ingestQueryResultPackage(queryPackage: IKqeQueryResultPackage): number {
    const edges = this.correlator.correlateQueryPackage(queryPackage);
    let added = 0;
    edges.forEach(edge => {
      this.graph.addEdge(edge);
      added++;
    });
    return added;
  }

  /**
   * Registers a Vault Record as a Node in the graph
   */
  public registerVaultRecordNode(record: IVaultKnowledgeRecord): IKCoEGraphNode {
    const p = record.knowledgePayload;
    const node: IKCoEGraphNode = {
      nodeId: record.recordId,
      nodeType: 'RECORD',
      domain: record.sourceMetadata.domain,
      category: record.category,
      label: p.dosha || p.remedy || p.conditions[0] || `Record-${record.recordId}`,
      dimensions: {
        directions: p.targetZones.filter(z => ["NORTH", "SOUTH", "EAST", "WEST", "NORTHEAST", "NORTHWEST", "SOUTHEAST", "SOUTHWEST"].includes(z.toUpperCase())),
        zones: p.targetZones,
        elements: p.targetElements,
        planets: p.targetPlanets,
        rooms: p.targetZones.filter(z => z.toLowerCase().includes("room") || z.toLowerCase().includes("kitchen")),
        objectTypes: [],
        chakras: p.targetChakras,
        activities: []
      },
      outgoingEdgeIds: [],
      incomingEdgeIds: []
    };

    this.graph.addNode(node);
    return node;
  }

  /**
   * Registers a Rule Registry Record as a Node in the graph
   */
  public registerRegistryRecordNode(regRecord: IRuleRegistryRecord): IKCoEGraphNode {
    const node: IKCoEGraphNode = {
      nodeId: regRecord.ruleId,
      nodeType: 'RULE',
      domain: regRecord.domain,
      category: regRecord.ruleCategory,
      label: `RuleRegistry-${regRecord.ruleId}`,
      dimensions: {
        directions: regRecord.directions,
        zones: regRecord.zones,
        elements: regRecord.elements,
        planets: regRecord.planets,
        rooms: regRecord.rooms,
        objectTypes: regRecord.objectTypes,
        chakras: regRecord.chakras,
        activities: regRecord.activities
      },
      outgoingEdgeIds: [],
      incomingEdgeIds: []
    };

    this.graph.addNode(node);
    return node;
  }

  /**
   * Retrieves full node detail including incoming and outgoing relationships
   */
  public getNodeWithRelationships(nodeId: string): {
    node: IKCoEGraphNode | undefined;
    outgoingRelationships: IKCoERelationshipEdge[];
    incomingRelationships: IKCoERelationshipEdge[];
  } {
    const node = this.graph.getNode(nodeId);
    const outgoingRelationships = this.graph.getOutgoingEdges(nodeId);
    const incomingRelationships = this.graph.getIncomingEdges(nodeId);

    return {
      node,
      outgoingRelationships,
      incomingRelationships
    };
  }

  /**
   * Executes multi-hop structural graph traversal
   */
  public traverseGraph(query: IKCoETraversalQuery): IKCoETraversalPath[] {
    return this.graph.traverse(query);
  }

  /**
   * Returns current Graph Snapshot
   */
  public getGraphSnapshot(): IKCoEGraphSnapshot {
    return this.graph.getSnapshot();
  }
}

export const knowledgeCorrelationEngine = KnowledgeCorrelationEngine.getInstance();
