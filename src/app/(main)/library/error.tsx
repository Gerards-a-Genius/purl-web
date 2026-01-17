'use client';

// src/app/(main)/library/error.tsx
// Error boundary for the Pattern Library page

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LibraryError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Library page error:', error);
  }, [error]);

  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn&apos;t load the pattern library. This might be a temporary issue.
      </p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
