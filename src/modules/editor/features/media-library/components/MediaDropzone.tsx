"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileVideo,
  Image as ImageIcon,
  Music,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";

export interface MediaDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isImporting?: boolean;
}

export function MediaDropzone({
  onFilesSelected,
  isImporting = false,
}: MediaDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 sm:p-4 lg:p-5 text-center transition-[border-color,background-color,transform] select-none",
        isDragOver
          ? "border-brand bg-brand/10 scale-[0.99]"
          : "border-studio-border bg-studio-panel hover:border-studio-muted",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/wav,audio/aac,audio/mp4,audio/ogg"
        onChange={handleFileChange}
        aria-label="Choose media files to import"
        className="hidden"
      />

      <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-studio-border bg-studio-panel-raised text-brand sm:mb-2 sm:h-10 sm:w-10 lg:mb-3 lg:h-11 lg:w-11 lg:rounded-xl">
        <UploadCloud className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
      </div>

      <h4 className="text-xs font-bold text-studio-fg">
        <span className="lg:hidden">Choose media from device</span>
        <span className="hidden lg:inline">Drag and drop media files</span>
      </h4>
      <p className="mt-0.5 sm:mt-1 text-[10px] lg:text-[11px] text-studio-muted">
        Videos, images, and audio
      </p>

      <div className="mt-2 sm:mt-3 lg:mt-4">
        <Button
          size="sm"
          variant="primary"
          disabled={isImporting}
          onClick={() => fileInputRef.current?.click()}
          className="h-7 sm:h-8 px-3 text-xs"
        >
          Choose files
        </Button>
      </div>

      {/* Formats Badges */}
      <div className="mt-2 sm:mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 sm:gap-y-1 text-[9px] sm:text-[10px] text-studio-muted min-w-0 w-full">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <FileVideo className="h-3 w-3 text-brand shrink-0" /> MP4, WebM, MOV
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <ImageIcon className="h-3 w-3 text-selection shrink-0" /> PNG, JPG,
          WebP
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Music className="h-3 w-3 text-mkt-info shrink-0" /> MP3, WAV, M4A
        </span>
      </div>

      {/* Local-first Security Assurance */}
      <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center gap-1 text-[9px] sm:text-[10px] text-mkt-success font-medium">
        <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
        <span>100% private on your device</span>
      </div>
    </div>
  );
}
