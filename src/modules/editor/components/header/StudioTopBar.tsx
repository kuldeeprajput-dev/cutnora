'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Undo2, Redo2, Download, Check, AlertCircle, Loader2, HelpCircle } from 'lucide-react';
import { useProjectStore, autosaveService, type SaveStatus } from '@/modules/projects';
import { useExportStore } from '@/modules/editor/store/useExportStore';
import { historyManager } from '@/modules/editor/store/useHistoryStore';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Button } from '@/shared/components/ui/Button';

export interface StudioTopBarProps {
  onOpenHelp?: () => void;
}

import { Wrench } from 'lucide-react';
import { useToastStore } from '@/shared/components/ui/Toast/useToastStore';

export function StudioTopBar({ onOpenHelp }: StudioTopBarProps) {
  const { currentProject, undo, redo, repairProjectReferences } = useProjectStore();

  const handleRepair = async () => {
    if (confirm("Scan and repair project references? Invalid or missing asset links will be safely cleaned up.")) {
      const fixed = await repairProjectReferences();
      useToastStore.getState().showToast(fixed > 0 ? `Repaired ${fixed} reference(s)` : 'Project references healthy', fixed > 0 ? 'success' : 'info');
    }
  };
  const { setExportModalOpen } = useExportStore();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    return autosaveService.subscribe((status) => {
      setSaveStatus(status);
    });
  }, []);

  useEffect(() => {
    if (currentProject) {
      setNameInput(currentProject.name);
    }
  }, [currentProject]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (currentProject && nameInput.trim() && nameInput !== currentProject.name) {
      useProjectStore.setState((state) => {
        if (state.currentProject) {
          state.currentProject.name = nameInput.trim();
        }
      });
      autosaveService.scheduleSave(currentProject);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      if (currentProject) setNameInput(currentProject.name);
    }
  };

  const hasClips = currentProject?.tracks.some((track) => track.clips.length > 0) ?? false;
  const canUndo = historyManager.canUndo();
  const canRedo = historyManager.canRedo();

  return (
    <header className="flex h-[56px] w-full shrink-0 items-center justify-between border-b border-[#2B2F38] bg-[#14161B] px-4 text-[#F4F5F7] select-none">
      {/* Left: Cutframe Logo & Title & Autosave Status */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 group" title="Return to home">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="#FF5A36" />
            <path
              d="M10 8L22 8C23.1046 8 24 8.89543 24 10V22C24 23.1046 23.1046 24 22 24H10C8.89543 24 8 23.1046 8 22V10C8 8.89543 8.89543 8 10 8Z"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M14 12L20 16L14 20V12Z" fill="white" />
          </svg>
          <span className="text-base font-bold tracking-tight text-[#F4F5F7]">Cutframe</span>
        </Link>

        <div className="h-4 w-px bg-[#2B2F38]" />

        {/* Editable Project Name */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="h-7 rounded border border-[#FF5A36] bg-[#171A20] px-2 text-xs font-semibold text-[#F4F5F7] focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              title="Click to rename project"
              className="rounded px-1.5 py-0.5 text-xs font-semibold text-[#F4F5F7] hover:bg-[#1D2027] transition-colors"
            >
              {currentProject?.name || 'Untitled video'}
            </button>
          )}

          {/* Autosave Status Indicator */}
          <div className="flex items-center gap-1 text-[11px] text-[#9298A3]">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1 text-[#F2C94C]">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-[#248A5A]" title="All changes saved to IndexedDB">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="inline-flex items-center gap-1 text-[#E45858]" title="Save error">
                <AlertCircle className="h-3 w-3" /> Save Error
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Undo & Redo Controls */}
      <div className="flex items-center gap-1">
        <IconButton
          label="Undo (Ctrl+Z)"
          size="sm"
          variant="ghost"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 className="h-4 w-4" />
        </IconButton>
        <IconButton
          label="Redo (Ctrl+Y)"
          size="sm"
          variant="ghost"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 className="h-4 w-4" />
        </IconButton>
      </div>

      {/* Right: Help & Export Action Button */}
      <div className="flex items-center gap-2">
        <IconButton
          label="Repair project references"
          size="sm"
          variant="ghost"
          onClick={handleRepair}
        >
          <Wrench className="h-4 w-4" />
        </IconButton>

        <IconButton
          label="Keyboard Shortcuts (?)"
          size="sm"
          variant="ghost"
          onClick={onOpenHelp}
        >
          <HelpCircle className="h-4 w-4" />
        </IconButton>

        <Button
          size="sm"
          variant="primary"
          disabled={!hasClips}
          onClick={() => setExportModalOpen(true)}
          title={hasClips ? 'Export video' : 'Add clips to timeline before exporting'}
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </Button>
      </div>
    </header>
  );
}
