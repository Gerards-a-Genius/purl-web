// src/app/(main)/projects/page.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen, Plus, Search, SortAsc, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectCardSkeleton } from '@/components/projects/ProjectCardSkeleton';
import { CreateProjectSheet } from '@/components/projects/CreateProjectSheet';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

type StatusFilter = 'all' | 'in_progress' | 'planned' | 'finished';
type SortOption = 'lastWorked' | 'created' | 'name';

const FILTER_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'planned', label: 'Planned' },
  { id: 'finished', label: 'Finished' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'lastWorked', label: 'Last Worked' },
  { id: 'created', label: 'Created' },
  { id: 'name', label: 'Name' },
];

// Sort projects by selected option
function sortProjects(projects: Project[], sortBy: SortOption): Project[] {
  return [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'lastWorked':
        const aTime = a.lastWorkedAt ? new Date(a.lastWorkedAt).getTime() : 0;
        const bTime = b.lastWorkedAt ? new Date(b.lastWorkedAt).getTime() : 0;
        return bTime - aTime;
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}

// Filter projects by search query
function filterProjects(projects: Project[], query: string): Project[] {
  if (!query.trim()) return projects;
  const lowerQuery = query.toLowerCase();
  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(lowerQuery) ||
      project.yarn.toLowerCase().includes(lowerQuery) ||
      project.needles.toLowerCase().includes(lowerQuery)
  );
}

// Group projects by status
function groupProjectsByStatus(projects: Project[]) {
  return {
    inProgress: projects.filter((p) => p.status === 'in_progress'),
    planned: projects.filter((p) => p.status === 'planned'),
    finished: projects.filter((p) => p.status === 'finished'),
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects(user?.id);

  const [showCreationSheet, setShowCreationSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('lastWorked');
  const [finishedExpanded, setFinishedExpanded] = useState(false);

  // Group projects by status
  const { inProgress, planned, finished } = useMemo(() => {
    return groupProjectsByStatus(projects || []);
  }, [projects]);

  // Apply search filter and sort to each category
  const filteredInProgress = useMemo(
    () => sortProjects(filterProjects(inProgress, searchQuery), sortOption),
    [inProgress, searchQuery, sortOption]
  );
  const filteredPlanned = useMemo(
    () => sortProjects(filterProjects(planned, searchQuery), sortOption),
    [planned, searchQuery, sortOption]
  );
  const filteredFinished = useMemo(
    () => sortProjects(filterProjects(finished, searchQuery), sortOption),
    [finished, searchQuery, sortOption]
  );

  // Combined filtered list for single-status filter views
  const allFilteredProjects = useMemo(() => {
    let result: Project[] = [];
    if (statusFilter === 'all' || statusFilter === 'in_progress') {
      result = result.concat(filteredInProgress);
    }
    if (statusFilter === 'all' || statusFilter === 'planned') {
      result = result.concat(filteredPlanned);
    }
    if (statusFilter === 'all' || statusFilter === 'finished') {
      result = result.concat(filteredFinished);
    }
    // When showing single status, apply sort across all
    if (statusFilter !== 'all') {
      result = sortProjects(result, sortOption);
    }
    return result;
  }, [statusFilter, filteredInProgress, filteredPlanned, filteredFinished, sortOption]);

  const hasResults =
    filteredInProgress.length > 0 ||
    filteredPlanned.length > 0 ||
    filteredFinished.length > 0;

  const handleProjectPress = useCallback(
    (projectId: string) => {
      router.push(`/projects/${projectId}`);
    },
    [router]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
        </div>
        <ProjectCardSkeleton count={3} />
      </div>
    );
  }

  // Empty state - no projects at all
  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button onClick={() => setShowCreationSheet(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Start your first knitting project and track your progress row by row."
          actionLabel="Start a Project"
          onAction={() => setShowCreationSheet(true)}
        />

        <CreateProjectSheet
          open={showCreationSheet}
          onOpenChange={setShowCreationSheet}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setShowCreationSheet(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects, yarn, needles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Chips & Sort */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                statusFilter === filter.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              <SortAsc className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => setSortOption(option.id)}
                className={cn(
                  'cursor-pointer',
                  sortOption === option.id && 'bg-accent'
                )}
              >
                {option.label}
                {sortOption === option.id && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* No Results State */}
      {searchQuery && !hasResults && (
        <EmptyState
          icon={Search}
          title="No projects found"
          description={`No projects match "${searchQuery}"`}
        />
      )}

      {/* Filtered Single List (when specific status selected) */}
      {statusFilter !== 'all' && allFilteredProjects.length > 0 && (
        <div className="space-y-4">
          {allFilteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => handleProjectPress(project.id)}
            />
          ))}
        </div>
      )}

      {/* Grouped Sections (when "All" selected) */}
      {statusFilter === 'all' && (
        <div className="space-y-8">
          {/* In Progress Section */}
          {filteredInProgress.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                In Progress
              </h2>
              <div className="space-y-4">
                {filteredInProgress.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onPress={() => handleProjectPress(project.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Planned Section */}
          {filteredPlanned.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Planned
              </h2>
              <div className="space-y-4">
                {filteredPlanned.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onPress={() => handleProjectPress(project.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Finished Section - Collapsible */}
          {filteredFinished.length > 0 && (
            <section>
              <button
                className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setFinishedExpanded(!finishedExpanded)}
              >
                <span>Finished ({filteredFinished.length})</span>
                {finishedExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {finishedExpanded && (
                <div className="space-y-4">
                  {filteredFinished.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onPress={() => handleProjectPress(project.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Create Project Sheet */}
      <CreateProjectSheet
        open={showCreationSheet}
        onOpenChange={setShowCreationSheet}
      />
    </div>
  );
}
