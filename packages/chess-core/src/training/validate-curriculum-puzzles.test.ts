import { describe, expect, it } from 'vitest';
import { validateCurriculumPuzzles } from './validate-curriculum-puzzles';

describe('validateCurriculumPuzzles', () => {
  it('finds no chess logic issues in the training path', () => {
    const issues = validateCurriculumPuzzles();
    if (issues.length > 0) {
      const summary = issues
        .map((issue) => `${issue.nodeId} ${issue.puzzleRef}: ${issue.message}`)
        .join('\n');
      expect.fail(`Curriculum puzzle issues:\n${summary}`);
    }
    expect(issues).toEqual([]);
  });
});
