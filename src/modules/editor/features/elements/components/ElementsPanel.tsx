'use client';

import React from 'react';
import { nanoid } from 'nanoid';
import { useProjectStore } from '@/modules/projects';
import { usePlaybackStore } from '@/modules/editor/store/usePlaybackStore';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import type { TimelineClip, ElementStyle } from '@/modules/editor/types';
import { Button } from '@/shared/components/ui/Button';
import { Square, Circle, Minus, ArrowRight, Triangle, MessageCircle, Sliders, SeparatorHorizontal } from 'lucide-react';

export interface ElementPreset {
  id: string;
  name: string;
  icon: React.ElementType;
  style: ElementStyle & { width: number; height: number };
}

const elementPresets: ElementPreset[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    icon: Square,
    style: {
      fillColor: '#FF5A36',
      borderRadius: 0,
      shapeType: 'rectangle',
      width: 300,
      height: 200,
    },
  },
  {
    id: 'rounded-rect',
    name: 'Rounded Box',
    icon: Square,
    style: {
      fillColor: '#F2C94C',
      borderRadius: 24,
      shapeType: 'rounded-rect',
      width: 300,
      height: 180,
    },
  },
  {
    id: 'circle',
    name: 'Circle',
    icon: Circle,
    style: {
      fillColor: '#3478D4',
      borderRadius: 999,
      shapeType: 'circle',
      width: 200,
      height: 200,
    },
  },
  {
    id: 'line',
    name: 'Divider Line',
    icon: Minus,
    style: {
      fillColor: '#F4F5F7',
      strokeColor: '#F4F5F7',
      strokeWidth: 4,
      lineStyle: 'solid',
      shapeType: 'line',
      width: 400,
      height: 20,
    },
  },
  {
    id: 'arrow',
    name: 'Arrow Banner',
    icon: ArrowRight,
    style: {
      fillColor: '#248A5A',
      strokeColor: '#248A5A',
      strokeWidth: 4,
      arrowHead: 'end',
      shapeType: 'arrow',
      width: 320,
      height: 80,
    },
  },
  {
    id: 'triangle',
    name: 'Triangle Badge',
    icon: Triangle,
    style: {
      fillColor: '#FF5A36',
      shapeType: 'triangle',
      width: 200,
      height: 200,
    },
  },
  {
    id: 'speech-bubble',
    name: 'Speech Bubble',
    icon: MessageCircle,
    style: {
      fillColor: '#171A20',
      strokeColor: '#FF5A36',
      strokeWidth: 3,
      borderRadius: 16,
      shapeType: 'speech-bubble',
      width: 350,
      height: 160,
    },
  },
  {
    id: 'progress-bar',
    name: 'Progress Bar',
    icon: Sliders,
    style: {
      fillColor: '#248A5A',
      strokeColor: '#1D2027',
      borderRadius: 12,
      shapeType: 'progress-bar',
      progress: 65,
      width: 500,
      height: 28,
    },
  },
  {
    id: 'divider',
    name: 'Accent Bar',
    icon: SeparatorHorizontal,
    style: {
      fillColor: '#FF5A36',
      borderRadius: 4,
      shapeType: 'divider',
      width: 250,
      height: 12,
    },
  },
];

export function ElementsPanel() {
  const { currentProject, addClip, addTrack } = useProjectStore();
  const { playhead } = usePlaybackStore();
  const { setSelectedClipIds } = useEditorUIStore();

  const handleAddElement = (preset: ElementPreset) => {
    if (!currentProject) return;

    // Find or create an overlay track
    let overlayTrack = currentProject.tracks.find((t) => t.type === 'overlay' || t.type === 'video');
    if (!overlayTrack) {
      addTrack('overlay', 'Graphics Track');
      const updatedTracks = useProjectStore.getState().currentProject?.tracks || [];
      overlayTrack = updatedTracks.find((t) => t.type === 'overlay');
    }

    if (!overlayTrack) return;

    const projW = currentProject.settings.width || 1920;
    const projH = currentProject.settings.height || 1080;
    const clipW = preset.style.width;
    const clipH = preset.style.height;

    // Center on stage
    const posX = Math.round((projW - clipW) / 2);
    const posY = Math.round((projH - clipH) / 2);

    const newClipId = nanoid();
    const newClip: TimelineClip = {
      id: newClipId,
      trackId: overlayTrack.id,
      type: 'overlay',
      timelineStart: playhead,
      timelineDuration: 5,
      sourceStart: 0,
      sourceDuration: 5,
      name: preset.name,
      elementStyle: {
        fillColor: preset.style.fillColor,
        strokeColor: preset.style.strokeColor,
        strokeWidth: preset.style.strokeWidth,
        borderRadius: preset.style.borderRadius,
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

    addClip(overlayTrack.id, newClip);
    setSelectedClipIds([newClipId]);
  };

  return (
    <div className="flex flex-col gap-4 p-4 text-studio-fg select-none">
      <h3 className="text-xs font-bold uppercase tracking-wider text-studio-muted">Shapes & Overlays</h3>
      <p className="text-[11px] text-studio-muted">Click any shape to add an SVG/CSS layer to your video stage.</p>

      <div className="grid grid-cols-2 gap-2">
        {elementPresets.map((preset) => {
          const Icon = preset.icon;
          return (
            <Button
              key={preset.id}
              variant="secondary"
              size="md"
              onClick={() => handleAddElement(preset)}
              className="justify-start gap-2 h-10 border border-studio-border hover:border-brand transition-colors text-xs"
            >
              <Icon className="h-4 w-4 text-brand shrink-0" />
              <span className="truncate">{preset.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
