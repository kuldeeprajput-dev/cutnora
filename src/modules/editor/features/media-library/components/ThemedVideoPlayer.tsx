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
  previewFullscreen?: boolean;
  onTogglePreviewFullscreen?: () => void;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

function formatMediaTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ThemedVideoPlayer({ src, poster, label, previewFullscreen = false, onTogglePreviewFullscreen }: ThemedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const displayedSecondRef = useRef(-1);
  const scrubbingRef = useRef(false);
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
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const isFullscreen = isNativeFullscreen || previewFullscreen;
  const hideTimerRef = useRef<number | null>(null);

  const syncProgress = useCallback(() => {
    const video = videoRef.current;
    const slider = progressRef.current;
    if (!video || !slider) return;
    const time = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    const length = Number.isFinite(video.duration) ? video.duration : 0;
    const progress = length > 0 ? Math.min(100, Math.max(0, time / length * 100)) : 0;
    slider.value = String(time);
    slider.style.setProperty("--media-progress", `${progress}%`);
    const second = Math.floor(time);
    if (displayedSecondRef.current !== second) {
      displayedSecondRef.current = second;
      setCurrentTime(time);
    }
  }, []);

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
    if (window.matchMedia("(max-width: 1023px)").matches && onTogglePreviewFullscreen) {
      onTogglePreviewFullscreen();
      return;
    }
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
    setDuration(0);
    displayedSecondRef.current = -1;
    scrubbingRef.current = false;
    if (progressRef.current) {
      progressRef.current.value = "0";
      progressRef.current.style.setProperty("--media-progress", "0%");
    }

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      setIsBuffering(false);
      syncProgress();
    };
    const onTimeUpdate = () => { if (!scrubbingRef.current) syncProgress(); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => { setIsPlaying(false); syncProgress(); };
    const onVolumeChange = () => { setVolume(video.volume); setIsMuted(video.muted); };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onError = () => { setHasError(true); setIsBuffering(false); };

    const events: Array<[string, EventListener]> = [
      ["loadedmetadata", onLoadedMetadata],
      ["timeupdate", onTimeUpdate],
      ["play", onPlay],
      ["pause", onPause],
      ["ended", onPause],
      ["seeked", onTimeUpdate],
      ["durationchange", onLoadedMetadata],
      ["volumechange", onVolumeChange],
      ["waiting", onWaiting],
      ["canplay", onCanPlay],
      ["error", onError],
    ];

    events.forEach(([evt, handler]) => video.addEventListener(evt, handler));
    return () => {
      events.forEach(([evt, handler]) => video.removeEventListener(evt, handler));
    };
  }, [src, syncProgress]);

  useEffect(() => {
    if (!isPlaying || isBuffering || hasError) return;
    let frameId: number;
    const tick = () => {
      if (!scrubbingRef.current) syncProgress();
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [isPlaying, isBuffering, hasError, src, syncProgress]);

  useEffect(() => {
    const finishScrubbing = () => {
      if (!scrubbingRef.current) return;
      scrubbingRef.current = false;
      syncProgress();
    };
    window.addEventListener("pointerup", finishScrubbing);
    window.addEventListener("pointercancel", finishScrubbing);
    return () => {
      window.removeEventListener("pointerup", finishScrubbing);
      window.removeEventListener("pointercancel", finishScrubbing);
    };
  }, [syncProgress]);

  useEffect(() => {
    const onFsChange = () => setIsNativeFullscreen(
      window.matchMedia("(max-width: 1023px)").matches
        ? document.fullscreenElement === containerRef.current
        : Boolean(document.fullscreenElement),
    );
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

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
      className={cn(
        "group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black outline-none ring-white/30 focus-visible:ring-2",
        isFullscreen && "max-lg:h-full max-lg:aspect-auto max-lg:rounded-none",
      )}
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
          <RotateCcw className="h-6 w-6 text-white/70" />
          <p className="text-xs font-semibold">Video preview unavailable</p>
        </div>
      )}
      {!isPlaying && !isBuffering && !hasError && (
        <button
          type="button"
          aria-label="Play video"
          onClick={togglePlay}
          className="absolute grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-xl shadow-black/50 transition-transform hover:scale-110 hover:bg-neutral-200 cursor-pointer"
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
          ref={progressRef}
          aria-label="Seek video"
          type="range"
          min={0}
          max={duration || 0}
          step="any"
          defaultValue={0}
          onPointerDown={() => { scrubbingRef.current = true; }}
          onChange={(e) => {
            if (videoRef.current) {
              videoRef.current.currentTime = Number(e.target.value);
              syncProgress();
            }
          }}
          className="mb-2 h-1 w-full cursor-pointer appearance-none rounded-full accent-white"
          style={{ background: "linear-gradient(to right, #ffffff var(--media-progress, 0%), rgba(255,255,255,0.25) var(--media-progress, 0%))" }}
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
                <div className="absolute bottom-7 right-0 flex flex-col rounded-md border border-white/10 bg-[#1A1A1A] p-1 shadow-xl">
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
                        "rounded px-2 py-1 text-left text-xs transition-colors",
                        playbackRate === rate
                          ? "text-white font-bold bg-white/10"
                          : "text-white/70 hover:text-white hover:bg-white/5"
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
