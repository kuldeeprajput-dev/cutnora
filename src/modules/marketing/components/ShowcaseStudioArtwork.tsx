import React from "react";

/**
 * Ambient background grid pattern matching HeroCameraArtwork
 */
export function ShowcaseBackgroundGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none opacity-20 dark:opacity-25 bg-[url('/illustrations/showcase/grid-pattern.svg')] bg-repeat"
      aria-hidden="true"
    />
  );
}

/**
 * Left Technical HUD Wing: Flanks the showcase window on desktop screens
 * Colors, typography, and opacity exactly match HeroCameraArtwork
 */
export function ShowcaseLeftWing() {
  return (
    <div className="hidden xl:flex w-[230px] 2xl:w-[260px] shrink-0 flex-col justify-between py-2 select-none pointer-events-none self-stretch">
      {/* Top-left bracket matching Hero style & color */}
      <div className="font-mono text-[9px] tracking-wider text-zinc-500/60 dark:text-[#808080]/60">
        <span className="block border-l-2 border-t-2 border-current w-6 h-6 mb-1" />
        TIMELINE // 05 TRACKS
        <span className="block text-[8px] opacity-75">MAGNETIC SNAP · 4K</span>
      </div>

      {/* Middle Top: Audio Console Wireframe */}
      <div className="hero-artwork-float-slow my-auto opacity-100 dark:opacity-30 transition-opacity duration-700">
        <img
          src="/illustrations/showcase/audio-mixer-hud.svg"
          alt="Audio Mixer HUD"
          className="w-full h-auto drop-shadow-sm dark:invert"
          width={240}
          height={140}
        />
      </div>

      {/* Middle Bottom: 35mm Cinema Film Gate Wireframe */}
      <div className="hero-artwork-float-delayed my-auto opacity-100 dark:opacity-25 transition-opacity duration-700">
        <img
          src="/illustrations/showcase/film-gate-hud.svg"
          alt="Film Gate HUD"
          className="w-full h-auto drop-shadow-sm dark:invert"
          width={240}
          height={110}
        />
      </div>

      {/* Bottom-left bracket matching Hero style & color */}
      <div className="font-mono text-[9px] tracking-wider text-zinc-500/60 dark:text-[#808080]/60">
        <span className="block text-[8px] opacity-75">100% PRIVATE TO DEVICE</span>
        LOCAL CACHE // OPFS
        <span className="block border-l-2 border-b-2 border-current w-6 h-6 mt-1" />
      </div>
    </div>
  );
}

/**
 * Right Technical HUD Wing: Flanks the showcase window on desktop screens
 * Colors, typography, and opacity exactly match HeroCameraArtwork
 */
export function ShowcaseRightWing() {
  return (
    <div className="hidden xl:flex w-[230px] 2xl:w-[260px] shrink-0 flex-col justify-between py-2 select-none pointer-events-none text-right self-stretch">
      {/* Top-right bracket matching Hero style & color */}
      <div className="text-right font-mono text-[9px] tracking-wider text-zinc-500/60 dark:text-[#808080]/60">
        <span className="block border-r-2 border-t-2 border-current w-6 h-6 ml-auto mb-1" />
        CANVAS // 3840×2160
        <span className="block text-[8px] opacity-75">DCI-P3 10-BIT COLOR</span>
      </div>

      {/* Middle Top: Vectorscope & RGB Parade Wireframe */}
      <div className="hero-artwork-float-reverse my-auto opacity-100 dark:opacity-30 transition-opacity duration-700">
        <img
          src="/illustrations/showcase/vectorscope-hud.svg"
          alt="Vectorscope HUD"
          className="w-full h-auto drop-shadow-sm dark:invert"
          width={240}
          height={140}
        />
      </div>

      {/* Middle Bottom: Hardware Transport Deck Wireframe */}
      <div className="hero-artwork-float-slow my-auto opacity-100 dark:opacity-30 transition-opacity duration-700">
        <img
          src="/illustrations/showcase/transport-deck-hud.svg"
          alt="Transport Deck HUD"
          className="w-full h-auto drop-shadow-sm dark:invert"
          width={240}
          height={110}
        />
      </div>

      {/* Bottom-right bracket matching Hero style & color */}
      <div className="text-right font-mono text-[9px] tracking-wider text-zinc-500/60 dark:text-[#808080]/60">
        <span className="block text-[8px] opacity-75">60.00 FPS DIRECT RENDER</span>
        ENGINE // WEBCODECS
        <span className="block border-r-2 border-b-2 border-current w-6 h-6 ml-auto mt-1" />
      </div>
    </div>
  );
}
