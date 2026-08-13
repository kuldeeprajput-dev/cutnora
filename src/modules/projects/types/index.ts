import type { Track } from "@/modules/editor/types";

export type AspectRatio =
  "16:9" | "9:16" | "1:1" | "4:5" | "2:3" | "custom" | (string & {});

export interface ProjectSettings {
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  fps: number;
  duration: number;
  backgroundColor: string;
  masterVolume: number;
}

export type MediaSourceRef =
  | { kind: "opfs"; path: string }
  | { kind: "indexeddb"; blobId: string }
  | { kind: "remote"; url: string };

export type MediaProcessingStatus =
  "pending" | "copying" | "analyzing" | "ready" | "error";

export type WaveformStatus = "ready" | "deferred" | "error";

export interface MediaAsset {
  id: string;
  projectId: string;
  type: "video" | "image" | "audio";
  name: string;
  mimeType: string;
  size: number;
  duration: number;
  width?: number;
  height?: number;
  createdAt: number;
  blobId: string;
  source?: MediaSourceRef;
  thumbnailBlobId?: string;
  waveformPeaks?: number[];
  metadataStatus: MediaProcessingStatus;
  waveformStatus?: WaveformStatus;
  sourceUrl?: string;
  sourceName?: string;
  license?: string;
  attribution?: string;
  remoteUrl?: string;
  remotePreviewUrl?: string;
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
