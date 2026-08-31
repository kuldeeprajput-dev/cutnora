"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Gauge,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface ThemedVideoPlayerProps {
  src: string;
  poster?: string;
  label: string;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

function formatMediaTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ThemedVideoPlayer({ src, poster, label }: ThemedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    setControlsVisible(true);
    if (isPlaying) hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), 2500);
  }, [isPlaying]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || hasError) return;
    if (video.paused) {
      try { await video.play(); } catch { setHasError(true); }
    } else {
      video.pause();
    }
  }, [hasError]);

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    } else {
      await containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying(false);
    setIsBuffering(true);
    setHasError(false);
    setCurrentTime(0);

    const onLoadedMetadata = () => { setDuration(video.duration || 0); setIsBuffering(false); };
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => { setVolume(video.volume); setIsMuted(video.muted); };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onError = () => { setHasError(true); setIsBuffering(false); };

    const events: Array<[string, EventListener]> = [
      ["loadedmetadata", onLoadedMetadata],
      ["timeupdate", onTimeUpdate],
      ["play", onPlay],
      ["pause", onPause],
      ["volumechange", onVolumeChange],
      ["waiting", onWaiting],
      ["canplay", onCanPlay],
      ["error", onError],
    ];

    events.forEach(([evt, handler]) => video.addEventListener(evt, handler));
    return () => {
      events.forEach(([evt, handler]) => video.removeEventListener(evt, handler));
    };
  }, [src]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseMove={resetHideTimer}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "k") {
          e.preventDefault();
          togglePlay();
        } else if (e.key === "m") {
          e.preventDefault();
          toggleMute();
        } else if (e.key === "f") {
          e.preventDefault();
          toggleFullscreen();
        }
      }}
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black outline-none ring-brand focus-visible:ring-2"
      aria-label={`Video player: ${label}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        className="h-full w-full object-contain cursor-pointer"
        onClick={togglePlay}
      />
      {isBuffering && !hasError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 text-white">
          <RotateCcw className="h-6 w-6 text-brand" />
          <p className="text-xs font-semibold">Video preview unavailable</p>
        </div>
      )}
      {!isPlaying && !isBuffering && !hasError && (
        <button
          type="button"
          aria-label="Play video"
          onClick={togglePlay}
          className="absolute grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-110"
        >
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </button>
      )}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-2 pt-6 text-white transition-opacity duration-200",
          controlsVisible || !isPlaying ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            if (videoRef.current) {
              videoRef.current.currentTime = Number(e.target.value);
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          className="mb-2 h-1 w-full cursor-pointer appearance-none rounded-full accent-brand"
          style={{ background: `linear-gradient(to right, var(--brand) ${progress}%, rgba(255,255,255,0.3) ${progress}%)` }}
        />
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button type="button" onClick={togglePlay} className="p-1 rounded hover:bg-white/10">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <span className="font-mono text-[11px] text-white/80">
              {formatMediaTime(currentTime)} / {formatMediaTime(duration)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={toggleMute} className="p-1 rounded hover:bg-white/10">
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRateMenu((prev) => !prev)}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-white/10"
              >
                <Gauge className="h-3 w-3" />
                <span>{playbackRate}x</span>
              </button>
              {showRateMenu && (
                <div className="absolute bottom-7 right-0 flex flex-col rounded-md border border-studio-border bg-studio-panel p-1 shadow-lg">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.playbackRate = rate;
                          setPlaybackRate(rate);
                        }
                        setShowRateMenu(false);
                      }}
                      className={cn(
                        "rounded px-2 py-1 text-left text-xs text-studio-fg hover:bg-studio-hover",
                        playbackRate === rate && "text-brand font-bold"
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={toggleFullscreen} className="p-1 rounded hover:bg-white/10">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
