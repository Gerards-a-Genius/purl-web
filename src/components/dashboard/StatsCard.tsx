"use client"

import * as React from "react"
import { Clock, Target, TrendingUp } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import type { Project } from "@/types/project"

interface StatsCardProps {
  projects: Project[] | undefined
  isLoading?: boolean
}

/**
 * StatsCard - Dashboard statistics showing crafting activity
 *
 * Displays:
 * - Total time spent this week
 * - Projects in progress
 * - Completed projects
 */
export function StatsCard({ projects, isLoading }: StatsCardProps) {
  if (isLoading) {
    return <StatsCardSkeleton />
  }

  // Calculate stats from projects
  const stats = React.useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        totalTimeMs: 0,
        inProgress: 0,
        finished: 0,
      }
    }

    // Filter projects worked on this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const recentProjects = projects.filter(
      p => p.lastWorkedAt && new Date(p.lastWorkedAt) >= weekAgo
    )

    const totalTimeMs = recentProjects.reduce(
      (sum, p) => sum + (p.totalTimeSpent || 0),
      0
    )

    const inProgress = projects.filter(p => p.status === "in_progress").length
    const finished = projects.filter(p => p.status === "finished").length

    return { totalTimeMs, inProgress, finished }
  }, [projects])

  // Format time
  const hours = Math.floor(stats.totalTimeMs / 3600000)
  const minutes = Math.floor((stats.totalTimeMs % 3600000) / 60000)
  const timeDisplay = hours > 0
    ? `${hours}.${Math.floor(minutes / 6)}h`
    : `${minutes}m`

  return (
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-full bg-olive-surface flex items-center justify-center">
        <Clock className="size-5 text-olive" />
      </div>
      <div>
        <p className="text-2xl font-bold">{timeDisplay}</p>
        <p className="text-xs text-muted-foreground">This Week</p>
      </div>

      <div className="w-px h-8 bg-border mx-2" />

      <div className="flex items-center gap-2">
        <Target className="size-4 text-copper" />
        <div>
          <p className="text-lg font-semibold">{stats.inProgress}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TrendingUp className="size-4 text-caramel" />
        <div>
          <p className="text-lg font-semibold">{stats.finished}</p>
          <p className="text-xs text-muted-foreground">Done</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton for stats card
 */
function StatsCardSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div>
        <Skeleton className="h-7 w-16 mb-1" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="w-px h-8 bg-border mx-2" />
      <div className="flex gap-4">
        <div>
          <Skeleton className="h-6 w-8 mb-1" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div>
          <Skeleton className="h-6 w-8 mb-1" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  )
}

export { StatsCardSkeleton }
