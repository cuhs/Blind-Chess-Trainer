import { Chess } from 'chess.js';
import type { Color, Square } from 'chess.js';
import type { Motif, MotifType } from '../../../types/motifs';
import { analyzePosition } from '../../../motifs/analyze-position';
import { detectOverloadedDefenders } from '../../../motifs/divergent';
import { buildInfluenceMap } from '../../../motifs/influence';
import { rankMotifs } from '../../../motifs/sorter';
import { buildPuzzleFromMotif } from '../../../motifs/questions';
import { applyMoves } from '../../../validate';
import type { GeneratedTrainingPuzzle } from '../../generators/types';
import { puzzleId, seedToRng, pickFrom } from '../../seed';

export interface MotifLayout {
  fen: string;
  moves: string[];
  previousFen?: string;
}

const MAX_SYNTH_ATTEMPTS = 48;

const PIN_TEMPLATES: Array<(seed: string) => MotifLayout | null> = [
  () => ({
    fen: '4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '3qk3/8/5n2/6B1/8/8/8/4K3 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/8/8/8/4q3/8/4P3/4K3 w - - 0 1',
    moves: [],
  }),
];

const FORK_TEMPLATES: Array<(seed: string) => MotifLayout | null> = [
  () => ({
    fen: '8/8/8/8/3N4/8/2q1k3/1K6 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '8/8/8/3n1b2/4P3/8/8/4K2k w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/8/3b4/3r3r/4Q3/8/8/4K3 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: 'k7/8/8/8/3N4/8/2q5/K7 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: 'k7/8/8/8/3N4/8/2q1r3/K7 w - - 0 1',
    moves: [],
  }),
];

const SKEWER_TEMPLATES: Array<(seed: string) => MotifLayout | null> = [
  () => ({
    fen: '4k3/8/8/3r4/8/3K4/8/3Q4 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/8/3r4/8/8/3K4/3B4/8 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/8/8/8/8/3K4/3B4/4r3 w - - 0 1',
    moves: [],
  }),
];

const HANGING_TEMPLATES: Array<(seed: string) => MotifLayout | null> = [
  () => ({
    fen: '4k3/8/8/8/q7/8/8/R3K3 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/8/5n2/8/5R2/8/8/4K3 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/q7/8/8/8/8/8/R3K3 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/8/8/8/8/4r3/8/4K3 w - - 0 1',
    moves: [],
  }),
];

const DISCOVERED_TEMPLATES: Array<(seed: string) => MotifLayout | null> = [
  () => ({
    fen: '7k/8/8/8/8/6p1/7P/2K4R w - - 0 1',
    moves: ['hxg3'],
    previousFen: '7k/8/8/8/8/6p1/7P/2K4R w - - 0 1',
  }),
  () => ({
    fen: '7k/8/8/8/8/8/7N/2K4R w - - 0 1',
    moves: ['Ng4'],
    previousFen: '7k/8/8/8/8/8/7N/2K4R w - - 0 1',
  }),
  () => ({
    fen: 'r3k3/8/8/8/R7/8/8/Q3K3 w - - 0 1',
    moves: ['Rh4'],
    previousFen: 'r3k3/8/8/8/R7/8/8/Q3K3 w - - 0 1',
  }),
  () => ({
    fen: '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1',
    moves: ['d5'],
    previousFen: '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1',
  }),
];

const OVERLOADED_TEMPLATES: Array<(seed: string) => MotifLayout | null> = [
  () => ({
    fen: '4k3/8/5N2/5q2/4P1N1/8/8/4K3 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/8/5N2/5q2/4P1N1/8/8/4K3 w - - 0 1',
    moves: [],
  }),
  () => ({
    fen: '4k3/8/4N3/5q2/4P1N1/8/8/4K3 w - - 0 1',
    moves: [],
  }),
];

const STORY_CHECK_FEN_LINES: Array<{ fen: string; moves: string[]; checkColor: Color }> = [
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7+'],
    checkColor: 'b',
  },
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'],
    checkColor: 'w',
  },
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5'],
    checkColor: 'b',
  },
  {
    fen: '4k3/8/4R3/8/8/8/8/4K3 w - - 0 1',
    moves: ['Re7+'],
    checkColor: 'b',
  },
  {
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1',
    moves: [],
    checkColor: 'w',
  },
];

function templatesFor(motifType: MotifType): Array<(seed: string) => MotifLayout | null> {
  switch (motifType) {
    case 'pin':
      return PIN_TEMPLATES;
    case 'fork':
      return FORK_TEMPLATES;
    case 'skewer':
      return SKEWER_TEMPLATES;
    case 'hanging_piece':
      return HANGING_TEMPLATES;
    case 'discovered_attack':
      return DISCOVERED_TEMPLATES;
    case 'overloaded_defender':
      return OVERLOADED_TEMPLATES;
    default:
      return [];
  }
}

function displayFen(layout: MotifLayout): string {
  return layout.moves.length > 0
    ? applyMoves(layout.fen, layout.moves)
    : layout.fen;
}

function previousFenFor(layout: MotifLayout): string | undefined {
  if (layout.previousFen) return layout.previousFen;
  if (layout.moves.length === 0) return undefined;
  if (layout.moves.length === 1) return layout.fen;
  return applyMoves(layout.fen, layout.moves.slice(0, -1));
}

function resolveMotifForType(
  fen: string,
  previousFen: string | undefined,
  motifType: MotifType,
): Motif | null {
  const ranked = analyzePosition(fen, previousFen);
  if (ranked?.type === motifType) return ranked;

  if (motifType === 'overloaded_defender') {
    const influenceMap = buildInfluenceMap(fen);
    if (!influenceMap) return null;
    return rankMotifs(detectOverloadedDefenders(fen, influenceMap));
  }

  return null;
}

export function synthesizeMotifLayout(
  motifType: MotifType,
  seed: string,
): { layout: MotifLayout; motif: Motif } {
  const templates = templatesFor(motifType);

  for (let attempt = 0; attempt < MAX_SYNTH_ATTEMPTS; attempt += 1) {
    const attemptSeed = `${seed}:${attempt}`;
    const rng = seedToRng(attemptSeed);
    const template = templates[Math.floor(rng() * templates.length)];
    if (!template) continue;

    const layout = template(attemptSeed);
    if (!layout) continue;

    let fen: string;
    try {
      fen = displayFen(layout);
      new Chess(fen);
    } catch {
      continue;
    }

    const previousFen = previousFenFor(layout);
    const motif = resolveMotifForType(fen, previousFen, motifType);
    if (motif?.type === motifType) {
      return { layout, motif };
    }
  }

  throw new Error(`Failed to synthesize ${motifType} for seed ${seed}`);
}

export function synthesizeStoryCheckLayout(
  seed: string,
): { layout: MotifLayout; checkColor: Color; expected: 'yes' | 'no' } {
  const rng = seedToRng(`story_check:${seed}`);
  const line = pickFrom(rng, STORY_CHECK_FEN_LINES);
  const display = line.moves.length > 0 ? applyMoves(line.fen, line.moves) : line.fen;
  const chess = new Chess(display);
  const inCheck =
    chess.turn() === line.checkColor && chess.inCheck();
  return {
    layout: { fen: line.fen, moves: line.moves },
    checkColor: line.checkColor,
    expected: inCheck ? 'yes' : 'no',
  };
}

function storyCheckPrompt(color: Color): string {
  return `Is the ${color === 'w' ? 'White' : 'Black'} King in check?`;
}

export function motifLayoutToPuzzle(
  generatorId: string,
  seed: string,
  layout: MotifLayout,
  motif: Motif,
): GeneratedTrainingPuzzle {
  const draft = buildPuzzleFromMotif(motif);
  return {
    id: puzzleId(generatorId, seed),
    fen: layout.fen,
    moves: layout.moves,
    prompt: draft.prompt,
    inputPlaceholder: draft.inputPlaceholder,
    answerType: 'square',
    expected: draft.expected,
    squaresTouched: draft.squaresTouched,
    subtitle: 'Read the position in your head.',
  };
}

export function storyCheckToPuzzle(
  seed: string,
  layout: MotifLayout,
  checkColor: Color,
  expected: 'yes' | 'no',
): GeneratedTrainingPuzzle {
  const squaresTouched = ['e1', 'e8'] as Square[];
  return {
    id: puzzleId('story_check_line', seed),
    fen: layout.fen,
    moves: layout.moves,
    prompt: storyCheckPrompt(checkColor),
    answerType: 'yes-no',
    expected,
    squaresTouched,
    subtitle: 'Follow the line, then verify check.',
  };
}

export function buildMotifPuzzle(
  generatorId: string,
  motifType: MotifType,
  seed: string,
): GeneratedTrainingPuzzle {
  const { layout, motif } = synthesizeMotifLayout(motifType, seed);
  return motifLayoutToPuzzle(generatorId, seed, layout, motif);
}

export function buildStoryCheckPuzzle(seed: string): GeneratedTrainingPuzzle {
  const { layout, checkColor, expected } = synthesizeStoryCheckLayout(seed);
  return storyCheckToPuzzle(seed, layout, checkColor, expected);
}
