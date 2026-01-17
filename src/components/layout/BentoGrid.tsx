"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Bento Grid Layout System
 *
 * Modern web design uses asymmetric grid compositions that feel organic yet structured.
 * Perfect for Purl's craft aesthetic.
 *
 * Example Dashboard Layout:
 * ┌────────────────┬─────────────┐
 * │                │   Quick     │
 * │  Continue      │   Actions   │
 * │  Project       ├─────────────┤
 * │  (Hero Card)   │   AI Tips   │
 * ├────────┬───────┴─────────────┤
 * │Progress│   Recent Projects   │
 * │ Stats  │                     │
 * └────────┴─────────────────────┘
 */

const bentoGridVariants = cva("grid gap-4", {
  variants: {
    /**
     * Layout presets for common patterns
     */
    layout: {
      // Auto-fit responsive grid
      auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      // Two column with hero
      "hero-sidebar":
        "grid-cols-1 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_auto]",
      // Dashboard layout
      dashboard:
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr]",
      // Feature showcase
      showcase:
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(200px,auto)]",
      // Masonry-like
      masonry: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(150px,auto)]",
      // Side-by-side (for project steps)
      split: "grid-cols-1 lg:grid-cols-2",
    },
    /**
     * Gap sizes
     */
    gap: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
  },
  defaultVariants: {
    layout: "auto",
    gap: "md",
  },
})

interface BentoGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoGridVariants> {}

/**
 * BentoGrid - Container for bento grid layouts
 */
function BentoGrid({
  className,
  layout,
  gap,
  children,
  ...props
}: BentoGridProps) {
  return (
    <div
      className={cn(bentoGridVariants({ layout, gap }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

const bentoItemVariants = cva(
  "rounded-xl transition-all duration-normal ease-out",
  {
    variants: {
      /**
       * Span presets for grid items
       */
      span: {
        1: "col-span-1",
        2: "col-span-1 sm:col-span-2",
        3: "col-span-1 sm:col-span-2 lg:col-span-3",
        full: "col-span-full",
      },
      /**
       * Row span
       */
      rowSpan: {
        1: "row-span-1",
        2: "row-span-2",
        3: "row-span-3",
      },
      /**
       * Visual style
       */
      variant: {
        default: "bg-card border shadow-sm",
        glass: "glass",
        feature: "bg-gradient-warm shadow-md",
        elevated: "bg-card border shadow-lg",
        transparent: "bg-transparent",
      },
      /**
       * Interactive behavior
       */
      interactive: {
        true: "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
        false: "",
      },
    },
    defaultVariants: {
      span: 1,
      rowSpan: 1,
      variant: "default",
      interactive: false,
    },
  }
)

interface BentoItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoItemVariants> {}

/**
 * BentoItem - Individual grid item
 */
function BentoItem({
  className,
  span,
  rowSpan,
  variant,
  interactive,
  children,
  ...props
}: BentoItemProps) {
  return (
    <div
      className={cn(
        bentoItemVariants({ span, rowSpan, variant, interactive }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * BentoHero - Large featured item (typically 2x2 or full-width)
 */
function BentoHero({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BentoItem
      span={2}
      rowSpan={2}
      variant="feature"
      className={cn("p-8 min-h-[280px]", className)}
      {...props}
    >
      {children}
    </BentoItem>
  )
}

/**
 * BentoSidebar - Sidebar item that spans full height
 */
function BentoSidebar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BentoItem
      rowSpan={2}
      variant="default"
      className={cn("p-6", className)}
      {...props}
    >
      {children}
    </BentoItem>
  )
}

/**
 * BentoStats - Compact stats card
 */
function BentoStats({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BentoItem
      variant="elevated"
      className={cn("p-4", className)}
      {...props}
    >
      {children}
    </BentoItem>
  )
}

/**
 * BentoRow - Full-width item
 */
function BentoRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BentoItem
      span="full"
      variant="default"
      className={cn("p-6", className)}
      {...props}
    >
      {children}
    </BentoItem>
  )
}

export {
  BentoGrid,
  BentoItem,
  BentoHero,
  BentoSidebar,
  BentoStats,
  BentoRow,
  bentoGridVariants,
  bentoItemVariants,
}
