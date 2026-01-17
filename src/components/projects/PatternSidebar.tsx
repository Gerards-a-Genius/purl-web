"use client"

import * as React from "react"
import { ViewTransitionLink } from "@/components/common/ViewTransitionLink"
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Project, Step } from "@/types/project"
import { cn } from "@/lib/utils"

interface PatternSidebarProps {
  project: Project
  currentStep: Step | undefined
  currentStepIndex: number
  onToggleRow?: (stepId: string, rowNumber: number, currentCompletedRows?: number[]) => void
}

/**
 * PatternSidebar - Desktop sidebar showing pattern preview and row counter
 *
 * Displays:
 * - Pattern image/PDF preview (if available)
 * - Zoom controls
 * - Row counter for the current step
 * - Link to full pattern viewer/annotations
 */
export function PatternSidebar({
  project,
  currentStep,
  currentStepIndex,
  onToggleRow,
}: PatternSidebarProps) {
  const [zoom, setZoom] = React.useState(100)

  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 25))
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 25))
  const handleZoomReset = () => setZoom(100)

  const hasPattern = !!project.patternFileUrl
  const hasRows = currentStep?.rowCount && currentStep.rowCount > 1
  const completedRows = currentStep?.completedRows || []

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Pattern Preview */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Pattern</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-10 text-center">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={handleZoomReset}>
                <RotateCcw className="size-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-60px)]">
          {hasPattern ? (
            <div className="relative h-full overflow-auto bg-muted/30">
              <div
                className="p-4 transition-transform origin-top-left"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                {project.patternFileUrl?.endsWith('.pdf') ? (
                  <div className="flex flex-col items-center justify-center h-64 bg-caramel-surface rounded-lg">
                    <FileText className="size-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">PDF Pattern</p>
                    <Button variant="link" className="mt-2" asChild>
                      <a
                        href={project.patternFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Full Pattern
                      </a>
                    </Button>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.patternFileUrl}
                    alt="Pattern preview"
                    className="max-w-full rounded-lg"
                  />
                )}
              </div>

              {/* Full viewer link */}
              <ViewTransitionLink
                href={`/projects/${project.id}/pattern`}
                className="absolute bottom-4 right-4"
              >
                <Button variant="secondary" size="sm">
                  <Maximize2 className="size-4 mr-1" />
                  Full View
                </Button>
              </ViewTransitionLink>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-muted/30 rounded-b-lg">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-sm text-muted-foreground text-center px-4">
                No pattern file attached
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Follow the instructions on the right
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row Counter */}
      {hasRows && currentStep && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Row Counter - {currentStep.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  // Find the last completed row and uncomplete it
                  if (completedRows.length > 0 && onToggleRow) {
                    const lastRow = Math.max(...completedRows)
                    onToggleRow(currentStep.id, lastRow, completedRows)
                  }
                }}
                disabled={completedRows.length === 0}
              >
                <Minus className="size-4" />
              </Button>

              <div className="text-center">
                <p className="text-3xl font-bold tabular-nums">
                  {completedRows.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {currentStep.rowCount} rows
                </p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  // Find the next uncompleted row and complete it
                  if (onToggleRow && currentStep.rowCount) {
                    for (let i = 1; i <= currentStep.rowCount; i++) {
                      if (!completedRows.includes(i)) {
                        onToggleRow(currentStep.id, i, completedRows)
                        break
                      }
                    }
                  }
                }}
                disabled={completedRows.length >= (currentStep.rowCount || 0)}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            {/* Row pills */}
            <div className="flex flex-wrap gap-1 mt-4 justify-center">
              {Array.from({ length: currentStep.rowCount! }, (_, i) => i + 1).map(
                (row) => {
                  const isCompleted = completedRows.includes(row)
                  return (
                    <button
                      key={row}
                      onClick={() =>
                        onToggleRow?.(currentStep.id, row, completedRows)
                      }
                      className={cn(
                        "w-7 h-7 rounded text-xs font-medium transition-colors",
                        isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {row}
                    </button>
                  )
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Progress (when no rows) */}
      {!hasRows && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold">
                Step {currentStepIndex + 1}
              </p>
              <p className="text-sm text-muted-foreground">
                of {project.steps.length}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Loading skeleton for pattern sidebar
 */
export function PatternSidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="text-center">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-3 w-12 mx-auto mt-1" />
            </div>
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
