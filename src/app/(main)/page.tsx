"use client"

import * as React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useProjects, useProjectsByStatus } from "@/hooks/useProjects"
import {
  BentoGrid,
  BentoHero,
  BentoItem,
  BentoStats,
  BentoRow,
} from "@/components/layout/BentoGrid"
import {
  ContinueProjectHero,
  QuickActions,
  AiTipCard,
  StatsCard,
  RecentProjects,
  FeaturedPatterns,
} from "@/components/dashboard"

/**
 * Home Dashboard
 *
 * The main authenticated landing page showing:
 * - Continue most recent project (hero)
 * - Quick actions sidebar
 * - AI tip of the day
 * - Weekly stats
 * - Recent projects grid
 *
 * Uses BentoGrid with "dashboard" layout for asymmetric composition.
 */
export default function HomePage() {
  const { user } = useAuth()
  const { data: projects, isLoading: projectsLoading } = useProjects(user?.id)
  const { data: inProgressProjects } = useProjectsByStatus(user?.id, "in_progress")

  // Get the most recently worked-on in-progress project
  const continueProject = React.useMemo(() => {
    if (!inProgressProjects || inProgressProjects.length === 0) {
      return null
    }

    // Sort by lastWorkedAt to get the most recent
    return [...inProgressProjects].sort((a, b) => {
      const aDate = a.lastWorkedAt ? new Date(a.lastWorkedAt).getTime() : 0
      const bDate = b.lastWorkedAt ? new Date(b.lastWorkedAt).getTime() : 0
      return bDate - aDate
    })[0]
  }, [inProgressProjects])

  return (
    <div className="container max-w-6xl py-8">
      <BentoGrid layout="dashboard" gap="lg">
        {/* Hero - Continue Project */}
        <BentoHero className="lg:col-span-1 lg:row-span-2">
          <ContinueProjectHero
            project={continueProject}
            isLoading={projectsLoading}
          />
        </BentoHero>

        {/* Sidebar - Quick Actions & AI Tip */}
        <div className="flex flex-col gap-4">
          <BentoItem variant="default" className="p-6">
            <QuickActions />
          </BentoItem>

          <BentoItem variant="elevated" className="p-6">
            <AiTipCard />
          </BentoItem>
        </div>

        {/* Stats Card */}
        <BentoStats>
          <StatsCard projects={projects} isLoading={projectsLoading} />
        </BentoStats>

        {/* Recent Projects Row */}
        <BentoRow>
          <RecentProjects
            projects={projects}
            isLoading={projectsLoading}
            limit={4}
          />
        </BentoRow>

        {/* Featured Patterns Row - Pattern Library Discovery */}
        <BentoRow>
          <FeaturedPatterns limit={3} isLoading={projectsLoading} />
        </BentoRow>
      </BentoGrid>
    </div>
  )
}
