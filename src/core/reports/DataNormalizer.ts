import { IAnalysisContract } from './AnalysisContract';

export class DataNormalizer {
  private static instance: DataNormalizer;

  private constructor() {}

  public static getInstance(): DataNormalizer {
    if (!DataNormalizer.instance) {
      DataNormalizer.instance = new DataNormalizer();
    }
    return DataNormalizer.instance;
  }

  /**
   * Normalizes an entire Analysis Contract to enterprise canonical formatting standards.
   */
  public normalize(contract: IAnalysisContract): IAnalysisContract {
    const cloned = JSON.parse(JSON.stringify(contract)) as IAnalysisContract;

    // 1. Normalize Dates
    cloned.generatedTimestamp = this.normalizeDate(cloned.generatedTimestamp);

    // 2. Normalize Confidence Score (0 to 100)
    cloned.confidence = this.normalizeConfidence(cloned.confidence);

    // 3. Normalize Recommendations, Attachments, and References
    if (Array.isArray(cloned.recommendations)) {
      cloned.recommendations = cloned.recommendations.map(rec => ({
        ...rec,
        id: this.normalizeIdReference(rec.id, 'REC'),
        priority: rec.priority || 'MEDIUM',
        zone: rec.zone ? this.normalizeDirection(rec.zone) : undefined,
        text: this.normalizeTextSpacing(rec.text)
      }));
    }

    if (Array.isArray(cloned.attachments)) {
      cloned.attachments = cloned.attachments.map(att => ({
        ...att,
        id: this.normalizeIdReference(att.id, 'ATT'),
        title: this.normalizeTextSpacing(att.title),
        caption: att.caption ? this.normalizeTextSpacing(att.caption) : undefined,
        timestamp: this.normalizeDate(att.timestamp)
      }));
    }

    if (Array.isArray(cloned.references)) {
      cloned.references = cloned.references.map(ref => ({
        ...ref,
        id: this.normalizeIdReference(ref.id, 'REF'),
        sourceBook: this.normalizeTextSpacing(ref.sourceBook),
        chapterVerse: ref.chapterVerse ? this.normalizeTextSpacing(ref.chapterVerse) : undefined
      }));
    }

    // 4. Normalize Data Sections
    if (Array.isArray(cloned.dataSections)) {
      cloned.dataSections = cloned.dataSections.map(sec => {
        const normalizedSection = {
          ...sec,
          id: this.normalizeIdReference(sec.id, 'SEC'),
          title: this.normalizeTextSpacing(sec.title),
          type: sec.type
        };

        // Normalize direction labels inside section content if applicable
        if (sec.content && typeof sec.content === 'object') {
          normalizedSection.content = this.normalizeSectionContent(sec.content);
        }

        return normalizedSection;
      });
    }

    return cloned;
  }

  /**
   * Standardizes any date representation to ISO format.
   */
  public normalizeDate(dateStr?: string): string {
    if (!dateStr) return new Date().toISOString();
    try {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) {
        return new Date().toISOString();
      }
      return parsed.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Scales or bounds confidence scores cleanly to 0-100.
   */
  public normalizeConfidence(score: number): number {
    if (score === undefined || isNaN(score)) return 85; // Default safe confidence
    if (score < 0) return 0;
    // If it was given as a fraction 0.0 -> 1.0, scale up to percentage
    if (score > 0 && score <= 1.0) {
      return Math.round(score * 100);
    }
    if (score > 100) return 100;
    return Math.round(score);
  }

  /**
   * Normalizes directional shorthand abbreviations to canonical textual descriptors.
   */
  public normalizeDirection(dirStr: string): string {
    if (!dirStr) return '';
    const clean = dirStr.trim().toUpperCase();
    
    const directionMap: Record<string, string> = {
      'N': 'North (Uttara Zone)',
      'S': 'South (Dakshina Zone)',
      'E': 'East (Purva Zone)',
      'W': 'West (Pashchima Zone)',
      'NE': 'North-East (Eeshan Zone)',
      'NORTHEAST': 'North-East (Eeshan Zone)',
      'SE': 'South-East (Agneya Zone)',
      'SOUTHEAST': 'South-East (Agneya Zone)',
      'SW': 'South-West (Nairutya Zone)',
      'SOUTHWEST': 'South-West (Nairutya Zone)',
      'NW': 'North-West (Vayavya Zone)',
      'NORTHWEST': 'North-West (Vayavya Zone)',
      'BRAHMSTHAN': 'Center (Brahmasthan Ether Grid)',
      'CENTER': 'Center (Brahmasthan Ether Grid)'
    };

    if (directionMap[clean]) {
      return directionMap[clean];
    }

    // Fallback search
    for (const [key, value] of Object.entries(directionMap)) {
      if (clean.includes(key)) {
        return value;
      }
    }

    return dirStr;
  }

  /**
   * Cleans white space, trims and standardizes title casings.
   */
  public normalizeTextSpacing(text?: string): string {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Ensures standardized prefix formatting for object references.
   */
  public normalizeIdReference(id: string, defaultPrefix: string): string {
    if (!id) return `${defaultPrefix.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
    const cleanId = id.trim().toLowerCase();
    if (cleanId.startsWith(`${defaultPrefix.toLowerCase()}-`)) {
      return cleanId;
    }
    return `${defaultPrefix.toLowerCase()}-${cleanId}`;
  }

  /**
   * Standardizes property and development titles.
   */
  public normalizePropertyName(name?: string): string {
    if (!name) return 'Tech Park Headquarters';
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Normalizes content of a section recursively.
   */
  private normalizeSectionContent(content: any): any {
    if (content === null || content === undefined) return content;

    if (typeof content === 'string') {
      return this.normalizeTextSpacing(content);
    }

    if (Array.isArray(content)) {
      return content.map(item => this.normalizeSectionContent(item));
    }

    if (typeof content === 'object') {
      const normalizedObj: any = {};
      Object.keys(content).forEach(key => {
        let value = content[key];
        
        // Normalize coordinates if key matches coordinate naming conventions
        if ((key.toLowerCase().includes('coord') || key.toLowerCase() === 'lat' || key.toLowerCase() === 'lon' || key.toLowerCase() === 'lng') && typeof value === 'number') {
          normalizedObj[key] = parseFloat(value.toFixed(6)); // Bound spatial coordinates to standard decimal places
        } else if (key.toLowerCase().includes('direction') || key.toLowerCase() === 'zone') {
          normalizedObj[key] = typeof value === 'string' ? this.normalizeDirection(value) : value;
        } else {
          normalizedObj[key] = this.normalizeSectionContent(value);
        }
      });
      return normalizedObj;
    }

    return content;
  }
}
