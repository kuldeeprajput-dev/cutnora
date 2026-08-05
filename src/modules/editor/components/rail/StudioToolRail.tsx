'use client';

import React from 'react';
import {
  FolderPlus,
  Layout,
  Type,
  Music,
  Video,
  Image as ImageIcon,
  Shapes,
  Mic,
} from 'lucide-react';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import type { EditorTool } from '@/modules/editor/types';
import { Tooltip } from '@/shared/components/ui/Tooltip';
import { cn } from '@/shared/utils/cn';

interface RailItem {
  id: EditorTool | 'media' | 'canvas' | 'text' | 'audio' | 'videos' | 'images' | 'elements' | 'record';
  label: string;
  icon: React.ElementType;
}

const railItems: RailItem[] = [
  { id: 'media', label: 'Media', icon: FolderPlus },
  { id: 'canvas', label: 'Canvas', icon: Layout },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'elements', label: 'Elements', icon: Shapes },
  { id: 'record', label: 'Record', icon: Mic },
];

export function StudioToolRail() {
  const { activeTool, setActiveTool } = useEditorUIStore();

  return (
    <aside className="flex h-full w-[64px] shrink-0 flex-col items-center gap-2 border-r border-[#2B2F38] bg-[#14161B] py-3 text-[#9298A3] select-none">
      {railItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTool === item.id || (activeTool === 'select' && item.id === 'media');

        return (
          <Tooltip key={item.id} content={item.label} position="right" delayMs={200}>
            <button
              type="button"
              aria-label={item.label}
              onClick={() => setActiveTool(item.id as EditorTool)}
              className={cn(
                'flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36] focus-visible:ring-offset-1 focus-visible:ring-offset-[#14161B]',
                isActive
                  ? 'bg-[#FF5A36]/15 text-[#FF5A36] font-semibold'
                  : 'hover:bg-[#1D2027] hover:text-[#F4F5F7]'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          </Tooltip>
        );
      })}
    </aside>
  );
}
