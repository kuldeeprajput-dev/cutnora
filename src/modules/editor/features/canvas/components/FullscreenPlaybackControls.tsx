"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gauge, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { playbackClock } from "@/modules/editor/features/playback/services/playback-clock";

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(time: number) {
  const seconds = Math.max(0, Math.floor(time));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const prefix = hours ? `${String(hours).padStart(2, "0")}:` : "";
  return `${prefix}${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function FullscreenPlaybackControls({ onExit }: { onExit: () => void }) {
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const duration = usePlaybackStore((state) => state.duration);
  const playbackRate = usePlaybackStore((state) => state.playbackRate);
  const previewMuted = usePlaybackStore((state) => state.previewMuted);
  const [visible, setVisible] = useState(true);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [displayTime, setDisplayTime] = useState(() =>
    Math.floor(usePlaybackStore.getState().playhead),
  );
  const displayedSecond = useRef(displayTime);
  const progressRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovering = useRef(false);
  const scrubbing = useRef(false);
  const resumeAfterScrub = useRef(false);

  const revealControls = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (
        !hovering.current &&
        !scrubbing.current &&
        !controlsRef.current?.contains(document.activeElement)
      ) {
        setVisible(false);
      }
    }, 2500);
  }, []);

  const syncProgress = useCallback((time: number) => {
    const input = progressRef.current;
    const total = usePlaybackStore.getState().duration;
    if (input) {
      input.value = String(time);
      input.style.setProperty(
        "--preview-progress",
        `${total > 0 ? (time / total) * 100 : 0}%`,
      );
      input.setAttribute(
        "aria-valuetext",
        `${formatTime(time)} of ${formatTime(total)}`,
      );
    }
    const second = Math.floor(time);
    if (displayedSecond.current !== second) {
      displayedSecond.current = second;
      setDisplayTime(second);
    }
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (!scrubbing.current) syncProgress(playbackClock.getCurrentTime());
      if (isPlaying) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    const unsubscribe = usePlaybackStore.subscribe((state, previous) => {
      if (
        !state.isPlaying &&
        state.playhead !== previous.playhead &&
        !scrubbing.current
      )
        syncProgress(state.playhead);
    });
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [isPlaying, duration, syncProgress]);

  useEffect(() => {
    const stage = document.getElementById("stage-fullscreen-container");
    if (!stage) return;
    stage.focus({ preventScroll: true });
    stage.addEventListener("pointermove", revealControls);
    stage.addEventListener("pointerdown", revealControls);
    const finishScrub = () => {
      if (!scrubbing.current) return;
      scrubbing.current = false;
      if (resumeAfterScrub.current)
        usePlaybackStore.getState().setIsPlaying(true);
      resumeAfterScrub.current = false;
      revealControls();
    };
    window.addEventListener("pointerup", finishScrub);
    window.addEventListener("pointercancel", finishScrub);
    return () => {
      stage.removeEventListener("pointermove", revealControls);
      stage.removeEventListener("pointerdown", revealControls);
      window.removeEventListener("pointerup", finishScrub);
      window.removeEventListener("pointercancel", finishScrub);
      finishScrub();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [revealControls]);

  useEffect(() => {
    if (isPlaying) {
      hideTimer.current = setTimeout(() => {
        if (
          !hovering.current &&
          !scrubbing.current &&
          !controlsRef.current?.contains(document.activeElement)
        )
          setVisible(false);
      }, 2500);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement;
      const key = event.key.toLowerCase();
      if (
        key !== "escape" &&
        (target.closest('input, select, textarea, [contenteditable="true"]') ||
          (target.closest("button") && (key === " " || key === "enter")))
      )
        return;
      const store = usePlaybackStore.getState();
      const seek = (time: number) => {
        store.setIsPlaying(false);
        playbackClock.seek(time);
        syncProgress(usePlaybackStore.getState().playhead);
      };
      switch (key) {
        case " ":
        case "k":
          store.togglePlay();
          break;
        case "arrowleft":
          seek(
            playbackClock.getCurrentTime() -
              (event.shiftKey ? 5 : 1 / store.fps),
          );
          break;
        case "arrowright":
          seek(
            playbackClock.getCurrentTime() +
              (event.shiftKey ? 5 : 1 / store.fps),
          );
          break;
        case "home":
          seek(0);
          break;
        case "end":
          seek(store.duration);
          break;
        case "m":
          store.setPreviewMuted(!store.previewMuted);
          break;
        case "escape":
          if (showRateMenu) {
            setShowRateMenu(false);
            break;
          }
          onExit();
          break;
        case "f":
          onExit();
          break;
        default:
          return;
      }
      event.preventDefault();
      event.stopPropagation();
      revealControls();
    };
    window.addEventListener("keydown", handleKey, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKey, { capture: true });
  }, [onExit, revealControls, showRateMenu, syncProgress]);

  const shown = !isPlaying || visible || showRateMenu;
  const buttonClass =
    "flex h-11 w-11 items-center justify-center rounded-md text-white/90 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white cursor-pointer lg:h-6 lg:w-6";

  return (
    <>
      {!isPlaying && (
        <button
          type="button"
          aria-label="Play preview"
          onClick={() => {
            usePlaybackStore.getState().togglePlay();
            document
              .getElementById("stage-fullscreen-container")
              ?.focus({ preventScroll: true });
          }}
          className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-xl shadow-black/50 hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-white"
        >
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </button>
      )}
      <div
        ref={controlsRef}
        onClick={(event) => event.stopPropagation()}
        onPointerEnter={() => {
          hovering.current = true;
          revealControls();
        }}
        onPointerLeave={() => {
          hovering.current = false;
          revealControls();
        }}
        onFocusCapture={revealControls}
        onBlurCapture={revealControls}
        inert={!shown}
        className={`absolute inset-x-0 bottom-0 z-50 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pt-6 pb-[calc(0.5rem+env(safe-area-inset-bottom))] text-white transition-opacity duration-200 ${shown ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="mb-1 flex h-6 items-center lg:h-3">
          <input
            ref={progressRef}
            type="range"
            aria-label="Seek preview"
            min={0}
            max={duration}
            step="any"
            defaultValue={0}
            disabled={duration <= 0}
            onPointerDown={() => {
              resumeAfterScrub.current = usePlaybackStore.getState().isPlaying;
              scrubbing.current = true;
              usePlaybackStore.getState().setIsPlaying(false);
            }}
            onChange={(event) => {
              usePlaybackStore.getState().setIsPlaying(false);
              playbackClock.seek(Number(event.currentTarget.value));
              syncProgress(usePlaybackStore.getState().playhead);
              revealControls();
            }}
            style={{
              background:
                "linear-gradient(to right, #fff var(--preview-progress, 0%), rgba(255,255,255,0.25) var(--preview-progress, 0%))",
            }}
            className="h-1 w-full cursor-pointer appearance-none rounded-full accent-white touch-none"
          />
        </div>
        <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-2 text-[11px] lg:min-h-6">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label={isPlaying ? "Pause preview" : "Play preview"}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              onClick={() => usePlaybackStore.getState().togglePlay()}
              className={buttonClass}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            <span className="font-mono tabular-nums text-white/80">
              {formatTime(displayTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={previewMuted ? "Unmute preview" : "Mute preview"}
              aria-pressed={previewMuted}
              title={previewMuted ? "Unmute (M)" : "Mute (M)"}
              onClick={() =>
                usePlaybackStore.getState().setPreviewMuted(!previewMuted)
              }
              className={buttonClass}
            >
              {previewMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Playback speed"
                aria-expanded={showRateMenu}
                onClick={() => setShowRateMenu(!showRateMenu)}
                className={`${buttonClass} w-auto gap-1 px-2 lg:w-auto`}
              >
                <Gauge className="h-3 w-3" />
                <span>{playbackRate}x</span>
              </button>
              {showRateMenu && (
                <div className="absolute right-0 bottom-full mb-2 min-w-20 rounded-md border border-white/10 bg-[#1A1A1A] p-1 shadow-xl">
                  {RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      aria-pressed={playbackRate === rate}
                      onClick={() => {
                        playbackClock.setPlaybackRate(rate);
                        setShowRateMenu(false);
                        revealControls();
                      }}
                      className={`block w-full cursor-pointer rounded px-3 py-2 text-left hover:bg-white/10 ${playbackRate === rate ? "bg-white/10 font-bold text-white" : "text-white/70"}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Exit preview fullscreen"
              title="Exit fullscreen (Esc)"
              onClick={onExit}
              className={buttonClass}
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
