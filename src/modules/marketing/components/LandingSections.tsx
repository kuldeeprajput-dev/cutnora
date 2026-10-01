import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Download,
  FileVideo,
  FolderPlus,
  ImageIcon,
  Layers,
  LockKeyhole,
  Monitor,
  Music,
  Play,
  Scissors,
  ShieldCheck,
  Type,
  Undo2,
} from "lucide-react";
import { TimelineArtwork } from "./TimelineArtwork";

export function OpenEditorButton() {
  return (
    <Link href="/projects/new" className="lp-button">
      Open Editor
      <ArrowRight size={17} />
    </Link>
  );
}

export function LandingHero() {
  return (
    <section className="lp-hero lp-container" aria-labelledby="landing-heading">
      <h1 id="landing-heading">
        Edit videos directly
        <br />
        <span>in your browser.</span>
      </h1>
      <p className="lp-hero-description">
        Cut, layer, and export videos on your device.
        <span>No uploads, no account, no installation.</span>
      </p>
      <div className="lp-hero-actions">
        <OpenEditorButton />
        <a href="#workflow" className="lp-text-link">
          <Play size={17} aria-hidden="true" />
          See how it works
        </a>
      </div>
    </section>
  );
}

export function FeatureShowcase() {
  return (
    <section
      className="lp-section lp-container"
      id="features"
      aria-labelledby="features-heading"
    >
      <div className="lp-section-heading lp-centered">
        <span className="lp-section-label">THE CREATIVE WORKSPACE</span>
        <h2 id="features-heading">Everything your story needs.</h2>
        <p>A focused workspace. Room for every layer.</p>
      </div>
      <div className="lp-feature-grid">
        <article className="lp-feature-card lp-feature-timeline">
          <div className="lp-feature-copy">
            <Scissors size={22} />
            <h3>Make every cut count.</h3>
            <p>Trim, split, and arrange video across multiple tracks.</p>
          </div>
          <div className="lp-feature-timeline-frame">
            <div className="lp-feature-transport" aria-hidden="true">
              <span className="lp-mono">
                00:08 <span className="lp-muted">/ 00:28</span>
              </span>
              <Play size={15} fill="currentColor" />
              <span>Fit timeline</span>
            </div>
            <TimelineArtwork />
          </div>
        </article>
        <article className="lp-feature-card lp-feature-flow">
          <div className="lp-feature-copy">
            <Undo2 size={22} />
            <h3>Find your flow.</h3>
            <p>
              Keep your hands on the keys.
              <br />
              Keep your mind on the edit.
            </p>
          </div>
          <div className="lp-key-sculpture" aria-hidden="true">
            <kbd>⌘</kbd>
            <kbd>Z</kbd>
          </div>
          <div className="lp-flow-list">
            <span>
              Undo / redo <span>Every edit, in your control</span>
            </span>
            <span>
              Frame by frame <span>Get the timing just right</span>
            </span>
            <a href="#shortcuts">
              Explore the shortcuts
              <ArrowRight size={15} />
            </a>
          </div>
        </article>
        <article className="lp-feature-card lp-feature-layers">
          <div className="lp-feature-copy">
            <Layers size={22} />
            <h3>
              More than
              <br />
              moving pictures.
            </h3>
            <p>Layer text, images, graphics, and audio into your edit.</p>
            <div className="lp-layer-list">
              <span>
                <Type size={15} />
                Text & titles
              </span>
              <span>
                <ImageIcon size={15} />
                Images & graphics
              </span>
              <span>
                <Music size={15} />
                Audio tracks
              </span>
            </div>
          </div>
          <div className="lp-layer-preview">
            <Image
              src="/images/coastal-still.webp"
              alt="Coastal sample media with a text overlay"
              sizes="(max-width: 560px) 90vw, 700px"
              width={1672}
              height={941}
              loading="lazy"
            />
            <div className="lp-selected-text">
              Find your
              <br />
              own rhythm.
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="lp-layer-chip">
              <Type size={12} />
              Text layer
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

export function LocalPrivacy() {
  return (
    <section
      className="lp-privacy-band"
      id="privacy"
      aria-labelledby="privacy-heading"
    >
      <div className="lp-container lp-privacy-grid">
        <div className="lp-section-heading">
          <span className="lp-section-label">
            <LockKeyhole size={13} />
            LOCAL BY DESIGN
          </span>
          <h2 id="privacy-heading">
            Your videos
            <br />
            stay yours.
          </h2>
          <p>
            Media and projects are stored in this browser on this device. Edit
            without sending your footage to a server.
          </p>
          <ul className="lp-privacy-benefits">
            <li>
              <Check size={15} />
              No media upload queue
            </li>
            <li>
              <Check size={15} />
              No account to get started
            </li>
            <li>
              <Check size={15} />
              Your project, saved locally
            </li>
          </ul>
        </div>
        <div className="lp-device-diagram">
          <div className="lp-device-heading">
            <ShieldCheck size={21} />
            <strong>Your device</strong>
          </div>
          <div className="lp-device-flow">
            <div className="lp-device-node">
              <div className="lp-file-stack">
                <FileVideo size={36} />
                <Music size={24} />
              </div>
              <strong>Your files</strong>
              <span>Video, audio, images</span>
            </div>
            <ArrowRight className="lp-device-arrow" size={22} />
            <div className="lp-device-node lp-device-browser">
              <div className="lp-mini-browser">
                <div className="lp-mini-browser-bar">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="lp-mini-browser-canvas">
                  <Play size={22} />
                </div>
                <div className="lp-mini-browser-tracks">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <strong>Cutnora in your browser</strong>
              <span>Edit locally on this device</span>
            </div>
            <ArrowRight className="lp-device-arrow" size={22} />
            <div className="lp-device-node">
              <div className="lp-export-file">
                <FileVideo size={39} />
              </div>
              <strong>Exported file</strong>
              <span>Saved to your device</span>
            </div>
          </div>
          <p className="lp-storage-note">
            Browser storage can be cleared. Keep a copy of important projects
            and exports.
          </p>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Import",
    description: "Bring in video, audio, or images.",
    icon: FolderPlus,
  },
  {
    number: "02",
    title: "Edit",
    description: "Arrange your timeline. Make it yours.",
    icon: Scissors,
  },
  {
    number: "03",
    title: "Export",
    description: "Render locally and save your video.",
    icon: Download,
  },
];

export function EditingWorkflow() {
  return (
    <section
      className="lp-section lp-container"
      id="workflow"
      aria-labelledby="workflow-heading"
    >
      <div className="lp-section-heading">
        <span className="lp-section-label">A SIMPLE WORKFLOW</span>
        <h2 id="workflow-heading">From first clip to final cut.</h2>
        <p>Three steps. One browser tab.</p>
      </div>
      <div className="lp-workflow-grid">
        {steps.map(({ number, title, description, icon: Icon }, index) => (
          <article className="lp-workflow-step" key={title}>
            <div className="lp-step-heading">
              <span className="lp-mono">{number}</span>
              <h3>{title}</h3>
            </div>
            <p>{description}</p>
            <div
              className={`lp-workflow-art lp-workflow-art-${index}`}
              aria-hidden="true"
            >
              <div className="lp-art-window-bar">
                <i />
                <i />
                <i />
              </div>
              {index === 0 ? (
                <div className="lp-import-art">
                  <div>
                    <span>
                      <FileVideo />
                      Video
                    </span>
                    <span>
                      <Music />
                      Audio
                    </span>
                    <span>
                      <ImageIcon />
                      Images
                    </span>
                  </div>
                  <div>
                    <Icon size={30} />
                    <span>Add media</span>
                    <small>or drag and drop</small>
                  </div>
                </div>
              ) : index === 1 ? (
                <TimelineArtwork compact />
              ) : (
                <div className="lp-export-art">
                  <div className="lp-export-thumbnail">
                    <Image
                      src="/images/coastal-still.webp"
                      width={1672}
                      height={941}
                      alt=""
                      sizes="130px"
                      loading="lazy"
                    />
                  </div>
                  <div className="lp-export-progress" />
                  <span>
                    <Check size={12} />
                    Ready to save
                  </span>
                </div>
              )}
            </div>
            {index < 2 && <ArrowRight className="lp-step-arrow" size={22} />}
          </article>
        ))}
      </div>
      <div className="lp-browser-strip">
        <div>
          <Monitor size={23} />
          <h3>Built for the browser.</h3>
        </div>
        <p>
          Local storage
          <span />
          Canvas playback
          <span />
          Browser-based export
        </p>
      </div>
    </section>
  );
}

const shortcuts = [
  { label: "Play / pause", keys: ["Space"] },
  { label: "Split clip", keys: ["S"] },
  { label: "Undo", keys: ["Ctrl / ⌘", "Z"] },
  { label: "Delete selected", keys: ["Delete"] },
  { label: "Previous / next frame", keys: ["←", "→"] },
  { label: "Timeline zoom", keys: ["+", "−"] },
];

export function ShortcutShowcase() {
  return (
    <section
      className="lp-shortcuts-band"
      id="shortcuts"
      aria-labelledby="shortcuts-heading"
    >
      <div className="lp-container">
        <div className="lp-shortcuts-heading">
          <div className="lp-section-heading">
            <span className="lp-section-label">KEYBOARD SHORTCUTS</span>
            <h2 id="shortcuts-heading">
              Less clicking.
              <br />
              More creating.
            </h2>
          </div>
          <p>
            The small things that keep you in the creative flow.
            <br />
            <span>Ctrl on Windows and Linux. ⌘ on Mac.</span>
          </p>
        </div>
        <div className="lp-shortcuts-grid">
          {shortcuts.map(({ label, keys }) => (
            <div className="lp-shortcut" key={label}>
              <span>{label}</span>
              <div>
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalEditorCta() {
  return (
    <section
      className="lp-final-cta lp-container"
      aria-labelledby="cta-heading"
    >
      <span className="lp-cta-symbol" aria-hidden="true">
        <Play size={25} fill="currentColor" />
      </span>
      <h2 id="cta-heading">Your next edit starts here.</h2>
      <p>Open a tab. Bring your footage. Make something yours.</p>
      <OpenEditorButton />
      <Link href="/projects" className="lp-return-link">
        Or pick up an existing project
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}
