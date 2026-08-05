'use client';

import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { db } from '@/modules/core/db/database';
import { objectUrlManager } from '@/modules/core/db/object-url-manager';
import type { MediaAsset } from '@/modules/projects/types';
import { useProjectStore } from '@/modules/projects';
import type { TimelineClip, Track } from '@/modules/editor/types';
import { DropdownMenu, DropdownMenuItem } from '@/shared/components/ui/DropdownMenu';
import { IconButton } from '@/shared/components/ui/IconButton';
import { FileVideo, Image as ImageIcon, Music, MoreVertical, Plus, Trash2, Edit2 } from 'lucide-react';

export interface AssetCardProps {
  asset: MediaAsset;
  viewMode?: 'grid' | 'list';
}

export function AssetCard({ asset, viewMode = 'grid' }: AssetCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(asset.name);
  const { currentProject, addClip, addTrack } = useProjectStore();

  useEffect(() => {
    let isMounted = true;

    async function loadThumb() {
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

    loadThumb();

    return () => {
      isMounted = false;
    };
  }, [asset.thumbnailBlobId]);

  const handleAddToTimeline = () => {
    if (!currentProject) return;

    // Find or create appropriate track type
    const requiredTrackType: Track['type'] = asset.type === 'audio' ? 'audio' : 'video';
    let targetTrack = currentProject.tracks.find((t) => t.type === requiredTrackType);

    if (!targetTrack) {
      addTrack(requiredTrackType, `${requiredTrackType.charAt(0).toUpperCase() + requiredTrackType.slice(1)} Track`);
      const updatedTracks = useProjectStore.getState().currentProject?.tracks || [];
      targetTrack = updatedTracks.find((t) => t.type === requiredTrackType);
    }

    if (!targetTrack) return;

    // Determine initial timeline start time (after last clip on track)
    let start = 0;
    if (targetTrack.clips.length > 0) {
      const lastClip = targetTrack.clips[targetTrack.clips.length - 1];
      start = lastClip.timelineStart + lastClip.timelineDuration;
    }

    const duration = asset.type === 'image' ? 5 : asset.duration;

    const newClip: TimelineClip = {
      id: nanoid(),
      trackId: targetTrack.id,
      assetId: asset.id,
      type: asset.type === 'image' ? 'image' : (asset.type as TimelineClip['type']),
      timelineStart: Math.max(0, start),
      timelineDuration: Math.max(0.1, duration),
      sourceStart: 0,
      sourceDuration: Math.max(0.1, duration),
      name: asset.name,
      transform: {
        x: 0,
        y: 0,
        width: asset.width || 1920,
        height: asset.height || 1080,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        fitMode: 'contain',
      },
      adjustments: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blur: 0,
        grayscale: 0,
        sepia: 0,
      },
      audio: {
        volume: 1,
        muted: false,
        fadeIn: 0,
        fadeOut: 0,
      },
      speed: 1,
    };

    addClip(targetTrack.id, newClip);
  };

  const handleDeleteAsset = async () => {
    const isUsedInTimeline = currentProject?.tracks.some((t) =>
      t.clips.some((c) => c.assetId === asset.id)
    );

    const promptMessage = isUsedInTimeline
      ? `Warning: Asset "${asset.name}" is currently used by clips in your timeline. Deleting it will also remove those clips from the timeline. Are you sure you want to delete it?`
      : `Delete asset "${asset.name}"?`;

    if (confirm(promptMessage)) {
      await db.assets.delete(asset.id);
      if (asset.blobId) await db.blobs.delete(asset.blobId);
      if (asset.thumbnailBlobId) await db.thumbnails.delete(asset.thumbnailBlobId);
      useProjectStore.getState().removeAsset(asset.id);
    }
  };

  const handleRenameSubmit = () => {
    setIsRenaming(false);
    if (nameInput.trim() && nameInput !== asset.name) {
      db.assets.update(asset.id, { name: nameInput.trim() });
      useProjectStore.setState((state) => {
        if (state.currentProject) {
          state.currentProject.tracks.forEach((track) => {
            track.clips.forEach((clip) => {
              if (clip.assetId === asset.id) clip.name = nameInput.trim();
            });
          });
        }
      });
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderIcon = () => {
    switch (asset.type) {
      case 'video':
        return <FileVideo className="h-6 w-6 text-brand" />;
      case 'image':
        return <ImageIcon className="h-6 w-6 text-selection" />;
      case 'audio':
        return <Music className="h-6 w-6 text-mkt-info" />;
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onDoubleClick={handleAddToTimeline}
        className="group flex items-center justify-between rounded-lg border border-studio-border bg-studio-panel p-2 hover:border-brand transition-colors select-none cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-14 shrink-0 rounded bg-studio-bg border border-studio-border overflow-hidden flex items-center justify-center">
            {thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbUrl} alt={asset.name} className="h-full w-full object-cover" />
            ) : (
              renderIcon()
            )}
          </div>
          <div className="min-w-0">
            {isRenaming ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleRenameSubmit}
                autoFocus
                className="h-6 rounded bg-studio-bg border border-brand px-1 text-xs text-studio-fg"
              />
            ) : (
              <p className="text-xs font-semibold text-studio-fg truncate">{asset.name}</p>
            )}
            <p className="text-[10px] text-studio-muted font-mono mt-0.5">
              {asset.type !== 'image' && `${formatDuration(asset.duration)} • `}
              {formatSize(asset.size)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton label="Add to timeline" size="sm" variant="ghost" onClick={handleAddToTimeline}>
            <Plus className="h-3.5 w-3.5" />
          </IconButton>
          <DropdownMenu trigger={<IconButton label="More options" size="sm" variant="ghost"><MoreVertical className="h-3.5 w-3.5" /></IconButton>} align="right">
            <DropdownMenuItem onClick={handleAddToTimeline}>
              <Plus className="h-3.5 w-3.5" /> Add to timeline
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Edit2 className="h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem destructive onClick={handleDeleteAsset}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleAddToTimeline}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-studio-border bg-studio-panel p-1.5 transition-all hover:border-brand select-none cursor-pointer"
    >
      {/* Thumbnail View Stage */}
      <div className="relative aspect-video w-full rounded-lg bg-studio-bg border border-studio-border overflow-hidden flex items-center justify-center">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={asset.name} className="h-full w-full object-cover" />
        ) : (
          renderIcon()
        )}

        {/* Duration / Tag Overlay */}
        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 font-mono text-[9px] text-studio-fg">
          {asset.type === 'image' ? 'IMAGE' : formatDuration(asset.duration)}
        </span>

        {/* Hover Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <IconButton label="Add to timeline" size="sm" variant="selection" onClick={handleAddToTimeline}>
            <Plus className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {/* Asset Info Footer */}
      <div className="mt-1.5 flex items-start justify-between gap-1 px-1">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleRenameSubmit}
              autoFocus
              className="h-5 w-full rounded bg-studio-bg border border-brand px-1 text-[11px] text-studio-fg"
            />
          ) : (
            <p className="text-[11px] font-semibold text-studio-fg truncate">{asset.name}</p>
          )}
          <p className="text-[9px] font-mono text-studio-muted">
            {asset.width && asset.height ? `${asset.width}×${asset.height} • ` : ''}
            {formatSize(asset.size)}
          </p>
        </div>

        <DropdownMenu
          trigger={
            <button type="button" aria-label="Asset options" className="text-studio-muted hover:text-studio-fg p-0.5 rounded">
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          }
          align="right"
        >
          <DropdownMenuItem onClick={handleAddToTimeline}>
            <Plus className="h-3.5 w-3.5" /> Add to timeline
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsRenaming(true)}>
            <Edit2 className="h-3.5 w-3.5" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem destructive onClick={handleDeleteAsset}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </div>
  );
}
