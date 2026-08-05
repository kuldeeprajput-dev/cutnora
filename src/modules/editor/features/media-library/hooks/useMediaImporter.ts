import { useState, useCallback } from 'react';
import { useProjectStore } from '@/modules/projects';
import { useToastStore } from '@/shared/components/ui/Toast/useToastStore';
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
        useToastStore.getState().showToast('No active project open', 'warning');
        return;
      }

      const files = Array.from(fileList);
      if (files.length === 0) return;

      setIsImporting(true);
      setImportProgress(0);
      const errors: string[] = [];
      let successCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const { asset } = await processAndStoreMediaFile(file, currentProject.id);
          addAsset(asset);
          successCount++;
        } catch (err) {
          console.error('Import error for file:', file.name, err);
          const errMsg = `Failed to import "${file.name}": ${(err as Error).message}`;
          errors.push(errMsg);
          useToastStore.getState().showToast(errMsg, 'error');
        } finally {
          setImportProgress(Math.round(((i + 1) / files.length) * 100));
        }
      }

      if (errors.length > 0) {
        setImportErrors((prev) => [...prev, ...errors]);
      } else if (successCount > 0) {
        useToastStore.getState().showToast(`Imported ${successCount} media asset(s)`, 'success');
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
