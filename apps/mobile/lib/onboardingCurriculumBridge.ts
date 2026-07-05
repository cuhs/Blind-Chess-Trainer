import type { TrainingProgress } from '@mindboard/shared';
import { EMPTY_TRAINING_PROGRESS } from '@mindboard/shared';
import { applyNodeCompletion } from '@/lib/trainingProgress';

/** Onboarding covers static recall + story-check — credit equivalent path nodes. */
export function onboardingTrainingProgress(): TrainingProgress {
  let progress: TrainingProgress = { ...EMPTY_TRAINING_PROGRESS };
  progress = applyNodeCompletion(progress, 'node-2-1', 2);
  progress = applyNodeCompletion(progress, 'node-5-1', 2);
  return progress;
}
