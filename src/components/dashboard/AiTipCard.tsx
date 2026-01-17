"use client"

import * as React from "react"
import { ViewTransitionLink } from "@/components/common/ViewTransitionLink"
import { Sparkles, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * AI tips for the dashboard - rotate through these
 */
const AI_TIPS = [
  {
    tip: "Try the German Short Rows technique for smoother shoulder shaping!",
    link: "/learn/techniques/german-short-rows",
    linkText: "Learn German Short Rows",
  },
  {
    tip: "Use lifelines every 10-20 rows to save your progress and make fixing mistakes easier.",
    link: "/learn/techniques/lifelines",
    linkText: "Learn about Lifelines",
  },
  {
    tip: "Blocking your finished pieces can dramatically improve the look of your stitches.",
    link: "/learn/techniques/blocking",
    linkText: "Learn Blocking",
  },
  {
    tip: "Count your stitches after every row when learning a new pattern to catch mistakes early.",
    link: "/learn",
    linkText: "Explore Techniques",
  },
  {
    tip: "The Kitchener stitch creates an invisible seam - perfect for toe-up socks!",
    link: "/learn/techniques/kitchener-stitch",
    linkText: "Learn Kitchener Stitch",
  },
]

/**
 * AiTipCard - Shows a rotating AI tip on the dashboard
 *
 * Displays helpful knitting tips with links to learn more.
 * Tips are selected randomly on each render.
 */
export function AiTipCard() {
  // Select a random tip (seeded by date for consistency within a day)
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const tipIndex = dayOfYear % AI_TIPS.length
  const currentTip = AI_TIPS[tipIndex]

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="size-4 text-copper" />
        <span className="text-label text-copper font-medium">AI Tip</span>
      </div>

      <p className="text-sm text-foreground">
        {currentTip.tip}
      </p>

      <Button variant="link" className="p-0 h-auto mt-2" asChild>
        <ViewTransitionLink href={currentTip.link}>
          {currentTip.linkText}
          <ArrowRight className="size-3" />
        </ViewTransitionLink>
      </Button>
    </div>
  )
}
