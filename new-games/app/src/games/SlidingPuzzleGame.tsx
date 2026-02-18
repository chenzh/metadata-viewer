import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy } from 'lucide-react';

const GRID_SIZE = 4;

export function SlidingPuzzleGame() {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);

  const initGame = useCallback(() => {
    // Create solved puzzle
    const solved = Array.from({ length: GRID_SIZE * GRID_SIZE - 1 }, (_, i) => i + 1);
    solved.push(0); // 0 represents empty tile

    // Shuffle by making random valid moves
    let shuffled = [...solved];
    let emptyIndex = GRID_SIZE * GRID_SIZE - 1;
    
    for (let i = 0; i < 200; i++) {
      const neighbors = getNeighbors(emptyIndex);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
;
      [shuffled[emptyIndex], shuffled[randomNeighbor]] = [shuffled[randomNeighbor], shuffled[emptyIndex]];
      emptyIndex = randomNeighbor;
    }

    setTiles(shuffled);
    setMoves(0);
    setCompleted(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const getNeighbors = (index: number): number[] => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const neighbors: number[] = [];

    if (row > 0) neighbors.push(index - GRID_SIZE);
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
    if (col > 0) neighbors.push(index - 1);
    if (col < GRID_SIZE - 1) neighbors.push(index + 1);

    return neighbors;
  };

  const handleTileClick = (index: number) => {
    if (completed) return;

    const emptyIndex = tiles.indexOf(0);
    const neighbors = getNeighbors(emptyIndex);

    if (neighbors.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoves(m => m + 1);

      // Check if solved
      const isSolved = newTiles.every((tile, i) => 
        i === newTiles.length - 1 ? tile === 0 : tile === i + 1
      );
      if (isSolved) {
        setCompleted(true);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">步数</div>
          <div className="text-2xl font-bold text-[#A42EFF]">{moves}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">状态</div>
          <div className="text-2xl">{completed ? '🏆' : '🧩'}</div>
        </div>
      </div>

      <div 
        className="grid gap-1 bg-white/10 p-2 rounded-lg"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            className={`
              w-14 h-14 md:w-16 md:h-16 rounded-lg text-xl font-bold
              transition-all duration-200
              ${tile === 0 
                ? 'bg-transparent cursor-default' 
                : 'bg-gradient-to-br from-[#FF3A7A] to-[#A42EFF] text-white hover:scale-105 active:scale-95'
              }
            `}
            disabled={tile === 0 || completed}
          >
            {tile !== 0 && tile}
          </button>
        ))}
      </div>

      {completed && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-white mb-2">
            <Trophy className="w-6 h-6 text-[#FACC15]" />
            恭喜完成!
          </div>
          <div className="text-white/60">用了 {moves} 步</div>
        </div>
      )}

      <Button onClick={initGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        新游戏
      </Button>

      <div className="text-white/40 text-sm text-center">
        点击数字移动到空白位置，按顺序排列
      </div>
    </div>
  );
}
