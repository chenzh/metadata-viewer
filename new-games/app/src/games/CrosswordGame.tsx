import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Lightbulb } from 'lucide-react';

const PUZZLE = {
  words: [
    { word: 'REACT', clue: 'Popular JavaScript library', row: 0, col: 0, direction: 'across' },
    { word: 'GAME', clue: 'Fun activity', row: 2, col: 2, direction: 'across' },
    { word: 'CODE', clue: 'Programming instructions', row: 4, col: 0, direction: 'across' },
    { word: 'WEB', clue: 'Internet', row: 0, col: 2, direction: 'down' },
    { word: 'APP', clue: 'Application', row: 2, col: 4, direction: 'down' },
  ],
  size: 5,
};

export function CrosswordGame() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [solution, setSolution] = useState<string[][]>([]);
  const [selectedClue, setSelectedClue] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const initGame = useCallback(() => {
    const newGrid = Array(PUZZLE.size).fill(null).map(() => Array(PUZZLE.size).fill(''));
    const newSolution = Array(PUZZLE.size).fill(null).map(() => Array(PUZZLE.size).fill(''));

    PUZZLE.words.forEach(({ word, row, col, direction }) => {
      for (let i = 0; i < word.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;
        newSolution[r][c] = word[i];
      }
    });

    setGrid(newGrid);
    setSolution(newSolution);
    setSelectedClue(null);
    setCompleted(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCellChange = (row: number, col: number, value: string) => {
    if (value.length > 1) return;
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);

    // Check completion
    let isComplete = true;
    for (let r = 0; r < PUZZLE.size; r++) {
      for (let c = 0; c < PUZZLE.size; c++) {
        if (solution[r][c] && newGrid[r][c] !== solution[r][c]) {
          isComplete = false;
          break;
        }
      }
    }
    if (isComplete) {
      setCompleted(true);
    }
  };

  const isPartOfWord = (row: number, col: number) => {
    return solution[row][col] !== '';
  };

  const isPartOfSelectedClue = (row: number, col: number) => {
    if (selectedClue === null) return false;
    const clue = PUZZLE.words[selectedClue];
    if (clue.direction === 'across') {
      return row === clue.row && col >= clue.col && col < clue.col + clue.word.length;
    } else {
      return col === clue.col && row >= clue.row && row < clue.row + clue.word.length;
    }
  };

  const showHint = () => {
    if (selectedClue === null) return;
    const clue = PUZZLE.words[selectedClue];
    for (let i = 0; i < clue.word.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      if (!grid[r][c]) {
        handleCellChange(r, c, clue.word[i]);
        break;
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">状态</div>
        <div className="text-2xl">{completed ? '🎉' : '📝'}</div>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${PUZZLE.size}, 1fr)` }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isActive = isPartOfWord(r, c);
            const isHighlighted = isPartOfSelectedClue(r, c);
            
            return (
              <div key={`${r}-${c}`} className="relative">
                {isActive ? (
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(r, c, e.target.value)}
                    onFocus={() => {
                      const clueIndex = PUZZLE.words.findIndex(w =>
                        (w.direction === 'across' && w.row === r && c >= w.col && c < w.col + w.word.length) ||
                        (w.direction === 'down' && w.col === c && r >= w.row && r < w.row + w.word.length)
                      );
                      if (clueIndex !== -1) setSelectedClue(clueIndex);
                    }}
                    className={`
                      w-10 h-10 md:w-12 md:h-12 text-center text-lg font-bold uppercase
                      rounded border-2 outline-none transition-all
                      ${isHighlighted
                        ? 'bg-[#FF3A7A]/30 border-[#FF3A7A] text-white'
                        : 'bg-white border-gray-300 text-black'
                      }
                    `}
                    maxLength={1}
                  />
                ) : (
                  <div className="w-10 h-10 md:w-12 md:h-12" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Clues */}
      <div className="w-full max-w-sm">
        <div className="text-white/60 text-sm mb-2">提示</div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {PUZZLE.words.map((word, i) => (
            <button
              key={i}
              onClick={() => setSelectedClue(i)}
              className={`w-full text-left p-2 rounded text-sm ${
                selectedClue === i
                  ? 'bg-[#FF3A7A]/20 border border-[#FF3A7A]'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-[#FF3A7A] font-bold">{i + 1}.</span>
              <span className="text-white/60 ml-1">({word.direction})</span>
              <span className="text-white ml-2">{word.clue}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={showHint} variant="outline" className="border-white/20 text-white">
          <Lightbulb className="w-4 h-4 mr-2" />
          提示
        </Button>
        <Button onClick={initGame} variant="outline" className="border-white/20 text-white">
          <RotateCcw className="w-4 h-4 mr-2" />
          新游戏
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        根据提示填入单词
      </div>
    </div>
  );
}
