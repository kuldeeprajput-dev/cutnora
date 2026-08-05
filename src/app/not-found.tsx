import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#121214] text-[#f4f4f5] px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-[#facc15]">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-[#a1a1aa] max-w-md">
        The requested page does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#ea580c] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#c2410c]"
      >
        Return to Home
      </Link>
    </div>
  );
}
