"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  HelpCircle,
  BookOpen,
  Folder,
  Home,
  Settings,
  Moon,
  Sun,
  FileText,
  Clock,
} from "lucide-react"
import { useTheme } from "next-themes"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

/**
 * Command Palette Provider
 *
 * A 2025 essential - keyboard-first navigation (⌘K)
 *
 * Features:
 * - Global keyboard shortcut (⌘K / Ctrl+K)
 * - Quick actions (New Project, SOS Help)
 * - Navigation (Projects, Learn, Profile)
 * - Recent projects
 * - Theme toggle
 */

interface CommandPaletteProps {
  recentProjects?: Array<{
    id: string
    name: string
    updatedAt?: string
  }>
}

export function CommandPalette({ recentProjects = [] }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme, theme } = useTheme()

  // Register global keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // ⌘K on Mac, Ctrl+K on Windows/Linux
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    []
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search projects, techniques, or type a command..."
        onClear={() => setOpen(false)}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="size-10 text-muted-foreground/50" />
            <p>No results found.</p>
            <p className="text-xs text-muted-foreground">
              Try searching for a project or technique
            </p>
          </div>
        </CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/projects/new"))
            }
          >
            <Plus className="size-4 text-copper" />
            <span>New Project</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                // Open SOS Assistant - this would trigger a global state
                // For now, navigate to a help page or open a modal
                router.push("/help")
              })
            }
          >
            <HelpCircle className="size-4 text-warning" />
            <span>SOS Help</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/learn"))}
          >
            <BookOpen className="size-4 text-olive" />
            <span>Learn Something</span>
            <CommandShortcut>⌘L</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/"))}
          >
            <Home className="size-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/projects"))}
          >
            <Folder className="size-4" />
            <span>All Projects</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/learn"))}
          >
            <BookOpen className="size-4" />
            <span>Learn</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/profile"))}
          >
            <Settings className="size-4" />
            <span>Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Projects">
              {recentProjects.slice(0, 5).map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() =>
                    runCommand(() =>
                      router.push(`/projects/${project.id}`)
                    )
                  }
                >
                  <FileText className="size-4 text-muted-foreground" />
                  <span>{project.name}</span>
                  {project.updatedAt && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {formatRelativeTime(project.updatedAt)}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        {/* Theme Toggle */}
        <CommandGroup heading="Appearance">
          <CommandItem
            onSelect={() =>
              runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            <span>
              Switch to {theme === "dark" ? "Light" : "Dark"} Mode
            </span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

/**
 * Format relative time (e.g., "2 hours ago", "yesterday")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

/**
 * Hook to control command palette programmatically
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false)

  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle, setIsOpen }
}
