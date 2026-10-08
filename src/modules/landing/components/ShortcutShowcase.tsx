import {
  LandingContainer,
  SectionHeading,
  SectionLabel,
} from "./LandingPrimitives";

const shortcuts = [
  { label: "Play / pause", keys: ["Space"] },
  { label: "Split clip", keys: ["S"] },
  { label: "Undo", keys: ["Ctrl / ⌘", "Z"] },
  { label: "Delete selected", keys: ["Delete"] },
  { label: "Previous / next frame", keys: ["←", "→"] },
  { label: "Timeline zoom", keys: ["+", "−"] },
];

export function ShortcutShowcase() {
  return (
    <section
      className="bg-mkt-bg phone:py-14 py-19"
      id="shortcuts"
      aria-labelledby="shortcuts-heading"
    >
      <LandingContainer>
        <div className="[&>p]:text-studio-muted compact:[&>p]:max-w-57.5 compact:[&>p]:text-[11px] phone:block phone:[&>p]:max-w-[none] phone:[&>p]:mt-4 phone:[&>p]:text-[14px] phone:[&>p_>_span]:text-[12px] flex items-end justify-between gap-7.5 [&>p]:text-[13px] [&>p]:leading-[1.8] [&>p_>_span]:text-[11px]">
          <SectionHeading>
            <SectionLabel>KEYBOARD SHORTCUTS</SectionLabel>
            <h2 id="shortcuts-heading">
              Less clicking.
              <br />
              More creating.
            </h2>
          </SectionHeading>
          <p>
            The small things that keep you in the creative flow.
            <br />
            <span>Ctrl on Windows and Linux. ⌘ on Mac.</span>
          </p>
        </div>
        <div className="laptop:gap-x-6.25 compact:grid-cols-[repeat(2,_1fr)] compact:gap-x-8.75 phone:grid-cols-[1fr] phone:mt-6 mt-7.5 grid grid-cols-[repeat(3,_1fr)] gap-x-11">
          {shortcuts.map(({ label, keys }) => (
            <div
              className="[&_kbd]:border-studio-border-strong [&_kbd]:bg-studio-panel-raised [&_kbd]:text-studio-fg phone:text-[14px] phone:py-4 phone:leading-[1.5] phone:[&_kbd]:h-9 phone:[&_kbd]:min-w-8.5 phone:[&_kbd]:text-[11px] flex items-center justify-between gap-3 py-4.5 text-[11px] [border-bottom:1px_solid_var(--studio-border)] [&_kbd]:inline-flex [&_kbd]:h-7.25 [&_kbd]:min-w-7 [&_kbd]:items-center [&_kbd]:justify-center [&_kbd]:rounded-[5px] [&_kbd]:border [&_kbd]:[border-bottom-width:3px] [&_kbd]:px-2 [&_kbd]:font-mono [&_kbd]:text-[10px] [&>div]:flex [&>div]:gap-1.25"
              key={label}
            >
              <span>{label}</span>
              <div>
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </LandingContainer>
    </section>
  );
}
