import { nanoid } from "nanoid";
import {
  createExportOpfsPath,
  createOpfsWritableTarget,
  type OpfsWritableTarget,
} from "@/modules/core/storage/opfs-media-storage";
import type { ExportPreflightResult } from "./export-preflight";

export interface ExportOutputTarget {
  write: (chunk: Blob) => Promise<void>;
  close: () => Promise<Blob | null>;
  abort: () => Promise<void>;
}

type SavePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FileSystemFileHandle>;
};

export async function createExportOutputTarget(
  projectId: string,
  requestedName: string,
  preflight: ExportPreflightResult,
): Promise<ExportOutputTarget> {
  const safeName =
    requestedName.trim().replace(/[^a-zA-Z0-9_-]/g, "-") || "video-export";
  const filename = safeName + "." + preflight.extension;
  const mimeBase = preflight.mimeType.split(";")[0];
  const savePicker = (window as SavePickerWindow).showSaveFilePicker;

  if (preflight.destinationStrategy === "direct-file" && savePicker) {
    const handle = await savePicker.call(window, {
      suggestedName: filename,
      types: [
        {
          description:
            preflight.extension === "mp4" ? "MP4 video" : "WebM video",
          accept: {
            [mimeBase]: ["." + preflight.extension],
          },
        },
      ],
    });
    const writable = await handle.createWritable();
    let settled = false;
    return {
      write: async (chunk) => {
        if (settled) throw new Error("Export destination is closed.");
        await writable.write(chunk);
      },
      close: async () => {
        if (!settled) {
          settled = true;
          await writable.close();
        }
        return null;
      },
      abort: async () => {
        if (!settled) {
          settled = true;
          await writable.abort().catch(() => undefined);
        }
      },
    };
  }

  const path = createExportOpfsPath(projectId, nanoid(), preflight.extension);
  const target: OpfsWritableTarget = await createOpfsWritableTarget(path);
  return {
    write: target.write,
    close: target.close,
    abort: target.abort,
  };
}
