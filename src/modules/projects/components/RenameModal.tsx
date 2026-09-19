"use client";

import React, { useState, useEffect } from "react";

export interface RenameModalProps {
  isOpen: boolean;
  initialName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export function RenameModal({
  isOpen,
  initialName,
  onClose,
  onSave,
}: RenameModalProps) {
  const [inputName, setInputName] = useState(initialName);

  useEffect(() => {
    setInputName(initialName);
  }, [initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-800/80 bg-[#111113] p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header without cross icon */}
        <div className="pb-4">
          <h3 className="text-base font-semibold text-white">Rename project</h3>
        </div>

        <form onSubmit={handleSubmit} className="mt-1">
          <label className="block text-xs text-zinc-400 font-normal mb-2">
            New name
          </label>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-zinc-800 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />

          {/* Footer Divider & Buttons */}
          <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-800 bg-transparent px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#e4e4e7] px-4 py-2 text-xs font-semibold text-black hover:bg-white active:scale-95 transition-all cursor-pointer"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
