'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import type { TimelineClip } from '@/modules/editor/types';
import { TimelineToolbar } from './TimelineToolbar';
import { TimeRuler } from './TimeRuler';
import { TrackHeader } from './TrackHeader';
import { TrackLane } from './TrackLane';
import { TimelineContextMenu } from './TimelineContextMenu';
import { snapTimelineTime } from '../utils/timeline-snap-utils';
import { preventClipOverlap } from '@/modules/editor/utils/timeline-utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Film } from 'lucide-react';

export function TimelineEditor() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { currentProject, moveClip, trimClip, reorderTracks, splitClip, duplicateClips, deleteClips } = useProjectStore();
  const { zoom, scrollLeft, setScrollLeft, snappingEnabled, selectedClipIds, clearSelection, trackHeaderWidth = 180, setTrackHeaderWidth } = useEditorUIStore();
  const { playhead, isPlaying, togglePlay, stepForward, stepBackward } = usePlaybackStore();

  const handleStartResizeTrackHeader = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = useEditorUIStore.getState().trackHeaderWidth || 180;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(180, Math.min(400, startWidth + deltaX));
      useEditorUIStore.getState().setTrackHeaderWidth?.(newWidth);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const [isAltPressed, setIsAltPressed] = useState(false);
  const [activeSnapLine, setActiveSnapLine] = useState<number | null>(null);
  const [timelineContextMenu, setTimelineContextMenu] = useState<{ x: number; y: number; pasteTime: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const tracks = currentProject?.tracks || [];
  const projectDuration = currentProject?.settings.duration ?? 0;
  const totalWidthPx = Math.max(100, projectDuration * zoom + 16 + 60);
  const playheadLeftPx = 16 + playhead * zoom;

  // Track reorder end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over.id);
      reorderTracks(oldIndex, newIndex);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '');
      if (isInput) return;

      if (e.key === 'Alt') setIsAltPressed(true);

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyS') {
        if (selectedClipIds.length > 0) {
          selectedClipIds.forEach((id) => splitClip(id, playhead));
        }
      } else if (e.code === 'KeyD' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (selectedClipIds.length > 0) duplicateClips(selectedClipIds);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipIds.length > 0) {
          deleteClips(selectedClipIds);
          clearSelection();
        }
      } else if (e.code === 'ArrowLeft') {
        stepBackward();
      } else if (e.code === 'ArrowRight') {
        stepForward();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setIsAltPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedClipIds, playhead, togglePlay, splitClip, duplicateClips, deleteClips, clearSelection, stepBackward, stepForward]);

  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const trackHeadersContainerRef = useRef<HTMLDivElement>(null);

  // Sync scroll positions across TimeRuler (horizontal) and Track Headers (vertical)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScrollLeft = target.scrollLeft;
    const newScrollTop = target.scrollTop;

    setScrollLeft(newScrollLeft);

    if (rulerContainerRef.current) {
      rulerContainerRef.current.scrollLeft = newScrollLeft;
    }
    if (trackHeadersContainerRef.current) {
      trackHeadersContainerRef.current.scrollTop = newScrollTop;
    }
  };

  const handleHeadersWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
    }
  };

  // Auto-scroll playhead into view during playback
  useEffect(() => {
    if (isPlaying && scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      const playheadPx = playhead * zoom;
      if (playheadPx > el.scrollLeft + el.clientWidth - 100 || playheadPx < el.scrollLeft) {
        el.scrollLeft = Math.max(0, playheadPx - 100);
      }
    }
  }, [playhead, isPlaying, zoom]);

  // Pointer drag & trim handler
  const handleStartDragClip = (clip: TimelineClip, mode: 'move' | 'trim-start' | 'trim-end', e: React.PointerEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const initialStart = clip.timelineStart;
    const initialDuration = clip.timelineDuration;
    const initialSourceStart = clip.sourceStart;
    const isSnapping = snappingEnabled && !isAltPressed;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaY = moveEv.clientY - startY;
      const deltaSecs = deltaX / zoom;

      if (mode === 'move') {
        const rawStart = Math.max(0, initialStart + deltaSecs);
        const snapRes = snapTimelineTime(rawStart, tracks, playhead, clip.id, zoom, isSnapping);
        const targetStart = snapRes.snappedTime;
        setActiveSnapLine(snapRes.isSnapped ? snapRes.snappedTime : null);

        // Detect target track by vertical displacement
        const trackHeight = 48;
        const trackIndexOffset = Math.round(deltaY / trackHeight);
        const currentTrackIndex = tracks.findIndex((t) => t.id === clip.trackId);
        const targetTrackIndex = Math.max(0, Math.min(tracks.length - 1, currentTrackIndex + trackIndexOffset));
        const targetTrack = tracks[targetTrackIndex];
        const safeStart = preventClipOverlap(targetTrack.clips, clip.id, targetStart, clip.timelineDuration);

        // Update DOM element directly for 60fps smooth timeline drag
        const el = document.getElementById(`timeline-clip-${clip.id}`);
        if (el) {
          el.style.left = `${16 + safeStart * zoom}px`;
        }

        moveClip(clip.id, targetTrack.id, safeStart);
      } else if (mode === 'trim-start') {
        const rawStart = Math.max(0, initialStart + deltaSecs);
        const snapRes = snapTimelineTime(rawStart, tracks, playhead, clip.id, zoom, isSnapping);

        // Cannot trim left past the start of the source video (sourceStart >= 0)
        const minTimelineStart = (clip.type === 'video' || clip.type === 'audio')
          ? initialStart - initialSourceStart
          : 0;

        let newStart = Math.max(minTimelineStart, snapRes.snappedTime);
        newStart = Math.min(initialStart + initialDuration - 0.1, newStart);

        const newDuration = Math.max(0.1, initialDuration + (initialStart - newStart));
        const newSourceStart = Math.max(0, initialSourceStart + (newStart - initialStart));

        setActiveSnapLine(snapRes.isSnapped ? snapRes.snappedTime : null);
        trimClip(clip.id, newStart, newDuration, newSourceStart);
      } else if (mode === 'trim-end') {
        const rawDuration = Math.max(0.1, initialDuration + deltaSecs);
        const rawEnd = initialStart + rawDuration;
        const snapRes = snapTimelineTime(rawEnd, tracks, playhead, clip.id, zoom, isSnapping);
        const newEnd = snapRes.snappedTime;
        let newDuration = Math.max(0.1, newEnd - initialStart);

        // Clamp duration so clip duration does not exceed remaining source video/audio file length
        if ((clip.type === 'video' || clip.type === 'audio') && clip.sourceDuration) {
          const maxAvailable = Math.max(0.1, (clip.sourceDuration - initialSourceStart) / (clip.speed || 1));
          newDuration = Math.min(maxAvailable, newDuration);
        }

        setActiveSnapLine(snapRes.isSnapped ? snapRes.snappedTime : null);
        trimClip(clip.id, initialStart, newDuration, initialSourceStart);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setActiveSnapLine(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Compute dynamic scrubber line height: only extend down to the lowest track that has intersecting media
  let maxIntersectingTrackIndex = -1;
  tracks.forEach((track, index) => {
    const isIntersecting = track.clips.some((clip) => {
      // clip.timelineDuration might be a bit loose due to floating point, so add a tiny epsilon
      return playhead >= clip.timelineStart && playhead < clip.timelineStart + clip.timelineDuration + 0.01;
    });
    if (isIntersecting) {
      maxIntersectingTrackIndex = index;
    }
  });
  
  const playheadLineHeight = maxIntersectingTrackIndex >= 0 ? (maxIntersectingTrackIndex + 1) * 48 : 0;

  return (
    <div className="flex h-full w-full flex-col bg-timeline-bg text-studio-fg select-none overflow-hidden">
      {/* Top Timeline Toolbar */}
      <TimelineToolbar />

      {/* Fixed Time Ruler Header Row */}
      <div className="flex h-6 w-full shrink-0 border-b border-studio-border bg-studio-topbar z-20">
        {/* Left header corner over track headers */}
        <div
          style={{ width: `${trackHeaderWidth}px` }}
          className="shrink-0 border-r border-studio-border bg-studio-topbar"
        />

        {/* Resizer separator line */}
        <div className="w-px bg-studio-border shrink-0" />

        {/* Time Ruler Horizontal Scroll Area */}
        <div
          ref={rulerContainerRef}
          className="flex-1 overflow-hidden relative"
        >
          <TimeRuler duration={projectDuration} zoom={zoom} scrollLeft={scrollLeft} />
        </div>
      </div>

      {/* Main Multi-track Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {/* Left Column: Track Headers (Vertical scroll synced with main container) */}
        <div
          ref={trackHeadersContainerRef}
          onWheel={handleHeadersWheel}
          style={{ width: `${trackHeaderWidth}px` }}
          className="shrink-0 bg-studio-topbar border-r border-studio-border z-10 flex flex-col overflow-hidden"
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tracks.map((track) => (
                <TrackHeader key={track.id} track={track} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Resizer Handle for Track Headers Width */}
        <div
          onPointerDown={handleStartResizeTrackHeader}
          className="w-px bg-studio-border hover:bg-brand active:bg-brand hover:w-[3px] z-30 cursor-col-resize transition-all shrink-0 h-full"
          title="Drag to resize track headers"
        />

        {/* Right Area: Track Canvas Lanes */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onContextMenu={(e) => {
            // Right-click on empty timeline area
            const target = e.target as HTMLElement | null;
            if (target && (target.id.startsWith('timeline-clip-') || target.closest('[id^="timeline-clip-"]'))) {
              return; // Clip right-click handled inside TimelineClipItem
            }
            e.preventDefault();
            const rect = scrollContainerRef.current?.getBoundingClientRect();
            const clickX = rect ? e.clientX - rect.left + (scrollContainerRef.current?.scrollLeft || 0) - 16 : 0;
            const pasteTime = Math.max(0, clickX / zoom);
            setTimelineContextMenu({ x: e.clientX, y: e.clientY, pasteTime });
          }}
          className="flex-1 overflow-auto relative h-full timeline-bottom-scrollbar"
        >
          {/* Track Lanes */}
          {tracks.length === 0 ? (
            <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center text-xs text-studio-muted py-12">
              <Film className="h-6 w-6 mb-2 opacity-40 text-studio-muted" />
              <span>No tracks created yet</span>
            </div>
          ) : (
            <div className="flex flex-col relative w-full h-fit" style={{ minWidth: `${totalWidthPx}px` }}>
              {tracks.map((track) => (
                <TrackLane
                  key={track.id}
                  track={track}
                  zoom={zoom}
                  totalWidthPx={totalWidthPx}
                  onStartDragClip={handleStartDragClip}
                />
              ))}

              {/* Red Continuous Scrubber Line */}
              <div
                style={{ left: `${playheadLeftPx}px`, height: playheadLineHeight > 0 ? `${playheadLineHeight}px` : 0 }}
                className={`absolute top-0 w-0.5 bg-brand z-30 pointer-events-none shadow-md -translate-x-1/2 ${
                  playheadLineHeight === 0 ? 'hidden' : ''
                }`}
              />

              {/* Active Snapping Guideline */}
              {activeSnapLine !== null && (
                <div
                  style={{ left: `${16 + activeSnapLine * zoom}px` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-selection z-40 pointer-events-none -translate-x-1/2"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {timelineContextMenu && (
        <TimelineContextMenu
          x={timelineContextMenu.x}
          y={timelineContextMenu.y}
          pasteTime={timelineContextMenu.pasteTime}
          onClose={() => setTimelineContextMenu(null)}
        />
      )}
    </div>
  );
}
