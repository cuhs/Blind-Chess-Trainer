import { ChessBoard } from './ChessBoard';
import { InvisibleGrid } from './InvisibleGrid';

interface BlindfoldBoardProps {
  fen: string;
  peekVisible: boolean;
}

export function BlindfoldBoard({ fen, peekVisible }: BlindfoldBoardProps) {
  if (peekVisible) {
    return <ChessBoard fen={fen} />;
  }
  return <InvisibleGrid />;
}
