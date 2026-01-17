"use client"

import * as React from "react"
import { ViewTransitionLink } from "@/components/common/ViewTransitionLink"
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LifeBuoy,
  Zap,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { Project, Step } from "@/types/project"
import { cn } from "@/lib/utils"

interface StepInstructionsProps {
  project: Project
  currentStepIndex: number
  onStepChange: (newIndex: number) => void
  onToggleStep: (stepId: string, currentCompleted?: boolean) => void
  onShowMeHow: () => void
  onOpenSOS: () => void
  getTechniqueName?: (techId: string) => string
}

/**
 * StepInstructions - Desktop component showing current step details
 *
 * Displays:
 * - Step badge and title
 * - Full description
 * - Techniques used with links
 * - Navigation between steps
 * - Action buttons (Show Me How, SOS)
 */
export function StepInstructions({
  project,
  currentStepIndex,
  onStepChange,
  onToggleStep,
  onShowMeHow,
  onOpenSOS,
  getTechniqueName,
}: StepInstructionsProps) {
  const currentStep = project.steps[currentStepIndex]

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No step selected</p>
      </div>
    )
  }

  const hasRows = currentStep.rowCount && currentStep.rowCount > 1
  const completedRows = currentStep.completedRows || []
  const stepProgress = hasRows
    ? Math.round((completedRows.length / currentStep.rowCount!) * 100)
    : currentStep.completed
    ? 100
    : 0

  const hasPrevious = currentStepIndex > 0
  const hasNext = currentStepIndex < project.steps.length - 1

  return (
    <div className="flex flex-col h-full">
      {/* Step Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">Step {currentStepIndex + 1}</Badge>
          <span className="text-sm text-muted-foreground">
            of {project.steps.length}
          </span>
          {currentStep.milestone && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Milestone
            </Badge>
          )}
        </div>

        <h2
          className={cn(
            "text-h3 text-chestnut mb-2",
            currentStep.completed && "line-through opacity-60"
          )}
        >
          {currentStep.title}
        </h2>

        {/* Step progress bar */}
        <div className="flex items-center gap-3">
          <Progress value={stepProgress} className="flex-1 h-2" />
          <span className="text-sm font-medium text-muted-foreground">
            {stepProgress}%
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="flex-1 overflow-auto">
        <div className="prose prose-sm max-w-none">
          <p className="text-base leading-relaxed text-foreground">
            {currentStep.description}
          </p>
        </div>

        {/* Techniques Card */}
        {currentStep.techniques && currentStep.techniques.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="size-4 text-olive" />
                Techniques Used
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentStep.techniques.map((techId) => (
                  <ViewTransitionLink key={techId} href={`/learn/technique/${techId}`}>
                    <Badge
                      variant="secondary"
                      className="hover:bg-muted cursor-pointer"
                    >
                      {getTechniqueName
                        ? getTechniqueName(techId)
                        : techId.replace(/-/g, " ")}
                    </Badge>
                  </ViewTransitionLink>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Color change indicator */}
        {currentStep.colorChange && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Color Change</h4>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{ backgroundColor: currentStep.colorChange.from }}
                />
                <ChevronRight className="size-4 text-muted-foreground" />
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{ backgroundColor: currentStep.colorChange.to }}
                />
                {currentStep.colorChange.colorName && (
                  <span className="text-sm text-muted-foreground ml-2">
                    Change to {currentStep.colorChange.colorName}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t space-y-4">
        {/* Mark Complete (for non-row steps) */}
        {!hasRows && (
          <Button
            variant={currentStep.completed ? "outline" : "default"}
            className="w-full"
            onClick={() => onToggleStep(currentStep.id, currentStep.completed)}
          >
            <Check className="size-4 mr-2" />
            {currentStep.completed ? "Mark as Incomplete" : "Mark Step Complete"}
          </Button>
        )}

        {/* Help Buttons */}
        <div className="flex gap-3">
          {currentStep.techniques && currentStep.techniques.length > 0 && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={onShowMeHow}
            >
              <HelpCircle className="size-4 mr-2" />
              Show Me How
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={onOpenSOS}
          >
            <LifeBuoy className="size-4 mr-2" />
            SOS Help
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onStepChange(currentStepIndex - 1)}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          <Button
            className="flex-1"
            onClick={() => onStepChange(currentStepIndex + 1)}
            disabled={!hasNext}
          >
            Next Step
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton for step instructions
 */
export function StepInstructionsSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-2 w-full" />
      </div>

      <div className="flex-1">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/5" />

        <div className="mt-6">
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  )
}
