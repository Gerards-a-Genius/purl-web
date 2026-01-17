// src/app/(main)/projects/new/upload/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCreateProject } from '@/hooks/useProjects';
import { PatternUploader } from '@/components/projects/PatternUploader';
import { AILoadingState } from '@/components/projects/AILoadingState';
import { ParsedPatternPreview } from '@/components/projects/ParsedPatternPreview';
import { PatternValidationBanner } from '@/components/projects/PatternValidationBanner';
import { parsePattern, validateParsedPattern, parsedPatternToProjectData } from '@/lib/ai/parsePattern';
import { uploadPatternFromBase64 } from '@/lib/api/storage';
import type { ParsedPattern } from '@/lib/ai/parsePattern';
import { toast } from 'sonner';

export default function UploadPatternPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createProject = useCreateProject(user?.id || '');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [parsedPattern, setParsedPattern] = useState<ParsedPattern | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File, base64: string) => {
    setSelectedFile(file);
    setBase64Data(base64);
    setParsedPattern(null);
    setWarnings([]);
    setError(null);
    setIsProcessing(true);

    try {
      // Parse pattern with AI
      const result = await parsePattern({
        base64Data: base64,
        mimeType: file.type,
        fileName: file.name,
      });

      // Validate parsed pattern
      const validationWarnings = validateParsedPattern(result);
      setWarnings([...result.warnings, ...validationWarnings]);
      setParsedPattern(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse pattern. Please try again or use manual entry.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateProject = async () => {
    if (!parsedPattern || !user || !selectedFile || !base64Data) return;

    setIsCreating(true);

    try {
      // Upload pattern file to storage
      const uploadResult = await uploadPatternFromBase64(
        user.id,
        base64Data,
        selectedFile.name,
        selectedFile.type
      );

      // Convert parsed pattern to project data
      const projectData = parsedPatternToProjectData(parsedPattern);

      // Create project with steps
      const newProject = await createProject.mutateAsync({
        name: projectData.name,
        status: 'planned',
        needles: projectData.needles,
        yarn: projectData.yarn,
        size: projectData.size,
        notes: projectData.notes,
        techniques: projectData.techniques,
        steps: projectData.steps.map((step, index) => ({
          id: `step-${index}`,
          type: 'single' as const,
          label: step.label,
          title: step.title,
          description: step.description,
          completed: false,
          techniques: step.techniques,
          rowCount: step.rowCount,
          startRow: step.startRow,
          endRow: step.endRow,
          stitchCount: step.stitchCount,
        })),
        currentStepIndex: 0,
        totalRows: projectData.totalRows,
        sourceType: 'uploaded',
        patternFileUrl: uploadResult.url,
        patternFileName: selectedFile.name,
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

  const handleEditSteps = () => {
    // TODO: Implement step editor modal
    toast.info('Step editor coming soon');
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
        <h1 className="text-2xl font-bold">Upload Pattern</h1>
      </div>

      {/* Content */}
      {isProcessing ? (
        <AILoadingState
          estimatedTime="This usually takes 15-30 seconds"
        />
      ) : !parsedPattern ? (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Upload a PDF or image of your knitting pattern. Our AI will automatically
            parse the instructions and create your project.
          </p>

          <PatternUploader onFileSelected={handleFileSelected} />

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Parsing Failed</p>
                <p className="text-sm mt-1">{error}</p>
                <Link href="/projects/new/manual" className="text-sm underline mt-2 block">
                  Try manual entry instead →
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Validation Banner */}
          <PatternValidationBanner warnings={warnings} />

          {/* Pattern Preview */}
          <ParsedPatternPreview pattern={parsedPattern} />

          {/* Actions */}
          <div className="flex flex-col gap-3 p-4">
            <Button
              variant="outline"
              onClick={handleEditSteps}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Steps
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isCreating}
              className="gap-2"
            >
              {isCreating ? (
                'Creating Project...'
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
