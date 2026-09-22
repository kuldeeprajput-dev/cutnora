"use client";

import React, { useState, useEffect } from "react";
import {
  Scissors,
  RotateCcw,
  Split,
  Move,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { TimelineClip } from "@/modules/editor/types";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useProjectStore } from "@/modules/projects";
import { cn } from "@/shared/utils/cn";

export interface TimeTabProps {
  clip: TimelineClip;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function TimeTab({ clip }: TimeTabProps) {
  const moveClip = useProjectStore((state) => state.moveClip);
  const trimClip = useProjectStore((state) => state.trimClip);
  const resetClipTiming = useProjectStore((state) => state.resetClipTiming);
  const splitClip = useProjectStore((state) => state.splitClip);
  const playhead = usePlaybackStore((state) => state.playhead);

  const [playheadExpanded, setPlayheadExpanded] = useState(false);
  const [startExpanded, setStartExpanded] = useState(false);
  const [durationExpanded, setDurationExpanded] = useState(false);
  const [sourceRangeExpanded, setSourceRangeExpanded] = useState(false);

  const clipStart = clip.timelineStart;
  const clipEnd = clip.timelineStart + clip.timelineDuration;
  const playheadInsideClip =
    playhead > clipStart + 0.05 && playhead < clipEnd - 0.05;
  const isPlayheadAtClip = playhead >= clipStart && playhead <= clipEnd;

  // String drafts for inputs to allow smooth typing
  const [startDraft, setStartDraft] = useState(() => clipStart.toFixed(2));
  const [durationDraft, setDurationDraft] = useState(() =>
    clip.timelineDuration.toFixed(2),
  );
  const [sourceStartDraft, setSourceStartDraft] = useState(() =>
    clip.sourceStart.toFixed(2),
  );

  useEffect(() => {
    setStartDraft(clip.timelineStart.toFixed(2));
    setDurationDraft(clip.timelineDuration.toFixed(2));
    setSourceStartDraft(clip.sourceStart.toFixed(2));
  }, [clip.timelineStart, clip.timelineDuration, clip.sourceStart]);

  const moveToPlayhead = () => {
    moveClip(clip.id, clip.trackId, Math.max(0, playhead));
  };

  const trimStartToPlayhead = () => {
    if (!isPlayheadAtClip) return;
    const newDuration = clipEnd - playhead;
    const delta = playhead - clip.timelineStart;
    const newSourceStart = clip.sourceStart + delta * (clip.speed ?? 1);
    trimClip(clip.id, playhead, Math.max(0.1, newDuration), newSourceStart);
  };

  const trimEndToPlayhead = () => {
    if (!isPlayheadAtClip) return;
    trimClip(
      clip.id,
      clip.timelineStart,
      Math.max(0.1, playhead - clip.timelineStart),
      clip.sourceStart,
    );
  };

  const handleSplitAtPlayhead = () => {
    if (!playheadInsideClip) return;
    splitClip(clip.id, playhead);
  };

  const commitStart = () => {
    const val = Number.parseFloat(startDraft);
    if (!Number.isFinite(val) || val < 0) {
      setStartDraft(clip.timelineStart.toFixed(2));
      return;
    }
    moveClip(clip.id, clip.trackId, Math.max(0, val));
  };

  const commitDuration = () => {
    const val = Number.parseFloat(durationDraft);
    if (!Number.isFinite(val) || val <= 0) {
      setDurationDraft(clip.timelineDuration.toFixed(2));
      return;
    }
    trimClip(
      clip.id,
      clip.timelineStart,
      Math.max(0.1, val),
      clip.sourceStart,
    );
  };

  const commitSourceStart = () => {
    const val = Number.parseFloat(sourceStartDraft);
    if (!Number.isFinite(val) || val < 0) {
      setSourceStartDraft(clip.sourceStart.toFixed(2));
      return;
    }
    trimClip(
      clip.id,
      clip.timelineStart,
      clip.timelineDuration,
      Math.max(0, val),
    );
  };

  const adjustStartBy = (delta: number) => {
    const next = Math.max(0, clip.timelineStart + delta);
    moveClip(clip.id, clip.trackId, next);
  };

  const adjustDurationBy = (delta: number) => {
    const next = Math.max(0.1, clip.timelineDuration + delta);
    trimClip(clip.id, clip.timelineStart, next, clip.sourceStart);
  };

  const resetTiming = () => {
    resetClipTiming(clip.id);
  };

  return (
    <div className="flex flex-col text-xs text-white pb-3 select-none">
      {/* Row 1: Playhead Trims & Cut */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={() => setPlayheadExpanded((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">
            Playhead trims
          </span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isPlayheadAtClip ? "bg-emerald-400" : "bg-white/30"
              )}
            />
            <span className="font-mono text-xs">{playhead.toFixed(2)}s</span>
            {playheadExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            )}
          </div>
        </div>

        {playheadExpanded && (
          <div className="mt-2.5 space-y-2 pt-0.5">
            {/* Action: Snap to Playhead */}
            <button
              type="button"
              onClick={moveToPlayhead}
              className="w-full h-7 flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer rounded-lg border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
              title="Snap clip start to current playhead"
            >
              <Move className="h-3 w-3 text-white/50" />
              <span>Move Start to Playhead</span>
            </button>

            {/* Action: 3-column trim/split buttons */}
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={trimStartToPlayhead}
                disabled={!isPlayheadAtClip || playhead <= clipStart + 0.05}
                className={cn(
                  "h-7 flex items-center justify-center gap-1 rounded-md text-[10px] font-medium transition-all cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed",
                  isPlayheadAtClip && playhead > clipStart + 0.05
                    ? "bg-white/15 text-white font-semibold border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white border-white/[0.06]"
                )}
                title="Trim off left side up to playhead"
              >
                <Scissors className="h-2.5 w-2.5 text-white/60" /> Trim Left
              </button>

              <button
                type="button"
                onClick={handleSplitAtPlayhead}
                disabled={!playheadInsideClip}
                className={cn(
                  "h-7 flex items-center justify-center gap-1 rounded-md text-[10px] font-medium transition-all cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed",
                  playheadInsideClip
                    ? "bg-white/15 text-white font-semibold border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white border-white/[0.06]"
                )}
                title="Split clip into two clips at playhead"
              >
                <Split className="h-2.5 w-2.5 text-white/60" /> Split
              </button>

              <button
                type="button"
                onClick={trimEndToPlayhead}
                disabled={!isPlayheadAtClip || playhead >= clipEnd - 0.05}
                className={cn(
                  "h-7 flex items-center justify-center gap-1 rounded-md text-[10px] font-medium transition-all cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed",
                  isPlayheadAtClip && playhead < clipEnd - 0.05
                    ? "bg-white/15 text-white font-semibold border-white/25 shadow-xs"
                    : "bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white border-white/[0.06]"
                )}
                title="Trim off right side from playhead onwards"
              >
                <Scissors className="h-2.5 w-2.5 text-white/60" /> Trim Right
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Start Position (Timeline) */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={() => setStartExpanded((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">
            Start position
          </span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            {clip.timelineStart > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveClip(clip.id, clip.trackId, 0);
                }}
                className="text-[10px] text-white/40 hover:text-white cursor-pointer mr-0.5"
              >
                Reset
              </button>
            )}
            <span className="font-mono text-xs">
              {formatTime(clip.timelineStart)}
            </span>
            <span className="text-[11px] text-white/40 font-mono">
              ({clip.timelineStart.toFixed(2)}s)
            </span>
            {startExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            )}
          </div>
        </div>

        {startExpanded && (
          <div className="mt-2.5 space-y-2 pt-0.5">
            {/* Input */}
            <div className="flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all px-2.5 gap-2">
              <span className="text-[10px] font-mono font-medium text-white/40 select-none">
                Start
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={startDraft}
                onChange={(e) => setStartDraft(e.target.value)}
                onBlur={commitStart}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitStart();
                    e.currentTarget.blur();
                  }
                }}
                className="w-full bg-transparent text-right text-xs font-mono text-white outline-none border-none p-0 focus:outline-none focus:ring-0"
              />
              <span className="text-[10px] font-mono text-white/30 select-none">
                s
              </span>
            </div>

            {/* Nudge pills */}
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => moveClip(clip.id, clip.trackId, 0)}
                disabled={clip.timelineStart === 0}
                className="py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Snap to 0:00"
              >
                0:00
              </button>
              <button
                type="button"
                onClick={() => adjustStartBy(-1)}
                disabled={clip.timelineStart <= 0}
                className="py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Shift left by 1 second"
              >
                −1s
              </button>
              <button
                type="button"
                onClick={() => adjustStartBy(1)}
                className="py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
                title="Shift right by 1 second"
              >
                +1s
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Clip Duration (Length) */}
      <div className="py-2.5 border-b border-white/[0.06]">
        <div
          onClick={() => setDurationExpanded((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <span className="text-white/50 group-hover:text-white font-medium transition-colors">
            Clip duration
          </span>
          <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
            <span className="font-mono text-xs">
              {formatTime(clip.timelineDuration)}
            </span>
            <span className="text-[11px] text-white/40 font-mono">
              ({clip.timelineDuration.toFixed(2)}s)
            </span>
            {durationExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
            )}
          </div>
        </div>

        {durationExpanded && (
          <div className="mt-2.5 space-y-2 pt-0.5">
            {/* Input */}
            <div className="flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all px-2.5 gap-2">
              <span className="text-[10px] font-mono font-medium text-white/40 select-none">
                Length
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={durationDraft}
                onChange={(e) => setDurationDraft(e.target.value)}
                onBlur={commitDuration}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitDuration();
                    e.currentTarget.blur();
                  }
                }}
                className="w-full bg-transparent text-right text-xs font-mono text-white outline-none border-none p-0 focus:outline-none focus:ring-0"
              />
              <span className="text-[10px] font-mono text-white/30 select-none">
                s
              </span>
            </div>

            {/* Nudge pills */}
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => adjustDurationBy(-5)}
                disabled={clip.timelineDuration <= 5.1}
                className="py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Shorten by 5s"
              >
                −5s
              </button>
              <button
                type="button"
                onClick={() => adjustDurationBy(-1)}
                disabled={clip.timelineDuration <= 1.1}
                className="py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Shorten by 1s"
              >
                −1s
              </button>
              <button
                type="button"
                onClick={() => adjustDurationBy(1)}
                className="py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
                title="Extend by 1s"
              >
                +1s
              </button>
              <button
                type="button"
                onClick={() => adjustDurationBy(5)}
                className="py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
                title="Extend by 5s"
              >
                +5s
              </button>
            </div>

            {/* Quick preset durations (for images, text, titles) */}
            {(clip.type === "image" ||
              clip.type === "text" ||
              Boolean(clip.elementStyle)) && (
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[2, 3, 5, 10].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      trimClip(
                        clip.id,
                        clip.timelineStart,
                        sec,
                        clip.sourceStart,
                      );
                    }}
                    className={cn(
                      "py-1 rounded-md text-center text-[10px] font-mono font-medium transition-all cursor-pointer border",
                      Math.abs(clip.timelineDuration - sec) < 0.05
                        ? "bg-white/15 text-white font-semibold border-white/25 shadow-xs"
                        : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white border-white/[0.06]"
                    )}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 4: Original Media Range (if asset-based clip) */}
      {clip.assetId && (
        <div className="py-2.5 border-b border-white/[0.06]">
          <div
            onClick={() => setSourceRangeExpanded((prev) => !prev)}
            className="flex items-center justify-between cursor-pointer group select-none"
          >
            <span className="text-white/50 group-hover:text-white font-medium transition-colors">
              Source range
            </span>
            <div className="flex items-center gap-1.5 font-medium text-white/90 group-hover:text-white transition-colors text-xs">
              {clip.sourceStart > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    trimClip(
                      clip.id,
                      clip.timelineStart,
                      clip.timelineDuration,
                      0,
                    );
                  }}
                  className="text-[10px] text-white/40 hover:text-white cursor-pointer mr-0.5"
                >
                  Reset
                </button>
              )}
              <span className="font-mono text-xs">
                {clip.sourceStart.toFixed(2)}s – {(clip.sourceStart + clip.sourceDuration).toFixed(2)}s
              </span>
              {sourceRangeExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white" />
              )}
            </div>
          </div>

          {sourceRangeExpanded && (
            <div className="mt-2.5 space-y-2 pt-0.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-white/40 mb-1 font-semibold">
                    In-Point (Start)
                  </span>
                  <div className="flex items-center h-[30px] rounded-md bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all px-2.5 gap-2">
                    <span className="text-[10px] font-mono font-medium text-white/40 select-none">
                      In
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={sourceStartDraft}
                      onChange={(e) => setSourceStartDraft(e.target.value)}
                      onBlur={commitSourceStart}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          commitSourceStart();
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-full bg-transparent text-right text-xs font-mono text-white outline-none border-none p-0 focus:outline-none focus:ring-0"
                    />
                    <span className="text-[10px] font-mono text-white/30 select-none">
                      s
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-white/40 mb-1 font-semibold">
                    Out-Point (End)
                  </span>
                  <div className="flex items-center h-[30px] rounded-md bg-white/[0.015] border border-white/[0.06] px-2.5 gap-2 opacity-75">
                    <span className="text-[10px] font-mono font-medium text-white/30 select-none">
                      Out
                    </span>
                    <span className="w-full text-right font-mono text-xs text-white/60">
                      {(clip.sourceStart + clip.sourceDuration).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-mono text-white/25 select-none">
                      s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 5: Reset Button */}
      <div className="pt-3">
        <button
          type="button"
          onClick={resetTiming}
          className="h-7 w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-all"
        >
          <RotateCcw className="h-3 w-3 text-white/40" /> Reset Trims & Timing
        </button>
      </div>
    </div>
  );
}
