'use client';

import { ContextMenu, type ContextMenuItemData } from '@/shared/components/ui/ContextMenu';
import { useProjectStore } from '@/modules/projects';
import type { TrackType } from '@/modules/editor/types';
import { VolumeX, Lock, Trash2, Plus } from 'lucide-react';

export interface TrackHeaderContextMenuProps {
  x: number;
  y: number;
  trackId: string;
  trackType: TrackType;
  isMuted: boolean;
  isLocked: boolean;
  onClose: () => void;
}

export function TrackHeaderContextMenu({
  x,
  y,
  trackId,
  trackType,
  isMuted,
  isLocked,
  onClose,
}: TrackHeaderContextMenuProps) {
  const { addTrack, toggleTrackMute, deleteTrack } = useProjectStore();

  const handleToggleLock = () => {
    useProjectStore.setState((state) => {
      if (state.currentProject) {
        const t = state.currentProject.tracks.find((x) => x.id === trackId);
        if (t) t.locked = !t.locked;
      }
    });
  };

  const items: ContextMenuItemData[] = [
    {
      id: 'add-above',
      label: 'Add track above',
      icon: <Plus className="h-3.5 w-3.5" />,
      onClick: () => {
        addTrack(trackType === 'overlay' ? 'text' : trackType);
      },
    },
    { id: 'div-1', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'mute',
      label: isMuted ? 'Unmute track' : 'Mute track',
      icon: <VolumeX className="h-3.5 w-3.5" />,
      onClick: () => {
        toggleTrackMute(trackId);
      },
    },
    {
      id: 'lock',
      label: isLocked ? 'Unlock track' : 'Lock track',
      icon: <Lock className="h-3.5 w-3.5" />,
      onClick: handleToggleLock,
    },
    { id: 'div-2', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'delete',
      label: 'Delete track',
      icon: <Trash2 className="h-3.5 w-3.5 text-[#E45858]" />,
      onClick: () => {
        deleteTrack(trackId);
      },
    },
  ];

  return <ContextMenu x={x} y={y} items={items} onClose={onClose} />;
}
