'use client';

import React, { useState } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { COMMAND_REGISTRY, type CommandCategory } from '@/modules/editor/commands/command-registry';
import { Search, Keyboard, Play, Scissors, Navigation, HelpCircle, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CommandCategory | 'all'>('all');

  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);

  const getShortcutParts = (shortcutStr: string): string[] => {
    return shortcutStr.split('+').map((part) => {
      switch (part) {
        case 'Mod':
          return isMac ? '⌘' : 'Ctrl';
        case 'Shift':
          return isMac ? '⇧' : 'Shift';
        case 'Alt':
          return isMac ? '⌥' : 'Alt';
        case 'Escape':
          return 'Esc';
        case 'ArrowLeft':
          return '←';
        case 'ArrowRight':
          return '→';
        case 'Plus':
          return '+';
        case 'Minus':
          return '-';
        case 'Space':
          return 'Space';
        case 'Delete':
          return 'Del';
        default:
          return part;
      }
    });
  };

  const categories: { id: CommandCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Commands', icon: <Keyboard className="h-3.5 w-3.5" /> },
    { id: 'playback', label: 'Playback', icon: <Play className="h-3.5 w-3.5" /> },
    { id: 'editing', label: 'Editing', icon: <Scissors className="h-3.5 w-3.5" /> },
    { id: 'navigation', label: 'Navigation', icon: <Navigation className="h-3.5 w-3.5" /> },
    { id: 'help', label: 'Help', icon: <HelpCircle className="h-3.5 w-3.5" /> },
  ];

  const filteredCommands = COMMAND_REGISTRY.filter((cmd) => {
    const matchesCategory = activeCategory === 'all' || cmd.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const parts = getShortcutParts(cmd.shortcut);
    const readableShortcut = parts.join(' ').toLowerCase();
    const joinedShortcut = parts.join('+').toLowerCase();
    const matchesSearch =
      !q ||
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.shortcut.toLowerCase().includes(q) ||
      readableShortcut.includes(q) ||
      joinedShortcut.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Quickly navigate and edit your project with hotkeys"
      className="max-w-3xl no-scrollbar"
    >
      <div className="flex flex-col gap-3.5">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-studio-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands or keyboard shortcuts..."
            className="h-10 w-full rounded-xl border border-studio-border bg-studio-panel-raised/50 pl-10 pr-9 text-xs text-studio-fg placeholder:text-studio-muted focus:border-studio-border-strong focus:bg-studio-panel-raised focus:outline-none transition-colors"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 rounded-md p-1 text-studio-muted hover:text-studio-fg hover:bg-studio-hover transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-0.5">
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? COMMAND_REGISTRY.length
                : COMMAND_REGISTRY.filter((c) => c.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap select-none',
                  isActive
                    ? 'bg-studio-fg text-studio-bg shadow-xs font-semibold'
                    : 'text-studio-muted hover:bg-studio-panel-raised hover:text-studio-fg'
                )}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span
                  className={cn(
                    'ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                    isActive
                      ? 'bg-studio-bg/20 text-studio-bg'
                      : 'bg-studio-panel-raised text-studio-muted'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shortcuts List with no-scrollbar */}
        <div className="max-h-[380px] overflow-y-auto no-scrollbar flex flex-col gap-2 pr-0.5">
          {filteredCommands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-8 w-8 text-studio-muted/40 mb-2" />
              <p className="text-xs font-medium text-studio-fg">No matching commands found</p>
              <p className="text-[11px] text-studio-muted mt-0.5">
                Try searching for a different keyword or category
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-studio-fg underline underline-offset-4 hover:text-studio-muted transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const parts = getShortcutParts(cmd.shortcut);
              return (
                <div
                  key={cmd.id}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-studio-border/70 bg-studio-panel-raised/40 px-3.5 py-2.5 transition-all duration-150 hover:bg-studio-panel-raised/90 hover:border-studio-border-strong hover:shadow-xs"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-medium text-studio-fg truncate">
                      {cmd.label}
                    </span>
                    <span className="text-[11px] text-studio-muted truncate mt-0.5">
                      {cmd.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 font-mono text-[11px] select-none">
                    {parts.map((part, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && (
                          <span className="text-[10px] text-studio-muted/60 font-sans">+</span>
                        )}
                        <kbd className="inline-flex min-w-[22px] h-6 items-center justify-center rounded-md border border-studio-border-strong/70 bg-studio-panel px-2 font-mono text-[11px] font-semibold text-studio-fg shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                          {part}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-studio-border/60 text-[11px] text-studio-muted">
          <div className="flex items-center gap-1.5">
            <span>
              Tip: Press{" "}
              <kbd className="inline-flex items-center justify-center rounded border border-studio-border-strong/70 bg-studio-panel px-1.5 py-0.5 font-mono text-[10px] font-semibold text-studio-fg shadow-xs">
                {isMac ? "⇧" : "Shift"}
              </kbd>{" "}
              +{" "}
              <kbd className="inline-flex items-center justify-center rounded border border-studio-border-strong/70 bg-studio-panel px-1.5 py-0.5 font-mono text-[10px] font-semibold text-studio-fg shadow-xs">
                ?
              </kbd>{" "}
              anywhere in the editor to open
            </span>
          </div>
          <span>
            {filteredCommands.length} {filteredCommands.length === 1 ? 'shortcut' : 'shortcuts'}
          </span>
        </div>
      </div>
    </Dialog>
  );
}
