// ============================================================================
// URJAFLUX AI OS - ENTERPRISE DATASET REPOSITORY (EDR v1.0)
// Orchestrator Engine unifying EDR Engines 1 through 10.
// Single source of truth for all datasets across UVF, Knowledge Stack,
// Spatial Engines, and AI training pipelines.
// ============================================================================

import {
  IEnterpriseDatasetRepository,
  IRootFolderStructure,
  RootFolderCategory,
} from "./types/edr.types";

import { blueprintRepositoryEngine } from "./engines/BlueprintRepositoryEngine";
import { knowledgeRepositoryEngine } from "./engines/KnowledgeRepositoryEngine";
import { goldenOutputRepositoryEngine } from "./engines/GoldenOutputRepositoryEngine";
import { scenarioRepositoryEngine } from "./engines/ScenarioRepositoryEngine";
import { benchmarkRepositoryEngine } from "./engines/BenchmarkRepositoryEngine";
import { datasetVersionManager } from "./engines/DatasetVersionManager";
import { datasetSearchEngine } from "./engines/DatasetSearchEngine";
import { datasetMetadataEngine } from "./engines/DatasetMetadataEngine";
import { datasetIntegrityEngine } from "./engines/DatasetIntegrityEngine";
import { datasetExportEngine } from "./engines/DatasetExportEngine";

export class EnterpriseDatasetRepository {
  private static instance: EnterpriseDatasetRepository;

  private constructor() {}

  public static getInstance(): EnterpriseDatasetRepository {
    if (!EnterpriseDatasetRepository.instance) {
      EnterpriseDatasetRepository.instance = new EnterpriseDatasetRepository();
    }
    return EnterpriseDatasetRepository.instance;
  }

  public getEnterpriseDatasetRepository(): IEnterpriseDatasetRepository {
    const timestamp = new Date().toISOString();

    const blueprintRepository = blueprintRepositoryEngine.getBlueprintRepositoryReport();
    const knowledgeRepository = knowledgeRepositoryEngine.getKnowledgeRepositoryReport();
    const goldenOutputRepository = goldenOutputRepositoryEngine.getGoldenOutputRepositoryReport();
    const scenarioRepository = scenarioRepositoryEngine.getScenarioRepositoryReport();
    const benchmarkRepository = benchmarkRepositoryEngine.getBenchmarkRepositoryReport();
    const versionManager = datasetVersionManager.getVersionReport();
    const metadataRegistry = datasetMetadataEngine.getMetadataRegistryReport();
    const integrityReport = datasetIntegrityEngine.verifyIntegrity();
    const exportReport = datasetExportEngine.getExportReport();

    const folderTree: Array<{
      folderName: RootFolderCategory;
      itemsCount: number;
      subFolders?: string[];
    }> = [
      { folderName: 'Blueprints', itemsCount: blueprintRepository.totalBlueprintsCount, subFolders: ['Residential', 'Villa', 'Apartment', 'Commercial', 'Factory', 'Hospital', 'Temple', 'Warehouse', 'Industrial', 'MixedUse', 'Irregular', 'Triangle', 'LShape', 'HandDrawn', 'Scanned'] },
      { folderName: 'GoogleEarth', itemsCount: 4, subFolders: ['SatelliteScans', 'GeoTiff', 'KML_Boundaries'] },
      { folderName: 'CAD', itemsCount: 12, subFolders: ['DWG_Exports', 'DXF_Vectors', 'BIM_IFC'] },
      { folderName: 'OverlayChakra', itemsCount: 6, subFolders: ['Vastu16Zones', 'Padavinyasa81', 'AstroChakra'] },
      { folderName: 'Knowledge', itemsCount: knowledgeRepository.totalKnowledgeRecordsCount, subFolders: ['Vastu', 'LalKitab', 'Numerology', 'Astrology', 'RulePackages'] },
      { folderName: 'GoldenOutputs', itemsCount: goldenOutputRepository.totalGoldenOutputsCount, subFolders: ['SpatialContext', 'KnowledgeResults', 'Confidence', 'Conflicts', 'Reports'] },
      { folderName: 'Reports', itemsCount: 14, subFolders: ['ExecutiveAudits', 'ConsultantReports', 'ClientSummaries'] },
      { folderName: 'Scenarios', itemsCount: scenarioRepository.totalScenariosCount, subFolders: ['Current', 'Future', 'ConsultantProposal', 'ClientProposal', 'AlternativeLayout', 'Renovation', 'Expansion'] },
      { folderName: 'Benchmarks', itemsCount: benchmarkRepository.totalBenchmarksCount, subFolders: ['Execution', 'Performance', 'Memory', 'Stress'] },
      { folderName: 'Performance', itemsCount: 8, subFolders: ['LatencyLogs', 'ThroughputProfiles'] },
      { folderName: 'Regression', itemsCount: 10, subFolders: ['ContractFreezes', 'SchemaBaseline'] },
      { folderName: 'ConsultantCases', itemsCount: 15, subFolders: ['ExpertOverrides', 'CaseStudies'] },
      { folderName: 'VisitorCases', itemsCount: 22, subFolders: ['FreeAuditLogs', 'AnonymousScans'] },
      { folderName: 'Archive', itemsCount: 30, subFolders: ['Legacy_v0_9', 'DeprecatedSchemas'] },
    ];

    const rootStructure: IRootFolderStructure = {
      blueprintsCount: blueprintRepository.totalBlueprintsCount,
      googleEarthCount: 4,
      cadCount: 12,
      overlayChakraCount: 6,
      knowledgeCount: knowledgeRepository.totalKnowledgeRecordsCount,
      goldenOutputsCount: goldenOutputRepository.totalGoldenOutputsCount,
      reportsCount: 14,
      scenariosCount: scenarioRepository.totalScenariosCount,
      benchmarksCount: benchmarkRepository.totalBenchmarksCount,
      performanceCount: 8,
      regressionCount: 10,
      consultantCasesCount: 15,
      visitorCasesCount: 22,
      archiveCount: 30,
      folderTree,
    };

    return {
      version: '1.0.0-EDR-ENTERPRISE',
      timestamp,
      rootStructure,
      blueprintRepository,
      knowledgeRepository,
      goldenOutputRepository,
      scenarioRepository,
      benchmarkRepository,
      versionManager,
      metadataRegistry,
      integrityReport,
      exportReport,
    };
  }

  // Helper exposing dataset search
  public searchDatasets(params: Parameters<typeof datasetSearchEngine.searchDatasets>[0]) {
    return datasetSearchEngine.searchDatasets(params);
  }
}

export const enterpriseDatasetRepository = EnterpriseDatasetRepository.getInstance();
