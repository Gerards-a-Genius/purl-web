import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Input Component
 *
 * 2025 Form Best Practices:
 * - 48px height minimum for touch targets
 * - Inline validation support
 * - Prefix/suffix icons for context
 * - Focus states with ring shadow
 */

const inputVariants = cva(
  [
    "flex w-full min-w-0 rounded-md border bg-transparent text-base",
    "shadow-xs transition-all duration-fast ease-out outline-none",
    "placeholder:text-muted-foreground",
    "selection:bg-primary selection:text-primary-foreground",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    "dark:bg-input/30",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-9 px-3 py-1 text-sm",
        default: "h-12 px-4 py-3",
        lg: "h-14 px-4 py-4 text-lg",
      },
      variant: {
        default: "border-input",
        ghost: "border-transparent hover:border-input",
        filled: "border-transparent bg-muted",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

interface InputProps
  extends Omit<React.ComponentProps<"input">, "size" | "prefix">,
    VariantProps<typeof inputVariants> {
  /**
   * Icon or element to display at the start of the input
   */
  startAdornment?: React.ReactNode
  /**
   * Icon or element to display at the end of the input
   */
  endAdornment?: React.ReactNode
  /**
   * Error message to display below input
   */
  error?: string
}

function Input({
  className,
  type,
  size,
  variant,
  startAdornment,
  endAdornment,
  error,
  ...props
}: InputProps) {
  // If we have adornments, wrap in a container
  if (startAdornment || endAdornment) {
    return (
      <div className="relative w-full">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md border transition-all duration-fast",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            error && "border-destructive ring-destructive/20",
            variant === "filled" && "bg-muted border-transparent",
            variant === "ghost" && "border-transparent hover:border-input",
            variant === "default" && "border-input",
            size === "sm" && "h-9 px-3",
            size === "default" && "h-12 px-4",
            size === "lg" && "h-14 px-4"
          )}
        >
          {startAdornment && (
            <span className="flex shrink-0 text-muted-foreground">
              {startAdornment}
            </span>
          )}
          <input
            type={type}
            data-slot="input"
            aria-invalid={!!error}
            className={cn(
              "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50",
              size === "sm" && "text-sm",
              size === "lg" && "text-lg"
            )}
            {...props}
          />
          {endAdornment && (
            <span className="flex shrink-0 text-muted-foreground">
              {endAdornment}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <input
        type={type}
        data-slot="input"
        aria-invalid={!!error}
        className={cn(inputVariants({ size, variant }), className)}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

/**
 * Search Input - Specialized input with search icon
 */
function SearchInput({
  className,
  ...props
}: Omit<InputProps, "startAdornment" | "type">) {
  return (
    <Input
      type="search"
      startAdornment={
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      className={className}
      {...props}
    />
  )
}

export { Input, SearchInput, inputVariants }
