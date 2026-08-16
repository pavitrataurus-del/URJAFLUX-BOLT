import { IAnalysisSection } from './AnalysisContract';
import { IReportBlock, BlockType } from './ReportTypes';
import { AnalysisRegistry } from './AnalysisRegistry';

export class BlockMapper {
  private static instance: BlockMapper;

  private constructor() {}

  public static getInstance(): BlockMapper {
    if (!BlockMapper.instance) {
      BlockMapper.instance = new BlockMapper();
    }
    return BlockMapper.instance;
  }

  /**
   * Maps a structured Analysis Section into a list of Report Studio-ready rendering blocks.
   */
  public mapSectionToBlocks(section: IAnalysisSection): IReportBlock[] {
    const blocks: IReportBlock[] = [];
    const sectionType = section.type;

    // 1. Check if there is a custom plugin registered block mapper (Part 11)
    const customMapper = AnalysisRegistry.getInstance().getBlockMapper(sectionType);
    if (customMapper) {
      try {
        const customResult = customMapper(section);
        if (Array.isArray(customResult)) {
          return customResult;
        } else if (customResult) {
          return [customResult];
        }
      } catch (err) {
        console.warn(`Custom block mapper for section type "${sectionType}" failed:`, err);
      }
    }

    // 2. Default canonical mapping rules (Part 7)
    let blockIndex = 0;

    const createBlock = (type: BlockType, content: any): IReportBlock => ({
      blockId: `b-${section.id}-${type.toLowerCase()}-${blockIndex++}`,
      type,
      content,
      isVisible: true,
      isLocked: false,
      orderIndex: blockIndex
    });

    // Push section heading block
    blocks.push(createBlock('HEADING', section.title));

    switch (sectionType) {
      case 'Summary':
        if (typeof section.content === 'string') {
          blocks.push(createBlock('PARAGRAPH', section.content));
        } else if (section.content && section.content.summaryText) {
          blocks.push(createBlock('PARAGRAPH', section.content.summaryText));
          if (section.content.highlights) {
            blocks.push(createBlock('CHECKLIST', section.content.highlights.map((h: string) => ({ label: h, completed: true }))));
          }
        } else {
          blocks.push(createBlock('PARAGRAPH', JSON.stringify(section.content)));
        }
        break;

      case 'Metrics':
        if (section.content && section.content.metricsList) {
          const rows = section.content.metricsList.map((m: any) => [m.name, String(m.value), m.status || 'N/A']);
          blocks.push(createBlock('TABLE', {
            headers: ['Metric Name', 'Value', 'Status'],
            rows
          }));
        } else if (typeof section.content === 'object') {
          // Flatten simple key-value metrics into a table
          const rows = Object.entries(section.content).map(([k, v]) => [k, String(v), 'CALIBRATED']);
          blocks.push(createBlock('TABLE', {
            headers: ['Parameter', 'Value', 'State'],
            rows
          }));
        }
        break;

      case 'Observations':
        if (Array.isArray(section.content)) {
          blocks.push(createBlock('CHECKLIST', section.content.map(obs => ({
            label: typeof obs === 'string' ? obs : obs.text || JSON.stringify(obs),
            completed: obs.completed !== undefined ? obs.completed : true
          }))));
        } else if (section.content && typeof section.content === 'object') {
          const checklistItems = section.content.observationsList || section.content.items || [];
          if (Array.isArray(checklistItems)) {
            blocks.push(createBlock('CHECKLIST', checklistItems.map((item: any) => ({
              label: typeof item === 'string' ? item : item.text || JSON.stringify(item),
              completed: item.completed !== undefined ? item.completed : true
            }))));
          } else {
            blocks.push(createBlock('OBSERVATION', section.content.text || JSON.stringify(section.content)));
          }
        } else {
          blocks.push(createBlock('OBSERVATION', String(section.content)));
        }
        break;

      case 'Recommendations':
        if (Array.isArray(section.content)) {
          section.content.forEach(rec => {
            blocks.push(createBlock('RECOMMENDATION', rec.text || JSON.stringify(rec)));
          });
        } else if (section.content && section.content.text) {
          blocks.push(createBlock('RECOMMENDATION', section.content.text));
        } else {
          blocks.push(createBlock('RECOMMENDATION', JSON.stringify(section.content)));
        }
        break;

      case 'Remedies':
        if (Array.isArray(section.content)) {
          section.content.forEach(rem => {
            blocks.push(createBlock('REMEDY', {
              zone: rem.zone || 'General Spatial Grid',
              citation: rem.citation || 'Ancient Canonical Text',
              defect: rem.defect || 'Acoustic / Spatial Resonance Mismatch',
              remedy: rem.remedy || 'Harmonic Metal Diffuser placement'
            }));
          });
        } else if (section.content && typeof section.content === 'object') {
          blocks.push(createBlock('REMEDY', {
            zone: section.content.zone || 'General Grid',
            citation: section.content.citation || 'Vedas',
            defect: section.content.defect || 'Energetic structural overlap',
            remedy: section.content.remedy || 'Copper rod insertion'
          }));
        } else {
          blocks.push(createBlock('PARAGRAPH', String(section.content)));
        }
        break;

      case 'Warnings':
        if (Array.isArray(section.content)) {
          blocks.push(createBlock('ALERT', {
            message: `Structural Warning Alert: ${section.content.join('. ')}`
          }));
        } else if (section.content && typeof section.content === 'object') {
          blocks.push(createBlock('ALERT', {
            message: section.content.message || JSON.stringify(section.content)
          }));
        } else {
          blocks.push(createBlock('ALERT', { message: String(section.content) }));
        }
        break;

      case 'Images':
      case 'Floor Plans':
        const blockType: BlockType = sectionType === 'Floor Plans' ? 'FLOOR_PLAN' : 'IMAGE';
        if (Array.isArray(section.content)) {
          section.content.forEach(img => {
            blocks.push(createBlock(blockType, {
              url: img.url || img.assetUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
              caption: img.caption || img.title || 'Spatial Verification Document'
            }));
          });
        } else if (section.content && typeof section.content === 'object') {
          blocks.push(createBlock(blockType, {
            url: section.content.url || section.content.assetUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
            caption: section.content.caption || 'Structural Verification Image'
          }));
        }
        break;

      case 'Tables':
        if (section.content && Array.isArray(section.content.rows)) {
          blocks.push(createBlock('TABLE', {
            headers: section.content.headers || [],
            rows: section.content.rows
          }));
        }
        break;

      case 'Charts':
        if (section.content && section.content.chartData) {
          blocks.push(createBlock('CHART', {
            chartType: section.content.chartType || 'BAR',
            title: section.content.chartTitle || 'Metric Resonance Analysis',
            data: section.content.chartData,
            xAxisKey: section.content.xAxisKey || 'name',
            seriesKeys: section.content.seriesKeys || ['value']
          }));
        }
        break;

      case 'References':
        if (Array.isArray(section.content)) {
          section.content.forEach(ref => {
            blocks.push(createBlock('QUOTE', {
              text: ref.excerptText || ref.text || '',
              source: `${ref.sourceBook || 'Canonical Scripture'}, ${ref.chapterVerse || ''}`
            }));
          });
        } else if (section.content && typeof section.content === 'object') {
          blocks.push(createBlock('QUOTE', {
            text: section.content.excerptText || section.content.text || '',
            source: `${section.content.sourceBook || 'Canonical Source'}, ${section.content.chapterVerse || ''}`
          }));
        }
        break;

      default:
        // Fallback to basic paragraph block containing stringified content
        blocks.push(createBlock('PARAGRAPH', typeof section.content === 'string' ? section.content : JSON.stringify(section.content)));
        break;
    }

    return blocks;
  }
}
