import { nanoid } from "nanoid";
import {
  createExportOpfsPath,
  createOpfsWritableTarget,
  type OpfsWritableTarget,
  type WritableChunk,
} from "@/modules/core/storage/opfs-media-storage";
import type { ExportPreflightResult } from "./export-preflight";

export interface ExportOutputTarget {
  write: (chunk: WritableChunk, position?: number) => Promise<void>;
  close: () => Promise<Blob | null>;
  dispose?: () => Promise<void>;
  abort: () => Promise<void>;
}

export async function createExportOutputTarget(
  projectId: string,
  _requestedName: string,
  preflight: ExportPreflightResult,
): Promise<ExportOutputTarget> {
  const path = createExportOpfsPath(projectId, nanoid(), preflight.extension);
  const target: OpfsWritableTarget = await createOpfsWritableTarget(path);
  return {
    write: target.write,
    close: target.close,
    dispose: target.dispose,
    abort: target.abort,
  };
}
