'use client';

import React, { useState } from 'react';
import type { Track } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { IconButton } from '@/shared/components/ui/IconButton';
import { DropdownMenu, DropdownMenuItem } from '@/shared/components/ui/DropdownMenu';
import { Lock, Unlock, Eye, EyeOff, Volume2, VolumeX, GripVertical, MoreVertical, Trash2, Edit2, Video, Type, Music, Shapes } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface TrackHeaderProps {
  track: Track;
}

export function TrackHeader({ track }: TrackHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(track.name);
  const { currentProject } = useProjectStore();
  const { activeTrackId, setActiveTrackId } = useEditorUIStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = activeTrackId === track.id;

  const handleToggleLock = () => {
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        const t = state.currentProject.tracks.find((x) => x.id === track.id);
        if (t) t.locked = !t.locked;
      }
    });
  };

  const handleToggleHide = () => {
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        const t = state.currentProject.tracks.find((x) => x.id === track.id);
        if (t) t.hidden = !t.hidden;
      }
    });
  };

  const handleToggleMute = () => {
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        const t = state.currentProject.tracks.find((x) => x.id === track.id);
        if (t) t.muted = !t.muted;
      }
    });
  };

  const handleRenameSubmit = () => {
    setIsRenaming(false);
    if (nameInput.trim() && nameInput !== track.name) {
      useProjectStore.setState((state) => {
        if (state.currentProject) {
          const t = state.currentProject.tracks.find((x) => x.id === track.id);
          if (t) t.name = nameInput.trim();
        }
      });
    }
  };

  const handleDeleteTrack = () => {
    if (!currentProject) return;
    if (track.clips.length > 0 && !confirm(`Track "${track.name}" contains ${track.clips.length} clips. Delete track and all clips?`)) {
      return;
    }
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        state.currentProject.tracks = state.currentProject.tracks.filter((t) => t.id !== track.id);
      }
    });
  };

  const renderTypeIcon = () => {
    switch (track.type) {
      case 'video':
        return <Video className="h-3.5 w-3.5 text-[#FF5A36]" />;
      case 'overlay':
        return <Shapes className="h-3.5 w-3.5 text-[#3478D4]" />;
      case 'text':
        return <Type className="h-3.5 w-3.5 text-[#F2C94C]" />;
      case 'audio':
        return <Music className="h-3.5 w-3.5 text-[#248A5A]" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setActiveTrackId(track.id)}
      className={cn(
        'flex h-12 w-[180px] shrink-0 items-center justify-between border-b border-[#2B2F38] bg-[#14161B] px-2 text-[#F4F5F7] select-none',
        isSelected && 'bg-[#1D2027] border-l-2 border-l-[#FF5A36]'
      )}
    >
      {/* Left: Drag Handle & Track Name */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <button
          type="button"
          aria-label="Reorder track"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#9298A3] hover:text-[#F4F5F7] p-0.5"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        {renderTypeIcon()}

        {isRenaming ? (
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleRenameSubmit}
            autoFocus
            className="h-5 w-20 rounded bg-[#101216] border border-[#FF5A36] px-1 text-[11px] text-[#F4F5F7]"
          />
        ) : (
          <span className="text-xs font-semibold text-[#F4F5F7] truncate" title={track.name}>
            {track.name}
          </span>
        )}
      </div>

      {/* Right: Lock, Hide, Mute, Menu */}
      <div className="flex items-center gap-0.5">
        <IconButton
          label={track.locked ? 'Unlock track' : 'Lock track'}
          size="sm"
          variant="ghost"
          onClick={handleToggleLock}
        >
          {track.locked ? <Lock className="h-3 w-3 text-[#F2C94C]" /> : <Unlock className="h-3 w-3 text-[#9298A3]" />}
        </IconButton>

        {track.type !== 'audio' && (
          <IconButton
            label={track.hidden ? 'Show track' : 'Hide track'}
            size="sm"
            variant="ghost"
            onClick={handleToggleHide}
          >
            {track.hidden ? <EyeOff className="h-3 w-3 text-[#E45858]" /> : <Eye className="h-3 w-3 text-[#9298A3]" />}
          </IconButton>
        )}

        {(track.type === 'audio' || track.type === 'video') && (
          <IconButton
            label={track.muted ? 'Unmute track' : 'Mute track'}
            size="sm"
            variant="ghost"
            onClick={handleToggleMute}
          >
            {track.muted ? <VolumeX className="h-3 w-3 text-[#E45858]" /> : <Volume2 className="h-3 w-3 text-[#9298A3]" />}
          </IconButton>
        )}

        <DropdownMenu trigger={<IconButton label="Track options" size="sm" variant="ghost"><MoreVertical className="h-3 w-3" /></IconButton>} align="right">
          <DropdownMenuItem onClick={() => setIsRenaming(true)}>
            <Edit2 className="h-3.5 w-3.5" /> Rename Track
          </DropdownMenuItem>
          <DropdownMenuItem destructive onClick={handleDeleteTrack}>
            <Trash2 className="h-3.5 w-3.5" /> Delete Track
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </div>
  );
}
