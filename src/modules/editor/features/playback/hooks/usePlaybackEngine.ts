import { useEffect } from 'react';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { playbackClock } from '../services/playback-clock';
import { audioEngine } from '../services/audio-engine';

export function usePlaybackEngine() {
  const { isPlaying, setIsPlaying, setWasTabHiddenPaused } = usePlaybackStore();

  // Sync playback clock loop with isPlaying
  useEffect(() => {
    if (isPlaying) {
      audioEngine.init();
      playbackClock.start();
    } else {
      playbackClock.stop();
    }
  }, [isPlaying]);

  // Tab visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && usePlaybackStore.getState().isPlaying) {
        setIsPlaying(false);
        setWasTabHiddenPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setIsPlaying, setWasTabHiddenPaused]);
}
