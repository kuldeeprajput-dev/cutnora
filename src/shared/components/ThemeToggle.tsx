"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const THEME_STORAGE_KEY = "cutframe_theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#070707" : "#f8f9fb");
}

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const toggleTheme = () => {
    const current =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Switch color theme"
      title="Switch color theme"
      className={cn(
        "theme-toggle inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-mkt-border bg-mkt-surface px-3 text-mkt-fg transition-colors hover:bg-mkt-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-mkt-bg",
        className,
      )}
    >
      <Moon className="theme-icon--light h-4 w-4" aria-hidden="true" />
      <Sun className="theme-icon--dark h-4 w-4" aria-hidden="true" />
      {showLabel ? <span className="text-xs font-semibold">Theme</span> : null}
    </button>
  );
}
