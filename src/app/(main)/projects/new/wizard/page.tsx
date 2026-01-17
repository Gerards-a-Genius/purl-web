// src/app/(main)/projects/new/wizard/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, BookMarked, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useCreateProject } from '@/hooks/useProjects';
import { AILoadingState } from '@/components/projects/AILoadingState';
import { generateSteps, PROJECT_TYPES, DIFFICULTY_LABELS } from '@/lib/ai/generateSteps';
import type { ProjectInfo, GenerateStepsResult } from '@/lib/ai/generateSteps';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ProjectType = ProjectInfo['projectType'];
type WizardStep = 1 | 2 | 3 | 4 | 5;

const PROJECT_TYPE_OPTIONS: { id: ProjectType; difficulty: 1 | 2 | 3 | 4 | 5 }[] = [
  { id: 'scarf', difficulty: 1 },
  { id: 'hat', difficulty: 2 },
  { id: 'mittens', difficulty: 3 },
  { id: 'socks', difficulty: 3 },
  { id: 'blanket', difficulty: 2 },
  { id: 'sweater', difficulty: 4 },
  { id: 'other', difficulty: 2 },
];

export default function WizardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createProject = useCreateProject(user?.id || '');

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [projectInfo, setProjectInfo] = useState<Partial<ProjectInfo>>({});
  const [generatedResult, setGeneratedResult] = useState<GenerateStepsResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleNext = async () => {
    if (currentStep === 4) {
      // Generate steps
      setIsGenerating(true);
      setCurrentStep(5);

      try {
        const result = await generateSteps({
          projectType: projectInfo.projectType!,
          difficulty: projectInfo.difficulty || 2,
          yarn: projectInfo.yarn || 'Not specified',
          needles: projectInfo.needles || 'Not specified',
          size: projectInfo.size,
          notes: projectInfo.notes,
        });

        setGeneratedResult(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate steps';
        toast.error(message);
        setCurrentStep(4);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
      if (currentStep === 5) {
        setGeneratedResult(null);
      }
    }
  };

  const handleCreateProject = async () => {
    if (!generatedResult || !user || !projectInfo.projectType) return;

    setIsCreating(true);

    try {
      const projectType = PROJECT_TYPES[projectInfo.projectType];
      const projectName = `${projectType.label}${projectInfo.size ? ` - ${projectInfo.size}` : ''}`;

      const newProject = await createProject.mutateAsync({
        name: projectName,
        status: 'planned',
        needles: projectInfo.needles || 'Not specified',
        yarn: projectInfo.yarn || 'Not specified',
        size: projectInfo.size,
        notes: generatedResult.tips.join('\n'),
        techniques: generatedResult.techniques,
        steps: generatedResult.steps.map((step, index) => ({
          id: `step-${index}`,
          type: step.type,
          label: step.label,
          title: step.title,
          description: step.description,
          completed: false,
          techniques: step.techniques,
          rowCount: step.rowCount,
          startRow: step.startRow,
          endRow: step.endRow,
          stitchCount: step.stitchCount,
          repeatCount: step.repeatCount,
          repeatPattern: step.repeatPattern,
          milestone: step.milestone,
        })),
        currentStepIndex: 0,
        totalRows: generatedResult.totalRows,
        sourceType: 'wizard',
        aiGenerated: true,
      });

      toast.success('Project created successfully!');
      router.push(`/projects/${newProject.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!projectInfo.projectType;
      case 2:
      case 3:
      case 4:
        return true;
      case 5:
        return !!generatedResult && !isGenerating;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">AI Wizard</h1>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-colors',
              step === currentStep
                ? 'bg-primary'
                : step < currentStep
                ? 'bg-primary/50'
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <StepProjectType
            selected={projectInfo.projectType}
            onSelect={(type, difficulty) =>
              setProjectInfo({ ...projectInfo, projectType: type, difficulty })
            }
          />
        )}

        {currentStep === 2 && (
          <StepSize
            value={projectInfo.size}
            onChange={(size) => setProjectInfo({ ...projectInfo, size })}
          />
        )}

        {currentStep === 3 && (
          <StepMaterials
            yarn={projectInfo.yarn}
            needles={projectInfo.needles}
            onChange={(yarn, needles) =>
              setProjectInfo({ ...projectInfo, yarn, needles })
            }
          />
        )}

        {currentStep === 4 && (
          <StepReview projectInfo={projectInfo} />
        )}

        {currentStep === 5 && (
          isGenerating ? (
            <AILoadingState estimatedTime="This usually takes 15-20 seconds" />
          ) : generatedResult ? (
            <StepPreview result={generatedResult} />
          ) : null
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 pt-4 border-t">
        {currentStep > 1 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={currentStep === 5 ? handleCreateProject : handleNext}
          disabled={!canProceed() || isCreating}
          className={cn('gap-2', currentStep === 1 ? 'flex-1' : 'flex-[2]')}
        >
          {currentStep === 5 ? (
            isCreating ? (
              'Creating...'
            ) : (
              <>
                <Check className="h-4 w-4" />
                Create Project
              </>
            )
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Step 1: Project Type Selection
function StepProjectType({
  selected,
  onSelect,
}: {
  selected?: ProjectType;
  onSelect: (type: ProjectType, difficulty: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Browse Pattern Library Option */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <BookMarked className="size-3.5" />
          <span>Start from a template</span>
        </div>
        <Link href="/library?from=wizard" className="block">
          <Card className="group relative overflow-hidden border-2 border-dashed border-copper/30 hover:border-copper hover:bg-copper/5 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl bg-copper/10 text-copper group-hover:bg-copper group-hover:text-white transition-colors">
                <BookMarked className="size-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground group-hover:text-copper transition-colors">
                  Browse Pattern Library
                </p>
                <p className="text-sm text-muted-foreground">
                  Find inspiration and use existing patterns as a starting template
                </p>
              </div>
              <ArrowRight className="size-5 text-muted-foreground group-hover:text-copper group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3" />
            Or let AI guide you
          </span>
        </div>
      </div>

      {/* AI Wizard Project Type Selection */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Choose Project Type</h2>
          <p className="text-sm text-muted-foreground">
            Select what you want to create and AI will generate steps
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PROJECT_TYPE_OPTIONS.map((option) => {
            const type = PROJECT_TYPES[option.id];
            const difficulty = DIFFICULTY_LABELS[option.difficulty];
            return (
              <button
                key={option.id}
                onClick={() => onSelect(option.id, option.difficulty)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  selected === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                )}
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <p className={cn(
                  'font-semibold',
                  selected === option.id ? 'text-primary' : ''
                )}>
                  {type.label}
                </p>
                <p className="text-xs text-muted-foreground">{difficulty.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Step 2: Size
function StepSize({
  value,
  onChange,
}: {
  value?: string;
  onChange: (size: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Size & Dimensions</h2>
        <p className="text-muted-foreground">
          Enter the size for your project (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            placeholder="e.g., Small, Medium, Large, Adult XL"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank for a standard size
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 3: Materials
function StepMaterials({
  yarn,
  needles,
  onChange,
}: {
  yarn?: string;
  needles?: string;
  onChange: (yarn: string, needles: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Yarn & Needles</h2>
        <p className="text-muted-foreground">
          Specify the materials you&apos;ll use
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="yarn">Yarn</Label>
          <Input
            id="yarn"
            placeholder="e.g., Merino Wool, Red"
            value={yarn || ''}
            onChange={(e) => onChange(e.target.value, needles || '')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="needles">Needles</Label>
          <Input
            id="needles"
            placeholder="e.g., 5mm Circular"
            value={needles || ''}
            onChange={(e) => onChange(yarn || '', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Review
function StepReview({ projectInfo }: { projectInfo: Partial<ProjectInfo> }) {
  const projectType = projectInfo.projectType
    ? PROJECT_TYPES[projectInfo.projectType]
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Ready to Generate</h2>
        <p className="text-muted-foreground">
          Review your selections before generating step-by-step instructions
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">
              {projectType ? `${projectType.icon} ${projectType.label}` : 'Not selected'}
            </span>
          </div>
          {projectInfo.size && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium">{projectInfo.size}</span>
            </div>
          )}
          {projectInfo.yarn && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Yarn</span>
              <span className="font-medium">{projectInfo.yarn}</span>
            </div>
          )}
          {projectInfo.needles && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Needles</span>
              <span className="font-medium">{projectInfo.needles}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Step 5: Preview Generated Steps
function StepPreview({ result }: { result: GenerateStepsResult }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Steps</h2>
        <p className="text-muted-foreground">
          {result.steps.length} steps generated • {result.totalRows} rows total
          {result.estimatedTime && ` • ${result.estimatedTime}`}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-3">
              {result.steps.map((step, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {step.label}
                      </p>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {result.tips.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {result.tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
