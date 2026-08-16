import {
  Finding,
  FindingSeverity,
  FindingStatus,
  FindingSource,
  FindingEvidence,
  FindingReference,
  FindingConfidence
} from "../types/findingTypes";

export class FindingBuilder {
  private _id = "";
  private _title = "";
  private _description = "";
  private _severity = FindingSeverity.NEUTRAL;
  private _confidence: FindingConfidence = 1.0;
  private _status = FindingStatus.ACTIVE;
  private _source = FindingSource.RULE_ENGINE;
  private _evidence: FindingEvidence[] = [];
  private _references: FindingReference[] = [];
  private _affectedElements: string[] = [];
  private _createdAt: string = new Date().toISOString();
  private _updatedAt: string = new Date().toISOString();
  private _metadata: Record<string, unknown> = {};

  public setId(id: string): this {
    this._id = id;
    return this;
  }

  public setTitle(title: string): this {
    this._title = title;
    return this;
  }

  public setDescription(description: string): this {
    this._description = description;
    return this;
  }

  public setSeverity(severity: FindingSeverity): this {
    this._severity = severity;
    return this;
  }

  public setConfidence(confidence: FindingConfidence): this {
    this._confidence = confidence;
    return this;
  }

  public setStatus(status: FindingStatus): this {
    this._status = status;
    return this;
  }

  public setSource(source: FindingSource): this {
    this._source = source;
    return this;
  }

  public addEvidence(evidence: FindingEvidence): this {
    this._evidence.push({
      id: evidence.id,
      type: evidence.type,
      description: evidence.description,
      metadata: evidence.metadata ? { ...evidence.metadata } : undefined
    });
    return this;
  }

  public addReference(reference: FindingReference): this {
    this._references.push({
      sourceId: reference.sourceId,
      section: reference.section,
      citationText: reference.citationText,
      externalUrl: reference.externalUrl
    });
    return this;
  }

  public addAffectedElement(element: string): this {
    if (!this._affectedElements.includes(element)) {
      this._affectedElements.push(element);
    }
    return this;
  }

  public setCreatedAt(date: string): this {
    this._createdAt = date;
    return this;
  }

  public setUpdatedAt(date: string): this {
    this._updatedAt = date;
    return this;
  }

  public addMetadata(key: string, value: unknown): this {
    this._metadata[key] = value;
    return this;
  }

  public build(): Readonly<Finding> {
    const finding: Finding = {
      id: this._id,
      title: this._title,
      description: this._description,
      severity: this._severity,
      confidence: this._confidence,
      status: this._status,
      source: this._source,
      evidence: Object.freeze([...this._evidence]),
      references: Object.freeze([...this._references]),
      affectedElements: Object.freeze([...this._affectedElements]),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      metadata: Object.freeze({ ...this._metadata })
    };
    return Object.freeze(finding);
  }
}
