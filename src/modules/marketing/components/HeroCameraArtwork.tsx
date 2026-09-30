import React from "react";

export function HeroCameraArtwork() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Center gradient fade mask to keep text 100% readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_45%,var(--mkt-bg)_35%,transparent_100%)] z-10" />

      {/* Grid crosshair markers & technical coordinates */}
      <div className="absolute inset-0 opacity-20 dark:opacity-25 z-0 bg-[url('/illustrations/hero/grid-pattern.svg')] bg-repeat" />

      {/* Top Left: Cinema Camera Rig with Matte Box & Top Handle */}
      <div className="hero-artwork-float-slow absolute left-2 sm:left-6 lg:left-8 top-1 sm:top-3 w-[170px] sm:w-[380px] lg:w-[460px] opacity-35 sm:opacity-100 dark:opacity-15 sm:dark:opacity-30 transition-opacity duration-700">
        <img
          src="/illustrations/hero/cinema-camera-rig.svg"
          alt="Cinema Camera Rig Wireframe"
          className="w-full h-auto drop-shadow-sm dark:invert"
          width={500}
          height={420}
        />
      </div>

      {/* Top Right: Studio Shotgun Microphone & Audio Waveform Ring */}
      <div className="hero-artwork-float-reverse absolute right-2 sm:right-6 lg:right-8 top-1 sm:top-4 w-[160px] sm:w-[350px] lg:w-[420px] opacity-35 sm:opacity-100 dark:opacity-15 sm:dark:opacity-30 transition-opacity duration-700">
        <img
          src="/illustrations/hero/studio-mic-and-lens.svg"
          alt="Studio Mic and Lens Wireframe"
          className="w-full h-auto drop-shadow-sm dark:invert"
          width={500}
          height={420}
        />
      </div>

      {/* Bottom Left: Anamorphic Prime Lens & Aperture Blades */}
      <div className="hero-artwork-float-delayed absolute left-2 sm:left-6 lg:left-8 bottom-0 sm:bottom-4 w-[150px] sm:w-[340px] lg:w-[400px] opacity-30 sm:opacity-100 dark:opacity-15 sm:dark:opacity-25 transition-opacity duration-700">
        <img
          src="/illustrations/hero/anamorphic-lens.svg"
          alt="Anamorphic Lens Wireframe"
          className="w-full h-auto drop-shadow-sm dark:invert"
          width={460}
          height={400}
        />
      </div>

      {/* Bottom Right: Digital Cinema Body & Viewfinder Top Plate */}
      <div className="hero-artwork-float-slow absolute right-2 sm:right-6 lg:right-8 bottom-0 sm:bottom-2 w-[160px] sm:w-[360px] lg:w-[420px] opacity-30 sm:opacity-100 dark:opacity-15 sm:dark:opacity-30 transition-opacity duration-700">
        <img
          src="/illustrations/hero/camera-body-top-plate.svg"
          alt="Camera Body Top Plate Wireframe"
          className="w-full h-auto drop-shadow-sm dark:invert"
          width={520}
          height={400}
        />
      </div>

      {/* Subtle Viewfinder HUD Frame Markers */}
      <div className="absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 top-6 bottom-6 hidden md:block z-0 pointer-events-none">
        {/* Top-left bracket */}
        <div className="absolute left-0 top-0 font-mono text-[9px] tracking-wider text-zinc-500/60 dark:text-[#808080]/60">
          <span className="block border-l-2 border-t-2 border-current w-6 h-6 mb-1" />
          REC [4K 10-BIT]
        </div>
        {/* Top-right bracket */}
        <div className="absolute right-0 top-0 text-right font-mono text-[9px] tracking-wider text-zinc-500/60 dark:text-[#808080]/60">
          <span className="block border-r-2 border-t-2 border-current w-6 h-6 ml-auto mb-1" />
          TC 00:04:18:24
        </div>
        {/* Bottom-left bracket */}
        <div className="absolute left-0 bottom-0 font-mono text-[9px] tracking-wider text-zinc-500/60 dark:text-[#808080]/60">
          WEBCODECS LOCAL
          <span className="block border-l-2 border-b-2 border-current w-6 h-6 mt-1" />
        </div>
        {/* Bottom-right bracket */}
        <div className="absolute right-0 bottom-0 text-right font-mono text-[9px] tracking-wider text-zinc-500/60 dark:text-[#808080]/60">
          FPS 60.00
          <span className="block border-r-2 border-b-2 border-current w-6 h-6 ml-auto mt-1" />
        </div>
      </div>
    </div>
  );
}
