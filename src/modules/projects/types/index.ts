import type { Track } from '@/modules/editor/types';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export interface ProjectSettings {
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  fps: number;
  duration: number;
  backgroundColor: string;
  masterVolume: number;
}

export interface MediaAsset {
  id: string;
  projectId: string;
  type: 'video' | 'image' | 'audio';
  name: string;
  mimeType: string;
  size: number;
  duration: number;
  width?: number;
  height?: number;
  createdAt: number;
  blobId: string;
  thumbnailBlobId?: string;
  waveformPeaks?: number[];
  metadataStatus: 'pending' | 'ready' | 'error';
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  schemaVersion: number;
  settings: ProjectSettings;
  tracks: Track[];
  assetIds: string[];
}
