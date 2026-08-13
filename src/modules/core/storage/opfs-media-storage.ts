const MEBIBYTE = 1024 * 1024;
const FALLBACK_HEADROOM = 512 * MEBIBYTE;

export interface StorageCapacity {
  quota?: number;
  usage?: number;
  available?: number;
  persisted: boolean;
}

export interface OpfsWriteProgress {
  bytesWritten: number;
  totalBytes: number;
}

export interface OpfsWriteOptions {
  signal?: AbortSignal;
  onProgress?: (progress: OpfsWriteProgress) => void;
}

export interface OpfsWritableTarget {
  path: string;
  write: (chunk: Blob) => Promise<void>;
  close: () => Promise<File>;
  abort: () => Promise<void>;
}

type StorageManagerWithDirectory = StorageManager & {
  getDirectory?: () => Promise<FileSystemDirectoryHandle>;
};

function storageManager(): StorageManagerWithDirectory | null {
  if (typeof navigator === "undefined" || !navigator.storage) return null;
  return navigator.storage as StorageManagerWithDirectory;
}

export function supportsOpfs(): boolean {
  return typeof storageManager()?.getDirectory === "function";
}

export async function getStorageCapacity(
  requestPersistence = false,
): Promise<StorageCapacity> {
  const storage = storageManager();
  if (!storage) return { persisted: false };

  let persisted = false;
  try {
    persisted = await storage.persisted();
    if (!persisted && requestPersistence) persisted = await storage.persist();
  } catch {
    // Persistence is a best-effort browser permission.
  }

  try {
    const estimate = await storage.estimate();
    const quota = estimate.quota;
    const usage = estimate.usage;
    return {
      quota,
      usage,
      available:
        quota !== undefined && usage !== undefined
          ? Math.max(0, quota - usage)
          : undefined,
      persisted,
    };
  } catch {
    return { persisted };
  }
}

export async function assertStorageCapacity(fileSize: number): Promise<void> {
  const capacity = await getStorageCapacity(true);
  if (capacity.available === undefined) return;

  const required =
    fileSize + Math.max(Math.ceil(fileSize * 0.1), FALLBACK_HEADROOM);
  if (capacity.available < required) {
    throw new Error(
      "Not enough local storage. This import needs " +
        formatBytes(required) +
        " free, but only " +
        formatBytes(capacity.available) +
        " is available.",
    );
  }
}

export function createMediaOpfsPath(
  projectId: string,
  assetId: string,
): string {
  return "projects/" + projectId + "/media/" + assetId;
}

export function createExportOpfsPath(
  projectId: string,
  exportId: string,
  extension: string,
): string {
  return "projects/" + projectId + "/exports/" + exportId + "." + extension;
}

async function getRoot(): Promise<FileSystemDirectoryHandle> {
  const storage = storageManager();
  if (!storage?.getDirectory) {
    throw new Error("This browser does not support large local media storage.");
  }
  return storage.getDirectory();
}

async function resolveParent(
  path: string,
  create: boolean,
): Promise<{ directory: FileSystemDirectoryHandle; filename: string }> {
  const parts = path.split("/").filter(Boolean);
  const filename = parts.pop();
  if (!filename) throw new Error("Invalid local media path.");

  let directory = await getRoot();
  for (const part of parts) {
    directory = await directory.getDirectoryHandle(part, { create });
  }
  return { directory, filename };
}

export async function writeFileToOpfs(
  path: string,
  file: File,
  options: OpfsWriteOptions = {},
): Promise<void> {
  const { directory, filename } = await resolveParent(path, true);
  const handle = await directory.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  const reader = file.stream().getReader();
  let bytesWritten = 0;

  try {
    while (true) {
      if (options.signal?.aborted) {
        throw new DOMException("Import cancelled", "AbortError");
      }
      const { done, value } = await reader.read();
      if (done) break;
      await writable.write(value);
      bytesWritten += value.byteLength;
      options.onProgress?.({ bytesWritten, totalBytes: file.size });
    }
    await writable.close();
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    await writable.abort().catch(() => undefined);
    await directory.removeEntry(filename).catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

export async function getOpfsFile(path: string): Promise<File> {
  const { directory, filename } = await resolveParent(path, false);
  const handle = await directory.getFileHandle(filename);
  return handle.getFile();
}

export async function deleteOpfsFile(path: string): Promise<void> {
  try {
    const { directory, filename } = await resolveParent(path, false);
    await directory.removeEntry(filename);
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") return;
    throw error;
  }
}

export async function createOpfsWritableTarget(
  path: string,
): Promise<OpfsWritableTarget> {
  const { directory, filename } = await resolveParent(path, true);
  const handle = await directory.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  let settled = false;

  return {
    path,
    write: async (chunk) => {
      if (settled) throw new Error("Export destination is already closed.");
      await writable.write(chunk);
    },
    close: async () => {
      if (!settled) {
        settled = true;
        await writable.close();
      }
      const file = await (await directory.getFileHandle(filename)).getFile();
      await directory.removeEntry(filename).catch(() => undefined);
      return file;
    },
    abort: async () => {
      if (!settled) {
        settled = true;
        await writable.abort().catch(() => undefined);
      }
      await directory.removeEntry(filename).catch(() => undefined);
    },
  };
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + " GB";
  if (bytes >= MEBIBYTE) return (bytes / MEBIBYTE).toFixed(0) + " MB";
  return Math.ceil(bytes / 1024) + " KB";
}
