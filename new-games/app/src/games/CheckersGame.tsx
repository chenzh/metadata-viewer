import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

type Piece = {
  color: 'red' | 'black';
  isKing: boolean;
} | null;

const INITIAL_BOARD: Piece[][] = Array(8).fill(null).map((_, row) =>
  Array(8).fill(null).map((_, col) => {
    if ((row + col) % 2 === 1) {
      if (row < 3) return { color: 'black', isKing: false };
      if (row > 4) return { color: 'red', isKing: false };
    }
    return null;
  })
);

export function CheckersGame() {
  const [board, setBoard] = useState<Piece[][]>(INITIAL_BOARD.map(row => [...row]));
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'black'>('red');
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([]);

  const getValidMoves = useCallback((row: number, col: number): { row: number; col: number }[] => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: { row: number; col: number }[] = [];
    const directions = piece.isKing || piece.color === 'red' ? [-1] : [];
    if (piece.isKing || piece.color === 'black') directions.push(1);

    directions.forEach(dRow => {
      [-1, 1].forEach(dCol => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (!board[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol });
          } else if (board[newRow][newCol]?.color !== piece.color) {
            const jumpRow = newRow + dRow;
            const jumpCol = newCol + dCol;
            if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8 && !board[jumpRow][jumpCol]) {
              moves.push({ row: jumpRow, col: jumpCol });
            }
          }
        }
      });
    });

    return moves;
  }, [board]);

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col];

    if (selectedPiece) {
      const isValidMove = validMoves.some(m => m.row === row && m.col === col);
      
      if (isValidMove) {
        const newBoard = board.map(r => [...r]);
        const movingPiece = newBoard[selectedPiece.row][selectedPiece.col];
        newBoard[row][col] = movingPiece;
        newBoard[selectedPiece.row][selectedPiece.col] = null;

        // Remove jumped piece
        const midRow = (selectedPiece.row + row) / 2;
        const midCol = (selectedPiece.col + col) / 2;
        if (Math.abs(row - selectedPiece.row) === 2) {
          newBoard[midRow][midCol] = null;
        }

        // Promote to king
        if (movingPiece && !movingPiece.isKing) {
          if (movingPiece.color === 'red' && row === 0) {
            movingPiece.isKing = true;
          } else if (movingPiece.color === 'black' && row === 7) {
            movingPiece.isKing = true;
          }
        }

        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red');
      }
      setSelectedPiece(null);
      setValidMoves([]);
    } else if (piece && piece.color === currentPlayer) {
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(row, col));
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD.map(row => [...row]));
    setSelectedPiece(null);
    setValidMoves([]);
    setCurrentPlayer('red');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">当前玩家</div>
        <div className={`text-2xl font-bold ${currentPlayer === 'red' ? 'text-[#FF3A7A]' : 'text-gray-400'}`}>
          {currentPlayer === 'red' ? '🔴 红方' : '⚫ 黑方'}
        </div>
      </div>

      <div className="grid grid-cols-8 gap-0 border-2 border-white/20 rounded-lg overflow-hidden">
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isSelected = selectedPiece?.row === r && selectedPiece?.col === c;
            const isValidMove = validMoves.some(m => m.row === r && m.col === c);
            const isPlayable = (r + c) % 2 === 1;
            
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  w-8 h-8 md:w-10 md:h-10 flex items-center justify-center
                  transition-all
                  ${isPlayable ? 'bg-[#8B4513]' : 'bg-[#D2B48C]'}
                  ${isSelected ? 'ring-2 ring-[#FF3A7A] ring-inset' : ''}
                  ${isValidMove ? 'bg-green-500/50' : ''}
                `}
              >
                {piece && (
                  <div
                    className={`
                      w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center
                      ${piece.color === 'red' ? 'bg-[#FF3A7A]' : 'bg-gray-800'}
                      ${piece.isKing ? 'ring-2 ring-[#FACC15]' : ''}
                    `}
                  >
                    {piece.isKing && <span className="text-xs">👑</span>}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      <Button onClick={resetGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        重新开始
      </Button>

      <div className="text-white/40 text-sm text-center">
        点击棋子选择，绿色格子表示可移动位置
      </div>
    </div>
  );
}
