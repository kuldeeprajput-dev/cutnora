import type { Project } from '@/modules/projects/types';

const MAX_HISTORY = 100;

export interface HistoryState {
  past: Project[];
  future: Project[];
}

export class HistoryManager {
  private past: Project[] = [];
  private future: Project[] = [];

  public pushState(currentProject: Project): void {
    const serialized = JSON.parse(JSON.stringify(currentProject));
    this.past.push(serialized);
    if (this.past.length > MAX_HISTORY) {
      this.past.shift();
    }
    this.future = [];
  }

  public canUndo(): boolean {
    return this.past.length > 0;
  }

  public canRedo(): boolean {
    return this.future.length > 0;
  }

  public undo(currentProject: Project): Project | null {
    if (!this.canUndo()) return null;
    const previous = this.past.pop()!;
    this.future.push(JSON.parse(JSON.stringify(currentProject)));
    return previous;
  }

  public redo(currentProject: Project): Project | null {
    if (!this.canRedo()) return null;
    const next = this.future.pop()!;
    this.past.push(JSON.parse(JSON.stringify(currentProject)));
    return next;
  }

  public clear(): void {
    this.past = [];
    this.future = [];
  }
}

export const historyManager = new HistoryManager();
