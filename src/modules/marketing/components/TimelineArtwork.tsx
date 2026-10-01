import {
  Eye,
  ImageIcon,
  Music,
  Type,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

const waveform = [
  18, 32, 44, 24, 56, 35, 66, 41, 22, 48, 62, 28, 38, 70, 44, 26, 56, 34, 18,
  45, 64, 36, 51, 24, 40, 58, 30, 46, 68, 35, 22, 52,
];

type TimelineVariant = "preview" | "feature" | "workflow";

type ArtworkProps = {
  compact?: boolean;
  variant?: TimelineVariant;
};

export function Waveform({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex h-full w-full items-center gap-0.5", className)}
      aria-hidden="true"
    >
      {[...waveform, ...waveform].map((height, index) => (
        <i
          key={index}
          className="block min-w-0.25 flex-1 rounded-[1px] bg-current opacity-55"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function TimelineTrack({
  icon: Icon,
  label,
  compact,
  variant,
  children,
}: ArtworkProps & { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "border-studio-border phone:grid-cols-[53px_1fr] grid min-h-11 grid-cols-[115px_1fr] border-b last-of-type:border-b-0",
        compact && "phone:min-h-7.5 min-h-9.25",
        variant === "feature" &&
          "compact:grid-cols-[70px_1fr] phone:min-h-11.5 phone:grid-cols-[70px_1fr] min-h-13.5",
        variant === "workflow" &&
          "compact:h-10.25 phone:h-12 phone:grid-cols-[33px_1fr] h-12 grid-cols-[33px_1fr]",
      )}
    >
      <div
        className={cn(
          "border-studio-border bg-studio-panel phone:gap-1.75 phone:px-2.25 flex items-center gap-2 border-r px-3 py-0 text-[9px]",
          variant === "feature" &&
            "compact:gap-1.25 compact:px-2 phone:gap-1.25 phone:px-2",
          variant === "workflow" && "phone:px-0 justify-center px-0",
        )}
      >
        <Eye
          className={cn(
            "text-studio-muted phone:hidden size-3",
            variant === "feature" && "compact:hidden",
            variant === "workflow" && "hidden",
          )}
        />
        <Icon className="size-3" />
        <span
          className={cn(
            "phone:hidden",
            variant === "feature" && "phone:inline phone:text-[7px]",
            variant === "workflow" && "hidden",
          )}
        >
          {label}
        </span>
      </div>
      <div
        className={cn(
          "flex min-w-0 items-center gap-1 bg-[repeating-linear-gradient(to_right,var(--studio-border)_0_1px,transparent_1px_20%)] px-1.75 py-1.25",
          variant === "workflow" && "py-1.5",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function TimelineClip({
  compact,
  variant,
  className,
  children,
}: ArtworkProps & { className: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "border-studio-border-strong phone:[&>svg]:w-2.25 flex h-8.25 min-w-0 shrink-0 items-center gap-1.75 overflow-hidden rounded border text-[8px]",
        compact && "phone:h-5.25 phone:text-[6px] h-6.75",
        variant === "feature" && "phone:h-8 h-9.75",
        variant === "workflow" && "phone:h-8.75 h-8.75",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TimelineArtwork({
  compact = false,
  variant = "preview",
}: ArtworkProps) {
  return (
    <div className="bg-timeline-bg relative overflow-hidden" aria-hidden="true">
      <div
        className={cn(
          "border-studio-border text-studio-muted phone:h-6 phone:grid-cols-[53px_1fr] phone:text-[6px] grid h-8 grid-cols-[115px_1fr] items-center border-b font-mono text-[8px]",
          variant === "feature" &&
            "compact:grid-cols-[70px_1fr] phone:grid-cols-[70px_1fr]",
          variant === "workflow" && "hidden",
        )}
      >
        <span className="phone:pl-2 phone:text-[6px] pl-3.5 text-[7px] tracking-[0.1em]">
          TRACKS
        </span>
        <div className="phone:px-1.5 phone:pt-2 flex h-full justify-between bg-[repeating-linear-gradient(to_right,var(--studio-border)_0_1px,transparent_1px_3.33%)] bg-size-[100%_5px] bg-bottom bg-no-repeat px-3.75 pt-2.5 pb-0">
          {["00:00", "00:05", "00:10", "00:15", "00:20", "00:25"].map(
            (time) => (
              <span key={time} className="phone:even:hidden">
                {time}
              </span>
            ),
          )}
        </div>
      </div>
      <TimelineTrack
        icon={Video}
        label="Video 1"
        compact={compact}
        variant={variant}
      >
        {["coast.mp4", "shoreline.mp4"].map((filename, index) => (
          <TimelineClip
            key={filename}
            compact={compact}
            variant={variant}
            className={cn(
              "bg-[url('/images/coastal-still.webp')] bg-size-[auto_140%] bg-center",
              index === 0
                ? "w-[43%]"
                : "w-[34%] bg-size-[auto_220%] bg-position-[right_65%]",
            )}
          >
            <span className="phone:text-[6px] w-full self-end bg-black/45 px-1.25 py-0.5 text-[7px] text-white">
              {filename}
            </span>
          </TimelineClip>
        ))}
      </TimelineTrack>
      {!compact && (
        <TimelineTrack icon={ImageIcon} label="Images" variant={variant}>
          <TimelineClip
            variant={variant}
            className="bg-studio-panel-raised text-studio-muted ml-[20%] w-[27%] px-2 whitespace-nowrap"
          >
            <ImageIcon size={12} />
            coastal-still.webp
          </TimelineClip>
        </TimelineTrack>
      )}
      <TimelineTrack
        icon={Type}
        label="Text"
        compact={compact}
        variant={variant}
      >
        <TimelineClip
          compact={compact}
          variant={variant}
          className="bg-studio-hover text-studio-fg phone:gap-0.75 phone:px-1 ml-[11%] w-[42%] px-2 py-0 whitespace-nowrap"
        >
          <Type size={12} />
          Find your own rhythm.
        </TimelineClip>
      </TimelineTrack>
      <TimelineTrack
        icon={Music}
        label="Audio"
        compact={compact}
        variant={variant}
      >
        <TimelineClip
          compact={compact}
          variant={variant}
          className="bg-studio-panel-raised text-studio-muted w-[94%] px-1.25 py-0"
        >
          <Waveform />
        </TimelineClip>
      </TimelineTrack>
      <div
        className={cn(
          "bg-studio-fg before:bg-studio-fg absolute top-5.5 bottom-0 left-[39%] w-0.25 before:absolute before:top-[-2px] before:left-[-4px] before:size-2.25 before:content-[''] before:[clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]",
          variant === "workflow" && "top-0 left-[45%]",
        )}
      />
    </div>
  );
}
