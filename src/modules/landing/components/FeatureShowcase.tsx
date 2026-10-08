import Image from "next/image";
import { TimelineArtwork } from "./TimelineArtwork";
import {
  ArrowRight,
  ImageIcon,
  Layers,
  Music,
  Play,
  Scissors,
  Type,
  Undo2,
} from "lucide-react";
import {
  LandingContainer,
  SectionHeading,
  SectionLabel,
  FeatureCard,
  FeatureCopy,
} from "./LandingPrimitives";

export function FeatureShowcase() {
  return (
    <LandingContainer
      as="section"
      className="compact:py-20 phone:py-14 pt-28 pb-28"
      id="features"
      aria-labelledby="features-heading"
    >
      <SectionHeading className="text-center">
        <SectionLabel>THE CREATIVE WORKSPACE</SectionLabel>
        <h2 id="features-heading">Everything your story needs.</h2>
        <p>A focused workspace. Room for every layer.</p>
      </SectionHeading>
      <div className="compact:grid-cols-[1.7fr_1fr] compact:gap-3 phone:grid-cols-[1fr] phone:gap-4 phone:mt-7 mt-10 grid grid-cols-[1.9fr_1fr] gap-4">
        <FeatureCard>
          <FeatureCopy>
            <Scissors size={22} />
            <h3>Make every cut count.</h3>
            <p>Trim, split, and arrange video across multiple tracks.</p>
          </FeatureCopy>
          <div className="border-studio-border compact:mt-0 compact:mr-3.5 compact:mb-3.5 compact:ml-3.5 mt-0 mr-5.5 mb-5.5 ml-5.5 overflow-hidden rounded-lg border">
            <div
              className="flex items-center justify-between px-3.5 py-3 text-[9px] [border-bottom:1px_solid_var(--studio-border)]"
              aria-hidden="true"
            >
              <span className="font-mono tabular-nums">
                00:08 <span className="text-studio-muted">/ 00:28</span>
              </span>
              <Play size={15} fill="currentColor" />
              <span>Fit timeline</span>
            </div>
            <TimelineArtwork variant="feature" />
          </div>
        </FeatureCard>
        <FeatureCard className="phone:grid phone:grid-cols-[minmax(0,_1fr)_94px] phone:items-center flex flex-col">
          <FeatureCopy className="phone:pr-0 phone:pb-3.5">
            <Undo2 size={22} />
            <h3>Find your flow.</h3>
            <p>
              Keep your hands on the keys.
              <br />
              Keep your mind on the edit.
            </p>
          </FeatureCopy>
          <div
            className="[&_kbd]:border-studio-border-strong compact:[&_kbd]:h-16.25 compact:[&_kbd]:w-16.25 compact:[&_kbd]:text-[27px] phone:pt-0 phone:pr-3 phone:pb-0 phone:pl-0 phone:gap-1 phone:[&_kbd]:w-8.5 phone:[&_kbd]:h-11 phone:[&_kbd]:text-[20px] phone:[&_kbd]:rounded-lg flex justify-center gap-2.5 pt-3 pr-5 pb-7.5 pl-5 [&_kbd]:flex [&_kbd]:h-21.25 [&_kbd]:w-21.25 [&_kbd]:[transform:rotate(-7deg)] [&_kbd]:items-center [&_kbd]:justify-center [&_kbd]:rounded-[13px] [&_kbd]:border [&_kbd]:[border-bottom-width:5px] [&_kbd]:font-sans [&_kbd]:text-[33px] [&_kbd]:shadow-[inset_0_0_0_5px_var(--studio-panel),_0_12px_15px_-12px_rgb(0_0_0_/_20%)] [&_kbd]:[background:linear-gradient(_145deg,_var(--studio-topbar),_var(--studio-panel-raised)_)] [&_kbd_+_kbd]:[transform:translateY(12px)_rotate(7deg)]"
            aria-hidden="true"
          >
            <kbd>⌘</kbd>
            <kbd>Z</kbd>
          </div>
          <div className="[&>span_>_span]:text-studio-muted [&>a]:text-studio-fg laptop:mx-6 laptop:[&>span]:flex-col laptop:[&>span]:gap-0.75 phone:col-span-full phone:mt-3 phone:mr-5 phone:mb-5 phone:ml-5 phone:gap-3 phone:[&>span]:flex-col phone:[&>span]:items-start phone:[&>span]:gap-1 phone:[&>span]:text-[13px] phone:[&>span_>_span]:text-[12px] phone:[&>a]:min-h-11 phone:[&>a]:text-[13px] mt-auto mr-7 mb-6.25 ml-7 grid gap-3.75 text-[11px] [&>a]:flex [&>a]:items-center [&>a]:justify-between [&>a]:pt-3.75 [&>a]:[border-top:1px_solid_var(--studio-border)] [&>span]:flex [&>span]:justify-between [&>span]:gap-2 [&>span_>_span]:text-[9px]">
            <span>
              Undo / redo <span>Every edit, in your control</span>
            </span>
            <span>
              Frame by frame <span>Get the timing just right</span>
            </span>
            <a href="#shortcuts">
              Explore the shortcuts
              <ArrowRight size={15} />
            </a>
          </div>
        </FeatureCard>
        <FeatureCard className="compact:grid-cols-[1fr_1.5fr] compact:[&_h3]:text-[24px] phone:flex phone:flex-col phone:[&_h3_>_br]:hidden col-span-full grid grid-cols-[1fr_1.9fr] [&_h3]:text-[30px]">
          <FeatureCopy className="laptop:p-9 compact:p-6.25 phone:p-5 flex flex-col justify-center p-9">
            <Layers size={22} />
            <h3>
              More than
              <br />
              moving pictures.
            </h3>
            <p>Layer text, images, graphics, and audio into your edit.</p>
            <div className="text-studio-muted compact:text-[10px] phone:flex-row phone:flex-wrap phone:gap-3 phone:mt-4.5 phone:text-[12px] phone:[&_svg]:w-3 mt-5.75 flex flex-col gap-3 text-[11px] [&>span]:flex [&>span]:items-center [&>span]:gap-2.5">
              <span>
                <Type size={15} />
                Text & titles
              </span>
              <span>
                <ImageIcon size={15} />
                Images & graphics
              </span>
              <span>
                <Music size={15} />
                Audio tracks
              </span>
            </div>
          </FeatureCopy>
          <div className="compact:aspect-[auto] phone:aspect-[1.6] phone:mt-0 phone:mr-3 phone:mb-3 phone:ml-3 relative mt-4 mr-4 mb-4 ml-0 aspect-[1.85] min-w-0 overflow-hidden rounded-[7px] [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
            <Image
              src="/images/coastal-still.webp"
              alt="Coastal sample media with a text overlay"
              sizes="(max-width: 560px) 90vw, 700px"
              width={1672}
              height={941}
              loading="lazy"
            />
            <div className="phone:text-[clamp(24px,_7vw,_30px)] absolute top-[29%] left-[12%] border border-[rgb(255_255_255_/_80%)] px-3.5 py-2.5 font-[family-name:Georgia,_serif] text-[clamp(26px,_3.5vw,_47px)] leading-[1] font-semibold tracking-[-1.3px] text-white [&_i]:absolute [&_i]:h-1.5 [&_i]:w-1.5 [&_i]:rounded-full [&_i]:bg-white [&_i:nth-child(1)]:top-[-3px] [&_i:nth-child(1)]:left-[-3px] [&_i:nth-child(2)]:top-[-3px] [&_i:nth-child(2)]:right-[-3px] [&_i:nth-child(3)]:bottom-[-3px] [&_i:nth-child(3)]:left-[-3px] [&_i:nth-child(4)]:right-[-3px] [&_i:nth-child(4)]:bottom-[-3px]">
              Find your
              <br />
              own rhythm.
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="absolute bottom-4 left-4 flex items-center gap-1.75 rounded-[5px] bg-[rgb(0_0_0_/_50%)] px-2.5 py-1.75 text-[9px] text-white backdrop-blur-[8px]">
              <Type size={12} />
              Text layer
            </span>
          </div>
        </FeatureCard>
      </div>
    </LandingContainer>
  );
}
