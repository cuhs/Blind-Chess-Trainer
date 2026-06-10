import { describe, it, expect } from 'vitest';
import { validatePuzzleBankFixtures } from './validate-puzzle-bank';

describe('validatePuzzleBankFixtures', () => {
  it('should report no issues for puzzle_bank seed fixtures', () => {
    const issues = validatePuzzleBankFixtures();
    expect(issues).toEqual([]);
  });
});
