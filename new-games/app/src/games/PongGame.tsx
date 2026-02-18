import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;

export function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const gameStateRef = useRef({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: BALL_SPEED, vy: BALL_SPEED * 0.5 },
    playerScore: 0,
    aiScore: 0,
    keys: { up: false, down: false },
  });
  
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [displayScore, setDisplayScore] = useState({ player: 0, ai: 0 });

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: BALL_SPEED, vy: BALL_SPEED * 0.5 },
      playerScore: 0,
      aiScore: 0,
      keys: { up: false, down: false },
    };
    setDisplayScore({ player: 0, ai: 0 });
    setGameOver(false);
    setIsPaused(false);
    setWinner(null);
  }, []);

  const resetBall = useCallback(() => {
    const state = gameStateRef.current;
    state.ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED,
      vy: (Math.random() * 2 - 1) * BALL_SPEED * 0.5,
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') gameStateRef.current.keys.up = true;
      if (e.key === 'ArrowDown') gameStateRef.current.keys.down = true;
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') gameStateRef.current.keys.up = false;
      if (e.key === 'ArrowDown') gameStateRef.current.keys.down = false;
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
      if (gameOver || isPaused) {
        requestRef.current = requestAnimationFrame(update);
        return;
      }

      const state = gameStateRef.current;

      // Move player paddle
      if (state.keys.up) {
        state.playerY = Math.max(0, state.playerY - PADDLE_SPEED);
      }
      if (state.keys.down) {
        state.playerY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.playerY + PADDLE_SPEED);
      }

      // Move AI paddle
      const targetY = state.ball.y - PADDLE_HEIGHT / 2;
      const diff = targetY - state.aiY;
      const move = Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED * 0.8);
      state.aiY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY + move));

      // Move ball
      state.ball.x += state.ball.vx;
      state.ball.y += state.ball.vy;

      // Wall collision (top/bottom)
      if (state.ball.y <= 0 || state.ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
        state.ball.vy = -state.ball.vy;
        if (state.ball.y <= 0) state.ball.y = 0;
        if (state.ball.y >= CANVAS_HEIGHT - BALL_SIZE) state.ball.y = CANVAS_HEIGHT - BALL_SIZE;
      }

      // Paddle collision
      const playerPaddle = { x: 20, y: state.playerY, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
      const aiPaddle = { x: CANVAS_WIDTH - 20 - PADDLE_WIDTH, y: state.aiY, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };

      if (state.ball.x <= playerPaddle.x + playerPaddle.width &&
          state.ball.x >= playerPaddle.x &&
          state.ball.y + BALL_SIZE >= playerPaddle.y &&
          state.ball.y <= playerPaddle.y + playerPaddle.height) {
        state.ball.vx = Math.abs(state.ball.vx) * 1.05;
        state.ball.vy += (state.ball.y - (playerPaddle.y + playerPaddle.height / 2)) * 0.1;
      }

      if (state.ball.x + BALL_SIZE >= aiPaddle.x &&
          state.ball.x <= aiPaddle.x + aiPaddle.width &&
          state.ball.y + BALL_SIZE >= aiPaddle.y &&
          state.ball.y <= aiPaddle.y + aiPaddle.height) {
        state.ball.vx = -Math.abs(state.ball.vx) * 1.05;
        state.ball.vy += (state.ball.y - (aiPaddle.y + aiPaddle.height / 2)) * 0.1;
      }

      // Score
      if (state.ball.x < 0) {
        state.aiScore++;
        setDisplayScore({ player: state.playerScore, ai: state.aiScore });
        if (state.aiScore >= 5) {
          setGameOver(true);
          setWinner('电脑');
        } else {
          resetBall();
        }
      }

      if (state.ball.x > CANVAS_WIDTH) {
        state.playerScore++;
        setDisplayScore({ player: state.playerScore, ai: state.aiScore });
        if (state.playerScore >= 5) {
          setGameOver(true);
          setWinner('玩家');
        } else {
          resetBall();
        }
      }

      // Render
      ctx.fillStyle = '#0F0F1A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#4ADE80';
      ctx.fillRect(20, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

      ctx.fillStyle = '#FF3A7A';
      ctx.fillRect(CANVAS_WIDTH - 20 - PADDLE_WIDTH, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(state.ball.x + BALL_SIZE / 2, state.ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw scores
      ctx.font = 'bold 48px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.textAlign = 'center';
      ctx.fillText(state.playerScore.toString(), CANVAS_WIDTH / 4, 60);
      ctx.fillText(state.aiScore.toString(), CANVAS_WIDTH * 3 / 4, 60);

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameOver, isPaused, resetBall]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-16 text-center">
        <div>
          <div className="text-white/60 text-sm">玩家</div>
          <div className="text-2xl font-bold text-[#4ADE80]">{displayScore.player}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">电脑</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">{displayScore.ai}</div>
        </div>
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
            <div className="text-4xl mb-2">{winner === '玩家' ? '🎉' : '😢'}</div>
            <div className="text-2xl font-bold text-white mb-2">
              {winner === '玩家' ? '你赢了!' : '电脑赢了!'}
            </div>
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

      {/* Mobile Controls */}
      <div className="grid grid-cols-2 gap-2 md:hidden w-full max-w-xs">
        <Button 
          onMouseDown={() => { gameStateRef.current.keys.up = true; }} 
          onMouseUp={() => { gameStateRef.current.keys.up = false; }}
          onMouseLeave={() => { gameStateRef.current.keys.up = false; }}
          onTouchStart={() => { gameStateRef.current.keys.up = true; }}
          onTouchEnd={() => { gameStateRef.current.keys.up = false; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl"
          disabled={gameOver}
        >↑</Button>
        <Button 
          onMouseDown={() => { gameStateRef.current.keys.down = true; }} 
          onMouseUp={() => { gameStateRef.current.keys.down = false; }}
          onMouseLeave={() => { gameStateRef.current.keys.down = false; }}
          onTouchStart={() => { gameStateRef.current.keys.down = true; }}
          onTouchEnd={() => { gameStateRef.current.keys.down = false; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl"
          disabled={gameOver}
        >↓</Button>
      </div>

      <div className="flex gap-2 md:hidden">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm" className="flex-1">
          {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
          {isPaused ? '继续' : '暂停'}
        </Button>
        <Button onClick={resetGame} variant="outline" size="sm" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        上下方向键控制，先得5分获胜
      </div>
    </div>
  );
}
