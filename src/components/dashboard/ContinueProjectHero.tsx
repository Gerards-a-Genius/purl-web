"use client"

import * as React from "react"
import { ViewTransitionLink } from "@/components/common/ViewTransitionLink"
import { Play, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { Project } from "@/types/project"

interface ContinueProjectHeroProps {
  project: Project | null | undefined
  isLoading?: boolean
}

/**
 * ContinueProjectHero - Hero card showing the most recent in-progress project
 *
 * Displays project progress, current step, and a prominent "Continue" CTA.
 * Falls back to an encouraging empty state when no projects exist.
 */
export function ContinueProjectHero({ project, isLoading }: ContinueProjectHeroProps) {
  if (isLoading) {
    return <ContinueProjectHeroSkeleton />
  }

  if (!project) {
    return <ContinueProjectHeroEmpty />
  }

  // Calculate progress percentage
  const completedSteps = project.steps?.filter(s => s.completed).length ?? 0
  const totalSteps = project.steps?.length ?? 0
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  // Find current step
  const currentStepIndex = project.steps?.findIndex(s => !s.completed) ?? 0
  const currentStep = project.steps?.[currentStepIndex]

  // Format time spent
  const hoursSpent = project.totalTimeSpent
    ? Math.floor(project.totalTimeSpent / 3600000)
    : 0
  const minutesSpent = project.totalTimeSpent
    ? Math.floor((project.totalTimeSpent % 3600000) / 60000)
    : 0

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <Badge variant="secondary" className="mb-4">
          In Progress
        </Badge>
        <h2 className="text-h2 text-chestnut">{project.name}</h2>
        <p className="text-muted-foreground mt-2">
          {currentStep
            ? `Step ${currentStepIndex + 1}: ${currentStep.title}`
            : "Ready to continue"
          }
        </p>

        <div className="mt-4">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">
              {progressPercent}% complete
            </p>
            {project.totalTimeSpent && project.totalTimeSpent > 0 && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                {hoursSpent > 0 ? `${hoursSpent}h ` : ""}{minutesSpent}m
              </p>
            )}
          </div>
        </div>
      </div>

      <Button size="lg" className="mt-6" asChild>
        <ViewTransitionLink href={`/projects/${project.id}/steps`}>
          <Play className="size-4" />
          Continue
        </ViewTransitionLink>
      </Button>
    </div>
  )
}

/**
 * Loading skeleton for the hero card
 */
function ContinueProjectHeroSkeleton() {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <Skeleton className="h-5 w-20 mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
        <div className="mt-4">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
      </div>
      <Skeleton className="h-12 w-full mt-6" />
    </div>
  )
}

/**
 * Empty state when no projects exist
 */
function ContinueProjectHeroEmpty() {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="text-4xl mb-4">🧶</div>
        <h2 className="text-h2 text-chestnut">Start Your Journey</h2>
        <p className="text-muted-foreground mt-2">
          Create your first knitting project and let Purl guide you stitch by stitch.
        </p>
      </div>

      <Button size="lg" className="mt-6" asChild>
        <ViewTransitionLink href="/projects/new/wizard">
          Get Started
        </ViewTransitionLink>
      </Button>
    </div>
  )
}

export { ContinueProjectHeroSkeleton, ContinueProjectHeroEmpty }
