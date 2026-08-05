import { nanoid } from 'nanoid';
import { useProjectStore } from '@/modules/projects';
import type { TimelineClip } from '@/modules/editor/types';

export function detachAudioFromVideo(videoClipId: string): boolean {
  const store = useProjectStore.getState();
  const project = store.currentProject;
  if (!project) return false;

  let videoClip: TimelineClip | undefined;

  for (const track of project.tracks) {
    const c = track.clips.find((x) => x.id === videoClipId);
    if (c) {
      videoClip = c;
      break;
    }
  }

  if (!videoClip || (videoClip.type !== 'video' && videoClip.type !== 'overlay')) {
    return false;
  }

  // Find or create an Audio Track
  const audioTrack = project.tracks.find((t) => t.type === 'audio');

  const newAudioClipId = nanoid();
  const newTrackId = audioTrack ? audioTrack.id : nanoid();

  const newAudioClip: TimelineClip = {
    id: newAudioClipId,
    trackId: newTrackId,
    assetId: videoClip.assetId,
    type: 'audio',
    timelineStart: videoClip.timelineStart,
    timelineDuration: videoClip.timelineDuration,
    sourceStart: videoClip.sourceStart,
    sourceDuration: videoClip.sourceDuration,
    name: `${videoClip.name} (Audio)`,
    speed: videoClip.speed ?? 1,
    transform: { ...videoClip.transform },
    adjustments: { ...videoClip.adjustments },
    audio: {
      volume: videoClip.audio?.volume ?? 1,
      muted: false,
      fadeIn: videoClip.audio?.fadeIn ?? 0,
      fadeOut: videoClip.audio?.fadeOut ?? 0,
    },
  };

  useProjectStore.setState((state) => {
    if (!state.currentProject) return;

    let targetTrack = state.currentProject.tracks.find((t) => t.type === 'audio');
    if (!targetTrack) {
      targetTrack = {
        id: newTrackId,
        type: 'audio',
        name: 'Audio Track',
        order: state.currentProject.tracks.length,
        hidden: false,
        locked: false,
        muted: false,
        clips: [],
      };
      state.currentProject.tracks.push(targetTrack);
    }

    // Add detached audio clip
    targetTrack.clips.push(newAudioClip);

    // Mute original video clip's audio
    for (const t of state.currentProject.tracks) {
      const clipToMute = t.clips.find((x) => x.id === videoClipId);
      if (clipToMute) {
        clipToMute.audio = {
          ...clipToMute.audio,
          muted: true,
        };
      }
    }
  });

  return true;
}
