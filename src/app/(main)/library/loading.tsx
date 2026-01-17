// src/app/(main)/library/loading.tsx
// Loading skeleton for the Pattern Library page

import { PatternCardSkeleton } from '@/components/patterns';
import { Skeleton } from '@/components/ui/skeleton';

export default function LibraryLoading() {
  return (
    <div className="py-4">
      {/* Page Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar Skeleton (desktop) */}
        <div className="hidden lg:block w-[280px] space-y-4">
          <Skeleton className="h-8 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-8 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="columns-2 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4 md:gap-5 lg:gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="break-inside-avoid mb-4 sm:mb-4 md:mb-5 lg:mb-6">
                <PatternCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
