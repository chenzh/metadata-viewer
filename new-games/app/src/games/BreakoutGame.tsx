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
  const requestRef = useRef<number | null>(null);
  const gameStateRef = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, vx: 4, vy: -4 },
    bricks: Array(BRICK_ROWS).fill(null).map(() => Array(BRICK_COLS).fill(true)),
    keys: { left: false, right: false },
    score: 0,
  });
  
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, vx: 4, vy: -4 },
      bricks: Array(BRICK_ROWS).fill(null).map(() => Array(BRICK_COLS).fill(true)),
      keys: { left: false, right: false },
      score: 0,
    };
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setWon(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameStateRef.current.keys.left = true;
      if (e.key === 'ArrowRight') gameStateRef.current.keys.right = true;
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameStateRef.current.keys.left = false;
      if (e.key === 'ArrowRight') gameStateRef.current.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = () => {
      if (gameOver || won || isPaused) {
        requestRef.current = requestAnimationFrame(update);
        return;
      }

      const state = gameStateRef.current;

      // Move paddle
      if (state.keys.left) {
        state.paddleX = Math.max(0, state.paddleX - 8);
      }
      if (state.keys.right) {
        state.paddleX = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, state.paddleX + 8);
      }

      // Move ball
      state.ball.x += state.ball.vx;
      state.ball.y += state.ball.vy;

      // Wall collision
      if (state.ball.x <= 0 || state.ball.x >= CANVAS_WIDTH - BALL_SIZE) {
        state.ball.vx = -state.ball.vx;
      }
      if (state.ball.y <= 0) {
        state.ball.vy = -state.ball.vy;
      }

      // Paddle collision
      if (state.ball.y + BALL_SIZE >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
          state.ball.y <= CANVAS_HEIGHT - 10 &&
          state.ball.x + BALL_SIZE >= state.paddleX &&
          state.ball.x <= state.paddleX + PADDLE_WIDTH) {
        state.ball.vy = -Math.abs(state.ball.vy);
        state.ball.vx += (state.ball.x - (state.paddleX + PADDLE_WIDTH / 2)) * 0.1;
      }

      // Game over
      if (state.ball.y > CANVAS_HEIGHT) {
        setGameOver(true);
      }

      // Brick collision
      let hit = false;
      for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
          if (state.bricks[row][col]) {
            const brickX = col * (BRICK_WIDTH + BRICK_PADDING) + 35;
            const brickY = row * (BRICK_HEIGHT + BRICK_PADDING) + 40;

            if (state.ball.x + BALL_SIZE >= brickX &&
                state.ball.x <= brickX + BRICK_WIDTH &&
                state.ball.y + BALL_SIZE >= brickY &&
                state.ball.y <= brickY + BRICK_HEIGHT) {
              state.bricks[row][col] = false;
              hit = true;
              state.score += 10;
              setScore(state.score);
            }
          }
        }
      }

      if (hit) {
        state.ball.vy = -state.ball.vy;
      }

      // Check win
      if (state.bricks.every(row => row.every(brick => !brick))) {
        setWon(true);
      }

      // Render
      ctx.fillStyle = '#0F0F1A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bricks
      for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
          if (state.bricks[row][col]) {
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
      ctx.fillRect(state.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(state.ball.x + BALL_SIZE / 2, state.ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameOver, won, isPaused]);

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
          className="border-2 border-white/20 rounded-lg max-w-full touch-manipulation select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            if (gameOver || won) return;
            const touch = e.touches[0];
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = touch.clientX - rect.left;
            const scaleX = CANVAS_WIDTH / rect.width;
            const canvasX = x * scaleX;
            gameStateRef.current.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, canvasX - PADDLE_WIDTH / 2));
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (gameOver || won) return;
            const touch = e.touches[0];
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = touch.clientX - rect.left;
            const scaleX = CANVAS_WIDTH / rect.width;
            const canvasX = x * scaleX;
            gameStateRef.current.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, canvasX - PADDLE_WIDTH / 2));
          }}
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

      {/* Mobile Controls */}
      <div className="grid grid-cols-2 gap-2 md:hidden w-full max-w-xs">
        <Button 
          onMouseDown={() => { gameStateRef.current.keys.left = true; }} 
          onMouseUp={() => { gameStateRef.current.keys.left = false; }}
          onMouseLeave={() => { gameStateRef.current.keys.left = false; }}
          onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.keys.left = true; }}
          onTouchEnd={() => { gameStateRef.current.keys.left = false; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl select-none"
          disabled={gameOver || won}
        >←</Button>
        <Button 
          onMouseDown={() => { gameStateRef.current.keys.right = true; }} 
          onMouseUp={() => { gameStateRef.current.keys.right = false; }}
          onMouseLeave={() => { gameStateRef.current.keys.right = false; }}
          onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.keys.right = true; }}
          onTouchEnd={() => { gameStateRef.current.keys.right = false; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl select-none"
          disabled={gameOver || won}
        >→</Button>
      </div>

      <div className="flex gap-2 md:hidden">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm" className="flex-1 select-none">
          {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
          {isPaused ? '继续' : '暂停'}
        </Button>
        <Button onClick={resetGame} variant="outline" size="sm" className="flex-1 select-none">
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        左右方向键移动挡板，击碎所有砖块
      </div>
    </div>
  );
}
