"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const THEME_STORAGE_KEY = "cutnora_theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0d0d0d" : "#fafafa");
  window.dispatchEvent(
    new CustomEvent("cutnora-theme-change", { detail: theme }),
  );
}

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    const isDark =
      document.documentElement.dataset.theme === "dark" ||
      document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const onThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<"light" | "dark">;
      setTheme(
        customEvent.detail ||
          (document.documentElement.classList.contains("dark") ? "dark" : "light"),
      );
    };

    window.addEventListener("cutnora-theme-change", onThemeChange);
    return () =>
      window.removeEventListener("cutnora-theme-change", onThemeChange);
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark =
      document.documentElement.dataset.theme === "dark" ||
      document.documentElement.classList.contains("dark");
    const nextTheme = isCurrentlyDark ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  const title = mounted
    ? theme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode"
    : "Switch color theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={title}
      className={cn(
        "theme-toggle inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center gap-2 rounded-full border border-zinc-300/80 bg-white/90 text-zinc-700 shadow-xs transition-colors duration-200 cursor-pointer hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 dark:border-[#DEDEDE]/15 dark:bg-mkt-surface dark:text-[#DEDEDE] dark:shadow-none dark:hover:border-[#DEDEDE]/35 dark:hover:bg-mkt-surface-secondary dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-mkt-bg",
        className,
      )}
    >
      <Moon
        className="theme-icon--light h-4 w-4 pointer-events-none transition-transform duration-300"
        aria-hidden="true"
      />
      <Sun
        className="theme-icon--dark h-4 w-4 pointer-events-none transition-transform duration-300"
        aria-hidden="true"
      />
      {showLabel ? <span className="text-xs font-semibold">Theme</span> : null}
    </button>
  );
}
