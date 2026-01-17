// src/app/(main)/projects/[id]/page.tsx
'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useViewTransition } from '@/hooks/useViewTransition';
import {
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  Play,
  Clock,
  FileText,
  Image as ImageIcon,
  Eye,
  Copy,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Settings,
  BookMarked,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useProject, useUpdateProject, useDeleteProject, useDuplicateProject } from '@/hooks/useProjects';
import { StatusPill } from '@/components/common/StatusPill';
import { formatDuration } from '@/hooks/useTimer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Project, ProjectStatus } from '@/types/project';
import { PatternViewer } from '@/components/projects/PatternViewer';
import { PatternCard } from '@/components/patterns/PatternCard';
import { ViewTransitionLink } from '@/components/common/ViewTransitionLink';
import { mockPatternCards } from '@/components/patterns/__mocks__/patterns';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: project, isLoading, error } = useProject(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject(user?.id || '');
  const duplicateProject = useDuplicateProject(user?.id || '');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPatternViewer, setShowPatternViewer] = useState(false);
  const { navigateWithTransition } = useViewTransition();

  // Find similar patterns based on shared techniques
  const similarPatterns = useMemo(() => {
    if (!project || project.techniques.length === 0) return [];
    const projectTechniques = project.techniques.map((t) => t.toLowerCase());
    return mockPatternCards
      .filter((pattern) =>
        pattern.techniques.some(
          (t) =>
            projectTechniques.includes(t.id.toLowerCase()) ||
            projectTechniques.includes(t.name.toLowerCase().replace(/\s+/g, '-'))
        )
      )
      .slice(0, 4);
  }, [project]);

  // Calculate progress
  const getProgress = (project: Project) => {
    const steps = project.steps || [];
    let completedRows = 0;
    let totalRows = project.totalRows || 0;

    for (const step of steps) {
      if (step.completed) {
        completedRows += step.rowCount || 1;
      } else if (step.completedRows) {
        completedRows += step.completedRows.length;
      }
      if (step.children) {
        for (const child of step.children) {
          if (child.completed) {
            completedRows += child.rowCount || 1;
          } else if (child.completedRows) {
            completedRows += child.completedRows.length;
          }
        }
      }
    }

    if (totalRows === 0) {
      totalRows = steps.reduce((sum, s) => {
        const stepRows = s.rowCount || 1;
        const childRows = s.children?.reduce((cs, c) => cs + (c.rowCount || 1), 0) || 0;
        return sum + stepRows + childRows;
      }, 0);
    }

    const percentage = totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0;
    return { completed: completedRows, total: totalRows, percentage };
  };

  const handleChangeStatus = async (newStatus: ProjectStatus) => {
    if (!project) return;
    try {
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: { status: newStatus },
      });
      toast.success(`Project marked as ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
    }
  };

  const handleDuplicate = async () => {
    if (!project) return;
    try {
      const newProject = await duplicateProject.mutateAsync({
        projectId: project.id,
        newName: `${project.name} (Copy)`,
      });
      toast.success('Project duplicated');
      router.push(`/projects/${newProject.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to duplicate project';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await deleteProject.mutateAsync(project.id);
      toast.success('Project deleted');
      router.push('/projects');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatLastWorked = (dateString?: string) => {
    if (!dateString) return 'Not started';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTechniqueName = (id: string): string => {
    return id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handlePatternClick = (patternId: string) => {
    navigateWithTransition(`/library/pattern/${patternId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-4">
          This project may have been deleted or doesn&apos;t exist.
        </p>
        <Link href="/projects">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const progress = getProgress(project);
  const currentStep = project.steps[project.currentStepIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Status Change */}
            {project.status === 'planned' && (
              <DropdownMenuItem onClick={() => handleChangeStatus('in_progress')}>
                <Play className="mr-2 h-4 w-4" />
                Start Project
              </DropdownMenuItem>
            )}
            {project.status === 'in_progress' && (
              <DropdownMenuItem onClick={() => handleChangeStatus('finished')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Finished
              </DropdownMenuItem>
            )}
            {project.status === 'finished' && (
              <DropdownMenuItem onClick={() => handleChangeStatus('in_progress')}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Mark as In Progress
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Project
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hero Image */}
      <div className="relative h-48 rounded-xl overflow-hidden bg-muted">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={project.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <StatusPill status={project.status} />
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">
          Last worked {formatLastWorked(project.lastWorkedAt)}
        </p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Progress</span>
            <span
              className={cn(
                'text-sm font-semibold px-2.5 py-1 rounded-md',
                progress.percentage >= 75
                  ? 'bg-green-100 text-green-700'
                  : progress.percentage >= 50
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              )}
            >
              {progress.percentage}%
            </span>
          </div>
          <Progress value={progress.percentage} className="h-3 mb-4" />
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>
              {progress.completed} / {progress.total} rows
            </span>
            {(project.totalTimeSpent ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(project.totalTimeSpent!)}
              </span>
            )}
          </div>
          {currentStep && (
            <p className="text-sm text-muted-foreground mb-4">
              Current: {currentStep.label} - {currentStep.title}
            </p>
          )}
          <Link href={`/projects/${project.id}/steps`}>
            <Button className="w-full">
              <Play className="mr-2 h-4 w-4" />
              {project.status === 'planned' ? 'Start Knitting' : 'Continue Knitting'}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Pattern Section */}
      {project.patternFileUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                {project.patternFileName?.toLowerCase().endsWith('.pdf') ? (
                  <FileText className="h-7 w-7 text-primary" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {project.patternFileName || 'Pattern File'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {project.sourceType === 'uploaded'
                    ? 'Uploaded pattern'
                    : 'Generated pattern'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowPatternViewer(true)}
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.size && (
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium">{project.size}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-muted-foreground mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 21L21 3M3 21L12 12M21 3L12 12" />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">Needles</p>
              <p className="font-medium">{project.needles}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🧶</span>
            <div>
              <p className="text-sm text-muted-foreground">Yarn</p>
              <p className="font-medium">{project.yarn}</p>
            </div>
          </div>
          {project.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{project.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Techniques */}
      {project.techniques.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Techniques Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.techniques.map((techId) => (
                <Link key={techId} href={`/learn/technique/${techId}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    {formatTechniqueName(techId)}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Similar Patterns from Library */}
      {similarPatterns.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <BookMarked className="size-4 text-copper" />
              <CardTitle className="text-base">Similar Patterns</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-copper gap-1 h-auto py-0"
              asChild
            >
              <ViewTransitionLink
                href={`/library?technique=${encodeURIComponent(
                  project.techniques.join(',')
                )}`}
              >
                Browse all
                <ArrowRight className="size-3" />
              </ViewTransitionLink>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Based on: {project.techniques.map(formatTechniqueName).join(', ')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {similarPatterns.map((pattern) => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  variant="compact"
                  onClick={handlePatternClick}
                  enableViewTransition
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps Preview */}
      {project.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Steps ({project.steps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.steps.slice(0, 5).map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    step.completed && 'bg-muted/50'
                  )}
                >
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center',
                      step.completed
                        ? 'bg-green-100 text-green-700'
                        : index === project.currentStepIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.completed ? '✓' : index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.label}</p>
                  </div>
                </div>
              ))}
              {project.steps.length > 5 && (
                <p className="text-sm text-center text-muted-foreground py-2">
                  + {project.steps.length - 5} more steps
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pattern Viewer with Annotations */}
      {project.patternFileUrl && (
        <PatternViewer
          open={showPatternViewer}
          onOpenChange={setShowPatternViewer}
          fileUrl={project.patternFileUrl}
          fileName={project.patternFileName || null}
          mimeType={
            project.patternFileName?.toLowerCase().endsWith('.pdf')
              ? 'application/pdf'
              : 'image/jpeg'
          }
          projectId={project.id}
          initialAnnotations={project.patternAnnotations}
        />
      )}
    </div>
  );
}
