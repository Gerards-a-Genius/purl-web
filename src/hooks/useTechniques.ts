// src/hooks/useTechniques.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTechniques,
  getTechniqueById,
  getTechniquesByCategory,
  searchTechniques,
  getCategoryCounts,
  getTechniqueProgress,
  updateTechniqueProgress,
  markTechniqueStatus,
  recordQuizAttempt,
} from '@/lib/api/techniques';
import type { TechniqueCategory, TechniqueProgress } from '@/types/technique';

// Query keys
export const techniqueKeys = {
  all: ['techniques'] as const,
  lists: () => [...techniqueKeys.all, 'list'] as const,
  list: () => [...techniqueKeys.lists(), 'all'] as const,
  byCategory: (category: TechniqueCategory) =>
    [...techniqueKeys.lists(), { category }] as const,
  search: (query: string) => [...techniqueKeys.lists(), { search: query }] as const,
  details: () => [...techniqueKeys.all, 'detail'] as const,
  detail: (id: string) => [...techniqueKeys.details(), id] as const,
  counts: () => [...techniqueKeys.all, 'counts'] as const,
  progress: (userId: string) => [...techniqueKeys.all, 'progress', userId] as const,
};

// Hooks
export function useTechniques() {
  return useQuery({
    queryKey: techniqueKeys.list(),
    queryFn: getAllTechniques,
    staleTime: 5 * 60 * 1000, // Techniques don't change often
  });
}

export function useTechnique(techniqueId: string | undefined) {
  return useQuery({
    queryKey: techniqueKeys.detail(techniqueId || ''),
    queryFn: () => getTechniqueById(techniqueId!),
    enabled: !!techniqueId,
  });
}

export function useTechniquesByCategory(category: TechniqueCategory) {
  return useQuery({
    queryKey: techniqueKeys.byCategory(category),
    queryFn: () => getTechniquesByCategory(category),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchTechniques(query: string) {
  return useQuery({
    queryKey: techniqueKeys.search(query),
    queryFn: () => searchTechniques(query),
    enabled: query.length >= 2,
  });
}

export function useCategoryCounts() {
  return useQuery({
    queryKey: techniqueKeys.counts(),
    queryFn: getCategoryCounts,
    staleTime: 5 * 60 * 1000,
  });
}

// Progress hooks
export function useTechniqueProgress(userId: string | undefined) {
  return useQuery({
    queryKey: techniqueKeys.progress(userId || ''),
    queryFn: () => getTechniqueProgress(userId!),
    enabled: !!userId,
  });
}

export function useUpdateTechniqueProgress(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      techniqueId,
      progress,
    }: {
      techniqueId: string;
      progress: Partial<TechniqueProgress>;
    }) => updateTechniqueProgress(userId, techniqueId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: techniqueKeys.progress(userId) });
    },
  });
}

export function useMarkTechniqueStatus(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      techniqueId,
      status,
    }: {
      techniqueId: string;
      status: TechniqueProgress['status'];
    }) => markTechniqueStatus(userId, techniqueId, status),
    onMutate: async ({ techniqueId, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: techniqueKeys.progress(userId) });
      const previous = queryClient.getQueryData<Map<string, TechniqueProgress>>(
        techniqueKeys.progress(userId)
      );

      if (previous) {
        const updated = new Map(previous);
        const existing = updated.get(techniqueId) || {
          status: 'not_started' as const,
          completedSteps: [],
          quizAttempts: 0,
          practiceCount: 0,
        };
        updated.set(techniqueId, { ...existing, status });
        queryClient.setQueryData(techniqueKeys.progress(userId), updated);
      }

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(techniqueKeys.progress(userId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: techniqueKeys.progress(userId) });
    },
  });
}

export function useRecordQuizAttempt(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ techniqueId, score }: { techniqueId: string; score: number }) =>
      recordQuizAttempt(userId, techniqueId, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: techniqueKeys.progress(userId) });
    },
  });
}

// Utility: Get techniques with progress
export function useTechniquesWithProgress(userId: string | undefined) {
  const { data: techniques, isLoading: techniquesLoading } = useTechniques();
  const { data: progress, isLoading: progressLoading } = useTechniqueProgress(userId);

  return {
    data: techniques?.map(t => ({
      ...t,
      progress: progress?.get(t.id),
    })),
    isLoading: techniquesLoading || progressLoading,
  };
}

// Category metadata
export const CATEGORY_INFO: Record<TechniqueCategory, {
  name: string;
  description: string;
  icon: string;
  color: string;
}> = {
  foundations: {
    name: 'Foundations',
    description: 'Yarn, needles, and getting started',
    icon: '🏠',
    color: 'bg-blue-100',
  },
  'cast-on': {
    name: 'Cast On',
    description: 'Starting techniques',
    icon: '▶️',
    color: 'bg-green-100',
  },
  basic: {
    name: 'Basic Stitches',
    description: 'Knit, purl, and essentials',
    icon: '🧶',
    color: 'bg-purple-100',
  },
  'bind-off': {
    name: 'Bind Off',
    description: 'Finishing edges',
    icon: '⏹️',
    color: 'bg-red-100',
  },
  patterns: {
    name: 'Stitch Patterns',
    description: 'Cables, lace, colorwork',
    icon: '🎨',
    color: 'bg-yellow-100',
  },
  increase: {
    name: 'Increases',
    description: 'Adding stitches',
    icon: '➕',
    color: 'bg-teal-100',
  },
  decrease: {
    name: 'Decreases',
    description: 'Removing stitches',
    icon: '➖',
    color: 'bg-orange-100',
  },
  sos: {
    name: 'SOS & Fixes',
    description: 'Troubleshooting mistakes',
    icon: '🆘',
    color: 'bg-red-100',
  },
  finishing: {
    name: 'Finishing',
    description: 'Seaming, blocking, ends',
    icon: '✨',
    color: 'bg-pink-100',
  },
  'reading-patterns': {
    name: 'Reading Patterns',
    description: 'Understanding instructions',
    icon: '📖',
    color: 'bg-indigo-100',
  },
  texture: {
    name: 'Texture',
    description: 'Textured stitch patterns',
    icon: '🌊',
    color: 'bg-cyan-100',
  },
  special: {
    name: 'Special Techniques',
    description: 'Advanced methods',
    icon: '⭐',
    color: 'bg-amber-100',
  },
};
