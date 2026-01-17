"use client"

import * as React from "react"
import { ViewTransitionLink } from "@/components/common/ViewTransitionLink"
import { Plus, MoreHorizontal, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/types/project"

interface RecentProjectsProps {
  projects: Project[] | undefined
  isLoading?: boolean
  limit?: number
}

/**
 * RecentProjects - Horizontal scroll of recent project cards
 *
 * Shows the most recently worked-on projects with quick actions.
 * Includes a "New Project" card at the end.
 */
export function RecentProjects({ projects, isLoading, limit = 4 }: RecentProjectsProps) {
  if (isLoading) {
    return <RecentProjectsSkeleton count={limit} />
  }

  // Sort by lastWorkedAt and limit
  const recentProjects = React.useMemo(() => {
    if (!projects) return []
    return [...projects]
      .sort((a, b) => {
        const aDate = a.lastWorkedAt ? new Date(a.lastWorkedAt).getTime() : 0
        const bDate = b.lastWorkedAt ? new Date(b.lastWorkedAt).getTime() : 0
        return bDate - aDate
      })
      .slice(0, limit)
  }, [projects, limit])

  return (
    <div>
      <h3 className="font-semibold mb-4">Recent Projects</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentProjects.map((project) => (
          <RecentProjectCard key={project.id} project={project} />
        ))}

        {/* Show fewer empty slots if we have projects */}
        {recentProjects.length < limit && (
          <NewProjectCard />
        )}
      </div>
    </div>
  )
}

interface RecentProjectCardProps {
  project: Project
}

/**
 * Individual project card in the recent projects grid
 */
function RecentProjectCard({ project }: RecentProjectCardProps) {
  // Calculate progress
  const completedSteps = project.steps?.filter(s => s.completed).length ?? 0
  const totalSteps = project.steps?.length ?? 0
  const progressPercent = totalSteps > 0
    ? Math.round((completedSteps / totalSteps) * 100)
    : 0

  return (
    <div className="group relative rounded-lg bg-caramel-surface p-3 transition-all hover:shadow-md">
      {/* Preview/Thumbnail */}
      <div className="aspect-square rounded-md bg-background/50 flex items-center justify-center mb-2">
        <span className="text-3xl">🧶</span>
      </div>

      {/* Project info */}
      <h4 className="font-medium text-sm truncate">{project.name}</h4>

      <div className="mt-2">
        <Progress value={progressPercent} className="h-1" />
        <p className="text-xs text-muted-foreground mt-1">
          {progressPercent}%
        </p>
      </div>

      {/* Quick actions overlay */}
      <div className="absolute inset-0 rounded-lg bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button size="sm" asChild>
          <ViewTransitionLink href={`/projects/${project.id}/steps`}>
            <Play className="size-3" />
            Continue
          </ViewTransitionLink>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <ViewTransitionLink href={`/projects/${project.id}`}>View Details</ViewTransitionLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <ViewTransitionLink href={`/projects/${project.id}/edit`}>Edit</ViewTransitionLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/**
 * Card for creating a new project
 */
function NewProjectCard() {
  return (
    <ViewTransitionLink
      href="/projects/new/wizard"
      className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30 transition-all"
    >
      <Plus className="size-8 text-muted-foreground mb-2" />
      <span className="text-sm text-muted-foreground">New Project</span>
    </ViewTransitionLink>
  )
}

/**
 * Loading skeleton for recent projects
 */
function RecentProjectsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-lg bg-muted/30 p-3">
            <Skeleton className="aspect-square rounded-md mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-1 w-full mb-1" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

export { RecentProjectsSkeleton }
