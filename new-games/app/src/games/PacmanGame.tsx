import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CELL_SIZE = 25;
const ROWS = 15;
const COLS = 19;

const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
  [0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0],
  [1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pacman, setPacman] = useState({ x: 9, y: 7, dir: { x: 0, y: 0 } });
  const [ghosts, setGhosts] = useState([
    { x: 1, y: 1, color: '#FF3A7A' },
    { x: 17, y: 1, color: '#00D4FF' },
    { x: 1, y: 13, color: '#FACC15' },
  ]);
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  const initDots = useCallback(() => {
    const newDots = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (MAZE[y][x] === 0 && !(x === 9 && y === 7)) {
          newDots.push({ x, y });
        }
      }
    }
    return newDots;
  }, []);

  const resetGame = useCallback(() => {
    setPacman({ x: 9, y: 7, dir: { x: 0, y: 0 } });
    setGhosts([
      { x: 1, y: 1, color: '#FF3A7A' },
      { x: 17, y: 1, color: '#00D4FF' },
      { x: 1, y: 13, color: '#FACC15' },
    ]);
    setDots(initDots());
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setWon(false);
  }, [initDots]);

  useEffect(() => {
    setDots(initDots());
  }, [initDots]);

  const canMove = useCallback((x: number, y: number) => {
    return x >= 0 && x < COLS && y >= 0 && y < ROWS && MAZE[y][x] === 0;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || won) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (!isPaused) setPacman(p => ({ ...p, dir: { x: 0, y: -1 } }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isPaused) setPacman(p => ({ ...p, dir: { x: 0, y: 1 } }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (!isPaused) setPacman(p => ({ ...p, dir: { x: -1, y: 0 } }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!isPaused) setPacman(p => ({ ...p, dir: { x: 1, y: 0 } }));
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, won, isPaused]);

  useEffect(() => {
    if (gameOver || won || isPaused) return;

    const interval = setInterval(() => {
      // Move Pacman
      setPacman(p => {
        const newX = p.x + p.dir.x;
        const newY = p.y + p.dir.y;
        if (canMove(newX, newY)) {
          return { ...p, x: newX, y: newY };
        }
        return p;
      });

      // Move ghosts
      setGhosts(prevGhosts => 
        prevGhosts.map(ghost => {
          const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
          ];
          const validMoves = directions.filter(d => canMove(ghost.x + d.x, ghost.y + d.y));
          if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            return { ...ghost, x: ghost.x + move.x, y: ghost.y + move.y };
          }
          return ghost;
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, [gameOver, won, isPaused, canMove]);

  useEffect(() => {
    // Check dot collection
    const dotIndex = dots.findIndex(d => d.x === pacman.x && d.y === pacman.y);
    if (dotIndex !== -1) {
      setDots(prev => prev.filter((_, i) => i !== dotIndex));
      setScore(s => s + 10);
    }

    // Check win
    if (dots.length === 0) {
      setWon(true);
    }

    // Check ghost collision
    if (ghosts.some(g => g.x === pacman.x && g.y === pacman.y)) {
      setGameOver(true);
    }
  }, [pacman, dots, ghosts]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (MAZE[y][x] === 1) {
          ctx.fillStyle = '#3B89FF';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw dots
    ctx.fillStyle = '#FACC15';
    dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(
        dot.x * CELL_SIZE + CELL_SIZE / 2,
        dot.y * CELL_SIZE + CELL_SIZE / 2,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw Pacman
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    const pacX = pacman.x * CELL_SIZE + CELL_SIZE / 2;
    const pacY = pacman.y * CELL_SIZE + CELL_SIZE / 2;
    let startAngle = 0.2 * Math.PI;
    let endAngle = 1.8 * Math.PI;
    if (pacman.dir.x === -1) { startAngle += Math.PI; endAngle += Math.PI; }
    else if (pacman.dir.y === -1) { startAngle -= 0.5 * Math.PI; endAngle -= 0.5 * Math.PI; }
    else if (pacman.dir.y === 1) { startAngle += 0.5 * Math.PI; endAngle += 0.5 * Math.PI; }
    ctx.arc(pacX, pacY, CELL_SIZE / 2 - 2, startAngle, endAngle);
    ctx.lineTo(pacX, pacY);
    ctx.fill();

    // Draw ghosts
    ghosts.forEach(ghost => {
      ctx.fillStyle = ghost.color;
      const gx = ghost.x * CELL_SIZE + 2;
      const gy = ghost.y * CELL_SIZE + 2;
      const size = CELL_SIZE - 4;
      ctx.fillRect(gx, gy, size, size);
      
      // Eyes
      ctx.fillStyle = 'white';
      ctx.fillRect(gx + 4, gy + 4, 5, 5);
      ctx.fillRect(gx + size - 9, gy + 4, 5, 5);
      ctx.fillStyle = 'black';
      ctx.fillRect(gx + 5, gy + 5, 3, 3);
      ctx.fillRect(gx + size - 8, gy + 5, 3, 3);
    });
  }, [pacman, ghosts, dots]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm">得分</div>
        <div className="text-2xl font-bold text-[#FACC15]">{score}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={COLS * CELL_SIZE}
          height={ROWS * CELL_SIZE}
          className="border-2 border-white/20 rounded-lg"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">👻</div>
            <div className="text-2xl font-bold text-white mb-2">被抓住了!</div>
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

      <div className="flex gap-2">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm">
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        方向键移动，吃掉所有豆子获胜
      </div>
    </div>
  );
}
