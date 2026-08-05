import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useProjectStore } from '@/modules/projects';

class PlaybackClock {
  private animFrameId: number | null = null;
  private startPerfTime: number = 0;
  private startPlayhead: number = 0;

  public start(): void {
    if (this.animFrameId !== null) return;

    this.startPerfTime = performance.now();
    this.startPlayhead = usePlaybackStore.getState().playhead;

    const tick = () => {
      const store = usePlaybackStore.getState();
      if (!store.isPlaying) {
        this.stop();
        return;
      }

      const elapsedSecs = (performance.now() - this.startPerfTime) / 1000;
      const newPlayhead = this.startPlayhead + elapsedSecs * store.playbackRate;

      const currentProject = useProjectStore.getState().currentProject;
      let maxDuration = currentProject?.settings.duration || store.duration || 10;
      if (currentProject) {
        let maxClipEnd = 0;
        for (const track of currentProject.tracks) {
          for (const clip of track.clips) {
            const clipEnd = clip.timelineStart + clip.timelineDuration;
            if (clipEnd > maxClipEnd) maxClipEnd = clipEnd;
          }
        }
        if (maxClipEnd > 0) {
          maxDuration = maxClipEnd;
        }
      }

      if (newPlayhead >= maxDuration) {
        if (store.isLooping) {
          this.startPerfTime = performance.now();
          this.startPlayhead = 0;
          store.setPlayhead(0);
          this.animFrameId = requestAnimationFrame(tick);
        } else {
          store.setPlayhead(maxDuration);
          store.setIsPlaying(false);
          this.stop();
        }
      } else {
        store.setPlayhead(newPlayhead);
        this.animFrameId = requestAnimationFrame(tick);
      }
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  public stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

export const playbackClock = new PlaybackClock();
