import { ChessBoard } from './ChessBoard';
import { BlindfoldBoard } from './BlindfoldBoard';

interface PuzzleBoardProps {
  fen: string;
  isMemorizing: boolean;
  peekVisible: boolean;
  boardKey?: string;
}

export function PuzzleBoard({
  fen,
  isMemorizing,
  peekVisible,
  boardKey,
}: PuzzleBoardProps) {
  if (isMemorizing) {
    return <ChessBoard key={`memorize-${boardKey ?? fen}`} fen={fen} />;
  }
  return (
    <BlindfoldBoard
      key={`blind-${boardKey ?? fen}`}
      fen={fen}
      peekVisible={peekVisible}
    />
  );
}
