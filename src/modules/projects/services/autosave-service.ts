import { db } from '@/modules/core/db/database';
import { useToastStore } from '@/shared/components/ui/Toast/useToastStore';
import type { Project } from '../types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

class AutosaveService {
  private status: SaveStatus = 'idle';
  private pendingProject: Project | null = null;
  private timer: NodeJS.Timeout | null = null;
  private listeners = new Set<(status: SaveStatus) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushPendingSaveSync();
      });
    }
  }

  public subscribe(listener: (status: SaveStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: SaveStatus): void {
    this.status = status;
    this.listeners.forEach((l) => l(status));
  }

  public getStatus(): SaveStatus {
    return this.status;
  }

  public scheduleSave(project: Project, delayMs = 1000): void {
    this.pendingProject = project;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.setStatus('saving');

    this.timer = setTimeout(() => {
      this.executeSave();
    }, delayMs);
  }

  public async executeSave(): Promise<void> {
    if (!this.pendingProject) return;
    const projectToSave = this.pendingProject;
    this.pendingProject = null;

    try {
      projectToSave.updatedAt = Date.now();
      await db.projects.put(projectToSave);
      this.setStatus('saved');
      useToastStore.getState().showToast('Project saved', 'success');
    } catch (err) {
      console.error('Failed to autosave project:', err);
      this.setStatus('error');
      useToastStore.getState().showToast('Failed to save project', 'error');
    }
  }

  public flushPendingSaveSync(): void {
    if (this.pendingProject) {
      const projectToSave = this.pendingProject;
      projectToSave.updatedAt = Date.now();
      db.projects.put(projectToSave).catch((err) => {
        console.error('Failed sync flush save:', err);
      });
    }
  }
}

export const autosaveService = new AutosaveService();
