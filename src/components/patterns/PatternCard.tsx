'use client';

// src/components/patterns/PatternCard.tsx
// Pinterest-style pattern card for the library grid

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { DifficultyBadge } from './DifficultyBadge';
import { PatternTechniqueList } from './PatternTechniqueList';
import { PatternQuickActions } from './PatternQuickActions';
import type { PatternCardData, PatternTechnique } from '@/types/pattern';
import { TYPE_LABELS, CATEGORY_LABELS, YARN_WEIGHT_LABELS } from '@/types/pattern';

// Placeholder image for patterns without thumbnails
const PLACEHOLDER_IMAGE = '/images/pattern-placeholder.svg';

export interface PatternCardProps {
  /** Pattern data to display */
  pattern: PatternCardData;
  /** Variant for different display contexts */
  variant?: 'default' | 'compact';
  /** Callback when card is clicked */
  onClick?: (patternId: string) => void;
  /** Callback when favorite is toggled */
  onFavoriteToggle?: (patternId: string) => void;
  /** Callback when share is clicked */
  onShare?: (patternId: string) => void;
  /** Callback when "use template" is clicked */
  onUseTemplate?: (patternId: string) => void;
  /** Callback when a technique tag is clicked */
  onTechniqueClick?: (technique: PatternTechnique) => void;
  /** Enable View Transitions API for smooth navigation animations */
  enableViewTransition?: boolean;
  /** Additional className */
  className?: string;
}

export function PatternCard({
  pattern,
  variant = 'default',
  onClick,
  onFavoriteToggle,
  onShare,
  onUseTemplate,
  onTechniqueClick,
  enableViewTransition = false,
  className,
}: PatternCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    id,
    title,
    type,
    category,
    difficulty,
    thumbnailUrl,
    techniques,
    materials,
    isFavorited,
  } = pattern;

  const imageUrl = imageError || !thumbnailUrl ? PLACEHOLDER_IMAGE : thumbnailUrl;
  const isCompact = variant === 'compact';

  // Type icon based on craft type
  const TypeIcon = type === 'crochet' ? CrochetHookIcon : KnittingNeedlesIcon;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-0 bg-card cursor-pointer',
        'transition-all duration-300 ease-out',
        'hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isCompact ? 'rounded-lg' : 'rounded-xl',
        className
      )}
      onClick={() => onClick?.(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="article"
      aria-label={`${title} - ${TYPE_LABELS[type]} pattern, ${difficulty} difficulty`}
    >
      {/* Image container with 3:4 aspect ratio */}
      <div
        className={cn(
          'relative w-full overflow-hidden bg-muted',
          isCompact ? 'aspect-square' : 'aspect-[3/4]'
        )}
      >
        {/* Loading placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Pattern image */}
        <img
          src={imageUrl}
          alt={title}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-all duration-500',
            'group-hover:scale-105',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={
            enableViewTransition
              ? { viewTransitionName: `pattern-image-${id}` }
              : undefined
          }
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {/* Gradient overlay for text readability */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent',
            'opacity-60 group-hover:opacity-70 transition-opacity'
          )}
        />

        {/* Top badges: Type icon and difficulty */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Type icon */}
          <div
            className={cn(
              'flex items-center justify-center size-8 rounded-full',
              'bg-background/90 backdrop-blur-sm shadow-sm',
              'text-muted-foreground'
            )}
            title={TYPE_LABELS[type]}
          >
            <TypeIcon className="size-4" />
          </div>

          {/* Difficulty badge */}
          <DifficultyBadge difficulty={difficulty} size={isCompact ? 'sm' : 'default'} />
        </div>

        {/* Quick actions on hover */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'pointer-events-none group-hover:pointer-events-auto'
          )}
        >
          <PatternQuickActions
            patternId={id}
            isFavorited={isFavorited}
            onFavoriteToggle={onFavoriteToggle}
            onShare={onShare}
            onUseTemplate={onUseTemplate}
          />
        </div>

        {/* Category badge at bottom of image */}
        <div className="absolute bottom-3 left-3">
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-md',
              'bg-background/90 backdrop-blur-sm shadow-sm',
              'text-xs font-medium text-foreground'
            )}
          >
            {CATEGORY_LABELS[category]}
          </span>
        </div>
      </div>

      {/* Content section */}
      <div className={cn('p-3 space-y-2', isCompact && 'p-2 space-y-1.5')}>
        {/* Title */}
        <h3
          className={cn(
            'font-semibold text-foreground line-clamp-2',
            'group-hover:text-copper transition-colors',
            isCompact ? 'text-sm' : 'text-base'
          )}
        >
          {title}
        </h3>

        {/* Yarn weight info */}
        {materials?.yarnWeight && !isCompact && (
          <p className="text-xs text-muted-foreground">
            {YARN_WEIGHT_LABELS[materials.yarnWeight]} weight
          </p>
        )}

        {/* Techniques */}
        {techniques && techniques.length > 0 && (
          <PatternTechniqueList
            techniques={techniques}
            maxVisible={isCompact ? 2 : 3}
            size={isCompact ? 'sm' : 'default'}
            onTechniqueClick={onTechniqueClick}
          />
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

function KnittingNeedlesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Two crossed knitting needles */}
      <line x1="4" y1="20" x2="20" y2="4" />
      <line x1="4" y1="4" x2="20" y2="20" />
      {/* Needle caps */}
      <circle cx="3" cy="21" r="1.5" fill="currentColor" />
      <circle cx="21" cy="3" r="1.5" fill="currentColor" />
      <circle cx="3" cy="3" r="1.5" fill="currentColor" />
      <circle cx="21" cy="21" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CrochetHookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Hook shaft */}
      <line x1="12" y1="22" x2="12" y2="8" />
      {/* Hook head */}
      <path d="M12 8 C12 8, 12 4, 8 4 C6 4, 6 6, 6 7 C6 8, 7 9, 9 9" />
      {/* Handle grip lines */}
      <line x1="10" y1="18" x2="14" y2="18" />
      <line x1="10" y1="16" x2="14" y2="16" />
    </svg>
  );
}

// Export for testing
export { KnittingNeedlesIcon, CrochetHookIcon };
