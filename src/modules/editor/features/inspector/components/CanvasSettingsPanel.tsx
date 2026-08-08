import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/modules/projects';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Slider } from '@/shared/components/ui/Slider';
import { Volume2, RotateCcw, Share2, Sparkles, ChevronDown, Check } from 'lucide-react';
import type { AspectRatio } from '@/modules/projects/types';

export interface SocialPreset {
  id: string;
  name: string;
  platform: string;
  formatName: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  // YouTube
  { id: 'yt-video', platform: 'YouTube', formatName: 'YouTube Video', width: 1920, height: 1080, aspectRatio: '16:9', name: 'YouTube Video (16:9 — 1920×1080)' },
  { id: 'yt-shorts', platform: 'YouTube', formatName: 'YouTube Shorts', width: 1080, height: 1920, aspectRatio: '9:16', name: 'YouTube Shorts (9:16 — 1080×1920)' },
  { id: 'yt-banner', platform: 'YouTube', formatName: 'YouTube Banner', width: 2560, height: 1440, aspectRatio: '16:9', name: 'YouTube Banner (16:9 — 2560×1440)' },

  // Instagram
  { id: 'ig-reel', platform: 'Instagram', formatName: 'Instagram Reels / Story', width: 1080, height: 1920, aspectRatio: '9:16', name: 'Instagram Reel / Story (9:16 — 1080×1920)' },
  { id: 'ig-square', platform: 'Instagram', formatName: 'Instagram Square Post', width: 1080, height: 1080, aspectRatio: '1:1', name: 'Instagram Square Post (1:1 — 1080×1080)' },
  { id: 'ig-portrait', platform: 'Instagram', formatName: 'Instagram Portrait Post', width: 1080, height: 1350, aspectRatio: '4:5', name: 'Instagram Portrait Post (4:5 — 1080×1350)' },
  { id: 'ig-landscape', platform: 'Instagram', formatName: 'Instagram Landscape', width: 1080, height: 608, aspectRatio: '16:9', name: 'Instagram Landscape (16:9 — 1080×608)' },

  // Twitter / X
  { id: 'tw-video', platform: 'Twitter / X', formatName: 'Twitter / X Video', width: 1200, height: 675, aspectRatio: '16:9', name: 'Twitter / X Video (16:9 — 1200×675)' },
  { id: 'tw-square', platform: 'Twitter / X', formatName: 'Twitter / X Square', width: 1080, height: 1080, aspectRatio: '1:1', name: 'Twitter / X Square Post (1:1 — 1080×1080)' },
  { id: 'tw-portrait', platform: 'Twitter / X', formatName: 'Twitter / X Portrait', width: 1080, height: 1350, aspectRatio: '4:5', name: 'Twitter / X Portrait Post (4:5 — 1080×1350)' },

  // LinkedIn
  { id: 'li-video', platform: 'LinkedIn', formatName: 'LinkedIn Video', width: 1920, height: 1080, aspectRatio: '16:9', name: 'LinkedIn Video (16:9 — 1920×1080)' },
  { id: 'li-square', platform: 'LinkedIn', formatName: 'LinkedIn Square', width: 1080, height: 1080, aspectRatio: '1:1', name: 'LinkedIn Square Post (1:1 — 1080×1080)' },

  // TikTok
  { id: 'tiktok-video', platform: 'TikTok', formatName: 'TikTok Video / Story', width: 1080, height: 1920, aspectRatio: '9:16', name: 'TikTok Video / Story (9:16 — 1080×1920)' },

  // Facebook
  { id: 'fb-video', platform: 'Facebook', formatName: 'Facebook Video', width: 1920, height: 1080, aspectRatio: '16:9', name: 'Facebook Video (16:9 — 1920×1080)' },
  { id: 'fb-reel', platform: 'Facebook', formatName: 'Facebook Reel / Story', width: 1080, height: 1920, aspectRatio: '9:16', name: 'Facebook Reel / Story (9:16 — 1080×1920)' },
  { id: 'fb-square', platform: 'Facebook', formatName: 'Facebook Square Post', width: 1080, height: 1080, aspectRatio: '1:1', name: 'Facebook Square Post (1:1 — 1080×1080)' },
  { id: 'fb-cover', platform: 'Facebook', formatName: 'Facebook Cover', width: 820, height: 312, aspectRatio: '16:9', name: 'Facebook Cover (16:9 — 820×312)' },

  // Pinterest
  { id: 'pin-video', platform: 'Pinterest', formatName: 'Pinterest Pin Video', width: 1080, height: 1920, aspectRatio: '9:16', name: 'Pinterest Pin Video (9:16 — 1080×1920)' },
  { id: 'pin-standard', platform: 'Pinterest', formatName: 'Pinterest Standard Pin', width: 1000, height: 1500, aspectRatio: '2:3', name: 'Pinterest Standard Pin (2:3 — 1000×1500)' },
];

const PLATFORM_ORDER = [
  'YouTube',
  'Instagram',
  'Twitter / X',
  'LinkedIn',
  'TikTok',
  'Facebook',
  'Pinterest',
];

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'YouTube':
      return (
        <svg className="h-4 w-4 text-red-500 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'Instagram':
      return (
        <svg className="h-4 w-4 text-pink-500 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'TikTok':
      return (
        <svg className="h-4 w-4 text-cyan-400 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.36 1.49-1.39 2.49-.04 1.05.51 2.08 1.39 2.62.91.56 2.09.58 3.01.07.88-.49 1.42-1.44 1.46-2.45.03-4.48.01-8.96.01-13.44z"/>
        </svg>
      );
    case 'Facebook':
      return (
        <svg className="h-4 w-4 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'Twitter / X':
      return (
        <svg className="h-4 w-4 text-slate-100 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'LinkedIn':
      return (
        <svg className="h-4 w-4 text-blue-400 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      );
    case 'Pinterest':
      return (
        <svg className="h-4 w-4 text-red-600 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026"/>
        </svg>
      );
    default:
      return <Share2 className="h-4 w-4 text-brand shrink-0" />;
  }
}

interface SocialMediaDropdownProps {
  selectedPreset: SocialPreset | null;
  isSelectedSocial: boolean;
  onSelect: (preset: SocialPreset) => void;
}

function SocialMediaDropdown({ selectedPreset, isSelectedSocial, onSelect }: SocialMediaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activePreset = isSelectedSocial ? selectedPreset : null;

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-9 w-full items-center justify-between rounded-lg border bg-studio-panel px-3 text-xs transition-colors cursor-pointer select-none ${
          isOpen ? 'border-brand ring-1 ring-brand/50' : 'border-studio-border hover:border-brand/50'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {activePreset ? (
            <>
              {getPlatformIcon(activePreset.platform)}
              <span className="truncate font-semibold text-studio-fg">{activePreset.name}</span>
            </>
          ) : (
            <span className="text-studio-muted flex items-center gap-2">
              <Share2 className="h-3.5 w-3.5 text-brand shrink-0" />
              <span>Select Social Format (YouTube, Instagram, X...)...</span>
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-studio-muted shrink-0 transition-transform ${isOpen ? 'rotate-180 text-brand' : ''}`} />
      </button>

      {/* Custom Rich Dropdown Menu with Brand Icons */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-studio-border bg-studio-panel p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-80">
          {PLATFORM_ORDER.map((platform) => {
            const presets = SOCIAL_PRESETS.filter((p) => p.platform === platform);
            return (
              <div key={platform} className="mb-2.5 last:mb-0">
                {/* Section Header with Icon */}
                <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-bold text-studio-fg/90 bg-studio-panel-raised/60 rounded mb-1 border border-studio-border/40">
                  {getPlatformIcon(platform)}
                  <span>{platform}</span>
                </div>

                {/* Option Items (Icons shown only for Category header) */}
                <div className="flex flex-col gap-0.5">
                  {presets.map((preset) => {
                    const isSelected = activePreset?.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onSelect(preset);
                          setIsOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer pl-3 ${
                          isSelected
                            ? 'bg-brand/20 text-brand font-bold border border-brand/40'
                            : 'text-studio-fg hover:bg-studio-panel-raised hover:text-brand'
                        }`}
                      >
                        <span className="truncate">{preset.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-brand shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const FPS_OPTIONS = [
  { value: 24, label: '24 FPS (Cinematic)' },
  { value: 30, label: '30 FPS (Standard Video)' },
  { value: 60, label: '60 FPS (Smooth High-FPS)' },
];

function FpsDropdown({ value, onChange }: { value: number; onChange: (fps: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeOption = FPS_OPTIONS.find((opt) => opt.value === value) || FPS_OPTIONS[1];

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-8 w-full items-center justify-between rounded-lg border bg-studio-panel px-3 text-xs text-studio-fg transition-colors cursor-pointer select-none ${
          isOpen ? 'border-brand ring-1 ring-brand/50' : 'border-studio-border hover:border-brand/50'
        }`}
      >
        <span className="font-medium">{activeOption.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-studio-muted transition-transform ${isOpen ? 'rotate-180 text-brand' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-studio-border bg-studio-panel p-1 shadow-2xl backdrop-blur-md animate-in fade-in-80">
          <div className="flex flex-col gap-0.5">
            {FPS_OPTIONS.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-brand/20 text-brand font-bold border border-brand/40'
                      : 'text-studio-fg hover:bg-studio-panel-raised hover:text-brand'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-brand shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function CanvasSettingsPanel() {
  const { currentProject, updateProjectSettings } = useProjectStore();
  
  // Track selection source: 'social' | 'ratio' | 'custom'
  const [selectionSource, setSelectionSource] = useState<'social' | 'ratio' | 'custom'>('social');
  const [selectedSocialPresetId, setSelectedSocialPresetId] = useState<string | null>(null);

  if (!currentProject) return null;

  const settings = currentProject.settings;

  // Find matching social preset: first by explicitly selected ID, then by matching dimensions
  const activeSocialPreset =
    (selectedSocialPresetId && SOCIAL_PRESETS.find((p) => p.id === selectedSocialPresetId)) ||
    SOCIAL_PRESETS.find((p) => p.width === settings.width && p.height === settings.height);

  const handleRatioChange = (ratio: AspectRatio) => {
    let w = 1920;
    let h = 1080;
    if (ratio === '9:16') {
      w = 1080;
      h = 1920;
    } else if (ratio === '1:1') {
      w = 1080;
      h = 1080;
    } else if (ratio === '4:5') {
      w = 1080;
      h = 1350;
    }

    setSelectionSource('ratio');
    setSelectedSocialPresetId(null);
    updateProjectSettings({ width: w, height: h, aspectRatio: ratio });
  };

  const handleSocialPresetSelect = (preset: SocialPreset) => {
    setSelectionSource('social');
    setSelectedSocialPresetId(preset.id);
    updateProjectSettings({
      width: preset.width,
      height: preset.height,
      aspectRatio: preset.aspectRatio,
    });
  };

  const handleCustomDimensionChange = (updates: Partial<{ width: number; height: number }>) => {
    setSelectionSource('custom');
    setSelectedSocialPresetId(null);
    updateProjectSettings(updates);
  };

  const handleResetCanvasSettings = () => {
    setSelectionSource('ratio');
    setSelectedSocialPresetId(null);
    updateProjectSettings({
      width: 1920,
      height: 1080,
      aspectRatio: '16:9',
      fps: 30,
      backgroundColor: '#000000',
      masterVolume: 1.0,
    });
  };

  return (
    <div className="flex flex-col gap-4 text-studio-fg select-none">
      {/* 1. TOP: Social Media Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-studio-fg flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5 text-brand" />
            <span>Social Media Presets</span>
          </label>

          {selectionSource === 'social' && activeSocialPreset && (
            <span className="text-[10px] font-bold text-brand bg-brand/15 border border-brand/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              {activeSocialPreset.platform}
            </span>
          )}
        </div>

        {/* Custom Rich Dropdown with Brand Icons */}
        <SocialMediaDropdown
          selectedPreset={activeSocialPreset || null}
          isSelectedSocial={selectionSource === 'social'}
          onSelect={handleSocialPresetSelect}
        />
      </div>

      <div className="h-px bg-studio-border" />

      {/* 2. BOTTOM: Aspect Ratio Presets */}
      <div>
        <label className="text-xs font-medium text-studio-muted block mb-2">Aspect Ratio Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {(['16:9', '9:16', '1:1', '4:5'] as const).map((ratio) => {
            // Only active if explicitly selected via aspect ratio buttons
            const isActive = selectionSource === 'ratio' && settings.aspectRatio === ratio;
            return (
              <button
                key={ratio}
                type="button"
                onClick={() => handleRatioChange(ratio)}
                className={`flex h-9 items-center justify-center rounded-lg text-xs transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-brand text-white font-bold shadow-sm ring-1 ring-brand/50'
                    : 'bg-studio-panel text-studio-fg border border-studio-border hover:bg-studio-panel-raised hover:border-brand/50 font-medium'
                }`}
              >
                {ratio}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-studio-border" />

      {/* Resolution Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-studio-muted block mb-1">Width (px)</label>
          <Input
            type="number"
            value={settings.width}
            onChange={(e) => handleCustomDimensionChange({ width: parseInt(e.target.value, 10) || 1920 })}
            className="h-8 text-xs font-mono"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-studio-muted block mb-1">Height (px)</label>
          <Input
            type="number"
            value={settings.height}
            onChange={(e) => handleCustomDimensionChange({ height: parseInt(e.target.value, 10) || 1080 })}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Frame Rate */}
      <div>
        <label className="text-xs font-medium text-studio-muted block mb-1.5">Project Frame Rate (FPS)</label>
        <FpsDropdown
          value={settings.fps}
          onChange={(fps) => updateProjectSettings({ fps })}
        />
      </div>

      {/* Background Color */}
      <div>
        <label className="text-xs font-medium text-studio-muted block mb-1.5">Canvas Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.backgroundColor || '#000000'}
            onChange={(e) => updateProjectSettings({ backgroundColor: e.target.value })}
            className="h-8 w-12 rounded cursor-pointer border border-studio-border bg-studio-panel p-0.5"
          />
          <span className="font-mono text-xs text-studio-muted">{settings.backgroundColor}</span>
        </div>
      </div>

      <div className="h-px bg-studio-border" />

      {/* Master Volume */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-studio-muted flex items-center gap-1">
            <Volume2 className="h-3.5 w-3.5 text-mkt-success" /> Master Volume
          </label>
          <span className="font-mono text-xs text-studio-fg">{Math.round(settings.masterVolume * 100)}%</span>
        </div>
        <Slider
          value={settings.masterVolume}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(val) => updateProjectSettings({ masterVolume: val })}
        />
      </div>

      <div className="h-px bg-studio-border mt-1" />

      {/* Reset Canvas Settings Action */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleResetCanvasSettings}
        className="w-full h-8 gap-1.5 text-xs text-studio-muted hover:text-studio-fg hover:bg-studio-panel-raised cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reset Canvas Settings</span>
      </Button>
    </div>
  );
}
