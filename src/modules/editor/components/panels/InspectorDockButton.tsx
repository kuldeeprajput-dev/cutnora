"use client";

import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { useEditorUIStore } from "@/modules/editor/store/useEditorUIStore";

export function InspectorDockButton() {
  const side = useEditorUIStore((state) => state.clipInspectorSide);
  const setSide = useEditorUIStore((state) => state.setClipInspectorSide);
  const destination = side === "left" ? "right" : "left";
  const Icon = side === "left" ? PanelRightOpen : PanelLeftOpen;
  const label = `Dock Clip Properties on the ${destination}`;

  return (
    <button
      type="button"
      data-clip-dock-button
      aria-label={label}
      title={label}
      onClick={() => {
        setSide(destination);
        requestAnimationFrame(() => {
          document
            .querySelector<HTMLButtonElement>("[data-clip-dock-button]")
            ?.focus({ preventScroll: true });
        });
      }}
      className="hidden h-7 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-studio-border bg-studio-panel-raised/60 px-2 text-[11px] font-medium text-studio-muted transition-colors hover:border-studio-border-strong hover:bg-studio-hover hover:text-studio-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:flex"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Dock {destination}</span>
    </button>
  );
}
