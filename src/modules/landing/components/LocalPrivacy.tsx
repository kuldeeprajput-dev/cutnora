import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  FileVideo,
  LockKeyhole,
  Music,
  Play,
  ShieldCheck,
} from "lucide-react";
import {
  LandingContainer,
  SectionHeading,
  SectionLabel,
} from "./LandingPrimitives";

export function LocalPrivacy() {
  return (
    <section
      className="bg-mkt-bg phone:py-14 py-22.5"
      id="privacy"
      aria-labelledby="privacy-heading"
    >
      <LandingContainer className="laptop:gap-8.75 laptop:grid-cols-[1fr_1.6fr] compact:grid-cols-[1fr] compact:gap-8.75 phone:gap-7 grid grid-cols-[1fr_1.6fr] items-center gap-17.5">
        <SectionHeading className="compact:[&>p]:max-w-107.5 phone:[&>p]:text-[14px] phone:[&>p]:leading-[1.7] [&>p]:max-w-81.25 [&>p]:text-[13px] [&>p]:leading-[1.7]">
          <SectionLabel>
            <LockKeyhole size={13} />
            LOCAL BY DESIGN
          </SectionLabel>
          <h2 id="privacy-heading">
            Your videos
            <br />
            stay yours.
          </h2>
          <p>
            Media and projects are stored in this browser on this device. Edit
            without sending your footage to a server.
          </p>
          <ul className="compact:flex-row compact:flex-wrap compact:gap-4.5 phone:flex-col phone:gap-3 phone:text-[13px] mt-5.5 mr-0 mb-0 ml-0 flex list-none flex-col gap-2.75 p-0 text-[11px] [&_li]:flex [&_li]:items-center [&_li]:gap-2.25">
            <li>
              <Check size={15} />
              No media upload queue
            </li>
            <li>
              <Check size={15} />
              No account to get started
            </li>
            <li>
              <Check size={15} />
              Your project, saved locally
            </li>
          </ul>
        </SectionHeading>
        <div className="border-studio-border-strong bg-studio-panel laptop:py-5 laptop:px-3.75 compact:p-6.25 phone:py-5 phone:px-4 landing-reveal rounded-xl border p-6">
          <div className="flex items-center justify-center gap-2.5 text-[13px]">
            <ShieldCheck size={21} />
            <strong>Your device</strong>
          </div>
          <div className="laptop:gap-1.75 compact:gap-5 phone:grid-cols-[minmax(0,_1fr)] phone:gap-3 phone:py-6 grid grid-cols-[1fr_auto_1.5fr_auto_1fr] items-center gap-3 py-7.5">
            <DeviceNode label="Your files" description="Video, audio, images">
              <div className="[&>svg:last-child]:border-studio-fg [&>svg:last-child]:bg-studio-panel phone:h-21 phone:w-14.5 phone:[&>svg:first-child]:w-9.5 phone:[&>svg:first-child]:h-12 phone:[&>svg:last-child]:w-7.25 phone:[&>svg:last-child]:h-8.5 phone:[&>svg:last-child]:top-4 phone:[&>svg:last-child]:right-[-2px] phone:[&>svg:last-child]:p-1.25 relative flex h-26.25 w-21.25 items-center justify-center [&>svg:first-child]:h-16.25 [&>svg:first-child]:w-13.5 [&>svg:first-child]:[transform:rotate(-8deg)] [&>svg:last-child]:absolute [&>svg:last-child]:top-4.25 [&>svg:last-child]:right-[-1px] [&>svg:last-child]:h-11.25 [&>svg:last-child]:w-9.25 [&>svg:last-child]:[transform:rotate(8deg)] [&>svg:last-child]:rounded [&>svg:last-child]:border [&>svg:last-child]:p-1.75">
                <FileVideo size={36} />
                <Music size={24} />
              </div>
            </DeviceNode>
            <ArrowRight
              className="text-studio-muted phone:w-4.5 phone:justify-self-center phone:[transform:rotate(90deg)]"
              size={22}
            />
            <DeviceNode
              label="Cutnora in your browser"
              description="Edit locally on this device"
            >
              <div className="border-studio-border-strong bg-studio-bg laptop:w-31.25 compact:w-37.5 phone:w-21.25 phone:h-21 narrow:w-19 h-26.25 w-37 overflow-hidden rounded-[7px] border">
                <div className="[&_i]:bg-studio-muted flex h-4.5 items-center gap-1 px-1.75 py-0 [border-bottom:1px_solid_var(--studio-border)] [&_i]:h-1 [&_i]:w-1 [&_i]:rounded-full [&_i]:opacity-50">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="bg-canvas-bg phone:h-8.25 phone:my-1.25 phone:mx-2 mx-3.5 my-1.5 flex h-10.75 items-center justify-center rounded-[3px]">
                  <Play size={22} />
                </div>
                <div className="[&_span]:bg-studio-muted mx-2.5 flex flex-col gap-0.75 [&_span]:h-1 [&_span]:w-[85%] [&_span]:opacity-30 [&_span:nth-child(2)]:ml-[20%] [&_span:nth-child(2)]:w-[45%] [&_span:nth-child(3)]:w-[70%]">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </DeviceNode>
            <ArrowRight
              className="text-studio-muted phone:w-4.5 phone:justify-self-center phone:[transform:rotate(90deg)]"
              size={22}
            />
            <DeviceNode
              label="Exported file"
              description="Saved to your device"
            >
              <div className="phone:h-21 phone:[&_svg]:w-9.5 phone:[&_svg]:h-12.25 flex h-26.25 items-center justify-center [&_svg]:h-17.5 [&_svg]:w-14 [&_svg]:stroke-[1]">
                <FileVideo size={39} />
              </div>
            </DeviceNode>
          </div>
          <p className="text-studio-muted phone:text-[11px] phone:px-0 pt-3.75 text-center text-[9px] leading-[1.6] [border-top:1px_solid_var(--studio-border)]">
            Browser storage can be cleared. Keep a copy of important projects
            and exports.
          </p>
        </div>
      </LandingContainer>
    </section>
  );
}

function DeviceNode({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="[&>span]:text-studio-muted laptop:[&>span]:text-[7px] compact:[&>span]:text-[9px] compact:[&_strong]:text-[12px] phone:grid phone:grid-cols-[88px_minmax(0,_1fr)] phone:gap-x-3 phone:gap-y-1 phone:text-left phone:justify-items-start phone:[&>div]:[grid-row:1_/_3] phone:[&>div]:justify-self-center phone:[&_strong]:self-end phone:[&_strong]:text-[12px] phone:[&_strong]:leading-[1.5] phone:[&>span]:block phone:[&>span]:self-start phone:[&>span]:text-[11px] phone:[&>span]:whitespace-normal phone:[&>span]:leading-[1.5] narrow:grid-cols-[76px_minmax(0,_1fr)] narrow:gap-x-2 flex flex-col items-center gap-2 text-center [&_strong]:text-[10px] [&_strong]:font-medium [&>span]:text-[8px] [&>span]:whitespace-nowrap">
      {children}
      <strong>{label}</strong>
      <span>{description}</span>
    </div>
  );
}
