import type { Project } from '@/modules/projects/types';

export interface AudioExporterSession {
  audioCtx: AudioContext;
  destination: MediaStreamAudioDestinationNode;
  updateAudioFrame: (currentTime: number) => void;
  cleanup: () => void;
}

export function createAudioExporterSession(
  project: Project,
  mediaElementsMap: Map<string, HTMLVideoElement | HTMLImageElement | HTMLAudioElement>
): AudioExporterSession | null {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    const audioCtx = new AudioCtx();
    const destination = audioCtx.createMediaStreamDestination();

    const masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = project.settings.masterVolume ?? 1;
    masterGainNode.connect(destination);

    // Audio nodes per clip
    const clipNodesMap = new Map<string, { gainNode: GainNode; mediaSource?: MediaElementAudioSourceNode }>();

    for (const track of project.tracks) {
      if (track.hidden || track.muted) continue;

      for (const clip of track.clips) {
        if (!clip.assetId) continue;
        const mediaEl = mediaElementsMap.get(clip.assetId);

        if (mediaEl && (mediaEl instanceof HTMLVideoElement || mediaEl instanceof HTMLAudioElement)) {
          try {
            const gainNode = audioCtx.createGain();
            const sourceNode = audioCtx.createMediaElementSource(mediaEl);
            sourceNode.connect(gainNode);
            gainNode.connect(masterGainNode);

            clipNodesMap.set(clip.id, { gainNode, mediaSource: sourceNode });
          } catch (e) {
            console.warn('Audio node connection notice:', e);
          }
        }
      }
    }

    const updateAudioFrame = (currentTime: number) => {
      for (const track of project.tracks) {
        const isTrackMuted = track.muted || track.hidden;

        for (const clip of track.clips) {
          const nodes = clipNodesMap.get(clip.id);
          if (!nodes) continue;

          const isActive = currentTime >= clip.timelineStart && currentTime < clip.timelineStart + clip.timelineDuration;
          const isClipMuted = clip.audio?.muted || isTrackMuted;

          if (!isActive || isClipMuted) {
            nodes.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            continue;
          }

          const baseVolume = clip.audio?.volume ?? 1;
          const clipElapsed = currentTime - clip.timelineStart;
          const fadeIn = clip.audio?.fadeIn ?? 0;
          const fadeOut = clip.audio?.fadeOut ?? 0;

          let gain = baseVolume;

          // Fade In Envelope
          if (fadeIn > 0 && clipElapsed < fadeIn) {
            gain *= clipElapsed / fadeIn;
          }
          // Fade Out Envelope
          else if (fadeOut > 0 && clipElapsed > clip.timelineDuration - fadeOut) {
            const fadeOutElapsed = clip.timelineDuration - clipElapsed;
            gain *= Math.max(0, fadeOutElapsed / fadeOut);
          }

          nodes.gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
        }
      }
    };

    const cleanup = () => {
      clipNodesMap.forEach(({ gainNode }) => {
        try {
          gainNode.disconnect();
        } catch {}
      });
      try {
        masterGainNode.disconnect();
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      } catch {}
    };

    return {
      audioCtx,
      destination,
      updateAudioFrame,
      cleanup,
    };
  } catch (err) {
    console.warn('Failed to create audio export session:', err);
    return null;
  }
}
