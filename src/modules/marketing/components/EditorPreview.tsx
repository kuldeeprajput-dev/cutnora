"use client";

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
      className="lp-editor"
      aria-label="Illustrative Cutnora workspace with sample coastal media"
    >
      <div className="lp-editor-topbar">
        <div>
          <BrandMark size={22} />
          <strong>Coastal notes</strong>
          <span className="lp-editor-saved">
            <Check size={12} />
            Saved locally
          </span>
        </div>
        <span className="lp-editor-history" aria-hidden="true">
          <Undo2 size={15} />
          <Redo2 size={15} />
        </span>
        <span className="lp-editor-export">
          <Download size={13} />
          Export
        </span>
      </div>
      <div className="lp-editor-workspace">
        <div className="lp-editor-rail" aria-label="Preview panels">
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
        <div className="lp-editor-panel">
          <div className="lp-panel-heading">
            {panel === "media" ? "MEDIA LIBRARY" : "TEXT LAYERS"}
            <span>Sample</span>
          </div>
          {panel === "media" ? (
            <>
              <div className="lp-media-tabs" aria-hidden="true">
                <strong>All</strong>
                <span>Video</span>
                <span>Audio</span>
                <span>Images</span>
              </div>
              <div className="lp-media-grid">
                {["Coast", "Shoreline", "Headland", "Ocean"].map(
                  (label, index) => (
                    <div key={label}>
                      <div
                        className={`lp-media-thumb lp-media-thumb-${index}`}
                      />
                      <span>{label.toLowerCase()}.mp4</span>
                    </div>
                  ),
                )}
              </div>
              <div className="lp-audio-asset">
                <Music size={15} />
                <div>
                  <span>Ocean ambience</span>
                  <Waveform />
                </div>
              </div>
              <div className="lp-media-note">
                <FolderPlus size={17} />
                <span>
                  Your media lives here.
                  <br />
                  <small>Video, audio, and images.</small>
                </span>
              </div>
            </>
          ) : (
            <div className="lp-preview-text-panel">
              <Type size={26} />
              <h3>
                A few words.
                <br />A different story.
              </h3>
              <p>Try a text overlay on the sample canvas.</p>
              <button
                className="lp-button lp-button-small"
                onClick={() => setShowText(!showText)}
                type="button"
              >
                {showText ? "Hide text layer" : "Show text layer"}
              </button>
              <div className="lp-text-properties">
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
        <div className="lp-editor-stage">
          <div className="lp-editor-canvas">
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
            className="lp-mobile-text-toggle"
            type="button"
            hidden={panel !== "text"}
            onClick={() => setShowText(!showText)}
          >
            {showText ? "Hide title" : "Show title"}
          </button>
          <div className="lp-preview-transport" aria-hidden="true">
            <span>
              16:9 <span className="lp-muted">· 1920 × 1080</span>
            </span>
            <div>
              <SkipBack size={14} />
              <span className="lp-preview-play">
                <Play size={14} fill="currentColor" />
              </span>
              <SkipForward size={14} />
            </div>
            <span className="lp-mono">
              00:08 <span className="lp-muted">/ 00:28</span>
              <Maximize2 size={13} />
            </span>
          </div>
        </div>
      </div>
      <div className="lp-timeline-toolbar" aria-hidden="true">
        <Scissors size={13} />
        <Undo2 size={13} />
        <Plus size={13} />
        <span>Add Track</span>
        <span className="lp-toolbar-spacer" />
        <span>Fit Stage</span>
        <span className="lp-zoom-line" />
        <Plus size={12} />
      </div>
      <TimelineArtwork compact />
    </div>
  );
}
