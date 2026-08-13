import Link from 'next/link';
import { Film, Home } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-studio-bg text-studio-fg px-4 text-center select-none">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/15 text-brand mb-4">
        <Film className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-studio-fg">404</h1>
      <h2 className="mt-2 text-lg font-semibold text-studio-fg">Page Not Found</h2>
      <p className="mt-1 text-xs text-studio-muted max-w-sm">
        The requested URL was not found on Cutnora studio.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button size="md" variant="primary" className="gap-2">
            <Home className="h-4 w-4" /> Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
