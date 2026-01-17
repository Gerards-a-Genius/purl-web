// src/components/projects/AILoadingState.tsx
'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AILoadingStateProps {
  message?: string;
  estimatedTime?: string;
  className?: string;
}

const LOADING_MESSAGES = [
  'Reading pattern instructions...',
  'Detecting yarn and needle requirements...',
  'Identifying knitting techniques...',
  'Extracting step-by-step instructions...',
  'Building your project structure...',
  'Almost done...',
];

export function AILoadingState({
  message,
  estimatedTime,
  className,
}: AILoadingStateProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const displayMessage = message || LOADING_MESSAGES[currentMessageIndex];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        className
      )}
    >
      {/* Animated icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>

      {/* Message - aria-live announces updates to screen readers */}
      <p
        className="text-lg font-medium text-foreground text-center mb-2 transition-all duration-300"
        key={displayMessage}
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {displayMessage}
      </p>

      {/* Estimated time */}
      {estimatedTime && (
        <p className="text-sm text-muted-foreground">{estimatedTime}</p>
      )}

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {LOADING_MESSAGES.map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index <= currentMessageIndex ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}
