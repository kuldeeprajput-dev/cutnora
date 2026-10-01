"use client";

import { GithubIcon } from "./GithubIcon";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const outsideClick = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", outsideClick);
    return () => {
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", outsideClick);
    };
  }, [menuOpen]);

  return (
    <header className="lp-header" ref={header}>
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
          <button
            ref={menuButton}
            className="lp-menu-button"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      <nav
        id="landing-mobile-nav"
        className="lp-mobile-nav"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        {navigation.map(([label, href], index) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>
            <span className="lp-mono">0{index + 1}</span>
            {label}
            <ArrowRight size={16} />
          </a>
        ))}
        <div className="lp-mobile-nav-footer">
          <Link href="/projects">Projects</Link>
          <a
            href={siteConfig.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon size={16} />
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}
