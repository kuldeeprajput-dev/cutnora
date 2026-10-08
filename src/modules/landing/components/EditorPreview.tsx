"use client";

import { LandingActionButton } from "./LandingPrimitives";

import Image from "next/image";
import { useState } from "react";
import {
  Check,
  Download,
  FolderPlus,
  ImageIcon,
  Layout,
  Maximize2,
  Mic,
  Music,
  Play,
  Plus,
  Redo2,
  Scissors,
  Shapes,
  SkipBack,
  SkipForward,
  Type,
  Undo2,
  Video,
} from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { TimelineArtwork, Waveform } from "./TimelineArtwork";

const mediaThumbnails = [
  "aspect-[1.55] rounded-[5px] bg-[url('/images/coastal-still.webp')] [background-size:cover]",
  "aspect-[1.55] rounded-[5px] bg-[url('/images/coastal-still.webp')] [background-size:190%] [background-position:right_55%]",
  "aspect-[1.55] rounded-[5px] bg-[url('/images/coastal-still.webp')] [background-size:160%] [background-position:60%_30%]",
  "aspect-[1.55] rounded-[5px] bg-[url('/images/coastal-still.webp')] [background-size:190%] [background-position:right_bottom]",
];

const tools = [
  { label: "Media", icon: FolderPlus },
  { label: "Canvas", icon: Layout },
  { label: "Text", icon: Type },
  { label: "Audio", icon: Music },
  { label: "Videos", icon: Video },
  { label: "Images", icon: ImageIcon },
  { label: "Elements", icon: Shapes },
  { label: "Record", icon: Mic },
];

export function EditorPreview() {
  const [panel, setPanel] = useState<"media" | "text">("media");
  const [showText, setShowText] = useState(true);
  return (
    <div
      className="border-studio-border-strong bg-studio-panel text-studio-fg phone:rounded-[9px] overflow-hidden rounded-xl border text-[11px] shadow-[0_16px_50px_-20px_rgb(0_0_0_/_15%)] dark:shadow-[0_18px_60px_-20px_rgb(0_0_0_/_55%)]"
      aria-label="Illustrative Cutnora workspace with sample coastal media"
    >
      <div className="bg-studio-topbar phone:h-11 phone:px-2.5 phone:[&>div]:gap-1.75 phone:[&_strong]:text-[10px] relative flex h-11 items-center justify-between px-3.5 [border-bottom:1px_solid_var(--studio-border)] [&_strong]:text-[11px] [&_strong]:font-semibold [&>div]:flex [&>div]:items-center [&>div]:gap-3.25">
        <div>
          <BrandMark size={22} />
          <strong>Coastal notes</strong>
          <span className="text-studio-muted phone:hidden inline-flex items-center gap-1 text-[9px]">
            <Check size={12} />
            Saved locally
          </span>
        </div>
        <span
          className="text-studio-muted phone:hidden absolute left-[50%] flex [transform:translateX(-50%)] gap-5"
          aria-hidden="true"
        >
          <Undo2 size={15} />
          <Redo2 size={15} />
        </span>
        <span className="bg-brand text-brand-contrast phone:text-[10px] phone:py-1.25 phone:px-2 flex items-center gap-1.5 rounded-[5px] px-2.75 py-1.5 text-[10px]">
          <Download size={13} />
          Export
        </span>
      </div>
      <div className="laptop:grid-cols-[45px_200px_minmax(0,_1fr)] compact:grid-cols-[42px_170px_minmax(0,_1fr)] phone:grid-cols-[48px_minmax(0,_1fr)] grid grid-cols-[52px_245px_minmax(0,_1fr)]">
        <div
          className="[&>:is(button,_span)]:text-studio-muted [&_button[aria-pressed='true']]:bg-studio-hover [&_button[aria-pressed='true']]:text-studio-fg [&_button:hover]:bg-studio-panel-raised laptop:[&>:is(button,_span)]:min-h-8.5 compact:[&>:is(button,_span)]:min-h-7.25 compact:[&>:is(button,_span)]:text-[7px] compact:[&>:is(button,_span)]:gap-0.75 compact:[&_svg]:w-3.25 compact:[&_svg]:h-3.25 phone:py-1.5 phone:px-0.25 phone:gap-1.5 phone:[&>span]:hidden phone:[&>button]:min-h-11 phone:[&>button]:text-[8px] flex flex-col gap-1 px-1.25 py-2.25 [border-right:1px_solid_var(--studio-border)] [&_svg]:h-3.75 [&_svg]:w-3.75 [&>:is(button,_span)]:flex [&>:is(button,_span)]:min-h-9.75 [&>:is(button,_span)]:flex-col [&>:is(button,_span)]:items-center [&>:is(button,_span)]:justify-center [&>:is(button,_span)]:gap-1 [&>:is(button,_span)]:rounded-[7px] [&>:is(button,_span)]:border-0 [&>:is(button,_span)]:bg-transparent [&>:is(button,_span)]:text-[8px]"
          aria-label="Preview panels"
        >
          {tools.map(({ label, icon: Icon }, index) =>
            index === 0 || index === 2 ? (
              <button
                key={label}
                type="button"
                aria-pressed={panel === (index === 0 ? "media" : "text")}
                onClick={() => setPanel(index === 0 ? "media" : "text")}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ) : (
              <span key={label} aria-hidden="true">
                <Icon />
                <span>{label}</span>
              </span>
            ),
          )}
        </div>
        <div className="phone:hidden min-w-0 [border-right:1px_solid_var(--studio-border)]">
          <div className="text-studio-muted compact:text-[7px] compact:py-3 compact:px-2.5 flex justify-between gap-2 px-3.5 py-3.75 text-[9px] font-semibold tracking-[0.09em] [border-bottom:1px_solid_var(--studio-border)] [&>span]:font-normal [&>span]:tracking-[0] [&>span]:normal-case [&>span]:opacity-80">
            {panel === "media" ? "MEDIA LIBRARY" : "TEXT LAYERS"}
            <span>Sample</span>
          </div>
          {panel === "media" ? (
            <>
              <div
                className="text-studio-muted [&_strong]:text-studio-fg compact:gap-3 compact:text-[8px] flex gap-4 p-3.5 text-[10px] [&_strong]:font-medium"
                aria-hidden="true"
              >
                <strong>All</strong>
                <span>Video</span>
                <span>Audio</span>
                <span>Images</span>
              </div>
              <div className="[&>div_>_span]:text-studio-muted compact:gap-[9px_7px] grid grid-cols-[1fr_1fr] gap-[13px_9px] px-3 py-0 [&>div_>_span]:block [&>div_>_span]:pt-1.25 [&>div_>_span]:text-[9px]">
                {["Coast", "Shoreline", "Headland", "Ocean"].map(
                  (label, index) => (
                    <div key={label}>
                      <div className={mediaThumbnails[index]} />
                      <span>{label.toLowerCase()}.mp4</span>
                    </div>
                  ),
                )}
              </div>
              <div className="border-studio-border text-studio-muted compact:mt-2.5 mx-3 my-4 flex items-center gap-2.5 rounded-[5px] border px-2.5 py-2 [&>div]:min-w-0 [&>div]:flex-1 [&>div_>_span]:text-[9px]">
                <Music size={15} />
                <div>
                  <span>Ocean ambience</span>
                  <Waveform className="mt-0.75 h-5" />
                </div>
              </div>
              <div className="text-studio-muted laptop:mt-3 compact:hidden mt-5 mr-3.5 mb-3 ml-3.5 flex gap-2.5 text-[9px] leading-[1.7] [&_small]:text-[8px] [&_small]:opacity-75">
                <FolderPlus size={17} />
                <span>
                  Your media lives here.
                  <br />
                  <small>Video, audio, and images.</small>
                </span>
              </div>
            </>
          ) : (
            <div className="[&_p]:text-studio-muted compact:py-3.75 compact:px-3 compact:[&_h3]:text-[15px] px-3.75 py-5.5 [&_h3]:mt-3.5 [&_h3]:text-[19px] [&_h3]:leading-[1.25] [&_h3]:tracking-[-0.7px] [&_p]:mt-3 [&_p]:mb-4 [&_p]:text-[10px] [&_p]:leading-[1.7]">
              <Type size={26} />
              <h3>
                A few words.
                <br />A different story.
              </h3>
              <p>Try a text overlay on the sample canvas.</p>
              <LandingActionButton
                small

                onClick={() => setShowText(!showText)}
                type="button"
              >
                {showText ? "Hide text layer" : "Show text layer"}
              </LandingActionButton>
              <div className="[&>span]:text-studio-muted [&_strong]:border-studio-border compact:hidden mt-5 flex flex-col gap-1.75 text-[9px] [&_i]:h-2.5 [&_i]:w-2.5 [&_i]:border [&_i]:border-[#aaa] [&_i]:bg-white [&_strong]:flex [&_strong]:items-center [&_strong]:gap-1.75 [&_strong]:rounded [&_strong]:border [&_strong]:p-1.75 [&_strong]:font-normal [&>span]:mt-1">
                <span>Content</span>
                <strong>Find your own rhythm.</strong>
                <span>Font</span>
                <strong>Georgia · Regular</strong>
                <span>Color</span>
                <strong>
                  <i />
                  #FFFFFF
                </strong>
              </div>
            </div>
          )}
        </div>
        <div className="bg-canvas-bg phone:pt-1.75 phone:pr-1.75 phone:pb-0 phone:pl-1.75 relative flex min-w-0 flex-col justify-center pt-2.75 pr-2.75 pb-0 pl-2.75">
          <div className="laptop:[&>span]:text-[25px] compact:[&>span]:text-[20px] phone:aspect-[1.65] phone:[&>span]:text-[clamp(15px,_4.2vw,_22px)] relative mx-auto aspect-[16_/_9] w-full max-w-170 overflow-hidden rounded-[5px] bg-[#222] shadow-[0_10px_25px_-12px_rgb(0_0_0_/_40%)] [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&>span]:absolute [&>span]:top-[53%] [&>span]:right-0 [&>span]:left-0 [&>span]:[transform:translateY(-50%)] [&>span]:text-center [&>span]:font-[family-name:Georgia,_serif] [&>span]:text-[clamp(20px,_2.4vw,_34px)] [&>span]:text-white [&>span]:[text-shadow:0_1px_8px_rgb(0_0_0_/_25%)]">
            <Image
              src="/images/coastal-still.webp"
              alt="Sample coastal landscape with cliffs and ocean"
              width={1672}
              height={941}
              fetchPriority="high"
              loading="eager"
              sizes="(max-width: 560px) 90vw, (max-width: 800px) 65vw, 800px"
            />
            {showText && <span>Find your own rhythm.</span>}
          </div>
          <button
            className="phone:[&:not([hidden])]:inline-flex phone:[&:not([hidden])]:absolute phone:[&:not([hidden])]:top-3.25 phone:[&:not([hidden])]:right-3.25 phone:[&:not([hidden])]:min-h-11 phone:[&:not([hidden])]:py-1.75 phone:[&:not([hidden])]:px-2.5 phone:[&:not([hidden])]:border phone:[&:not([hidden])]:border-[rgb(255_255_255_/_30%)] phone:[&:not([hidden])]:rounded-[5px] phone:[&:not([hidden])]:bg-[rgb(0_0_0_/_60%)] phone:[&:not([hidden])]:text-white phone:[&:not([hidden])]:text-[11px] hidden"
            type="button"
            hidden={panel !== "text"}
            onClick={() => setShowText(!showText)}
          >
            {showText ? "Hide title" : "Show title"}
          </button>
          <div
            className="compact:[&>:is(div,_span:last-child)]:gap-2 phone:h-8.5 phone:text-[7px] phone:[&>:is(div,_span:last-child)]:gap-1.5 phone:[&>div_>_svg]:w-2.75 phone:[&>span:last-child_>_svg]:hidden flex h-10.75 items-center justify-between gap-2 text-[9px] [&>:is(div,_span:last-child)]:flex [&>:is(div,_span:last-child)]:items-center [&>:is(div,_span:last-child)]:gap-3"
            aria-hidden="true"
          >
            <span>
              16:9{" "}
              <span className="text-studio-muted compact:hidden">
                · 1920 × 1080
              </span>
            </span>
            <div>
              <SkipBack size={14} />
              <span className="bg-brand text-brand-contrast phone:w-5.5 phone:h-5.25 flex h-6.25 w-6.75 items-center justify-center rounded-[5px]">
                <Play size={14} fill="currentColor" />
              </span>
              <SkipForward size={14} />
            </div>
            <span className="font-mono tabular-nums">
              00:08 <span className="text-studio-muted">/ 00:28</span>
              <Maximize2 size={13} />
            </span>
          </div>
        </div>
      </div>
      <div
        className="phone:h-7.5 phone:px-2.5 phone:gap-2.5 phone:text-[7px] flex h-8.75 items-center gap-3.75 px-3.75 text-[9px] [border-bottom:1px_solid_var(--studio-border)] [border-top:1px_solid_var(--studio-border)]"
        aria-hidden="true"
      >
        <Scissors size={13} />
        <Undo2 size={13} />
        <Plus size={13} />
        <span>Add Track</span>
        <span className="flex-1" />
        <span>Fit Stage</span>
        <span className="bg-studio-border-strong phone:w-10 after:bg-studio-fg relative h-0.75 w-17.5 rounded-[3px] after:absolute after:top-[-3px] after:left-[42%] after:h-2.25 after:w-2.25 after:rounded-full after:[content:'']" />
        <Plus size={12} />
      </div>
      <TimelineArtwork compact />
    </div>
  );
}
