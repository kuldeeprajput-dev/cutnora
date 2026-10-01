import { GithubIcon } from "./GithubIcon";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { siteConfig } from "@/config/site";

export function LandingFooter() {
  return (
    <footer className="lp-footer lp-container">
      <div className="lp-footer-main">
        <Link href="/" className="lp-brand">
          <BrandMark size={25} />
          <span>Cutnora</span>
        </Link>
        <p>A creative workspace. On your own terms.</p>
        <nav aria-label="Footer navigation">
          <a
            href={siteConfig.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon size={15} />
            GitHub
            <ArrowUpRight size={13} />
          </a>
          <a href="#privacy">Privacy</a>
          <Link href="/projects">Existing projects</Link>
        </nav>
      </div>
      <div className="lp-footer-bottom">
        <span>© {new Date().getFullYear()} Cutnora</span>
        <a
          href={siteConfig.twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Built by {siteConfig.twitterHandle}
          <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}
