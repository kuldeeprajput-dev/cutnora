import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { TimelineClip } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useToastStore } from '@/shared/components/ui/Toast/useToastStore';

interface ClipboardState {
  clipboardClips: TimelineClip[];
  copySelectedClips: (clipIds?: string[]) => void;
  cutSelectedClips: (clipIds?: string[]) => void;
  pasteClips: (targetTrackId?: string, pasteTime?: number) => void;
}

export const useClipboardStore = create<ClipboardState>()(
  immer((set, get) => ({
    clipboardClips: [],

    copySelectedClips: (clipIds) => {
      const project = useProjectStore.getState().currentProject;
      const selectedIds = clipIds && clipIds.length > 0
        ? clipIds
        : useEditorUIStore.getState().selectedClipIds;

      if (!project || selectedIds.length === 0) {
        useToastStore.getState().showToast('Select a clip first to copy', 'warning');
        return;
      }

      const selected = project.tracks
        .flatMap((t) => t.clips)
        .filter((c) => selectedIds.includes(c.id));

      if (selected.length > 0) {
        set((state) => {
          state.clipboardClips = JSON.parse(JSON.stringify(selected));
        });
        useToastStore.getState().showToast(`Copied ${selected.length} clip(s) to clipboard`, 'info');
      } else {
        useToastStore.getState().showToast('Select a clip first to copy', 'warning');
      }
    },

    cutSelectedClips: (clipIds) => {
      const project = useProjectStore.getState().currentProject;
      const selectedIds = clipIds && clipIds.length > 0
        ? clipIds
        : useEditorUIStore.getState().selectedClipIds;

      if (!project || selectedIds.length === 0) {
        useToastStore.getState().showToast('Select a clip first to cut', 'warning');
        return;
      }

      get().copySelectedClips(selectedIds);
      useProjectStore.getState().deleteClips(selectedIds);
      useEditorUIStore.getState().clearSelection();
      useToastStore.getState().showToast(`Cut ${selectedIds.length} clip(s) to clipboard`, 'info');
    },

    pasteClips: (targetTrackId, pasteTime) => {
      const buffer = get().clipboardClips;
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      if (buffer.length === 0) {
        useToastStore.getState().showToast('Clipboard is empty. Copy or cut a clip first.', 'warning');
        return;
      }

      const playhead = usePlaybackStore.getState().playhead;
      const targetTime = pasteTime !== undefined ? pasteTime : playhead;

      // Find earliest timelineStart among buffer clips to preserve relative spacing
      const minStart = Math.min(...buffer.map((c) => c.timelineStart));
      const pastedIds: string[] = [];

      buffer.forEach((clip) => {
        const offset = clip.timelineStart - minStart;
        const newClipId = nanoid();

        // Target track: explicit targetTrackId or track matching clip type
        let track = targetTrackId
          ? project.tracks.find((t) => t.id === targetTrackId)
          : project.tracks.find((t) => t.type === clip.type);

        if (!track) {
          useProjectStore.getState().addTrack(clip.type === 'overlay' ? 'text' : (clip.type as 'video' | 'audio' | 'text'));
          const tracks = useProjectStore.getState().currentProject?.tracks || [];
          track = tracks.find((t) => t.type === clip.type) || tracks[0];
        }

        if (!track) return;

        const pastedClip: TimelineClip = {
          ...JSON.parse(JSON.stringify(clip)),
          id: newClipId,
          trackId: track.id,
          timelineStart: targetTime + offset,
          name: `${clip.name} (Copy)`,
        };

        useProjectStore.getState().addClip(track.id, pastedClip);
        pastedIds.push(newClipId);
      });

      if (pastedIds.length > 0) {
        useEditorUIStore.getState().setSelectedClipIds(pastedIds);
        useToastStore.getState().showToast(`Pasted ${pastedIds.length} clip(s)`, 'success');
      }
    },
  }))
);
