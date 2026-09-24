import type { SVGProps } from "react";

export function HeroCameraArtwork() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Center gradient fade mask to keep text 100% readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_45%,var(--mkt-bg)_35%,transparent_100%)] z-10" />

      {/* Grid crosshair markers & technical coordinates */}
      <div className="absolute inset-0 opacity-20 dark:opacity-25 z-0">
        <svg
          className="h-full w-full stroke-zinc-400/40 dark:stroke-zinc-600/40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-grid-pattern"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 80 0 L 0 0 0 80" fill="none" strokeWidth="0.5" strokeDasharray="2 6" />
              <circle cx="80" cy="80" r="1" fill="currentColor" className="text-zinc-400 dark:text-zinc-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid-pattern)" />
        </svg>
      </div>

      {/* Top Left: Cinema Camera Rig with Matte Box & Top Handle */}
      <div className="hero-artwork-float-slow absolute left-4 sm:left-6 lg:left-8 top-1 sm:top-3 w-[260px] sm:w-[380px] lg:w-[460px] text-zinc-500/35 dark:text-[#808080] opacity-100 dark:opacity-30 transition-opacity duration-700">
        <CinemaCameraRigSvg className="w-full h-auto drop-shadow-sm" />
      </div>

      {/* Top Right: Studio Shotgun Microphone & Audio Waveform Ring */}
      <div className="hero-artwork-float-reverse absolute right-4 sm:right-6 lg:right-8 top-1 sm:top-4 w-[240px] sm:w-[350px] lg:w-[420px] text-zinc-500/35 dark:text-[#808080] opacity-100 dark:opacity-30 transition-opacity duration-700">
        <StudioMicAndLensSvg className="w-full h-auto drop-shadow-sm" />
      </div>

      {/* Bottom Left: Anamorphic Prime Lens & Aperture Blades */}
      <div className="hero-artwork-float-delayed absolute left-4 sm:left-6 lg:left-8 bottom-0 sm:bottom-4 w-[240px] sm:w-[340px] lg:w-[400px] text-zinc-500/30 dark:text-[#808080] opacity-100 dark:opacity-25 transition-opacity duration-700">
        <AnamorphicLensSvg className="w-full h-auto drop-shadow-sm" />
      </div>

      {/* Bottom Right: Digital Cinema Body & Viewfinder Top Plate */}
      <div className="hero-artwork-float-slow absolute right-4 sm:right-6 lg:right-8 bottom-0 sm:bottom-2 w-[260px] sm:w-[360px] lg:w-[420px] text-zinc-500/35 dark:text-[#808080] opacity-100 dark:opacity-30 transition-opacity duration-700">
        <CameraBodyTopPlateSvg className="w-full h-auto drop-shadow-sm" />
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

/**
 * Technical Cinema Camera Rig with Matte Box, French Flag, Rods & Handles
 */
function CinemaCameraRigSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Matte Box Hood */}
        <path d="M70 140 L160 170 L160 270 L70 300 Z" strokeDasharray="3 3" />
        <path d="M50 120 L180 160 L180 280 L50 320 Z" />
        <path d="M40 100 L190 150 L190 290 L40 340 Z" strokeWidth="0.8" opacity="0.6" />
        {/* French Flag / Top Eyebrow */}
        <path d="M40 100 L160 60 L240 85 L190 150 Z" />
        <line x1="80" y1="88" x2="200" y2="125" strokeDasharray="2 4" />
        {/* Lens Barrel inside Matte Box */}
        <circle cx="160" cy="220" r="42" strokeDasharray="2 3" />
        <circle cx="160" cy="220" r="28" />
        <circle cx="160" cy="220" r="14" strokeWidth="0.8" />
        {/* Camera Main Body Chassis */}
        <rect x="180" y="165" width="170" height="135" rx="8" />
        <rect x="195" y="180" width="80" height="60" rx="4" strokeDasharray="4 3" />
        {/* Sensor / Lens Mount Base */}
        <circle cx="180" cy="220" r="22" />
        {/* Top Handle and NATO Rail */}
        <path d="M220 165 L220 115 L320 115 L320 165" />
        <path d="M200 115 L340 115" strokeWidth="2" />
        <circle cx="240" cy="115" r="5" fill="currentColor" fillOpacity="0.3" />
        <circle cx="280" cy="115" r="5" fill="currentColor" fillOpacity="0.3" />
        <circle cx="320" cy="115" r="5" fill="currentColor" fillOpacity="0.3" />
        {/* 15mm Baseplate Support Rods */}
        <line x1="60" y1="315" x2="380" y2="315" strokeWidth="2.5" />
        <line x1="60" y1="327" x2="380" y2="327" strokeWidth="2.5" />
        <rect x="175" y="300" width="130" height="36" rx="4" />
        {/* Battery Plate / V-Mount in Back */}
        <rect x="350" y="180" width="35" height="110" rx="4" strokeDasharray="3 3" />
        <path d="M365 210 L375 225 L365 240" strokeWidth="1.5" />
        {/* Side Control Knobs & Audio XLR ports */}
        <circle cx="295" cy="200" r="8" />
        <circle cx="325" cy="200" r="8" />
        <circle cx="295" cy="230" r="8" />
        <circle cx="325" cy="230" r="8" />
        <circle cx="300" cy="270" r="10" strokeDasharray="2 2" />
        {/* Technical crosshairs & scale marks */}
        <line x1="20" y1="220" x2="45" y2="220" strokeWidth="1.5" />
        <line x1="32.5" y1="207.5" x2="32.5" y2="232.5" strokeWidth="1.5" />
      </g>
      {/* Stipple Dot Texture Overlay */}
      <g fill="currentColor" opacity="0.45">
        <circle cx="205" cy="190" r="1.5" />
        <circle cx="215" cy="190" r="1.5" />
        <circle cx="225" cy="190" r="1.5" />
        <circle cx="235" cy="190" r="1.5" />
        <circle cx="205" cy="200" r="1.5" />
        <circle cx="215" cy="200" r="1.5" />
        <circle cx="225" cy="200" r="1.5" />
        <circle cx="235" cy="200" r="1.5" />
        <circle cx="205" cy="210" r="1.5" />
        <circle cx="215" cy="210" r="1.5" />
        <circle cx="225" cy="210" r="1.5" />
        <circle cx="235" cy="210" r="1.5" />
        <circle cx="90" cy="180" r="1.2" />
        <circle cx="100" cy="190" r="1.2" />
        <circle cx="110" cy="200" r="1.2" />
        <circle cx="120" cy="210" r="1.2" />
        <circle cx="130" cy="220" r="1.2" />
        <circle cx="140" cy="230" r="1.2" />
      </g>
    </svg>
  );
}

/**
 * Studio Shotgun Microphone & Anamorphic Optical Element
 */
function StudioMicAndLensSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Shotgun Mic Barrel with Acoustic Phase Cancellation Slots */}
        <rect
          x="120"
          y="60"
          width="280"
          height="45"
          rx="22.5"
          transform="rotate(18 120 60)"
        />
        {/* Transverse acoustic slot lines */}
        <line x1="180" y1="80" x2="190" y2="110" strokeDasharray="3 3" />
        <line x1="200" y1="87" x2="210" y2="117" strokeDasharray="3 3" />
        <line x1="220" y1="94" x2="230" y2="124" strokeDasharray="3 3" />
        <line x1="240" y1="101" x2="250" y2="131" strokeDasharray="3 3" />
        <line x1="260" y1="108" x2="270" y2="138" strokeDasharray="3 3" />
        <line x1="280" y1="115" x2="290" y2="145" strokeDasharray="3 3" />
        <line x1="300" y1="122" x2="310" y2="152" strokeDasharray="3 3" />
        <line x1="320" y1="129" x2="330" y2="159" strokeDasharray="3 3" />
        <line x1="340" y1="136" x2="350" y2="166" strokeDasharray="3 3" />

        {/* Shockmount Cradle Rubber Rings */}
        <ellipse cx="230" cy="115" rx="35" ry="45" transform="rotate(18 230 115)" strokeWidth="1.5" />
        <ellipse cx="310" cy="142" rx="35" ry="45" transform="rotate(18 310 142)" strokeWidth="1.5" />
        <path d="M220 160 L245 220 L300 220 L325 180" strokeWidth="2" />
        <circle cx="272" cy="220" r="12" />

        {/* Cinema Lens Focus Ring Gears */}
        <circle cx="340" cy="270" r="90" strokeDasharray="4 4" />
        <circle cx="340" cy="270" r="75" />
        <circle cx="340" cy="270" r="60" strokeDasharray="2 3" />
        <circle cx="340" cy="270" r="45" />
        <circle cx="340" cy="270" r="30" strokeWidth="0.8" />
        <circle cx="340" cy="270" r="16" />

        {/* Gear Teeth Peripheral Ticks */}
        <line x1="245" y1="270" x2="255" y2="270" strokeWidth="2" />
        <line x1="425" y1="270" x2="435" y2="270" strokeWidth="2" />
        <line x1="340" y1="175" x2="340" y2="185" strokeWidth="2" />
        <line x1="340" y1="355" x2="340" y2="365" strokeWidth="2" />
        <line x1="273" y1="203" x2="280" y2="210" strokeWidth="2" />
        <line x1="400" y1="330" x2="407" y2="337" strokeWidth="2" />
        <line x1="273" y1="337" x2="280" y2="330" strokeWidth="2" />
        <line x1="400" y1="210" x2="407" y2="203" strokeWidth="2" />

        {/* Focal distance marks text simulation */}
        <path d="M335 195 L345 195" strokeWidth="1.5" />
        <path d="M355 200 L365 203" strokeWidth="1" />
        <path d="M375 210 L383 215" strokeWidth="1" />
        <path d="M390 225 L396 232" strokeWidth="1.5" />
      </g>
      {/* Mesh dot pattern */}
      <g fill="currentColor" opacity="0.4">
        <circle cx="140" cy="80" r="1.5" />
        <circle cx="150" cy="83" r="1.5" />
        <circle cx="160" cy="86" r="1.5" />
        <circle cx="170" cy="89" r="1.5" />
        <circle cx="145" cy="90" r="1.5" />
        <circle cx="155" cy="93" r="1.5" />
        <circle cx="165" cy="96" r="1.5" />
      </g>
    </svg>
  );
}

/**
 * Anamorphic Prime Lens Barrel with Aperture Blades
 */
function AnamorphicLensSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 460 400" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Main Lens Barrel Cylinders */}
        <rect x="70" y="110" width="130" height="210" rx="8" />
        <rect x="195" y="130" width="110" height="170" rx="4" strokeDasharray="3 3" />
        <rect x="300" y="145" width="80" height="140" rx="4" />
        <rect x="375" y="160" width="30" height="110" rx="2" strokeWidth="1.5" />

        {/* Front Lens Element Glass Bulge */}
        <path d="M70 120 C45 150, 45 280, 70 310" strokeWidth="1.8" />
        <path d="M60 140 C45 170, 45 250, 60 280" strokeWidth="1" strokeDasharray="2 4" />

        {/* Iris / Aperture 9-Blade Geometry */}
        <polygon points="135,175 165,190 155,225 120,235 105,200" strokeWidth="1.5" />
        <line x1="135" y1="175" x2="185" y2="180" />
        <line x1="165" y1="190" x2="175" y2="240" />
        <line x1="155" y1="225" x2="110" y2="250" />
        <line x1="120" y1="235" x2="85" y2="210" />
        <line x1="105" y1="200" x2="115" y2="160" />

        {/* Follow Focus Gear Rings */}
        <line x1="100" y1="110" x2="100" y2="320" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="155" y1="110" x2="155" y2="320" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="230" y1="130" x2="230" y2="300" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="270" y1="130" x2="270" y2="300" strokeWidth="2" strokeDasharray="3 3" />

        {/* Precision Measurement Ticks */}
        <line x1="195" y1="140" x2="205" y2="140" strokeWidth="2" />
        <line x1="195" y1="155" x2="212" y2="155" strokeWidth="2" />
        <line x1="195" y1="170" x2="205" y2="170" strokeWidth="2" />
        <line x1="195" y1="185" x2="212" y2="185" strokeWidth="2" />
        <line x1="195" y1="200" x2="205" y2="200" strokeWidth="2" />
        <line x1="195" y1="215" x2="220" y2="215" strokeWidth="2.5" />
        <line x1="195" y1="230" x2="205" y2="230" strokeWidth="2" />
        <line x1="195" y1="245" x2="212" y2="245" strokeWidth="2" />
        <line x1="195" y1="260" x2="205" y2="260" strokeWidth="2" />
        <line x1="195" y1="275" x2="212" y2="275" strokeWidth="2" />

        {/* 50mm T1.5 Engraving Mock */}
        <text
          x="320"
          y="220"
          fill="currentColor"
          fontFamily="monospace"
          fontSize="11"
          letterSpacing="0.1em"
          opacity="0.7"
        >
          50mm T1.5
        </text>
      </g>
    </svg>
  );
}

/**
 * Modern Mirrorless / Cinema Body Top Plate Controls & Viewfinder
 */
function CameraBodyTopPlateSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Camera Top Plate Contour */}
        <path
          d="M80 260 L80 180 Q80 160 100 160 L180 160 L205 130 L315 130 L340 160 L420 160 Q440 160 440 180 L440 260 Z"
          strokeWidth="1.8"
        />

        {/* Viewfinder Prism / Hot Shoe */}
        <rect x="225" y="105" width="70" height="28" rx="3" />
        <rect x="238" y="93" width="44" height="14" rx="2" strokeWidth="1.5" />

        {/* Left Mode Dial Wheel */}
        <ellipse cx="140" cy="155" rx="32" ry="14" />
        <line x1="110" y1="155" x2="110" y2="170" />
        <line x1="170" y1="155" x2="170" y2="170" />
        <path d="M110 170 Q140 182 170 170" />
        {/* Dial Ridges */}
        <line x1="120" y1="157" x2="120" y2="169" strokeDasharray="1 2" />
        <line x1="130" y1="160" x2="130" y2="171" strokeDasharray="1 2" />
        <line x1="140" y1="161" x2="140" y2="172" strokeDasharray="1 2" />
        <line x1="150" y1="160" x2="150" y2="171" strokeDasharray="1 2" />
        <line x1="160" y1="157" x2="160" y2="169" strokeDasharray="1 2" />

        {/* Right Shutter Button & Exposure Comp Dial */}
        <ellipse cx="380" cy="155" rx="30" ry="13" />
        <line x1="352" y1="155" x2="352" y2="168" />
        <line x1="408" y1="155" x2="408" y2="168" />
        <path d="M352 168 Q380 180 408 168" />

        {/* Secondary Shutter & Front Wheel */}
        <rect x="410" y="180" width="22" height="40" rx="4" />
        <circle cx="421" cy="195" r="7" strokeWidth="1.5" />

        {/* Top LCD Status Display */}
        <rect x="180" y="185" width="160" height="60" rx="6" strokeDasharray="4 2" />
        <text
          x="192"
          y="212"
          fill="currentColor"
          fontFamily="monospace"
          fontSize="10"
          letterSpacing="0.1em"
          opacity="0.8"
        >
          ISO 800  1/50
        </text>
        <text
          x="192"
          y="232"
          fill="currentColor"
          fontFamily="monospace"
          fontSize="10"
          letterSpacing="0.1em"
          opacity="0.8"
        >
          f/2.8  LOG-3
        </text>
      </g>
      {/* Subtle stipple clusters */}
      <g fill="currentColor" opacity="0.4">
        <circle cx="95" cy="195" r="1.2" />
        <circle cx="105" cy="195" r="1.2" />
        <circle cx="115" cy="195" r="1.2" />
        <circle cx="95" cy="205" r="1.2" />
        <circle cx="105" cy="205" r="1.2" />
        <circle cx="115" cy="205" r="1.2" />
        <circle cx="95" cy="215" r="1.2" />
        <circle cx="105" cy="215" r="1.2" />
        <circle cx="115" cy="215" r="1.2" />
      </g>
    </svg>
  );
}
