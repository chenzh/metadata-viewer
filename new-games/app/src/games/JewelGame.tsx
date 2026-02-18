import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const GRID_SIZE = 8;
const JEWELS = ['💎', '🔷', '🔶', '💚', '💜', '❤️', '🧡'];

export function JewelGame() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  const initGame = useCallback(() => {
    const newGrid: string[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      newGrid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        newGrid[r][c] = JEWELS[Math.floor(Math.random() * JEWELS.length)];
      }
    }
    setGrid(newGrid);
    setScore(0);
    setSelectedCell(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const findMatches = (currentGrid: string[][]) => {
    const matches: { r: number; c: number }[] = [];

    // Horizontal matches
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        if (currentGrid[r][c] === currentGrid[r][c + 1] && currentGrid[r][c] === currentGrid[r][c + 2]) {
          matches.push({ r, c }, { r, c: c + 1 }, { r, c: c + 2 });
        }
      }
    }

    // Vertical matches
    for (let r = 0; r < GRID_SIZE - 2; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === currentGrid[r + 1][c] && currentGrid[r][c] === currentGrid[r + 2][c]) {
          matches.push({ r, c }, { r: r + 1, c }, { r: r + 2, c });
        }
      }
    }

    return matches;
  };

  const removeMatches = useCallback(() => {
    setGrid(currentGrid => {
      const matches = findMatches(currentGrid);
      if (matches.length === 0) return currentGrid;

      const newGrid = currentGrid.map(row => [...row]);
      matches.forEach(({ r, c }) => {
        newGrid[r][c] = '';
      });

      setScore(s => s + matches.length * 10);

      // Drop jewels
      for (let c = 0; c < GRID_SIZE; c++) {
        let writeRow = GRID_SIZE - 1;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (newGrid[r][c]) {
            newGrid[writeRow][c] = newGrid[r][c];
            if (writeRow !== r) newGrid[r][c] = '';
            writeRow--;
          }
        }
        // Fill empty spaces
        for (let r = writeRow; r >= 0; r--) {
          newGrid[r][c] = JEWELS[Math.floor(Math.random() * JEWELS.length)];
        }
      }

      return newGrid;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(removeMatches, 500);
    return () => clearInterval(interval);
  }, [removeMatches]);

  const handleCellClick = (r: number, c: number) => {
    if (!selectedCell) {
      setSelectedCell({ r, c });
      return;
    }

    const dr = Math.abs(r - selectedCell.r);
    const dc = Math.abs(c - selectedCell.c);

    if (dr + dc === 1) {
      // Adjacent - swap
      const newGrid = grid.map(row => [...row]);
      [newGrid[r][c], newGrid[selectedCell.r][selectedCell.c]] = 
        [newGrid[selectedCell.r][selectedCell.c], newGrid[r][c]];
      
      // Check if swap creates a match
      const matches = findMatches(newGrid);
      if (matches.length > 0) {
        setGrid(newGrid);
      }
    }

    setSelectedCell(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm">得分</div>
        <div className="text-2xl font-bold text-[#A42EFF]">{score}</div>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={`
                w-10 h-10 md:w-12 md:h-12 rounded-lg text-xl md:text-2xl
                transition-all duration-200
                ${selectedCell?.r === r && selectedCell?.c === c
                  ? 'bg-[#FF3A7A] scale-110'
                  : 'bg-white/10 hover:bg-white/20'
                }
              `}
            >
              {cell}
            </button>
          ))
        )}
      </div>

      <Button onClick={initGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        新游戏
      </Button>

      <div className="text-white/40 text-sm text-center">
        点击相邻宝石交换，三个连线消除
      </div>
    </div>
  );
}
