'use client';

// src/components/patterns/PatternDetailModal.tsx
// Full pattern detail modal/dialog

import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DifficultyBadge } from './DifficultyBadge';
import { PatternTechniqueList } from './PatternTechniqueList';
import { PatternCard } from './PatternCard';
import type { LibraryPattern, PatternCardData } from '@/types/pattern';
import {
  TYPE_LABELS,
  CATEGORY_LABELS,
  YARN_WEIGHT_LABELS,
} from '@/types/pattern';
import {
  Heart,
  Share2,
  Wand2,
  Clock,
  Ruler,
  Scale,
  X,
  ExternalLink,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface PatternDetailModalProps {
  /** Pattern data to display */
  pattern: LibraryPattern | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when favorite is toggled */
  onFavoriteToggle?: (patternId: string) => void;
  /** Callback when share is clicked */
  onShare?: (patternId: string) => void;
  /** Callback when "use template" is clicked */
  onUseTemplate?: (patternId: string) => void;
  /** Similar patterns to display */
  similarPatterns?: PatternCardData[];
  /** Callback when a similar pattern is clicked */
  onSimilarPatternClick?: (patternId: string) => void;
}

// ============================================================================
// PLACEHOLDER IMAGE
// ============================================================================

const PLACEHOLDER_IMAGE = '/images/pattern-placeholder.svg';

// ============================================================================
// COMPONENT
// ============================================================================

export function PatternDetailModal({
  pattern,
  isOpen,
  onOpenChange,
  onFavoriteToggle,
  onShare,
  onUseTemplate,
  similarPatterns = [],
  onSimilarPatternClick,
}: PatternDetailModalProps) {
  if (!pattern) return null;

  const {
    id,
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
    instructionFormat,
    estimatedTime,
    source,
    designer,
    license,
    tags,
    isFavorited,
  } = pattern;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image section */}
          <div className="relative w-full lg:w-2/5 h-64 lg:h-full bg-muted flex-shrink-0">
            <img
              src={imageUrl || PLACEHOLDER_IMAGE}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />

            {/* Close button (mobile) */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 lg:hidden p-2 rounded-full bg-background/80 backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {/* Type badge */}
            <Badge
              className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground"
            >
              {TYPE_LABELS[type]}
            </Badge>
          </div>

          {/* Content section */}
          <div className="flex-1 flex flex-col min-h-0">
            <DialogHeader className="p-6 pb-0 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DialogTitle className="text-2xl">{title}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={difficulty} />
                    <Badge variant="secondary">{CATEGORY_LABELS[category]}</Badge>
                  </div>
                </div>
                {/* Desktop close is handled by DialogContent */}
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6">
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  {similarPatterns.length > 0 && (
                    <TabsTrigger value="similar">Similar</TabsTrigger>
                  )}
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 pb-6">
                  {/* Description */}
                  {description && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">About this pattern</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  )}

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {estimatedTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-muted-foreground" />
                        <span>{estimatedTime}</span>
                      </div>
                    )}
                    {sizing?.availableSizes && (
                      <div className="flex items-center gap-2 text-sm">
                        <Ruler className="size-4 text-muted-foreground" />
                        <span>{sizing.availableSizes.length} sizes</span>
                      </div>
                    )}
                    {gauge && (
                      <div className="flex items-center gap-2 text-sm">
                        <Scale className="size-4 text-muted-foreground" />
                        <span>
                          {gauge.stitchesPerInch} st × {gauge.rowsPerInch} rows
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Techniques */}
                  {techniques && techniques.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Techniques</h3>
                      <PatternTechniqueList
                        techniques={techniques}
                        maxVisible={10}
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {tags && tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source info */}
                  {(source || designer) && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {designer && <p>Designer: {designer}</p>}
                      {source && <p>Source: {source}</p>}
                      {license && <p>License: {license.replace('_', ' ')}</p>}
                    </div>
                  )}
                </TabsContent>

                {/* Materials Tab */}
                <TabsContent value="materials" className="space-y-6 pb-6">
                  {/* Yarn */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Yarn</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Weight:</span>{' '}
                        {YARN_WEIGHT_LABELS[materials.yarnWeight]}
                      </p>
                      {materials.fiberContent && (
                        <p>
                          <span className="text-muted-foreground">Fiber:</span>{' '}
                          {materials.fiberContent.join(', ')}
                        </p>
                      )}
                      {materials.yardage && (
                        <p>
                          <span className="text-muted-foreground">Yardage:</span>{' '}
                          {materials.yardage} yards
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Needles/Hook */}
                  {(materials.needleSize || materials.hookSize) && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        {type === 'crochet' ? 'Hook' : 'Needles'}
                      </h3>
                      <p className="text-sm">
                        {materials.needleSize || materials.hookSize}
                      </p>
                    </div>
                  )}

                  {/* Notions */}
                  {materials.notions && materials.notions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Notions</h3>
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
                      <h3 className="text-sm font-semibold mb-2">Gauge</h3>
                      <p className="text-sm">
                        {gauge.stitchesPerInch} stitches × {gauge.rowsPerInch} rows
                        {gauge.swatchSize && ` = ${gauge.swatchSize}`}
                      </p>
                    </div>
                  )}

                  {/* Sizing */}
                  {sizing && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Sizes</h3>
                      <div className="flex flex-wrap gap-1.5">
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
                  <TabsContent value="similar" className="pb-6">
                    <div className="grid grid-cols-2 gap-4">
                      {similarPatterns.slice(0, 4).map((similar) => (
                        <PatternCard
                          key={similar.id}
                          pattern={similar}
                          variant="compact"
                          onClick={onSimilarPatternClick}
                        />
                      ))}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </ScrollArea>

            {/* Action buttons */}
            <div className="p-4 border-t flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onFavoriteToggle?.(id)}
                  className={cn(isFavorited && 'text-red-500 border-red-200')}
                >
                  <Heart className={cn('size-4', isFavorited && 'fill-current')} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onShare?.(id)}
                >
                  <Share2 className="size-4" />
                </Button>
                <Button
                  className="flex-1 bg-copper hover:bg-copper-dark"
                  onClick={() => onUseTemplate?.(id)}
                >
                  <Wand2 className="size-4 mr-2" />
                  Use as Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
