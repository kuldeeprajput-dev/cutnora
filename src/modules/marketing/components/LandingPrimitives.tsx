import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "footer";
};

export function LandingContainer({
  as: Element = "div",
  className,
  ...props
}: ContainerProps) {
  return (
    <Element
      className={cn(
        "compact:w-[calc(100%_-_48px)] phone:w-[calc(100%_-_40px)] narrow:w-[calc(100%_-_32px)] mx-auto w-[min(1120px,calc(100%_-_64px))]",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "landing-reveal [&>p]:text-studio-muted phone:[&_h2]:text-[clamp(28px,8.3vw,36px)] phone:[&_h2]:leading-[1.15] phone:[&>p]:mt-3 phone:[&>p]:text-[14px] [&_h2]:text-[clamp(32px,3.4vw,46px)] [&_h2]:leading-[1.1] [&_h2]:font-semibold [&_h2]:tracking-[-0.045em] [&_h2]:text-balance [&>p]:mt-3.5 [&>p]:text-[15px] [&>p]:leading-[1.7]",
        className,
      )}
      {...props}
    />
  );
}

export function SectionLabel({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-studio-muted phone:mb-3 phone:text-[10px] mb-4 inline-flex items-center gap-1.75 font-mono text-[9px] font-medium tracking-[0.12em]",
        className,
      )}
      {...props}
    />
  );
}

export function FeatureCard({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn(
        "landing-reveal border-studio-border bg-studio-panel hover:border-studio-border-strong min-w-0 overflow-hidden rounded-xl border transition-[border-color] duration-200 ease-[ease]",
        className,
      )}
      {...props}
    />
  );
}

export function FeatureCopy({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "[&>svg]:text-studio-muted [&_p]:text-studio-muted laptop:p-6 compact:p-5.5 compact:[&_h3]:text-[21px] compact:[&_p]:text-[11px] phone:p-5 phone:[&>svg]:mb-3.5 phone:[&>svg]:w-5 phone:[&_h3]:text-[22px] phone:[&_h3]:leading-[1.25] phone:[&_p]:text-[13px] phone:[&_p]:leading-[1.65] p-7 [&_h3]:text-[24px] [&_h3]:leading-[1.14] [&_h3]:font-semibold [&_h3]:tracking-[-0.8px] [&_p]:mt-2.5 [&_p]:text-[13px] [&_p]:leading-[1.7] [&>svg]:mb-4.25",
        className,
      )}
      {...props}
    />
  );
}

function buttonClasses(small: boolean, className?: string) {
  return cn(
    "inline-flex min-h-11.5 items-center justify-center gap-4.5 rounded-lg border border-brand bg-brand px-5.5 py-0 text-[13px] font-semibold leading-[1.2] text-brand-contrast shadow-[0_2px_3px_rgb(0_0_0/6%)] transition-[background,transform,box-shadow] duration-200 ease-[ease] hover:bg-brand-hover hover:[transform:translateY(-2px)] hover:shadow-[0_5px_12px_rgb(0_0_0/10%)] active:[transform:translateY(0)] phone:min-h-12 phone:gap-3 phone:px-4.5 phone:text-[13px]",
    small && "min-h-9 gap-2.5 rounded-md px-3.5 text-[11px]",
    "leading-[1.2]",
    className,
  );
}

export function LandingAction({
  small = false,
  className,
  ...props
}: ComponentProps<typeof Link> & { small?: boolean }) {
  return <Link className={buttonClasses(small, className)} {...props} />;
}

export function LandingActionButton({
  small = false,
  className,
  ...props
}: ComponentProps<"button"> & { small?: boolean }) {
  return <button className={buttonClasses(small, className)} {...props} />;
}

export function OpenEditorButton({ className }: { className?: string }) {
  return (
    <LandingAction href="/projects/new" className={className}>
      Open Editor
      <ArrowRight size={17} />
    </LandingAction>
  );
}
