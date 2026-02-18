import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 8;

const BRICK_COLORS = ['#FF3A7A', '#A42EFF', '#3B89FF', '#00D4FF', '#4ADE80'];

export function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paddleX, setPaddleX] = useState(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, vx: 4, vy: -4 });
  const [bricks, setBricks] = useState<boolean[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const keysRef = useRef({ left: false, right: false });

  const initBricks = useCallback(() => {
    return Array(BRICK_ROWS).fill(null).map(() => Array(BRICK_COLS).fill(true));
  }, []);

  const resetGame = useCallback(() => {
    setPaddleX(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, vx: 4, vy: -4 });
    setBricks(initBricks());
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setWon(false);
  }, [initBricks]);

  useEffect(() => {
    setBricks(initBricks());
  }, [initBricks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameOver || won || isPaused) return;

    const interval = setInterval(() => {
      // Move paddle
      setPaddleX(x => {
        let newX = x;
        if (keysRef.current.left) newX -= 8;
        if (keysRef.current.right) newX += 8;
        return Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, newX));
      });

      // Move ball
      setBall(b => {
        let newX = b.x + b.vx;
        let newY = b.y + b.vy;
        let newVx = b.vx;
        let newVy = b.vy;

        // Wall collision
        if (newX <= 0 || newX >= CANVAS_WIDTH - BALL_SIZE) newVx = -newVx;
        if (newY <= 0) newVy = -newVy;

        // Paddle collision
        if (newY + BALL_SIZE >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
            newY <= CANVAS_HEIGHT - 10 &&
            newX + BALL_SIZE >= paddleX &&
            newX <= paddleX + PADDLE_WIDTH) {
          newVy = -Math.abs(newVy);
          newVx += (newX - (paddleX + PADDLE_WIDTH / 2)) * 0.1;
        }

        // Game over
        if (newY > CANVAS_HEIGHT) {
          setGameOver(true);
        }

        return { x: newX, y: newY, vx: newVx, vy: newVy };
      });

      // Brick collision
      setBricks(currentBricks => {
        const newBricks = currentBricks.map(row => [...row]);
        let hit = false;

        for (let row = 0; row < BRICK_ROWS; row++) {
          for (let col = 0; col < BRICK_COLS; col++) {
            if (newBricks[row][col]) {
              const brickX = col * (BRICK_WIDTH + BRICK_PADDING) + 35;
              const brickY = row * (BRICK_HEIGHT + BRICK_PADDING) + 40;

              if (ball.x + BALL_SIZE >= brickX &&
                  ball.x <= brickX + BRICK_WIDTH &&
                  ball.y + BALL_SIZE >= brickY &&
                  ball.y <= brickY + BRICK_HEIGHT) {
                newBricks[row][col] = false;
                hit = true;
                setScore(s => s + 10);
              }
            }
          }
        }

        if (hit) {
          setBall(b => ({ ...b, vy: -b.vy }));
        }

        // Check win
        if (newBricks.every(row => row.every(brick => !brick))) {
          setWon(true);
        }

        return newBricks;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameOver, won, isPaused, paddleX, ball]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bricks
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        if (bricks[row]?.[col]) {
          const x = col * (BRICK_WIDTH + BRICK_PADDING) + 35;
          const y = row * (BRICK_HEIGHT + BRICK_PADDING) + 40;
          ctx.fillStyle = BRICK_COLORS[row];
          ctx.fillRect(x, y, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(x, y, BRICK_WIDTH, 4);
        }
      }
    }

    // Draw paddle
    ctx.fillStyle = '#4ADE80';
    ctx.fillRect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [paddleX, ball, bricks]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm">得分</div>
        <div className="text-2xl font-bold text-[#FACC15]">{score}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-white/20 rounded-lg max-w-full"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">💥</div>
            <div className="text-2xl font-bold text-white mb-2">游戏结束</div>
            <div className="text-white/60 mb-4">得分: {score}</div>
            <Button onClick={resetGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新开始
            </Button>
          </div>
        )}

        {won && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-2xl font-bold text-white mb-2">胜利!</div>
            <div className="text-white/60 mb-4">得分: {score}</div>
            <Button onClick={resetGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
              <RotateCcw className="w-4 h-4 mr-2" />
              再玩一次
            </Button>
          </div>
        )}

        {isPaused && !gameOver && !won && (
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
        左右方向键移动挡板，击碎所有砖块
      </div>
    </div>
  );
}
