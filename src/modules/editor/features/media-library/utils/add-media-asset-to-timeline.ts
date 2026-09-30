import { nanoid } from 'nanoid';
import { useProjectStore } from '@/modules/projects';
import type { MediaAsset } from '@/modules/projects/types';
import type { TimelineClip, Track } from '@/modules/editor/types';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';

export function addMediaAssetToTimeline(asset: MediaAsset): TimelineClip | null {
  const project = useProjectStore.getState().currentProject;
  if (!project) return null;

  const trackType: Track['type'] = asset.type === 'audio' ? 'audio' : 'video';
  let targetTrack = project.tracks.find((t) => t.type === trackType);

  if (!targetTrack) {
    const trackName = `${trackType.charAt(0).toUpperCase() + trackType.slice(1)} Track`;
    useProjectStore.getState().addTrack(trackType, trackName);
    targetTrack = useProjectStore.getState().currentProject?.tracks.find((t) => t.type === trackType);
  }
  if (!targetTrack) return null;

  const lastClip = targetTrack.clips[targetTrack.clips.length - 1];
  const start = lastClip ? lastClip.timelineStart + lastClip.timelineDuration : 0;
  const duration = Math.max(0.1, asset.type === 'image' ? 5 : asset.duration || 5);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;

  const clipWidth = isMobile ? project.settings.width : asset.width || project.settings.width;
  const clipHeight = isMobile ? project.settings.height : asset.height || project.settings.height;
  const initialX = Math.round((project.settings.width - clipWidth) / 2);
  const initialY = Math.round((project.settings.height - clipHeight) / 2);

  const clip: TimelineClip = {
    id: nanoid(),
    trackId: targetTrack.id,
    assetId: asset.id,
    type: asset.type,
    timelineStart: Math.max(0, start),
    timelineDuration: duration,
    sourceStart: 0,
    sourceDuration: duration,
    name: asset.name,
    transform: {
      x: initialX,
      y: initialY,
      width: clipWidth,
      height: clipHeight,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      fitMode: 'contain',
    },
    adjustments: { brightness: 1, contrast: 1, saturation: 1, blur: 0, grayscale: 0, sepia: 0 },
    audio: { volume: 1, muted: false, fadeIn: 0, fadeOut: 0 },
    speed: 1,
  };

  useProjectStore.getState().addClip(targetTrack.id, clip);
  if (isMobile) useEditorUIStore.getState().setSelectedClipIds([clip.id]);
  return clip;
}
