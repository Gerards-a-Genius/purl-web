// src/components/projects/ProjectCard.tsx
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusPill } from '@/components/common/StatusPill';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  /** Compact mode for use in smaller containers like dashboards */
  compact?: boolean;
}

// Calculate progress from project steps
function getProjectProgress(project: Project): {
  completed: number;
  total: number;
  percentage: number;
} {
  const steps = project.steps || [];

  // Count completed rows across all steps
  let completedRows = 0;
  let totalRows = project.totalRows || 0;

  // Sum up completed rows from step tracking
  for (const step of steps) {
    if (step.completed) {
      completedRows += step.rowCount || 1;
    } else if (step.completedRows) {
      completedRows += step.completedRows.length;
    }
    // Handle children
    if (step.children) {
      for (const child of step.children) {
        if (child.completed) {
          completedRows += child.rowCount || 1;
        } else if (child.completedRows) {
          completedRows += child.completedRows.length;
        }
      }
    }
  }

  // If no totalRows set, count from steps
  if (totalRows === 0) {
    totalRows = steps.reduce((sum, s) => {
      const stepRows = s.rowCount || 1;
      const childRows = s.children?.reduce((cs, c) => cs + (c.rowCount || 1), 0) || 0;
      return sum + stepRows + childRows;
    }, 0);
  }

  const percentage = totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0;

  return { completed: completedRows, total: totalRows, percentage };
}

// Helper to extract color from yarn description
function getYarnColor(yarn: string): string {
  const colorMap: Record<string, string> = {
    red: '#C41E3A',
    blue: '#4169E1',
    green: '#228B22',
    yellow: '#FFD700',
    mustard: '#FFDB58',
    purple: '#800080',
    pink: '#FF69B4',
    orange: '#FF8C00',
    white: '#F5F5F5',
    black: '#333333',
    gray: '#808080',
    grey: '#808080',
    cream: '#FFFDD0',
    navy: '#000080',
    teal: '#008080',
    burgundy: '#800020',
  };

  const lowerYarn = yarn.toLowerCase();
  for (const [color, hex] of Object.entries(colorMap)) {
    if (lowerYarn.includes(color)) return hex;
  }
  return '#D4A574'; // Default caramel color
}

/**
 * ProjectCard - Adaptive project display using container queries
 *
 * Uses CSS Container Queries (Tailwind v4) to adapt layout based on
 * available space, not viewport width. This allows the card to work
 * properly in sidebars, grids, and full-width contexts.
 *
 * Layouts:
 * - Narrow (<300px): Stacked layout, small thumbnail
 * - Medium (300-400px): Side-by-side, medium thumbnail
 * - Wide (>400px): Full layout with larger thumbnail and expanded details
 */
export function ProjectCard({ project, onPress, compact }: ProjectCardProps) {
  const progress = getProjectProgress(project);

  return (
    <Card
      className={cn(
        // Base styles
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99]",
        // Make this card a container query context
        "@container"
      )}
      onClick={onPress}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        {/*
          Container query layout:
          - Default (narrow): stacked layout
          - @[300px]: side-by-side layout
        */}
        <div className={cn(
          // Narrow containers: stack vertically
          "flex flex-col gap-3",
          // At 300px+ container width: side-by-side
          "@[300px]:flex-row @[300px]:justify-between @[300px]:gap-4"
        )}>
          {/* Left side - Info */}
          <div className="flex-1 min-w-0">
            <StatusPill status={project.status} />

            <h3 className={cn(
              "mt-2 mb-2 font-semibold text-foreground line-clamp-2",
              // Smaller text in narrow containers
              "text-sm @[300px]:text-base"
            )}>
              {project.name}
            </h3>

            {/* Details - hidden in very narrow containers */}
            <div className={cn(
              "space-y-1",
              compact && "hidden @[250px]:block"
            )}>
              {/* Needles */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 21L21 3M3 21L12 12M21 3L12 12" />
                </svg>
                <span className="truncate">{project.needles}</span>
              </div>

              {/* Yarn */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-border/50 shrink-0"
                  style={{ backgroundColor: getYarnColor(project.yarn) }}
                />
                <span className="truncate">{project.yarn}</span>
              </div>
            </div>
          </div>

          {/* Right side - Thumbnail */}
          {project.thumbnail && (
            <div className={cn(
              "flex-shrink-0",
              // In stacked layout, show smaller centered thumbnail
              "self-center @[300px]:self-start"
            )}>
              <div className={cn(
                // Adaptive thumbnail size based on container
                "w-14 h-14 @[300px]:w-16 @[300px]:h-16 @[400px]:w-20 @[400px]:h-20",
                "rounded-xl overflow-hidden bg-muted"
              )}>
                <Image
                  src={project.thumbnail}
                  alt={project.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  sizes="80px"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom - Progress (only for non-planned projects) */}
        {project.status !== 'planned' && (
          <div className="mt-4">
            <Progress value={progress.percentage} className="h-2" />
            <div className="flex justify-between items-center mt-1.5">
              <span className={cn(
                "text-xs text-muted-foreground",
                // Hide detailed count in narrow containers
                "hidden @[280px]:inline"
              )}>
                {progress.completed} / {progress.total} rows
              </span>
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-md',
                  // In narrow containers, show only percentage
                  "@[280px]:ml-0 ml-auto",
                  progress.percentage >= 75
                    ? 'bg-green-100 text-green-700'
                    : progress.percentage >= 50
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                )}
              >
                {progress.percentage}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
