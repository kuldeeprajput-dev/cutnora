'use client';

import React, { useState, useEffect } from 'react';
import type { TimelineClip, Track } from '@/modules/editor/types';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { useProjectStore } from '@/modules/projects';
import { db } from '@/modules/core/db/database';
import { objectUrlManager } from '@/modules/core/db/object-url-manager';
import { ContextMenu, type ContextMenuItemData } from '@/shared/components/ui/ContextMenu';
import { useClipboardStore } from '@/modules/editor/store/useClipboardStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { WaveformCanvas } from '@/modules/editor/features/audio/components/WaveformCanvas';
import { detachAudioFromVideo } from '@/modules/editor/features/audio/utils/detachAudio';
import { FileVideo, Image as ImageIcon, Music, Type, Shapes, AlertCircle, Scissors, Copy, Trash2, Volume2, VolumeX, Unlink, Clipboard, MoveLeft, ArrowUp, ArrowDown, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface TimelineClipItemProps {
  clip: TimelineClip;
  track: Track;
  zoom: number; // Px per second
  onStartDrag: (clip: TimelineClip, mode: 'move' | 'trim-start' | 'trim-end', e: React.PointerEvent) => void;
}

export function TimelineClipItem({ clip, track, zoom, onStartDrag }: TimelineClipItemProps) {
  const { selectedClipIds, toggleClipSelection } = useEditorUIStore();
  const { splitClip, duplicateClips, deleteClips, updateClip } = useProjectStore();
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [waveformPeaks, setWaveformPeaks] = useState<number[] | null>(null);
  const [assetDuration, setAssetDuration] = useState<number>(10);
  const [isMissingAsset, setIsMissingAsset] = useState(false);

  const isSelected = selectedClipIds.includes(clip.id);
  const widthPx = Math.max(12, clip.timelineDuration * zoom);
  const leftPx = 16 + clip.timelineStart * zoom;

  useEffect(() => {
    let isMounted = true;

    async function checkAsset() {
      if (clip.assetId) {
        const asset = await db.assets.get(clip.assetId);
        if (!asset) {
          if (isMounted) setIsMissingAsset(true);
          return;
        }

        if (isMounted) {
          setAssetDuration(asset.duration || 10);
          if (asset.waveformPeaks && asset.waveformPeaks.length > 0) {
            setWaveformPeaks(asset.waveformPeaks);
          }
        }

        if (asset.thumbnailBlobId) {
          const cached = objectUrlManager.getUrl(asset.thumbnailBlobId);
          if (cached) {
            if (isMounted) setThumbUrl(cached);
            return;
          }

          const thumbRecord = await db.thumbnails.get(asset.thumbnailBlobId);
          if (thumbRecord && isMounted) {
            const url = objectUrlManager.createUrl(asset.thumbnailBlobId, thumbRecord.blob);
            setThumbUrl(url);
          }
        }
      }
    }

    checkAsset();

    return () => {
      isMounted = false;
    };
  }, [clip.assetId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (track.locked) return;
    e.stopPropagation();
    toggleClipSelection(clip.id, e.shiftKey);
    onStartDrag(clip, 'move', e);
  };

  const getBgColor = () => {
    switch (clip.type) {
      case 'video':
        return 'bg-brand/20 border-brand/50 text-brand';
      case 'image':
        return 'bg-selection/20 border-selection/50 text-selection';
      case 'audio':
        return 'bg-mkt-success/20 border-mkt-success/50 text-mkt-success';
      case 'text':
        return 'bg-mkt-info/20 border-mkt-info/50 text-mkt-info';
      case 'overlay':
        return 'bg-overlay/20 border-overlay/50 text-overlay';
    }
  };

  const renderIcon = () => {
    switch (clip.type) {
      case 'video':
        return <FileVideo className="h-3 w-3 shrink-0" />;
      case 'image':
        return <ImageIcon className="h-3 w-3 shrink-0" />;
      case 'audio':
        return <Music className="h-3 w-3 shrink-0" />;
      case 'text':
        return <Type className="h-3 w-3 shrink-0" />;
      case 'overlay':
        return <Shapes className="h-3 w-3 shrink-0" />;
    }
  };

  const isAudioMuted = track.muted || clip.audio?.muted;

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const clipMenuItems: ContextMenuItemData[] = [
    {
      id: 'cut',
      label: 'Cut',
      icon: <Scissors className="h-3.5 w-3.5" />,
      shortcut: '⌘X',
      onClick: () => {
        useClipboardStore.getState().cutSelectedClips();
      },
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="h-3.5 w-3.5" />,
      shortcut: '⌘C',
      onClick: () => {
        useClipboardStore.getState().copySelectedClips();
      },
    },
    {
      id: 'paste-after',
      label: 'Paste after',
      icon: <Clipboard className="h-3.5 w-3.5" />,
      shortcut: '⌘V',
      onClick: () => {
        useClipboardStore.getState().pasteClips(track.id, clip.timelineStart + clip.timelineDuration);
      },
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="h-3.5 w-3.5" />,
      shortcut: '⌘D',
      onClick: () => duplicateClips([clip.id]),
    },
    { id: 'div-1', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'split',
      label: 'Split',
      icon: <Scissors className="h-3.5 w-3.5" />,
      shortcut: 'S',
      onClick: () => {
        const playhead = usePlaybackStore.getState().playhead;
        splitClip(clip.id, playhead);
      },
    },
    {
      id: 'move-playhead',
      label: 'Move to playhead',
      icon: <MoveLeft className="h-3.5 w-3.5" />,
      onClick: () => {
        const playhead = usePlaybackStore.getState().playhead;
        updateClip(clip.id, { timelineStart: playhead });
      },
    },
    { id: 'div-2', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'bring-forward',
      label: 'Bring forward',
      icon: <ArrowUp className="h-3.5 w-3.5" />,
      onClick: () => {
        const tracks = useProjectStore.getState().currentProject?.tracks || [];
        const idx = tracks.findIndex((t) => t.id === track.id);
        if (idx > 0) {
          useProjectStore.getState().reorderTracks(idx, idx - 1);
        }
      },
    },
    {
      id: 'bring-backward',
      label: 'Bring backward',
      icon: <ArrowDown className="h-3.5 w-3.5" />,
      onClick: () => {
        const tracks = useProjectStore.getState().currentProject?.tracks || [];
        const idx = tracks.findIndex((t) => t.id === track.id);
        if (idx >= 0 && idx < tracks.length - 1) {
          useProjectStore.getState().reorderTracks(idx, idx + 1);
        }
      },
    },
    {
      id: 'lock',
      label: track.locked ? 'Unlock' : 'Lock',
      icon: <Lock className="h-3.5 w-3.5" />,
      onClick: () => {
        useProjectStore.setState((state) => {
          if (state.currentProject) {
            const t = state.currentProject.tracks.find((x) => x.id === track.id);
            if (t) t.locked = !t.locked;
          }
        });
      },
    },
    {
      id: 'hide-mute',
      label: clip.type === 'audio' || clip.audio ? (clip.audio?.muted ? 'Unmute' : 'Mute') : (track.hidden ? 'Show' : 'Hide'),
      icon: clip.type === 'audio' || clip.audio ? (clip.audio?.muted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />) : (track.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />),
      onClick: () => {
        if (clip.type === 'audio' || clip.audio) {
          updateClip(clip.id, {
            audio: { ...clip.audio, volume: clip.audio?.volume ?? 1, fadeIn: 0, fadeOut: 0, muted: !clip.audio?.muted },
          });
        } else {
          useProjectStore.setState((state) => {
            if (state.currentProject) {
              const t = state.currentProject.tracks.find((x) => x.id === track.id);
              if (t) t.hidden = !t.hidden;
            }
          });
        }
      },
    },
    ...(clip.type === 'video'
      ? [
          {
            id: 'detach-audio',
            label: 'Detach audio',
            icon: <Unlink className="h-3.5 w-3.5 text-brand" />,
            onClick: () => detachAudioFromVideo(clip.id),
          },
        ]
      : []),
    { id: 'div-3', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
      shortcut: 'Del',
      onClick: () => deleteClips([clip.id]),
    },
  ];

  return (
    <>
      <div
        id={`timeline-clip-${clip.id}`}
        style={{
          position: 'absolute',
          left: `${leftPx}px`,
          width: `${widthPx}px`,
          top: '4px',
          height: '40px',
        }}
        onPointerDown={handlePointerDown}
        onContextMenu={handleContextMenu}
        className={cn(
          'group relative flex items-center justify-between rounded-lg border px-2 select-none overflow-hidden cursor-pointer transition-colors',
          getBgColor(),
          isSelected && 'ring-2 ring-selection border-selection',
          track.locked && 'opacity-60 cursor-not-allowed'
        )}
      >
        {/* Left Trim Handle */}
        {!track.locked && (
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartDrag(clip, 'trim-start', e);
            }}
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-selection z-30 transition-colors opacity-0 group-hover:opacity-100"
            title="Trim clip start"
          />
        )}

        {/* Clip Background Video Thumbnail */}
        {thumbUrl && clip.type === 'video' && (
          <div className="absolute inset-0 opacity-20 bg-repeat-x pointer-events-none" style={{ backgroundImage: `url(${thumbUrl})`, backgroundSize: 'contain' }} />
        )}

        {/* Waveform Canvas Layer for Audio & Video clips */}
        {(clip.type === 'audio' || clip.type === 'video') && waveformPeaks && (
          <div className="absolute inset-0 z-0 opacity-40 px-1 pt-3 pointer-events-none">
            <WaveformCanvas
              peaks={waveformPeaks}
              sourceStart={clip.sourceStart}
              sourceDuration={clip.sourceDuration}
totalAssetDuration={assetDuration}
              isMuted={isAudioMuted}
            />
          </div>
        )}

        {/* Clip Content Label */}
        <div className="flex items-center gap-1.5 min-w-0 z-10">
          {renderIcon()}
          <span className="text-[11px] font-semibold truncate text-studio-fg">
            {clip.name}
          </span>
          {isAudioMuted && (clip.type === 'audio' || clip.type === 'video') && (
            <span title="Audio muted">
              <VolumeX className="h-3 w-3 text-studio-muted shrink-0" />
            </span>
          )}
          {isMissingAsset && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-destructive bg-destructive/20 px-1 rounded" title="Missing asset file">
              <AlertCircle className="h-2.5 w-2.5" /> Missing
            </span>
          )}
        </div>

        {/* Duration Badge */}
        <span className="text-[9px] font-mono text-studio-muted shrink-0 ml-1 z-10">
          {clip.timelineDuration.toFixed(1)}s
        </span>

        {/* Right Trim Handle */}
        {!track.locked && (
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartDrag(clip, 'trim-end', e);
            }}
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-selection z-30 transition-colors opacity-0 group-hover:opacity-100"
            title="Trim clip end"
          />
        )}
      </div>

      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          items={clipMenuItems}
          onClose={() => setContextMenuPos(null)}
        />
      )}
    </>
  );
}
