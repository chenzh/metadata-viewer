import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 25;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
];

const COLORS = ['#00D4FF', '#FACC15', '#A42EFF', '#4ADE80', '#FF3A7A', '#F97316', '#3B89FF'];

export function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<number[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const [currentPiece, setCurrentPiece] = useState({ shape: SHAPES[0], color: 1, x: 3, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generatePiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[shapeIndex],
      color: shapeIndex + 1,
      x: 3,
      y: 0,
    };
  }, []);

  const resetGame = useCallback(() => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setCurrentPiece(generatePiece());
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setLines(0);
  }, [generatePiece]);

  const isValidMove = useCallback((piece: typeof currentPiece, newX: number, newY: number, newShape?: number[][]) => {
    const shape = newShape || piece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return false;
          if (boardY >= 0 && board[boardY][boardX]) return false;
        }
      }
    }
    return true;
  }, [board]);

  const rotatePiece = useCallback(() => {
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );
    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y, rotated)) {
      setCurrentPiece(prev => ({ ...prev, shape: rotated }));
    }
  }, [currentPiece, isValidMove]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (isValidMove(currentPiece, currentPiece.x + dx, currentPiece.y + dy)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      return true;
    }
    return false;
  }, [currentPiece, isValidMove]);

  const lockPiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = currentPiece.y + y;
          if (boardY >= 0) {
            newBoard[boardY][currentPiece.x + x] = currentPiece.color;
          }
        }
      });
    });

    // Clear lines
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * linesCleared);
    }

    setBoard(newBoard);
    const newPiece = generatePiece();
    if (!isValidMove(newPiece, newPiece.x, newPiece.y)) {
      setGameOver(true);
    } else {
      setCurrentPiece(newPiece);
    }
  }, [board, currentPiece, generatePiece, isValidMove]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (!isPaused) movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!isPaused) movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isPaused) movePiece(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isPaused) rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, movePiece, rotatePiece]);

  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      if (!movePiece(0, 1)) {
        lockPiece();
      }
    }, 500);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameOver, isPaused, movePiece, lockPiece]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = COLORS[cell - 1];
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
      });
    });

    // Draw current piece
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = COLORS[currentPiece.color - 1];
          ctx.fillRect(
            (currentPiece.x + x) * CELL_SIZE + 1,
            (currentPiece.y + y) * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
          );
        }
      });
    });

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, ROWS * CELL_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(COLS * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
  }, [board, currentPiece]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">得分</div>
          <div className="text-2xl font-bold text-[#00D4FF]">{score}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">消除行数</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">{lines}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={COLS * CELL_SIZE}
          height={ROWS * CELL_SIZE}
          className="border-2 border-white/20 rounded-lg"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">💀</div>
            <div className="text-2xl font-bold text-white mb-2">游戏结束</div>
            <div className="text-white/60 mb-4">得分: {score}</div>
            <Button onClick={resetGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新开始
            </Button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
            <div className="text-2xl font-bold text-white">暂停</div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm">
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        方向键移动，上键旋转，空格暂停
      </div>
    </div>
  );
}
