import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function AsteroidsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ship, setShip] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, angle: 0 });
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const keysRef = useRef({ left: false, right: false, up: false, space: false });

  const initAsteroids = useCallback(() => {
    const newAsteroids: Asteroid[] = [];
    for (let i = 0; i < 5; i++) {
      newAsteroids.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 30,
      });
    }
    return newAsteroids;
  }, []);

  const resetGame = useCallback(() => {
    setShip({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, angle: 0 });
    setAsteroids(initAsteroids());
    setBullets([]);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setStarted(true);
  }, [initAsteroids]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
      if (e.key === 'ArrowUp') keysRef.current.up = true;
      if (e.key === ' ') {
        e.preventDefault();
        if (!started) {
          resetGame();
        } else {
          keysRef.current.space = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
      if (e.key === 'ArrowUp') keysRef.current.up = false;
      if (e.key === ' ') keysRef.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [started, resetGame]);

  useEffect(() => {
    if (!started || gameOver || isPaused) return;

    const interval = setInterval(() => {
      // Rotate ship
      setShip(s => ({
        ...s,
        angle: s.angle + (keysRef.current.left ? -0.1 : keysRef.current.right ? 0.1 : 0),
      }));

      // Shoot
      if (keysRef.current.space) {
        setBullets(prev => {
          if (prev.length < 5) {
            return [...prev, {
              x: ship.x + Math.cos(ship.angle) * 15,
              y: ship.y + Math.sin(ship.angle) * 15,
              vx: Math.cos(ship.angle) * 6,
              vy: Math.sin(ship.angle) * 6,
            }];
          }
          return prev;
        });
        keysRef.current.space = false;
      }

      // Move bullets
      setBullets(prev => prev
        .map(b => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
        .filter(b => b.x > 0 && b.x < CANVAS_WIDTH && b.y > 0 && b.y < CANVAS_HEIGHT)
      );

      // Move asteroids
      setAsteroids(prev => prev.map(a => ({
        ...a,
        x: (a.x + a.vx + CANVAS_WIDTH) % CANVAS_WIDTH,
        y: (a.y + a.vy + CANVAS_HEIGHT) % CANVAS_HEIGHT,
      })));

      // Check bullet-asteroid collisions
      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        
        setAsteroids(prevAsteroids => {
          const newAsteroids: Asteroid[] = [];
          
          prevAsteroids.forEach(asteroid => {
            let hit = false;
            remainingBullets.forEach((bullet, bIndex) => {
              const dx = bullet.x - asteroid.x;
              const dy = bullet.y - asteroid.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < asteroid.size && !hit) {
                hit = true;
                remainingBullets.splice(bIndex, 1);
                setScore(s => s + 10);
                
                // Split asteroid
                if (asteroid.size > 15) {
                  newAsteroids.push(
                    { ...asteroid, size: asteroid.size / 2, vx: -asteroid.vx, vy: asteroid.vy },
                    { ...asteroid, size: asteroid.size / 2, vx: asteroid.vx, vy: -asteroid.vy }
                  );
                }
              }
            });
            
            if (!hit) {
              newAsteroids.push(asteroid);
            }
          });

          // Spawn new asteroid if all destroyed
          if (newAsteroids.length === 0) {
            for (let i = 0; i < 5; i++) {
              newAsteroids.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 30,
              });
            }
          }

          return newAsteroids;
        });

        return remainingBullets;
      });

      // Check ship-asteroid collision
      asteroids.forEach(a => {
        const dx = ship.x - a.x;
        const dy = ship.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < a.size + 10) {
          setGameOver(true);
        }
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [started, gameOver, isPaused, ship, asteroids]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ship
    ctx.strokeStyle = '#4ADE80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      ship.x + Math.cos(ship.angle) * 15,
      ship.y + Math.sin(ship.angle) * 15
    );
    ctx.lineTo(
      ship.x + Math.cos(ship.angle + 2.5) * 10,
      ship.y + Math.sin(ship.angle + 2.5) * 10
    );
    ctx.lineTo(
      ship.x + Math.cos(ship.angle - 2.5) * 10,
      ship.y + Math.sin(ship.angle - 2.5) * 10
    );
    ctx.closePath();
    ctx.stroke();

    // Draw bullets
    ctx.fillStyle = '#FACC15';
    bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw asteroids
    asteroids.forEach(a => {
      ctx.strokeStyle = '#A0A0A0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, [ship, bullets, asteroids]);

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
        
        {!started && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">☄️</div>
            <div className="text-xl font-bold text-white mb-2">小行星</div>
            <div className="text-white/60 text-sm mb-4">按空格键开始</div>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">💥</div>
            <div className="text-2xl font-bold text-white mb-2">飞船被毁</div>
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
          onTouchStart={() => { keysRef.current.left = true; }}
          onTouchEnd={() => { keysRef.current.left = false; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl"
          disabled={!started || gameOver}
        >↺</Button>
        <Button 
          onMouseDown={() => { keysRef.current.up = true; }} 
          onMouseUp={() => { keysRef.current.up = false; }}
          onMouseLeave={() => { keysRef.current.up = false; }}
          onTouchStart={() => { keysRef.current.up = true; }}
          onTouchEnd={() => { keysRef.current.up = false; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl"
          disabled={!started || gameOver}
        >↑</Button>
        <Button 
          onMouseDown={() => { keysRef.current.right = true; }} 
          onMouseUp={() => { keysRef.current.right = false; }}
          onMouseLeave={() => { keysRef.current.right = false; }}
          onTouchStart={() => { keysRef.current.right = true; }}
          onTouchEnd={() => { keysRef.current.right = false; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-2xl"
          disabled={!started || gameOver}
        >↻</Button>
        <div />
        <Button 
          onClick={() => { if (started && !gameOver) keysRef.current.space = true; }}
          variant="outline" 
          className="h-16 border-white/20 text-white text-lg"
          disabled={!started || gameOver}
        >🔥</Button>
        <div />
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
        方向键旋转，上键前进，空格射击
      </div>
    </div>
  );
}
