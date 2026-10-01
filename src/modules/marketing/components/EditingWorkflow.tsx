import Image from "next/image";
import { TimelineArtwork } from "./TimelineArtwork";
import {
  ArrowRight,
  Check,
  Download,
  FileVideo,
  FolderPlus,
  ImageIcon,
  Monitor,
  Music,
  Scissors,
} from "lucide-react";
import {
  LandingContainer,
  SectionHeading,
  SectionLabel,
} from "./LandingPrimitives";

const steps = [
  {
    number: "01",
    title: "Import",
    description: "Bring in video, audio, or images.",
    icon: FolderPlus,
  },
  {
    number: "02",
    title: "Edit",
    description: "Arrange your timeline. Make it yours.",
    icon: Scissors,
  },
  {
    number: "03",
    title: "Export",
    description: "Render locally and save your video.",
    icon: Download,
  },
];

export function EditingWorkflow() {
  return (
    <LandingContainer
      as="section"
      className="compact:py-20 phone:py-14 pt-28 pb-28"
      id="workflow"
      aria-labelledby="workflow-heading"
    >
      <SectionHeading>
        <SectionLabel>A SIMPLE WORKFLOW</SectionLabel>
        <h2 id="workflow-heading">From first clip to final cut.</h2>
        <p>Three steps. One browser tab.</p>
      </SectionHeading>
      <div className="compact:gap-6.25 phone:grid-cols-[1fr] phone:gap-8 phone:mt-7 mt-9.5 grid grid-cols-[repeat(3,_1fr)] gap-11.5">
        {steps.map(({ number, title, description, icon: Icon }, index) => (
          <article
            className="[&>p]:text-studio-muted phone:block phone:[&>p]:text-[14px] phone:[&>p]:mt-2 landing-reveal relative min-w-0 [&>p]:mt-2.5 [&>p]:text-[12px] [&>p]:leading-[1.7]"
            key={title}
          >
            <div className="[&>span]:text-studio-muted phone:self-end phone:gap-2.5 phone:[&>span]:text-[17px] phone:[&_h3]:text-[21px] flex items-center gap-3.5 [&_h3]:text-[20px] [&_h3]:font-semibold [&_h3]:tracking-[-0.7px] [&>span]:text-[20px] [&>span]:tracking-[-1px] [&>span]:opacity-65">
              <span className="font-mono tabular-nums">{number}</span>
              <h3>{title}</h3>
            </div>
            <p>{description}</p>
            <div
              className="border-studio-border bg-studio-panel compact:h-36.25 phone:mt-4 phone:h-42 mt-5.5 h-42.25 overflow-hidden rounded-[9px] border"
              aria-hidden="true"
            >
              <div className="[&_i]:bg-studio-muted bg-studio-panel-raised flex h-5.5 items-center gap-1 px-1.75 py-0 [border-bottom:1px_solid_var(--studio-border)] [&_i]:h-1 [&_i]:w-1 [&_i]:rounded-full [&_i]:opacity-50">
                <i />
                <i />
                <i />
              </div>
              {index === 0 ? (
                <div className="[&>div:last-child]:bg-studio-bg [&_small]:text-studio-muted compact:p-2.25 compact:gap-1.25 compact:h-30.75 compact:[&>div:first-child_span]:text-[8px] compact:[&>div:first-child_span]:gap-1.25 compact:[&>div:last-child]:text-[9px] compact:[&>div:last-child]:gap-1.75 compact:[&_small]:text-[6px] phone:h-36 phone:p-3 phone:grid-cols-[1fr] phone:[&>div:last-child]:text-[13px] phone:[&>div:last-child]:gap-2.5 phone:[&_small]:text-[11px] phone:[&>div:first-child]:hidden grid h-36.5 grid-cols-[1fr_1.4fr] items-center gap-2 p-3.5 [&_small]:text-[8px] [&>div:first-child]:flex [&>div:first-child]:flex-col [&>div:first-child]:gap-3.75 [&>div:first-child_span]:flex [&>div:first-child_span]:items-center [&>div:first-child_span]:gap-2 [&>div:first-child_span]:text-[10px] [&>div:first-child_svg]:h-3.5 [&>div:first-child_svg]:w-3.5 [&>div:last-child]:flex [&>div:last-child]:h-full [&>div:last-child]:flex-col [&>div:last-child]:items-center [&>div:last-child]:justify-center [&>div:last-child]:gap-2.25 [&>div:last-child]:rounded-[5px] [&>div:last-child]:text-[10px] [&>div:last-child]:[border:1px_dashed_var(--studio-border-strong)]">
                  <div>
                    <span>
                      <FileVideo />
                      Video
                    </span>
                    <span>
                      <Music />
                      Audio
                    </span>
                    <span>
                      <ImageIcon />
                      Images
                    </span>
                  </div>
                  <div>
                    <Icon size={30} />
                    <span>Add media</span>
                    <small>or drag and drop</small>
                  </div>
                </div>
              ) : index === 1 ? (
                <TimelineArtwork compact variant="workflow" />
              ) : (
                <div className="[&>span]:text-studio-muted phone:[&>span]:text-[11px] flex flex-col items-center gap-2 px-5 py-2.5 [&>span]:flex [&>span]:items-center [&>span]:gap-1.25 [&>span]:text-[8px]">
                  <div className="compact:w-25 compact:h-15 phone:w-35 phone:h-20 h-18.75 w-32.5 overflow-hidden rounded [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                    <Image
                      src="/images/coastal-still.webp"
                      width={1672}
                      height={941}
                      alt=""
                      sizes="130px"
                      loading="lazy"
                    />
                  </div>
                  <div className="bg-studio-fg h-1 w-[88%] rounded-[2px]" />
                  <span>
                    <Check size={12} />
                    Ready to save
                  </span>
                </div>
              )}
            </div>
            {index < 2 && (
              <ArrowRight
                className="text-studio-muted compact:right-[-22px] compact:w-4.25 compact:top-39.25 phone:hidden absolute top-40.5 right-[-34px]"
                size={22}
              />
            )}
          </article>
        ))}
      </div>
      <div className="bg-studio-panel-raised [&_p]:text-studio-muted [&_p_>_span]:bg-studio-muted compact:flex-col compact:items-start compact:gap-3.75 compact:p-5.5 phone:mt-8 phone:p-5 phone:[&_p]:flex-wrap phone:[&_p]:gap-2 phone:[&_p]:text-[12px] phone:[&_p]:leading-[1.6] mt-9.5 flex items-center justify-between gap-5 rounded-[9px] px-7.5 py-5.75 [&_h3]:text-[14px] [&_h3]:font-semibold [&_h3]:tracking-[-0.3px] [&_p]:flex [&_p]:items-center [&_p]:gap-3.5 [&_p]:text-[11px] [&_p_>_span]:h-0.75 [&_p_>_span]:w-0.75 [&_p_>_span]:rounded-full [&>div]:flex [&>div]:items-center [&>div]:gap-3.25">
        <div>
          <Monitor size={23} />
          <h3>Built for the browser.</h3>
        </div>
        <p>
          Local storage
          <span />
          Canvas playback
          <span />
          Browser-based export
        </p>
      </div>
    </LandingContainer>
  );
}
