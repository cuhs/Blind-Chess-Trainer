import type { GeneratorId } from './generators/types';

const GENERATOR_DAILY_BUCKET: Record<GeneratorId, string> = {
  coordinate_color: 'other',
  coordinate_neighbor: 'other',
  coordinate_knight_reach: 'other',
  static_recall_2: 'other',
  static_recall_4: 'other',
  static_recall_6: 'other',
  move_update_landing: 'other',
  move_update_vacated: 'other',
  move_update_capture: 'other',
  shallow_calc_state: 'yes-no',
  shallow_calc_attacked: 'yes-no',
  chunk_castled: 'yes-no',
  chunk_fianchetto: 'yes-no',
  chunk_pawn_chain: 'yes-no',
  motif_pin: 'pin',
  motif_fork: 'fork',
  motif_skewer: 'skewer',
  motif_hanging: 'hanging',
  motif_discovered: 'discovered',
  motif_overloaded: 'other',
  story_check_line: 'check',
};

/** Coarse prompt family for bank/peek rows without generator ids. */
export function promptCategoryFromText(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('undefended') || p.includes('attacking ')) return 'hanging';
  if (p.includes('pinned') || p.includes('pinning')) return 'pin';
  if (p.includes('fork')) return 'fork';
  if (p.startsWith('is the')) return 'yes-no';
  if (p.includes('attack from')) return 'discovered';
  if (p.includes('skewer') || p.includes('skewered')) return 'skewer';
  if (p.includes('in check')) return 'check';
  return 'other';
}

export function promptCategoryFromPuzzleId(
  puzzleId: string,
  prompt?: string,
): string {
  const match = puzzleId.match(/^gen-(.+?)-/);
  if (match?.[1] && match[1] in GENERATOR_DAILY_BUCKET) {
    return GENERATOR_DAILY_BUCKET[match[1] as GeneratorId];
  }
  return prompt ? promptCategoryFromText(prompt) : 'other';
}
