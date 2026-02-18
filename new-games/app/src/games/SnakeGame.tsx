import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
  }, [generateFood]);

  const togglePause = useCallback(() => {
    if (!gameOver) {
      setIsPaused(prev => !prev);
    }
  }, [gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, togglePause]);

  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => {
            const newScore = prev + 10;
            setHighScore(hs => Math.max(hs, newScore));
            return newScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, INITIAL_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [direction, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#FF3A7A';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowColor = '#FF3A7A';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
      const gradient = ctx.createLinearGradient(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        segment.x * CELL_SIZE + CELL_SIZE,
        segment.y * CELL_SIZE + CELL_SIZE
      );
      if (index === 0) {
        gradient.addColorStop(0, '#4ADE80');
        gradient.addColorStop(1, '#22C55E');
      } else {
        gradient.addColorStop(0, '#22C55E');
        gradient.addColorStop(1, '#16A34A');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score Board */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">得分</div>
          <div className="text-2xl font-bold text-[#4ADE80]">{score}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">最高分</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">{highScore}</div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-2 border-white/20 rounded-lg"
        />
        
        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">💀</div>
            <div className="text-2xl font-bold text-white mb-2">游戏结束</div>
            <div className="text-white/60 mb-4">最终得分: {score}</div>
            <Button onClick={resetGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新开始
            </Button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
            <div className="text-2xl font-bold text-white">暂停</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button onClick={togglePause} variant="outline" size="sm">
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-white/40 text-sm text-center">
        使用方向键控制蛇的移动，空格键暂停
      </div>
    </div>
  );
}
