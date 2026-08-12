import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useProjectStore } from '@/modules/projects';

class PlaybackClock {
  private animFrameId: number | null = null;
  private startPerfTime: number = 0;
  private startPlayhead: number = 0;
  private lastPublishedAt: number = 0;
  private publishInterval: number = 0;

  public start(): void {
    if (this.animFrameId !== null) return;

    this.startPerfTime = performance.now();
    this.startPlayhead = usePlaybackStore.getState().playhead;
    this.lastPublishedAt = 0;
    this.publishInterval = window.matchMedia("(max-width: 1023px)").matches
      ? 1000 / 30
      : 0;

    const tick = () => {
      const store = usePlaybackStore.getState();
      if (!store.isPlaying) {
        this.stop();
        return;
      }

      const now = performance.now();
      const elapsedSecs = (now - this.startPerfTime) / 1000;
      const newPlayhead = this.startPlayhead + elapsedSecs * store.playbackRate;

      const currentProject = useProjectStore.getState().currentProject;
      let maxDuration = currentProject?.settings.duration ?? store.duration ?? 0;
      if (currentProject) {
        let maxClipEnd = 0;
        for (const track of currentProject.tracks) {
          for (const clip of track.clips) {
            const clipEnd = clip.timelineStart + clip.timelineDuration;
            if (clipEnd > maxClipEnd) maxClipEnd = clipEnd;
          }
        }
        maxDuration = maxClipEnd;
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
        if (this.publishInterval === 0 || now - this.lastPublishedAt >= this.publishInterval) {
          this.lastPublishedAt = now;
          store.setPlayhead(newPlayhead);
        }
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
