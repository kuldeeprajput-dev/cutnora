import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useProjectStore } from "@/modules/projects";
interface PlaybackState {
  playhead: number; // In seconds
  isPlaying: boolean;
  isLooping: boolean;
  playbackRate: number;
  fps: number;
  duration: number;
  wasTabHiddenPaused: boolean;

  setPlayhead: (time: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setIsLooping: (isLooping: boolean) => void;
  toggleLooping: () => void;
  setPlaybackRate: (rate: number) => void;
  setFps: (fps: number) => void;
  setDuration: (duration: number) => void;
  setWasTabHiddenPaused: (paused: boolean) => void;
}

export const usePlaybackStore = create<PlaybackState>()(
  immer((set, get) => ({
    playhead: 0,
    isPlaying: false,
    isLooping: false,
    playbackRate: 1,
    fps: 30,
    duration: 0,
    wasTabHiddenPaused: false,

    setPlayhead: (time) =>
      set((state) => {
        state.playhead = Math.max(0, Math.min(state.duration || 0, time));
      }),

    stepForward: () => {
      const { playhead, fps, duration } = get();
      const frameDuration = 1 / fps;
      set((state) => {
        state.playhead = Math.min(duration, playhead + frameDuration);
      });
    },

    stepBackward: () => {
      const { playhead, fps } = get();
      const frameDuration = 1 / fps;
      set((state) => {
        state.playhead = Math.max(0, playhead - frameDuration);
      });
    },

    setIsPlaying: (isPlaying) => {
      const { playhead, duration } = get();
      const currentProject = useProjectStore.getState().currentProject;
      let maxDuration = duration;

      if (currentProject) {
        let maxClipEnd = 0;
        for (const track of currentProject.tracks) {
          for (const clip of track.clips) {
            const clipEnd = clip.timelineStart + clip.timelineDuration;
            if (clipEnd > maxClipEnd) maxClipEnd = clipEnd;
          }
        }
        maxDuration =
          maxClipEnd > 0 ? maxClipEnd : currentProject.settings.duration;
      }

      set((state) => {
        state.isPlaying = isPlaying;
        if (isPlaying) {
          state.wasTabHiddenPaused = false;
          if (playhead >= maxDuration - 0.15) {
            state.playhead = 0;
          }
        }
      });
    },

    togglePlay: () => {
      const { isPlaying, playhead, duration } = get();
      const currentProject = useProjectStore.getState().currentProject;
      let maxDuration = duration;

      if (currentProject) {
        let maxClipEnd = 0;
        for (const track of currentProject.tracks) {
          for (const clip of track.clips) {
            const clipEnd = clip.timelineStart + clip.timelineDuration;
            if (clipEnd > maxClipEnd) maxClipEnd = clipEnd;
          }
        }
        maxDuration =
          maxClipEnd > 0 ? maxClipEnd : currentProject.settings.duration;
      }

      const willPlay = !isPlaying;

      set((state) => {
        state.isPlaying = willPlay;
        if (willPlay) {
          state.wasTabHiddenPaused = false;
          if (playhead >= maxDuration - 0.15) {
            state.playhead = 0;
          }
        }
      });
    },

    setIsLooping: (isLooping) =>
      set((state) => {
        state.isLooping = isLooping;
      }),

    toggleLooping: () =>
      set((state) => {
        state.isLooping = !state.isLooping;
      }),

    setPlaybackRate: (rate) =>
      set((state) => {
        state.playbackRate = Math.min(4, Math.max(0.25, rate));
      }),

    setFps: (fps) =>
      set((state) => {
        state.fps = fps;
      }),

    setDuration: (duration) =>
      set((state) => {
        state.duration = Math.max(0, duration);
        if (state.duration === 0 || state.playhead > state.duration) {
          state.playhead =
            state.duration === 0 ? 0 : Math.min(state.playhead, state.duration);
        }
      }),

    setWasTabHiddenPaused: (paused) =>
      set((state) => {
        state.wasTabHiddenPaused = paused;
      }),
  })),
);
