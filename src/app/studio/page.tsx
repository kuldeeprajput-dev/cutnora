import Link from 'next/link';

export default function StudioDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121214] text-[#f4f4f5] px-6 text-center">
      <h1 className="text-3xl font-bold">Cutframe Studio Projects</h1>
      <p className="mt-2 text-sm text-[#a1a1aa]">
        Create a new video project or open existing local projects.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Link
          href="/studio/new"
          className="rounded-lg bg-[#facc15] px-4 py-2.5 text-sm font-medium text-[#121214] transition-colors hover:bg-[#eab308]"
        >
          Create New Project
        </Link>
      </div>
    </main>
  );
}
