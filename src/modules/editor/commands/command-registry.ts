import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore, MIN_TRACK_HEIGHT, MAX_TRACK_HEIGHT } from '@/modules/editor/store/useEditorUIStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useClipboardStore } from '@/modules/editor/store/useClipboardStore';
import { useToastStore } from '@/shared/components/ui/Toast/useToastStore';
import { historyManager } from '@/modules/editor/store/useHistoryStore';
import {
  getNextTimelineZoom,
  MIN_TIMELINE_ZOOM,
} from '@/modules/editor/features/timeline/utils/timeline-zoom-utils';
import {
  findAdjacentCutPoint,
  findAdjacentClipId,
} from '@/modules/editor/utils/timeline-utils';

export type CommandCategory = 'playback' | 'editing' | 'navigation' | 'help';

export interface Command {
  id: string;
  label: string;
  description: string;
  shortcut: string; // e.g. "Space", "Mod+Z", "Delete", "S", "Plus"
  category: CommandCategory;
  isEnabled?: () => boolean;
  execute: () => void;
}

function stepPlayheadSeconds(delta: number) {
  const { playhead, setPlayhead } = usePlaybackStore.getState();
  const duration = useProjectStore.getState().currentProject?.settings.duration || 60;
  setPlayhead(Math.max(0, Math.min(duration, playhead + delta)));
}

function jumpToCutPoint(direction: 'prev' | 'next') {
  const project = useProjectStore.getState().currentProject;
  if (!project) return;
  const targetTime = findAdjacentCutPoint(project.tracks, usePlaybackStore.getState().playhead, direction);
  if (targetTime !== null) usePlaybackStore.getState().setPlayhead(targetTime);
}

function nudgeSelectedClipsByFrames(frames: number) {
  const selectedIds = useEditorUIStore.getState().selectedClipIds;
  if (selectedIds.length === 0) return;
  const fps = useProjectStore.getState().currentProject?.settings.fps || 30;
  useProjectStore.getState().nudgeClips(selectedIds, frames / fps);
}

function cycleClipSelection(direction: 'next' | 'prev') {
  const project = useProjectStore.getState().currentProject;
  if (!project) return;
  const currentSelected = useEditorUIStore.getState().selectedClipIds[0] ?? null;
  const nextId = findAdjacentClipId(project.tracks, currentSelected, direction);
  if (nextId) useEditorUIStore.getState().setSelectedClipIds([nextId]);
}

export const COMMAND_REGISTRY: Command[] = [
  // --- PLAYBACK COMMANDS ---
  {
    id: 'playback.toggle',
    label: 'Play / Pause',
    description: 'Toggle timeline playback',
    shortcut: 'Space',
    category: 'playback',
    execute: () => {
      usePlaybackStore.getState().togglePlay();
    },
  },
  {
    id: 'playback.prev-frame',
    label: 'Previous Frame',
    description: 'Move playhead backward by 1 frame',
    shortcut: 'ArrowLeft',
    category: 'playback',
    execute: () => {
      const { playhead, setPlayhead } = usePlaybackStore.getState();
      const fps = useProjectStore.getState().currentProject?.settings.fps || 30;
      setPlayhead(Math.max(0, playhead - 1 / fps));
    },
  },
  {
    id: 'playback.next-frame',
    label: 'Next Frame',
    description: 'Move playhead forward by 1 frame',
    shortcut: 'ArrowRight',
    category: 'playback',
    execute: () => {
      const { playhead, setPlayhead } = usePlaybackStore.getState();
      const fps = useProjectStore.getState().currentProject?.settings.fps || 30;
      const duration = useProjectStore.getState().currentProject?.settings.duration || 60;
      setPlayhead(Math.min(duration, playhead + 1 / fps));
    },
  },
  {
    id: 'playback.step-back-second',
    label: 'Step 1s Backward',
    description: 'Move playhead backward by 1 second',
    shortcut: 'Shift+ArrowLeft',
    category: 'playback',
    execute: () => stepPlayheadSeconds(-1),
  },
  {
    id: 'playback.step-forward-second',
    label: 'Step 1s Forward',
    description: 'Move playhead forward by 1 second',
    shortcut: 'Shift+ArrowRight',
    category: 'playback',
    execute: () => stepPlayheadSeconds(1),
  },
  {
    id: 'playback.prev-cut',
    label: 'Previous Cut Point',
    description: 'Jump playhead to previous clip boundary',
    shortcut: 'ArrowUp',
    category: 'playback',
    execute: () => jumpToCutPoint('prev'),
  },
  {
    id: 'playback.next-cut',
    label: 'Next Cut Point',
    description: 'Jump playhead to next clip boundary',
    shortcut: 'ArrowDown',
    category: 'playback',
    execute: () => jumpToCutPoint('next'),
  },
  {
    id: 'playback.start',
    label: 'Go to Start',
    description: 'Jump playhead to timeline start',
    shortcut: 'Home',
    category: 'playback',
    execute: () => {
      usePlaybackStore.getState().setPlayhead(0);
    },
  },
  {
    id: 'playback.end',
    label: 'Go to End',
    description: 'Jump playhead to project end',
    shortcut: 'End',
    category: 'playback',
    execute: () => {
      const duration = useProjectStore.getState().currentProject?.settings.duration || 0;
      usePlaybackStore.getState().setPlayhead(duration);
    },
  },

  // --- EDITING COMMANDS ---
  {
    id: 'editing.undo',
    label: 'Undo',
    description: 'Revert last edit action',
    shortcut: 'Mod+Z',
    category: 'editing',
    isEnabled: () => historyManager.canUndo(),
    execute: () => {
      useProjectStore.getState().undo();
      useToastStore.getState().showToast('Undo action', 'info');
    },
  },
  {
    id: 'editing.redo',
    label: 'Redo',
    description: 'Re-apply previously undone action',
    shortcut: 'Mod+Shift+Z',
    category: 'editing',
    isEnabled: () => historyManager.canRedo(),
    execute: () => {
      useProjectStore.getState().redo();
      useToastStore.getState().showToast('Redo action', 'info');
    },
  },
  {
    id: 'editing.delete',
    label: 'Delete Selected',
    description: 'Delete currently selected clip(s)',
    shortcut: 'Delete',
    category: 'editing',
    execute: () => {
      const selectedIds = useEditorUIStore.getState().selectedClipIds;
      if (selectedIds.length > 0) {
        useProjectStore.getState().deleteClips(selectedIds);
        useEditorUIStore.getState().clearSelection();
        useToastStore.getState().showToast(`Deleted ${selectedIds.length} clip(s)`, 'info');
      }
    },
  },
  {
    id: 'editing.duplicate',
    label: 'Duplicate',
    description: 'Duplicate selected clip(s)',
    shortcut: 'Mod+D',
    category: 'editing',
    execute: () => {
      const selectedIds = useEditorUIStore.getState().selectedClipIds;
      if (selectedIds.length > 0) {
        useProjectStore.getState().duplicateClips(selectedIds);
        useToastStore.getState().showToast('Duplicated selected clip(s)', 'info');
      }
    },
  },
  {
    id: 'editing.copy',
    label: 'Copy',
    description: 'Copy selected clip(s) to clipboard',
    shortcut: 'Mod+C',
    category: 'editing',
    execute: () => {
      useClipboardStore.getState().copySelectedClips();
    },
  },
  {
    id: 'editing.cut',
    label: 'Cut',
    description: 'Cut selected clip(s) to clipboard',
    shortcut: 'Mod+X',
    category: 'editing',
    execute: () => {
      useClipboardStore.getState().cutSelectedClips();
    },
  },
  {
    id: 'editing.paste',
    label: 'Paste',
    description: 'Paste clip(s) from clipboard at playhead',
    shortcut: 'Mod+V',
    category: 'editing',
    execute: () => {
      useClipboardStore.getState().pasteClips();
    },
  },
  {
    id: 'editing.split',
    label: 'Split Clip',
    description: 'Split selected clip at playhead position',
    shortcut: 'S',
    category: 'editing',
    execute: () => {
      const selectedIds = useEditorUIStore.getState().selectedClipIds;
      const playhead = usePlaybackStore.getState().playhead;
      if (selectedIds.length > 0) {
        let splitCount = 0;
        selectedIds.forEach((id) => {
          useProjectStore.getState().splitClip(id, playhead);
          splitCount++;
        });
        if (splitCount > 0) {
          useToastStore.getState().showToast('Split clip at playhead', 'info');
        }
      }
    },
  },
  {
    id: 'editing.trim-start',
    label: 'Trim Start to Playhead',
    description: 'Trim left edge of selected clip up to playhead',
    shortcut: 'Q',
    category: 'editing',
    execute: () => {
      const selectedIds = useEditorUIStore.getState().selectedClipIds;
      const playhead = usePlaybackStore.getState().playhead;
      const currentProject = useProjectStore.getState().currentProject;
      if (!currentProject || selectedIds.length === 0) return;
      const clips = currentProject.tracks
        .flatMap((t) => t.clips)
        .filter((c) => selectedIds.includes(c.id));
      let trimCount = 0;
      clips.forEach((clip) => {
        const clipStart = clip.timelineStart;
        const clipEnd = clip.timelineStart + clip.timelineDuration;
        if (playhead > clipStart && playhead < clipEnd) {
          const newDuration = Math.max(0.1, clipEnd - playhead);
          const delta = playhead - clipStart;
          const newSourceStart = clip.sourceStart + delta * (clip.speed ?? 1);
          useProjectStore.getState().trimClip(clip.id, playhead, newDuration, newSourceStart);
          trimCount++;
        }
      });
      if (trimCount > 0) {
        useToastStore.getState().showToast('Trimmed start to playhead', 'info');
      }
    },
  },
  {
    id: 'editing.trim-end',
    label: 'Trim End to Playhead',
    description: 'Trim right edge of selected clip back to playhead',
    shortcut: 'W',
    category: 'editing',
    execute: () => {
      const selectedIds = useEditorUIStore.getState().selectedClipIds;
      const playhead = usePlaybackStore.getState().playhead;
      const currentProject = useProjectStore.getState().currentProject;
      if (!currentProject || selectedIds.length === 0) return;
      const clips = currentProject.tracks
        .flatMap((t) => t.clips)
        .filter((c) => selectedIds.includes(c.id));
      let trimCount = 0;
      clips.forEach((clip) => {
        const clipStart = clip.timelineStart;
        const clipEnd = clip.timelineStart + clip.timelineDuration;
        if (playhead > clipStart && playhead < clipEnd) {
          const newDuration = Math.max(0.1, playhead - clipStart);
          useProjectStore.getState().trimClip(clip.id, clipStart, newDuration, clip.sourceStart);
          trimCount++;
        }
      });
      if (trimCount > 0) {
        useToastStore.getState().showToast('Trimmed end to playhead', 'info');
      }
    },
  },
  {
    id: 'editing.select-all',
    label: 'Select All Clips',
    description: 'Select all clips across all tracks',
    shortcut: 'Mod+A',
    category: 'editing',
    execute: () => {
      const project = useProjectStore.getState().currentProject;
      if (!project) return;
      const allIds = project.tracks.flatMap((t) => t.clips.map((c) => c.id));
      useEditorUIStore.getState().setSelectedClipIds(allIds);
      useToastStore.getState().showToast(`Selected all ${allIds.length} clip(s)`, 'info');
    },
  },
  {
    id: 'editing.clear-selection',
    label: 'Clear Selection / Cancel',
    description: 'Deselect all clips or cancel active interaction',
    shortcut: 'Escape',
    category: 'editing',
    execute: () => {
      useEditorUIStore.getState().clearSelection();
    },
  },
  {
    id: 'editing.nudge-left',
    label: 'Nudge Clip Left (1 Frame)',
    description: 'Nudge selected clip(s) backward by 1 frame',
    shortcut: 'Alt+ArrowLeft',
    category: 'editing',
    isEnabled: () => useEditorUIStore.getState().selectedClipIds.length > 0,
    execute: () => nudgeSelectedClipsByFrames(-1),
  },
  {
    id: 'editing.nudge-right',
    label: 'Nudge Clip Right (1 Frame)',
    description: 'Nudge selected clip(s) forward by 1 frame',
    shortcut: 'Alt+ArrowRight',
    category: 'editing',
    isEnabled: () => useEditorUIStore.getState().selectedClipIds.length > 0,
    execute: () => nudgeSelectedClipsByFrames(1),
  },
  {
    id: 'editing.nudge-left-large',
    label: 'Nudge Clip Left (10 Frames)',
    description: 'Nudge selected clip(s) backward by 10 frames',
    shortcut: 'Shift+Alt+ArrowLeft',
    category: 'editing',
    isEnabled: () => useEditorUIStore.getState().selectedClipIds.length > 0,
    execute: () => nudgeSelectedClipsByFrames(-10),
  },
  {
    id: 'editing.nudge-right-large',
    label: 'Nudge Clip Right (10 Frames)',
    description: 'Nudge selected clip(s) forward by 10 frames',
    shortcut: 'Shift+Alt+ArrowRight',
    category: 'editing',
    isEnabled: () => useEditorUIStore.getState().selectedClipIds.length > 0,
    execute: () => nudgeSelectedClipsByFrames(10),
  },
  {
    id: 'editing.select-prev-clip',
    label: 'Select Previous Clip',
    description: 'Cycle selection to previous clip on timeline',
    shortcut: '[',
    category: 'editing',
    execute: () => cycleClipSelection('prev'),
  },
  {
    id: 'editing.select-next-clip',
    label: 'Select Next Clip',
    description: 'Cycle selection to next clip on timeline',
    shortcut: ']',
    category: 'editing',
    execute: () => cycleClipSelection('next'),
  },

  // --- NAVIGATION COMMANDS ---
  {
    id: 'navigation.zoom-in',
    label: 'Zoom In',
    description: 'Increase timeline zoom scale',
    shortcut: 'Shift+Plus',
    category: 'navigation',
    execute: () => {
      const zoom = useEditorUIStore.getState().zoom;
      useEditorUIStore.getState().setZoom(getNextTimelineZoom(zoom, 'in', MIN_TIMELINE_ZOOM));
    },
  },
  {
    id: 'navigation.zoom-out',
    label: 'Zoom Out',
    description: 'Decrease timeline zoom scale',
    shortcut: 'Shift+Minus',
    category: 'navigation',
    execute: () => {
      const zoom = useEditorUIStore.getState().zoom;
      useEditorUIStore.getState().setZoom(getNextTimelineZoom(zoom, 'out', MIN_TIMELINE_ZOOM));
    },
  },
  {
    id: 'navigation.increase-track-height',
    label: 'Increase Track Height',
    description: 'Make timeline tracks and thumbnails taller',
    shortcut: 'Shift+Alt+Plus',
    category: 'navigation',
    isEnabled: () =>
      Boolean(useProjectStore.getState().currentProject?.tracks.some((track) => track.clips.length > 0)) &&
      useEditorUIStore.getState().trackHeight < MAX_TRACK_HEIGHT,
    execute: () => {
      const { trackHeight, setTrackHeight } = useEditorUIStore.getState();
      setTrackHeight(trackHeight + 8);
    },
  },
  {
    id: 'navigation.decrease-track-height',
    label: 'Decrease Track Height',
    description: 'Make timeline tracks and thumbnails shorter',
    shortcut: 'Shift+Alt+Minus',
    category: 'navigation',
    isEnabled: () =>
      Boolean(useProjectStore.getState().currentProject?.tracks.some((track) => track.clips.length > 0)) &&
      useEditorUIStore.getState().trackHeight > MIN_TRACK_HEIGHT,
    execute: () => {
      const { trackHeight, setTrackHeight } = useEditorUIStore.getState();
      setTrackHeight(trackHeight - 8);
    },
  },
  {
    id: 'navigation.fit-preview',
    label: 'Fit Preview Stage',
    description: 'Reset preview stage zoom to fit screen',
    shortcut: 'Shift+1',
    category: 'navigation',
    execute: () => {
      useEditorUIStore.getState().setPreviewScale(1);
      useToastStore.getState().showToast('Reset preview zoom', 'info');
    },
  },
  {
    id: 'navigation.fit-timeline',
    label: 'Fit Timeline View',
    description: 'Adjust zoom to show entire project timeline',
    shortcut: 'Shift+2',
    category: 'navigation',
    execute: () => {
      const duration = useProjectStore.getState().currentProject?.settings.duration || 60;
      const timelineWidth = 800; // estimated timeline view width
      const idealZoom = timelineWidth / Math.max(10, duration);
      useEditorUIStore.getState().setZoom(idealZoom);
      useToastStore.getState().showToast('Fitted timeline duration', 'info');
    },
  },
  {
    id: 'navigation.toggle-snapping',
    label: 'Toggle Snapping',
    description: 'Enable or disable clip timeline snapping',
    shortcut: 'M',
    category: 'navigation',
    execute: () => {
      const snapping = useEditorUIStore.getState().snappingEnabled;
      useEditorUIStore.getState().setSnappingEnabled(!snapping);
      useToastStore.getState().showToast(`Snapping ${!snapping ? 'enabled' : 'disabled'}`, 'info');
    },
  },

  // --- HELP COMMANDS ---
  {
    id: 'help.shortcuts',
    label: 'Keyboard Shortcuts',
    description: 'Open keyboard shortcuts documentation dialog',
    shortcut: 'Shift+?',
    category: 'help',
    execute: () => {
      // Toggle keyboard shortcuts dialog
    },
  },
];
