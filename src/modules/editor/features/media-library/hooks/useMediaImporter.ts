import { useCallback, useEffect, useRef, useState } from "react";
import { useProjectStore } from "@/modules/projects";
import { useToastStore } from "@/shared/components/ui/Toast/useToastStore";
import {
  processAndStoreMediaFile,
  type ImportProgress,
} from "../services/media-import-service";

export interface UseMediaImporterReturn {
  isImporting: boolean;
  importProgress: number;
  importStatus: ImportProgress | null;
  importErrors: string[];
  importFiles: (files: FileList | File[]) => Promise<void>;
  cancelImport: () => void;
  clearErrors: () => void;
}

export function useMediaImporter(): UseMediaImporterReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<ImportProgress | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const currentProject = useProjectStore((state) => state.currentProject);
  const addAsset = useProjectStore((state) => state.addAsset);
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressFrameRef = useRef<number | null>(null);
  const queuedProgressRef = useRef<{
    status: ImportProgress;
    overallProgress: number;
  } | null>(null);

  const clearQueuedProgress = useCallback(() => {
    if (progressFrameRef.current !== null) {
      cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = null;
    }
    queuedProgressRef.current = null;
  }, []);

  const queueProgress = useCallback(
    (status: ImportProgress, overallProgress: number) => {
      queuedProgressRef.current = { status, overallProgress };
      if (progressFrameRef.current !== null) return;
      progressFrameRef.current = requestAnimationFrame(() => {
        progressFrameRef.current = null;
        const queued = queuedProgressRef.current;
        queuedProgressRef.current = null;
        if (!queued) return;
        setImportStatus(queued.status);
        setImportProgress(queued.overallProgress);
      });
    },
    [],
  );

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearQueuedProgress();
    };
  }, [clearQueuedProgress]);

  const clearErrors = useCallback(() => {
    setImportErrors([]);
  }, []);

  const cancelImport = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const importFiles = useCallback(
    async (fileList: FileList | File[]) => {
      if (!currentProject) {
        setImportErrors(["No active project open."]);
        useToastStore.getState().showToast("No active project open", "warning");
        return;
      }

      const files = Array.from(fileList);
      if (files.length === 0) return;

      setIsImporting(true);
      setImportProgress(0);
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const errors: string[] = [];
      let successCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const { asset } = await processAndStoreMediaFile(
            file,
            currentProject.id,
            {
              signal: controller.signal,
              onProgress: (status) => {
                queueProgress(
                  status,
                  Math.round(
                    ((i + status.percentage / 100) / files.length) * 100,
                  ),
                );
              },
            },
          );
          addAsset(asset);
          successCount++;
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve()),
          );
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") break;
          console.error("Import error for file:", file.name, err);
          const errMsg = `Failed to import "${file.name}": ${(err as Error).message}`;
          errors.push(errMsg);
          useToastStore.getState().showToast(errMsg, "error");
        } finally {
          if (!controller.signal.aborted) {
            setImportProgress(Math.round(((i + 1) / files.length) * 100));
          }
        }
      }

      if (errors.length > 0) {
        setImportErrors((prev) => [...prev, ...errors]);
      } else if (successCount > 0) {
        useToastStore
          .getState()
          .showToast(`Imported ${successCount} media asset(s)`, "success");
      }

      if (controller.signal.aborted) {
        useToastStore.getState().showToast("Import cancelled", "info");
      }
      clearQueuedProgress();
      abortControllerRef.current = null;
      setImportStatus(null);
      setIsImporting(false);
    },
    [addAsset, clearQueuedProgress, currentProject, queueProgress],
  );

  return {
    isImporting,
    importProgress,
    importStatus,
    importErrors,
    importFiles,
    cancelImport,
    clearErrors,
  };
}
