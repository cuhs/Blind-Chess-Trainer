import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { probeCandidate, type ProbeCandidate } from './lib/puzzle-authoring';

const candidates: ProbeCandidate[] = [
  // --- pins (static) ---
  { slug: 'drill-pin-rook-pawn', fen: '4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1' },
  { slug: 'drill-pin-relative-knight', fen: '3qk3/8/5n2/6B1/8/8/8/4K3 w - - 0 1' },
  { slug: 'drill-pin-bishop-diagonal', fen: '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1' },
  { slug: 'drill-pin-rook-attacker', fen: '4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the pinning rook on?', customExpected: 'e7' },
  { slug: 'drill-pin-queen-behind', fen: '3qk3/8/5n2/6B1/8/8/8/4K3 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the Black Queen on?', customExpected: 'd8' },
  { slug: 'drill-pin-bishop-attacker', fen: '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the pinning bishop on?', customExpected: 'b5' },
  { slug: 'drill-pin-king-behind', fen: '4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the White King pinned to?', customExpected: 'e1' },
  { slug: 'drill-pin-queen-file', fen: '4k3/8/8/8/4q3/8/4P3/4K3 w - - 0 1' },
  { slug: 'drill-pin-bishop-f6', fen: '4k3/8/5n2/4B3/8/8/8/4K3 w - - 0 1' },

  // --- forks ---
  { slug: 'drill-fork-royal-knight', fen: '8/8/8/8/3N4/8/2q1k3/1K6 w - - 0 1' },
  { slug: 'drill-fork-pawn-e4', fen: '8/8/8/3n1b2/4P3/8/8/4K2k w - - 0 1' },
  { slug: 'drill-fork-queen-d5', fen: '4k3/8/3b4/3r3r/4Q3/8/8/4K3 w - - 0 1' },
  { slug: 'drill-fork-queen-target', fen: '4k3/8/3b4/3r3r/4Q3/8/8/4K3 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is one of the forked rooks on?', customExpected: 'd5' },
  { slug: 'drill-fork-knight-queen', fen: 'k7/8/8/8/3N4/8/2q5/K7 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the forked queen on?', customExpected: 'c2' },
  { slug: 'drill-fork-bishop-pair', fen: '8/8/8/3n1b2/4P3/8/8/4K2k w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the forked knight on?', customExpected: 'd5' },

  // --- skewers ---
  { slug: 'drill-skewer-queen-behind', fen: '4k3/8/8/3r4/8/3K4/8/3Q4 w - - 0 1' },
  { slug: 'drill-skewer-bishop-rear', fen: '4k3/8/3r4/8/8/3K4/3B4/8 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the skewered bishop on?', customExpected: 'd2' },
  { slug: 'drill-skewer-rook-attacker', fen: '4k3/8/8/3r4/8/3K4/8/3Q4 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the skewering rook on?', customExpected: 'd5' },

  // --- hanging ---
  { slug: 'drill-hanging-queen-a4', fen: '4k3/8/8/8/q7/8/8/R3K3 w - - 0 1' },
  { slug: 'drill-hanging-knight-f6', fen: '4k3/8/5n2/8/5R2/8/8/4K3 w - - 0 1' },
  { slug: 'drill-hanging-attacker-rook', fen: '4k3/8/8/8/q7/8/8/R3K3 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the attacking rook on?', customExpected: 'a1' },

  // --- fork (queen triple) ---
  { slug: 'drill-fork-queen-f5', fen: '4k3/8/4N3/5q2/4P1N1/8/8/4K3 w - - 0 1' },

  // --- discovered (with moves) ---
  { slug: 'drill-disc-rook-check', fen: '7k/8/8/8/8/6p1/7P/2K4R w - - 0 1', moves: ['hxg3'] },
  { slug: 'drill-disc-knight-check', fen: '7k/8/8/8/8/8/7N/2K4R w - - 0 1', moves: ['Ng4'] },
  { slug: 'drill-disc-queen-rook', fen: 'r3k3/8/8/8/R7/8/8/Q3K3 w - - 0 1', moves: ['Rh4'] },
  { slug: 'drill-disc-rook-attacker', fen: '7k/8/8/8/8/6p1/7P/2K4R w - - 0 1', moves: ['hxg3'], alternatePrompt: true, customPrompt: 'What square does the White Rook attack from?', customExpected: 'h1' },

  // --- story check (narration) ---
  { slug: 'drill-story-check-yes', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves: ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7+'], storyCheck: { color: 'b', expected: 'yes' } },
  { slug: 'drill-story-check-white-no', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'], storyCheck: { color: 'w', expected: 'no' } },
  { slug: 'drill-story-check-scholar', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves: ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5'], storyCheck: { color: 'b', expected: 'no' } },
  { slug: 'drill-story-check-pin', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves: ['e4', 'e5', 'Nf3', 'd6', 'd4', 'Bg4'], storyCheck: { color: 'w', expected: 'no' } },
  { slug: 'drill-story-memorize-fork', fen: '4k3/8/8/5r2/3N4/8/2q5/K7 w - - 0 1', moves: ['Nxf5'] },
  { slug: 'drill-story-memorize-check', fen: '4k3/8/4R3/8/8/8/8/4K3 w - - 0 1', moves: ['Re7+'], storyCheck: { color: 'b', expected: 'yes' } },

  // --- more variety ---
  { slug: 'drill-pin-rook-backrank', fen: '4k3/8/8/8/8/4r3/4P3/4K3 w - - 0 1' },
  { slug: 'drill-fork-bishop-pair-b', fen: '8/8/8/3b3b/4N3/8/8/4K2k w - - 0 1' },
  { slug: 'drill-skewer-bishop-diagonal', fen: '4k3/8/8/8/8/3K4/3B4/4r3 w - - 0 1' },
  { slug: 'drill-hanging-queen-a7', fen: '4k3/q7/8/8/8/8/8/R3K3 w - - 0 1' },
  { slug: 'drill-pin-knight-c3', fen: '4k3/8/8/8/2n5/1B6/8/4K3 w - - 0 1' },
  { slug: 'drill-fork-knight-back', fen: '8/8/8/8/1N6/8/2q1k2r/K7 w - - 0 1' },
  { slug: 'drill-story-italian', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], storyCheck: { color: 'b', expected: 'no' } },
  { slug: 'drill-story-disc-prep', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5'], storyCheck: { color: 'b', expected: 'no' } },
  { slug: 'drill-disc-pawn-queen', fen: '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1', moves: ['d5'], alternatePrompt: true, customPrompt: 'What square is the discovered attack target on?', customExpected: 'g7' },
  { slug: 'drill-pin-attacker-c4', fen: '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the pinning bishop on?', customExpected: 'c4' },
  { slug: 'drill-hanging-rook-e3', fen: '4k3/8/8/8/8/4r3/8/4K3 w - - 0 1' },
  { slug: 'drill-fork-knight-dual', fen: 'k7/8/8/8/3N4/8/2q1r3/K7 w - - 0 1' },
  { slug: 'drill-pin-queen-d8', fen: '3qk3/8/5n2/6B1/8/8/8/4K3 w - - 0 1', alternatePrompt: true, customPrompt: 'What square is the pinned piece on?', customExpected: 'f6' },
  { slug: 'drill-story-london', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6'], storyCheck: { color: 'b', expected: 'no' } },
  { slug: 'drill-story-check-white-yes', fen: 'rnbqkbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1', moves: [], storyCheck: { color: 'w', expected: 'yes' } },
];

const EXISTING_SLUGS = new Set([
  'drill-pin-knight',
  'drill-pin-bishop',
  'drill-fork-knight',
  'drill-skewer-rook',
  'drill-discovered-bishop',
  'drill-hanging-king',
  'drill-story-check',
]);

const fixtures: object[] = [];
const failures: string[] = [];

for (const candidate of candidates) {
  if (EXISTING_SLUGS.has(candidate.slug)) continue;

  const result = probeCandidate(candidate);
  if (!result.ok) {
    failures.push(`${candidate.slug}: ${result.reason}`);
    continue;
  }

  fixtures.push(result.fixture);
}

console.log('FAILURES:', failures.length);
failures.forEach((f) => console.log('  ', f));
console.log('OK:', fixtures.length);

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, 'probe-output.json');
writeFileSync(outPath, JSON.stringify(fixtures, null, 2));
console.log('Wrote', outPath);
