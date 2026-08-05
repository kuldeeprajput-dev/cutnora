'use client';

import React from 'react';
import { nanoid } from 'nanoid';
import { useProjectStore } from '@/modules/projects';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import type { TimelineClip, TextStyle } from '@/modules/editor/types';
import { Button } from '@/shared/components/ui/Button';
import { Type, Quote, MessageSquare, Subtitles } from 'lucide-react';

export interface TextPreset {
  id: string;
  name: string;
  icon: React.ElementType;
  style: TextStyle & { width: number; height: number };
}

const textPresets: TextPreset[] = [
  {
    id: 'heading',
    name: 'Heading',
    icon: Type,
    style: {
      text: 'Add a Heading',
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
    id: 'subheading',
    name: 'Subheading',
    icon: Type,
    style: {
      text: 'Add a Subheading',
      fontSize: 40,
      fontFamily: 'Inter, sans-serif',
      color: '#F2C94C',
      textAlign: 'center',
      fontWeight: 'bold',
      width: 500,
      height: 80,
    },
  },
  {
    id: 'body',
    name: 'Body Text',
    icon: Type,
    style: {
      text: 'Add your body text here',
      fontSize: 28,
      fontFamily: 'Inter, sans-serif',
      color: '#F4F5F7',
      textAlign: 'center',
      fontWeight: 'normal',
      width: 400,
      height: 60,
    },
  },
  {
    id: 'caption',
    name: 'Caption',
    icon: Subtitles,
    style: {
      text: 'CAPTION TEXT',
      fontSize: 20,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      backgroundColor: '#F2C94C',
      textAlign: 'center',
      fontWeight: 'bold',
      width: 300,
      height: 40,
    },
  },
  {
    id: 'lower-third',
    name: 'Lower Third',
    icon: MessageSquare,
    style: {
      text: 'JOHN DOE • CREATIVE DIRECTOR',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      backgroundColor: 'rgba(21, 22, 25, 0.85)',
      textAlign: 'left',
      fontWeight: 'bold',
      width: 550,
      height: 60,
    },
  },
  {
    id: 'quote',
    name: 'Quote Block',
    icon: Quote,
    style: {
      text: '“Simplicity is the ultimate sophistication.”',
      fontSize: 32,
      fontFamily: 'Georgia, serif',
      color: '#FF5A36',
      textAlign: 'center',
      fontWeight: 'bold',
      width: 650,
      height: 120,
    },
  },
];

export function TextPanel() {
  const { currentProject, addClip, addTrack } = useProjectStore();
  const { playhead } = usePlaybackStore();
  const { setSelectedClipIds } = useEditorUIStore();

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
    <div className="flex flex-col gap-4 p-4 text-[#F4F5F7] select-none">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#9298A3]">Text Presets</h3>
      <p className="text-[11px] text-[#9298A3]">Click a preset to add text at the current playhead position.</p>

      <div className="flex flex-col gap-2">
        {textPresets.map((preset) => {
          const Icon = preset.icon;
          return (
            <Button
              key={preset.id}
              variant="secondary"
              size="md"
              onClick={() => handleAddPreset(preset)}
              className="justify-start gap-3 h-11 border border-[#2B2F38] hover:border-[#FF5A36] transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#101216] text-[#FF5A36]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#F4F5F7]">{preset.name}</span>
                <span className="text-[10px] text-[#9298A3] truncate max-w-[200px]">{preset.style.text}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
