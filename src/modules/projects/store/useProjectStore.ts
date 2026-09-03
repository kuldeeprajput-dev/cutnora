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
  resetClipToOriginal,
  deleteClipsFromTracks,
  duplicateClipsInTracks,
  reorderTrackLanes,
  calculateProjectDuration,
} from "@/modules/editor/utils/timeline-utils";
import { historyManager } from "@/modules/editor/store/useHistoryStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { autosaveService } from "../services/autosave-service";
import { db } from "@/modules/core/db/database";

import { mediaAssetSourceExists } from "@/modules/core/storage/media-source-service";

function removeEmptyTracks(project: Project) {
  project.tracks = project.tracks.filter((track) => track.clips.length > 0);
  project.tracks.forEach((track, index) => {
    track.order = index;
  });
}

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
  updateProjectSettings: (
    settings: Partial<ProjectSettings>,
    options?: { recordHistory?: boolean },
  ) => void;

  addAsset: (asset: MediaAsset) => void;
  removeAsset: (assetId: string) => void;
  repairProjectReferences: () => Promise<number>;

  addTrack: (type: Track["type"], name?: string) => void;
  deleteTrack: (trackId: string) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;
  toggleTrackMute: (trackId: string) => void;

  addClip: (trackId: string, clip: TimelineClip) => void;
  updateClip: (
    clipId: string,
    updates: Partial<TimelineClip>,
    options?: { skipHistory?: boolean },
  ) => void;
  renameClip: (clipId: string, name: string) => void;
  moveClip: (clipId: string, targetTrackId: string, newStart: number) => void;
  moveClipToNewTrack: (
    clipId: string,
    trackType: Track["type"],
    newStart: number,
    trackName: string,
  ) => void;
  trimClip: (
    clipId: string,
    newStart: number,
    newDuration: number,
    newSourceStart: number,
  ) => void;
  resetClipTiming: (clipId: string) => void;
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
          removeEmptyTracks(project);
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

    updateProjectSettings: (settingsUpdates, options) => {
      const current = get().currentProject;
      if (!current) return;

      const changedEntries = Object.entries(settingsUpdates).filter(
        ([key, value]) =>
          !Object.is(current.settings[key as keyof ProjectSettings], value),
      );
      if (changedEntries.length === 0) return;

      const effectiveUpdates = Object.fromEntries(
        changedEntries,
      ) as Partial<ProjectSettings>;

      if (options?.recordHistory !== false) {
        historyManager.pushState(current);
      }

      // When canvas dimensions change, proportionally rescale all clip transforms
      // so clips maintain their relative position & size on the new canvas.
      const oldW = current.settings.width;
      const oldH = current.settings.height;
      const newW = effectiveUpdates.width ?? oldW;
      const newH = effectiveUpdates.height ?? oldH;
      const scaleX = oldW > 0 ? newW / oldW : 1;
      const scaleY = oldH > 0 ? newH / oldH : 1;
      const dimensionsChanged = newW !== oldW || newH !== oldH;

      set((state) => {
        if (state.currentProject) {
          state.currentProject.settings = {
            ...state.currentProject.settings,
            ...effectiveUpdates,
          };
          // Rescale clip transforms only when canvas dimensions actually change
          if (dimensionsChanged) {
            state.currentProject.tracks.forEach((track) => {
              track.clips = track.clips.map((clip) => ({
                ...clip,
                transform: {
                  ...clip.transform,
                  x: Math.round(clip.transform.x * scaleX),
                  y: Math.round(clip.transform.y * scaleY),
                  width: Math.round(clip.transform.width * scaleX),
                  height: Math.round(clip.transform.height * scaleY),
                },
              }));
            });
          }
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
          removeEmptyTracks(state.currentProject);
          syncProjectDuration(state.currentProject);
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
        if (asset && (await mediaAssetSourceExists(asset))) {
          validAssetIds.add(assetId);
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
          removeEmptyTracks(state.currentProject);
          syncProjectDuration(state.currentProject);
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
          removeEmptyTracks(state.currentProject);
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

    updateClip: (clipId, updates, options) => {
      const current = get().currentProject;
      if (!current) return;

      // Only push history when explicitly NOT skipping (e.g. not during live drag).
      // During drag (pointermove), pass { skipHistory: true } to avoid flooding
      // the history stack on every frame which causes "Maximum update depth exceeded".
      if (!options?.skipHistory) {
        historyManager.pushState(current);
      }
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
          let updatedTracks = moveClipInTimeline(
            state.currentProject.tracks,
            clipId,
            targetTrackId,
            newStart,
          );

          updatedTracks = updatedTracks
            .filter((track) => track.clips.length > 0)
            .map((track, index) => ({ ...track, order: index }));

          state.currentProject.tracks = updatedTracks;
          syncProjectDuration(state.currentProject);
        }
      });

      const updated = get().currentProject;
      if (updated) autosaveService.scheduleSave(updated);
    },

    moveClipToNewTrack: (clipId, trackType, newStart, trackName) => {
      const current = get().currentProject;
      if (!current) return;

      const sourceClip = current.tracks
        .flatMap((track) => track.clips)
        .find((clip) => clip.id === clipId);
      if (!sourceClip) return;

      historyManager.pushState(current);
      set((state) => {
        if (!state.currentProject) return;

        let movedClip: TimelineClip | undefined;
        state.currentProject.tracks.forEach((track) => {
          const clip = track.clips.find((item) => item.id === clipId);
          if (clip) movedClip = { ...clip } as TimelineClip;
          track.clips = track.clips.filter((item) => item.id !== clipId);
        });

        if (!movedClip) return;

        state.currentProject.tracks = state.currentProject.tracks.filter(
          (track) => track.clips.length > 0,
        );
        state.currentProject.tracks.forEach((track, index) => {
          track.order = index;
        });

        const trackId = nanoid();
        const trackCount = state.currentProject.tracks.length;
        const newTrack: Track = {
          id: trackId,
          type: trackType,
          name: trackName,
          order: trackCount,
          hidden: false,
          locked: false,
          muted: false,
          clips: [
            {
              ...movedClip,
              trackId,
              timelineStart: Number(Math.max(0, newStart).toFixed(3)),
            },
          ],
        };

        state.currentProject.tracks.push(newTrack);
        syncProjectDuration(state.currentProject);
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

    resetClipTiming: (clipId) => {
      const current = get().currentProject;
      if (!current) return;

      historyManager.pushState(current);
      set((state) => {
        if (state.currentProject) {
          state.currentProject.tracks = resetClipToOriginal(
            state.currentProject.tracks,
            clipId,
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
          );
          removeEmptyTracks(state.currentProject);
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
          if (state.currentProject) {
            removeEmptyTracks(state.currentProject);
            syncProjectDuration(state.currentProject);
          }
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
          if (state.currentProject) {
            removeEmptyTracks(state.currentProject);
            syncProjectDuration(state.currentProject);
          }
        });
        autosaveService.scheduleSave(next);
      }
    },
  })),
);
