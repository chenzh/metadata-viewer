import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BALL_SIZE = 15;
const PATH_WIDTH = 80;

export function ZigzagGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: 100 });
  const [path, setPath] = useState<{ x: number; y: number; direction: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [ballDirection, setBallDirection] = useState(1);

  const initGame = useCallback(() => {
    const newPath = [];
    let x = CANVAS_WIDTH / 2 - PATH_WIDTH / 2;
    let direction = 1;
    
    for (let i = 0; i < 20; i++) {
      newPath.push({ x, y: 200 + i * 50, direction });
      x += direction * (PATH_WIDTH - 20);
      if (x <= 20 || x >= CANVAS_WIDTH - PATH_WIDTH - 20) {
        direction *= -1;
      }
    }
    
    setPath(newPath);
    setBall({ x: CANVAS_WIDTH / 2, y: 100 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setStarted(true);
    setBallDirection(1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started || gameOver) return;
      
      if (e.key === ' ') {
        e.preventDefault();
        if (isPaused) {
          setIsPaused(false);
        } else {
          setBallDirection(d => -d);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, gameOver, isPaused]);

  useEffect(() => {
    if (!started || gameOver || isPaused) return;

    const interval = setInterval(() => {
      setBall(b => {
        const newX = b.x + ballDirection * 4;
        const newY = b.y + 2;
        
        // Check if on path
        const currentPath = path.find(p => Math.abs(p.y - newY) < 25);
        if (currentPath) {
          if (newX < currentPath.x || newX > currentPath.x + PATH_WIDTH) {
            setGameOver(true);
          }
        }
        
        return { x: newX, y: newY };
      });

      // Move path up
      setPath(prev => {
        const newPath = prev.map(p => ({ ...p, y: p.y - 2 }));
        
        // Remove off-screen paths
        const filtered = newPath.filter(p => p.y > -50);
        
        // Add new paths
        const lastPath = filtered[filtered.length - 1];
        if (lastPath && lastPath.y < CANVAS_HEIGHT) {
          let newX = lastPath.x;
          let newDirection = lastPath.direction;
          
          newX += newDirection * (PATH_WIDTH - 20);
          if (newX <= 20) {
            newX = 20;
            newDirection = 1;
          } else if (newX >= CANVAS_WIDTH - PATH_WIDTH - 20) {
            newX = CANVAS_WIDTH - PATH_WIDTH - 20;
            newDirection = -1;
          }
          
          filtered.push({ x: newX, y: lastPath.y + 50, direction: newDirection });
        }
        
        return filtered;
      });

      setScore(s => s + 1);
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [started, gameOver, isPaused, ballDirection, path]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw path
    ctx.fillStyle = '#4ADE80';
    path.forEach(p => {
      ctx.fillRect(p.x, p.y, PATH_WIDTH, 40);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeRect(p.x, p.y, PATH_WIDTH, 40);
    });

    // Draw ball
    ctx.fillStyle = '#FF3A7A';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Score: ${Math.floor(score / 10)}`, 10, 30);
  }, [ball, path, score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm">得分</div>
        <div className="text-2xl font-bold text-[#4ADE80]">{Math.floor(score / 10)}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-white/20 rounded-lg max-w-full cursor-pointer"
          onClick={() => setBallDirection(d => -d)}
        />
        
        {!started && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">〰️</div>
            <div className="text-xl font-bold text-white mb-2">之字形</div>
            <Button onClick={initGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
              开始游戏
            </Button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">💥</div>
            <div className="text-2xl font-bold text-white mb-2">掉下去了!</div>
            <div className="text-white/60 mb-4">得分: {Math.floor(score / 10)}</div>
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
      <div className="md:hidden w-full max-w-xs">
        <Button 
          onClick={() => { if (started && !gameOver && !isPaused) setBallDirection(d => -d); }} 
          variant="outline" 
          className="w-full h-16 border-white/20 text-white text-xl"
          disabled={!started || gameOver}
        >
          ↩ 转弯 ↪
        </Button>
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
        点击或按空格键转弯，保持在道路上
      </div>
    </div>
  );
}
