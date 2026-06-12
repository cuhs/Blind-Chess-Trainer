import { Chess } from 'chess.js';
import type { Color } from 'chess.js';
import { applyMoves } from '../validate';
import { analyzePosition } from './analyze-position';
import { motifToResult } from './adapters';
import { buildPuzzleFromMotif } from './questions';
import fixtures from './fixtures/puzzle-bank-fixtures.json';

export interface PuzzleBankFixture {
  slug: string;
  fen: string;
  moves: string[];
  motifJson: Record<string, string>;
  nlpPrompt?: string;
  expectedAnswer: string;
  skipEngine: boolean;
  alternatePrompt?: boolean;
  /** For story_check rows: which color the check question asks about. */
  checkColor?: 'w' | 'b';
}

export interface PuzzleValidationIssue {
  slug: string;
  message: string;
}

function displayFenFor(fixture: PuzzleBankFixture): string {
  return fixture.moves.length > 0
    ? applyMoves(fixture.fen, fixture.moves)
    : fixture.fen;
}

function previousFenFor(fixture: PuzzleBankFixture): string | undefined {
  if (fixture.moves.length === 0) return undefined;
  if (fixture.moves.length === 1) return fixture.fen;
  return applyMoves(fixture.fen, fixture.moves.slice(0, -1));
}

/** A side not on move can never legally be in check. */
function isColorInCheck(fen: string, color: Color): boolean {
  const chess = new Chess(fen);
  return chess.turn() === color && chess.inCheck();
}

export function validatePuzzleBankFixtures(
  rows: PuzzleBankFixture[] = fixtures as PuzzleBankFixture[],
): PuzzleValidationIssue[] {
  const issues: PuzzleValidationIssue[] = [];

  for (const fixture of rows) {
    let displayFen: string;
    try {
      displayFen = displayFenFor(fixture);
    } catch (error) {
      issues.push({
        slug: fixture.slug,
        message: `Illegal move sequence from fen: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      continue;
    }

    if (fixture.motifJson.motif === 'story_check') {
      const color = fixture.checkColor ?? 'b';
      const expected = isColorInCheck(displayFen, color) ? 'yes' : 'no';
      if (expected !== fixture.expectedAnswer) {
        issues.push({
          slug: fixture.slug,
          message: `story_check answer mismatch: position says "${expected}", seed says "${fixture.expectedAnswer}"`,
        });
      }
    }

    if (fixture.skipEngine) continue;

    const previousFen = previousFenFor(fixture);
    const motif = analyzePosition(displayFen, previousFen);

    if (!motif) {
      issues.push({
        slug: fixture.slug,
        message: 'Expected analyzePosition to detect a motif',
      });
      continue;
    }

    const result = motifToResult(motif);
    const expectedMotif = fixture.motifJson.motif;
    if (result.motif !== expectedMotif) {
      issues.push({
        slug: fixture.slug,
        message: `Motif type mismatch: engine=${result.motif}, seed=${expectedMotif}`,
      });
    }

    for (const key of ['attacker', 'target', 'pinned_to'] as const) {
      const expected = fixture.motifJson[key];
      if (expected && result[key] !== expected) {
        issues.push({
          slug: fixture.slug,
          message: `motif_json.${key}: engine=${result[key] ?? 'missing'}, seed=${expected}`,
        });
      }
    }

    const draft = buildPuzzleFromMotif(motif);
    if (!fixture.alternatePrompt && draft.expected !== fixture.expectedAnswer) {
      issues.push({
        slug: fixture.slug,
        message: `Expected answer mismatch: engine=${draft.expected}, seed=${fixture.expectedAnswer}`,
      });
    }

    if (
      !fixture.alternatePrompt &&
      fixture.nlpPrompt &&
      draft.prompt !== fixture.nlpPrompt
    ) {
      issues.push({
        slug: fixture.slug,
        message: `Prompt drift: engine="${draft.prompt}", seed="${fixture.nlpPrompt}"`,
      });
    }
  }

  return issues;
}
