"use client"

import * as React from "react"
import { ViewTransitionLink } from "@/components/common/ViewTransitionLink"
import { Plus, HelpCircle, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * QuickActions - Dashboard quick action buttons
 *
 * Provides fast access to:
 * - New Project creation
 * - SOS Help assistant
 * - Learn section
 */
export function QuickActions() {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Quick Actions</h3>

      <div className="flex flex-col gap-2">
        <Button variant="ghost" className="justify-start h-9" asChild>
          <ViewTransitionLink href="/projects/new/wizard">
            <Plus className="size-4" />
            New Project
          </ViewTransitionLink>
        </Button>

        <Button variant="ghost" className="justify-start h-9" asChild>
          <ViewTransitionLink href="/sos">
            <HelpCircle className="size-4 text-warning" />
            SOS Help
          </ViewTransitionLink>
        </Button>

        <Button variant="ghost" className="justify-start h-9" asChild>
          <ViewTransitionLink href="/learn">
            <BookOpen className="size-4 text-olive" />
            Learn
          </ViewTransitionLink>
        </Button>
      </div>
    </div>
  )
}
