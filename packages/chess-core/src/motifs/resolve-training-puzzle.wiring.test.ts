import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../training/curriculum';
import { buildTrainingPuzzleSpec } from '../training/generators';
import { deriveNodePuzzleSeed } from '../training/daily-selection';
import { selectDailyCategoryPuzzles } from '../training/daily-selection';
import { resolveTrainingPuzzle } from './resolve-training-puzzle';

const MOTIF_NODES = new Set(['node-4-1', 'node-4-2', 'node-4-3']);
const SESSION_KEYS = ['fresh', 'retry-1', 'p1,p2'];

describe('resolveTrainingPuzzle training wiring', () => {
  it('engine-backs motif curriculum nodes and never rewrites other node prompts', () => {
    const flips: string[] = [];
    const unbacked: string[] = [];

    for (const nodeId of CURRICULUM.mainPathNodeIds) {
      const node = CURRICULUM.nodes[nodeId]!;
      for (const source of node.puzzles) {
        if (source.type !== 'generator') continue;
        for (const sessionKey of SESSION_KEYS) {
          const seed = deriveNodePuzzleSeed(nodeId, source.seed, sessionKey);
          const puzzle = buildTrainingPuzzleSpec(source.generatorId, seed);
          const resolved = resolveTrainingPuzzle(puzzle);
          const label = `${nodeId} ${source.generatorId}/${sessionKey}`;

          if (MOTIF_NODES.has(nodeId)) {
            if (!resolved.engineBacked) unbacked.push(label);
          } else if (resolved.prompt !== puzzle.prompt) {
            flips.push(
              `${label}: "${puzzle.prompt}" → "${resolved.prompt}"`,
            );
          }
        }
      }
    }

    expect(unbacked, unbacked.join('\n')).toEqual([]);
    expect(flips, flips.join('\n')).toEqual([]);
  });

  it('does not rewrite non-motif daily generated prompts', () => {
    const flips: string[] = [];

    for (let day = 1; day <= 30; day++) {
      const dateKey = `2026-06-${String(day).padStart(2, '0')}`;
      for (const puzzle of selectDailyCategoryPuzzles(dateKey)) {
        if (puzzle.id.includes('motif_')) continue;
        const resolved = resolveTrainingPuzzle(puzzle);
        if (resolved.prompt !== puzzle.prompt) {
          flips.push(`${dateKey} ${puzzle.id}: ${puzzle.prompt} → ${resolved.prompt}`);
        }
      }
    }

    expect(flips, flips.join('\n')).toEqual([]);
  });
});
