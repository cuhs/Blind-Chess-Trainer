import { describe, expect, it } from 'vitest';
import { CURRICULUM } from './curriculum';
import { verifyCurriculumPuzzleLogic } from './verify-curriculum-puzzle-logic';

describe('verifyCurriculumPuzzleLogic', () => {
  it('independently solves all 54 training-path puzzles', () => {
    const issues = verifyCurriculumPuzzleLogic();
    const puzzleCount = CURRICULUM.mainPathNodeIds.reduce(
      (count, nodeId) =>
        count + CURRICULUM.nodes[nodeId]!.puzzles.length,
      0,
    );

    expect(puzzleCount).toBe(54);

    if (issues.length > 0) {
      const summary = issues
        .map(
          (issue) =>
            `${issue.nodeId} ${issue.puzzleRef}\n  prompt: ${issue.prompt}\n  expected: ${issue.expected}\n  computed: ${issue.computed}\n  ${issue.message}`,
        )
        .join('\n\n');
      expect.fail(
        `${issues.length}/${puzzleCount} puzzles failed individual logic check:\n\n${summary}`,
      );
    }

    expect(issues).toEqual([]);
  });
});
