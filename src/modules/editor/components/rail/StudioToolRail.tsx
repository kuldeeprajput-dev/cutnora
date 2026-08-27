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
    <aside className="flex h-full w-[64px] shrink-0 flex-col items-center gap-2 border-r border-studio-border bg-studio-topbar py-3 text-studio-muted select-none">
      {railItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTool === item.id || (activeTool === 'select' && item.id === 'media');

        return (
          <Tooltip key={item.id} content={item.label} position="right" delayMs={200}>
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
                'relative flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-studio-topbar',
                isActive
                  ? 'bg-brand/15 text-brand font-semibold'
                  : 'hover:bg-studio-panel-raised hover:text-studio-fg'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -left-1.5 h-5 w-0.5 rounded-full bg-brand transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-0'
                )}
              />
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          </Tooltip>
        );
      })}
    </aside>
  );
}
