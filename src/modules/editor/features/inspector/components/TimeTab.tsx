"use client";

import React from "react";
import { Clock3, Move, Scissors, TimerReset } from "lucide-react";
import type { TimelineClip } from "@/modules/editor/types";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useProjectStore } from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import {
  InspectorControlLabel,
  InspectorResetButton,
  InspectorSection,
  InspectorValue,
  inspectorActionClass,
} from "./InspectorControls";

export interface TimeTabProps {
  clip: TimelineClip;
}

export function TimeTab({ clip }: TimeTabProps) {
  const moveClip = useProjectStore((state) => state.moveClip);
  const trimClip = useProjectStore((state) => state.trimClip);
  const playhead = usePlaybackStore((state) => state.playhead);
  const clipEnd = clip.timelineStart + clip.timelineDuration;
  const playheadInsideClip =
    playhead > clip.timelineStart && playhead < clipEnd;

  const moveToPlayhead = () => {
    moveClip(clip.id, clip.trackId, playhead);
  };

  const trimStartToPlayhead = () => {
    if (!playheadInsideClip) return;
    const newDuration = clipEnd - playhead;
    const delta = playhead - clip.timelineStart;
    const newSourceStart = clip.sourceStart + delta * clip.speed;
    trimClip(clip.id, playhead, newDuration, newSourceStart);
  };

  const trimEndToPlayhead = () => {
    if (!playheadInsideClip) return;
    trimClip(
      clip.id,
      clip.timelineStart,
      playhead - clip.timelineStart,
      clip.sourceStart,
    );
  };

  const resetTiming = () => {
    trimClip(clip.id, clip.timelineStart, clip.sourceDuration, 0);
  };

  return (
    <div className="flex select-none flex-col gap-3 pb-2 text-studio-fg">
      <InspectorSection
        icon={Clock3}
        title="Playhead actions"
        description="Align or trim this clip at the current playhead."
      >
        <div className="mb-2.5 flex items-center justify-between rounded-lg border border-studio-border bg-studio-bg/45 px-2.5 py-2">
          <span className="text-[10px] text-studio-muted">
            Current playhead
          </span>
          <InspectorValue>{playhead.toFixed(2)}s</InspectorValue>
        </div>
        <div className="grid gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={moveToPlayhead}
            className={inspectorActionClass}
          >
            <Move className="h-3.5 w-3.5 text-brand" />
            Move clip start to playhead
          </Button>
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={trimStartToPlayhead}
              disabled={!playheadInsideClip}
              className={inspectorActionClass}
              title={playheadInsideClip ? undefined : "Place playhead inside clip to trim"}
            >
              <Scissors className="h-3.5 w-3.5 text-brand" />
              Trim start
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={trimEndToPlayhead}
              disabled={!playheadInsideClip}
              className={inspectorActionClass}
              title={playheadInsideClip ? undefined : "Place playhead inside clip to trim"}
            >
              <Scissors className="h-3.5 w-3.5 text-brand" />
              Trim end
            </Button>
          </div>
        </div>
      </InspectorSection>

      <InspectorSection
        icon={TimerReset}
        title="Timeline timing"
        description="Set where the clip begins and how long it remains visible."
      >
        <div className="grid grid-cols-2 gap-2.5">
          <div className="min-w-0">
            <InspectorControlLabel htmlFor="timeline-start">
              Start
            </InspectorControlLabel>
            <div className="relative mt-1.5">
              <Input
                id="timeline-start"
                type="number"
                min={0}
                step={0.1}
                value={clip.timelineStart}
                onChange={(e) =>
                  moveClip(
                    clip.id,
                    clip.trackId,
                    Math.max(0, Number.parseFloat(e.target.value) || 0),
                  )
                }
                className="h-9 pr-7 font-mono text-xs"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                s
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <InspectorControlLabel htmlFor="timeline-duration">
              Duration
            </InspectorControlLabel>
            <div className="relative mt-1.5">
              <Input
                id="timeline-duration"
                type="number"
                min={0.1}
                step={0.1}
                value={clip.timelineDuration}
                onChange={(e) => {
                  const duration = Math.max(0.1, Number.parseFloat(e.target.value) || 1);
                  trimClip(clip.id, clip.timelineStart, duration, clip.sourceStart);
                }}
                className="h-9 pr-7 font-mono text-xs"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                s
              </span>
            </div>
          </div>
        </div>
      </InspectorSection>

      {clip.assetId && (
        <InspectorSection
          icon={Scissors}
          title="Source trim"
          description="Choose the used portion of the original media."
        >
          <div className="grid grid-cols-2 gap-2.5">
            <div className="min-w-0">
              <InspectorControlLabel htmlFor="source-start">
                Source start
              </InspectorControlLabel>
              <div className="relative mt-1.5">
                <Input
                  id="source-start"
                  type="number"
                  min={0}
                  step={0.1}
                  value={clip.sourceStart}
                  onChange={(e) => {
                    const sourceStart = Math.max(0, Number.parseFloat(e.target.value) || 0);
                    trimClip(clip.id, clip.timelineStart, clip.timelineDuration, sourceStart);
                  }}
                  className="h-9 pr-7 font-mono text-xs"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                  s
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <InspectorControlLabel htmlFor="source-end">
                Source end
              </InspectorControlLabel>
              <div className="relative mt-1.5">
                <Input
                  id="source-end"
                  type="number"
                  disabled
                  value={(clip.sourceStart + clip.sourceDuration).toFixed(1)}
                  className="h-9 pr-7 font-mono text-xs"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-studio-muted">
                  s
                </span>
              </div>
            </div>
          </div>
        </InspectorSection>
      )}

      <InspectorResetButton onClick={resetTiming}>
        Reset trims & timing
      </InspectorResetButton>
    </div>
  );
}
