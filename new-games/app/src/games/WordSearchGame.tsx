import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const WORDS = ['REACT', 'GAME', 'CODE', 'WEB', 'APP', 'FUN', 'PLAY', 'WIN'];
const GRID_SIZE = 10;

export function WordSearchGame() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordPositions, setWordPositions] = useState<Map<string, { r: number; c: number }[]>>(new Map());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<{ r: number; c: number }[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const initGame = useCallback(() => {
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const positions = new Map<string, { r: number; c: number }[]>();

    // Place words
    for (const word of WORDS) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
        const reverse = Math.random() > 0.5;
        const wordArr = reverse ? word.split('').reverse() : word.split('');
        
        let r: number, c: number;
        
        if (direction === 0) {
          r = Math.floor(Math.random() * GRID_SIZE);
          c = Math.floor(Math.random() * (GRID_SIZE - word.length));
        } else if (direction === 1) {
          r = Math.floor(Math.random() * (GRID_SIZE - word.length));
          c = Math.floor(Math.random() * GRID_SIZE);
        } else {
          r = Math.floor(Math.random() * (GRID_SIZE - word.length));
          c = Math.floor(Math.random() * (GRID_SIZE - word.length));
        }

        const wordPositions: { r: number; c: number }[] = [];
        let canPlace = true;

        for (let i = 0; i < word.length; i++) {
          const nr = direction === 0 ? r : direction === 1 ? r + i : r + i;
          const nc = direction === 0 ? c + i : direction === 1 ? c : c + i;
          
          if (newGrid[nr][nc] && newGrid[nr][nc] !== wordArr[i]) {
            canPlace = false;
            break;
          }
          wordPositions.push({ r: nr, c: nc });
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const { r: nr, c: nc } = wordPositions[i];
            newGrid[nr][nc] = wordArr[i];
          }
          positions.set(word, wordPositions);
          placed = true;
        }
        attempts++;
      }
    }

    // Fill empty cells
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newGrid[r][c]) {
          newGrid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
    setWordPositions(positions);
    setFoundWords(new Set());
    setSelection([]);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleMouseDown = (r: number, c: number) => {
    setIsSelecting(true);
    setSelection([{ r, c }]);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (!isSelecting) return;
    
    const start = selection[0];
    const dr = r - start.r;
    const dc = c - start.c;
    
    // Only allow straight lines
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      const newSelection: { r: number; c: number }[] = [];
      const steps = Math.max(Math.abs(dr), Math.abs(dc));
      const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
      const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
      
      for (let i = 0; i <= steps; i++) {
        newSelection.push({ r: start.r + i * stepR, c: start.c + i * stepC });
      }
      setSelection(newSelection);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    
    // Check if selection matches a word
    const selectedWord = selection.map(pos => grid[pos.r][pos.c]).join('');
    const reversedWord = selection.map(pos => grid[pos.r][pos.c]).reverse().join('');
    
    for (const word of WORDS) {
      if (!foundWords.has(word) && (selectedWord === word || reversedWord === word)) {
        setFoundWords(prev => new Set([...prev, word]));
        break;
      }
    }
    
    setSelection([]);
  };

  const isSelected = (r: number, c: number) => {
    return selection.some(pos => pos.r === r && pos.c === c);
  };

  const isPartOfFoundWord = (r: number, c: number) => {
    for (const [word, positions] of wordPositions) {
      if (foundWords.has(word)) {
        if (positions.some(pos => pos.r === r && pos.c === c)) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">找到单词</div>
        <div className="text-2xl font-bold text-[#4ADE80]">{foundWords.size} / {WORDS.length}</div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
        {WORDS.map(word => (
          <span
            key={word}
            className={`px-2 py-1 rounded text-sm font-bold ${
              foundWords.has(word)
                ? 'bg-green-500/20 text-green-400 line-through'
                : 'bg-white/10 text-white'
            }`}
          >
            {word}
          </span>
        ))}
      </div>

      <div
        className="grid gap-1 select-none"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        onMouseLeave={() => setIsSelecting(false)}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
              onMouseUp={handleMouseUp}
              className={`
                w-8 h-8 md:w-10 md:h-10 rounded text-sm font-bold
                transition-all duration-150
                ${isPartOfFoundWord(r, c)
                  ? 'bg-green-500 text-white'
                  : isSelected(r, c)
                    ? 'bg-[#FF3A7A] text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }
              `}
            >
              {cell}
            </button>
          ))
        )}
      </div>

      {foundWords.size === WORDS.length && (
        <div className="text-center">
          <div className="text-2xl font-bold text-[#FACC15]">🎉 恭喜完成!</div>
        </div>
      )}

      <Button onClick={initGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        新游戏
      </Button>

      <div className="text-white/40 text-sm text-center">
        按住并拖动选择单词
      </div>
    </div>
  );
}
