import type { SVGProps } from "react";

/**
 * Ambient background grid pattern matching HeroCameraArtwork
 */
export function ShowcaseBackgroundGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none opacity-20 dark:opacity-25"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full stroke-zinc-400/40 dark:stroke-zinc-600/40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="showcase-grid-pattern"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              strokeWidth="0.5"
              strokeDasharray="2 6"
            />
            <circle
              cx="80"
              cy="80"
              r="1"
              fill="currentColor"
              className="text-zinc-400 dark:text-zinc-500"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#showcase-grid-pattern)" />
      </svg>
    </div>
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
      <div className="hero-artwork-float-slow my-auto text-zinc-500/35 dark:text-[#808080] opacity-100 dark:opacity-30 transition-opacity duration-700">
        <LeftAudioMixerHUD className="w-full h-auto drop-shadow-sm" />
      </div>

      {/* Middle Bottom: 35mm Cinema Film Gate Wireframe */}
      <div className="hero-artwork-float-delayed my-auto text-zinc-500/30 dark:text-[#808080] opacity-100 dark:opacity-25 transition-opacity duration-700">
        <LeftFilmGateHUD className="w-full h-auto drop-shadow-sm" />
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
      <div className="hero-artwork-float-reverse my-auto text-zinc-500/35 dark:text-[#808080] opacity-100 dark:opacity-30 transition-opacity duration-700">
        <RightVectorscopeHUD className="w-full h-auto drop-shadow-sm" />
      </div>

      {/* Middle Bottom: Hardware Transport Deck Wireframe */}
      <div className="hero-artwork-float-slow my-auto text-zinc-500/35 dark:text-[#808080] opacity-100 dark:opacity-30 transition-opacity duration-700">
        <RightTransportDeckHUD className="w-full h-auto drop-shadow-sm" />
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

/**
 * Audio Mixer & Master VU Meter Wireframe (Zero outer box, pure open line art)
 */
function LeftAudioMixerHUD(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Channel Labels */}
        <text x="24" y="16" fill="currentColor" fontFamily="monospace" fontSize="8">CH 1</text>
        <text x="74" y="16" fill="currentColor" fontFamily="monospace" fontSize="8">CH 2</text>
        <text x="124" y="16" fill="currentColor" fontFamily="monospace" fontSize="8">CH 3</text>
        <text x="175" y="16" fill="currentColor" fontFamily="monospace" fontSize="8">MST</text>

        {/* Fader 1 */}
        <line x1="36" y1="26" x2="36" y2="105" strokeWidth="1.5" />
        <rect x="28" y="52" width="16" height="11" rx="2" strokeWidth="1.2" />
        <line x1="28" y1="57" x2="44" y2="57" strokeWidth="0.8" />

        {/* Fader 2 */}
        <line x1="86" y1="26" x2="86" y2="105" strokeWidth="1.5" />
        <rect x="78" y="42" width="16" height="11" rx="2" strokeWidth="1.2" />
        <line x1="78" y1="47" x2="94" y2="47" strokeWidth="0.8" />

        {/* Fader 3 */}
        <line x1="136" y1="26" x2="136" y2="105" strokeWidth="1.5" />
        <rect x="128" y="68" width="16" height="11" rx="2" strokeWidth="1.2" />
        <line x1="128" y1="73" x2="144" y2="73" strokeWidth="0.8" />

        {/* Master Stereo Segmented Meter */}
        <rect x="178" y="26" width="8" height="79" rx="2" />
        <rect x="190" y="26" width="8" height="79" rx="2" />

        {/* Segment ticks */}
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <line x1="179" y1={32 + i * 9} x2="185" y2={32 + i * 9} strokeWidth="1" />
            <line x1="191" y1={32 + i * 9} x2="197" y2={32 + i * 9} strokeWidth="1" />
          </g>
        ))}

        {/* dB scale markers */}
        <text x="204" y="34" fill="currentColor" fontFamily="monospace" fontSize="6.5">+3dB</text>
        <text x="204" y="60" fill="currentColor" fontFamily="monospace" fontSize="6.5">0dB</text>
        <text x="204" y="102" fill="currentColor" fontFamily="monospace" fontSize="6.5">-inf</text>

        {/* Waveform curve along bottom */}
        <path
          d="M 20 120 Q 35 110, 50 120 T 80 120 T 110 120 T 140 120 T 170 120 T 200 120"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />

        {/* Bottom Caption */}
        <text x="20" y="134" fill="currentColor" fontFamily="monospace" fontSize="7.5" letterSpacing="0.08em">
          AUDIO ENGINE · 48kHz 32-BIT
        </text>
      </g>
    </svg>
  );
}

/**
 * 35mm Cinema Gate & SMPTE Timecode Wireframe (Zero outer box, pure open line art)
 */
function LeftFilmGateHUD(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 110" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* 35mm Film Strip Track */}
        <rect x="15" y="12" width="210" height="56" rx="3" strokeWidth="1.4" />

        {/* Sprocket holes along top and bottom */}
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i}>
            <rect x={22 + i * 20} y="16" width="8" height="6" rx="1" strokeWidth="0.8" />
            <rect x={22 + i * 20} y="58" width="8" height="6" rx="1" strokeWidth="0.8" />
          </g>
        ))}

        {/* Center Frame Gate Crosshair */}
        <circle cx="120" cy="40" r="15" strokeDasharray="2 3" />
        <line x1="120" y1="30" x2="120" y2="50" strokeWidth="1.2" />
        <line x1="110" y1="40" x2="130" y2="40" strokeWidth="1.2" />

        {/* Optical Audio Track lines */}
        <line x1="20" y1="28" x2="220" y2="28" strokeDasharray="1 3" strokeWidth="0.8" />

        {/* SMPTE Timecode Display */}
        <text x="15" y="88" fill="currentColor" fontFamily="monospace" fontSize="8.5" letterSpacing="0.08em">
          SMPTE 00:08:07:12
        </text>
        <text x="15" y="102" fill="currentColor" fontFamily="monospace" fontSize="7.5" letterSpacing="0.08em">
          23.976 FPS · SUB-FRAME SYNC
        </text>
      </g>
    </svg>
  );
}

/**
 * Vectorscope & RGB Parade Monitor Wireframe (Zero outer box, pure open line art)
 */
function RightVectorscopeHUD(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Vectorscope Circular Reticle (Left Side of Graphic) */}
        <circle cx="68" cy="58" r="44" strokeWidth="1.4" />
        <circle cx="68" cy="58" r="32" strokeDasharray="2 3" />
        <circle cx="68" cy="58" r="3" />

        {/* Reticle Crosshairs */}
        <line x1="23" y1="58" x2="113" y2="58" strokeDasharray="2 2" strokeWidth="0.8" />
        <line x1="68" y1="13" x2="68" y2="103" strokeDasharray="2 2" strokeWidth="0.8" />

        {/* Skin-tone I-axis line */}
        <line x1="38" y1="28" x2="98" y2="88" strokeWidth="1.4" />

        {/* Mini Chroma Targets (R, G, B, Cy) */}
        <rect x="88" y="26" width="8" height="8" rx="1" />
        <rect x="94" y="54" width="8" height="8" rx="1" />
        <rect x="34" y="54" width="8" height="8" rx="1" />
        <rect x="42" y="26" width="8" height="8" rx="1" />

        {/* RGB Parade Monitor Frame (Right Side of Graphic) */}
        <rect x="130" y="18" width="92" height="80" rx="4" strokeWidth="1.2" />

        {/* IRE Level Lines */}
        <line x1="130" y1="33" x2="222" y2="33" strokeDasharray="1 3" strokeWidth="0.7" />
        <line x1="130" y1="58" x2="222" y2="58" strokeDasharray="1 3" strokeWidth="0.7" />
        <line x1="130" y1="83" x2="222" y2="83" strokeDasharray="1 3" strokeWidth="0.7" />

        {/* RGB Channel traces */}
        {/* Red */}
        <path d="M136 78 Q142 38 148 48 T156 78" strokeWidth="1.2" />
        <text x="143" y="91" fill="currentColor" fontFamily="monospace" fontSize="6.5">R</text>

        {/* Green */}
        <path d="M166 78 Q172 33 178 43 T186 78" strokeWidth="1.2" />
        <text x="173" y="91" fill="currentColor" fontFamily="monospace" fontSize="6.5">G</text>

        {/* Blue */}
        <path d="M196 78 Q202 43 208 53 T216 78" strokeWidth="1.2" />
        <text x="203" y="91" fill="currentColor" fontFamily="monospace" fontSize="6.5">B</text>

        {/* Bottom Caption */}
        <text x="20" y="132" fill="currentColor" fontFamily="monospace" fontSize="7.5" letterSpacing="0.08em">
          VECTORSCOPE · REC.709 DCI-P3
        </text>
      </g>
    </svg>
  );
}

/**
 * Transport Deck & WebCodecs GPU Matrix Wireframe (Zero outer box, pure open line art)
 */
function RightTransportDeckHUD(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 110" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Aluminum Jog Wheel (Left) */}
        <circle cx="65" cy="46" r="34" strokeWidth="1.4" />
        <circle cx="65" cy="46" r="26" strokeDasharray="2 3" />
        <circle cx="65" cy="46" r="10" strokeWidth="1.2" />
        <circle cx="53" cy="34" r="5" strokeWidth="1.2" />

        {/* Jog wheel peripheral angle ticks */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 65 + 30 * Math.cos(angle);
          const y1 = 46 + 30 * Math.sin(angle);
          const x2 = 65 + 34 * Math.cos(angle);
          const y2 = 46 + 34 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.4" />;
        })}

        {/* WebCodecs Pipeline Blocks (Right) */}
        <rect x="115" y="16" width="108" height="60" rx="3" strokeWidth="1.2" />
        <text x="122" y="31" fill="currentColor" fontFamily="monospace" fontSize="7.5" fontWeight="bold">
          WEBCODECS GPU
        </text>
        <text x="122" y="44" fill="currentColor" fontFamily="monospace" fontSize="7">
          NVDEC / VTB ACCEL
        </text>
        <text x="122" y="56" fill="currentColor" fontFamily="monospace" fontSize="7">
          60.00 FPS · 0.0ms JITTER
        </text>
        <text x="122" y="68" fill="currentColor" fontFamily="monospace" fontSize="7">
          H.264 & AAC MUXER
        </text>

        {/* Bottom Caption */}
        <text x="20" y="102" fill="currentColor" fontFamily="monospace" fontSize="7.5" letterSpacing="0.08em">
          DIRECT MP4 EXPORT · IN-BROWSER
        </text>
      </g>
    </svg>
  );
}
