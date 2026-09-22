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

export interface StudioToolRailProps {
  onToolSelect?: () => void;
}

export function StudioToolRail({ onToolSelect }: StudioToolRailProps = {}) {
  const { activeTool, setActiveTool, clearSelection } = useEditorUIStore();

  return (
    <aside className="flex h-full w-[64px] shrink-0 flex-col items-center gap-1.5 border-r border-studio-border bg-studio-panel py-2.5 text-studio-muted select-none overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {railItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTool === item.id || (activeTool === 'select' && item.id === 'media');

        return (
          <Tooltip key={item.id} content={item.label} position="right" delayMs={150}>
            <button
              type="button"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                onToolSelect?.();
                setActiveTool(item.id as EditorTool);
                clearSelection();
              }}
              className={cn(
                'relative flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-colors cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40',
                isActive
                  ? 'bg-white/10 text-white font-semibold shadow-xs'
                  : 'text-studio-muted hover:bg-white/5 hover:text-white'
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
