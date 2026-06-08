import { useWindowDimensions } from 'react-native';
import { spacing, touch } from '@/theme';

export const LABEL_GUTTER = 18;

/** BoardFrame padding (xs) + left/right borders. */
export const BOARD_FRAME_INSET = spacing.xs * 2 + touch.strokeWidth * 2;

/** Card padding (md) + left/right borders. */
export const BOARD_CARD_INSET = spacing.md * 2 + touch.strokeWidth * 2;

export interface BoardDimensionOptions {
  /** Left gutter for rank labels; pass 0 when labels are hidden. */
  labelGutter?: number;
  /** Extra horizontal inset from an outer frame (padding + borders). */
  frameInset?: number;
  /** Parent horizontal inset already applied (default: screen margins). */
  horizontalInset?: number;
}

export function useBoardDimensions(
  options: BoardDimensionOptions | number = {},
) {
  const opts = typeof options === 'number' ? { labelGutter: options } : options;
  const {
    labelGutter = LABEL_GUTTER,
    frameInset = 0,
    horizontalInset = spacing.marginMobile * 2,
  } = opts;

  const { width } = useWindowDimensions();
  const rawSize = width - horizontalInset - labelGutter - frameInset;
  const squareSize = Math.floor(rawSize / 8);
  const boardSize = squareSize * 8;

  return { squareSize, boardSize, labelGutter };
}
