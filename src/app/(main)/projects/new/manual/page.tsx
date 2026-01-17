// src/app/(main)/projects/new/manual/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Badge imported for potential future use with technique chips
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCreateProject } from '@/hooks/useProjects';
import { useTechniques } from '@/hooks/useTechniques';
import type { Step } from '@/types/project';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ManualEntryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createProject = useCreateProject(user?.id || '');
  const { data: techniques } = useTechniques();

  const [name, setName] = useState('');
  const [yarn, setYarn] = useState('');
  const [needles, setNeedles] = useState('');
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const toggleTechnique = (techniqueId: string) => {
    if (selectedTechniques.includes(techniqueId)) {
      setSelectedTechniques(selectedTechniques.filter((t) => t !== techniqueId));
    } else {
      setSelectedTechniques([...selectedTechniques, techniqueId]);
    }
  };

  const handleAddStep = () => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      type: 'single',
      label: `Step ${steps.length + 1}`,
      title: '',
      description: '',
      completed: false,
      techniques: [],
    };
    setSteps([...steps, newStep]);
  };

  const handleUpdateStep = (index: number, updates: Partial<Step>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleCreateProject = async () => {
    if (!name.trim() || !user) return;

    setIsCreating(true);

    try {
      const finalSteps =
        steps.length > 0
          ? steps
          : [
              {
                id: `step-${Date.now()}`,
                type: 'single' as const,
                label: 'Step 1',
                title: 'Get started',
                description: 'Add your first instructions',
                completed: false,
                techniques: selectedTechniques.slice(0, 3),
              },
            ];

      const newProject = await createProject.mutateAsync({
        name: name.trim(),
        status: 'planned',
        needles: needles.trim() || 'Not specified',
        yarn: yarn.trim() || 'Not specified',
        size: size.trim() || undefined,
        notes: notes.trim() || undefined,
        techniques: selectedTechniques,
        steps: finalSteps,
        currentStepIndex: 0,
        totalRows: finalSteps.length,
        sourceType: 'manual',
        aiGenerated: false,
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

  // Limit techniques shown for simplicity
  const displayedTechniques = techniques?.slice(0, 15) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Manual Entry</h1>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Project Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Enter project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Yarn & Needles */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yarn">Yarn</Label>
            <Input
              id="yarn"
              placeholder="e.g., Merino Wool, Red"
              value={yarn}
              onChange={(e) => setYarn(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="needles">Needles</Label>
            <Input
              id="needles"
              placeholder="e.g., 5mm Circular"
              value={needles}
              onChange={(e) => setNeedles(e.target.value)}
            />
          </div>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            placeholder="e.g., Adult Medium"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Technique Selection */}
        <div className="space-y-2">
          <Label>Techniques Used (optional)</Label>
          <p className="text-sm text-muted-foreground">
            Select techniques to enable &quot;Show me how&quot; help
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {displayedTechniques.map((technique) => (
              <button
                key={technique.id}
                onClick={() => toggleTechnique(technique.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors',
                  selectedTechniques.includes(technique.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background hover:border-primary/30'
                )}
              >
                {technique.abbreviation && (
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center',
                      selectedTechniques.includes(technique.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {technique.abbreviation.slice(0, 2)}
                  </span>
                )}
                {technique.name}
              </button>
            ))}
          </div>
          {selectedTechniques.length > 0 && (
            <p className="text-sm text-primary font-medium mt-2">
              {selectedTechniques.length} technique
              {selectedTechniques.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <div className="space-y-3">
            <Label>Steps</Label>
            {steps.map((step, index) => (
              <Card key={step.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Step title"
                        value={step.title}
                        onChange={(e) =>
                          handleUpdateStep(index, { title: e.target.value })
                        }
                      />
                      <Textarea
                        placeholder="Step instructions"
                        value={step.description}
                        onChange={(e) =>
                          handleUpdateStep(index, {
                            description: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveStep(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleAddStep}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Step
        </Button>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background py-4 border-t -mx-4 px-4">
        <Button
          onClick={handleCreateProject}
          disabled={!name.trim() || isCreating}
          className="w-full gap-2"
        >
          {isCreating ? (
            'Creating...'
          ) : (
            <>
              <Check className="h-4 w-4" />
              Create Project
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
