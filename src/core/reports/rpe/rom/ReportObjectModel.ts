// ============================================================================
// URJAFLUX AI OS - REPORT OBJECT MODEL (ROM) ENGINE
// Correction 10: Hierarchical Tree Document Model
// Report -> Sections -> Components -> Blocks -> Elements -> Widgets -> Media/Tables/Charts/Text
// ============================================================================

import { 
  IReportObjectModel, 
  IRomSection, 
  IRomComponent, 
  IRomBlock, 
  IRomElement, 
  IRomWidget, 
  ReportTypeId, 
  IReportVersionMetadata, 
  IMediaAsset 
} from "../types/rpe.types";

export class ReportObjectModelFactory {
  public static createEmptyRom(
    reportTypeId: ReportTypeId,
    title: string,
    subtitle: string,
    snapshotId: string,
    brandProfileId: string,
    createdByConsultantId: string = "CONSULTANT_SYSTEM"
  ): IReportObjectModel {
    const romId = `ROM-${Date.now().toString(36).toUpperCase()}`;
    const versionMetadata: IReportVersionMetadata = {
      versionId: `VER-1.0-${Date.now().toString(36).toUpperCase()}`,
      versionNumber: 1.0,
      state: 'DRAFT',
      createdAt: new Date().toISOString(),
      createdByConsultantId,
      isImmutable: false,
      changeLogNote: 'Initial Report Object Model draft composition'
    };

    return {
      romId,
      reportTypeId,
      title,
      subtitle,
      sections: [],
      mediaReferences: [],
      versionMetadata,
      snapshotId,
      brandProfileId
    };
  }

  public static createBlock(
    type: IRomBlock['type'],
    title: string | undefined,
    elements: IRomElement[],
    widgets?: IRomWidget[]
  ): IRomBlock {
    return {
      blockId: `BLK-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
      type,
      title,
      elements,
      widgets: widgets || []
    };
  }

  public static createTextElement(content: string): IRomElement {
    return {
      elementId: `ELM-TXT-${Math.random().toString(36).substring(2, 8)}`,
      elementType: 'TEXT',
      content
    };
  }

  public static createMediaElement(asset: IMediaAsset): IRomElement {
    return {
      elementId: `ELM-MED-${asset.assetId}`,
      elementType: 'MEDIA',
      content: {
        assetId: asset.assetId,
        url: asset.url,
        assetType: asset.assetType,
        title: asset.title
      }
    };
  }

  public static createTableElement(caption: string, columns: any[], rows: any[]): IRomElement {
    return {
      elementId: `ELM-TBL-${Math.random().toString(36).substring(2, 8)}`,
      elementType: 'TABLE',
      content: { caption, columns, rows }
    };
  }

  public static createComponent(componentName: string, blocks: IRomBlock[], layoutGridCss?: string): IRomComponent {
    return {
      componentId: `CMP-${Math.random().toString(36).substring(2, 8)}`,
      componentName,
      blocks,
      layoutGridCss: layoutGridCss || 'grid grid-cols-1 gap-4'
    };
  }
}
