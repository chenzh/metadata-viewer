import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const BUBBLE_RADIUS = 20;
const ROWS = 10;
const COLS = 10;

const COLORS = ['#FF3A7A', '#A42EFF', '#3B89FF', '#00D4FF', '#4ADE80', '#FACC15'];

export function BubbleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bubbles, setBubbles] = useState<{ color: number; x: number; y: number }[][]>([]);
  const [currentBubble, setCurrentBubble] = useState<{ color: number; angle: number }>({ color: 0, angle: -Math.PI / 2 });
  const [nextBubble, setNextBubble] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const projectileRef = useRef<{ x: number; y: number; vx: number; vy: number; active: boolean } | null>(null);

  const initGame = useCallback(() => {
    const newBubbles: { color: number; x: number; y: number }[][] = [];
    for (let row = 0; row < 5; row++) {
      newBubbles[row] = [];
      for (let col = 0; col < COLS; col++) {
        newBubbles[row][col] = {
          color: Math.floor(Math.random() * COLORS.length),
          x: col * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS + (row % 2) * BUBBLE_RADIUS,
          y: row * BUBBLE_RADIUS * 1.7 + BUBBLE_RADIUS,
        };
      }
    }
    setBubbles(newBubbles);
    setCurrentBubble({ color: Math.floor(Math.random() * COLORS.length), angle: -Math.PI / 2 });
    setNextBubble(Math.floor(Math.random() * COLORS.length));
    setScore(0);
    setGameOver(false);
    setStarted(true);
    projectileRef.current = null;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started || gameOver || isPaused) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentBubble(b => ({ ...b, angle: Math.max(-Math.PI + 0.2, b.angle - 0.1) }));
      } else if (e.key === 'ArrowRight') {
        setCurrentBubble(b => ({ ...b, angle: Math.min(-0.2, b.angle + 0.1) }));
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!projectileRef.current) {
          projectileRef.current = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT - 40,
            vx: Math.cos(currentBubble.angle) * 8,
            vy: Math.sin(currentBubble.angle) * 8,
            active: true,
          };
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, gameOver, isPaused, currentBubble.angle]);

  useEffect(() => {
    if (!started || gameOver || isPaused) return;

    const interval = setInterval(() => {
      if (projectileRef.current?.active) {
        const proj = projectileRef.current;
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Wall bounce
        if (proj.x <= BUBBLE_RADIUS || proj.x >= CANVAS_WIDTH - BUBBLE_RADIUS) {
          proj.vx = -proj.vx;
          proj.x = Math.max(BUBBLE_RADIUS, Math.min(CANVAS_WIDTH - BUBBLE_RADIUS, proj.x));
        }

        // Check collision with bubbles
        let hit = false;
        setBubbles(currentBubbles => {
          const newBubbles = currentBubbles.map(row => [...row]);
          
          for (let row = 0; row < newBubbles.length; row++) {
            for (let col = 0; col < newBubbles[row].length; col++) {
              const bubble = newBubbles[row][col];
              if (!bubble) continue;
              
              const dx = proj.x - bubble.x;
              const dy = proj.y - bubble.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < BUBBLE_RADIUS * 2) {
                hit = true;
                // Snap to grid
                const newRow = Math.round((proj.y - BUBBLE_RADIUS) / (BUBBLE_RADIUS * 1.7));
                const newCol = Math.round((proj.x - BUBBLE_RADIUS - (newRow % 2) * BUBBLE_RADIUS) / (BUBBLE_RADIUS * 2));
                
                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                  if (!newBubbles[newRow]) newBubbles[newRow] = [];
                  newBubbles[newRow][newCol] = {
                    color: currentBubble.color,
                    x: newCol * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS + (newRow % 2) * BUBBLE_RADIUS,
                    y: newRow * BUBBLE_RADIUS * 1.7 + BUBBLE_RADIUS,
                  };

                  // Check matches
                  const matches = findMatches(newBubbles, newRow, newCol, currentBubble.color);
                  if (matches.length >= 3) {
                    matches.forEach(m => {
                      newBubbles[m.row][m.col] = null as any;
                    });
                    setScore(s => s + matches.length * 10);
                  }
                }
                break;
              }
            }
            if (hit) break;
          }

          // Check game over
          if (newBubbles.length > 0 && newBubbles[newBubbles.length - 1].some(b => b)) {
            const lastRow = newBubbles[newBubbles.length - 1];
            if (lastRow.some(b => b && b.y > CANVAS_HEIGHT - 100)) {
              setGameOver(true);
            }
          }

          return newBubbles;
        });

        if (hit || proj.y < BUBBLE_RADIUS) {
          projectileRef.current = null;
          setCurrentBubble({ color: nextBubble, angle: -Math.PI / 2 });
          setNextBubble(Math.floor(Math.random() * COLORS.length));
        }
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [started, gameOver, isPaused, currentBubble.color, nextBubble]);

  const findMatches = (grid: any[][], row: number, col: number, color: number) => {
    const matches: { row: number; col: number }[] = [];
    const visited = new Set<string>();
    const queue = [{ row, col }];
    
    while (queue.length > 0) {
      const { row: r, col: c } = queue.shift()!;
      const key = `${r},${c}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (grid[r]?.[c]?.color === color) {
        matches.push({ row: r, col: c });
        
        const neighbors = [
          { r: r - 1, c },
          { r: r + 1, c },
          { r, c: c - 1 },
          { r, c: c + 1 },
        ];
        
        neighbors.forEach(n => {
          if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS) {
            queue.push({ row: n.r, col: n.c });
          }
        });
      }
    }
    
    return matches;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bubbles
    bubbles.forEach(row => {
      row.forEach(bubble => {
        if (bubble) {
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS - 2, 0, Math.PI * 2);
          ctx.fillStyle = COLORS[bubble.color];
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.stroke();
        }
      });
    });

    // Draw current bubble
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, BUBBLE_RADIUS - 2, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[currentBubble.color];
    ctx.fill();

    // Draw aim line
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
    ctx.lineTo(
      CANVAS_WIDTH / 2 + Math.cos(currentBubble.angle) * 50,
      CANVAS_HEIGHT - 40 + Math.sin(currentBubble.angle) * 50
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();

    // Draw projectile
    if (projectileRef.current?.active) {
      ctx.beginPath();
      ctx.arc(projectileRef.current.x, projectileRef.current.y, BUBBLE_RADIUS - 2, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[currentBubble.color];
      ctx.fill();
    }

    // Draw next bubble
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.fillText('Next:', 10, CANVAS_HEIGHT - 20);
    ctx.beginPath();
    ctx.arc(50, CANVAS_HEIGHT - 25, 15, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[nextBubble];
    ctx.fill();
  }, [bubbles, currentBubble, nextBubble]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm">得分</div>
        <div className="text-2xl font-bold text-[#3B89FF]">{score}</div>
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
            <div className="text-4xl mb-2">🫧</div>
            <div className="text-xl font-bold text-white mb-2">泡泡龙</div>
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

      <div className="flex gap-2">
        {started && (
          <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm">
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        )}
        {started && (
          <Button onClick={initGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="text-white/40 text-sm text-center">
        方向键瞄准，空格键射击，三个相同颜色消除
      </div>
    </div>
  );
}
