import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 200;
const DINO_SIZE = 40;
const GROUND_Y = 160;
const JUMP_STRENGTH = -12;
const GRAVITY = 0.6;

export function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dino, setDino] = useState({ y: GROUND_Y - DINO_SIZE, velocity: 0, isJumping: false });
  const [obstacles, setObstacles] = useState<{ x: number; type: 'cactus' | 'bird'; y?: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [started, setStarted] = useState(false);
  const frameRef = useRef(0);

  const resetGame = useCallback(() => {
    setDino({ y: GROUND_Y - DINO_SIZE, velocity: 0, isJumping: false });
    setObstacles([]);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setStarted(false);
    frameRef.current = 0;
  }, []);

  const jump = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!started) setStarted(true);
    setDino(d => {
      if (!d.isJumping) {
        return { ...d, velocity: JUMP_STRENGTH, isJumping: true };
      }
      return d;
    });
  }, [gameOver, started, resetGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    if (gameOver || isPaused || !started) return;

    const interval = setInterval(() => {
      frameRef.current++;

      // Update dino
      setDino(d => {
        let newY = d.y + d.velocity;
        let newVelocity = d.velocity + GRAVITY;
        let isJumping = d.isJumping;

        if (newY >= GROUND_Y - DINO_SIZE) {
          newY = GROUND_Y - DINO_SIZE;
          newVelocity = 0;
          isJumping = false;
        }

        return { y: newY, velocity: newVelocity, isJumping };
      });

      // Update obstacles
      setObstacles(current => {
        let newObstacles = current.map(o => ({ ...o, x: o.x - 5 }));
        newObstacles = newObstacles.filter(o => o.x > -30);

        // Add new obstacle
        if (frameRef.current % 80 === 0) {
          const type = Math.random() > 0.8 ? 'bird' : 'cactus';
          newObstacles.push({
            x: CANVAS_WIDTH,
            type,
            y: type === 'bird' ? GROUND_Y - DINO_SIZE - 30 - Math.random() * 20 : undefined,
          });
        }

        return newObstacles;
      });

      // Update score
      if (frameRef.current % 10 === 0) {
        setScore(s => {
          const newScore = s + 1;
          setHighScore(hs => Math.max(hs, newScore));
          return newScore;
        });
      }

      // Check collisions
      setObstacles(current => {
        current.forEach(o => {
          const dinoLeft = 50;
          const dinoRight = 50 + DINO_SIZE - 10;
          const dinoTop = dino.y + 5;
          const dinoBottom = dino.y + DINO_SIZE;

          const obsLeft = o.x;
          const obsRight = o.x + 25;
          const obsTop = o.type === 'bird' ? (o.y || 0) : GROUND_Y - 40;
          const obsBottom = o.type === 'bird' ? (o.y || 0) + 25 : GROUND_Y;

          if (dinoRight > obsLeft && dinoLeft < obsRight &&
              dinoBottom > obsTop && dinoTop < obsBottom) {
            setGameOver(true);
          }
        });
        return current;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameOver, isPaused, started, dino.y]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    // Draw ground dots
    ctx.fillStyle = '#4B5563';
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      const offset = (frameRef.current * 5) % 20;
      ctx.fillRect(i - offset, GROUND_Y + 5, 4, 4);
    }

    // Draw dino
    ctx.fillStyle = '#84CC16';
    ctx.fillRect(50, dino.y, DINO_SIZE, DINO_SIZE);
    
    // Dino eye
    ctx.fillStyle = 'white';
    ctx.fillRect(65, dino.y + 8, 8, 8);
    ctx.fillStyle = 'black';
    ctx.fillRect(69, dino.y + 10, 4, 4);

    // Draw obstacles
    obstacles.forEach(o => {
      if (o.type === 'cactus') {
        ctx.fillStyle = '#22C55E';
        ctx.fillRect(o.x, GROUND_Y - 40, 15, 40);
        ctx.fillRect(o.x - 8, GROUND_Y - 30, 8, 8);
        ctx.fillRect(o.x + 15, GROUND_Y - 25, 8, 8);
      } else {
        ctx.fillStyle = '#F97316';
        ctx.fillRect(o.x, o.y || 0, 25, 20);
        ctx.fillStyle = 'white';
        ctx.fillRect(o.x + 5, (o.y || 0) + 5, 5, 5);
        ctx.fillRect(o.x + 15, (o.y || 0) + 5, 5, 5);
      }
    });
  }, [dino, obstacles]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">得分</div>
          <div className="text-2xl font-bold text-[#84CC16]">{score}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">最高分</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">{highScore}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-white/20 rounded-lg max-w-full cursor-pointer"
          onClick={jump}
        />
        
        {!started && !gameOver && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">🦕</div>
            <div className="text-xl font-bold text-white mb-2">按空格键或点击开始</div>
            <div className="text-white/60 text-sm">跳跃躲避障碍物</div>
          </div>
        )}
        
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

        {isPaused && !gameOver && started && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
            <div className="text-2xl font-bold text-white">暂停</div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm" disabled={!started || gameOver}>
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        空格键或点击跳跃，躲避仙人掌和飞鸟
      </div>
    </div>
  );
}
