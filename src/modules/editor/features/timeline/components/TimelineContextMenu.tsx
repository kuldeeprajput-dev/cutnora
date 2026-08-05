'use client';

import { ContextMenu, type ContextMenuItemData } from '@/shared/components/ui/ContextMenu';
import { useClipboardStore } from '@/modules/editor/store/useClipboardStore';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { Clipboard, Video, Music, CheckSquare } from 'lucide-react';

export interface TimelineContextMenuProps {
  x: number;
  y: number;
  pasteTime?: number;
  onClose: () => void;
}

export function TimelineContextMenu({ x, y, pasteTime, onClose }: TimelineContextMenuProps) {
  const { clipboardClips, pasteClips } = useClipboardStore();
  const { addTrack, currentProject } = useProjectStore();

  const items: ContextMenuItemData[] = [
    {
      id: 'paste',
      label: 'Paste clip at playhead',
      icon: <Clipboard className="h-3.5 w-3.5" />,
      shortcut: '⌘V',
      disabled: clipboardClips.length === 0,
      onClick: () => {
        pasteClips(undefined, pasteTime);
      },
    },
    { id: 'div-1', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'add-video',
      label: 'Add video track',
      icon: <Video className="h-3.5 w-3.5" />,
      onClick: () => {
        addTrack('video');
      },
    },
    {
      id: 'add-audio',
      label: 'Add audio track',
      icon: <Music className="h-3.5 w-3.5" />,
      onClick: () => {
        addTrack('audio');
      },
    },
    { id: 'div-2', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'select-all',
      label: 'Select all clips',
      icon: <CheckSquare className="h-3.5 w-3.5" />,
      shortcut: '⌘A',
      onClick: () => {
        if (!currentProject) return;
        const allIds = currentProject.tracks.flatMap((t) => t.clips.map((c) => c.id));
        useEditorUIStore.getState().setSelectedClipIds(allIds);
      },
    },
  ];

  return <ContextMenu x={x} y={y} items={items} onClose={onClose} />;
}
