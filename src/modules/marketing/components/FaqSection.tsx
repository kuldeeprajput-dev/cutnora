    answer:
      'We recommend modern desktop browsers with strong Web Codecs and Canvas 2D support, including Chrome, Edge, Brave, Firefox, or Safari.',
  },
  {
    question: 'Can I export MP4?',
    answer:
      'Yes. Cutnora offers instant WebM export using native HTML5 Canvas capture streams, as well as optional client-side MP4 conversion powered by WebAssembly (FFmpeg.wasm).',
  },
  {
    question: 'Is an account required?',
    answer:
      'No account is required. You can open the studio and edit videos immediately without signing up or logging in.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-24 lg:py-28 bg-[#0d0d0d] text-white border-t border-white/[0.08]">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-zinc-400 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl text-white">
            Everything you need to know about Cutnora.
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Transparent answers regarding privacy, browser capabilities, and video export.
          </p>
        </div>

        {/* Accessible Accordion List */}
        <div className="mx-auto max-w-[1200px] space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-white/[0.08] bg-[#141416] overflow-hidden transition-all duration-300 hover:border-white/20"
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-white hover:bg-white/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div id={contentId} role="region" aria-labelledby={buttonId} className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
