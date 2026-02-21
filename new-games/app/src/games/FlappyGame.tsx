import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 120;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;

export function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bird, setBird] = useState({ y: CANVAS_HEIGHT / 2, velocity: 0 });
  const [pipes, setPipes] = useState<{ x: number; topHeight: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [started, setStarted] = useState(false);
      
  // Use ref to store bird position for collision detection without re-creating interval
  const birdRef = useRef({ y: CANVAS_HEIGHT / 2, velocity: 0 });

  // Keep ref in sync with state
  useEffect(() => {
    birdRef.current = bird;
  }, [bird]);

  const resetGame = useCallback(() => {
    setBird({ y: CANVAS_HEIGHT / 2, velocity: 0 });
    birdRef.current = { y: CANVAS_HEIGHT / 2, velocity: 0 };
    setPipes([]);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setStarted(false);
  }, []);

  const jump = useCallback(() => {
    if (gameOver) return;
    if (!started) setStarted(true);
    setBird(b => ({ ...b, velocity: JUMP_STRENGTH }));
  }, [gameOver, started]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, jump, resetGame]);

  useEffect(() => {
    if (gameOver || isPaused || !started) return;

    const interval = setInterval(() => {
      // Update bird
      setBird(b => {
        const newY = b.y + b.velocity;
        const newVelocity = b.velocity + GRAVITY;
        
        if (newY < 0 || newY > CANVAS_HEIGHT - BIRD_SIZE) {
          setGameOver(true);
        }
        
        return { y: newY, velocity: newVelocity };
      });

      // Update pipes
      setPipes(currentPipes => {
        let newPipes = currentPipes.map(pipe => ({ ...pipe, x: pipe.x - 3 }));
        
        // Remove off-screen pipes
        newPipes = newPipes.filter(pipe => pipe.x > -PIPE_WIDTH);
        
        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < CANVAS_WIDTH - 200) {
          const topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
          newPipes.push({ x: CANVAS_WIDTH, topHeight });
        }
        
        return newPipes;
      });

      // Check collisions and score - use ref to avoid dependency on bird state
      setPipes(currentPipes => {
        currentPipes.forEach(pipe => {
          const birdY = birdRef.current.y;
          const birdLeft = 80;
          const birdRight = 80 + BIRD_SIZE;
          const birdTop = birdY;
          const birdBottom = birdY + BIRD_SIZE;
          
          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;
          const topPipeBottom = pipe.topHeight;
          const bottomPipeTop = pipe.topHeight + PIPE_GAP;
          
          // Check collision
          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
              setGameOver(true);
            }
          }
          
          // Check score
          if (pipe.x + PIPE_WIDTH === 79) {
            setScore(s => {
              const newScore = s + 1;
              setHighScore(hs => Math.max(hs, newScore));
              return newScore;
            });
          }
        });
        return currentPipes;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameOver, isPaused, started]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(80, 80, 30, 0, Math.PI * 2);
    ctx.arc(110, 80, 40, 0, Math.PI * 2);
    ctx.arc(140, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(280, 120, 25, 0, Math.PI * 2);
    ctx.arc(305, 120, 35, 0, Math.PI * 2);
    ctx.arc(330, 120, 25, 0, Math.PI * 2);
    ctx.fill();

    // Draw pipes
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillStyle = '#4ADE80';
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(pipe.x + 5, pipe.topHeight - 20, PIPE_WIDTH - 10, 20);
      
      // Bottom pipe
      ctx.fillStyle = '#4ADE80';
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.topHeight - PIPE_GAP);
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(pipe.x + 5, pipe.topHeight + PIPE_GAP, PIPE_WIDTH - 10, 20);
    });

    // Draw bird
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(80 + BIRD_SIZE / 2, bird.y + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(90, bird.y + 10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(92, bird.y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.moveTo(95, bird.y + 15);
    ctx.lineTo(105, bird.y + 20);
    ctx.lineTo(95, bird.y + 25);
    ctx.fill();

    // Draw ground
    ctx.fillStyle = '#D97706';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
    ctx.fillStyle = '#92400E';
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      ctx.fillRect(i, CANVAS_HEIGHT - 20, 2, 20);
    }
  }, [bird, pipes]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">得分</div>
          <div className="text-2xl font-bold text-[#FACC15]">{score}</div>
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
          className="border-2 border-white/20 rounded-lg max-w-full cursor-pointer touch-manipulation"
          onClick={jump}
          onTouchStart={(e) => {
            e.preventDefault();
            jump();
          }}
        />
        
        {!started && !gameOver && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">🐦</div>
            <div className="text-xl font-bold text-white mb-2">点击或按空格键开始</div>
            <div className="text-white/60 text-sm">躲避管道，飞得越远越好!</div>
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

      {/* Mobile Controls */}
      <div className="md:hidden w-full max-w-xs">
        <Button 
          onClick={jump} 
          variant="outline" 
          className="w-full h-16 border-white/20 text-white text-xl"
          disabled={gameOver}
        >
          {started ? '👆 飞行' : '▶ 开始'}
        </Button>
      </div>

      <div className="flex gap-2 md:hidden">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm" disabled={!started || gameOver} className="flex-1">
          {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
          {isPaused ? '继续' : '暂停'}
        </Button>
        <Button onClick={resetGame} variant="outline" size="sm" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        点击或按空格键飞行
      </div>
    </div>
  );
}
