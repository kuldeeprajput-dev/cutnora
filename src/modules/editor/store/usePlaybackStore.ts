import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

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
    duration: 10,
    wasTabHiddenPaused: false,

    setPlayhead: (time) =>
      set((state) => {
        state.playhead = Math.max(0, Math.min(state.duration, time));
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

    setIsPlaying: (isPlaying) =>
      set((state) => {
        state.isPlaying = isPlaying;
        if (isPlaying) {
          state.wasTabHiddenPaused = false;
        }
      }),

    togglePlay: () => {
      const current = get().isPlaying;
      set((state) => {
        state.isPlaying = !current;
        if (!current) {
          state.wasTabHiddenPaused = false;
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
        state.duration = Math.max(1, duration);
        if (state.playhead > state.duration) {
          state.playhead = state.duration;
        }
      }),

    setWasTabHiddenPaused: (paused) =>
      set((state) => {
        state.wasTabHiddenPaused = paused;
      }),
  }))
);
