'use client';

import { ContextMenu, type ContextMenuItemData } from '@/shared/components/ui/ContextMenu';
import { useClipboardStore } from '@/modules/editor/store/useClipboardStore';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { Scissors, Copy, Clipboard, MoveLeft, Video, Music, CheckSquare } from 'lucide-react';

export interface TimelineContextMenuProps {
  x: number;
  y: number;
  pasteTime?: number;
  onClose: () => void;
}

export function TimelineContextMenu({ x, y, pasteTime, onClose }: TimelineContextMenuProps) {
  const { clipboardClips, cutSelectedClips, copySelectedClips, pasteClips } = useClipboardStore();
  const { addTrack, currentProject, splitClip, duplicateClips, updateClip } = useProjectStore();
  const { selectedClipIds } = useEditorUIStore();

  const hasSelection = selectedClipIds.length > 0;
  const playhead = usePlaybackStore.getState().playhead;

  const items: ContextMenuItemData[] = [
    {
      id: 'cut',
      label: 'Cut',
      icon: <Scissors className="h-3.5 w-3.5" />,
      shortcut: '⌘X',
      disabled: !hasSelection,
      onClick: () => {
        cutSelectedClips();
      },
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="h-3.5 w-3.5" />,
      shortcut: '⌘C',
      disabled: !hasSelection,
      onClick: () => {
        copySelectedClips();
      },
    },
    {
      id: 'paste',
      label: pasteTime !== undefined ? 'Paste here' : 'Paste at playhead',
      icon: <Clipboard className="h-3.5 w-3.5" />,
      shortcut: '⌘V',
      disabled: clipboardClips.length === 0,
      onClick: () => {
        pasteClips(undefined, pasteTime);
      },
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="h-3.5 w-3.5" />,
      shortcut: '⌘D',
      disabled: !hasSelection,
      onClick: () => {
        duplicateClips(selectedClipIds);
      },
    },
    { id: 'div-1', label: '', isDivider: true, onClick: () => {} },
    {
      id: 'split',
      label: 'Split',
      icon: <Scissors className="h-3.5 w-3.5" />,
      shortcut: 'S',
      disabled: !hasSelection,
      onClick: () => {
        selectedClipIds.forEach((id) => splitClip(id, playhead));
      },
    },
    {
      id: 'move-playhead',
      label: 'Move to playhead',
      icon: <MoveLeft className="h-3.5 w-3.5" />,
      disabled: !hasSelection,
      onClick: () => {
        selectedClipIds.forEach((id) => updateClip(id, { timelineStart: playhead }));
      },
    },
    { id: 'div-2', label: '', isDivider: true, onClick: () => {} },
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
    { id: 'div-3', label: '', isDivider: true, onClick: () => {} },
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
