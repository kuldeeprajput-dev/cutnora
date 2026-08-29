"use client";

import React from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Copy,
  Eye,
  EyeOff,
  Layers3,
  Lock,
  Trash2,
  Unlock,
} from "lucide-react";
import type { TimelineClip } from "@/modules/editor/types";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { useProjectStore } from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import {
  InspectorControlLabel,
  InspectorSection,
  inspectorActionClass,
} from "./InspectorControls";

export interface LayerOperationsProps {
  clip: TimelineClip;
}

export function LayerOperations({ clip }: LayerOperationsProps) {
  const currentProject = useProjectStore((state) => state.currentProject);
  const duplicateClips = useProjectStore((state) => state.duplicateClips);
  const deleteClips = useProjectStore((state) => state.deleteClips);
  const reorderTracks = useProjectStore((state) => state.reorderTracks);
  const clearSelection = useEditorUIStore((state) => state.clearSelection);

  const track = currentProject?.tracks.find((item) => item.id === clip.trackId);
  const trackIndex =
    currentProject?.tracks.findIndex((item) => item.id === clip.trackId) ?? 0;
  const totalTracks = currentProject?.tracks.length ?? 1;

  const bringForward = () => {
    if (trackIndex < totalTracks - 1) {
      reorderTracks(trackIndex, trackIndex + 1);
    }
  };

  const sendBackward = () => {
    if (trackIndex > 0) {
      reorderTracks(trackIndex, trackIndex - 1);
    }
  };

  const bringToFront = () => {
    if (trackIndex < totalTracks - 1) {
      reorderTracks(trackIndex, totalTracks - 1);
    }
  };

  const sendToBack = () => {
    if (trackIndex > 0) {
      reorderTracks(trackIndex, 0);
    }
  };

  const duplicate = () => {
    duplicateClips([clip.id]);
  };

  const deleteClip = () => {
    deleteClips([clip.id]);
    clearSelection();
  };

  const toggleLockTrack = () => {
    if (!track) return;
    useProjectStore.setState((state) => {
      if (!state.currentProject) return;
      const currentTrack = state.currentProject.tracks.find(
        (item) => item.id === track.id,
      );
      if (currentTrack) currentTrack.locked = !currentTrack.locked;
    });
  };

  const toggleHideTrack = () => {
    if (!track) return;
    useProjectStore.setState((state) => {
      if (!state.currentProject) return;
      const currentTrack = state.currentProject.tracks.find(
        (item) => item.id === track.id,
      );
      if (currentTrack) currentTrack.hidden = !currentTrack.hidden;
    });
  };

  return (
    <InspectorSection
      icon={Layers3}
      title="Layer operations"
      description="Arrange this layer and manage its timeline track."
      className="mt-3"
    >
      {clip.type !== "audio" && (
        <div>
          <InspectorControlLabel>Stack order</InspectorControlLabel>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={bringForward}
              disabled={trackIndex >= totalTracks - 1}
              className={inspectorActionClass}
            >
              <ArrowUp className="h-3.5 w-3.5 text-brand" /> Bring forward
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={sendBackward}
              disabled={trackIndex <= 0}
              className={inspectorActionClass}
            >
              <ArrowDown className="h-3.5 w-3.5 text-brand" /> Send backward
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={bringToFront}
              disabled={trackIndex >= totalTracks - 1}
              className={inspectorActionClass}
            >
              <ChevronsUp className="h-3.5 w-3.5 text-brand" /> Bring to front
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={sendToBack}
              disabled={trackIndex <= 0}
              className={inspectorActionClass}
            >
              <ChevronsDown className="h-3.5 w-3.5 text-brand" /> Send to back
            </Button>
          </div>
        </div>
      )}

      <div className={clip.type !== "audio" ? "mt-3" : undefined}>
        <InspectorControlLabel>Clip & track</InspectorControlLabel>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={duplicate}
            className={inspectorActionClass}
          >
            <Copy className="h-3.5 w-3.5 text-brand" /> Duplicate
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleLockTrack}
            className={inspectorActionClass}
          >
            {track?.locked ? (
              <Unlock className="h-3.5 w-3.5 text-brand" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-brand" />
            )}
            {track?.locked ? "Unlock track" : "Lock track"}
          </Button>
          {clip.type !== "audio" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleHideTrack}
              className={inspectorActionClass}
            >
              {track?.hidden ? (
                <Eye className="h-3.5 w-3.5 text-brand" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-brand" />
              )}
              {track?.hidden ? "Show track" : "Hide track"}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={deleteClip}
            className={cn(
              inspectorActionClass,
              "border-destructive/25 text-destructive hover:border-destructive/50 hover:bg-destructive/10",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete clip
          </Button>
        </div>
      </div>
    </InspectorSection>
  );
}
