export interface IKnowledgeSourceVersionData {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly buildNumber: number;
  readonly versionString: string;
  readonly changelog: string;
  readonly createdAt: number;
}

export class KnowledgeSourceVersion implements IKnowledgeSourceVersionData {
  public readonly major: number;
  public readonly minor: number;
  public readonly patch: number;
  public readonly buildNumber: number;
  public readonly versionString: string;
  public readonly changelog: string;
  public readonly createdAt: number;

  constructor(data?: Partial<IKnowledgeSourceVersionData>) {
    this.major = data?.major ?? 1;
    this.minor = data?.minor ?? 0;
    this.patch = data?.patch ?? 0;
    this.buildNumber = data?.buildNumber ?? 1;
    this.versionString =
      data?.versionString ||
      `${this.major}.${this.minor}.${this.patch}-BUILD-${String(this.buildNumber).padStart(4, '0')}`;
    this.changelog = data?.changelog || 'Initial release';
    this.createdAt = data?.createdAt ?? Date.now();
    Object.freeze(this);
  }

  public bumpMajor(changelog?: string): KnowledgeSourceVersion {
    return new KnowledgeSourceVersion({
      major: this.major + 1,
      minor: 0,
      patch: 0,
      buildNumber: this.buildNumber + 1,
      changelog: changelog || 'Major version update'
    });
  }

  public bumpMinor(changelog?: string): KnowledgeSourceVersion {
    return new KnowledgeSourceVersion({
      major: this.major,
      minor: this.minor + 1,
      patch: 0,
      buildNumber: this.buildNumber + 1,
      changelog: changelog || 'Minor version update'
    });
  }

  public bumpPatch(changelog?: string): KnowledgeSourceVersion {
    return new KnowledgeSourceVersion({
      major: this.major,
      minor: this.minor,
      patch: this.patch + 1,
      buildNumber: this.buildNumber + 1,
      changelog: changelog || 'Patch update'
    });
  }

  public toJSON(): IKnowledgeSourceVersionData {
    return {
      major: this.major,
      minor: this.minor,
      patch: this.patch,
      buildNumber: this.buildNumber,
      versionString: this.versionString,
      changelog: this.changelog,
      createdAt: this.createdAt
    };
  }
}
