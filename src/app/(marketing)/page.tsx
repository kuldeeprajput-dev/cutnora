import Link from 'next/link';

export default function MarketingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#e6e2db] bg-[#f7f4ef] px-3 py-1 text-xs font-medium text-[#6b6762] mb-6">
        <span>Cutframe</span>
        <span className="text-[#ea580c]">•</span>
        <span>Local-first browser video editor</span>
      </div>
      <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl text-[#1a1918]">
        Fast, private video editing directly in your browser.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-[#6b6762]">
        Edit multi-track videos, trim clips, apply effects, and export high-quality WebM/MP4 videos completely on your local device.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/studio"
          className="rounded-lg bg-[#ea580c] px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#c2410c]"
        >
          Open Studio
        </Link>
      </div>
    </main>
  );
}
