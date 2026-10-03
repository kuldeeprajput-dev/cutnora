"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  Check,
  Type,
  Subtitles,
  Quote,
  Flame,
  Tag,
} from "lucide-react";
import type { TextPresetCategory } from "../data/text-presets";

export type CategoryFilter = "all" | TextPresetCategory;

export interface CategoryOption {
  id: CategoryFilter;
  label: string;
  icon: React.ElementType;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: "all", label: "All Categories", icon: Sparkles },
  { id: "basic", label: "Basic Text", icon: Type },
  { id: "captions", label: "Captions & Badges", icon: Subtitles },
  { id: "labels", label: "Labels & Lower Thirds", icon: Tag },
  { id: "creative", label: "Creative & Script", icon: Quote },
  { id: "effects", label: "Effects & Memes", icon: Flame },
];

export interface TextCategoryFilterProps {
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  presetCount: number;
}

export function TextCategoryFilter({
  activeCategory,
  onCategoryChange,
  presetCount,
}: TextCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedObj =
    CATEGORY_OPTIONS.find((c) => c.id === activeCategory) ||
    CATEGORY_OPTIONS[0];
  const Icon = selectedObj.icon;

  return (
    <div className="flex flex-col gap-2">
      <div ref={dropdownRef} className="relative w-full shrink-0">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex min-h-11 lg:min-h-9 w-full items-center justify-between rounded-xl border bg-studio-panel-raised/60 px-3 text-xs text-studio-fg transition-all cursor-pointer select-none ${
            isOpen
              ? "border-studio-fg/30 ring-1 ring-studio-fg/30 bg-studio-hover"
              : "border-studio-border hover:border-studio-border-strong hover:bg-studio-hover"
          }`}
        >
          <span className="flex items-center gap-2 font-medium text-studio-fg truncate">
            <Icon className="h-3.5 w-3.5 text-studio-muted shrink-0" />
            <span className="truncate">{selectedObj.label}</span>
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-studio-muted shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            role="menu"
            aria-label="Category options"
            className="absolute left-0 top-full mt-1.5 z-50 w-full rounded-xl border border-studio-border bg-studio-panel p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
          >
            <div className="space-y-0.5 max-h-56 overflow-y-auto">
              {CATEGORY_OPTIONS.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    onClick={() => {
                      onCategoryChange(cat.id);
                      setIsOpen(false);
                    }}
                    className={`flex min-h-10 lg:min-h-8 w-full items-center justify-between rounded-lg px-2.5 text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? "bg-studio-hover text-studio-fg font-semibold"
                        : "text-studio-fg/90 hover:bg-studio-hover hover:text-studio-fg"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium truncate">
                      <CatIcon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected ? "text-studio-fg" : "text-studio-muted"
                        }`}
                      />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-studio-fg stroke-[2.5] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-studio-muted">{presetCount} text styles</p>
    </div>
  );
}
