"use client";

import React, { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
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
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "group relative flex flex-1 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-8 lg:p-10 text-center transition-all duration-300 select-none cursor-pointer overflow-hidden",
        "bg-[#1A1A1A]",
        isDragOver
          ? "border-white/60 bg-white/[0.04] scale-[0.99]"
          : "border-white/15 hover:border-white/35 hover:bg-white/[0.02]",
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

      {/* Floating Animated Upload Cloud Icon */}
      <div className="relative mb-3.5 flex items-center justify-center">
        <div
          className={cn(
            "text-white transition-transform duration-300 animate-dropzone-float",
            isDragOver && "scale-115",
          )}
        >
          <UploadCloud
            className={cn(
              "h-11 w-11 sm:h-12 sm:w-12 text-white stroke-[1.75] transition-transform duration-300",
              isDragOver ? "animate-bounce" : "group-hover:-translate-y-1",
            )}
          />
        </div>
      </div>

      {/* Primary Headline */}
      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
        Click to upload
      </h4>

      {/* Subtitle */}
      <p className="mt-1 text-xs text-neutral-400">
        or drag &amp; drop file here
      </p>
    </div>
  );
}
