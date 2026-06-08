import type { Square } from '@mindboard/shared';

const CORNERS = new Set<Square>(['a1', 'a8', 'h1', 'h8']);

const EDGES = new Set<Square>([
  'b1', 'c1', 'd1', 'e1', 'f1', 'g1',
  'b8', 'c8', 'd8', 'e8', 'f8', 'g8',
  'a2', 'a3', 'a4', 'a5', 'a6', 'a7',
  'h2', 'h3', 'h4', 'h5', 'h6', 'h7',
]);

export function getThreshold(square: Square): number {
  if (CORNERS.has(square)) return 5;
  if (EDGES.has(square)) return 10;
  return 15;
}
