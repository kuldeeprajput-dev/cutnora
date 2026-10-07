"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useProjectStore } from "@/modules/projects";
import {
  useExportStore,
  type ExportFormat,
  type ExportResolution,
  type ExportQuality,
} from "@/modules/editor/store/useExportStore";
import { runExportTask } from "../services/exportService";
import {
  buildExportPreflight,
  type ExportPreflightResult,
  getNativeMp4MimeType,
} from "../services/export-preflight";
import {
  EXPORT_QUALITY_OPTIONS,
  getExportDimensions,
} from "../services/export-settings";
import { Dialog } from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import {
  Download,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  XCircle,
  Loader2,
} from "lucide-react";

function formatSeconds(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${ms}`;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
}

export function ExportModal() {
  const { currentProject } = useProjectStore();
  const {
    isExportModalOpen,
    filename,
    exportFormat,
    exportResolution,
    exportFps,
    exportQuality,
    exportPhase,
    exportProgress,
    currentExportTime,
    exportError,
    exportBlobUrl,
    exportDownloadName,
    exportStatus,
    capabilities,
    setExportModalOpen,
    setFilename,
    setExportFormat,
    setExportResolution,
    setExportFps,
    setExportQuality,
    setExportPhase,
    setExportProgress,
    setCurrentExportTime,
    setExportError,
    setExportBlobUrl,
    setIsCancelRequested,
    detectCapabilities,
    resetExport,
  } = useExportStore();

  const isCancelRef = useRef(false);
  const wasOpenRef = useRef(false);
  const exportStartedAtRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isRunning = exportPhase === "rendering" || exportPhase === "converting";
  const confirmingCancel = isRunning && showCancelConfirmation;
  const [preflight, setPreflight] = useState<ExportPreflightResult | null>(
    null,
  );

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      if (exportStartedAtRef.current !== null) {
        setElapsedSeconds(
          Math.floor((performance.now() - exportStartedAtRef.current) / 1000),
        );
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    detectCapabilities();
  }, [detectCapabilities]);

  useEffect(() => {
    const justOpened = isExportModalOpen && !wasOpenRef.current;
    wasOpenRef.current = isExportModalOpen;

    if (!justOpened || !currentProject) return;

    const projectFps = currentProject.settings.fps;
    setExportFps(
      projectFps === 24 || projectFps === 30 || projectFps === 60
        ? projectFps
        : 30,
    );
    setExportResolution("project");
  }, [currentProject, isExportModalOpen, setExportFps, setExportResolution]);

  useEffect(() => {
    if (currentProject && filename === "video-export") {
      const sanitized = currentProject.name
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-");
      setFilename(sanitized || "video-export");
    }
  }, [currentProject, filename, setFilename]);
  useEffect(() => {
    if (!isExportModalOpen || !currentProject) {
      setPreflight(null);
      return;
    }
    let active = true;
    setPreflight(null);
    void buildExportPreflight(currentProject, {
      // The filename does not affect codec support, storage, or output size.
      filename: "",
      format: exportFormat,
      resolution: exportResolution,
      fps: exportFps,
      quality: exportQuality,
    }).then((result) => {
      if (active) setPreflight(result);
    });
    return () => {
      active = false;
    };
  }, [
    currentProject,
    exportFormat,
    exportFps,
    exportQuality,
    exportResolution,
    isExportModalOpen,
  ]);

  const handleCancelExport = useCallback(() => {
    const phase = useExportStore.getState().exportPhase;
    if (phase !== "rendering" && phase !== "converting") return;
    isCancelRef.current = true;
    setIsCancelRequested(true);
    setShowCancelConfirmation(false);
    setExportModalOpen(false);
  }, [setIsCancelRequested, setExportModalOpen]);

  // Dialog resets focus when onClose changes, so keep it stable while typing.
  const handleClose = useCallback(() => {
    if (exportPhase === "rendering" || exportPhase === "converting") {
      // Escape or Close dismisses an open confirmation and keeps exporting.
      setShowCancelConfirmation((shown) => !shown);
      return;
    }
    setExportModalOpen(false);
  }, [exportPhase, setExportModalOpen]);

  if (!isExportModalOpen || !currentProject) return null;

  const totalDuration = currentProject.settings.duration || 10;
  const remainingSeconds =
    exportPhase === "rendering" &&
    currentExportTime > 0.5 &&
    elapsedSeconds >= 3
      ? Math.ceil(
          (elapsedSeconds * Math.max(0, totalDuration - currentExportTime)) /
            currentExportTime,
        )
      : null;

  const hasNativeMp4Export = Boolean(getNativeMp4MimeType());
  const handleStartExport = () => {
    if (
      !preflight ||
      preflight.isMobileBlocked ||
      !preflight.hasEnoughStorage ||
      Boolean(preflight.blockingReason)
    ) {
      return;
    }
    isCancelRef.current = false;
    setShowCancelConfirmation(false);
    resetExport();
    exportStartedAtRef.current = performance.now();
    setElapsedSeconds(0);

    runExportTask(
      currentProject,
      {
        filename,
        format: exportFormat,
        resolution: exportResolution,
        fps: exportFps,
        quality: exportQuality,
      },
      {
        onProgress: (curTime, totTime, pct, phase) => {
          if (phase === "cancelled") {
            resetExport();
            return;
          }
          setCurrentExportTime(curTime);
          setExportProgress(pct);
          setExportPhase(phase);
        },
        onStatus: (status) => useExportStore.setState({ exportStatus: status }),
        onComplete: (url, downloadName, cleanup) => {
          setExportBlobUrl(url, cleanup);
          useExportStore.setState({ exportDownloadName: downloadName ?? "" });
          setExportPhase("completed");
        },
        onError: (err) => {
          setExportError(err);
        },
        checkIsCancelled: () => isCancelRef.current,
      },
      preflight,
    );
  };

  return (
    <Dialog
      isOpen={isExportModalOpen}
      onClose={handleClose}
      title={confirmingCancel ? "Cancel export?" : "Export Video"}
      closeOnBackdropClick={!isRunning}
      className="max-w-lg rounded-2xl [&>div:first-child]:mb-5 [&>div:first-child_h2]:text-xl max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[92dvh] max-lg:rounded-b-none max-lg:rounded-t-2xl max-lg:border-b-0"
    >
      <div className="flex flex-col gap-4">
        {/* Browser Capability Warnings */}
        {!confirmingCancel &&
          (!capabilities.hasCaptureStream || !capabilities.hasMediaRecorder) && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Your browser lacks canvas stream recording capabilities. Video
              export may be restricted.
            </span>
          </div>
        )}

        {confirmingCancel && (
          <div className="py-2">
            <p className="text-sm leading-relaxed text-studio-fg">
              Your video is still exporting. If you stop now, you’ll need to
              start a new export.
            </p>
            <p className="mt-3 text-xs tabular-nums text-studio-muted">
              {exportProgress}% complete
            </p>
          </div>
        )}

        {/* Phase View: Rendering or Converting */}
        {isRunning && !confirmingCancel && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {exportStatus ||
                  (exportPhase === "rendering"
                    ? "Rendering Video Frames..."
                    : "Converting MP4 (WASM)...")}
              </span>
              <span className="font-mono text-xs font-semibold text-studio-fg">
                {exportProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full rounded-full bg-studio-panel-raised overflow-hidden border border-studio-border">
              <div
                className="h-full bg-brand transition-all duration-150 rounded-full"
                style={{ width: `${exportProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-studio-muted">
              <span>
                {formatSeconds(currentExportTime)} /{" "}
                {formatSeconds(totalDuration)}
              </span>
              <span>{exportFps} FPS</span>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-studio-muted">Elapsed time</dt>
                <dd className="mt-1 font-mono tabular-nums text-studio-fg">
                  {formatSeconds(elapsedSeconds).slice(0, -2)}
                </dd>
              </div>
              <div className="text-right">
                <dt className="text-studio-muted">
                  {preflight?.requiresMp4Conversion
                    ? "Approx. capture remaining"
                    : "Approx. remaining"}
                </dt>
                <dd className="mt-1 font-mono tabular-nums text-studio-fg">
                  {exportPhase === "converting"
                    ? "Finalizing…"
                    : remainingSeconds === null
                      ? "Estimating…"
                      : `~${formatSeconds(remainingSeconds).slice(0, -2)}`}
                </dd>
              </div>
            </dl>

            {/* Active Tab Notice */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-relaxed text-studio-fg">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>
                {preflight?.frameEncoding
                  ? "Keep this tab open until your video is ready."
                  : "Keep this tab active while the export is running to ensure smooth frame capture."}
              </span>
            </div>
          </div>
        )}

        {/* Phase View: Completed */}
        {exportPhase === "completed" && (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mkt-success/20 text-mkt-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-studio-fg">
              Export Completed Successfully!
            </h4>
            <p className="text-xs text-studio-muted">
              Your video file has been generated and saved locally.
            </p>

            {exportBlobUrl && (
              <a
                href={exportBlobUrl}
                download={exportDownloadName || `${filename}.${exportFormat}`}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-contrast hover:bg-brand/90 transition-colors"
              >
                <Download className="h-4 w-4" /> Download Video File
              </a>
            )}
          </div>
        )}

        {/* Phase View: Error */}
        {exportPhase === "error" && (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-destructive">
              Export Failed
            </h4>
            <p className="text-xs text-studio-muted max-w-xs">
              {exportError || "An unexpected error occurred during rendering."}
            </p>
          </div>
        )}

        {/* Phase View: Idle Form Controls */}
        {exportPhase === "idle" && (
          <div className="flex flex-col gap-4">
            {/* Filename Input */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-studio-muted">
                Export Filename
              </label>
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="my-video"
                className="h-10 rounded-xl bg-studio-panel-raised/50 text-sm focus-visible:border-studio-fg/40 focus-visible:ring-1 focus-visible:ring-studio-fg/20 max-lg:h-12 max-lg:text-base"
              />
            </div>

            {/* Format & Resolution */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-studio-muted">
                  Format
                </label>
                <Select
                  mobileTouchTargets
                  value={exportFormat}
                  onChange={(e) =>
                    setExportFormat(e.target.value as ExportFormat)
                  }
                  className="h-10 rounded-xl border-studio-border bg-studio-panel-raised/50 text-sm max-lg:h-11"
                >
                  <option value="webm">WebM</option>
                  <option
                    value="mp4"
                    disabled={
                      !capabilities.hasFFmpegSupport && !hasNativeMp4Export
                    }
                  >
                    {hasNativeMp4Export
                      ? "MP4 (Native)"
                      : capabilities.hasFFmpegSupport
                        ? "MP4 (FFmpeg conversion)"
                        : "MP4 (Not supported on device)"}
                  </option>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-studio-muted">
                  Resolution
                </label>
                <Select
                  mobileTouchTargets
                  mobileValueLabel={
                    exportResolution === "project"
                      ? "Original"
                      : exportResolution
                  }
                  value={exportResolution}
                  onChange={(e) =>
                    setExportResolution(e.target.value as ExportResolution)
                  }
                  className="h-10 rounded-xl border-studio-border bg-studio-panel-raised/50 text-sm max-lg:h-11"
                >
                  <option value="project">
                    Original (
                    {getExportDimensions(currentProject, "project").width} ×{" "}
                    {getExportDimensions(currentProject, "project").height})
                  </option>
                  <option value="720p">
                    720p ({getExportDimensions(currentProject, "720p").width} ×{" "}
                    {getExportDimensions(currentProject, "720p").height})
                  </option>
                  <option value="1080p">
                    1080p ({getExportDimensions(currentProject, "1080p").width}{" "}
                    × {getExportDimensions(currentProject, "1080p").height})
                  </option>
                </Select>
              </div>
            </div>

            {/* Frame Rate & Quality */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-studio-muted">
                  Frame Rate
                </label>
                <Select
                  mobileTouchTargets
                  value={String(exportFps)}
                  onChange={(e) =>
                    setExportFps(parseInt(e.target.value, 10) as 24 | 30 | 60)
                  }
                  className="h-10 rounded-xl border-studio-border bg-studio-panel-raised/50 text-sm max-lg:h-11"
                >
                  <option value="24">24</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-studio-muted">
                  Quality
                </label>
                <Select
                  mobileTouchTargets
                  value={exportQuality}
                  onChange={(e) =>
                    setExportQuality(e.target.value as ExportQuality)
                  }
                  className="h-10 rounded-xl border-studio-border bg-studio-panel-raised/50 text-sm max-lg:h-11"
                >
                  {Object.entries(EXPORT_QUALITY_OPTIONS).map(
                    ([value, option]) => (
                      <option key={value} value={value}>
                        {option.label}
                      </option>
                    ),
                  )}
                </Select>
              </div>
            </div>
            <p className="-mt-2 text-[11px] text-studio-muted">
              {EXPORT_QUALITY_OPTIONS[exportQuality].description}
            </p>
            {preflight && preflight.frameEncoding && (
              <p className="text-xs leading-relaxed text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Smooth frame-accurate export ({exportFps} FPS, zero dropped
                  frames)
                </span>
              </p>
            )}
            {preflight && !preflight.frameEncoding && exportFps === 60 && (
              <p className="text-xs leading-relaxed text-studio-muted">
                This export requires real-time capture. Its frame rate depends
                on your device and may be lower than 60 fps.
              </p>
            )}

            {/* Export summary */}
            <div className="overflow-hidden rounded-xl border border-studio-border bg-studio-panel-raised/50">
              <dl className="grid grid-cols-2 gap-4 p-4">
                <div className="min-w-0">
                  <dt className="text-[11px] text-studio-muted">
                    Estimated duration
                  </dt>
                  <dd className="mt-1.5 font-mono text-base font-medium tabular-nums text-studio-fg">
                    {formatSeconds(totalDuration)}
                  </dd>
                </div>
                {preflight && (
                  <div className="min-w-0 border-l border-studio-border pl-4">
                    <dt className="text-[11px] text-studio-muted">
                      Estimated output
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base font-medium tabular-nums text-studio-fg">
                      <span>{formatBytes(preflight.estimatedBytes)}</span>
                      <span className="text-[10px] font-medium tracking-wide text-studio-muted">
                        {preflight.extension.toUpperCase()}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
              {preflight?.isLongExport && (
                <p className="px-4 pb-3 text-xs leading-relaxed text-studio-fg">
                  {preflight.frameEncoding
                    ? "Long export streams smoothly to local storage. Keep this tab open until it finishes."
                    : "Long export streams to local storage in real time. Keep this tab open until it finishes."}
                </p>
              )}
              <p className="border-t border-studio-border px-4 py-3 text-[11px] leading-relaxed text-studio-muted">
                File size is estimated directly from encoded video and audio
                bitrates.
              </p>
            </div>
            {preflight?.blockingReason && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-[11px] text-destructive">
                {preflight.blockingReason}
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-1 flex items-center justify-end gap-2 border-t border-studio-border pt-4">
          {isRunning && (
            confirmingCancel ? (
              <div className="flex w-full flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCancelExport}
                  className="h-10 flex-1 rounded-xl text-sm text-destructive max-lg:h-12"
                >
                  Stop export
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowCancelConfirmation(false)}
                  className="h-10 flex-1 rounded-xl text-sm max-lg:h-12"
                >
                  Keep exporting
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowCancelConfirmation(true)}
                className="w-full text-destructive"
              >
                Cancel Export
              </Button>
            )
          )}

          {exportPhase === "completed" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleClose}
              className="w-full"
            >
              Close
            </Button>
          )}

          {exportPhase === "error" && (
            <div className="flex items-center gap-2 w-full">
              <Button
                size="sm"
                variant="secondary"
                onClick={resetExport}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleStartExport}
                className="flex-1 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry Export
              </Button>
            </div>
          )}

          {exportPhase === "idle" && (
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
                className="h-10 rounded-xl px-4 text-sm max-lg:h-12"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleStartExport}
                disabled={
                  !preflight ||
                  preflight.isMobileBlocked ||
                  !preflight.hasEnoughStorage ||
                  Boolean(preflight.blockingReason)
                }
                className="h-10 gap-2 rounded-xl px-4 text-sm max-lg:h-12"
              >
                <Download className="h-3.5 w-3.5" /> Start Export
              </Button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
