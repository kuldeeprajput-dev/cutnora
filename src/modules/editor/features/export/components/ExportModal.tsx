"use client";

import React, { useEffect, useRef } from "react";
import { useProjectStore } from "@/modules/projects";
import {
  useExportStore,
  type ExportFormat,
  type ExportResolution,
  type ExportQuality,
} from "@/modules/editor/store/useExportStore";
import { runExportTask } from "../services/exportService";
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
  Film,
  Loader2,
} from "lucide-react";

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

  useEffect(() => {
    detectCapabilities();
  }, [detectCapabilities]);

  useEffect(() => {
    if (currentProject && filename === "video-export") {
      const sanitized = currentProject.name
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-");
      setFilename(sanitized || "video-export");
    }
  }, [currentProject, filename, setFilename]);

  if (!isExportModalOpen || !currentProject) return null;

  const totalDuration = currentProject.settings.duration || 10;

  const handleStartExport = () => {
    isCancelRef.current = false;
    resetExport();

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
          setCurrentExportTime(curTime);
          setExportProgress(pct);
          setExportPhase(phase);
        },
        onComplete: (url) => {
          setExportBlobUrl(url);
          setExportPhase("completed");
        },
        onError: (err) => {
          setExportError(err);
        },
        checkIsCancelled: () => isCancelRef.current,
      },
    );
  };

  const handleCancelExport = () => {
    isCancelRef.current = true;
    setIsCancelRequested(true);
  };

  const handleClose = () => {
    if (exportPhase === "rendering" || exportPhase === "converting") {
      handleCancelExport();
    }
    setExportModalOpen(false);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${ms}`;
  };

  return (
    <Dialog
      isOpen={isExportModalOpen}
      onClose={handleClose}
      title="Export Video"
      className="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        {/* Browser Capability Warnings */}
        {(!capabilities.hasCaptureStream || !capabilities.hasMediaRecorder) && (
          <div className="flex items-center gap-2 rounded-lg border border-[#E45858]/50 bg-[#E45858]/10 p-3 text-xs text-[#E45858] mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Your browser lacks canvas stream recording capabilities. Video
              export may be restricted.
            </span>
          </div>
        )}

        {/* Phase View: Rendering or Converting */}
        {(exportPhase === "rendering" || exportPhase === "converting") && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A36] flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {exportPhase === "rendering"
                  ? "Rendering Video Frames..."
                  : "Converting MP4 (WASM)..."}
              </span>
              <span className="font-mono text-xs font-semibold text-[#F4F5F7]">
                {exportProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full rounded-full bg-[#1D2027] overflow-hidden border border-[#2B2F38]">
              <div
                className="h-full bg-[#FF5A36] transition-all duration-150 rounded-full"
                style={{ width: `${exportProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#9298A3]">
              <span>
                {formatSeconds(currentExportTime)} /{" "}
                {formatSeconds(totalDuration)}
              </span>
              <span>{exportFps} FPS</span>
            </div>

            {/* Active Tab Notice */}
            <div className="flex items-center gap-2 rounded-lg border border-[#F2C94C]/40 bg-[#F2C94C]/10 p-2.5 text-xs text-[#F2C94C]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Keep this tab active while the export is running to ensure
                smooth frame capture.
              </span>
            </div>
          </div>
        )}

        {/* Phase View: Completed */}
        {exportPhase === "completed" && (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#248A5A]/20 text-[#248A5A]">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#F4F5F7]">
              Export Completed Successfully!
            </h4>
            <p className="text-xs text-[#9298A3]">
              Your video file has been generated and saved locally.
            </p>

            {exportBlobUrl && (
              <a
                href={exportBlobUrl}
                download={`${filename}.${exportFormat}`}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#FF5A36] px-4 py-2 text-xs font-semibold text-white hover:bg-[#FF5A36]/90 transition-colors"
              >
                <Download className="h-4 w-4" /> Download Video File
              </a>
            )}
          </div>
        )}

        {/* Phase View: Error */}
        {exportPhase === "error" && (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E45858]/20 text-[#E45858]">
              <XCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#E45858]">Export Failed</h4>
            <p className="text-xs text-[#9298A3] max-w-xs">
              {exportError || "An unexpected error occurred during rendering."}
            </p>
          </div>
        )}

        {/* Phase View: Idle Form Controls */}
        {exportPhase === "idle" && (
          <div className="flex flex-col gap-4">
            {/* Filename Input */}
            <div>
              <label className="text-[11px] font-medium text-[#9298A3] block mb-1">
                Export Filename
              </label>
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="my-video"
                className="h-8 text-xs font-mono"
              />
            </div>

            {/* Format & Resolution */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#9298A3] block mb-1">
                  Format
                </label>
                <Select
                  value={exportFormat}
                  onChange={(e) =>
                    setExportFormat(e.target.value as ExportFormat)
                  }
                  className="h-8 text-xs border-[#2B2F38]"
                >
                  <option value="webm">WebM</option>
                  <option value="mp4" disabled={!capabilities.hasFFmpegSupport}>
                    {capabilities.hasFFmpegSupport
                      ? "MP4 (FFmpeg conversion)"
                      : "MP4 (Not supported on device)"}
                  </option>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#9298A3] block mb-1">
                  Resolution
                </label>
                <Select
                  value={exportResolution}
                  onChange={(e) =>
                    setExportResolution(e.target.value as ExportResolution)
                  }
                  className="h-8 text-xs border-[#2B2F38]"
                >
                  <option value="1280x720">1280x720</option>
                  <option value="1920x1080">1920x1080</option>
                  <option value="project">
                    Project resolution ({currentProject.settings.width}x
                    {currentProject.settings.height})
                  </option>
                </Select>
              </div>
            </div>

            {/* Frame Rate & Quality */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#9298A3] block mb-1">
                  Frame Rate
                </label>
                <Select
                  value={String(exportFps)}
                  onChange={(e) =>
                    setExportFps(parseInt(e.target.value, 10) as 24 | 30 | 60)
                  }
                  className="h-8 text-xs border-[#2B2F38]"
                >
                  <option value="24">24</option>
                  <option value="30">30</option>
                  <option value="60">60 when practical</option>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#9298A3] block mb-1">
                  Quality
                </label>
                <Select
                  value={exportQuality}
                  onChange={(e) =>
                    setExportQuality(e.target.value as ExportQuality)
                  }
                  className="h-8 text-xs border-[#2B2F38]"
                >
                  <option value="draft">Draft</option>
                  <option value="standard">Standard</option>
                  <option value="high">High</option>
                </Select>
              </div>
            </div>

            {/* Duration Badge & Performance Disclaimer */}
            <div className="rounded-lg border border-[#2B2F38] bg-[#14161B] p-3 text-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-[#F4F5F7] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Film className="h-4 w-4 text-[#FF5A36]" /> Estimated Duration
                </span>
                <span className="font-mono">
                  {formatSeconds(totalDuration)}
                </span>
              </div>
              <p className="text-[11px] text-[#9298A3] mt-1">
                Local export performance depends on project length, resolution
                and device performance.
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#2B2F38] pt-4">
          {(exportPhase === "rendering" || exportPhase === "converting") && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCancelExport}
              className="w-full text-[#E45858]"
            >
              Cancel Export
            </Button>
          )}

          {exportPhase === "completed" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={resetExport}
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
              <Button size="sm" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleStartExport}
                className="gap-1.5"
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
