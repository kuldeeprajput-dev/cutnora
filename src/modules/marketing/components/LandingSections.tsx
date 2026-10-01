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
