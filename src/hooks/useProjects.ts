// src/hooks/useProjects.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  getProjectById,
  getProjectsByStatus,
  createProject,
  updateProject,
  deleteProject,
  duplicateProject,
  toggleStepComplete,
  updateStepProgress,
  advanceToNextStep,
  addTimeSpent,
  saveAnnotations,
} from '@/lib/api/projects';
import type { Project, ProjectStatus, PatternAnnotation } from '@/types/project';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (userId: string) => [...projectKeys.lists(), userId] as const,
  byStatus: (userId: string, status: ProjectStatus) =>
    [...projectKeys.list(userId), { status }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Hooks
export function useProjects(userId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.list(userId || ''),
    queryFn: () => getProjects(userId!),
    enabled: !!userId,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId || ''),
    queryFn: () => getProjectById(projectId!),
    enabled: !!projectId,
  });
}

export function useProjectsByStatus(userId: string | undefined, status: ProjectStatus) {
  return useQuery({
    queryKey: projectKeys.byStatus(userId || '', status),
    queryFn: () => getProjectsByStatus(userId!, status),
    enabled: !!userId,
  });
}

export function useCreateProject(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Omit<Project, 'id' | 'createdAt' | 'userId'>) =>
      createProject(userId, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(userId) });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) =>
      updateProject(projectId, updates),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(userId) });
    },
  });
}

export function useDuplicateProject(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, newName }: { projectId: string; newName: string }) =>
      duplicateProject(projectId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(userId) });
    },
  });
}

// Step tracking mutations
export function useToggleStepComplete(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId, completed }: { stepId: string; completed: boolean }) =>
      toggleStepComplete(stepId, completed),
    onMutate: async ({ stepId, completed }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });
      const previous = queryClient.getQueryData<Project>(projectKeys.detail(projectId));

      if (previous) {
        const updateSteps = (steps: Project['steps']): Project['steps'] =>
          steps.map(step => {
            if (step.id === stepId) {
              return { ...step, completed };
            }
            if (step.children) {
              return { ...step, children: updateSteps(step.children) };
            }
            return step;
          });

        queryClient.setQueryData<Project>(projectKeys.detail(projectId), {
          ...previous,
          steps: updateSteps(previous.steps),
        });
      }

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(projectKeys.detail(projectId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useUpdateStepProgress(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stepId,
      updates,
    }: {
      stepId: string;
      updates: { completedRows?: number[]; currentStitch?: number; completed?: boolean };
    }) => updateStepProgress(stepId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useAdvanceToNextStep(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => advanceToNextStep(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

// Timer mutation
export function useAddTimeSpent(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seconds: number) => addTimeSpent(projectId, seconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

// Annotations mutation
export function useSaveAnnotations(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (annotations: PatternAnnotation[]) => saveAnnotations(projectId, annotations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}
