import type { Move } from 'chess.js';

const PIECE_NAMES: Record<string, string> = {
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
  p: 'pawn',
};

const RANK_WORDS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
] as const;

function rankWord(rank: string): string {
  const index = Number.parseInt(rank, 10) - 1;
  return RANK_WORDS[index] ?? rank;
}

function addVariants(target: Set<string>, phrases: string[]): void {
  for (const phrase of phrases) {
    const normalized = phrase.toLowerCase().replace(/\s+/g, ' ').trim();
    if (normalized) {
      target.add(normalized);
    }
  }
}

function addCheckSpokenSuffixes(target: Set<string>, san: string): void {
  const extras: string[] = [];
  if (san.endsWith('#')) {
    extras.push('checkmate', 'mate');
  } else if (san.endsWith('+')) {
    extras.push('check');
  }
  if (!extras.length) return;

  for (const phrase of [...target]) {
    for (const suffix of extras) {
      target.add(`${phrase} ${suffix}`);
    }
  }
}

function squareSpokenForms(square: string): string[] {
  const file = square[0];
  const rank = square[1];
  const spokenRank = rankWord(rank);
  return [
    square,
    `${file}${rank}`,
    `${file} ${rank}`,
    `${file} ${spokenRank}`,
  ];
}

function castlingVariants(san: string): string[] {
  const kingside = san === 'O-O' || san === '0-0';
  if (kingside) {
    return [
      'o-o',
      '0-0',
      'castle',
      'castles',
      'castle kingside',
      'castles kingside',
      'castle short',
      'king side',
      'kingside',
    ];
  }
  return [
    'o-o-o',
    '0-0-0',
    'castle queenside',
    'castles queenside',
    'castle long',
    'queen side',
    'queenside',
  ];
}

function sanOnlyVariants(san: string): string[] {
  const stripped = san.replace(/[+#]+$/, '');
  return [stripped, stripped.toLowerCase()];
}

function pieceAliases(piece: string): string[] {
  const name = PIECE_NAMES[piece] ?? piece;
  if (piece === 'n') {
    return [name, 'night'];
  }
  return [name];
}

/** Common spoken/STT-likely strings for one legal move. */
export function generateSpokenVariants(san: string, move?: Move): string[] {
  if (!san.trim()) {
    return [];
  }

  const variants = new Set<string>();
  addVariants(variants, sanOnlyVariants(san));

  if (/^O-O(-O)?$/i.test(san.replace(/0/g, 'O'))) {
    addVariants(variants, castlingVariants(san.replace(/0/g, 'O')));
    addCheckSpokenSuffixes(variants, san);
    return [...variants];
  }

  if (!move) {
    return [...variants];
  }

  const pieceNames = pieceAliases(move.piece);
  const destForms = squareSpokenForms(move.to);
  const from = move.from;
  const fromFile = from[0];
  const isCapture = move.flags.includes('c') || move.flags.includes('e');

  if (move.piece === 'p') {
    for (const dest of destForms) {
      addVariants(variants, [dest, `pawn ${dest}`, `pawn to ${dest}`]);
    }
    if (isCapture) {
      addVariants(variants, [
        `${fromFile} takes ${move.to}`,
        `pawn takes ${move.to}`,
        `pawn captures ${move.to}`,
      ]);
      for (const dest of destForms) {
        addVariants(variants, [`takes ${dest}`, `captures ${dest}`]);
      }
    }
    addCheckSpokenSuffixes(variants, san);
    return [...variants];
  }

  const sanLower = san.replace(/[+#]+$/, '').toLowerCase();
  addVariants(variants, [sanLower]);

  for (const pieceName of pieceNames) {
    for (const dest of destForms) {
      addVariants(variants, [
        `${pieceName} ${dest}`,
        `${pieceName} to ${dest}`,
      ]);
    }

    if (isCapture) {
      for (const dest of destForms) {
        addVariants(variants, [
          `${pieceName} takes ${dest}`,
          `${pieceName} captures ${dest}`,
        ]);
      }
    }

    addVariants(variants, [
      `${pieceName} ${from}`,
      `${pieceName} on ${from}`,
      `${pieceName} on ${from} to ${move.to}`,
      `${pieceName} ${fromFile}${move.to}`,
      `${fromFile} file`,
      `${fromFile}-file`,
      `${fromFile} file ${pieceName}`,
      from,
    ]);
  }

  addCheckSpokenSuffixes(variants, san);
  return [...variants];
}
