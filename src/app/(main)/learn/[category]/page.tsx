// src/app/(main)/learn/[category]/page.tsx
'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, Star, ChevronRight, BookOpen, ListOrdered, Pointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// Badge intentionally imported for future use
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import {
  useTechniquesByCategory,
  useTechniqueProgress,
  CATEGORY_INFO,
} from '@/hooks/useTechniques';
import type { TechniqueCategory, Technique } from '@/types/technique';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = use(params);
  const category = resolvedParams.category as TechniqueCategory;

  const { user } = useAuth();
  const { data: techniques, isLoading } = useTechniquesByCategory(category);
  const { data: progress } = useTechniqueProgress(user?.id);

  const categoryInfo = CATEGORY_INFO[category];

  // Get progress status for a technique
  const getProgressStatus = (techniqueId: string) => {
    return progress?.get(techniqueId)?.status || 'not_started';
  };

  // Get progress indicator
  const getProgressIndicator = (techniqueId: string) => {
    const status = getProgressStatus(techniqueId);
    switch (status) {
      case 'practicing':
        return {
          icon: <Clock className="h-3.5 w-3.5" />,
          color: 'text-amber-600',
          bg: 'bg-amber-100',
        };
      case 'confident':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          color: 'text-green-600',
          bg: 'bg-green-100',
        };
      default:
        return null;
    }
  };

  if (isLoading) {
    return <CategoryPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/learn">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{categoryInfo?.name || 'Category'}</h1>
      </div>

      {/* Technique List */}
      {techniques && techniques.length > 0 ? (
        <div className="space-y-3">
          {techniques.map((technique) => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              progressIndicator={getProgressIndicator(technique.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No techniques yet"
          description={`We're still adding ${categoryInfo?.name.toLowerCase() || 'these'} techniques. Check back soon!`}
        />
      )}
    </div>
  );
}

// Technique card component
function TechniqueCard({
  technique,
  progressIndicator,
}: {
  technique: Technique;
  progressIndicator: { icon: React.ReactNode; color: string; bg: string } | null;
}) {
  const isEssential = technique.tags?.includes('essential');
  const hasInteractive = technique.tutorialSteps && technique.tutorialSteps.length > 0;

  return (
    <Link href={`/learn/technique/${technique.id}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Badge with progress overlay */}
            <div className="relative">
              {technique.abbreviation ? (
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                  {technique.abbreviation}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
              )}
              {/* Progress indicator overlay */}
              {progressIndicator && (
                <div
                  className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background',
                    progressIndicator.bg,
                    progressIndicator.color
                  )}
                >
                  {progressIndicator.icon}
                </div>
              )}
            </div>

            {/* Technique info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="font-semibold truncate">{technique.name}</p>
                {isEssential && (
                  <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Star className="h-2.5 w-2.5 text-amber-600 fill-amber-600" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {technique.description}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-green-700">
                  <span className="font-medium">{DIFFICULTY_LABELS[technique.difficulty]}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ListOrdered className="h-3 w-3" />
                  <span>{technique.steps?.length || 0} steps</span>
                </div>
                {hasInteractive && (
                  <div className="flex items-center gap-1 text-primary">
                    <Pointer className="h-3 w-3" />
                    <span className="font-medium">Interactive</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Loading skeleton
function CategoryPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}
