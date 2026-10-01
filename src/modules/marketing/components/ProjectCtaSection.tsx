          <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 sm:gap-4 w-full">
            <Link
              href="/projects/new"
              className="group inline-flex h-11 sm:h-12 w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 rounded-full bg-zinc-950 px-6 sm:px-7 text-sm sm:text-[15px] font-semibold text-white whitespace-nowrap shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-[#DEDEDE] dark:text-[#0d0d0d] dark:shadow-[0_0_28px_rgba(222,222,222,0.18)] dark:hover:bg-[#ECECEC] dark:hover:shadow-[0_0_36px_rgba(222,222,222,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <span className="whitespace-nowrap">Launch Cutnora Project</span>
              <ArrowUpRight className="h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <a
              href={siteConfig.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 sm:h-12 w-full sm:w-auto sm:ml-auto shrink-0 items-center justify-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/80 px-4.5 sm:px-5.5 text-sm sm:text-[15px] font-medium text-zinc-800 whitespace-nowrap backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#DEDEDE] dark:hover:border-white/20 dark:hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <GithubIcon className="h-4.5 w-4.5 shrink-0 fill-current transition-transform duration-200 group-hover:scale-110" />
              <span className="whitespace-nowrap">Star on GitHub</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-zinc-700 dark:text-[#DEDEDE] leading-none">
                <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                <span>{starCount !== null ? (starCount >= 1000 ? `${(starCount / 1000).toFixed(1)}k` : starCount) : "6"}</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export const StudioCtaSection = ProjectCtaSection;
export type StudioCtaSectionProps = ProjectCtaSectionProps;
