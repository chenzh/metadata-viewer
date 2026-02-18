import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const ROWS = 6;
const COLS = 7;

type Player = 'red' | 'yellow' | null;

export function Connect4Game() {
  const [board, setBoard] = useState<Player[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'yellow'>('red');
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);

  const checkWinner = useCallback((currentBoard: Player[][], row: number, col: number): Player => {
    const player = currentBoard[row][col];
    if (!player) return null;

    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal \
      [1, -1], // diagonal /
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      
      // Check positive direction
      for (let i = 1; i < 4; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && currentBoard[r][c] === player) {
          count++;
        } else {
          break;
        }
      }

      // Check negative direction
      for (let i = 1; i < 4; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && currentBoard[r][c] === player) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 4) return player;
    }

    return null;
  }, []);

  const handleClick = (col: number) => {
    if (winner || isDraw) return;

    // Find lowest empty row
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][col]) {
        row = r;
        break;
      }
    }

    if (row === -1) return; // Column is full

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard, row, col);
    if (gameWinner) {
      setWinner(gameWinner);
    } else if (newBoard.every(r => r.every(cell => cell !== null))) {
      setIsDraw(true);
    } else {
      setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
    setIsDraw(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">
          {winner ? '获胜者:' : isDraw ? '平局!' : '当前玩家:'}
        </div>
        <div className="flex items-center justify-center gap-2">
          <div
            className={`w-8 h-8 rounded-full ${
              winner === 'red' || (!winner && currentPlayer === 'red')
                ? 'bg-[#FF3A7A]'
                : winner === 'yellow' || currentPlayer === 'yellow'
                ? 'bg-[#FACC15]'
                : 'bg-gray-500'
            }`}
          />
          <span className="text-white">
            {winner === 'red' ? '红方' : winner === 'yellow' ? '黄方' : isDraw ? '' : currentPlayer === 'red' ? '红方' : '黄方'}
          </span>
        </div>
      </div>

      <div className="bg-[#3B89FF] p-2 rounded-lg">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <button
                key={c}
                onClick={() => handleClick(c)}
                className="w-10 h-10 md:w-12 md:h-12 m-1 rounded-full bg-[#0F0F1A] flex items-center justify-center transition-all hover:bg-[#1a1a2e]"
                disabled={!!winner || isDraw}
              >
                {cell && (
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${
                      cell === 'red' ? 'bg-[#FF3A7A]' : 'bg-[#FACC15]'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      <Button onClick={resetGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        重新开始
      </Button>

      <div className="text-white/40 text-sm text-center">
        点击列放下棋子，四子连线获胜
      </div>
    </div>
  );
}
