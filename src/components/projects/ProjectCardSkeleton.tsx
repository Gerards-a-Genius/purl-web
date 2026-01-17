// src/components/projects/ProjectCardSkeleton.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectCardSkeletonProps {
  count?: number;
}

function SingleProjectCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between gap-4">
          {/* Left side */}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-20" /> {/* Status pill */}
            <Skeleton className="h-5 w-3/4" /> {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" /> {/* Needles */}
              <Skeleton className="h-4 w-2/3" /> {/* Yarn */}
            </div>
          </div>

          {/* Right side - Thumbnail */}
          <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between mt-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-10 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectCardSkeleton({ count = 3 }: ProjectCardSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SingleProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
