import React from "react";
import { cn } from "@/shared/utils/cn";

export interface StudioPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  collapsible?: boolean;
  raised?: boolean;
}

export function StudioPanel({
  className,
  title,
  actions,
  children,
  raised = false,
  ...props
}: StudioPanelProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden border border-studio-border/90 text-studio-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] lg:min-w-[350px]",
        raised ? "bg-studio-panel-raised" : "bg-studio-panel",
        className,
      )}
      {...props}
    >
      {(title || actions) && (
        <div
          data-studio-panel-header
          className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-studio-border bg-studio-topbar px-3"
        >
          <div
            className="flex min-w-0 flex-1 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-studio-muted before:h-3 before:w-0.5 before:shrink-0 before:rounded-full before:bg-brand"
            title={typeof title === "string" ? title : undefined}
          >
            <span className="min-w-0 flex-1 truncate">{title}</span>
          </div>
          {actions && (
            <div className="flex items-center gap-1 shrink-0">{actions}</div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
