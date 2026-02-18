import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BALL_SIZE = 20;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;

const COLORS = ['#FF3A7A', '#A42EFF', '#3B89FF', '#00D4FF', '#4ADE80', '#FACC15'];

export function ColorJumpGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vy: 0 });
  const [platforms, setPlatforms] = useState<{ x: number; y: number; color: number }[]>([]);
  const [currentColor, setCurrentColor] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [started, setStarted] = useState(false);

  const initGame = useCallback(() => {
    const newPlatforms = [];
    for (let i = 0; i < 6; i++) {
      newPlatforms.push({
        x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
        y: CANVAS_HEIGHT - 100 - i * 100,
        color: Math.floor(Math.random() * COLORS.length),
      });
    }
    setPlatforms(newPlatforms);
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vy: 0 });
    setCurrentColor(Math.floor(Math.random() * COLORS.length));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setStarted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started || gameOver) return;
      
      if (e.key === 'ArrowLeft') {
        setBall(b => ({ ...b, x: Math.max(BALL_SIZE, b.x - 15) }));
      } else if (e.key === 'ArrowRight') {
        setBall(b => ({ ...b, x: Math.min(CANVAS_WIDTH - BALL_SIZE, b.x + 15) }));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, gameOver]);

  useEffect(() => {
    if (!started || gameOver || isPaused) return;

    const interval = setInterval(() => {
      setBall(b => {
        let newY = b.y + b.vy;
        let newVy = b.vy + 0.5;

        // Check platform collision
        platforms.forEach(p => {
          if (newVy > 0 &&
              b.x >= p.x && b.x <= p.x + PLATFORM_WIDTH &&
              newY + BALL_SIZE >= p.y && newY + BALL_SIZE <= p.y + PLATFORM_HEIGHT + 10) {
            if (p.color === currentColor) {
              newVy = -12;
              newY = p.y - BALL_SIZE;
              setScore(s => s + 10);
              setCurrentColor(Math.floor(Math.random() * COLORS.length));
            } else {
              setGameOver(true);
            }
          }
        });

        // Game over if fell off screen
        if (newY > CANVAS_HEIGHT) {
          setGameOver(true);
        }

        return { ...b, y: newY, vy: newVy };
      });

      // Move platforms down
      setPlatforms(prev => {
        const newPlatforms = prev.map(p => ({ ...p, y: p.y + 2 }));
        
        // Remove off-screen platforms
        const filtered = newPlatforms.filter(p => p.y < CANVAS_HEIGHT);
        
        // Add new platforms
        while (filtered.length < 6) {
          const highestY = filtered.length > 0 ? Math.min(...filtered.map(p => p.y)) : CANVAS_HEIGHT;
          filtered.push({
            x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
            y: highestY - 100,
            color: Math.floor(Math.random() * COLORS.length),
          });
        }
        
        return filtered;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [started, gameOver, isPaused, platforms, currentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    platforms.forEach(p => {
      ctx.fillStyle = COLORS[p.color];
      ctx.fillRect(p.x, p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeRect(p.x, p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
    });

    // Draw ball
    ctx.fillStyle = COLORS[currentColor];
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw current color indicator
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.fillText('当前颜色:', 10, 30);
    ctx.fillStyle = COLORS[currentColor];
    ctx.fillRect(80, 15, 30, 20);
  }, [ball, platforms, currentColor]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm">得分</div>
        <div className="text-2xl font-bold text-[#00D4FF]">{score}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-white/20 rounded-lg max-w-full"
        />
        
        {!started && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">🌈</div>
            <div className="text-xl font-bold text-white mb-2">颜色跳跃</div>
            <Button onClick={initGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
              开始游戏
            </Button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">💥</div>
            <div className="text-2xl font-bold text-white mb-2">游戏结束</div>
            <div className="text-white/60 mb-4">得分: {score}</div>
            <Button onClick={initGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
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

      {/* Mobile Controls */}
      <div className="grid grid-cols-2 gap-2 md:hidden w-full max-w-xs">
        <Button 
          onMouseDown={() => { setBall(b => ({ ...b, x: Math.max(BALL_SIZE, b.x - 15) })); }} 
          onTouchStart={() => { setBall(b => ({ ...b, x: Math.max(BALL_SIZE, b.x - 15) })); }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl"
          disabled={!started || gameOver}
        >←</Button>
        <Button 
          onMouseDown={() => { setBall(b => ({ ...b, x: Math.min(CANVAS_WIDTH - BALL_SIZE, b.x + 15) })); }} 
          onTouchStart={() => { setBall(b => ({ ...b, x: Math.min(CANVAS_WIDTH - BALL_SIZE, b.x + 15) })); }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl"
          disabled={!started || gameOver}
        >→</Button>
      </div>

      <div className="flex gap-2 md:hidden">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm" className="flex-1">
          {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
          {isPaused ? '继续' : '暂停'}
        </Button>
        <Button onClick={initGame} variant="outline" size="sm" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        方向键移动，跳到相同颜色的平台上
      </div>
    </div>
  );
}
