// src/app/(main)/learn/technique/[id]/page.tsx
'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Clock,
  CheckCircle2,
  Star,
  Info,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Check,
  X,
  BookMarked,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PatternCard } from '@/components/patterns/PatternCard';
import { ViewTransitionLink } from '@/components/common/ViewTransitionLink';
import { mockPatternCards } from '@/components/patterns/__mocks__/patterns';
import { useViewTransition } from '@/hooks/useViewTransition';
import { useAuth } from '@/hooks/useAuth';
import {
  useTechnique,
  useTechniques,
  useTechniqueProgress,
  useMarkTechniqueStatus,
  useRecordQuizAttempt,
  CATEGORY_INFO,
} from '@/hooks/useTechniques';
import type { TechniqueProgress, QuizQuestion } from '@/types/technique';
import { cn } from '@/lib/utils';

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export default function TechniqueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const techniqueId = resolvedParams.id;
  const router = useRouter();
  const { navigateWithTransition } = useViewTransition();

  const { user } = useAuth();
  const { data: technique, isLoading } = useTechnique(techniqueId);
  const { data: allTechniques } = useTechniques();
  const { data: progressMap } = useTechniqueProgress(user?.id);
  const markStatus = useMarkTechniqueStatus(user?.id || '');
  const recordQuiz = useRecordQuizAttempt(user?.id || '');

  const progress = progressMap?.get(techniqueId);
  const [viewMode, setViewMode] = useState<'overview' | 'tutorial' | 'quiz'>('overview');

  // Get patterns that use this technique
  const patternsUsingTechnique = useMemo(() => {
    if (!technique) return [];
    const techniqueName = technique.name.toLowerCase();
    return mockPatternCards.filter((pattern) =>
      pattern.techniques.some(
        (t) =>
          t.name.toLowerCase() === techniqueName ||
          t.id.toLowerCase() === techniqueId.toLowerCase()
      )
    );
  }, [technique, techniqueId]);

  const handlePatternClick = (patternId: string) => {
    navigateWithTransition(`/library/pattern/${patternId}`);
  };

  // Get related technique names
  const getTechniqueName = (techId: string) => {
    const tech = allTechniques?.find((t) => t.id === techId);
    return tech?.name || formatTechniqueName(techId);
  };

  const handleStatusChange = (status: TechniqueProgress['status']) => {
    if (user) {
      markStatus.mutate({ techniqueId, status });
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    if (user) {
      const percentage = Math.round((score / total) * 100);
      recordQuiz.mutate({ techniqueId, score: percentage });

      // Auto-update status based on quiz performance
      if (percentage >= 80 && progress?.status !== 'confident') {
        markStatus.mutate({ techniqueId, status: 'confident' });
      } else if (percentage >= 50 && progress?.status === 'not_started') {
        markStatus.mutate({ techniqueId, status: 'practicing' });
      }
    }
  };

  if (isLoading) {
    return <TechniqueDetailSkeleton />;
  }

  if (!technique) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/learn">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Technique</h1>
        </div>
        <div className="text-center py-12">
          <p className="font-medium mb-4">Technique not found</p>
          <Link href="/learn">
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasTutorial = technique.tutorialSteps && technique.tutorialSteps.length > 0;
  const hasQuiz = technique.quiz && technique.quiz.length > 0;
  const categoryInfo = CATEGORY_INFO[technique.category];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/learn/${technique.category}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold truncate">{technique.name}</h1>
      </div>

      {/* Video Thumbnail */}
      <a
        href={technique.video?.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted shadow-lg">
          {technique.video?.thumbnailUrl ? (
            <Image
              src={technique.video.thumbnailUrl}
              alt={technique.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
          )}
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <Play className="h-7 w-7 text-white fill-white ml-1" />
            </div>
          </div>
          {/* Duration */}
          {technique.video?.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(technique.video.duration)}
            </div>
          )}
          {/* Progress indicator */}
          {progress?.status && progress.status !== 'not_started' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              {progress.status === 'confident' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </a>

      {/* Title and Meta */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">{technique.name}</h2>
          {technique.abbreviation && (
            <Badge className="font-bold">{technique.abbreviation}</Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{categoryInfo?.name || technique.category}</Badge>
          <Badge variant="outline" className="gap-1">
            <span className="text-green-600">{DIFFICULTY_LABELS[technique.difficulty]}</span>
          </Badge>
          {technique.tags?.includes('essential') && (
            <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-amber-700">Essential</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      {(hasTutorial || hasQuiz) && (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1 gap-1.5">
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            {hasTutorial && (
              <TabsTrigger value="tutorial" className="flex-1 gap-1.5">
                <GraduationCap className="h-4 w-4" />
                Tutorial
              </TabsTrigger>
            )}
            {hasQuiz && (
              <TabsTrigger value="quiz" className="flex-1 gap-1.5">
                <HelpCircle className="h-4 w-4" />
                Quiz
                {progress?.quizScore !== undefined && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {progress.quizScore}%
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Description */}
            <Card>
              <CardContent className="p-4">
                <p className="text-muted-foreground leading-relaxed">
                  {technique.description}
                </p>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <ProgressTracker
              status={progress?.status || 'not_started'}
              practiceCount={progress?.practiceCount || 0}
              onStatusChange={handleStatusChange}
            />

            {/* Step by Step */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  Step by Step
                </h3>
                {hasTutorial && (
                  <button
                    onClick={() => setViewMode('tutorial')}
                    className="text-sm text-primary font-medium"
                  >
                    Interactive →
                  </button>
                )}
              </div>
              <Card>
                <CardContent className="p-0 divide-y">
                  {technique.steps?.map((step, index) => (
                    <div key={index} className="flex gap-3 p-4">
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            {/* Tips */}
            {technique.tips && technique.tips.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
                  Pro Tips
                </h3>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <Lightbulb className="h-6 w-6 text-green-600 mb-2" />
                    <ul className="space-y-2">
                      {technique.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-green-900">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Common Mistakes */}
            {technique.commonMistakes && technique.commonMistakes.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
                  Common Mistakes
                </h3>
                <Card>
                  <CardContent className="p-0 divide-y">
                    {technique.commonMistakes.map((mistake, index) => (
                      <div key={index} className="flex gap-3 p-4">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                        <p className="text-sm">{mistake}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Prerequisites */}
            {technique.prerequisites && technique.prerequisites.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
                  Learn First
                </h3>
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-4">
                    {technique.prerequisites.map((techId) => (
                      <Link key={techId} href={`/learn/technique/${techId}`}>
                        <Badge
                          variant="outline"
                          className="px-3 py-1.5 hover:bg-muted cursor-pointer whitespace-nowrap"
                        >
                          {getTechniqueName(techId)}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            )}

            {/* Related Techniques */}
            {technique.relatedTechniques && technique.relatedTechniques.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
                  Related Techniques
                </h3>
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-4">
                    {technique.relatedTechniques.map((techId) => (
                      <Link key={techId} href={`/learn/technique/${techId}`}>
                        <Badge
                          variant="outline"
                          className="px-3 py-1.5 hover:bg-muted cursor-pointer whitespace-nowrap"
                        >
                          {getTechniqueName(techId)}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            )}

            {/* Patterns Using This Technique */}
            {patternsUsingTechnique.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookMarked className="size-4 text-copper" />
                    <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                      Patterns Using This Technique
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-copper gap-1 h-auto py-0"
                    asChild
                  >
                    <ViewTransitionLink
                      href={`/library?technique=${encodeURIComponent(technique.name)}`}
                    >
                      See all {patternsUsingTechnique.length}
                      <ArrowRight className="size-3" />
                    </ViewTransitionLink>
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {patternsUsingTechnique.slice(0, 4).map((pattern) => (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      variant="compact"
                      onClick={handlePatternClick}
                      enableViewTransition
                    />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          {/* Tutorial Tab */}
          {hasTutorial && (
            <TabsContent value="tutorial" className="mt-6">
              <StepThroughTutorial
                steps={technique.tutorialSteps!}
                completedSteps={progress?.completedSteps || []}
              />
            </TabsContent>
          )}

          {/* Quiz Tab */}
          {hasQuiz && (
            <TabsContent value="quiz" className="mt-6">
              <QuickQuiz
                questions={technique.quiz!}
                onComplete={handleQuizComplete}
              />
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* No tabs version - just show content */}
      {!hasTutorial && !hasQuiz && (
        <>
          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground leading-relaxed">
                {technique.description}
              </p>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <ProgressTracker
            status={progress?.status || 'not_started'}
            practiceCount={progress?.practiceCount || 0}
            onStatusChange={handleStatusChange}
          />

          {/* Step by Step */}
          {technique.steps && technique.steps.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
                Step by Step
              </h3>
              <Card>
                <CardContent className="p-0 divide-y">
                  {technique.steps.map((step, index) => (
                    <div key={index} className="flex gap-3 p-4">
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          )}
        </>
      )}

      {/* Watch Video Button */}
      <a
        href={technique.video?.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Button className="w-full gap-2" size="lg">
          <Play className="h-4 w-4" />
          Watch Full Tutorial
        </Button>
      </a>
    </div>
  );
}

// Progress Tracker Component
function ProgressTracker({
  status,
  practiceCount,
  onStatusChange,
}: {
  status: TechniqueProgress['status'];
  practiceCount: number;
  onStatusChange: (status: TechniqueProgress['status']) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
          Your Progress
        </h3>
        <div className="flex gap-2">
          <Button
            variant={status === 'not_started' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('not_started')}
            className="flex-1"
          >
            Not Started
          </Button>
          <Button
            variant={status === 'practicing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('practicing')}
            className="flex-1 gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            Practicing
          </Button>
          <Button
            variant={status === 'confident' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('confident')}
            className="flex-1 gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confident
          </Button>
        </div>
        {practiceCount > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Practiced {practiceCount} time{practiceCount !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Step Through Tutorial Component
function StepThroughTutorial({
  steps,
  completedSteps,
}: {
  steps: { stepNumber: number; title: string; instruction: string; imageUrl?: string }[];
  completedSteps: number[];
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  // Tracking completion status for potential future visual indicator
  const _isCompleted = completedSteps.includes(currentStep);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          Interactive Tutorial
        </h3>
        <span className="text-sm font-medium">
          {currentStep + 1} of {steps.length}
        </span>
      </div>
      <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />

      {/* Step Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {step.imageUrl && (
            <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
              <Image src={step.imageUrl} alt={step.title} fill className="object-contain" />
            </div>
          )}
          <div>
            <h4 className="font-semibold mb-2">{step.title}</h4>
            <p className="text-sm text-muted-foreground">{step.instruction}</p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="flex-1"
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={currentStep === steps.length - 1}
          className="flex-1"
        >
          Next
        </Button>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentStep
                ? 'w-4 bg-primary'
                : completedSteps.includes(index)
                ? 'bg-green-500'
                : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Quick Quiz Component
function QuickQuiz({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<'answering' | 'checking' | 'completed'>('answering');
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCorrect = selectedAnswer === question?.correctIndex;

  const handleCheck = () => {
    if (selectedAnswer === null) return;
    setQuizState('checking');
    if (isCorrect) {
      setCorrectAnswers((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore = correctAnswers + (isCorrect ? 1 : 0);
      setQuizState('completed');
      onComplete(finalScore, questions.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setQuizState('answering');
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setQuizState('answering');
    setCorrectAnswers(0);
  };

  if (!question || questions.length === 0) {
    return null;
  }

  // Completed state
  if (quizState === 'completed') {
    const finalScore = correctAnswers + (isCorrect ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          Quick Check
        </h3>
        <Card>
          <CardContent className="p-6 text-center">
            <div
              className={cn(
                'w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4',
                isPassing ? 'bg-green-100' : 'bg-amber-100'
              )}
            >
              {isPassing ? (
                <Check className="h-10 w-10 text-green-600" />
              ) : (
                <RefreshCw className="h-10 w-10 text-amber-600" />
              )}
            </div>
            <p className="text-3xl font-bold">
              {finalScore} / {questions.length}
            </p>
            <p className="text-lg font-semibold mt-1">
              {isPassing ? 'Great job!' : 'Keep practicing!'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{percentage}% correct</p>
            {!isPassing && (
              <Button
                variant="outline"
                onClick={handleRetry}
                className="mt-4 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          Quick Check
        </h3>
        <span className="text-sm font-medium">
          {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {question.imageUrl && (
            <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={question.imageUrl}
                alt="Question"
                fill
                className="object-contain"
              />
            </div>
          )}

          <p className="font-semibold text-center">{question.question}</p>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === question.correctIndex;
              const showResult = quizState === 'checking';

              return (
                <button
                  key={index}
                  onClick={() => quizState === 'answering' && setSelectedAnswer(index)}
                  disabled={quizState !== 'answering'}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors',
                    quizState === 'answering' && isSelected && 'border-primary bg-primary/5',
                    quizState === 'answering' && !isSelected && 'border-border hover:border-primary/50',
                    showResult && isCorrectOption && 'border-green-500 bg-green-50',
                    showResult && isSelected && !isCorrectOption && 'border-red-500 bg-red-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
                      quizState === 'answering' && isSelected && 'border-primary',
                      quizState === 'answering' && !isSelected && 'border-muted-foreground',
                      showResult && isCorrectOption && 'border-green-500 bg-green-500',
                      showResult && isSelected && !isCorrectOption && 'border-red-500 bg-red-500'
                    )}
                  >
                    {quizState === 'answering' && isSelected && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                    {showResult && isCorrectOption && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <X className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      showResult && isCorrectOption && 'text-green-700 font-medium',
                      showResult && isSelected && !isCorrectOption && 'text-red-700'
                    )}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {quizState === 'checking' && question.explanation && (
            <div
              className={cn(
                'p-3 rounded-lg flex gap-2',
                isCorrect ? 'bg-green-50' : 'bg-amber-50'
              )}
            >
              <Lightbulb
                className={cn(
                  'h-5 w-5 shrink-0',
                  isCorrect ? 'text-green-600' : 'text-amber-600'
                )}
              />
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}

          {/* Action Button */}
          {quizState === 'answering' ? (
            <Button
              onClick={handleCheck}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full gap-2">
              {isLastQuestion ? 'See Results' : 'Next Question'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {questions.map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex
                ? 'w-4 bg-primary'
                : index < currentIndex
                ? 'bg-green-500'
                : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Utility functions
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTechniqueName(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Loading skeleton
function TechniqueDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="aspect-video rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="h-60" />
    </div>
  );
}
