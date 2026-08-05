'use client';

import React, { useState, useEffect } from 'react';
import type { TimelineClip, Track } from '@/modules/editor/types';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { useProjectStore } from '@/modules/projects';
import { db } from '@/modules/core/db/database';
import { objectUrlManager } from '@/modules/core/db/object-url-manager';
import { DropdownMenu, DropdownMenuItem } from '@/shared/components/ui/DropdownMenu';
import { FileVideo, Image as ImageIcon, Music, Type, Shapes, AlertCircle, Scissors, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface TimelineClipItemProps {
  clip: TimelineClip;
  track: Track;
  zoom: number; // Px per second
  onStartDrag: (clip: TimelineClip, mode: 'move' | 'trim-start' | 'trim-end', e: React.PointerEvent) => void;
}

export function TimelineClipItem({ clip, track, zoom, onStartDrag }: TimelineClipItemProps) {
  const { selectedClipIds, toggleClipSelection } = useEditorUIStore();
  const { splitClip, duplicateClips, deleteClips } = useProjectStore();
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isMissingAsset, setIsMissingAsset] = useState(false);

  const isSelected = selectedClipIds.includes(clip.id);
  const widthPx = Math.max(12, clip.timelineDuration * zoom);
  const leftPx = clip.timelineStart * zoom;

  useEffect(() => {
    let isMounted = true;

    async function checkAsset() {
      if (clip.assetId) {
        const asset = await db.assets.get(clip.assetId);
        if (!asset) {
          if (isMounted) setIsMissingAsset(true);
          return;
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
        return 'bg-[#FF5A36]/20 border-[#FF5A36]/50 text-[#FF5A36]';
      case 'image':
        return 'bg-[#F2C94C]/20 border-[#F2C94C]/50 text-[#F2C94C]';
      case 'audio':
        return 'bg-[#248A5A]/20 border-[#248A5A]/50 text-[#248A5A]';
      case 'text':
        return 'bg-[#3478D4]/20 border-[#3478D4]/50 text-[#3478D4]';
      case 'overlay':
        return 'bg-[#9B51E0]/20 border-[#9B51E0]/50 text-[#9B51E0]';
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

  return (
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
      className={cn(
        'group relative flex items-center justify-between rounded-lg border px-2 select-none overflow-hidden cursor-pointer transition-colors',
        getBgColor(),
        isSelected && 'ring-2 ring-[#F2C94C] border-[#F2C94C]',
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
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-[#F2C94C] z-30 transition-colors opacity-0 group-hover:opacity-100"
          title="Trim clip start"
        />
      )}

      {/* Clip Background Thumbnail / Waveform Pattern */}
      {thumbUrl && clip.type === 'video' && (
        <div className="absolute inset-0 opacity-20 bg-repeat-x pointer-events-none" style={{ backgroundImage: `url(${thumbUrl})`, backgroundSize: 'contain' }} />
      )}

      {/* Clip Content Label */}
      <div className="flex items-center gap-1.5 min-w-0 z-10">
        {renderIcon()}
        <span className="text-[11px] font-semibold truncate text-[#F4F5F7]">
          {clip.name}
        </span>
        {isMissingAsset && (
          <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#E45858] bg-[#E45858]/20 px-1 rounded" title="Missing asset file">
            <AlertCircle className="h-2.5 w-2.5" /> Missing
          </span>
        )}
      </div>

      {/* Duration Badge */}
      <span className="text-[9px] font-mono text-[#9298A3] shrink-0 ml-1 z-10">
        {clip.timelineDuration.toFixed(1)}s
      </span>

      {/* Right Trim Handle */}
      {!track.locked && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            onStartDrag(clip, 'trim-end', e);
          }}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-[#F2C94C] z-30 transition-colors opacity-0 group-hover:opacity-100"
          title="Trim clip end"
        />
      )}

      {/* Context Menu Trigger */}
      <DropdownMenu trigger={<div className="hidden" />} align="left">
        <DropdownMenuItem onClick={() => splitClip(clip.id, clip.timelineStart + clip.timelineDuration / 2)}>
          <Scissors className="h-3.5 w-3.5" /> Split clip
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => duplicateClips([clip.id])}>
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem destructive onClick={() => deleteClips([clip.id])}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}
