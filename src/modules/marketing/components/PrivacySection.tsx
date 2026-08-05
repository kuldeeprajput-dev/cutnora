import React from 'react';
import { ShieldCheck, HardDrive, UserCheck, Lock } from 'lucide-react';

export function PrivacySection() {
  const privacyPoints = [
    {
      icon: ShieldCheck,
      title: 'Local Client Processing',
      description: 'Video decoding, composition rendering, and audio mixing run directly inside your browser process.',
    },
    {
      icon: HardDrive,
      title: 'Browser IndexedDB Storage',
      description: 'Your video clips, images, and project data are saved locally in IndexedDB using Dexie.js.',
    },
    {
      icon: UserCheck,
      title: 'No Account Required',
      description: 'Start editing immediately without signing up, entering email addresses, or logging into cloud servers.',
    },
    {
      icon: Lock,
      title: 'Full Export Control',
      description: 'Rendered WebM and MP4 video files download directly to your local file system on your command.',
    },
  ];

  return (
    <section id="privacy" className="py-20 sm:py-24 lg:py-28 bg-studio-bg text-studio-fg border-t border-studio-border">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-studio-border bg-studio-panel-raised px-3.5 py-1 text-xs font-medium text-selection mb-4">
            <span className="h-2 w-2 rounded-full bg-mkt-success" />
            <span>Local-First Architecture</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-studio-fg">
            Your media files never leave your device.
          </h2>
          <p className="mt-4 text-base text-studio-muted">
            Cutframe is built from the ground up to operate locally. Video footage is processed in client memory and stored in local browser storage.
          </p>
        </div>

        {/* 4 Privacy Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {privacyPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="rounded-2xl border border-studio-border bg-studio-panel p-6 shadow-md hover:border-brand/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-studio-fg mb-2">{point.title}</h3>
                <p className="text-xs text-studio-muted leading-relaxed">{point.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
