import { FingerprintAlgorithm } from './FingerprintAlgorithm';

export interface IKnowledgeFingerprintData {
  readonly algorithm: FingerprintAlgorithm;
  readonly checksum: string;
  readonly contentHash: string;
  readonly structuralHash?: string;
  readonly generatedAt: number;
}

export class KnowledgeFingerprint implements IKnowledgeFingerprintData {
  public readonly algorithm: FingerprintAlgorithm;
  public readonly checksum: string;
  public readonly contentHash: string;
  public readonly structuralHash?: string;
  public readonly generatedAt: number;

  constructor(data: Partial<IKnowledgeFingerprintData> & { checksum: string; contentHash: string }) {
    this.algorithm = data.algorithm || 'SHA256';
    this.checksum = data.checksum;
    this.contentHash = data.contentHash;
    this.structuralHash = data.structuralHash;
    this.generatedAt = data.generatedAt ?? Date.now();

    Object.freeze(this);
  }

  public matches(other: KnowledgeFingerprint): boolean {
    return (
      this.checksum === other.checksum ||
      this.contentHash === other.contentHash
    );
  }

  public toJSON(): IKnowledgeFingerprintData {
    return {
      algorithm: this.algorithm,
      checksum: this.checksum,
      contentHash: this.contentHash,
      structuralHash: this.structuralHash,
      generatedAt: this.generatedAt
    };
  }
}
