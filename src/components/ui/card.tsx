import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Card Component Variants
 *
 * Design Philosophy: "Warm Minimalism with Craft Heritage"
 *
 * Variants:
 * - default: Standard card with subtle shadow
 * - glass: Glassmorphism effect for overlays and modals
 * - feature: Hero card for bento grids with gradient background
 * - elevated: Higher elevation with stronger shadow
 * - outline: Bordered card without shadow
 */
const cardVariants = cva(
  "flex flex-col rounded-xl text-card-foreground transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-card border shadow-sm",
        glass:
          "glass border-none",
        feature:
          "bg-gradient-warm border-none shadow-md",
        elevated:
          "bg-card border shadow-lg",
        outline:
          "bg-transparent border-2 shadow-none",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
        false: "",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    compoundVariants: [
      {
        variant: "glass",
        interactive: true,
        className: "hover:shadow-lg hover:backdrop-blur-xl",
      },
      {
        variant: "feature",
        interactive: true,
        className: "hover:shadow-xl hover:scale-[1.01]",
      },
    ],
    defaultVariants: {
      variant: "default",
      interactive: false,
      padding: "none",
    },
  }
)

interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({
  className,
  variant,
  interactive,
  padding,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      data-interactive={interactive}
      className={cn(
        cardVariants({ variant, interactive, padding }),
        // Default gap when no padding variant
        padding === "none" && "gap-6 py-6",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

/**
 * Glass Card - Specialized component for modal overlays
 * Uses glassmorphism with backdrop blur
 */
function GlassCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      variant="glass"
      className={cn("backdrop-blur-xl", className)}
      {...props}
    >
      {children}
    </Card>
  )
}

/**
 * Feature Card - Hero card for bento grid layouts
 * Includes gradient background and larger padding
 */
function FeatureCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Card
      variant="feature"
      padding="lg"
      className={cn("min-h-[280px]", className)}
      {...props}
    >
      {children}
    </Card>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  GlassCard,
  FeatureCard,
  cardVariants,
}
