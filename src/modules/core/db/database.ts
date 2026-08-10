import Dexie, { type Table } from "dexie";
import type { Project, MediaAsset } from "@/modules/projects/types";

export interface StoredBlob {
  id: string;
  blob: Blob;
  mimeType: string;
  createdAt: number;
}

export interface StoredThumbnail {
  id: string;
  blob: Blob;
  createdAt: number;
  renderVersion?: number;
}

export class CutframeDatabase extends Dexie {
  projects!: Table<Project, string>;
  assets!: Table<MediaAsset, string>;
  blobs!: Table<StoredBlob, string>;
  thumbnails!: Table<StoredThumbnail, string>;

  constructor() {
    super("CutframeDatabase");

    this.version(1).stores({
      projects: "id, name, createdAt, updatedAt",
      assets: "id, projectId, type, createdAt",
      blobs: "id, mimeType, createdAt",
      thumbnails: "id, createdAt",
    });
  }
}

export const db = new CutframeDatabase();
