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
import { ContextMenu, type ContextMenuItemData } from '@/shared/components/ui/ContextMenu';
import { useClipboardStore } from '@/modules/editor/store/useClipboardStore';
import { Scissors, Copy, Trash2, ArrowUp, ArrowDown, Lock, EyeOff } from 'lucide-react';

export interface CanvasRendererProps {
  stageScale: number;
  isFullscreenActive?: boolean;
}

export function CanvasRenderer({ stageScale, isFullscreenActive = false }: CanvasRendererProps) {
  const { currentProject, duplicateClips, deleteClips, reorderTracks } = useProjectStore();
  const { playhead } = usePlaybackStore();
  const {
    selectedClipIds,
    toggleClipSelection,
    setSelectedClipIds,
    activeTool,
    activeInspectorTab,
    inspectorMode,
    isFullscreen,
  } = useEditorUIStore();
  const { startTransform, isDragging } = useTransformHandler(stageScale);
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; clip: TimelineClip; track: Track } | null>(null);

  if (!currentProject) return null;

  // Active clips computation
  const activeClipsWithTrack: { clip: TimelineClip; track: Track }[] = [];

  // Sort tracks by order ascending (video/overlay/text bottom to top)
  const sortedTracks = [...currentProject.tracks].sort((a, b) => a.order - b.order);

  for (const track of sortedTracks) {
    if (track.hidden) continue;
    for (const clip of track.clips) {
      if (playhead >= clip.timelineStart && playhead < clip.timelineStart + clip.timelineDuration) {
        if (clip.type !== 'audio') {
          activeClipsWithTrack.push({ clip, track });
        }
      }
    }
  }

  const handleClipPointerDown = (clip: TimelineClip, track: Track, e: React.PointerEvent) => {
    if (isFullscreenActive) return;
    if (track.locked) return; // Locked tracks cannot be selected from stage
    e.stopPropagation();
    if (window.matchMedia('(max-width: 1023px)').matches) {
      useEditorUIStore.getState().setActiveInspectorTab('transform');
    }
    toggleClipSelection(clip.id, e.shiftKey);
    startTransform(clip, 'translate', e);
  };

  const handleContextMenu = (clip: TimelineClip, track: Track, e: React.MouseEvent) => {
    if (isFullscreenActive) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedClipIds([clip.id]);
    setContextMenu({ x: e.clientX, y: e.clientY, clip, track });
  };

  const renderClipContent = (clip: TimelineClip, track: Track) => {
    switch (clip.type) {
      case 'video':
        return <VideoLayer clip={clip} trackMuted={track.muted || track.hidden} />;
      case 'image':
        return <ImageLayer clip={clip} />;
      case 'text':
        return <TextLayer clip={clip} stageScale={stageScale} />;
      case 'overlay':
        return <ElementLayer clip={clip} />;
      default:
        return null;
    }
  };

  const stageMenuItems: ContextMenuItemData[] = contextMenu ? [
    {
      id: 'cut',
      label: 'Cut',
      icon: <Scissors className="h-3.5 w-3.5" />,
      shortcut: '⌘X',
      onClick: () => useClipboardStore.getState().cutSelectedClips([contextMenu.clip.id]),
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="h-3.5 w-3.5" />,
      shortcut: '⌘C',
      onClick: () => useClipboardStore.getState().copySelectedClips([contextMenu.clip.id]),
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="h-3.5 w-3.5" />,
      shortcut: '⌘D',
      onClick: () => duplicateClips([contextMenu.clip.id]),
    },
    { id: 'div-1', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'bring-forward',
      label: 'Bring forward',
      icon: <ArrowUp className="h-3.5 w-3.5" />,
      onClick: () => {
        const tracks = currentProject?.tracks || [];
        const idx = tracks.findIndex((t) => t.id === contextMenu.track.id);
        if (idx >= 0 && idx < tracks.length - 1) reorderTracks(idx, idx + 1);
      },
    },
    {
      id: 'bring-backward',
      label: 'Send backward',
      icon: <ArrowDown className="h-3.5 w-3.5" />,
      onClick: () => {
        const tracks = currentProject?.tracks || [];
        const idx = tracks.findIndex((t) => t.id === contextMenu.track.id);
        if (idx > 0) reorderTracks(idx, idx - 1);
      },
    },
    {
      id: 'lock-track',
      label: contextMenu.track.locked ? 'Unlock layer' : 'Lock layer',
      icon: <Lock className="h-3.5 w-3.5" />,
      onClick: () => {
        useProjectStore.setState((state) => {
          if (state.currentProject) {
            const t = state.currentProject.tracks.find((x) => x.id === contextMenu.track.id);
            if (t) t.locked = !t.locked;
          }
        });
      },
    },
    {
      id: 'hide-track',
      label: 'Hide layer',
      icon: <EyeOff className="h-3.5 w-3.5" />,
      onClick: () => {
        useProjectStore.setState((state) => {
          if (state.currentProject) {
            const t = state.currentProject.tracks.find((x) => x.id === contextMenu.track.id);
            if (t) t.hidden = true;
          }
        });
      },
    },
    { id: 'div-2', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
      shortcut: 'Del',
      onClick: () => deleteClips([contextMenu.clip.id]),
    },
  ] : [];

  return (
    <div inert={isFullscreenActive} className={`relative h-full w-full overflow-hidden ${isFullscreenActive ? 'pointer-events-none' : ''}`}>
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

        const isFull = isFullscreenActive || isFullscreen;
        const isTransformTabActive =
          activeInspectorTab === 'transform' ||
          activeInspectorTab === 'text' ||
          activeInspectorTab === 'element';
        const isCanvasToolActive = activeTool === 'canvas' || activeTool === 'select';

        const canShowCrop = isSelected && !track.locked && !isFull && activeTool === 'crop';
        const canShowSelection =
          isSelected &&
          !track.locked &&
          !isFull &&
          inspectorMode === 'clip' &&
          isCanvasToolActive &&
          isTransformTabActive;

        return (
          <div
            key={clip.id}
            id={`layer-${clip.id}`}
            style={style}
            onPointerDown={(e) => handleClipPointerDown(clip, track, e)}
            onContextMenu={(e) => handleContextMenu(clip, track, e)}
            className="group absolute"
          >
            {renderClipContent(clip, track)}

            {/* Selection & Transform Overlays */}
            {canShowCrop && (
              <CropOverlay clip={clip} stageScale={stageScale} />
            )}

            {canShowSelection && (
              <SelectionOverlay
                clip={clip}
                stageScale={stageScale}
                isSticker={clip.type === 'image' && track.type === 'overlay'}
                canvasWidth={currentProject.settings.width}
                canvasHeight={currentProject.settings.height}
                onStartTransform={(c, mode, e) => {
                  if (mode === 'translate') handleClipPointerDown(clip, track, e);
                  else startTransform(c, mode as TransformMode, e);
                }}
                isDragging={isDragging}
              />
            )}
          </div>
        );
      })}

      {contextMenu && !isFullscreenActive && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={stageMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
