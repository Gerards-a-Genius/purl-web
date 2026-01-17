// src/app/(main)/learn/page.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Lightbulb,
  ArrowRight,
  Clock,
  CheckCircle2,
  LogIn,
  Layers,
  PlusCircle,
  MinusCircle,
  Palette,
  LogOut,
  Sparkles,
  LifeBuoy,
  BookOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import {
  useTechniques,
  useSearchTechniques,
  useTechniqueProgress,
  CATEGORY_INFO,
} from '@/hooks/useTechniques';
import type { TechniqueCategory } from '@/types/technique';
import { cn } from '@/lib/utils';

// Category configuration with icons
const CATEGORIES: {
  id: TechniqueCategory;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}[] = [
  { id: 'cast-on', icon: <LogIn className="h-5 w-5" />, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { id: 'basic', icon: <Layers className="h-5 w-5" />, color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { id: 'increase', icon: <PlusCircle className="h-5 w-5" />, color: 'text-teal-700', bgColor: 'bg-teal-100' },
  { id: 'decrease', icon: <MinusCircle className="h-5 w-5" />, color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { id: 'patterns', icon: <Palette className="h-5 w-5" />, color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { id: 'bind-off', icon: <LogOut className="h-5 w-5" />, color: 'text-red-700', bgColor: 'bg-red-100' },
  { id: 'finishing', icon: <Sparkles className="h-5 w-5" />, color: 'text-pink-700', bgColor: 'bg-pink-100' },
  { id: 'sos', icon: <LifeBuoy className="h-5 w-5" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  { id: 'reading-patterns', icon: <BookOpen className="h-5 w-5" />, color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
];

export default function LearnPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { data: techniques, isLoading: techniquesLoading } = useTechniques();
  const { data: progress } = useTechniqueProgress(user?.id);
  const { data: searchResults, isLoading: searchLoading } = useSearchTechniques(searchQuery);

  // Calculate overall progress stats
  const progressStats = useMemo(() => {
    if (!progress) return { confident: 0, practicing: 0, total: techniques?.length || 0 };

    let confident = 0;
    let practicing = 0;
    progress.forEach((p) => {
      if (p.status === 'confident') confident++;
      else if (p.status === 'practicing') practicing++;
    });

    return { confident, practicing, total: techniques?.length || 0 };
  }, [progress, techniques]);

  // Get techniques in progress
  const inProgressTechniques = useMemo(() => {
    if (!techniques || !progress) return [];
    return techniques.filter((t) => {
      const p = progress.get(t.id);
      return p?.status === 'practicing';
    });
  }, [techniques, progress]);

  // Get essential techniques
  const essentialTechniques = useMemo(() => {
    if (!techniques) return [];
    return techniques.filter((t) => t.tags?.includes('essential')).slice(0, 8);
  }, [techniques]);

  // Get quick access techniques (cast-on + basic)
  const quickAccessTechniques = useMemo(() => {
    if (!techniques) return [];
    return techniques
      .filter((t) => t.category === 'cast-on' || t.category === 'basic')
      .slice(0, 12);
  }, [techniques]);

  const isSearching = searchQuery.trim().length >= 2;
  const hasProgress = progressStats.confident > 0 || progressStats.practicing > 0;

  // Get progress status for a technique
  const getProgressStatus = (techniqueId: string) => {
    return progress?.get(techniqueId)?.status || 'not_started';
  };

  if (techniquesLoading) {
    return <LearnPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors',
          isSearchFocused ? 'text-primary' : 'text-muted-foreground'
        )} />
        <Input
          placeholder="Search techniques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isSearching ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {searchLoading
              ? 'Searching...'
              : `${searchResults?.length || 0} ${searchResults?.length === 1 ? 'result' : 'results'}`}
          </p>
          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((technique) => (
                <TechniqueSearchResult
                  key={technique.id}
                  technique={technique}
                  status={getProgressStatus(technique.id)}
                />
              ))}
            </div>
          ) : !searchLoading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">No techniques found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Lightbulb className="h-7 w-7 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">New to knitting?</h2>
                  <p className="text-sm text-muted-foreground">Start with the basics</p>
                </div>
              </div>
              <Link href="/learn/cast-on">
                <Button className="w-full gap-2">
                  Start here
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Progress Section */}
          {hasProgress && (
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
                Your Progress
              </h2>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-around mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{progressStats.confident}</p>
                      <p className="text-xs text-muted-foreground">Confident</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{progressStats.practicing}</p>
                      <p className="text-xs text-muted-foreground">Practicing</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{progressStats.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${(progressStats.confident / progressStats.total) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{
                        width: `${(progressStats.practicing / progressStats.total) * 100}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Continue Practicing */}
          {inProgressTechniques.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
                Continue Practicing
              </h2>
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-4">
                  {inProgressTechniques.map((technique) => (
                    <Link
                      key={technique.id}
                      href={`/learn/technique/${technique.id}`}
                      className="shrink-0"
                    >
                      <Card className="w-[120px] bg-amber-50 border-amber-200 hover:bg-amber-100 transition-colors">
                        <CardContent className="p-3 text-center">
                          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-600" />
                          </div>
                          <p className="text-sm font-medium truncate">{technique.name}</p>
                          {technique.abbreviation && (
                            <p className="text-xs text-amber-600">({technique.abbreviation})</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}

          {/* Essential Skills */}
          {essentialTechniques.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1">
                Essential Skills
              </h2>
              <p className="text-sm text-muted-foreground mb-3">Master these first</p>
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-4">
                  {essentialTechniques.map((technique) => {
                    const status = getProgressStatus(technique.id);
                    return (
                      <Link
                        key={technique.id}
                        href={`/learn/technique/${technique.id}`}
                        className="shrink-0"
                      >
                        <Card className="w-[160px] hover:bg-muted/50 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium truncate flex-1">
                                {technique.name}
                              </p>
                              {status === 'practicing' && (
                                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                              )}
                              {status === 'confident' && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              )}
                            </div>
                            {technique.abbreviation && (
                              <p className="text-xs text-primary font-medium mb-1">
                                {technique.abbreviation}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {technique.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}

          {/* Categories Grid */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => {
                const info = CATEGORY_INFO[category.id];
                return (
                  <Link key={category.id} href={`/learn/${category.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                      <CardContent className="p-4">
                        <div
                          className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center mb-2',
                            category.bgColor
                          )}
                        >
                          <span className={category.color}>{category.icon}</span>
                        </div>
                        <p className="font-semibold text-sm">{info.name}</p>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Quick Access */}
          {quickAccessTechniques.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-3">
                Quick Access
              </h2>
              <ScrollArea className="w-full">
                <div className="flex flex-wrap gap-2 pb-4">
                  {quickAccessTechniques.map((technique) => (
                    <Link key={technique.id} href={`/learn/technique/${technique.id}`}>
                      <Badge
                        variant="outline"
                        className="gap-1.5 px-3 py-1.5 hover:bg-muted cursor-pointer"
                      >
                        {technique.abbreviation && (
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                            {technique.abbreviation.slice(0, 2)}
                          </span>
                        )}
                        {technique.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// Search result item component
function TechniqueSearchResult({
  technique,
  status,
}: {
  technique: { id: string; name: string; abbreviation?: string | null; category: string };
  status: string;
}) {
  const categoryLabel = technique.category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <Link href={`/learn/technique/${technique.id}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {technique.abbreviation ? (
              <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {technique.abbreviation}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium">{technique.name}</p>
              <p className="text-xs text-muted-foreground">{categoryLabel}</p>
            </div>
            {status === 'practicing' && <Clock className="h-5 w-5 text-amber-500" />}
            {status === 'confident' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Loading skeleton
function LearnPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-40 shrink-0" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-4 w-40 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    </div>
  );
}
