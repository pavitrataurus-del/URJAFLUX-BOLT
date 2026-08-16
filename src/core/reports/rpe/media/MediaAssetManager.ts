// ============================================================================
// URJAFLUX AI OS - MEDIA ASSET MANAGER
// Correction 9: Central Reusable Media Asset Repository
// Blueprint, Overlay Chakra, Room Photos, Site Photos, Before/After, Videos, 3D Models
// ============================================================================

import { IMediaAsset, MediaAssetType } from "../types/rpe.types";

export class MediaAssetManager {
  private static instance: MediaAssetManager;
  private assetStore: Map<string, IMediaAsset> = new Map();

  private constructor() {}

  public static getInstance(): MediaAssetManager {
    if (!MediaAssetManager.instance) {
      MediaAssetManager.instance = new MediaAssetManager();
    }
    return MediaAssetManager.instance;
  }

  public registerAsset(
    title: string,
    assetType: MediaAssetType,
    url: string,
    mimeType: string = "image/png",
    spatialZone?: string,
    roomId?: string,
    tags: string[] = [],
    metadata?: Record<string, any>
  ): IMediaAsset {
    const assetId = `MEDIA-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`;

    const asset: IMediaAsset = {
      assetId,
      title,
      assetType,
      mimeType,
      url,
      thumbnailUrl: url,
      spatialZone,
      roomId,
      tags,
      metadata,
      uploadedAt: new Date().toISOString()
    };

    this.assetStore.set(assetId, asset);
    return asset;
  }

  public getAsset(assetId: string): IMediaAsset | undefined {
    return this.assetStore.get(assetId);
  }

  public getAssetsByZone(zone: string): IMediaAsset[] {
    return Array.from(this.assetStore.values()).filter(a => a.spatialZone?.toUpperCase() === zone.toUpperCase());
  }

  public getAssetsByType(type: MediaAssetType): IMediaAsset[] {
    return Array.from(this.assetStore.values()).filter(a => a.assetType === type);
  }

  public searchAssetsByTag(tag: string): IMediaAsset[] {
    return Array.from(this.assetStore.values()).filter(a => a.tags.includes(tag));
  }
}

export const mediaAssetManager = MediaAssetManager.getInstance();
