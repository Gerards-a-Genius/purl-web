// src/components/projects/SOSAssistant.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  LifeBuoy,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Lightbulb,
  X,
  Send,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  getSOSHelp,
  COMMON_PROBLEMS,
  SEVERITY_CONFIG,
  type SOSResponse,
} from '@/lib/ai/sosAssist';
import type { Project } from '@/types/project';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SOSAssistantProps {
  project: Project;
  currentStepIndex: number;
  onClose: () => void;
}

type ViewState = 'select' | 'input' | 'loading' | 'response';

/**
 * StreamingText - AI-native text animation that reveals content word-by-word
 *
 * Creates a more engaging, "AI thinking" feel by gradually revealing text.
 * Respects prefers-reduced-motion for accessibility.
 */
function StreamingText({
  text,
  speed = 30,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Skip animation for accessibility
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    const words = text.split(' ');

    const intervalId = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText(words.slice(0, currentIndex + 1).join(' '));
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, onComplete]);

  return (
    <span className={cn(!isComplete && 'after:animate-pulse after:content-["▋"]')}>
      {displayedText}
    </span>
  );
}

/**
 * ConfidenceIndicator - Shows AI confidence level with visual feedback
 *
 * AI-native pattern that helps users understand AI certainty.
 */
function ConfidenceIndicator({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: {
      label: 'High confidence',
      color: 'text-green-600 bg-green-50 border-green-200',
      dots: 3,
    },
    medium: {
      label: 'Moderate confidence',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      dots: 2,
    },
    low: {
      label: 'Best guess',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      dots: 1,
    },
  }[level];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border',
        config.color
      )}
    >
      <Sparkles className="h-3 w-3" />
      <span>{config.label}</span>
      <div className="flex gap-0.5 ml-1">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              dot <= config.dots ? 'bg-current' : 'bg-current/30'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Problem descriptions for AI context
const PROBLEM_DESCRIPTIONS: Record<string, string> = {
  'dropped-stitch':
    'I dropped a stitch and I can see a loop hanging down from my work. It looks like a ladder running down through several rows.',
  'wrong-count':
    "I counted my stitches and I have the wrong number. I'm not sure if I accidentally added stitches or dropped some.",
  'tension-issue':
    'My tension is uneven - some stitches are noticeably tighter than others, and some are loose.',
  'twisted-stitch':
    "Some of my stitches look twisted or crossed on the needle. They're sitting differently than the others.",
  'lost-place':
    "I put down my knitting and now I don't know where I am in the pattern.",
  'uneven-edges':
    'The edges of my knitting look messy, wavy, or uneven.',
  'yarn-issue':
    "My yarn is tangled or twisted and I'm having trouble working with it.",
  'other': 'I need help with a knitting problem.',
};

export function SOSAssistant({
  project,
  currentStepIndex,
  onClose,
}: SOSAssistantProps) {
  const [viewState, setViewState] = useState<ViewState>('select');
  // Track selected problem for potential analytics/debugging
  const [, setSelectedProblem] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [photo, setPhoto] = useState<{ dataUrl: string; base64: string; mimeType: string } | null>(null);
  const [response, setResponse] = useState<SOSResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track last request for regenerate functionality
  const [lastRequest, setLastRequest] = useState<{
    problemDescription: string;
    imageBase64?: string;
    imageMimeType?: string;
  } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  // Track if streaming animation is complete
  const [streamingComplete, setStreamingComplete] = useState(false);

  const currentStep = project.steps[currentStepIndex];

  // Derive confidence level from response severity
  const getConfidenceLevel = (severity: SOSResponse['severity']): 'high' | 'medium' | 'low' => {
    // Severity maps inversely to confidence - minor issues = high confidence
    return severity === 'minor' ? 'high' : severity === 'moderate' ? 'medium' : 'low';
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setPhoto({
        dataUrl,
        base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle problem selection
  const handleProblemSelect = async (problemId: string) => {
    setSelectedProblem(problemId);
    setError(null);
    setStreamingComplete(false);

    if (problemId === 'other') {
      setViewState('input');
      return;
    }

    // Get quick help for common problems
    setViewState('loading');

    try {
      const description = PROBLEM_DESCRIPTIONS[problemId];
      // Store request for potential regeneration
      setLastRequest({ problemDescription: description });

      const result = await getSOSHelp({
        problemDescription: description,
        currentStep: currentStep
          ? {
              title: currentStep.title,
              description: currentStep.description || '',
              techniques: currentStep.techniques || [],
            }
          : undefined,
        projectContext: {
          projectName: project.name,
          yarn: project.yarn || 'Not specified',
          needles: project.needles || 'Not specified',
        },
      });

      setResponse(result);
      setViewState('response');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get help';
      setError(message);
      setViewState('select');
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Handle custom input submission
  const handleSubmit = async () => {
    if (!customInput.trim() && !photo) return;

    setViewState('loading');
    setError(null);
    setStreamingComplete(false);

    // Store request for potential regeneration
    setLastRequest({
      problemDescription: customInput || 'Help me identify the problem from this photo',
      imageBase64: photo?.base64,
      imageMimeType: photo?.mimeType,
    });

    try {
      const result = await getSOSHelp({
        problemDescription: customInput || 'Help me identify the problem from this photo',
        imageBase64: photo?.base64,
        imageMimeType: photo?.mimeType,
        currentStep: currentStep
          ? {
              title: currentStep.title,
              description: currentStep.description || '',
              techniques: currentStep.techniques || [],
            }
          : undefined,
        projectContext: {
          projectName: project.name,
          yarn: project.yarn || 'Not specified',
          needles: project.needles || 'Not specified',
        },
      });

      setResponse(result);
      setViewState('response');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get help';
      setError(message);
      setViewState('input');
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Handle regenerate - get a new response for the same problem
  const handleRegenerate = async () => {
    if (!lastRequest) return;

    setIsRegenerating(true);
    setStreamingComplete(false);

    try {
      const result = await getSOSHelp({
        ...lastRequest,
        currentStep: currentStep
          ? {
              title: currentStep.title,
              description: currentStep.description || '',
              techniques: currentStep.techniques || [],
            }
          : undefined,
        projectContext: {
          projectName: project.name,
          yarn: project.yarn || 'Not specified',
          needles: project.needles || 'Not specified',
        },
      });

      setResponse(result);
      toast.success('Got a fresh perspective!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate';
      toast.error(message);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Go back to selection
  const handleBack = () => {
    setViewState('select');
    setSelectedProblem(null);
    setResponse(null);
    setError(null);
    setCustomInput('');
    setPhoto(null);
  };

  // Render problem selection view
  const renderSelectView = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          What happened? Select a common issue or describe your problem.
        </p>
      </div>

      {currentStep && (
        <Card className="bg-amber-50 border-amber-200 mb-4">
          <CardContent className="p-3">
            <p className="text-xs font-medium text-amber-800 mb-1">Current Step</p>
            <p className="text-sm text-amber-700">{currentStep.title}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        {COMMON_PROBLEMS.map((problem) => (
          <button
            key={problem.id}
            onClick={() => handleProblemSelect(problem.id)}
            className="flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-center"
          >
            <span className="text-2xl mb-2">{problem.icon}</span>
            <span className="font-medium text-sm">{problem.label}</span>
            <span className="text-xs text-muted-foreground line-clamp-2">
              {problem.description}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render input view
  const renderInputView = () => (
    <div className="space-y-4">
      <Button
        variant="ghost"
        className="gap-1 -ml-2"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div>
        <h3 className="font-semibold mb-1">Describe your problem</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Tell us what went wrong, or add a photo of your work.
        </p>
      </div>

      <Textarea
        placeholder="e.g., I dropped a stitch 3 rows back and I don't know how to fix it..."
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        rows={4}
        className="resize-none"
      />

      {/* Photo upload */}
      {photo ? (
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={photo.dataUrl}
            alt="Uploaded"
            className="w-full h-48 object-cover"
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={() => setPhoto(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            Add Photo
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!customInput.trim() && !photo}
        className="w-full gap-2"
      >
        <Send className="h-4 w-4" />
        Get Help
      </Button>
    </div>
  );

  // Render loading view
  const renderLoadingView = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="text-center">
        <p className="font-semibold">Analyzing your problem...</p>
        <p className="text-sm text-muted-foreground">
          Purl is looking at your knitting to help you fix it
        </p>
      </div>
    </div>
  );

  // Render response view
  const renderResponseView = () => {
    if (!response) return null;

    const severityConfig = SEVERITY_CONFIG[response.severity];
    const SeverityIcon =
      response.severity === 'minor'
        ? CheckCircle
        : response.severity === 'moderate'
        ? AlertTriangle
        : AlertCircle;

    return (
      <ScrollArea className="h-[60vh]">
        <div className="space-y-4 pr-4">
          {/* Header with back button and regenerate */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="gap-1 -ml-2"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Try another problem
            </Button>

            {/* AI-native: Regenerate button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating || !lastRequest}
              className="gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRegenerating && "animate-spin")} />
              {isRegenerating ? 'Thinking...' : 'Try again'}
            </Button>
          </div>

          {/* AI-native: Confidence + Severity badges */}
          <div className="flex flex-wrap items-center gap-2">
            <ConfidenceIndicator level={getConfidenceLevel(response.severity)} />
            <Badge
              variant="outline"
              className={cn(
                'gap-1 px-3 py-1',
                severityConfig.bgColor,
                severityConfig.color
              )}
            >
              <SeverityIcon className="h-3.5 w-3.5" />
              {severityConfig.label}
            </Badge>
          </div>

          {/* Diagnosis - AI-native: Collaborative language + streaming text */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Purl thinks...
              </p>
              <p className="text-sm">
                <StreamingText
                  text={response.diagnosis}
                  speed={25}
                  onComplete={() => setStreamingComplete(true)}
                />
              </p>
            </CardContent>
          </Card>

          {/* Fix Steps - AI-native: Collaborative language */}
          <div className={cn(
            "transition-opacity duration-300",
            streamingComplete ? "opacity-100" : "opacity-50"
          )}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Purl suggests these steps</span>
              {!streamingComplete && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </h3>
            <div className="space-y-3">
              {response.fixSteps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 transition-all duration-300",
                    streamingComplete
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2"
                  )}
                  style={{
                    transitionDelay: streamingComplete ? `${index * 100}ms` : '0ms'
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prevention */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-green-800 mb-1">
                  Prevent this next time
                </p>
                <p className="text-sm text-green-700">{response.prevention}</p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Tips */}
          {response.additionalTips && response.additionalTips.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-medium">Additional Tips</p>
                </div>
                <ul className="space-y-1">
                  {response.additionalTips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Related Techniques */}
          {response.relatedTechniques && response.relatedTechniques.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Related Techniques</h3>
              <div className="space-y-2">
                {response.relatedTechniques.map((techId) => (
                  <Link
                    key={techId}
                    href={`/learn/technique/${techId}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted"
                    onClick={onClose}
                  >
                    <span className="text-sm font-medium">
                      {techId.replace(/-/g, ' ')}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Expert Help Notice */}
          {response.needsExpertHelp && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800">
                  This issue may benefit from in-person guidance. Consider reaching
                  out to a local knitting group or yarn shop for hands-on help.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Bottom spacing */}
          <div className="h-4" />
        </div>
      </ScrollArea>
    );
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <LifeBuoy className="h-4 w-4 text-amber-600" />
          </div>
          Knitting SOS
        </SheetTitle>
        <SheetDescription>
          Get AI-powered help with your knitting problems
        </SheetDescription>
      </SheetHeader>

      <div className="mt-4">
        {viewState === 'select' && renderSelectView()}
        {viewState === 'input' && renderInputView()}
        {viewState === 'loading' && renderLoadingView()}
        {viewState === 'response' && renderResponseView()}
      </div>
    </>
  );
}
