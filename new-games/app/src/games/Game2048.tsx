import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const GRID_SIZE = 4;

const getColor = (value: number): string => {
  const colors: Record<number, string> = {
    2: '#EEE4DA',
    4: '#EDE0C8',
    8: '#F2B179',
    16: '#F59563',
    32: '#F67C5F',
    64: '#F65E3B',
    128: '#EDCF72',
    256: '#EDCC61',
    512: '#EDC850',
    1024: '#EDC53F',
    2048: '#EDC22E',
  };
  return colors[value] || '#3C3A32';
};

const getTextColor = (value: number): string => {
  return value <= 4 ? '#776E65' : '#F9F6F2';
};

export function Game2048() {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const addRandomTile = useCallback((currentBoard: number[][]) => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentBoard[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }, []);

  const initGame = useCallback(() => {
    const newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, [addRandomTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    const newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const slide = (arr: number[]): [number[], number] => {
      let newArr = arr.filter(val => val !== 0);
      let scoreGain = 0;
      for (let i = 0; i < newArr.length - 1; i++) {
        if (newArr[i] === newArr[i + 1]) {
          newArr[i] *= 2;
          scoreGain += newArr[i];
          if (newArr[i] === 2048) setWon(true);
          newArr.splice(i + 1, 1);
        }
      }
      while (newArr.length < GRID_SIZE) {
        newArr.push(0);
      }
      return [newArr, scoreGain];
    };

    if (direction === 'left' || direction === 'right') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const row = direction === 'left' ? newBoard[r] : [...newBoard[r]].reverse();
        const [newRow, scoreGain] = slide(row);
        if (direction === 'right') newRow.reverse();
        if (JSON.stringify(newRow) !== JSON.stringify(newBoard[r])) moved = true;
        newBoard[r] = newRow;
        newScore += scoreGain;
      }
    } else {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = newBoard.map(row => row[c]);
        const processedCol = direction === 'up' ? col : [...col].reverse();
        const [newCol, scoreGain] = slide(processedCol);
        if (direction === 'down') newCol.reverse();
        if (JSON.stringify(newCol) !== JSON.stringify(col)) moved = true;
        for (let r = 0; r < GRID_SIZE; r++) {
          newBoard[r][c] = newCol[r];
        }
        newScore += scoreGain;
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);

      // Check game over
      const hasEmpty = newBoard.some(row => row.some(cell => cell === 0));
      if (!hasEmpty) {
        let canMove = false;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (c < GRID_SIZE - 1 && newBoard[r][c] === newBoard[r][c + 1]) canMove = true;
            if (r < GRID_SIZE - 1 && newBoard[r][c] === newBoard[r + 1][c]) canMove = true;
          }
        }
        if (!canMove) setGameOver(true);
      }
    }
  }, [board, gameOver, score, addRandomTile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); move('up'); break;
        case 'ArrowDown': e.preventDefault(); move('down'); break;
        case 'ArrowLeft': e.preventDefault(); move('left'); break;
        case 'ArrowRight': e.preventDefault(); move('right'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">得分</div>
          <div className="text-2xl font-bold text-[#FACC15]">{score}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">目标</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">2048</div>
        </div>
      </div>

      <div className="grid gap-2 bg-[#BBADA0] p-3 rounded-lg">
        {board.map((row, r) => (
          <div key={r} className="flex gap-2">
            {row.map((cell, c) => (
              <div
                key={c}
                className="w-16 h-16 md:w-20 md:h-20 rounded flex items-center justify-center text-xl md:text-2xl font-bold transition-all duration-200"
                style={{
                  backgroundColor: cell === 0 ? 'rgba(238, 228, 218, 0.35)' : getColor(cell),
                  color: getTextColor(cell),
                }}
              >
                {cell !== 0 ? cell : ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <Button onClick={() => move('up')} variant="outline" className="border-white/20 text-white">↑</Button>
        <div />
        <Button onClick={() => move('left')} variant="outline" className="border-white/20 text-white">←</Button>
        <Button onClick={() => move('down')} variant="outline" className="border-white/20 text-white">↓</Button>
        <Button onClick={() => move('right')} variant="outline" className="border-white/20 text-white">→</Button>
      </div>

      {(gameOver || won) && (
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {won ? '🎉 恭喜达到2048!' : '💥 游戏结束!'}
          </div>
          <div className="text-white/60">最终得分: {score}</div>
        </div>
      )}

      <Button onClick={initGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        新游戏
      </Button>

      <div className="text-white/40 text-sm text-center">
        使用方向键移动，相同数字合并
      </div>
    </div>
  );
}
