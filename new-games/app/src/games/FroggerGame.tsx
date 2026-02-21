import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const FROG_SIZE = 25;

interface Car {
  x: number;
  y: number;
  width: number;
  speed: number;
  color: string;
}

interface Log {
  x: number;
  y: number;
  width: number;
  speed: number;
}

export function FroggerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frogRef = useRef({ x: CANVAS_WIDTH / 2 - FROG_SIZE / 2, y: CANVAS_HEIGHT - FROG_SIZE - 10 });
  const carsRef = useRef<Car[]>([]);
  const logsRef = useRef<Log[]>([]);
  const [frog, setFrog] = useState({ x: CANVAS_WIDTH / 2 - FROG_SIZE / 2, y: CANVAS_HEIGHT - FROG_SIZE - 10 });
  const [cars, setCars] = useState<Car[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const newCars: Car[] = [];
    const carColors = ['#FF3A7A', '#A42EFF', '#3B89FF', '#FACC15'];
    
    // Road lanes (y: 350-450)
    for (let lane = 0; lane < 3; lane++) {
      for (let i = 0; i < 2; i++) {
        newCars.push({
          x: i * 200 + Math.random() * 100,
          y: 350 + lane * 40,
          width: 40,
          speed: (lane % 2 === 0 ? 2 : -2) * (1 + lane * 0.3),
          color: carColors[lane % carColors.length],
        });
      }
    }

    const newLogs: Log[] = [];
    // River lanes (y: 150-300)
    for (let lane = 0; lane < 3; lane++) {
      for (let i = 0; i < 2; i++) {
        newLogs.push({
          x: i * 150 + Math.random() * 50,
          y: 150 + lane * 50,
          width: 80,
          speed: (lane % 2 === 0 ? 1.5 : -1.5),
        });
      }
    }

    carsRef.current = newCars;
    logsRef.current = newLogs;
    setCars(newCars);
    setLogs(newLogs);
  }, []);

  const resetGame = useCallback(() => {
    const initialFrog = { x: CANVAS_WIDTH / 2 - FROG_SIZE / 2, y: CANVAS_HEIGHT - FROG_SIZE - 10 };
    frogRef.current = initialFrog;
    setFrog(initialFrog);
    initGame();
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setStarted(true);
    setWon(false);
  }, [initGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started || gameOver || won || isPaused) return;
      
      const step = 40;
      const f = frogRef.current;
      let newX = f.x;
      let newY = f.y;
      let scoreDelta = 0;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newY = Math.max(0, f.y - step);
          scoreDelta = 10;
          break;
        case 'ArrowDown':
          e.preventDefault();
          newY = Math.min(CANVAS_HEIGHT - FROG_SIZE, f.y + step);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newX = Math.max(0, f.x - step);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newX = Math.min(CANVAS_WIDTH - FROG_SIZE, f.x + step);
          break;
      }
      
      const newFrog = { x: newX, y: newY };
      frogRef.current = newFrog;
      setFrog(newFrog);
      if (scoreDelta) setScore(s => s + scoreDelta);

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, gameOver, won, isPaused]);

  useEffect(() => {
    if (!started || gameOver || won || isPaused) return;

    const interval = setInterval(() => {
      // Move cars
      carsRef.current = carsRef.current.map(car => ({
        ...car,
        x: (car.x + car.speed + CANVAS_WIDTH + 100) % (CANVAS_WIDTH + 100) - 50,
      }));

      // Move logs
      logsRef.current = logsRef.current.map(log => ({
        ...log,
        x: (log.x + log.speed + CANVAS_WIDTH + 150) % (CANVAS_WIDTH + 150) - 75,
      }));

      // Update state for rendering
      setCars(carsRef.current);
      setLogs(logsRef.current);

      const currentFrog = frogRef.current;

      // Check car collision
      carsRef.current.forEach(car => {
        if (currentFrog.x < car.x + car.width &&
            currentFrog.x + FROG_SIZE > car.x &&
            currentFrog.y < car.y + 30 &&
            currentFrog.y + FROG_SIZE > car.y) {
          setGameOver(true);
        }
      });

      // Check river (must be on log)
      if (currentFrog.y >= 150 && currentFrog.y <= 300) {
        const onLog = logsRef.current.some(log =>
          currentFrog.x >= log.x &&
          currentFrog.x + FROG_SIZE <= log.x + log.width &&
          currentFrog.y >= log.y - 10 &&
          currentFrog.y <= log.y + 30
        );
        if (!onLog) {
          setGameOver(true);
        }
      }

      // Check win
      if (currentFrog.y < 50) {
        setWon(true);
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [started, gameOver, won, isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw safe zones
    ctx.fillStyle = '#4ADE80';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 50);
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);

    // Draw river
    ctx.fillStyle = '#3B89FF';
    ctx.fillRect(0, 150, CANVAS_WIDTH, 150);

    // Draw road
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 350, CANVAS_WIDTH, 100);
    
    // Road lines
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 390 + i * 40);
      ctx.lineTo(CANVAS_WIDTH, 390 + i * 40);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw logs
    ctx.fillStyle = '#8B4513';
    logs.forEach(log => {
      ctx.fillRect(log.x, log.y, log.width, 25);
    });

    // Draw cars
    cars.forEach(car => {
      ctx.fillStyle = car.color;
      ctx.fillRect(car.x, car.y, car.width, 25);
      ctx.fillStyle = 'white';
      ctx.fillRect(car.x + 5, car.y + 5, 8, 8);
      ctx.fillRect(car.x + car.width - 13, car.y + 5, 8, 8);
    });

    // Draw frog
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(frog.x, frog.y, FROG_SIZE, FROG_SIZE);
    ctx.fillStyle = 'white';
    ctx.fillRect(frog.x + 5, frog.y + 5, 6, 6);
    ctx.fillRect(frog.x + 14, frog.y + 5, 6, 6);
    ctx.fillStyle = 'black';
    ctx.fillRect(frog.x + 7, frog.y + 7, 2, 2);
    ctx.fillRect(frog.x + 16, frog.y + 7, 2, 2);
  }, [frog, cars, logs]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm">得分</div>
        <div className="text-2xl font-bold text-[#4ADE80]">{score}</div>
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
            <div className="text-4xl mb-2">🐸</div>
            <div className="text-xl font-bold text-white mb-2">青蛙过河</div>
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

        {isPaused && !gameOver && !won && started && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
            <div className="text-2xl font-bold text-white">暂停</div>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <Button 
          onClick={() => { 
            if (!started || gameOver || won || isPaused) return;
            const step = 40;
            const newFrog = { ...frogRef.current, y: Math.max(0, frogRef.current.y - step) };
            frogRef.current = newFrog;
            setFrog(newFrog);
            setScore(s => s + 10);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!started || gameOver || won || isPaused) return;
            const step = 40;
            const newFrog = { ...frogRef.current, y: Math.max(0, frogRef.current.y - step) };
            frogRef.current = newFrog;
            setFrog(newFrog);
            setScore(s => s + 10);
          }}
          variant="outline" 
          className="border-white/20 text-white h-14 text-2xl"
          disabled={!started || gameOver || won}
        >↑</Button>
        <div />
        <Button 
          onClick={() => { 
            if (!started || gameOver || won || isPaused) return;
            const step = 40;
            const newFrog = { ...frogRef.current, x: Math.max(0, frogRef.current.x - step) };
            frogRef.current = newFrog;
            setFrog(newFrog);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!started || gameOver || won || isPaused) return;
            const step = 40;
            const newFrog = { ...frogRef.current, x: Math.max(0, frogRef.current.x - step) };
            frogRef.current = newFrog;
            setFrog(newFrog);
          }}
          variant="outline" 
          className="border-white/20 text-white h-14 text-2xl"
          disabled={!started || gameOver || won}
        >←</Button>
        <Button 
          onClick={() => { if (started && !gameOver && !won) setIsPaused(p => !p); }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (started && !gameOver && !won) setIsPaused(p => !p);
          }}
          variant="outline" 
          className="border-white/20 text-white h-14"
          disabled={!started || gameOver || won}
        >{isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}</Button>
        <Button 
          onClick={() => { 
            if (!started || gameOver || won || isPaused) return;
            const step = 40;
            const newFrog = { ...frogRef.current, x: Math.min(CANVAS_WIDTH - FROG_SIZE, frogRef.current.x + step) };
            frogRef.current = newFrog;
            setFrog(newFrog);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!started || gameOver || won || isPaused) return;
            const step = 40;
            const newFrog = { ...frogRef.current, x: Math.min(CANVAS_WIDTH - FROG_SIZE, frogRef.current.x + step) };
            frogRef.current = newFrog;
            setFrog(newFrog);
          }}
          variant="outline" 
          className="border-white/20 text-white h-14 text-2xl"
          disabled={!started || gameOver || won}
        >→</Button>
        <div />
        <Button 
          onClick={() => { 
            if (!started || gameOver || won || isPaused) return;
            const step = 40;
            const newFrog = { ...frogRef.current, y: Math.min(CANVAS_HEIGHT - FROG_SIZE, frogRef.current.y + step) };
            frogRef.current = newFrog;
            setFrog(newFrog);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!started || gameOver || won || isPaused) return;
            const step = 40;
            const newFrog = { ...frogRef.current, y: Math.min(CANVAS_HEIGHT - FROG_SIZE, frogRef.current.y + step) };
            frogRef.current = newFrog;
            setFrog(newFrog);
          }}
          variant="outline" 
          className="border-white/20 text-white h-14 text-2xl"
          disabled={!started || gameOver || won}
        >↓</Button>
        <div />
      </div>

      <div className="flex gap-2 md:hidden">
        <Button onClick={resetGame} variant="outline" size="sm" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        方向键移动，到达顶部获胜
      </div>
    </div>
  );
}
