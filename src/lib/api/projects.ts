// src/lib/api/projects.ts
// API service for project data
import { createClient } from '@/lib/supabase/client';
import type {
  Project,
  Step,
  ProjectStatus,
  ProjectRow,
  StepRow,
  PatternAnnotation,
  AnnotationRow,
} from '@/types/project';

// Transform database row to Project type
function transformProjectRow(
  row: ProjectRow,
  steps: Step[] = [],
  annotations: PatternAnnotation[] = []
): Project {
  return {
    id: row.id,
    name: row.name,
    thumbnail: row.thumbnail,
    status: row.status,
    needles: row.needles,
    yarn: row.yarn,
    size: row.size,
    notes: row.notes,
    techniques: row.techniques,
    steps,
    currentStepIndex: row.current_step_index,
    totalRows: row.total_rows,
    createdAt: row.created_at,
    lastWorkedAt: row.last_worked_at,
    sourceType: row.source_type,
    patternFileUrl: row.pattern_file_url,
    patternFileName: row.pattern_file_name,
    aiGenerated: row.ai_generated,
    totalTimeSpent: row.total_time_spent,
    patternAnnotations: annotations,
    annotationVersion: row.annotation_version,
    userId: row.user_id,
  };
}

// Transform step row to Step type
function transformStepRow(row: StepRow, children: Step[] = []): Step {
  return {
    id: row.id,
    type: row.type,
    label: row.label,
    title: row.title,
    description: row.description,
    completed: row.completed,
    techniques: row.techniques,
    children: children.length > 0 ? children : undefined,
    rowCount: row.row_count,
    startRow: row.start_row,
    endRow: row.end_row,
    repeatCount: row.repeat_count,
    repeatPattern: row.repeat_pattern,
    completedRows: row.completed_rows,
    trackingType: row.tracking_type,
    stitchCount: row.stitch_count,
    currentStitch: row.current_stitch,
    colorChange: row.color_change_from && row.color_change_to ? {
      from: row.color_change_from,
      to: row.color_change_to,
      colorName: row.color_change_name,
    } : undefined,
    milestone: row.milestone,
  };
}

// Transform annotation row to PatternAnnotation type
function transformAnnotationRow(row: AnnotationRow): PatternAnnotation {
  switch (row.type) {
    case 'text':
      return {
        id: row.id,
        type: 'text',
        text: row.text || '',
        x: row.x || 0,
        y: row.y || 0,
        fontSize: row.font_size || 16,
        color: row.color,
      };
    case 'rectangle':
      return {
        id: row.id,
        type: 'rectangle',
        x: row.x || 0,
        y: row.y || 0,
        width: row.width || 0,
        height: row.height || 0,
        color: row.color,
        strokeWidth: row.stroke_width || 2,
        filled: row.filled || false,
      };
    case 'circle':
      return {
        id: row.id,
        type: 'circle',
        cx: row.cx || 0,
        cy: row.cy || 0,
        rx: row.rx || 0,
        ry: row.ry || 0,
        color: row.color,
        strokeWidth: row.stroke_width || 2,
        filled: row.filled || false,
      };
    case 'arrow':
      return {
        id: row.id,
        type: 'arrow',
        startX: row.start_x || 0,
        startY: row.start_y || 0,
        endX: row.end_x || 0,
        endY: row.end_y || 0,
        color: row.color,
        strokeWidth: row.stroke_width || 2,
      };
    case 'path':
    default:
      return {
        id: row.id,
        type: 'path',
        path: row.path || '',
        color: row.color,
        strokeWidth: row.stroke_width || 2,
        isHighlighter: row.is_highlighter || false,
      };
  }
}

// ============================================================================
// PROJECT CRUD OPERATIONS
// ============================================================================

export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('last_worked_at', { ascending: false, nullsFirst: false });

  if (error) throw error;
  if (!projects) return [];

  return projects.map(p => transformProjectRow(p));
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const supabase = createClient();

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError || !project) return null;

  // Fetch steps
  const { data: stepRows } = await supabase
    .from('steps')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index');

  // Fetch annotations
  const { data: annotationRows } = await supabase
    .from('pattern_annotations')
    .select('*')
    .eq('project_id', projectId);

  // Build step tree (handle nested steps)
  const stepsMap = new Map<string, Step>();
  const rootSteps: Step[] = [];

  // First pass: create all steps
  stepRows?.forEach(row => {
    stepsMap.set(row.id, transformStepRow(row));
  });

  // Second pass: build hierarchy
  stepRows?.forEach(row => {
    const step = stepsMap.get(row.id)!;
    if (row.parent_step_id) {
      const parent = stepsMap.get(row.parent_step_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(step);
      }
    } else {
      rootSteps.push(step);
    }
  });

  // Transform annotations
  const annotations = annotationRows?.map(transformAnnotationRow) || [];

  return transformProjectRow(project, rootSteps, annotations);
}

export async function getProjectsByStatus(
  userId: string,
  status: ProjectStatus
): Promise<Project[]> {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('last_worked_at', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return projects?.map(p => transformProjectRow(p)) || [];
}

export async function createProject(
  userId: string,
  project: Omit<Project, 'id' | 'createdAt' | 'userId'>
): Promise<Project> {
  const supabase = createClient();

  // Create project
  const { data: newProject, error: projectError } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: project.name,
      thumbnail: project.thumbnail,
      status: project.status,
      needles: project.needles,
      yarn: project.yarn,
      size: project.size,
      notes: project.notes,
      techniques: project.techniques,
      current_step_index: project.currentStepIndex,
      total_rows: project.totalRows,
      source_type: project.sourceType,
      pattern_file_url: project.patternFileUrl,
      pattern_file_name: project.patternFileName,
      ai_generated: project.aiGenerated,
      total_time_spent: project.totalTimeSpent || 0,
    })
    .select()
    .single();

  if (projectError) throw projectError;

  // Create steps
  if (project.steps.length > 0) {
    await createStepsForProject(newProject.id, project.steps);
  }

  return transformProjectRow(newProject, project.steps);
}

async function createStepsForProject(
  projectId: string,
  steps: Step[],
  parentId?: string
): Promise<void> {
  const supabase = createClient();

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    const { data: newStep, error } = await supabase
      .from('steps')
      .insert({
        project_id: projectId,
        type: step.type,
        label: step.label,
        title: step.title,
        description: step.description,
        completed: step.completed,
        techniques: step.techniques,
        parent_step_id: parentId,
        order_index: i,
        row_count: step.rowCount,
        start_row: step.startRow,
        end_row: step.endRow,
        repeat_count: step.repeatCount,
        repeat_pattern: step.repeatPattern,
        completed_rows: step.completedRows,
        tracking_type: step.trackingType,
        stitch_count: step.stitchCount,
        current_stitch: step.currentStitch,
        color_change_from: step.colorChange?.from,
        color_change_to: step.colorChange?.to,
        color_change_name: step.colorChange?.colorName,
        milestone: step.milestone,
      })
      .select()
      .single();

    if (error) throw error;

    // Recursively create children
    if (step.children && step.children.length > 0) {
      await createStepsForProject(projectId, step.children, newStep.id);
    }
  }
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('projects')
    .update({
      name: updates.name,
      thumbnail: updates.thumbnail,
      status: updates.status,
      needles: updates.needles,
      yarn: updates.yarn,
      size: updates.size,
      notes: updates.notes,
      techniques: updates.techniques,
      current_step_index: updates.currentStepIndex,
      total_rows: updates.totalRows,
      last_worked_at: updates.lastWorkedAt,
      total_time_spent: updates.totalTimeSpent,
    })
    .eq('id', projectId);

  if (error) throw error;
}

export async function deleteProject(projectId: string): Promise<void> {
  const supabase = createClient();

  // Steps and annotations will be cascade deleted via foreign key
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}

export async function duplicateProject(
  projectId: string,
  newName: string
): Promise<Project> {
  const project = await getProjectById(projectId);
  if (!project) throw new Error('Project not found');

  // Reset progress
  const resetSteps = project.steps.map(resetStep);

  return createProject(project.userId!, {
    ...project,
    name: newName,
    status: 'planned',
    currentStepIndex: 0,
    lastWorkedAt: undefined,
    totalTimeSpent: 0,
    steps: resetSteps,
    patternAnnotations: [],
  });
}

function resetStep(step: Step): Step {
  return {
    ...step,
    completed: false,
    completedRows: [],
    currentStitch: 0,
    children: step.children?.map(resetStep),
  };
}

// ============================================================================
// STEP TRACKING
// ============================================================================

export async function toggleStepComplete(
  stepId: string,
  completed: boolean
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('steps')
    .update({ completed })
    .eq('id', stepId);

  if (error) throw error;
}

export async function updateStepProgress(
  stepId: string,
  updates: {
    completedRows?: number[];
    currentStitch?: number;
    completed?: boolean;
  }
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('steps')
    .update({
      completed_rows: updates.completedRows,
      current_stitch: updates.currentStitch,
      completed: updates.completed,
    })
    .eq('id', stepId);

  if (error) throw error;
}

export async function advanceToNextStep(projectId: string): Promise<void> {
  const supabase = createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('current_step_index')
    .eq('id', projectId)
    .single();

  if (!project) return;

  const { error } = await supabase
    .from('projects')
    .update({
      current_step_index: project.current_step_index + 1,
      last_worked_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (error) throw error;
}

// ============================================================================
// TIMER
// ============================================================================

export async function addTimeSpent(
  projectId: string,
  seconds: number
): Promise<void> {
  const supabase = createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('total_time_spent')
    .eq('id', projectId)
    .single();

  const currentTime = project?.total_time_spent || 0;

  const { error } = await supabase
    .from('projects')
    .update({
      total_time_spent: currentTime + seconds,
      last_worked_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (error) throw error;
}

// ============================================================================
// ANNOTATIONS
// ============================================================================

// Helper to convert annotation to database row format
function annotationToRow(projectId: string, a: PatternAnnotation) {
  const base = { project_id: projectId, color: a.color };

  switch (a.type) {
    case 'text':
      return {
        ...base,
        type: 'text' as const,
        text: a.text,
        x: a.x,
        y: a.y,
        font_size: a.fontSize,
      };
    case 'rectangle':
      return {
        ...base,
        type: 'rectangle' as const,
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height,
        stroke_width: a.strokeWidth,
        filled: a.filled,
      };
    case 'circle':
      return {
        ...base,
        type: 'circle' as const,
        cx: a.cx,
        cy: a.cy,
        rx: a.rx,
        ry: a.ry,
        stroke_width: a.strokeWidth,
        filled: a.filled,
      };
    case 'arrow':
      return {
        ...base,
        type: 'arrow' as const,
        start_x: a.startX,
        start_y: a.startY,
        end_x: a.endX,
        end_y: a.endY,
        stroke_width: a.strokeWidth,
      };
    case 'path':
    default:
      return {
        ...base,
        type: 'path' as const,
        path: a.path,
        stroke_width: a.strokeWidth,
        is_highlighter: a.isHighlighter,
      };
  }
}

export async function saveAnnotations(
  projectId: string,
  annotations: PatternAnnotation[]
): Promise<void> {
  const supabase = createClient();

  // Delete existing annotations
  await supabase
    .from('pattern_annotations')
    .delete()
    .eq('project_id', projectId);

  // Insert new annotations
  if (annotations.length > 0) {
    const rows = annotations.map(a => annotationToRow(projectId, a));

    const { error } = await supabase
      .from('pattern_annotations')
      .insert(rows);

    if (error) throw error;
  }

  // Update annotation version
  await supabase
    .from('projects')
    .update({ annotation_version: Date.now() })
    .eq('id', projectId);
}
