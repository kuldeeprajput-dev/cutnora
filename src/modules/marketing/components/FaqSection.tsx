'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'Does Cutframe upload my files?',
    answer:
      'No. Your video clips, audio tracks, and images are processed entirely on your local machine inside your browser. Nothing is uploaded to external servers or cloud storage.',
  },
  {
    question: 'Which media formats are supported?',
    answer:
      'Cutframe supports widely used web video formats (MP4, WebM), audio formats (MP3, WAV, AAC), and image formats (PNG, JPEG, WebP). Exact codec playback depends on your browser’s HTML5 media engine.',
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
      'Yes. Cutframe offers instant WebM export using native HTML5 Canvas capture streams, as well as optional client-side MP4 conversion powered by WebAssembly (FFmpeg.wasm).',
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
    <section id="faq" className="py-20 bg-[#ECE9E2] text-[#151619] border-t border-[#D9D5CC]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D5CC] bg-[#FFFFFF] px-3.5 py-1 text-xs font-medium text-[#151619] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#FF5A36]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#151619]">
            Everything you need to know about Cutframe.
          </h2>
          <p className="mt-4 text-base text-[#6F716F]">
            Transparent answers regarding privacy, browser capabilities, and video export.
          </p>
        </div>

        {/* Accessible Accordion List */}
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-[#D9D5CC] bg-[#FFFFFF] overflow-hidden transition-colors"
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-[#151619] hover:bg-[#F6F4EF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A36]"
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#6F716F] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#FF5A36]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div id={contentId} role="region" aria-labelledby={buttonId} className="px-5 pb-5 text-sm text-[#6F716F] leading-relaxed">
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
