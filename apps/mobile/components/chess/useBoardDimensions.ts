import { useWindowDimensions } from 'react-native';
import { spacing } from '@/theme';

export const LABEL_GUTTER = 18;

export function useBoardDimensions(extraGutter = LABEL_GUTTER) {
  const { width } = useWindowDimensions();
  const rawSize = width - spacing.marginMobile * 2 - extraGutter;
  const squareSize = Math.floor(rawSize / 8);
  const boardSize = squareSize * 8;

  return { squareSize, boardSize, labelGutter: extraGutter };
}
