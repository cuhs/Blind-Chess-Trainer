import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { CURRICULUM } from './curriculum';
import { buildTrainingPuzzleSpec } from './generators';
import { validateCurriculumPuzzles } from './validate-curriculum-puzzles';
import { applyMoves, validateAnswer } from '../validate';
import fixtures from '../motifs/fixtures/puzzle-bank-fixtures.json';

type BankFixture = (typeof fixtures)[number];

function curriculumBankSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const nodeId of CURRICULUM.mainPathNodeIds) {
    for (const source of CURRICULUM.nodes[nodeId]!.puzzles) {
      if (source.type === 'bank_slug') slugs.add(source.slug);
    }
  }
  return slugs;
}

import { analyzePosition } from '../motifs/analyze-position';

describe('extended curriculum audit', () => {
  it('passes core validator with zero issues', () => {
    const issues = validateCurriculumPuzzles();
    expect(issues).toEqual([]);
  });

  it('grades every puzzle correctly via validateAnswer', () => {
    const failures: string[] = [];

    for (const nodeId of CURRICULUM.mainPathNodeIds) {
      for (const source of CURRICULUM.nodes[nodeId]!.puzzles) {
        if (source.type === 'generator') {
          const puzzle = buildTrainingPuzzleSpec(
            source.generatorId,
            source.seed,
          );
          const ref = `${source.generatorId}/${source.seed}`;
          const ok = validateAnswer(
            puzzle.answerType,
            puzzle.expected,
            puzzle.expected,
            puzzle.fen,
            puzzle.moves,
          );
          if (!ok) failures.push(`${nodeId} ${ref}`);
        } else if (source.type === 'bank_slug') {
          const row = (fixtures as BankFixture[]).find(
            (fixture) => fixture.slug === source.slug,
          );
          if (!row) {
            failures.push(`missing bank row ${source.slug}`);
            continue;
          }
          const answerType = /^[a-h][1-8]$/.test(row.expectedAnswer)
            ? 'square'
            : 'yes-no';
          const ok = validateAnswer(
            answerType,
            row.expectedAnswer,
            row.expectedAnswer,
            row.fen,
            row.moves,
          );
          if (!ok) failures.push(`${nodeId} ${source.slug}`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it('curriculum fork puzzles attack at least two enemy pieces', () => {
    const forkSlugs = [
      'drill-fork-knight',
      'drill-fork-royal-knight',
      'drill-fork-knight-dual',
    ];
    const rows = (fixtures as BankFixture[]).filter((row) =>
      forkSlugs.includes(row.slug),
    );

    for (const row of rows) {
      const fen =
        row.moves.length > 0
          ? applyMoves(row.fen, row.moves)
          : row.fen;
      const motif = analyzePosition(fen);
      expect(motif?.type, `${row.slug} has no detected fork`).toBe('fork');
      if (motif?.type !== 'fork') continue;
      expect(
        motif.targets.length,
        `${row.slug} forks only ${motif.targets.map((t) => t.square).join(',')}`,
      ).toBeGreaterThanOrEqual(2);
      expect(motif.attacker.square, row.slug).toBe(row.expectedAnswer);
    }
  });

  it('curriculum hanging-piece targets are attacked and undefended', () => {
    const hangingSlugs = [
      'drill-hanging-queen-a4',
      'drill-hanging-queen-a7',
      'drill-hanging-knight-f6',
    ];
    const rows = (fixtures as BankFixture[]).filter((row) =>
      hangingSlugs.includes(row.slug),
    );

    for (const row of rows) {
      const fen =
        row.moves.length > 0
          ? applyMoves(row.fen, row.moves)
          : row.fen;
      const chess = new Chess(fen);
      const target = row.motifJson.target!.replace(/^[KQRBNP]/, '').toLowerCase();
      const piece = chess.get(target as never);
      expect(piece, `${row.slug} missing target ${target}`).toBeTruthy();

      const enemy = piece!.color === 'w' ? 'b' : 'w';
      expect(
        chess.isAttacked(target as never, enemy),
        `${row.slug} target ${target} not attacked`,
      ).toBe(true);

      const defended = chess
        .moves({ verbose: true })
        .some(
          (move) =>
            move.to === target &&
            move.color === piece!.color &&
            move.san !== row.motifJson.attacker?.replace(/^[KQRBNP]/, ''),
        );
      expect(defended, `${row.slug} target ${target} is defended`).toBe(false);
    }
  });

  it('story-check bank puzzles match check state for the asked color', () => {
    const slugs = [
      'drill-story-check',
      'drill-story-check-yes',
      'drill-story-check-white-no',
    ];
    const rows = (fixtures as BankFixture[]).filter((row) =>
      slugs.includes(row.slug),
    );

    for (const row of rows) {
      const fen = applyMoves(row.fen, row.moves);
      const chess = new Chess(fen);
      const color = row.nlpPrompt!.includes('White') ? 'w' : 'b';
      const inCheck = chess.turn() === color && chess.inCheck();
      const expected = inCheck ? 'yes' : 'no';
      expect(row.expectedAnswer, row.slug).toBe(expected);
    }
  });

  it('coordinate neighbor seeds stay on the board', () => {
    for (const nodeId of CURRICULUM.mainPathNodeIds) {
      for (const source of CURRICULUM.nodes[nodeId]!.puzzles) {
        if (
          source.type !== 'generator' ||
          source.generatorId !== 'coordinate_neighbor'
        ) {
          continue;
        }
        const puzzle = buildTrainingPuzzleSpec(
          source.generatorId,
          source.seed,
        );
        expect(puzzle.expected).toMatch(/^[a-h][1-8]$/);
      }
    }
  });

  it('every curriculum bank slug exists in fixtures', () => {
    const slugs = curriculumBankSlugs();
    for (const slug of slugs) {
      const row = (fixtures as BankFixture[]).find(
        (fixture) => fixture.slug === slug,
      );
      expect(row, slug).toBeDefined();
    }
  });
});
