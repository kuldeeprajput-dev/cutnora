import { LandingAction } from "./LandingPrimitives";
import { GithubIcon } from "./GithubIcon";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { siteConfig } from "@/config/site";

const navigation = [
  ["Features", "#features"],
  ["How it works", "#workflow"],
  ["Privacy", "#privacy"],
  ["Shortcuts", "#shortcuts"],
] as const;

export function LandingHeader() {
  return (
    <header className="border-studio-border compact:w-[calc(100%_-_40px)] compact:top-3 phone:w-[calc(100%_-_24px)] phone:top-2.5 phone:rounded-[10px] sticky top-4 z-50 mx-auto w-[min(1120px,_calc(100%_-_64px))] rounded-xl border bg-[color-mix(in_srgb,_var(--studio-topbar)_90%,_transparent)] shadow-[0_4px_20px_-12px_rgb(0_0_0_/_15%)] backdrop-blur-[16px]">
      <div className="laptop:gap-3 compact:h-15 compact:px-3.5 phone:h-16 phone:gap-1.5 phone:px-2 flex h-15 items-center justify-between gap-5 pt-0 pr-4 pb-0 pl-5">
        <Link
          href="/"
          className="text-studio-fg compact:text-[19px] phone:gap-1.75 phone:text-[18px] phone:min-h-11 phone:shrink-0 phone:[&>span:first-child]:w-6.25! phone:[&>span:first-child]:h-6.25! inline-flex items-center gap-2.25 text-[21px] font-bold tracking-[-0.8px]"
          aria-label="Cutnora home"
        >
          <BrandMark size={29} />
          <span>Cutnora</span>
        </Link>
        <nav
          className="[&_a]:text-studio-muted [&_a:hover]:text-studio-fg laptop:gap-4.25 laptop:ml-0 compact:hidden ml-6.25 flex gap-6.5 [&_a]:text-[12px] [&_a]:font-medium [&_a]:[transition:color_0.2s]"
          aria-label="Main navigation"
        >
          {navigation.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="laptop:gap-2 phone:gap-0.5 flex items-center gap-3">
          <a
            className="text-studio-fg laptop:[&_span]:hidden compact:w-8.5 compact:h-8.5 compact:justify-center compact:rounded-md phone:w-11 phone:h-11 phone:shrink-0 flex items-center gap-1.75 text-[12px]"
            href={siteConfig.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <GithubIcon size={17} />
            <span>GitHub</span>
          </a>
          <ThemeToggle
            variant="ghost"
            className="theme-toggle phone:w-11 phone:h-11 phone:shrink-0 h-8.5 w-8.5 rounded-md p-0"
          />
          <LandingAction
            small
            href="/projects"
            className="phone:min-h-11 phone:px-2.5 phone:text-[11px] phone:[&>svg]:hidden"
          >
            Projects
            <ArrowRight size={15} />
          </LandingAction>
        </div>
      </div>
    </header>
  );
}
