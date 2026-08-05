'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileVideo, Image as ImageIcon, Music, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/utils/cn';

export interface MediaDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isImporting?: boolean;
}

export function MediaDropzone({ onFilesSelected, isImporting = false }: MediaDropzoneProps) {
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
        'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all select-none',
        isDragOver
          ? 'border-[#FF5A36] bg-[#FF5A36]/10 scale-[0.99]'
          : 'border-[#2B2F38] bg-[#171A20] hover:border-[#9298A3]'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/wav,audio/aac,audio/mp4,audio/ogg"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1D2027] text-[#FF5A36] mb-3">
        <UploadCloud className="h-6 w-6" />
      </div>

      <h4 className="text-xs font-bold text-[#F4F5F7]">Drag and drop media files</h4>
      <p className="mt-1 text-[11px] text-[#9298A3]">Support for videos, images, and audio tracks</p>

      <div className="mt-4">
        <Button
          size="sm"
          variant="primary"
          disabled={isImporting}
          onClick={() => fileInputRef.current?.click()}
        >
          Choose files
        </Button>
      </div>

      {/* Formats Badges */}
      <div className="mt-4 flex items-center gap-3 text-[10px] text-[#9298A3]">
        <span className="flex items-center gap-1"><FileVideo className="h-3 w-3 text-[#FF5A36]" /> MP4, WebM, MOV</span>
        <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3 text-[#F2C94C]" /> PNG, JPG, WebP</span>
        <span className="flex items-center gap-1"><Music className="h-3 w-3 text-[#3478D4]" /> MP3, WAV, M4A</span>
      </div>

      {/* Local-first Security Assurance */}
      <div className="mt-4 flex items-center gap-1 text-[10px] text-[#248A5A] font-medium">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Files stay 100% private on your device</span>
      </div>
    </div>
  );
}
