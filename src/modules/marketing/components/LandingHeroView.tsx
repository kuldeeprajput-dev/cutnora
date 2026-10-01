
        {/* Center Crosshair Ticks */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -top-1 -translate-x-1/2 h-1.5 w-0.5 bg-amber-500/70 dark:bg-amber-400/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -bottom-1 -translate-x-1/2 h-1.5 w-0.5 bg-amber-500/70 dark:bg-amber-400/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -left-1 -translate-y-1/2 h-0.5 w-1.5 bg-amber-500/70 dark:bg-amber-400/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -right-1 -translate-y-1/2 h-0.5 w-1.5 bg-amber-500/70 dark:bg-amber-400/80"
        />

        {/* Live Camera REC Status Badge (Left) */}
        <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-red-600 dark:text-red-400 uppercase select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" />
          REC
        </span>

        {/* Core Keyword Text */}
        <span className="relative z-10 font-semibold tracking-[-0.035em] text-zinc-950 dark:text-[#DEDEDE] px-1 sm:px-2">
          {children}
        </span>

        {/* 4K HDR Format Badge (Right) */}
        <span className="relative z-10 hidden min-[480px]:inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-amber-700 dark:text-amber-400 uppercase select-none">
          4K HDR
        </span>
      </span>
    </span>
  );
}

export function HeroIntroSection() {
  return (
    <section className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-20 sm:pb-14 lg:pt-24 text-center overflow-hidden">
      {/* Bespoke Cinema & Camera Gear Wireframe Background Artwork */}
      <HeroCameraArtwork />

      <div className="relative z-10">
        <div className="landing-reveal group relative mx-auto inline-flex items-center gap-2 rounded-full border border-zinc-300/80 bg-white/80 px-3.5 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[10.5px] font-semibold tracking-[0.18em] uppercase text-zinc-700 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-zinc-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#DEDEDE] dark:shadow-[0_2px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] dark:hover:border-white/20 dark:hover:bg-white/[0.07]">
          {/* Specular glass highlight line at the top */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/40 dark:via-[#DEDEDE]/30 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />
          <Sparkles className="h-3 w-3 text-amber-500 dark:text-[#DEDEDE]/70 transition-colors group-hover:text-amber-600 dark:group-hover:text-[#DEDEDE]" />
          <span>Browser-native video editing</span>
        </div>

        <h1 className="landing-reveal landing-reveal-delay-1 relative mx-auto mt-6 sm:mt-7 max-w-4xl text-balance text-[clamp(2.1rem,6.5vw,5.5rem)] font-medium leading-[1.12] tracking-[-0.04em]">
          <span className="block text-zinc-950 dark:text-[#DEDEDE]">The local-first</span>
          <span className="mt-2.5 sm:mt-3 block">
            <ViewfinderCameraFrame>Video editor</ViewfinderCameraFrame>
          </span>
        </h1>

        <p className="landing-reveal landing-reveal-delay-2 mx-auto mt-5 sm:mt-6 max-w-3xl text-center text-sm sm:text-lg leading-relaxed sm:leading-8 tracking-[-0.01em] text-zinc-600 dark:text-[#808080] px-2 sm:px-0">
          <span className="block">
            A simple but powerful{" "}
            <span className="font-semibold text-zinc-900 dark:text-[#DEDEDE]">
              multitrack video editor
            </span>{" "}
            that runs entirely in your browser.
          </span>
          <span className="block mt-1 sm:mt-1.5 font-medium text-zinc-800 dark:text-[#DEDEDE]">
            No cloud uploads, no account required,{" "}
            <span className="font-semibold text-zinc-950 dark:text-[#DEDEDE]">
              100% private to your device.
            </span>
          </span>
        </p>

        <div className="landing-reveal landing-reveal-delay-3 mt-7 sm:mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <PrimaryLink>Start a local edit</PrimaryLink>
          <a
            href="#showcase"
            onClick={(e) => {
              e.preventDefault();
              const container = document.getElementById("landing-scroll-container");
              const target = document.getElementById("showcase");
              if (target && container) {
                container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
              } else if (target) {
                target.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300/90 bg-white/90 px-5 text-sm font-semibold text-zinc-800 shadow-xs transition-all duration-300 hover:border-zinc-400 hover:bg-zinc-50 hover:scale-[1.02] active:scale-[0.98] dark:border-[#DEDEDE]/15 dark:bg-mkt-surface/90 dark:text-[#DEDEDE] dark:shadow-none dark:hover:border-[#DEDEDE]/30 dark:hover:bg-mkt-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            See the workspace
          </a>
        </div>

        {/* Technical Specs Bar */}
        <div className="landing-reveal landing-reveal-delay-4 mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-4 sm:gap-6 gap-y-2 text-[10.5px] sm:text-[11px] font-mono text-zinc-500 dark:text-[#808080]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-[#DEDEDE] dark:shadow-[0_0_6px_rgba(222,222,222,0.5)]" />{" "}
            WebCodecs 60 FPS
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-[#DEDEDE] dark:shadow-[0_0_6px_rgba(222,222,222,0.5)]" />{" "}
            Dexie IndexedDB
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-[#DEDEDE] dark:shadow-[0_0_6px_rgba(222,222,222,0.5)]" />{" "}
            Zero cloud uploads
          </span>
        </div>
      </div>
    </section>
  );
}
