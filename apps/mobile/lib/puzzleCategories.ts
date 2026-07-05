/** Coarse prompt family — used to spread motif types across a daily session. */
export function puzzlePromptCategory(prompt: string): string {
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

export function hashDateKey(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function generatedPromptCategoryFromId(puzzleId: string, prompt: string): string {
  if (puzzleId.includes('motif_pin')) return 'pin';
  if (puzzleId.includes('motif_fork')) return 'fork';
  if (puzzleId.includes('motif_hanging')) return 'hanging';
  if (puzzleId.includes('motif_skewer')) return 'skewer';
  if (puzzleId.includes('motif_discovered')) return 'discovered';
  if (puzzleId.includes('story_check')) return 'check';
  return puzzlePromptCategory(prompt);
}
