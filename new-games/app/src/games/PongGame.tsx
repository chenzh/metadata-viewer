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
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: BALL_SPEED, vy: BALL_SPEED * 0.5 });
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const keysRef = useRef({ up: false, down: false });

  const resetBall = useCallback(() => {
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED,
      vy: (Math.random() * 2 - 1) * BALL_SPEED * 0.5,
    });
  }, []);

  const resetGame = useCallback(() => {
    setPlayerY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setAiY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    resetBall();
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setIsPaused(false);
    setWinner(null);
  }, [resetBall]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') keysRef.current.up = true;
      if (e.key === 'ArrowDown') keysRef.current.down = true;
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') keysRef.current.up = false;
      if (e.key === 'ArrowDown') keysRef.current.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      // Move player paddle
      setPlayerY(y => {
        let newY = y;
        if (keysRef.current.up) newY -= PADDLE_SPEED;
        if (keysRef.current.down) newY += PADDLE_SPEED;
        return Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
      });

      // Move AI paddle
      setAiY(y => {
        const targetY = ball.y - PADDLE_HEIGHT / 2;
        const diff = targetY - y;
        const move = Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED * 0.8);
        return Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, y + move));
      });

      // Move ball
      setBall(b => {
        let newX = b.x + b.vx;
        let newY = b.y + b.vy;
        let newVx = b.vx;
        let newVy = b.vy;

        // Wall collision (top/bottom)
        if (newY <= 0 || newY >= CANVAS_HEIGHT - BALL_SIZE) {
          newVy = -newVy;
          newY = newY <= 0 ? 0 : CANVAS_HEIGHT - BALL_SIZE;
        }

        // Paddle collision
        const playerPaddle = { x: 20, y: playerY, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
        const aiPaddle = { x: CANVAS_WIDTH - 20 - PADDLE_WIDTH, y: aiY, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };

        if (newX <= playerPaddle.x + playerPaddle.width &&
            newX >= playerPaddle.x &&
            newY + BALL_SIZE >= playerPaddle.y &&
            newY <= playerPaddle.y + playerPaddle.height) {
          newVx = Math.abs(newVx) * 1.05;
          newVy += (newY - (playerPaddle.y + playerPaddle.height / 2)) * 0.1;
        }

        if (newX + BALL_SIZE >= aiPaddle.x &&
            newX <= aiPaddle.x + aiPaddle.width &&
            newY + BALL_SIZE >= aiPaddle.y &&
            newY <= aiPaddle.y + aiPaddle.height) {
          newVx = -Math.abs(newVx) * 1.05;
          newVy += (newY - (aiPaddle.y + aiPaddle.height / 2)) * 0.1;
        }

        // Score
        if (newX < 0) {
          setAiScore(s => {
            const newScore = s + 1;
            if (newScore >= 5) {
              setGameOver(true);
              setWinner('电脑');
            }
            return newScore;
          });
          resetBall();
          return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: BALL_SPEED, vy: BALL_SPEED * 0.5 };
        }

        if (newX > CANVAS_WIDTH) {
          setPlayerScore(s => {
            const newScore = s + 1;
            if (newScore >= 5) {
              setGameOver(true);
              setWinner('玩家');
            }
            return newScore;
          });
          resetBall();
          return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: -BALL_SPEED, vy: BALL_SPEED * 0.5 };
        }

        return { x: newX, y: newY, vx: newVx, vy: newVy };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameOver, isPaused, ball.y, playerY, resetBall]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
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
    ctx.fillRect(20, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.fillStyle = '#FF3A7A';
    ctx.fillRect(CANVAS_WIDTH - 20 - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw scores
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.textAlign = 'center';
    ctx.fillText(playerScore.toString(), CANVAS_WIDTH / 4, 60);
    ctx.fillText(aiScore.toString(), CANVAS_WIDTH * 3 / 4, 60);
  }, [playerY, aiY, ball, playerScore, aiScore]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-16 text-center">
        <div>
          <div className="text-white/60 text-sm">玩家</div>
          <div className="text-2xl font-bold text-[#4ADE80]">{playerScore}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">电脑</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">{aiScore}</div>
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

      <div className="flex gap-2">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm">
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        上下方向键控制，先得5分获胜
      </div>
    </div>
  );
}
