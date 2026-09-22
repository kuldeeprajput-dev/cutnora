"use client";

import React, { useState, useEffect } from "react";
import type { TimelineClip, Track } from "@/modules/editor/types";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";
import { useProjectStore } from "@/modules/projects";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import {
  ContextMenu,
  type ContextMenuItemData,
} from "@/shared/components/ui/ContextMenu";
import { useClipboardStore } from "@/modules/editor/store/useClipboardStore";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { WaveformCanvas } from "@/modules/editor/features/audio/components/WaveformCanvas";
import { detachAudioFromVideo } from "@/modules/editor/features/audio/utils/detachAudio";
import {
  FileVideo,
  Image as ImageIcon,
  Music,
  Type,
  Shapes,
  AlertCircle,
  Scissors,
  Copy,
  Trash2,
  Volume2,
  VolumeX,
  Unlink,
  Clipboard,
  MoveLeft,
  ArrowUp,
  ArrowDown,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface TimelineClipItemProps {
  clip: TimelineClip;
  track: Track;
  zoom: number; // Px per second
  isDragging?: boolean;
  onStartDrag: (
    clip: TimelineClip,
    mode: "move" | "trim-start" | "trim-end",
    e: React.PointerEvent,
  ) => void;
}

export function TimelineClipItem({
  clip,
  track,
  zoom,
  isDragging = false,
  onStartDrag,
}: TimelineClipItemProps) {
  const { selectedClipIds, toggleClipSelection } = useEditorUIStore();
  const { splitClip, duplicateClips, deleteClips, updateClip } =
    useProjectStore();
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [waveformPeaks, setWaveformPeaks] = useState<number[] | null>(null);
  const [assetDuration, setAssetDuration] = useState<number>(10);
  const [assetAspectRatio, setAssetAspectRatio] = useState<number>(16 / 9);
  const [isMissingAsset, setIsMissingAsset] = useState(false);

  const isSelected = selectedClipIds.includes(clip.id);
  const widthPx = Math.max(12, clip.timelineDuration * zoom);
  const leftPx = 16 + clip.timelineStart * zoom;
  const durationLabel = `${clip.timelineDuration.toFixed(1)}s`;
  const showDuration = widthPx >= 36;
  const showIcon = widthPx >= 58;
  const showName = widthPx >= 96;
  const showStatusDetails = widthPx >= 150;
  const durationOnly = showDuration && !showIcon;

  const frameHeight = 40;
  const frameWidth = Math.max(30, Math.round(frameHeight * assetAspectRatio));
  const frameCount = Math.max(1, Math.ceil(widthPx / frameWidth));

  useEffect(() => {
    let isMounted = true;

    async function checkAsset() {
      if (clip.assetId) {
        const asset = await db.assets.get(clip.assetId);
        if (!asset) {
          if (isMounted) setIsMissingAsset(true);
          return;
        }

        if (isMounted) {
          setAssetDuration(asset.duration || 10);
          if (asset.width && asset.height && asset.height > 0) {
            setAssetAspectRatio(asset.width / asset.height);
          }
          if (asset.waveformPeaks && asset.waveformPeaks.length > 0) {
            setWaveformPeaks(asset.waveformPeaks);
          } else if (asset.waveformStatus === "deferred") {
            setWaveformPeaks(Array.from({ length: 80 }, () => 0.18));
          }
        }

        if (asset.thumbnailBlobId) {
          const cached = objectUrlManager.getUrl(asset.thumbnailBlobId);
          if (cached) {
            if (isMounted) setThumbUrl(cached);
            return;
          }

          const thumbRecord = await db.thumbnails.get(asset.thumbnailBlobId);
          if (thumbRecord && isMounted) {
            const url = objectUrlManager.createUrl(
              asset.thumbnailBlobId,
              thumbRecord.blob,
            );
            setThumbUrl(url);
          }
        }
      }
    }

    checkAsset();

    return () => {
      isMounted = false;
    };
  }, [clip.assetId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (track.locked) return;
    e.preventDefault();
    e.stopPropagation();
    toggleClipSelection(clip.id, e.shiftKey);
    onStartDrag(clip, "move", e);
  };

  const getBgColor = () => {
    switch (clip.type) {
      case "video":
        return "bg-studio-panel text-white";
      case "image":
        return "bg-studio-panel text-white";
      case "audio":
        return "bg-emerald-950/40 text-emerald-300";
      case "text":
        return "bg-studio-panel-raised text-studio-fg";
      case "overlay":
        return "bg-studio-panel-raised text-studio-fg";
    }
  };

  const renderIcon = () => {
    switch (clip.type) {
      case "video":
        return <FileVideo className="h-3 w-3 shrink-0" />;
      case "image":
        return <ImageIcon className="h-3 w-3 shrink-0" />;
      case "audio":
        return <Music className="h-3 w-3 shrink-0" />;
      case "text":
        return <Type className="h-3 w-3 shrink-0" />;
      case "overlay":
        return <Shapes className="h-3 w-3 shrink-0" />;
    }
  };

  const isAudioMuted = track.muted || clip.audio?.muted;

  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { selectedClipIds, setSelectedClipIds } = useEditorUIStore.getState();
    if (!selectedClipIds.includes(clip.id)) {
      setSelectedClipIds([clip.id]);
    }
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const clipMenuItems: ContextMenuItemData[] = [
    {
      id: "cut",
      label: "Cut",
      icon: <Scissors className="h-3.5 w-3.5" />,
      shortcut: "⌘X",
      onClick: () => {
        useClipboardStore.getState().cutSelectedClips([clip.id]);
      },
    },
    {
      id: "copy",
      label: "Copy",
      icon: <Copy className="h-3.5 w-3.5" />,
      shortcut: "⌘C",
      onClick: () => {
        useClipboardStore.getState().copySelectedClips([clip.id]);
      },
    },
    {
      id: "paste-after",
      label: "Paste after",
      icon: <Clipboard className="h-3.5 w-3.5" />,
      shortcut: "⌘V",
      disabled: useClipboardStore.getState().clipboardClips.length === 0,
      onClick: () => {
        useClipboardStore
          .getState()
          .pasteClips(track.id, clip.timelineStart + clip.timelineDuration);
      },
    },
    {
      id: "duplicate",
      label: "Duplicate",
      icon: <Copy className="h-3.5 w-3.5" />,
      shortcut: "⌘D",
      onClick: () => duplicateClips([clip.id]),
    },
    { id: "div-1", label: "", isDivider: true, onClick: () => {} },
    {
      id: "split",
      label: "Split",
      icon: <Scissors className="h-3.5 w-3.5" />,
      shortcut: "S",
      onClick: () => {
        const playhead = usePlaybackStore.getState().playhead;
        splitClip(clip.id, playhead);
      },
    },
    {
      id: "move-playhead",
      label: "Move to playhead",
      icon: <MoveLeft className="h-3.5 w-3.5" />,
      onClick: () => {
        const playhead = usePlaybackStore.getState().playhead;
        updateClip(clip.id, { timelineStart: playhead });
      },
    },
    { id: "div-2", label: "", isDivider: true, onClick: () => {} },
    ...(clip.type !== "audio"
      ? [
          {
            id: "bring-forward",
            label: "Bring forward",
            icon: <ArrowUp className="h-3.5 w-3.5" />,
            onClick: () => {
              const tracks =
                useProjectStore.getState().currentProject?.tracks || [];
              const idx = tracks.findIndex((t) => t.id === track.id);
              if (idx >= 0 && idx < tracks.length - 1) {
                useProjectStore.getState().reorderTracks(idx, idx + 1);
              }
            },
          },
          {
            id: "bring-backward",
            label: "Send backward",
            icon: <ArrowDown className="h-3.5 w-3.5" />,
            onClick: () => {
              const tracks =
                useProjectStore.getState().currentProject?.tracks || [];
              const idx = tracks.findIndex((t) => t.id === track.id);
              if (idx > 0) {
                useProjectStore.getState().reorderTracks(idx, idx - 1);
              }
            },
          },
        ]
      : []),
    {
      id: "lock",
      label: track.locked ? "Unlock" : "Lock",
      icon: <Lock className="h-3.5 w-3.5" />,
      onClick: () => {
        useProjectStore.setState((state) => {
          if (state.currentProject) {
            const t = state.currentProject.tracks.find(
              (x) => x.id === track.id,
            );
            if (t) t.locked = !t.locked;
          }
        });
      },
    },
    {
      id: "hide-mute",
      label:
        clip.type === "audio" || clip.audio
          ? clip.audio?.muted
            ? "Unmute"
            : "Mute"
          : track.hidden
            ? "Show"
            : "Hide",
      icon:
        clip.type === "audio" || clip.audio ? (
          clip.audio?.muted ? (
            <Volume2 className="h-3.5 w-3.5" />
          ) : (
            <VolumeX className="h-3.5 w-3.5" />
          )
        ) : track.hidden ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        ),
      onClick: () => {
        if (clip.type === "audio" || clip.audio) {
          updateClip(clip.id, {
            audio: {
              ...clip.audio,
              volume: clip.audio?.volume ?? 1,
              fadeIn: 0,
              fadeOut: 0,
              muted: !clip.audio?.muted,
            },
          });
        } else {
          useProjectStore.setState((state) => {
            if (state.currentProject) {
              const t = state.currentProject.tracks.find(
                (x) => x.id === track.id,
              );
              if (t) t.hidden = !t.hidden;
            }
          });
        }
      },
    },
    ...(clip.type === "video"
      ? [
          {
            id: "detach-audio",
            label: "Detach audio",
            icon: <Unlink className="h-3.5 w-3.5 text-brand" />,
            onClick: () => detachAudioFromVideo(clip.id),
          },
        ]
      : []),
    { id: "div-3", label: "", isDivider: true, onClick: () => {} },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
      shortcut: "Del",
      onClick: () => deleteClips([clip.id]),
    },
  ];

  return (
    <>
      <div
        id={`timeline-clip-${clip.id}`}
        style={{
          position: "absolute",
          left: `${leftPx}px`,
          width: `${widthPx}px`,
          top: "4px",
          height: "40px",
        }}
        title={`${clip.name} • ${durationLabel}`}
        onPointerDown={handlePointerDown}
        onContextMenu={handleContextMenu}
        className={cn(
          "group relative flex touch-none items-center justify-between rounded-lg select-none overflow-hidden cursor-grab active:cursor-grabbing transition-[opacity,box-shadow,border-color,background-color]",
          getBgColor(),
          isSelected
            ? "border-2 border-selection ring-1 ring-selection/40 shadow-xs"
            : "border-2 border-white/10 hover:border-white/25",
          isDragging && "opacity-40 ring-2 ring-selection",
          track.locked && "opacity-60 cursor-not-allowed",
        )}
      >
        {/* Left Trim Handle */}
        {!track.locked && (
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartDrag(clip, "trim-start", e);
            }}
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-selection z-30 transition-colors opacity-0 group-hover:opacity-100"
            title="Trim clip start"
          />
        )}

        {/* Clip Background Video Thumbnail Filmstrip */}
        {thumbUrl && clip.type === "video" && (
          <div className="absolute inset-0 z-0 flex overflow-hidden pointer-events-none select-none">
            {Array.from({ length: frameCount }).map((_, i) => (
              <div
                key={i}
                className="relative shrink-0 border-r border-black/50 overflow-hidden"
                style={{ width: `${frameWidth}px`, height: "100%" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrl}
                  alt=""
                  className="h-full w-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}

        {/* Clip Background Image Thumbnail */}
        {thumbUrl && clip.type === "image" && (
          <div className="absolute inset-0 z-0 flex overflow-hidden pointer-events-none select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl}
              alt=""
              className="h-full w-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          </div>
        )}

        {/* Waveform Canvas Layer for Audio clips only */}
        {clip.type === "audio" && waveformPeaks && (
          <div className="absolute inset-0 z-0 opacity-80 px-1 pt-1 pointer-events-none">
            <WaveformCanvas
              peaks={waveformPeaks}
              sourceStart={clip.sourceStart}
              sourceDuration={clip.sourceDuration}
              totalAssetDuration={assetDuration}
              isMuted={isAudioMuted}
            />
          </div>
        )}

        {/* Clip Content Label */}
        {widthPx >= 28 && (
          <div className="z-10 absolute top-1 left-1.5 flex min-w-0 max-w-[calc(100%-12px)] items-center gap-1 pointer-events-none select-none leading-none">
            {clip.type !== "video" && clip.type !== "image" && renderIcon()}
            <span className="truncate text-[10px] font-medium text-white/95 leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] tracking-tight">
              {clip.name}
            </span>
            {showStatusDetails &&
              isAudioMuted &&
              (clip.type === "audio" || clip.type === "video") && (
                <span title="Audio muted" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  <VolumeX className="h-2.5 w-2.5 shrink-0 text-white/80" />
                </span>
              )}
            {showStatusDetails && isMissingAsset && (
              <span
                className="flex items-center gap-0.5 rounded bg-destructive/90 px-1 py-0.5 text-[8px] font-bold text-white shadow-xs leading-none"
                title="Missing asset file"
              >
                <AlertCircle className="h-2 w-2" /> Missing
              </span>
            )}
          </div>
        )}

        {/* Duration Badge (Only for non-video) */}
        {clip.type !== "video" && showDuration && (
          <span
            className={cn(
              "z-10 ml-auto shrink-0 font-mono text-[9px] text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pr-2",
              durationOnly &&
                "pointer-events-none absolute inset-0 ml-0 flex items-center justify-center text-white",
            )}
          >
            {durationLabel}
          </span>
        )}

        {/* Right Trim Handle */}
        {!track.locked && (
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartDrag(clip, "trim-end", e);
            }}
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-selection z-30 transition-colors opacity-0 group-hover:opacity-100"
            title="Trim clip end"
          />
        )}
      </div>

      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          items={clipMenuItems}
          onClose={() => setContextMenuPos(null)}
        />
      )}
    </>
  );
}
