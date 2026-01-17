// src/lib/api/techniques.ts
// API service for technique data
import { createClient } from '@/lib/supabase/client';
import type {
  Technique,
  TechniqueCategory,
  TechniqueProgress,
  TechniqueRow,
  TechniqueStepRow,
  QuizQuestionRow,
  CuratedVideoRow
} from '@/types/technique';

// Transform database row to Technique type
function transformTechniqueRow(
  row: TechniqueRow,
  steps?: TechniqueStepRow[],
  quiz?: QuizQuestionRow[],
  video?: CuratedVideoRow
): Technique {
  return {
    id: row.id,
    name: row.name,
    abbreviation: row.abbreviation || null,
    category: row.category,
    description: row.description,
    difficulty: row.difficulty as 1 | 2 | 3 | 4 | 5,
    steps: row.steps,
    tutorialSteps: steps?.map(s => ({
      stepNumber: s.step_number,
      title: s.title,
      instruction: s.instruction,
      imageUrl: s.image_url,
      animationUrl: s.animation_url,
      detailedTip: s.detailed_tip,
    })),
    quiz: quiz?.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctIndex: q.correct_index,
      explanation: q.explanation,
      imageUrl: q.image_url,
    })),
    tips: row.tips,
    commonMistakes: row.common_mistakes,
    video: video ? {
      platform: video.platform as 'youtube',
      videoId: video.video_id,
      url: video.url,
      thumbnailUrl: video.thumbnail_url,
      title: video.title,
      creatorName: video.creator_name,
      duration: video.duration,
      recommendedStart: video.recommended_start,
      recommendedEnd: video.recommended_end,
      aiScore: video.ai_score,
      evaluatedAt: video.evaluated_at,
    } : {
      platform: 'youtube',
      videoId: '',
      url: '',
      thumbnailUrl: '',
      title: '',
      creatorName: '',
      duration: 0,
      recommendedStart: 0,
      aiScore: 0,
      evaluatedAt: new Date().toISOString(),
    },
    relatedTechniques: row.related_techniques,
    fallback: {
      staticImageUrl: '',
      stepByStepText: row.steps,
    },
    prerequisites: row.prerequisites,
    tags: row.tags,
    aliases: row.aliases,
  };
}

// Fetch all techniques
export async function getAllTechniques(): Promise<Technique[]> {
  const supabase = createClient();

  const { data: techniques, error } = await supabase
    .from('techniques')
    .select('*')
    .order('name');

  if (error) throw error;
  if (!techniques) return [];

  // Fetch related data for each technique
  const techniqueIds = techniques.map(t => t.id);

  const [stepsResult, quizResult, videosResult] = await Promise.all([
    supabase.from('technique_steps').select('*').in('technique_id', techniqueIds),
    supabase.from('quiz_questions').select('*').in('technique_id', techniqueIds),
    supabase.from('curated_videos').select('*').in('technique_id', techniqueIds),
  ]);

  const stepsMap = new Map<string, TechniqueStepRow[]>();
  const quizMap = new Map<string, QuizQuestionRow[]>();
  const videoMap = new Map<string, CuratedVideoRow>();

  stepsResult.data?.forEach(s => {
    const existing = stepsMap.get(s.technique_id) || [];
    stepsMap.set(s.technique_id, [...existing, s]);
  });

  quizResult.data?.forEach(q => {
    const existing = quizMap.get(q.technique_id) || [];
    quizMap.set(q.technique_id, [...existing, q]);
  });

  videosResult.data?.forEach(v => {
    videoMap.set(v.technique_id, v);
  });

  return techniques.map(t => transformTechniqueRow(
    t,
    stepsMap.get(t.id)?.sort((a, b) => a.step_number - b.step_number),
    quizMap.get(t.id),
    videoMap.get(t.id)
  ));
}

// Fetch technique by ID
export async function getTechniqueById(id: string): Promise<Technique | null> {
  const supabase = createClient();

  const { data: technique, error } = await supabase
    .from('techniques')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !technique) return null;

  const [stepsResult, quizResult, videoResult] = await Promise.all([
    supabase.from('technique_steps').select('*').eq('technique_id', id).order('step_number'),
    supabase.from('quiz_questions').select('*').eq('technique_id', id),
    supabase.from('curated_videos').select('*').eq('technique_id', id).single(),
  ]);

  return transformTechniqueRow(
    technique,
    stepsResult.data || undefined,
    quizResult.data || undefined,
    videoResult.data || undefined
  );
}

// Fetch techniques by category
export async function getTechniquesByCategory(category: TechniqueCategory): Promise<Technique[]> {
  const supabase = createClient();

  const { data: techniques, error } = await supabase
    .from('techniques')
    .select('*')
    .eq('category', category)
    .order('difficulty')
    .order('name');

  if (error) throw error;
  if (!techniques) return [];

  // For category views, we don't need full tutorial data
  return techniques.map(t => transformTechniqueRow(t));
}

// Search techniques
export async function searchTechniques(query: string): Promise<Technique[]> {
  const supabase = createClient();

  const { data: techniques, error } = await supabase
    .from('techniques')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,abbreviation.ilike.%${query}%`)
    .order('name')
    .limit(20);

  if (error) throw error;
  if (!techniques) return [];

  return techniques.map(t => transformTechniqueRow(t));
}

// Get category counts
export async function getCategoryCounts(): Promise<Record<TechniqueCategory, number>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('techniques')
    .select('category');

  if (error) throw error;

  const counts: Record<string, number> = {};
  data?.forEach(t => {
    counts[t.category] = (counts[t.category] || 0) + 1;
  });

  return counts as Record<TechniqueCategory, number>;
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export async function getTechniqueProgress(userId: string): Promise<Map<string, TechniqueProgress>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('technique_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  const progressMap = new Map<string, TechniqueProgress>();
  data?.forEach(p => {
    progressMap.set(p.technique_id, {
      status: p.status,
      completedSteps: p.completed_steps,
      quizScore: p.quiz_score,
      quizAttempts: p.quiz_attempts,
      lastPracticed: p.last_practiced,
      practiceCount: p.practice_count,
    });
  });

  return progressMap;
}

export async function updateTechniqueProgress(
  userId: string,
  techniqueId: string,
  progress: Partial<TechniqueProgress>
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('technique_progress')
    .upsert({
      user_id: userId,
      technique_id: techniqueId,
      status: progress.status,
      completed_steps: progress.completedSteps,
      quiz_score: progress.quizScore,
      quiz_attempts: progress.quizAttempts,
      last_practiced: progress.lastPracticed,
      practice_count: progress.practiceCount,
    }, {
      onConflict: 'user_id,technique_id',
    });

  if (error) throw error;
}

export async function markTechniqueStatus(
  userId: string,
  techniqueId: string,
  status: TechniqueProgress['status']
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('technique_progress')
    .upsert({
      user_id: userId,
      technique_id: techniqueId,
      status,
      last_practiced: new Date().toISOString(),
    }, {
      onConflict: 'user_id,technique_id',
    });

  if (error) throw error;
}

export async function recordQuizAttempt(
  userId: string,
  techniqueId: string,
  score: number
): Promise<void> {
  const supabase = createClient();

  // Get current progress
  const { data: current } = await supabase
    .from('technique_progress')
    .select('quiz_score, quiz_attempts')
    .eq('user_id', userId)
    .eq('technique_id', techniqueId)
    .single();

  const newAttempts = (current?.quiz_attempts || 0) + 1;
  const newScore = Math.max(current?.quiz_score || 0, score);

  // Update to confident if score is 80% or higher
  const newStatus = score >= 80 ? 'confident' : 'practicing';

  const { error } = await supabase
    .from('technique_progress')
    .upsert({
      user_id: userId,
      technique_id: techniqueId,
      quiz_score: newScore,
      quiz_attempts: newAttempts,
      status: newStatus,
      last_practiced: new Date().toISOString(),
    }, {
      onConflict: 'user_id,technique_id',
    });

  if (error) throw error;
}
