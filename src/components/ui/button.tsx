import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button Component
 *
 * Design Philosophy: "Warm Minimalism with Craft Heritage"
 *
 * Hierarchy (2025 best practice - clear action hierarchy):
 * - default (Primary): Main CTA - Solid copper, prominent
 * - secondary: Alternative action - Muted background
 * - outline: Outlined, subtle border
 * - ghost: Tertiary action - No border, text only
 * - destructive: Dangerous actions - Red, requires confirmation
 * - link: Inline text link style
 *
 * Sizes:
 * - sm: 32px - Compact UI elements
 * - default: 40px - Standard buttons
 * - lg: 48px - Emphasized actions
 * - xl: 56px - Hero CTAs (2025 trend)
 * - icon: Square icons (sm/md/lg variants)
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md",
    "text-sm font-medium",
    "transition-all duration-fast ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:ring-offset-2",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground shadow-sm",
          "hover:bg-primary/90 hover:shadow-md hover:-translate-y-px",
          "active:translate-y-0 active:shadow-sm",
        ].join(" "),
        destructive: [
          "bg-destructive text-white shadow-sm",
          "hover:bg-destructive/90 hover:shadow-md hover:-translate-y-px",
          "active:translate-y-0 active:shadow-sm",
          "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
          "dark:bg-destructive/80",
        ].join(" "),
        outline: [
          "border-2 border-input bg-background shadow-xs",
          "hover:bg-accent hover:text-accent-foreground hover:border-accent",
          "dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground shadow-xs",
          "hover:bg-secondary/80 hover:shadow-sm",
        ].join(" "),
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
          "dark:hover:bg-accent/50",
        ].join(" "),
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),
      },
      size: {
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        lg: "h-12 rounded-lg px-6 text-base has-[>svg]:px-4",
        xl: "h-14 rounded-xl px-8 text-base font-semibold has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || loading

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner className="animate-spin" />
          <span className="sr-only">Loading</span>
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

/**
 * Loading spinner for button loading state
 */
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

/**
 * Icon Button - Convenience component for icon-only buttons
 */
function IconButton({
  size = "icon",
  ...props
}: Omit<ButtonProps, "size"> & { size?: "icon" | "icon-sm" | "icon-lg" }) {
  return <Button size={size} {...props} />
}

export { Button, IconButton, buttonVariants }
