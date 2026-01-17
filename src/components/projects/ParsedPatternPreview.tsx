// src/components/projects/ParsedPatternPreview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ParsedPattern } from '@/lib/ai/parsePattern';

interface ParsedPatternPreviewProps {
  pattern: ParsedPattern;
  className?: string;
}

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Beginner', color: 'bg-green-100 text-green-700' },
  2: { label: 'Easy', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700' },
  4: { label: 'Advanced', color: 'bg-orange-100 text-orange-700' },
  5: { label: 'Expert', color: 'bg-red-100 text-red-700' },
};

export function ParsedPatternPreview({
  pattern,
  className,
}: ParsedPatternPreviewProps) {
  const difficulty = DIFFICULTY_LABELS[pattern.difficulty] || DIFFICULTY_LABELS[3];

  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{pattern.projectName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {pattern.projectType}
              </p>
            </div>
            <Badge className={cn('shrink-0', difficulty.color)}>
              {difficulty.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Materials */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Yarn
              </p>
              <p className="text-sm">{pattern.yarn || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Needles
              </p>
              <p className="text-sm">{pattern.needles || 'Not specified'}</p>
            </div>
            {pattern.gauge && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Gauge
                </p>
                <p className="text-sm">{pattern.gauge}</p>
              </div>
            )}
            {pattern.size && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Size
                </p>
                <p className="text-sm">{pattern.size}</p>
              </div>
            )}
          </div>

          {/* Techniques */}
          {pattern.techniques.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Techniques
                </p>
                <div className="flex flex-wrap gap-2">
                  {pattern.techniques.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Confidence indicator */}
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">AI Confidence</p>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    pattern.confidence >= 0.8
                      ? 'bg-green-500'
                      : pattern.confidence >= 0.6
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  )}
                  style={{ width: `${pattern.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {Math.round(pattern.confidence * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Pattern Steps ({pattern.steps.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {pattern.steps.map((step, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        {step.label}
                      </p>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {step.description}
                      </p>
                      {step.techniques.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {step.techniques.map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
