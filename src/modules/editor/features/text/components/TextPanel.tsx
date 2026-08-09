'use client';

import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { useProjectStore } from '@/modules/projects';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import type { TimelineClip, TextStyle } from '@/modules/editor/types';
import { Search, Sparkles } from 'lucide-react';

export interface TextPreset {
  id: string;
  name: string;
  category: 'basic' | 'captions' | 'creative' | 'effects';
  previewText: string;
  previewClass?: string;
  previewInlineStyle?: React.CSSProperties;
  style: TextStyle & { width: number; height: number };
}

const textPresets: TextPreset[] = [
  {
    id: 'title-text',
    name: 'Title text',
    category: 'basic',
    previewText: 'Title text',
    previewInlineStyle: { fontFamily: 'Inter, sans-serif', fontWeight: 800, color: '#FFFFFF', fontSize: '13px' },
    style: {
      text: 'Title Text',
      fontSize: 64,
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
      width: 600,
      height: 100,
    },
  },
  {
    id: 'regular-text',
    name: 'Regular text',
    category: 'basic',
    previewText: 'Regular text',
    previewInlineStyle: { fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#D1D5DB', fontSize: '12px' },
    style: {
      text: 'Regular Text',
      fontSize: 36,
      fontFamily: 'Inter, sans-serif',
      color: '#E5E7EB',
      textAlign: 'center',
      fontWeight: 'normal',
      width: 500,
      height: 70,
    },
  },
  {
    id: 'hand-write',
    name: 'Hand Write',
    category: 'creative',
    previewText: 'Hand Write',
    previewInlineStyle: { fontFamily: 'Dancing Script, Caveat, Brush Script MT, cursive', fontWeight: 700, color: '#FFFFFF', fontSize: '15px' },
    style: {
      text: 'Hand Write',
      fontSize: 56,
      fontFamily: 'Dancing Script, Caveat, Brush Script MT, cursive',
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
      width: 550,
      height: 90,
    },
  },
  {
    id: 'italic-text',
    name: 'Italic Text',
    category: 'basic',
    previewText: 'Italic Text',
    previewInlineStyle: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#FFFFFF', fontSize: '13px' },
    style: {
      text: 'Italic Text',
      fontSize: 44,
      fontFamily: 'Georgia, serif',
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'normal',
      fontStyle: 'italic',
      width: 480,
      height: 80,
    },
  },
  {
    id: 'underline-text',
    name: 'Underline',
    category: 'basic',
    previewText: 'Underline',
    previewInlineStyle: { fontFamily: 'Inter, sans-serif', textDecoration: 'underline', fontWeight: 700, color: '#FFFFFF', fontSize: '13px' },
    style: {
      text: 'Underline Text',
      fontSize: 42,
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
      textDecoration: 'underline',
      width: 520,
      height: 80,
    },
  },
  {
    id: 'uppercase-text',
    name: 'UPPERCASE',
    category: 'basic',
    previewText: 'UPPERCASE',
    previewInlineStyle: { fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, color: '#FFFFFF', fontSize: '11px' },
    style: {
      text: 'UPPERCASE TEXT',
      fontSize: 40,
      fontFamily: 'Oswald, sans-serif',
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 4,
      width: 550,
      height: 80,
    },
  },
  {
    id: 'rounded-badge',
    name: 'Rounded',
    category: 'captions',
    previewText: 'Rounded',
    previewInlineStyle: { backgroundColor: '#3b4252', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 },
    style: {
      text: 'Rounded Badge',
      fontSize: 32,
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      backgroundColor: '#3b4252',
      bgRadius: 8,
      bgPadding: 10,
      textAlign: 'center',
      fontWeight: 'bold',
      width: 400,
      height: 65,
    },
  },
  {
    id: 'black-box',
    name: 'BLACK',
    category: 'captions',
    previewText: 'BLACK',
    previewInlineStyle: { backgroundColor: '#000000', color: '#FFFFFF', padding: '3px 10px', fontWeight: 900, fontSize: '11px', letterSpacing: '1px' },
    style: {
      text: 'BLACK BOX',
      fontSize: 40,
      fontFamily: 'Impact, sans-serif',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      bgRadius: 4,
      bgPadding: 12,
      textAlign: 'center',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      width: 450,
      height: 75,
    },
  },
  {
    id: 'white-box',
    name: 'WHITE',
    category: 'captions',
    previewText: 'WHITE',
    previewInlineStyle: { backgroundColor: '#FFFFFF', color: '#000000', padding: '3px 10px', fontWeight: 900, fontSize: '11px', letterSpacing: '1px' },
    style: {
      text: 'WHITE BOX',
      fontSize: 40,
      fontFamily: 'Impact, sans-serif',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      bgRadius: 4,
      bgPadding: 12,
      textAlign: 'center',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      width: 450,
      height: 75,
    },
  },
  {
    id: 'classic-serif',
    name: 'Classic',
    category: 'basic',
    previewText: 'Classic',
    previewInlineStyle: { fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, color: '#FFFFFF', fontSize: '14px' },
    style: {
      text: 'Classic Elegance',
      fontSize: 48,
      fontFamily: 'Playfair Display, Georgia, serif',
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
      width: 550,
      height: 90,
    },
  },
  {
    id: 'meme-text',
    name: 'MEME TEXT',
    category: 'effects',
    previewText: 'MEME TEXT',
    previewInlineStyle: { fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', color: '#FFFFFF', fontSize: '12px', letterSpacing: '1px', textShadow: '0 2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 -2px 0 #000' },
    style: {
      text: 'MEME TEXT HERE',
      fontSize: 54,
      fontFamily: 'Impact, sans-serif',
      color: '#FFFFFF',
      outlineWidth: 3,
      outlineColor: '#000000',
      textAlign: 'center',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      width: 600,
      height: 95,
    },
  },
  {
    id: 'spacing-text',
    name: 'Spacing',
    category: 'creative',
    previewText: 'S p a c i n g',
    previewInlineStyle: { fontFamily: 'Inter, sans-serif', letterSpacing: '4px', textTransform: 'uppercase', color: '#FFFFFF', fontSize: '10px', fontWeight: 300 },
    style: {
      text: 'WIDE SPACING',
      fontSize: 32,
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      letterSpacing: 8,
      textAlign: 'center',
      fontWeight: 'normal',
      textTransform: 'uppercase',
      width: 550,
      height: 70,
    },
  },
  {
    id: 'manuscript-script',
    name: 'Manuscript',
    category: 'creative',
    previewText: 'Manuscript',
    previewInlineStyle: { fontFamily: 'Great Vibes, Brush Script MT, cursive', fontStyle: 'italic', color: '#FFFFFF', fontSize: '15px' },
    style: {
      text: 'Manuscript Style',
      fontSize: 52,
      fontFamily: 'Great Vibes, Brush Script MT, cursive',
      color: '#FFFFFF',
      fontStyle: 'italic',
      textAlign: 'center',
      fontWeight: 'bold',
      width: 550,
      height: 90,
    },
  },
  {
    id: 'strict-heavy',
    name: 'STRICT',
    category: 'creative',
    previewText: 'STRICT',
    previewInlineStyle: { fontFamily: 'Oswald, Impact, sans-serif', textTransform: 'uppercase', fontWeight: 900, color: '#FFFFFF', fontSize: '13px', letterSpacing: '0.5px' },
    style: {
      text: 'STRICT BOLD',
      fontSize: 48,
      fontFamily: 'Oswald, Impact, sans-serif',
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      width: 500,
      height: 85,
    },
  },
  {
    id: 'cheerful-playful',
    name: 'Cheerful',
    category: 'creative',
    previewText: 'Cheerful',
    previewInlineStyle: { fontFamily: 'Pacifico, Comic Sans MS, cursive', color: '#FFFFFF', fontSize: '13px' },
    style: {
      text: 'Cheerful Vibe',
      fontSize: 44,
      fontFamily: 'Pacifico, Comic Sans MS, cursive',
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'normal',
      width: 500,
      height: 80,
    },
  },
  {
    id: 'neon-glow',
    name: 'Neon Pink',
    category: 'effects',
    previewText: 'NEON',
    previewInlineStyle: { fontFamily: 'Impact, sans-serif', color: '#ff2a85', textShadow: '0 0 8px #ff2a85, 0 0 16px #ff2a85', fontSize: '13px', letterSpacing: '1px' },
    style: {
      text: 'NEON GLOW',
      fontSize: 48,
      fontFamily: 'Impact, sans-serif',
      color: '#ff2a85',
      shadowColor: '#ff2a85',
      shadowBlur: 20,
      textAlign: 'center',
      fontWeight: 'bold',
      width: 520,
      height: 90,
    },
  },
  {
    id: 'cyberpunk-style',
    name: 'Cyberpunk',
    category: 'effects',
    previewText: 'CYBER',
    previewInlineStyle: { backgroundColor: '#000000', color: '#ffe600', padding: '2px 6px', fontSize: '11px', fontWeight: 900, borderLeft: '2px solid #ffe600' },
    style: {
      text: 'CYBERPUNK 2077',
      fontSize: 40,
      fontFamily: 'Oswald, sans-serif',
      color: '#ffe600',
      backgroundColor: '#000000',
      bgRadius: 2,
      bgPadding: 10,
      textAlign: 'center',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      width: 520,
      height: 80,
    },
  },
  {
    id: 'yellow-subtitle',
    name: 'Subtitle',
    category: 'captions',
    previewText: 'SUBTITLE',
    previewInlineStyle: { backgroundColor: 'rgba(0,0,0,0.85)', color: '#ffe600', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 },
    style: {
      text: 'CAPTION SUBTITLE HERE',
      fontSize: 28,
      fontFamily: 'Inter, sans-serif',
      color: '#ffe600',
      backgroundColor: 'rgba(0,0,0,0.85)',
      bgRadius: 6,
      bgPadding: 8,
      textAlign: 'center',
      fontWeight: 'bold',
      width: 550,
      height: 60,
    },
  },
  {
    id: 'lower-third',
    name: 'Lower Third',
    category: 'captions',
    previewText: 'LOWER THIRD',
    previewInlineStyle: { backgroundColor: 'rgba(21,22,25,0.9)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, borderLeft: '2px solid #ff5500' },
    style: {
      text: 'JOHN DOE • CREATIVE DIRECTOR',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      backgroundColor: 'rgba(21, 22, 25, 0.9)',
      bgRadius: 6,
      bgPadding: 10,
      textAlign: 'left',
      fontWeight: 'bold',
      width: 550,
      height: 60,
    },
  },
  {
    id: 'quote-block',
    name: 'Quote Block',
    category: 'creative',
    previewText: '“Quote”',
    previewInlineStyle: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#ff5a36', fontSize: '13px', fontWeight: 700 },
    style: {
      text: '“Simplicity is the ultimate sophistication.”',
      fontSize: 32,
      fontFamily: 'Georgia, serif',
      color: '#ff5a36',
      textAlign: 'center',
      fontWeight: 'bold',
      fontStyle: 'italic',
      width: 650,
      height: 120,
    },
  },
  {
    id: 'gradient-orange',
    name: 'Gradient',
    category: 'effects',
    previewText: 'GRADIENT',
    previewInlineStyle: { color: '#ff5500', fontWeight: 900, fontSize: '11px', letterSpacing: '1px', textShadow: '0 0 6px rgba(255,85,0,0.6)' },
    style: {
      text: 'GRADIENT VIBE',
      fontSize: 46,
      fontFamily: 'Inter, sans-serif',
      color: '#ff5500',
      shadowColor: '#ff5500',
      shadowBlur: 12,
      textAlign: 'center',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      width: 520,
      height: 85,
    },
  },
  {
    id: 'retro-80s',
    name: 'Retro 80s',
    category: 'effects',
    previewText: 'RETRO 80s',
    previewInlineStyle: { fontFamily: 'Impact, sans-serif', fontStyle: 'italic', color: '#00f0ff', fontSize: '12px', textShadow: '0 0 6px #ff0055' },
    style: {
      text: 'RETRO SYNTH',
      fontSize: 48,
      fontFamily: 'Impact, sans-serif',
      color: '#00f0ff',
      shadowColor: '#ff0055',
      shadowBlur: 15,
      textAlign: 'center',
      fontWeight: 'bold',
      fontStyle: 'italic',
      width: 520,
      height: 85,
    },
  },
  {
    id: 'approved-stamp',
    name: 'STAMP',
    category: 'effects',
    previewText: 'STAMP',
    previewInlineStyle: { color: '#ff3333', border: '1.5px solid #ff3333', padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 900, letterSpacing: '2px' },
    style: {
      text: 'APPROVED',
      fontSize: 36,
      fontFamily: 'Impact, sans-serif',
      color: '#ff3333',
      outlineWidth: 2,
      outlineColor: '#ff3333',
      textAlign: 'center',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 4,
      width: 400,
      height: 70,
    },
  },
  {
    id: 'minimal-tag',
    name: 'Minimal Tag',
    category: 'captions',
    previewText: '#TAG',
    previewInlineStyle: { backgroundColor: '#ff5500', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700 },
    style: {
      text: '#TRENDING',
      fontSize: 26,
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      backgroundColor: '#ff5500',
      bgRadius: 20,
      bgPadding: 6,
      textAlign: 'center',
      fontWeight: 'bold',
      width: 350,
      height: 55,
    },
  },
];

type CategoryFilter = 'all' | 'basic' | 'captions' | 'creative' | 'effects';

export function TextPanel() {
  const { currentProject, addClip, addTrack } = useProjectStore();
  const { playhead } = usePlaybackStore();
  const { setSelectedClipIds } = useEditorUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filteredPresets = textPresets.filter((preset) => {
    const matchesCategory = activeCategory === 'all' || preset.category === activeCategory;
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          preset.previewText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddPreset = (preset: TextPreset) => {
    if (!currentProject) return;

    // Find or create a text track
    let textTrack = currentProject.tracks.find((t) => t.type === 'text');
    if (!textTrack) {
      addTrack('text', 'Text Track');
      const updatedTracks = useProjectStore.getState().currentProject?.tracks || [];
      textTrack = updatedTracks.find((t) => t.type === 'text');
    }

    if (!textTrack) return;

    const projW = currentProject.settings.width || 1920;
    const projH = currentProject.settings.height || 1080;
    const clipW = preset.style.width;
    const clipH = preset.style.height;

    // Center on stage
    const posX = Math.round((projW - clipW) / 2);
    const posY = preset.id === 'lower-third' ? Math.round(projH * 0.75) : Math.round((projH - clipH) / 2);

    const newClipId = nanoid();
    const newClip: TimelineClip = {
      id: newClipId,
      trackId: textTrack.id,
      type: 'text',
      timelineStart: playhead,
      timelineDuration: 5,
      sourceStart: 0,
      sourceDuration: 5,
      name: preset.style.text,
      textStyle: {
        text: preset.style.text,
        fontSize: preset.style.fontSize,
        fontFamily: preset.style.fontFamily,
        color: preset.style.color,
        backgroundColor: preset.style.backgroundColor,
        textAlign: preset.style.textAlign,
        fontWeight: preset.style.fontWeight,
        fontStyle: preset.style.fontStyle,
        textDecoration: preset.style.textDecoration,
        textTransform: preset.style.textTransform,
        letterSpacing: preset.style.letterSpacing,
        bgPadding: preset.style.bgPadding,
        bgRadius: preset.style.bgRadius,
        outlineColor: preset.style.outlineColor,
        outlineWidth: preset.style.outlineWidth,
        shadowColor: preset.style.shadowColor,
        shadowBlur: preset.style.shadowBlur,
      },
      transform: {
        x: posX,
        y: posY,
        width: clipW,
        height: clipH,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        fitMode: 'contain',
      },
      adjustments: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blur: 0,
        grayscale: 0,
        sepia: 0,
      },
      audio: {
        volume: 1,
        muted: false,
        fadeIn: 0,
        fadeOut: 0,
      },
      speed: 1,
    };

    addClip(textTrack.id, newClip);
    setSelectedClipIds([newClipId]);
  };

  return (
    <div className="flex flex-col gap-3 p-3 text-studio-fg select-none h-full overflow-y-auto studio-scrollbar">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-studio-muted" />
        <input
          type="text"
          placeholder="Search text styles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8.5 w-full rounded-lg border border-studio-border bg-studio-bg pl-8 pr-3 text-xs text-studio-fg placeholder:text-studio-muted focus:border-brand focus:outline-none transition-colors"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto studio-scrollbar pb-1 text-[11px]">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'basic', label: 'Basic' },
            { id: 'captions', label: 'Captions' },
            { id: 'creative', label: 'Creative' },
            { id: 'effects', label: 'Effects' },
          ] as const
        ).map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-md min-w-max cursor-pointer font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-brand text-white font-bold shadow-sm'
                : 'bg-studio-panel hover:bg-studio-panel-raised text-studio-muted hover:text-studio-fg border border-studio-border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Text Style Cards (3 Columns) */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleAddPreset(preset)}
            className="group relative flex h-20 flex-col items-center justify-between rounded-lg border border-studio-border bg-[#18191c] p-2 text-center cursor-pointer transition-all duration-150 hover:border-brand hover:bg-[#202226] hover:scale-[1.03] active:scale-[0.98] shadow-sm overflow-hidden"
          >
            {/* Visual Preview Container */}
            <div className="flex flex-1 w-full items-center justify-center overflow-hidden">
              <span style={preset.previewInlineStyle} className="truncate max-w-full leading-tight">
                {preset.previewText}
              </span>
            </div>

            {/* Tiny Label Badge at Bottom */}
            <span className="text-[9px] font-semibold text-studio-muted group-hover:text-brand transition-colors truncate max-w-full">
              {preset.name}
            </span>
          </button>
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center text-studio-muted">
          <Sparkles className="h-8 w-8 mb-2 opacity-50 text-brand" />
          <p className="text-xs font-semibold">No text styles found</p>
          <p className="text-[10px] opacity-75">Try searching for a different keyword</p>
        </div>
      )}
    </div>
  );
}
