'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileAudio,
  FileImage,
  FileVideo2,
  HardDrive,
  Loader2,
  Music2,
  Plus,
} from 'lucide-react';
import type { MediaAsset } from '@/modules/projects/types';
import { resolveMediaAssetUrl } from '@/modules/core/storage/media-source-service';
import { Button } from '@/shared/components/ui/Button';
import { Dialog } from '@/shared/components/ui/Dialog';
import { WaveformCanvas } from '@/modules/editor/features/audio/components/WaveformCanvas';

interface MediaPreviewDialogProps {
  asset: MediaAsset | null;
  assets: MediaAsset[];
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  onAddToTimeline: (asset: MediaAsset) => void;
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Still image';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function MediaPreviewDialog({
  asset,
  assets,
  onClose,
  onSelect,
  onAddToTimeline,
}: MediaPreviewDialogProps) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const currentIndex = asset ? assets.findIndex((item) => item.id === asset.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < assets.length - 1;

  useEffect(() => {
    let active = true;
    mediaRef.current?.pause();
    setSourceUrl(null);
    setLoadError('');
    if (!asset) return;

    void resolveMediaAssetUrl(asset)
      .then((url) => {
        if (active) setSourceUrl(url);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Preview unavailable');
      });

    return () => {
      active = false;
    };
  }, [asset]);

  useEffect(() => {
    if (!asset) return;
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && hasPrevious) onSelect(assets[currentIndex - 1]);
      if (event.key === 'ArrowRight' && hasNext) onSelect(assets[currentIndex + 1]);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [asset, assets, currentIndex, hasNext, hasPrevious, onSelect]);

  const fallbackPeaks = useMemo(
    () => Array.from({ length: 80 }, (_, i) => 0.2 + Math.abs(Math.sin(i * 0.47)) * 0.6),
    []
  );

  if (!asset) return null;

  return (
    <Dialog
      isOpen
      onClose={onClose}
      title="Media preview"
      description="Review source media before adding to timeline."
      className="max-w-3xl p-3 sm:p-4"
    >
      <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 overflow-hidden rounded-xl border border-studio-border bg-studio-bg flex flex-col justify-between">
          <div className="flex min-h-[240px] items-center justify-center p-3 sm:min-h-[300px]">
            {!sourceUrl && !loadError && <Loader2 className="h-6 w-6 animate-spin text-brand" />}
            {loadError && (
              <div className="flex flex-col items-center gap-2 text-destructive text-xs">
                <AlertCircle className="h-5 w-5" />
                <span>{loadError}</span>
              </div>
            )}
            {sourceUrl && asset.type === 'video' && (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={sourceUrl}
                controls
                playsInline
                preload="metadata"
                className="max-h-[50dvh] w-full bg-black object-contain rounded-lg"
              />
            )}
            {sourceUrl && asset.type === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sourceUrl} alt={asset.name} className="max-h-[50dvh] w-full object-contain rounded-lg" />
            )}
            {sourceUrl && asset.type === 'audio' && (
              <div className="flex w-full flex-col items-center gap-3">
                <Music2 className="h-8 w-8 text-brand" />
                <div className="h-16 w-full rounded border border-studio-border bg-studio-panel p-2">
                  <WaveformCanvas
                    peaks={asset.waveformPeaks?.length ? asset.waveformPeaks : fallbackPeaks}
                    sourceStart={0}
                    sourceDuration={Math.max(0.1, asset.duration)}
                    totalAssetDuration={Math.max(0.1, asset.duration)}
                  />
                </div>
                <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={sourceUrl} controls className="w-full" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-studio-border bg-studio-panel/80 px-3 py-2 text-xs">
            <Button size="sm" variant="ghost" disabled={!hasPrevious} onClick={() => onSelect(assets[currentIndex - 1])}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <span className="truncate max-w-40 font-mono text-[10px] text-studio-muted">
              {currentIndex + 1} / {assets.length}
            </span>
            <Button size="sm" variant="ghost" disabled={!hasNext} onClick={() => onSelect(assets[currentIndex + 1])}>
              Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>

        <aside className="flex flex-col justify-between rounded-xl border border-studio-border bg-studio-panel/55 p-3 text-xs">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-studio-fg break-all">{asset.name}</p>
              <span className="mt-1 inline-block text-[10px] uppercase font-bold text-brand">{asset.type}</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px] text-studio-muted">
              {asset.width && asset.height ? <div>{asset.width} × {asset.height} px</div> : null}
              <div>{formatDuration(asset.duration)}</div>
              <div>{formatSize(asset.size || 0)}</div>
            </div>
          </div>
          <Button size="sm" variant="primary" onClick={() => onAddToTimeline(asset)} className="w-full mt-4 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add to Timeline
          </Button>
        </aside>
      </div>
    </Dialog>
  );
}
