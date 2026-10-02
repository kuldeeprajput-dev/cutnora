"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";

export function SidebarToggleButton({ floating = false }: { floating?: boolean }) {
  const collapsed = useEditorUIStore((state) => state.isLeftSidebarCollapsed);
  const setCollapsed = useEditorUIStore(
    (state) => state.setLeftSidebarCollapsed,
  );
  const label = collapsed ? "Show tools and panel" : "Collapse tools and panel";
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setCollapsed(!collapsed)}
      className={
        floating
          ? "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-studio-border bg-studio-panel text-studio-muted shadow-sm transition-colors hover:bg-studio-hover hover:text-studio-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          : "flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-studio-border bg-studio-panel-raised/60 text-studio-muted transition-colors hover:border-studio-border-strong hover:bg-studio-hover hover:text-studio-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      }
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
