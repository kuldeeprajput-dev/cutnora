"use client";

import React, { useState, useEffect } from "react";
import {
  Clock3,
  Move,
  Scissors,
  TimerReset,
  RotateCcw,
  Film,
  Split,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import type { TimelineClip } from "@/modules/editor/types";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useProjectStore } from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
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
    <div className="flex select-none flex-col gap-3 pb-2 text-studio-fg">
      {/* 1. Playhead Trimming & Quick Cut Actions */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-brand" /> Playhead Trimming
            </h3>
            <p className="mt-0.5 text-[10px] text-studio-muted">
              Trim, cut, or snap this clip using the timeline playhead
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-studio-muted">Playhead:</span>
            <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
              {playhead.toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Live Playhead Context Pill */}
        <div
          className={cn(
            "flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-colors",
            isPlayheadAtClip
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-studio-border bg-studio-panel/50 text-studio-muted",
          )}
        >
          <span className="text-[11px] flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                isPlayheadAtClip
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-studio-muted",
              )}
            />
            {isPlayheadAtClip
              ? playheadInsideClip
                ? "Playhead is inside clip (Ready to cut)"
                : "Playhead is at clip boundary"
              : playhead < clipStart
                ? "Playhead is before clip"
                : "Playhead is after clip"}
          </span>
          <span className="text-[10px] font-mono opacity-85 shrink-0">
            {formatTime(clip.timelineStart)} → {formatTime(clipEnd)}
          </span>
        </div>

        {/* Move to Playhead Button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={moveToPlayhead}
          className="w-full h-8 justify-center gap-1.5 text-xs font-semibold cursor-pointer border border-studio-border hover:border-brand/40"
          title="Snap clip start to current playhead"
        >
          <Move className="h-3.5 w-3.5 text-brand" /> Move Clip Start to
          Playhead ({playhead.toFixed(2)}s)
        </Button>

        {/* Trimming & Splitting Action Grid */}
        <div className="grid grid-cols-3 gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={trimStartToPlayhead}
            disabled={!isPlayheadAtClip || playhead <= clipStart + 0.05}
            className={cn(
              "h-8 justify-center gap-1 text-[11px] font-semibold cursor-pointer",
              isPlayheadAtClip &&
                playhead > clipStart + 0.05 &&
                "border-brand/40 bg-brand/10 text-brand",
            )}
            title="Trim off the left side up to playhead"
          >
            <Scissors className="h-3 w-3" /> Trim Left
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleSplitAtPlayhead}
            disabled={!playheadInsideClip}
            className={cn(
              "h-8 justify-center gap-1 text-[11px] font-semibold cursor-pointer",
              playheadInsideClip &&
                "border-brand/40 bg-brand/10 text-brand font-bold",
            )}
            title="Split clip into two separate clips at the playhead"
          >
            <Split className="h-3 w-3" /> Split Clip
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={trimEndToPlayhead}
            disabled={!isPlayheadAtClip || playhead >= clipEnd - 0.05}
            className={cn(
              "h-8 justify-center gap-1 text-[11px] font-semibold cursor-pointer",
              isPlayheadAtClip &&
                playhead < clipEnd - 0.05 &&
                "border-brand/40 bg-brand/10 text-brand",
            )}
            title="Trim off the right side from playhead onwards"
          >
            <Scissors className="h-3 w-3" /> Trim Right
          </Button>
        </div>
      </section>

      {/* 2. Timeline Placement & Duration */}
      <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
            <TimerReset className="h-3.5 w-3.5 text-brand" /> Timeline Timing
          </h3>
          <p className="mt-0.5 text-[10px] text-studio-muted">
            Fine-tune when the clip starts and its playback duration
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-medium text-studio-muted block mb-1">
              Start Position (Timeline)
            </label>
            <div className="relative">
              <Input
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
                className="h-9 pr-7 font-mono text-xs"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted font-mono">
                s
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px] text-studio-muted">
              <span>At {formatTime(clip.timelineStart)}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-studio-muted block mb-1">
              Clip Duration (Length)
            </label>
            <div className="relative">
              <Input
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
                className="h-9 pr-7 font-mono text-xs"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted font-mono">
                s
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px] text-studio-muted">
              <span>Plays for {formatTime(clip.timelineDuration)}</span>
            </div>
          </div>
        </div>

        {/* Nudge & Adjust Step Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-studio-border/50">
          <div className="space-y-1">
            <span className="text-[9px] font-medium text-studio-muted block">
              Shift Position
            </span>
            <div className="grid grid-cols-3 gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => moveClip(clip.id, clip.trackId, 0)}
                disabled={clip.timelineStart === 0}
                className="h-6 text-[9px] font-mono px-1"
                title="Snap clip to timeline start (0:00)"
              >
                0:00
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => adjustStartBy(-1)}
                disabled={clip.timelineStart <= 0}
                className="h-6 text-[9px] font-mono px-1"
                title="Shift left by 1 second"
              >
                −1s
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => adjustStartBy(1)}
                className="h-6 text-[9px] font-mono px-1"
                title="Shift right by 1 second"
              >
                +1s
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-medium text-studio-muted block">
              Adjust Length
            </span>
            <div className="grid grid-cols-4 gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => adjustDurationBy(-5)}
                disabled={clip.timelineDuration <= 5.1}
                className="h-6 text-[9px] font-mono px-0.5"
                title="Shorten duration by 5s"
              >
                −5s
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => adjustDurationBy(-1)}
                disabled={clip.timelineDuration <= 1.1}
                className="h-6 text-[9px] font-mono px-0.5"
                title="Shorten duration by 1s"
              >
                −1s
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => adjustDurationBy(1)}
                className="h-6 text-[9px] font-mono px-0.5"
                title="Extend duration by 1s"
              >
                +1s
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => adjustDurationBy(5)}
                className="h-6 text-[9px] font-mono px-0.5"
                title="Extend duration by 5s"
              >
                +5s
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Duration Buttons (for images, text, titles) */}
        {(clip.type === "image" ||
          clip.type === "text" ||
          Boolean(clip.elementStyle)) && (
          <div className="pt-2 border-t border-studio-border/50">
            <span className="text-[10px] font-medium text-studio-muted block mb-1.5">
              Quick Preset Durations
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[2, 3, 5, 10].map((sec) => (
                <Button
                  key={sec}
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    trimClip(
                      clip.id,
                      clip.timelineStart,
                      sec,
                      clip.sourceStart,
                    );
                  }}
                  className={cn(
                    "h-6 text-[10px] font-mono",
                    Math.abs(clip.timelineDuration - sec) < 0.05 &&
                      "border-brand/40 bg-brand/15 text-brand font-semibold",
                  )}
                >
                  {sec}s
                </Button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Original Source Media Range */}
      {clip.assetId && (
        <section className="rounded-xl border border-studio-border/80 bg-studio-bg/35 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-brand" /> Original Media Range
              </h3>
              <p className="mt-0.5 text-[10px] text-studio-muted">
                Portion of the raw file currently in use
              </p>
            </div>
            {clip.sourceStart > 0 && (
              <button
                type="button"
                onClick={() =>
                  trimClip(
                    clip.id,
                    clip.timelineStart,
                    clip.timelineDuration,
                    0,
                  )
                }
                className="text-[10px] text-studio-muted hover:text-brand transition-colors cursor-pointer"
              >
                Reset In-Point
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-medium text-studio-muted block mb-1">
                Source Start (In-Point)
              </label>
              <div className="relative">
                <Input
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
                  className="h-9 pr-7 font-mono text-xs"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted font-mono">
                  s
                </span>
              </div>
              <span className="text-[9px] text-studio-muted mt-1 block">
                Starts at {formatTime(clip.sourceStart)}
              </span>
            </div>

            <div>
              <label className="text-[10px] font-medium text-studio-muted block mb-1">
                Source End (Out-Point)
              </label>
              <div className="relative">
                <Input
                  type="text"
                  disabled
                  value={`${(clip.sourceStart + clip.sourceDuration).toFixed(2)}s`}
                  className="h-9 pr-7 font-mono text-xs opacity-80"
                />
              </div>
              <span className="text-[9px] text-studio-muted mt-1 block">
                Ends at{" "}
                {formatTime(clip.sourceStart + clip.sourceDuration)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 4. Reset Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={resetTiming}
        className="h-9 w-full justify-center gap-1.5 border border-transparent text-xs text-studio-muted hover:border-studio-border hover:bg-studio-panel-raised hover:text-studio-fg cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset Trims & Original Timing
      </Button>
    </div>
  );
}
