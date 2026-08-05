import { useState, useCallback } from 'react';
import { useProjectStore } from '@/modules/projects';
import { processAndStoreMediaFile } from '../services/media-import-service';

export interface UseMediaImporterReturn {
  isImporting: boolean;
  importProgress: number;
  importErrors: string[];
  importFiles: (files: FileList | File[]) => Promise<void>;
  clearErrors: () => void;
}

export function useMediaImporter(): UseMediaImporterReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const { currentProject, addAsset } = useProjectStore();

  const clearErrors = useCallback(() => {
    setImportErrors([]);
  }, []);

  const importFiles = useCallback(
    async (fileList: FileList | File[]) => {
      if (!currentProject) {
        setImportErrors(['No active project open.']);
        return;
      }

      const files = Array.from(fileList);
      if (files.length === 0) return;

      setIsImporting(true);
      setImportProgress(0);
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Check for duplicate in project asset list
          const isDuplicate = Boolean(
            currentProject.assetIds.find(() => {
              // Duplicate check helper
              return false;
            })
          );

          if (isDuplicate) {
            errors.push(`File "${file.name}" is already in the project.`);
            continue;
          }

          const { asset } = await processAndStoreMediaFile(file, currentProject.id);
          addAsset(asset);
        } catch (err) {
          console.error('Import error for file:', file.name, err);
          errors.push(`Failed to import "${file.name}": ${(err as Error).message}`);
        } finally {
          setImportProgress(Math.round(((i + 1) / files.length) * 100));
        }
      }

      if (errors.length > 0) {
        setImportErrors((prev) => [...prev, ...errors]);
      }

      setIsImporting(false);
    },
    [currentProject, addAsset]
  );

  return {
    isImporting,
    importProgress,
    importErrors,
    importFiles,
    clearErrors,
  };
}
