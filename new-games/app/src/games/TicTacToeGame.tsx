import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

type Player = 'X' | 'O' | null;

export function TicTacToeGame() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);

  const checkWinner = useCallback((currentBoard: Player[]): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6], // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    return null;
  }, []);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">
          {winner ? '获胜者:' : isDraw ? '平局!' : '当前玩家:'}
        </div>
        <div className="text-4xl">
          {winner ? (winner === 'X' ? '❌' : '⭕') : isDraw ? '🤝' : currentPlayer === 'X' ? '❌' : '⭕'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`
              w-20 h-20 md:w-24 md:h-24 rounded-xl text-4xl md:text-5xl font-bold
              transition-all duration-300 transform
              ${cell ? 'bg-gradient-to-br from-[#FF3A7A] to-[#A42EFF]' : 'bg-white/10 hover:bg-white/20'}
              ${!cell && !winner ? 'hover:scale-105' : ''}
            `}
            disabled={!!cell || !!winner}
          >
            {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
          </button>
        ))}
      </div>

      <Button onClick={resetGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        重新开始
      </Button>

      <div className="text-white/40 text-sm text-center">
        三个连线获胜
      </div>
    </div>
  );
}
