'use client';

import React, { useState } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Input } from '@/shared/components/ui/Input';
import { COMMAND_REGISTRY, type CommandCategory } from '@/modules/editor/commands/command-registry';
import { Search, Keyboard, Play, Scissors, Navigation, HelpCircle } from 'lucide-react';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CommandCategory | 'all'>('all');

  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);

  const formatShortcut = (shortcut: string) => {
    return shortcut
      .replace(/Mod/g, isMac ? '⌘' : 'Ctrl')
      .replace(/Shift/g, 'Shift')
      .replace(/Alt/g, isMac ? '⌥' : 'Alt')
      .replace(/ArrowLeft/g, '←')
      .replace(/ArrowRight/g, '→')
      .replace(/Plus/g, '+')
      .replace(/Minus/g, '-');
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
    const matchesSearch =
      !q ||
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.shortcut.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" className="max-w-2xl">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-studio-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands or keyboard shortcuts..."
            className="pl-9 h-9 text-xs"
            autoFocus
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 border-b border-studio-border pb-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-brand text-white'
                  : 'text-studio-muted hover:bg-studio-panel-raised hover:text-studio-fg'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Shortcuts List */}
        <div className="max-h-[380px] overflow-y-auto pr-1 flex flex-col gap-1.5">
          {filteredCommands.length === 0 ? (
            <p className="text-center text-xs text-studio-muted py-8">No matching commands found.</p>
          ) : (
            filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-studio-border bg-studio-topbar p-2.5 hover:border-studio-border-strong transition-colors"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-studio-fg truncate">{cmd.label}</span>
                  <span className="text-[11px] text-studio-muted truncate">{cmd.description}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 font-mono text-[11px]">
                  {formatShortcut(cmd.shortcut)
                    .split('+')
                    .map((part, idx) => (
                      <kbd
                        key={idx}
                        className="rounded border border-studio-border-strong bg-studio-panel-raised px-2 py-0.5 font-bold text-studio-fg shadow-xs"
                      >
                        {part}
                      </kbd>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}
