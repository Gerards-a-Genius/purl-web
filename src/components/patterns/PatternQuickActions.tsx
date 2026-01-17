'use client';

// src/components/patterns/PatternQuickActions.tsx
// Quick action buttons that appear on hover over pattern cards

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Heart, Share2, Wand2 } from 'lucide-react';

export interface PatternQuickActionsProps {
  /** Pattern ID */
  patternId: string;
  /** Whether the pattern is favorited */
  isFavorited?: boolean;
  /** Callback when favorite is toggled */
  onFavoriteToggle?: (patternId: string) => void;
  /** Callback when share is clicked */
  onShare?: (patternId: string) => void;
  /** Callback when "use template" is clicked */
  onUseTemplate?: (patternId: string) => void;
  /** Additional className */
  className?: string;
}

export function PatternQuickActions({
  patternId,
  isFavorited = false,
  onFavoriteToggle,
  onShare,
  onUseTemplate,
  className,
}: PatternQuickActionsProps) {
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onFavoriteToggle?.(patternId);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onShare?.(patternId);
  };

  const handleUseTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onUseTemplate?.(patternId);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'flex items-center gap-1 p-1 rounded-lg bg-background/90 backdrop-blur-sm shadow-md',
          className
        )}
      >
        {/* Favorite button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleFavorite}
              className={cn(
                'size-8 hover:bg-muted',
                isFavorited && 'text-red-500 hover:text-red-600'
              )}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn('size-4', isFavorited && 'fill-current')}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          </TooltipContent>
        </Tooltip>

        {/* Share button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleShare}
              className="size-8 hover:bg-muted"
              aria-label="Share pattern"
            >
              <Share2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Share pattern
          </TooltipContent>
        </Tooltip>

        {/* Use as template button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleUseTemplate}
              className="size-8 hover:bg-muted text-copper hover:text-copper-dark"
              aria-label="Use as template"
            >
              <Wand2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Use as template
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
