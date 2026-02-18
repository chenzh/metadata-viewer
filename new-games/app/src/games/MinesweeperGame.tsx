import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Flag } from 'lucide-react';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export function MinesweeperGame() {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flags, setFlags] = useState(0);

  const initBoard = useCallback(() => {
    const newBoard: Cell[][] = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          newBoard[r][c].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameOver(false);
    setWon(false);
    setFlags(0);
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  const revealCell = (row: number, col: number) => {
    if (gameOver || won) return;
    if (board[row][col].isRevealed || board[row][col].isFlagged) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));

    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return;

      newBoard[r][c].isRevealed = true;

      if (newBoard[r][c].neighborMines === 0 && !newBoard[r][c].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc);
          }
        }
      }
    };

    reveal(row, col);

    if (board[row][col].isMine) {
      setGameOver(true);
      // Reveal all mines
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newBoard[r][c].isMine) {
            newBoard[r][c].isRevealed = true;
          }
        }
      }
    }

    setBoard(newBoard);

    // Check win
    const revealedCount = newBoard.flat().filter(c => c.isRevealed).length;
    if (revealedCount === ROWS * COLS - MINES) {
      setWon(true);
    }
  };

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameOver || won) return;
    if (board[row][col].isRevealed) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlags(f => f + (newBoard[row][col].isFlagged ? 1 : -1));
  };

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return <Flag className="w-4 h-4 text-[#FF3A7A]" />;
    if (!cell.isRevealed) return null;
    if (cell.isMine) return '💣';
    if (cell.neighborMines === 0) return null;
    return cell.neighborMines;
  };

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) return 'bg-white/10 hover:bg-white/20';
    if (cell.isMine) return 'bg-[#FF3A7A]';
    return 'bg-white/5';
  };

  const getNumberColor = (n: number) => {
    const colors = ['', '#3B89FF', '#4ADE80', '#FF3A7A', '#A42EFF', '#F97316', '#00D4FF', '#000', '#6B7280'];
    return colors[n] || '#fff';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">地雷</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">{MINES - flags}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">状态</div>
          <div className="text-2xl">{gameOver ? '💥' : won ? '🎉' : '😊'}</div>
        </div>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => revealCell(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              className={`
                w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center text-sm font-bold
                transition-all duration-200 ${getCellColor(cell)}
              `}
              style={{ color: cell.isRevealed && !cell.isMine ? getNumberColor(cell.neighborMines) : 'inherit' }}
              disabled={gameOver || won}
            >
              {getCellContent(cell)}
            </button>
          ))
        )}
      </div>

      {(gameOver || won) && (
        <div className="text-center">
          <div className="text-xl font-bold text-white mb-2">
            {gameOver ? '游戏结束!' : '恭喜你赢了!'}
          </div>
        </div>
      )}

      <Button onClick={initBoard} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        重新开始
      </Button>

      <div className="text-white/40 text-sm text-center">
        左键揭开，右键标记地雷
      </div>
    </div>
  );
}
