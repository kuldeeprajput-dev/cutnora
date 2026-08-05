'use client';

import React from 'react';
import { useProjectStore } from '@/modules/projects';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import type { TimelineClip, Track } from '@/modules/editor/types';
import { VideoLayer } from './VideoLayer';
import { ImageLayer } from './ImageLayer';
import { TextLayer } from './TextLayer';
import { ElementLayer } from './ElementLayer';
import { SelectionOverlay } from './SelectionOverlay';
import { CropOverlay } from './CropOverlay';
import { useTransformHandler, type TransformMode } from '../hooks/useTransformHandler';
import type { GuideLine } from '../utils/snapping-utils';

export interface CanvasRendererProps {
  stageScale: number;
  onGuidesChange?: (guides: GuideLine[]) => void;
}

export function CanvasRenderer({ stageScale, onGuidesChange }: CanvasRendererProps) {
  const { currentProject } = useProjectStore();
  const { playhead } = usePlaybackStore();
  const { selectedClipIds, toggleClipSelection, activeTool } = useEditorUIStore();
  const { startTransform, isDragging, activeGuides } = useTransformHandler(stageScale);

  React.useEffect(() => {
    if (onGuidesChange) onGuidesChange(activeGuides);
  }, [activeGuides, onGuidesChange]);

  if (!currentProject) return null;

  // Active clips computation
  const activeClipsWithTrack: { clip: TimelineClip; track: Track }[] = [];

  // Sort tracks by order ascending (video/overlay/text bottom to top)
  const sortedTracks = [...currentProject.tracks].sort((a, b) => a.order - b.order);

  for (const track of sortedTracks) {
    if (track.hidden) continue;
    for (const clip of track.clips) {
      if (playhead >= clip.timelineStart && playhead < clip.timelineStart + clip.timelineDuration) {
        activeClipsWithTrack.push({ clip, track });
      }
    }
  }

  const handleClipPointerDown = (clip: TimelineClip, track: Track, e: React.PointerEvent) => {
    if (track.locked) return; // Locked tracks cannot be selected from stage
    e.stopPropagation();
    toggleClipSelection(clip.id, e.shiftKey);
    startTransform(clip, 'translate', e);
  };

  const renderClipContent = (clip: TimelineClip) => {
    switch (clip.type) {
      case 'video':
        return <VideoLayer clip={clip} />;
      case 'image':
        return <ImageLayer clip={clip} />;
      case 'text':
        return <TextLayer clip={clip} />;
      case 'overlay':
        return <ElementLayer clip={clip} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {activeClipsWithTrack.map(({ clip, track }) => {
        const isSelected = selectedClipIds.includes(clip.id);
        const { transform } = clip;

        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${transform.x * stageScale}px`,
          top: `${transform.y * stageScale}px`,
          width: `${transform.width * stageScale}px`,
          height: `${transform.height * stageScale}px`,
          transform: `rotate(${transform.rotation}deg)`,
          transformOrigin: 'center center',
          cursor: track.locked ? 'default' : 'move',
        };

        return (
          <div
            key={clip.id}
            id={`layer-${clip.id}`}
            style={style}
            onPointerDown={(e) => handleClipPointerDown(clip, track, e)}
            className="group absolute"
          >
            {renderClipContent(clip)}

            {/* Selection & Transform Overlays */}
            {isSelected && !track.locked && (
              activeTool === 'crop' ? (
                <CropOverlay clip={clip} stageScale={stageScale} />
              ) : (
                <SelectionOverlay
                  clip={clip}
                  stageScale={stageScale}
                  onStartTransform={(c, mode, e) => {
                    if (mode === 'translate') handleClipPointerDown(clip, track, e);
                    else startTransform(c, mode as TransformMode, e);
                  }}
                  isDragging={isDragging}
                />
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
