import { ChessBoard } from './ChessBoard';
import { InvisibleGrid } from './InvisibleGrid';
import { BoardCover } from './BoardCover';

interface BlindfoldBoardProps {
  fen: string;
  peekVisible: boolean;
  /** When true, hides grid and coordinates behind a solid panel. */
  fullyCovered?: boolean;
  /** Forwarded to both board variants so peek toggling never resizes. */
  horizontalInset?: number;
}

export function BlindfoldBoard({
  fen,
  peekVisible,
  fullyCovered = false,
  horizontalInset,
}: BlindfoldBoardProps) {
  if (peekVisible) {
    return <ChessBoard fen={fen} horizontalInset={horizontalInset} />;
  }
  if (fullyCovered) {
    return <BoardCover horizontalInset={horizontalInset} />;
  }
  return <InvisibleGrid horizontalInset={horizontalInset} />;
}
