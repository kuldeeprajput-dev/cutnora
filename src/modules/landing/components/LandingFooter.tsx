import { LandingContainer } from "./LandingPrimitives";
import { GithubIcon } from "./GithubIcon";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { siteConfig } from "@/config/site";

export function LandingFooter() {
  return (
    <LandingContainer
      as="footer"
      className="[&_a:hover]:text-studio-fg phone:py-6 pt-7.25 pb-5.5 [border-top:1px_solid_var(--studio-border)]"
    >
      <div className="[&>p]:text-studio-muted [&>nav_>_a]:text-studio-muted compact:flex-wrap compact:[&>nav]:w-full compact:[&>nav]:ml-0 compact:[&>nav]:pt-2 phone:gap-3 phone:[&>p]:w-full phone:[&>p]:max-w-[none] phone:[&>p]:text-[12px] phone:[&>p]:leading-[1.6] phone:[&>nav]:flex-wrap phone:[&>nav]:gap-[4px_20px] phone:[&>nav]:pt-0 phone:[&>nav]:text-[12px] phone:[&>nav_>_a]:min-h-11 flex items-center gap-4.5 [&>nav]:ml-auto [&>nav]:flex [&>nav]:gap-5.75 [&>nav]:text-[10px] [&>nav_>_a]:flex [&>nav_>_a]:items-center [&>nav_>_a]:gap-1.5 [&>p]:text-[10px]">
        <Link
          href="/"
          className="text-studio-fg phone:gap-1.75 phone:[&>span:first-child]:w-6.25! phone:[&>span:first-child]:h-6.25! inline-flex items-center gap-2.25 text-[17px] font-bold tracking-[-0.8px]"
        >
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
      <div className="text-studio-muted phone:flex-wrap phone:gap-[8px_16px] phone:items-center phone:mt-5 phone:text-[11px] phone:leading-[1.6] phone:[&>a]:min-h-11 mt-6.25 flex items-center justify-between text-[9px] [&>a]:flex [&>a]:items-center [&>a]:gap-1.25 [&>a]:text-[inherit]">
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
    </LandingContainer>
  );
}
