import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const BULLET_SIZE = 4;
const ALIEN_SIZE = 25;

export function SpaceInvadersGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerX, setPlayerX] = useState(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [bullets, setBullets] = useState<{ x: number; y: number }[]>([]);
  const [aliens, setAliens] = useState<{ x: number; y: number; alive: boolean }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [alienDirection, setAlienDirection] = useState(1);
  const keysRef = useRef({ left: false, right: false, space: false });

  const initAliens = useCallback(() => {
    const newAliens = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        newAliens.push({
          x: 50 + col * 50,
          y: 50 + row * 40,
          alive: true,
        });
      }
    }
    return newAliens;
  }, []);

  const resetGame = useCallback(() => {
    setPlayerX(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2);
    setBullets([]);
    setAliens(initAliens());
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setStarted(true);
    setAlienDirection(1);
  }, [initAliens]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
      if (e.key === ' ') {
        e.preventDefault();
        if (!started) {
          resetGame();
        } else if (!gameOver) {
          keysRef.current.space = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
      if (e.key === ' ') keysRef.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [started, gameOver, resetGame]);

  useEffect(() => {
    if (!started || gameOver || isPaused) return;

    const interval = setInterval(() => {
      // Move player
      setPlayerX(x => {
        let newX = x;
        if (keysRef.current.left) newX -= 5;
        if (keysRef.current.right) newX += 5;
        return Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, newX));
      });

      // Shoot
      if (keysRef.current.space) {
        setBullets(prev => {
          if (prev.length < 3) {
            return [...prev, { x: playerX + PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 40 }];
          }
          return prev;
        });
        keysRef.current.space = false;
      }

      // Move bullets
      setBullets(prev => prev
        .map(b => ({ ...b, y: b.y - 8 }))
        .filter(b => b.y > 0)
      );

      // Move aliens
      setAliens(prev => {
        const aliveAliens = prev.filter(a => a.alive);
        if (aliveAliens.length === 0) {
          return initAliens();
        }

        const leftmost = Math.min(...aliveAliens.map(a => a.x));
        const rightmost = Math.max(...aliveAliens.map(a => a.x));

        let newDirection = alienDirection;
        if (rightmost > CANVAS_WIDTH - ALIEN_SIZE - 10 && alienDirection > 0) {
          newDirection = -1;
          setAlienDirection(-1);
        } else if (leftmost < 10 && alienDirection < 0) {
          newDirection = 1;
          setAlienDirection(1);
        }

        return prev.map(a => ({
          ...a,
          x: a.x + newDirection * 1,
          y: (rightmost > CANVAS_WIDTH - ALIEN_SIZE - 10 || leftmost < 10) ? a.y + 10 : a.y,
        }));
      });

      // Check collisions
      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        
        setAliens(prevAliens => {
          const newAliens = [...prevAliens];
          
          remainingBullets.forEach((bullet, bIndex) => {
            newAliens.forEach((alien, aIndex) => {
              if (alien.alive &&
                  bullet.x >= alien.x && bullet.x <= alien.x + ALIEN_SIZE &&
                  bullet.y >= alien.y && bullet.y <= alien.y + ALIEN_SIZE) {
                newAliens[aIndex].alive = false;
                remainingBullets.splice(bIndex, 1);
                setScore(s => s + 10);
              }
            });
          });

          // Check if aliens reached bottom
          if (newAliens.some(a => a.alive && a.y > CANVAS_HEIGHT - 50)) {
            setGameOver(true);
          }

          return newAliens;
        });

        return remainingBullets;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [started, gameOver, isPaused, playerX, alienDirection, initAliens]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 23) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw player
    ctx.fillStyle = '#4ADE80';
    ctx.fillRect(playerX, CANVAS_HEIGHT - 30, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.fillRect(playerX + PLAYER_WIDTH / 2 - 5, CANVAS_HEIGHT - 35, 10, 5);

    // Draw bullets
    ctx.fillStyle = '#FACC15';
    bullets.forEach(b => {
      ctx.fillRect(b.x - BULLET_SIZE / 2, b.y, BULLET_SIZE, 10);
    });

    // Draw aliens
    aliens.forEach(a => {
      if (a.alive) {
        ctx.fillStyle = '#FF3A7A';
        ctx.fillRect(a.x, a.y, ALIEN_SIZE, ALIEN_SIZE);
        ctx.fillStyle = 'white';
        ctx.fillRect(a.x + 5, a.y + 8, 6, 6);
        ctx.fillRect(a.x + 14, a.y + 8, 6, 6);
      }
    });
  }, [playerX, bullets, aliens]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">得分</div>
          <div className="text-2xl font-bold text-[#FACC15]">{score}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">外星人</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">
            {aliens.filter(a => a.alive).length}
          </div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-white/20 rounded-lg max-w-full touch-manipulation"
          onTouchStart={(e) => {
            e.preventDefault();
            if (!started || gameOver) return;
            const touch = e.touches[0];
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = touch.clientX - rect.left;
            const scaleX = CANVAS_WIDTH / rect.width;
            const canvasX = x * scaleX;
            setPlayerX(Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, canvasX - PLAYER_WIDTH / 2)));
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (!started || gameOver) return;
            const touch = e.touches[0];
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = touch.clientX - rect.left;
            const scaleX = CANVAS_WIDTH / rect.width;
            const canvasX = x * scaleX;
            setPlayerX(Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, canvasX - PLAYER_WIDTH / 2)));
          }}
          onTouchEnd={() => {
            // Optional: auto shoot on touch end
            if (started && !gameOver && bullets.length < 3) {
              setBullets(prev => [...prev, { x: playerX + PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 40 }]);
            }
          }}
        />
        
        {!started && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">👾</div>
            <div className="text-xl font-bold text-white mb-2">太空侵略者</div>
            <div className="text-white/60 text-sm mb-4">按空格键开始</div>
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
      <div className="grid grid-cols-3 gap-2 md:hidden w-full max-w-xs">
        <Button 
          onMouseDown={() => { keysRef.current.left = true; }} 
          onMouseUp={() => { keysRef.current.left = false; }}
          onMouseLeave={() => { keysRef.current.left = false; }}
          onTouchStart={(e) => { e.preventDefault(); keysRef.current.left = true; }}
          onTouchEnd={() => { keysRef.current.left = false; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl"
          disabled={!started || gameOver}
        >←</Button>
        <Button 
          onTouchStart={(e) => { e.preventDefault(); if (started && !gameOver) keysRef.current.space = true; }}
          onTouchEnd={() => { keysRef.current.space = false; }}
          onClick={() => { if (started && !gameOver) keysRef.current.space = true; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-lg"
          disabled={!started || gameOver}
        >🔥</Button>
        <Button 
          onMouseDown={() => { keysRef.current.right = true; }} 
          onMouseUp={() => { keysRef.current.right = false; }}
          onMouseLeave={() => { keysRef.current.right = false; }}
          onTouchStart={(e) => { e.preventDefault(); keysRef.current.right = true; }}
          onTouchEnd={() => { keysRef.current.right = false; }}
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
        <Button onClick={resetGame} variant="outline" size="sm" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        方向键移动，空格键射击
      </div>
    </div>
  );
}
