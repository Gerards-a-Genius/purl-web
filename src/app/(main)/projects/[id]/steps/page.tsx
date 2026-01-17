// src/app/(main)/projects/[id]/steps/page.tsx
'use client';

import { use, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Timer,
  Play,
  Pause,
  Check,
  Maximize2,
  LifeBuoy,
  ChevronRight,
  ChevronLeft,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BentoGrid, BentoItem } from '@/components/layout/BentoGrid';
import { PatternSidebar } from '@/components/projects/PatternSidebar';
import { StepInstructions } from '@/components/projects/StepInstructions';
import { useAuth } from '@/hooks/useAuth';
import { useProject, useToggleStepComplete, useUpdateStepProgress } from '@/hooks/useProjects';
import { useTechniques } from '@/hooks/useTechniques';
import { useTimer } from '@/hooks/useTimer';
import type { Step, Project } from '@/types/project';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SOSAssistant } from '@/components/projects/SOSAssistant';

export default function ProjectStepsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const { user } = useAuth();
  const { data: project, isLoading } = useProject(projectId);
  const { data: allTechniques } = useTechniques();
  const toggleStep = useToggleStepComplete(projectId);
  const updateStepProgress = useUpdateStepProgress(projectId);

  // Desktop: track current step for split view
  const [desktopStepIndex, setDesktopStepIndex] = useState<number | null>(null);

  const [showMeHowStep, setShowMeHowStep] = useState<{ step: Step; index: number } | null>(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [focusStepIndex, setFocusStepIndex] = useState(0);

  // Timer hook
  const { isRunning, toggle, formattedTime } = useTimer({ projectId });

  // Current step index (use desktop selection or project's currentStepIndex)
  const currentStepIndex = desktopStepIndex ?? project?.currentStepIndex ?? 0;
  const currentStep = project?.steps[currentStepIndex];

  // Calculate progress
  const progressInfo = useMemo(() => {
    if (!project) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;

    project.steps.forEach((step) => {
      if (step.rowCount) {
        total += step.rowCount;
        completed += step.completedRows?.length || 0;
      } else {
        total += 1;
        if (step.completed) completed += 1;
      }
    });

    return {
      completed,
      total: total || project.totalRows || 1,
      percentage: Math.round((completed / (total || 1)) * 100),
    };
  }, [project]);

  // Get technique name by ID
  const getTechniqueName = useCallback(
    (techId: string) => {
      const tech = allTechniques?.find((t) => t.id === techId);
      return tech?.name || techId.replace(/-/g, ' ');
    },
    [allTechniques]
  );

  // Handle step complete toggle
  const handleToggleStep = useCallback(
    (stepId: string, currentCompleted?: boolean) => {
      if (user) {
        toggleStep.mutate({ stepId, completed: !currentCompleted });
        toast.success('Step updated');
      }
    },
    [user, toggleStep]
  );

  // Handle row complete toggle
  const handleToggleRow = useCallback(
    (stepId: string, rowNumber: number, currentCompletedRows: number[] = []) => {
      if (user) {
        const isCompleted = currentCompletedRows.includes(rowNumber);
        const newCompletedRows = isCompleted
          ? currentCompletedRows.filter((r) => r !== rowNumber)
          : [...currentCompletedRows, rowNumber];

        updateStepProgress.mutate({
          stepId,
          updates: { completedRows: newCompletedRows },
        });
      }
    },
    [user, updateStepProgress]
  );

  // Handle step navigation (desktop)
  const handleStepChange = useCallback((newIndex: number) => {
    setDesktopStepIndex(newIndex);
  }, []);

  // Open focus mode at step
  const handleOpenFocusMode = (stepIndex: number) => {
    setFocusStepIndex(stepIndex);
    setFocusModeOpen(true);
  };

  if (isLoading) {
    return <ProjectStepsSkeleton />;
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Project</h1>
        </div>
        <div className="text-center py-12">
          <p className="font-medium mb-4">Project not found</p>
          <Link href="/projects">
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold truncate flex-1">{project.name}</h1>
        {project.patternFileUrl && (
          <a href={project.patternFileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <FileText className="h-5 w-5" />
            </Button>
          </a>
        )}
      </div>

      {/* Progress & Timer Card */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {progressInfo.completed} / {progressInfo.total} rows
            </span>
            <span className="text-sm font-semibold text-green-600">
              {progressInfo.percentage}%
            </span>
          </div>
          <Progress value={progressInfo.percentage} className="h-2 mb-3" />

          {/* Timer */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className={cn(isRunning && 'text-primary')}
            >
              {isRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Timer className={cn('h-4 w-4', isRunning ? 'text-primary' : 'text-muted-foreground')} />
              <span
                className={cn(
                  'font-mono text-lg',
                  isRunning ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {formattedTime}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================== */}
      {/* DESKTOP: Split Layout (lg and up) */}
      {/* ============================================== */}
      <div className="hidden lg:block">
        <BentoGrid layout="split" gap="lg" className="min-h-[600px]">
          {/* Left: Pattern Sidebar */}
          <BentoItem variant="default" className="p-6">
            <PatternSidebar
              project={project}
              currentStep={currentStep}
              currentStepIndex={currentStepIndex}
              onToggleRow={handleToggleRow}
            />
          </BentoItem>

          {/* Right: Step Instructions */}
          <BentoItem variant="default" className="p-6">
            <StepInstructions
              project={project}
              currentStepIndex={currentStepIndex}
              onStepChange={handleStepChange}
              onToggleStep={handleToggleStep}
              onShowMeHow={() => {
                if (currentStep) {
                  setShowMeHowStep({ step: currentStep, index: currentStepIndex });
                }
              }}
              onOpenSOS={() => setSosOpen(true)}
              getTechniqueName={getTechniqueName}
            />
          </BentoItem>
        </BentoGrid>

        {/* Desktop: Step List Sidebar */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">All Steps</h3>
            <div className="flex flex-wrap gap-2">
              {project.steps.map((step, index) => {
                const isCompleted = step.completed || (step.completedRows?.length === step.rowCount);
                const isCurrent = index === currentStepIndex;
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepChange(index)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================== */}
      {/* MOBILE: Vertical Layout (below lg) */}
      {/* ============================================== */}
      <div className="lg:hidden space-y-3">
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {project.steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                isCurrentStep={index === project.currentStepIndex}
                onToggleStep={handleToggleStep}
                onToggleRow={handleToggleRow}
                onShowMeHow={() => setShowMeHowStep({ step, index })}
                onFocusMode={() => handleOpenFocusMode(index)}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Mobile FABs */}
        <div className="fixed bottom-6 right-6 flex items-center gap-3">
          {/* SOS Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-background border-2 border-amber-300"
            onClick={() => setSosOpen(true)}
            aria-label="Get help with your knitting (SOS)"
          >
            <LifeBuoy className="h-5 w-5 text-amber-600" />
          </Button>

          {/* Focus Mode Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-background"
            onClick={() => handleOpenFocusMode(project.currentStepIndex || 0)}
            aria-label="Enter focus mode"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>

          {/* Mark Complete Button */}
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => {
              const step = project.steps[project.currentStepIndex || 0];
              if (step && !step.completed) {
                handleToggleStep(step.id, step.completed);
              }
            }}
            aria-label="Mark current step as complete"
          >
            <Check className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Show Me How Sheet */}
      <Sheet open={!!showMeHowStep} onOpenChange={() => setShowMeHowStep(null)}>
        <SheetContent side="bottom" className="h-[85vh]">
          {showMeHowStep && (
            <ShowMeHowContent
              step={showMeHowStep.step}
              stepIndex={showMeHowStep.index}
              getTechniqueName={getTechniqueName}
              onOpenSOS={() => {
                setShowMeHowStep(null);
                setTimeout(() => setSosOpen(true), 300);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* SOS Assistant Sheet */}
      <Sheet open={sosOpen} onOpenChange={setSosOpen}>
        <SheetContent side="bottom" className="h-[85vh]">
          <SOSAssistant
            project={project}
            currentStepIndex={project.currentStepIndex || 0}
            onClose={() => setSosOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Focus Mode Dialog */}
      <Dialog open={focusModeOpen} onOpenChange={setFocusModeOpen}>
        <DialogContent className="max-w-lg">
          <FocusModeContent
            project={project}
            initialIndex={focusStepIndex}
            onToggleStep={handleToggleStep}
            onToggleRow={handleToggleRow}
            onClose={() => setFocusModeOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Step Card Component (Mobile)
function StepCard({
  step,
  index: _index,
  isCurrentStep,
  onToggleStep,
  onToggleRow,
  onShowMeHow,
  onFocusMode: _onFocusMode,
}: {
  step: Step;
  index: number;
  isCurrentStep: boolean;
  onToggleStep: (stepId: string, currentCompleted?: boolean) => void;
  onToggleRow: (stepId: string, rowNumber: number, currentCompletedRows?: number[]) => void;
  onShowMeHow: () => void;
  onFocusMode: () => void;
}) {
  const [expanded, setExpanded] = useState(isCurrentStep);
  const hasRows = step.rowCount && step.rowCount > 1;
  const completedRows = step.completedRows || [];
  const rowProgress = hasRows
    ? Math.round((completedRows.length / step.rowCount!) * 100)
    : step.completed
    ? 100
    : 0;

  return (
    <Card
      className={cn(
        'transition-all',
        isCurrentStep && 'ring-2 ring-primary',
        step.completed && 'opacity-75'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox / Status */}
          <div className="pt-1">
            {hasRows ? (
              <div
                className={cn(
                  'w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center',
                  rowProgress === 100
                    ? 'bg-green-500 text-white'
                    : rowProgress > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {rowProgress}%
              </div>
            ) : (
              <Checkbox
                checked={step.completed}
                onCheckedChange={() => onToggleStep(step.id, step.completed)}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {step.label}
              </Badge>
              {step.milestone && (
                <Badge variant="secondary" className="text-xs">
                  Milestone
                </Badge>
              )}
            </div>
            <p
              className={cn(
                'font-medium',
                step.completed && 'line-through text-muted-foreground'
              )}
            >
              {step.title}
            </p>
            {step.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {step.description}
              </p>
            )}

            {/* Techniques */}
            {step.techniques && step.techniques.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {step.techniques.slice(0, 3).map((techId) => (
                  <Link key={techId} href={`/learn/technique/${techId}`}>
                    <Badge variant="outline" className="text-xs hover:bg-muted">
                      {techId.replace(/-/g, ' ')}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Row Grid (if expanded and has rows) */}
            {expanded && hasRows && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  {completedRows.length} / {step.rowCount} rows
                </p>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: step.rowCount! }, (_, i) => i + 1).map((row) => {
                    const isCompleted = completedRows.includes(row);
                    return (
                      <button
                        key={row}
                        onClick={() => onToggleRow(step.id, row, completedRows)}
                        className={cn(
                          'w-8 h-8 rounded text-xs font-medium transition-colors',
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        {row}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            {hasRows && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setExpanded(!expanded)}
              >
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform',
                    expanded && 'rotate-90'
                  )}
                />
              </Button>
            )}
            {step.techniques && step.techniques.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onShowMeHow}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Show Me How Content
function ShowMeHowContent({
  step,
  stepIndex,
  getTechniqueName,
  onOpenSOS,
}: {
  step: Step;
  stepIndex: number;
  getTechniqueName: (id: string) => string;
  onOpenSOS: () => void;
}) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Show Me How</SheetTitle>
        <SheetDescription>
          Step {stepIndex + 1}: {step.title}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="font-medium mb-2">Instructions</h3>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>

        {step.techniques && step.techniques.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Techniques Used</h3>
            <div className="space-y-2">
              {step.techniques.map((techId) => (
                <Link
                  key={techId}
                  href={`/learn/technique/${techId}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted"
                >
                  <span className="font-medium">{getTechniqueName(techId)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full gap-2" onClick={onOpenSOS}>
          <LifeBuoy className="h-4 w-4" />
          Still stuck? Get SOS Help
        </Button>
      </div>
    </>
  );
}

// Focus Mode Content
function FocusModeContent({
  project,
  initialIndex,
  onToggleStep,
  onToggleRow,
  onClose: _onClose,
}: {
  project: Project;
  initialIndex: number;
  onToggleStep: (stepId: string, currentCompleted?: boolean) => void;
  onToggleRow: (stepId: string, rowNumber: number, currentCompletedRows?: number[]) => void;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const step = project.steps[currentIndex];

  if (!step) return null;

  const hasRows = step.rowCount && step.rowCount > 1;
  const completedRows = step.completedRows || [];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span className="truncate">{step.title}</span>
          <Badge variant="outline">{step.label}</Badge>
        </DialogTitle>
        <DialogDescription>
          Step {currentIndex + 1} of {project.steps.length}
        </DialogDescription>
      </DialogHeader>

      <div className="py-6 space-y-4">
        <p className="text-lg leading-relaxed">{step.description}</p>

        {hasRows ? (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {completedRows.length} / {step.rowCount} rows completed
            </p>
            <Progress
              value={(completedRows.length / step.rowCount!) * 100}
              className="h-3"
            />
            <div className="flex flex-wrap gap-1 mt-3">
              {Array.from({ length: step.rowCount! }, (_, i) => i + 1).map((row) => {
                const isCompleted = completedRows.includes(row);
                return (
                  <button
                    key={row}
                    onClick={() => onToggleRow(step.id, row, completedRows)}
                    className={cn(
                      'w-10 h-10 rounded text-sm font-medium transition-colors',
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {row}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <Button
            variant={step.completed ? 'outline' : 'default'}
            className="w-full"
            onClick={() => onToggleStep(step.id, step.completed)}
          >
            {step.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          className="flex-1"
          onClick={() =>
            setCurrentIndex((i) => Math.min(project.steps.length - 1, i + 1))
          }
          disabled={currentIndex === project.steps.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </>
  );
}

// Loading skeleton
function ProjectStepsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-24" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
