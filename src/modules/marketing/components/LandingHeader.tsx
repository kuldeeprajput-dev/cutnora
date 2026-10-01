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
    <header className="lp-header">
      <div className="lp-nav">
        <Link href="/" className="lp-brand" aria-label="Cutnora home">
          <BrandMark size={29} />
          <span>Cutnora</span>
        </Link>
        <nav className="lp-desktop-nav" aria-label="Main navigation">
          {navigation.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="lp-nav-actions">
          <a
            className="lp-github"
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
            className="lp-theme-toggle theme-toggle"
          />
          <Link href="/projects" className="lp-button lp-button-small">
            Projects
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
