import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';
import type { PieceCode } from '../boardUtils';

const WHITE_FILL = colors.surfaceContainerLowest;
const BLACK_FILL = colors.onSurface;

const PIECE_PATHS: Record<PieceCode[1], string> = {
  p: 'M12 3.5a3 3 0 0 1 1.7 5.5c2.1.8 3.6 2.9 3.6 5.3 0 1.8-.7 3.3-1.9 4.3H18v2H6v-2h2.6a5.7 5.7 0 0 1-1.9-4.3c0-2.4 1.5-4.5 3.6-5.3A3 3 0 0 1 12 3.5Z',
  n: 'M7 20h10v-2.4c0-1.3.8-2.6 1.6-3.6.8-1.1 1.4-2.2 1.4-3.5 0-3.1-2.5-5.5-5.8-5.5H10l-3 3 2 1.8-2.7 2.7L8 14l3-1.2V17H7v3Z',
  b: 'M12 3.5c2 1.1 3.2 2.7 3.2 4.4 0 1.2-.6 2.3-1.5 3.1 2.1.9 3.5 2.9 3.5 5.2V18H19v2H5v-2h1.8v-1.8c0-2.3 1.4-4.3 3.5-5.2-.9-.8-1.5-1.9-1.5-3.1 0-1.7 1.2-3.3 3.2-4.4Zm1.9 6.1-3.8 3.8',
  r: 'M7 4h2v2h2V4h2v2h2V4h2v6l-1.5 1.5V18H18v2H6v-2h2.5v-6.5L7 10V4Z',
  q: 'M5.5 7.5 9 11l3-6 3 6 3.5-3.5L17 18h2v2H5v-2h2L5.5 7.5Z',
  k: 'M11 3h2v3h3v2h-3v2.5c2.6.5 4.5 2.7 4.5 5.4V18H19v2H5v-2h1.5v-2.1c0-2.7 1.9-4.9 4.5-5.4V8H8V6h3V3Z',
};

interface ChessPieceProps {
  piece: PieceCode;
  size: number;
}

export function ChessPiece({ piece, size }: ChessPieceProps) {
  const isWhite = piece[0] === 'w';
  const pieceType = piece[1] as PieceCode[1];
  const pieceSize = Math.floor(size * 0.68);
  const fill = isWhite ? WHITE_FILL : BLACK_FILL;
  const stroke = BLACK_FILL;
  
  return (
    <Svg width={pieceSize} height={pieceSize} viewBox="0 0 24 24">
      <Path
        d={PIECE_PATHS[pieceType]}
        fill={fill}
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={isWhite ? 1.8 : 0.8}
      />
    </Svg>
  );
}
