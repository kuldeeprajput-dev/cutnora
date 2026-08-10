import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import type { Project, ProjectSettings, MediaAsset } from "../types";
import type { Track, TimelineClip } from "@/modules/editor/types";
import {
  addClipToTrack,
  moveClipInTimeline,
  trimClipBounds,
  splitClipAtTime,
  deleteClipsFromTracks,
  duplicateClipsInTracks,
  reorderTrackLanes,
  calculateProjectDuration,
} from "@/modules/editor/utils/timeline-utils";
import { historyManager } from "@/modules/editor/store/useHistoryStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { autosaveService } from "../services/autosave-service";
import { db } from "@/modules/core/db/database";

function syncProjectDuration(project: Project) {
  const newDuration = calculateProjectDuration(project.tracks);
  try {
    project.settings.duration = newDuration;
  } catch {
    project.settings = { ...project.settings, duration: newDuration };
  }
  usePlaybackStore.getState().setDuration(newDuration);
}

interface ProjectState {
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  createProject: (
    name?: string,
    settings?: Partial<ProjectSettings>,
  ) => Promise<Project>;
  loadProject: (id: string) => Promise<boolean>;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;

  addAsset: (asset: MediaAsset) => void;
  removeAsset: (assetId: string) => void;
  repairProjectReferences: () => Promise<number>;

  addTrack: (type: Track["type"], name?: string) => void;
  deleteTrack: (trackId: string) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;
  toggleTrackMute: (trackId: string) => void;

  addClip: (trackId: string, clip: TimelineClip) => void;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  renameClip: (clipId: string, name: string) => void;
  moveClip: (clipId: string, targetTrackId: string, newStart: number) => void;
  trimClip: (
    clipId: string,
    newStart: number,
    newDuration: number,
    newSourceStart: number,
  ) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  deleteClips: (clipIds: string[]) => void;
  duplicateClips: (clipIds: string[]) => void;

  undo: () => void;
  redo: () => void;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    currentProject: null,
    isLoading: false,
    error: null,

    createProject: async (name = "Untitled Project", customSettings = {}) => {
      const defaultSettings: ProjectSettings = {
        width: 1920,
        height: 1080,
        aspectRatio: "16:9",
        fps: 30,
        duration: 10,
        backgroundColor: "#000000",
        masterVolume: 1,
        ...customSettings,
      };

      const defaultTracks: Track[] = [];

      const newProject: Project = {
        id: nanoid(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        schemaVersion: 1,
        settings: defaultSettings,
        tracks: defaultTracks,
        assetIds: [],
      };

      await db.projects.put(newProject);
      historyManager.clear();
      set((state) => {
        state.currentProject = newProject;
        if (state.currentProject) {
          syncProjectDuration(state.currentProject);
        }
      });

      return newProject;
    },

    loadProject: async (id: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const project = await db.projects.get(id);
        if (project) {
          project.tracks = project.tracks.filter((t) => t.clips.length > 0);
          historyManager.clear();
          set((state) => {
            state.currentProject = project;
            if (state.currentProject) {
              syncProjectDuration(state.currentProject);
            }
            state.isLoading = false;
          });
          return true;
        } else {
          set((state) => {
            state.isLoading = false;
            state.error = "Project not found";
          });
          return false;
        }
      } catch (err) {
        set((state) => {
          state.isLoading = false;
          state.error = String(err);
        });
        return false;
      }
    },

    updateProjectSettings: (settingsUpdates) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.settings = {
            ...state.currentProject.settings,
            ...settingsUpdates,
          };
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    addAsset: (asset) => {
      const current = get().currentProject;
      if (!current) return;

      set((state) => {
        if (state.currentProject) {
          if (!state.currentProject.assetIds.includes(asset.id)) {
            state.currentProject.assetIds.push(asset.id);
          }
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    removeAsset: (assetId) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.assetIds = state.currentProject.assetIds.filter(
            (id) => id !== assetId,
          );
          state.currentProject.tracks.forEach((track) => {
            track.clips = track.clips.filter(
              (clip) => clip.assetId !== assetId,
            );
          });
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    repairProjectReferences: async () => {
      const current = get().currentProject;
      if (!current) return 0;

      let repairedCount = 0;
      const validAssetIds = new Set<string>();

      for (const assetId of current.assetIds) {
        const asset = await db.assets.get(assetId);
        if (asset) {
          if (asset.remoteUrl) {
            validAssetIds.add(assetId);
            continue;
          }
          const blob = await db.blobs.get(asset.blobId);
          if (blob) {
            validAssetIds.add(assetId);
          }
        }
      }

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          const origAssets = state.currentProject.assetIds.length;
          state.currentProject.assetIds = Array.from(validAssetIds);

          state.currentProject.tracks.forEach((track) => {
            const origClips = track.clips.length;
            track.clips = track.clips.filter((clip) => {
              if (clip.assetId) {
                return validAssetIds.has(clip.assetId);
              }
              return true;
            });
            repairedCount += origClips - track.clips.length;
          });

          repairedCount += origAssets - state.currentProject.assetIds.length;
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
      return repairedCount;
    },

    addTrack: (type, name) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          const trackCount = state.currentProject.tracks.length;
          const newTrack: Track = {
            id: nanoid(),
            type,
            name:
              name ||
              `${type.charAt(0).toUpperCase() + type.slice(1)} ${trackCount + 1}`,
            order: trackCount,
            hidden: false,
            locked: false,
            muted: false,
            clips: [],
          };
          state.currentProject.tracks.push(newTrack);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    deleteTrack: (trackId) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks = state.currentProject.tracks.filter(
            (t) => t.id !== trackId,
          );
          syncProjectDuration(state.currentProject);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    reorderTracks: (startIndex, endIndex) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks = reorderTrackLanes(
            state.currentProject.tracks,
            startIndex,
            endIndex,
          );
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    toggleTrackMute: (trackId) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          const t = state.currentProject.tracks.find((x) => x.id === trackId);
          if (t) t.muted = !t.muted;
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    addClip: (trackId, clip) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks = addClipToTrack(
            state.currentProject.tracks,
            trackId,
            clip,
          );
          syncProjectDuration(state.currentProject);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    updateClip: (clipId, updates) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks.forEach((track) => {
            track.clips = track.clips.map((clip) => {
              if (clip.id === clipId) {
                return { ...clip, ...updates };
              }
              return clip;
            });
          });
          syncProjectDuration(state.currentProject);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    renameClip: (clipId, name) => {
      get().updateClip(clipId, { name });
    },

    moveClip: (clipId, targetTrackId, newStart) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks = moveClipInTimeline(
            state.currentProject.tracks,
            clipId,
            targetTrackId,
            newStart,
          );
          syncProjectDuration(state.currentProject);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    trimClip: (clipId, newStart, newDuration, newSourceStart) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks = trimClipBounds(
            state.currentProject.tracks,
            clipId,
            newStart,
            newDuration,
            newSourceStart,
          );
          syncProjectDuration(state.currentProject);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    splitClip: (clipId, splitTime) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks = splitClipAtTime(
            state.currentProject.tracks,
            clipId,
            splitTime,
          );
          syncProjectDuration(state.currentProject);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    deleteClips: (clipIds) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks = deleteClipsFromTracks(
            state.currentProject.tracks,
            clipIds,
          ).filter((t) => t.clips.length > 0);
          syncProjectDuration(state.currentProject);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    duplicateClips: (clipIds) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks = duplicateClipsInTracks(
            state.currentProject.tracks,
            clipIds,
          );
          syncProjectDuration(state.currentProject);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    undo: () => {
      const current = get().currentProject;
      if (!current) return;

      const previous = historyManager.undo(current);
      if (previous) {
        set((state) => {
          state.currentProject = previous;
        });
        autosaveService.scheduleSave(previous);
      }
    },

    redo: () => {
      const current = get().currentProject;
      if (!current) return;

      const next = historyManager.redo(current);
      if (next) {
        set((state) => {
          state.currentProject = next;
        });
        autosaveService.scheduleSave(next);
      }
    },
  })),
);
