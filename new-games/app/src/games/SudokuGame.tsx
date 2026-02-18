import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const generateSudoku = () => {
  // Simple sudoku puzzle (0 represents empty)
  const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];
  return puzzle;
};

const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

export function SudokuGame() {
  const [board, setBoard] = useState<number[][]>([]);
  const [original, setOriginal] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState(0);

  const initGame = useCallback(() => {
    const puzzle = generateSudoku();
    setBoard(puzzle.map(row => [...row]));
    setOriginal(puzzle.map(row => row.map(cell => cell !== 0)));
    setSelectedCell(null);
    setCompleted(false);
    setErrors(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCellClick = (row: number, col: number) => {
    if (original[row][col]) return;
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (original[row][col]) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    // Check if correct
    if (num !== 0 && num !== solution[row][col]) {
      setErrors(e => e + 1);
    }

    // Check completion
    const isComplete = newBoard.every((r, i) =>
      r.every((cell, j) => cell === solution[i][j])
    );
    if (isComplete) {
      setCompleted(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">错误</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">{errors}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">状态</div>
          <div className="text-2xl">{completed ? '🎉' : '🧩'}</div>
        </div>
      </div>

      <div className="grid gap-0.5 bg-white/20 p-1 rounded-lg">
        {board.map((row, r) => (
          <div key={r} className="flex gap-0.5">
            {row.map((cell, c) => {
              const isSelected = selectedCell?.row === r && selectedCell?.col === c;
              const isOriginal = original[r]?.[c];
              const isSameRow = selectedCell?.row === r;
              const isSameCol = selectedCell?.col === c;
              const isSameBox = selectedCell &&
                Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
                Math.floor(selectedCell.col / 3) === Math.floor(c / 3);
              const isHighlighted = isSameRow || isSameCol || isSameBox;

              return (
                <button
                  key={c}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg font-semibold
                    transition-all duration-150
                    ${isOriginal ? 'bg-white/10 text-white' : 'bg-white/5 text-[#3B89FF]'}
                    ${isSelected ? 'ring-2 ring-[#FF3A7A] bg-[#FF3A7A]/20' : ''}
                    ${isHighlighted && !isSelected ? 'bg-white/10' : ''}
                    ${(c + 1) % 3 === 0 && c !== 8 ? 'mr-0.5' : ''}
                    ${(r + 1) % 3 === 0 && r !== 8 ? 'mb-0.5' : ''}
                  `}
                >
                  {cell !== 0 ? cell : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
          <Button
            key={num}
            onClick={() => handleNumberInput(num)}
            variant="outline"
            className="w-10 h-10 p-0 border-white/20 text-white hover:bg-white/10"
            disabled={!selectedCell || completed}
          >
            {num === 0 ? '×' : num}
          </Button>
        ))}
      </div>

      {completed && (
        <div className="text-center">
          <div className="text-xl font-bold text-white">恭喜完成!</div>
          <div className="text-white/60">错误次数: {errors}</div>
        </div>
      )}

      <Button onClick={initGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        新游戏
      </Button>

      <div className="text-white/40 text-sm text-center">
        点击空格填入数字，完成数独
      </div>
    </div>
  );
}
