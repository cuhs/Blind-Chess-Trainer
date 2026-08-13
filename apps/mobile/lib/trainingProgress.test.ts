import { describe, expect, it } from 'vitest';
import { EMPTY_TRAINING_PROGRESS } from '@mindboard/shared';
import {
  applyNodeCompletion,
  isNodeCompleted,
  isNodeUnlocked,
  nextPlayableNode,
  nodePuzzleSessionKey,
  starsForSession,
} from './trainingProgress';

describe('trainingProgress', () => {
  it('unlocks first node by default', () => {
    expect(isNodeUnlocked('node-1-1', EMPTY_TRAINING_PROGRESS)).toBe(true);
    expect(isNodeUnlocked('node-1-2', EMPTY_TRAINING_PROGRESS)).toBe(false);
  });

  it('unlocks next node after completion', () => {
    const progress = applyNodeCompletion(
      EMPTY_TRAINING_PROGRESS,
      'node-1-1',
      3,
    );
    expect(isNodeCompleted(progress, 'node-1-1')).toBe(true);
    expect(isNodeUnlocked('node-1-2', progress)).toBe(true);
  });

  it('finds next playable node', () => {
    expect(nextPlayableNode(EMPTY_TRAINING_PROGRESS)?.id).toBe('node-1-1');
    const progress = applyNodeCompletion(
      EMPTY_TRAINING_PROGRESS,
      'node-1-1',
      2,
    );
    expect(nextPlayableNode(progress)?.id).toBe('node-1-2');
  });

  it('scores stars from session performance', () => {
    expect(starsForSession(3, 3, 0)).toBe(3);
    expect(starsForSession(3, 3, 2)).toBe(1);
    expect(starsForSession(2, 3, 0)).toBe(2);
  });
});

describe('nodePuzzleSessionKey', () => {
  it('stays fresh while an uncompleted node is in progress', () => {
    expect(nodePuzzleSessionKey('node-4-1', EMPTY_TRAINING_PROGRESS)).toBe(
      'fresh',
    );
    const otherNodeCompleted = applyNodeCompletion(
      EMPTY_TRAINING_PROGRESS,
      'node-1-1',
      3,
    );
    expect(nodePuzzleSessionKey('node-4-1', otherNodeCompleted)).toBe('fresh');
  });

  it('uses a stable replay key after the node is completed', () => {
    const completed = applyNodeCompletion(
      EMPTY_TRAINING_PROGRESS,
      'node-4-1',
      2,
    );
    expect(nodePuzzleSessionKey('node-4-1', completed)).toBe('replay-2');
  });
});
