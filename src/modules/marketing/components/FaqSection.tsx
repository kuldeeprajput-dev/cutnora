'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'Does Cutnora upload my files?',
    answer:
      'No. Your video clips, audio tracks, and images are processed entirely on your local machine inside your browser. Nothing is uploaded to external servers or cloud storage.',
  },
  {
    question: 'Which media formats are supported?',
    answer:
      'Cutnora supports widely used web video formats (MP4, WebM), audio formats (MP3, WAV, AAC), and image formats (PNG, JPEG, WebP). Exact codec playback depends on your browser’s HTML5 media engine.',
  },
  {
    question: 'Can I save a project?',
    answer:
      'Yes. Your projects, multitrack timeline setups, and media asset Blobs are automatically saved locally in your browser using Dexie IndexedDB, allowing you to return and continue editing.',
  },
  {
    question: 'Which browsers are recommended?',
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
    <section id="faq" className="py-20 sm:py-24 lg:py-28 bg-mkt-surface-secondary text-mkt-fg border-t border-mkt-border">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-mkt-border bg-mkt-surface px-3.5 py-1 text-xs font-medium text-mkt-fg mb-4">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-mkt-fg">
            Everything you need to know about Cutnora.
          </h2>
          <p className="mt-4 text-base text-mkt-muted">
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
                className="rounded-2xl border border-mkt-border bg-mkt-surface overflow-hidden transition-colors"
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-mkt-fg hover:bg-mkt-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-mkt-muted transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div id={contentId} role="region" aria-labelledby={buttonId} className="px-5 pb-5 text-sm text-mkt-muted leading-relaxed">
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
