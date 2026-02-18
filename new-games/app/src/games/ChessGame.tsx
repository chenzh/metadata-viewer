import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

type Piece = {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
} | null;

const INITIAL_BOARD: Piece[][] = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ],
  Array(8).fill({ type: 'pawn', color: 'black' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'pawn', color: 'white' }),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ],
];

const PIECE_SYMBOLS: Record<string, string> = {
  'king-white': '♔',
  'queen-white': '♕',
  'rook-white': '♖',
  'bishop-white': '♗',
  'knight-white': '♘',
  'pawn-white': '♙',
  'king-black': '♚',
  'queen-black': '♛',
  'rook-black': '♜',
  'bishop-black': '♝',
  'knight-black': '♞',
  'pawn-black': '♟',
};

export function ChessGame() {
  const [board, setBoard] = useState<Piece[][]>(INITIAL_BOARD.map(row => [...row]));
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[fromRow + direction][fromCol]) return true;
        }
        if (colDiff === 1 && toRow === fromRow + direction && targetPiece) return true;
        return false;

      case 'rook':
        return (rowDiff === 0 || colDiff === 0) && isPathClear(fromRow, fromCol, toRow, toCol);

      case 'bishop':
        return rowDiff === colDiff && isPathClear(fromRow, fromCol, toRow, toCol);

      case 'queen':
        return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) && isPathClear(fromRow, fromCol, toRow, toCol);

      case 'knight':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case 'king':
        return rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
  };

  const isPathClear = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
    
    let row = fromRow + rowStep;
    let col = fromCol + colStep;
    
    while (row !== toRow || col !== toCol) {
      if (board[row][col]) return false;
      row += rowStep;
      col += colStep;
    }
    
    return true;
  };

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col];

    if (selectedPiece) {
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = newBoard[selectedPiece.row][selectedPiece.col];
        newBoard[selectedPiece.row][selectedPiece.col] = null;
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      }
      setSelectedPiece(null);
    } else if (piece && piece.color === currentPlayer) {
      setSelectedPiece({ row, col });
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD.map(row => [...row]));
    setSelectedPiece(null);
    setCurrentPlayer('white');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">当前玩家</div>
        <div className={`text-2xl font-bold ${currentPlayer === 'white' ? 'text-white' : 'text-gray-400'}`}>
          {currentPlayer === 'white' ? '⚪ 白方' : '⚫ 黑方'}
        </div>
      </div>

      <div className="grid grid-cols-8 gap-0 border-2 border-white/20 rounded-lg overflow-hidden">
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isSelected = selectedPiece?.row === r && selectedPiece?.col === c;
            const isLight = (r + c) % 2 === 0;
            
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl
                  transition-all
                  ${isLight ? 'bg-[#F0D9B5]' : 'bg-[#B58863]'}
                  ${isSelected ? 'ring-2 ring-[#FF3A7A] ring-inset' : ''}
                `}
              >
                {piece && (
                  <span className={piece.color === 'white' ? 'text-white' : 'text-black'}>
                    {PIECE_SYMBOLS[`${piece.type}-${piece.color}`]}
                  </span>
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
        点击棋子选择，再点击目标位置移动
      </div>
    </div>
  );
}
