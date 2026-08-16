import { KnowledgeObject } from '../models/KnowledgeObject';

export interface ICanonicalizer {
  readonly name: string;
  readonly priority: number;
  readonly enabled: boolean;
  canonicalize(object: KnowledgeObject): KnowledgeObject;
}

export abstract class BaseCanonicalizer implements ICanonicalizer {
  public abstract readonly name: string;
  public abstract readonly priority: number;
  public readonly enabled: boolean = true;

  public abstract canonicalize(object: KnowledgeObject): KnowledgeObject;

  protected sanitizeText(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ');
  }
}
