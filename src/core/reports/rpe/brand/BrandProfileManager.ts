// ============================================================================
// URJAFLUX AI OS - BRAND PROFILE MANAGER
// Correction 8: Unlimited Consultant Branding Profiles
// ============================================================================

import { IBrandProfile, IWhiteLabelConfig } from "../types/rpe.types";
import { BrandEngine } from "../modules/BrandAndThemeModules";

export class BrandProfileManager {
  private static instance: BrandProfileManager;
  private profileStore: Map<string, IBrandProfile> = new Map();

  private constructor() {
    this.createDefaultProfiles();
  }

  public static getInstance(): BrandProfileManager {
    if (!BrandProfileManager.instance) {
      BrandProfileManager.instance = new BrandProfileManager();
    }
    return BrandProfileManager.instance;
  }

  public createProfile(
    profileName: string,
    consultantId: string,
    customConfig?: Partial<IWhiteLabelConfig>,
    isDefault: boolean = false
  ): IBrandProfile {
    const profileId = `BRAND-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
    const whiteLabelConfig = BrandEngine.resolveBrandConfig(customConfig);

    const profile: IBrandProfile = {
      profileId,
      profileName,
      consultantId,
      isDefault,
      whiteLabelConfig
    };

    if (isDefault) {
      // Unset previous defaults for this consultant
      for (const [id, p] of this.profileStore.entries()) {
        if (p.consultantId === consultantId) {
          p.isDefault = false;
        }
      }
    }

    this.profileStore.set(profileId, profile);
    return profile;
  }

  public getProfile(profileId: string): IBrandProfile | undefined {
    return this.profileStore.get(profileId);
  }

  public getDefaultProfileForConsultant(consultantId: string): IBrandProfile {
    for (const p of this.profileStore.values()) {
      if (p.consultantId === consultantId && p.isDefault) {
        return p;
      }
    }
    // Return standard system default profile
    return this.getProfile('DEFAULT_URJAFLUX_PROFILE') || this.createProfile('URJAFLUX Core Brand', consultantId, {}, true);
  }

  public getAllProfilesForConsultant(consultantId: string): IBrandProfile[] {
    return Array.from(this.profileStore.values()).filter(p => p.consultantId === consultantId || p.consultantId === 'SYSTEM');
  }

  private createDefaultProfiles(): void {
    const defaultConfig = BrandEngine.getDefaultWhiteLabelConfig();
    this.profileStore.set('DEFAULT_URJAFLUX_PROFILE', {
      profileId: 'DEFAULT_URJAFLUX_PROFILE',
      profileName: 'URJAFLUX AI OS Official',
      consultantId: 'SYSTEM',
      isDefault: true,
      whiteLabelConfig: defaultConfig
    });
  }
}

export const brandProfileManager = BrandProfileManager.getInstance();
