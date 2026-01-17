'use client';

// src/app/(main)/library/pattern/[id]/page.tsx
// Pattern detail page for mobile deep-linking and SEO

import { use, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useViewTransition } from '@/hooks/useViewTransition';
import { ViewTransitionLink } from '@/components/common/ViewTransitionLink';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DifficultyBadge } from '@/components/patterns/DifficultyBadge';
import { PatternTechniqueList } from '@/components/patterns/PatternTechniqueList';
import { PatternCard } from '@/components/patterns/PatternCard';
import {
  getPatternById,
  mockPatternCards,
} from '@/components/patterns/__mocks__/patterns';
import {
  TYPE_LABELS,
  CATEGORY_LABELS,
  YARN_WEIGHT_LABELS,
} from '@/types/pattern';
import {
  ArrowLeft,
  Heart,
  Share2,
  Wand2,
  Clock,
  Ruler,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface PatternDetailPageProps {
  params: Promise<{ id: string }>;
}

// ============================================================================
// PLACEHOLDER IMAGE
// ============================================================================

const PLACEHOLDER_IMAGE = '/images/pattern-placeholder.svg';

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PatternDetailPage({ params }: PatternDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { navigateWithTransition } = useViewTransition();

  // Get pattern data (in production, this would be fetched from API)
  const pattern = useMemo(() => getPatternById(id), [id]);

  // Get similar patterns (patterns with shared techniques)
  const similarPatterns = useMemo(() => {
    if (!pattern) return [];
    const patternTechniqueNames = pattern.techniques.map((t) => t.name);
    return mockPatternCards
      .filter(
        (p) =>
          p.id !== id &&
          p.techniques.some((t) => patternTechniqueNames.includes(t.name))
      )
      .slice(0, 4);
  }, [pattern, id]);

  if (!pattern) {
    notFound();
  }

  const {
    title,
    description,
    type,
    category,
    difficulty,
    imageUrl,
    techniques,
    materials,
    gauge,
    sizing,
    estimatedTime,
    source,
    designer,
    license,
    tags,
    isFavorited,
  } = pattern;

  const handleFavoriteToggle = () => {
    // TODO: Implement favorite toggle
    console.log('Toggle favorite:', id);
  };

  const handleShare = () => {
    // TODO: Implement share
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleUseTemplate = () => {
    router.push(`/projects/new/wizard?template=${id}`);
  };

  const handleSimilarPatternClick = (patternId: string) => {
    navigateWithTransition(`/library/pattern/${patternId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl flex items-center h-14 gap-4">
          <Button variant="ghost" size="icon" asChild>
            <ViewTransitionLink href="/library">
              <ArrowLeft className="size-5" />
              <span className="sr-only">Back to library</span>
            </ViewTransitionLink>
          </Button>
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-4xl py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
            <img
              src={imageUrl || PLACEHOLDER_IMAGE}
              alt={title}
              className="w-full h-full object-cover"
              style={{ viewTransitionName: `pattern-image-${id}` }}
            />
            <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground">
              {TYPE_LABELS[type]}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title & badges */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <DifficultyBadge difficulty={difficulty} />
                <Badge variant="secondary">{CATEGORY_LABELS[category]}</Badge>
              </div>
            </div>

            {/* Description */}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {estimatedTime && (
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                  <Clock className="size-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">{estimatedTime}</span>
                </div>
              )}
              {sizing?.availableSizes && (
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                  <Ruler className="size-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">
                    {sizing.availableSizes.length} sizes
                  </span>
                </div>
              )}
              {gauge && (
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                  <Scale className="size-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">
                    {gauge.stitchesPerInch}×{gauge.rowsPerInch}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleFavoriteToggle}
                className={cn(isFavorited && 'text-red-500 border-red-200')}
              >
                <Heart className={cn('size-4', isFavorited && 'fill-current')} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="size-4" />
              </Button>
              <Button
                className="flex-1 bg-copper hover:bg-copper-dark"
                onClick={handleUseTemplate}
              >
                <Wand2 className="size-4 mr-2" />
                Use as Template
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            {similarPatterns.length > 0 && (
              <TabsTrigger value="similar">Similar Patterns</TabsTrigger>
            )}
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Techniques */}
            {techniques && techniques.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Techniques</h3>
                <PatternTechniqueList techniques={techniques} maxVisible={20} />
              </div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Source info */}
            {(source || designer) && (
              <div className="text-sm text-muted-foreground space-y-1 border-t pt-4">
                {designer && <p>Designer: {designer}</p>}
                {source && <p>Source: {source}</p>}
                {license && <p>License: {license.replace('_', ' ')}</p>}
              </div>
            )}
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            {/* Yarn */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Yarn</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd className="font-medium">
                    {YARN_WEIGHT_LABELS[materials.yarnWeight]}
                  </dd>
                </div>
                {materials.fiberContent && (
                  <div>
                    <dt className="text-muted-foreground">Fiber</dt>
                    <dd className="font-medium">
                      {materials.fiberContent.join(', ')}
                    </dd>
                  </div>
                )}
                {materials.yardage && (
                  <div>
                    <dt className="text-muted-foreground">Yardage</dt>
                    <dd className="font-medium">{materials.yardage} yards</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Needles/Hook */}
            {(materials.needleSize || materials.hookSize) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {type === 'crochet' ? 'Hook' : 'Needles'}
                </h3>
                <p className="text-sm font-medium">
                  {materials.needleSize || materials.hookSize}
                </p>
              </div>
            )}

            {/* Notions */}
            {materials.notions && materials.notions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Notions</h3>
                <ul className="text-sm list-disc list-inside text-muted-foreground">
                  {materials.notions.map((notion) => (
                    <li key={notion}>{notion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gauge */}
            {gauge && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Gauge</h3>
                <p className="text-sm">
                  {gauge.stitchesPerInch} stitches × {gauge.rowsPerInch} rows
                  {gauge.swatchSize && ` = ${gauge.swatchSize}`}
                </p>
              </div>
            )}

            {/* Sizing */}
            {sizing && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Available Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {sizing.availableSizes.map((size) => (
                    <Badge key={size} variant="outline">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Similar Patterns Tab */}
          {similarPatterns.length > 0 && (
            <TabsContent value="similar">
              <h3 className="text-lg font-semibold mb-4">
                Patterns with similar techniques
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {similarPatterns.map((similar) => (
                  <PatternCard
                    key={similar.id}
                    pattern={similar}
                    variant="compact"
                    onClick={handleSimilarPatternClick}
                    enableViewTransition
                  />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
