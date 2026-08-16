import { FileMetadata, SupportedFileExtension } from '../types/ingestion.types';

export function extractExtension(fileName: string): SupportedFileExtension | null {
  const parts = fileName.split('.');
  if (parts.length < 2) return null;
  const ext = parts[parts.length - 1].toLowerCase();
  
  const validExtensions: Record<string, SupportedFileExtension> = {
    pdf: 'pdf',
    epub: 'epub',
    docx: 'docx',
    txt: 'txt',
    md: 'md',
    markdown: 'md',
    jpg: 'jpg',
    jpeg: 'jpeg',
    png: 'png',
    tiff: 'tiff',
    tif: 'tif'
  };

  return validExtensions[ext] || null;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function generatePackageHash(fileName: string, fileSize: number, lastModified: number): string {
  const rawIdentifier = `${fileName}:${fileSize}:${lastModified}`;
  let hash = 0;
  for (let i = 0; i < rawIdentifier.length; i++) {
    const char = rawIdentifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `pkg_${positiveHash}_${Date.now().toString(36)}`;
}

export function createFileMetadata(file: File): FileMetadata {
  const extension = extractExtension(file.name) || 'txt';
  const fileId = `file_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  const packageHash = generatePackageHash(file.name, file.size, file.lastModified);

  return {
    fileId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    extension,
    packageHash,
    uploadedAt: Date.now()
  };
}
